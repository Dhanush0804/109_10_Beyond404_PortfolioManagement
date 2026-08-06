package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.AlgoRunRequest;
import com.Beyond404.Portfolio.app.model.AlgoRunResponse;
import com.Beyond404.Portfolio.app.model.AlgoSignal;
import com.Beyond404.Portfolio.app.model.ChartDataPoint;
import com.Beyond404.Portfolio.app.model.ChartDataResponse;
import com.Beyond404.Portfolio.app.model.Customer;
import com.Beyond404.Portfolio.app.model.StockwiseAnalytics;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AlgoTradingService {

    private final MarketDataService marketDataService;
    private final StockWiseAnalyticsService stockWiseAnalyticsService;
    private final CustomerService customerService;

    public AlgoTradingService(
            MarketDataService marketDataService,
            StockWiseAnalyticsService stockWiseAnalyticsService,
            CustomerService customerService
    ) {
        this.marketDataService = marketDataService;
        this.stockWiseAnalyticsService = stockWiseAnalyticsService;
        this.customerService = customerService;
    }

    public AlgoRunResponse runOnce(AlgoRunRequest request) {
        validateRequest(request);

        String riskLevel = resolveRiskLevel(request.getCustomerId());
        List<String> tickers = resolveTickers(request);

        List<AlgoSignal> signals = new ArrayList<>();
        for (String ticker : tickers) {
            signals.add(buildSignalForTicker(ticker, riskLevel));
        }

        signals = signals.stream()
                .sorted(Comparator.comparingDouble(AlgoSignal::getScore).reversed())
                .collect(Collectors.toList());

        AlgoRunResponse response = new AlgoRunResponse();
        response.setCustomerId(request.getCustomerId());
        response.setStrategyName(
                request.getStrategyName() == null || request.getStrategyName().isBlank()
                        ? "MOMENTUM_SMA"
                        : request.getStrategyName().trim()
        );
        response.setDryRun(request.getDryRun() == null || request.getDryRun());
        response.setRiskLevel(riskLevel);
        response.setSignals(signals);
        response.setDisclaimer("Paper-trading educational signal. Not financial advice.");

        return response;
    }

    private void validateRequest(AlgoRunRequest request) {
        if (request == null || request.getCustomerId() == null) {
            throw new IllegalArgumentException("customerId is required");
        }
    }

    private String resolveRiskLevel(Long customerId) {
        int id = Math.toIntExact(customerId);
        Customer customer = customerService.getCustomerById(id);
        if (customer == null || customer.getRiskLevel() == null || customer.getRiskLevel().isBlank()) {
            return "MEDIUM";
        }
        return customer.getRiskLevel().trim().toUpperCase(Locale.ROOT);
    }

    private List<String> resolveTickers(AlgoRunRequest request) {
        Set<String> unique = new LinkedHashSet<>();

        if (request.getTickers() != null) {
            for (String ticker : request.getTickers()) {
                if (ticker != null && !ticker.isBlank()) {
                    unique.add(ticker.trim().toUpperCase(Locale.ROOT));
                }
            }
        }

        if (!unique.isEmpty()) {
            return new ArrayList<>(unique);
        }

        List<StockwiseAnalytics> holdings = stockWiseAnalyticsService.getStockWiseAnalytics(request.getCustomerId());
        for (StockwiseAnalytics row : holdings) {
            if (row.getTicker() != null && !row.getTicker().isBlank()) {
                unique.add(row.getTicker().trim().toUpperCase(Locale.ROOT));
            }
        }

        if (unique.isEmpty()) {
            throw new IllegalArgumentException("No tickers provided and no holdings found for customer");
        }

        return new ArrayList<>(unique);
    }

    private AlgoSignal buildSignalForTicker(String ticker, String riskLevel) {
        try {
            ChartDataResponse chart = marketDataService.getChartData(ticker, "1M");
            List<ChartDataPoint> points = chart.getRanges() == null ? null : chart.getRanges().get("1M");

            if (points == null || points.size() < 20) {
                return new AlgoSignal(ticker, "HOLD", 45.0, 0.45, safePrice(chart),
                        "Not enough history for signal calculation");
            }

            List<Double> closes = points.stream()
                    .map(ChartDataPoint::getPrice)
                    .filter(p -> p != null && p > 0)
                    .collect(Collectors.toList());

            if (closes.size() < 20) {
                return new AlgoSignal(ticker, "HOLD", 45.0, 0.45, safePrice(chart),
                        "Insufficient valid close prices");
            }

            double sma5 = sma(closes, 5);
            double sma20 = sma(closes, 20);
            double momentumPct = percent(sma5, sma20);
            double volatilityPct = volatilityPercent(closes);

            double score = score(momentumPct, volatilityPct, riskLevel);
            String action = actionFor(score, riskLevel);
            double confidence = clamp(score / 100.0, 0.35, 0.95);

            String reason = "sma5=" + round2(sma5)
                    + ", sma20=" + round2(sma20)
                    + ", momentum%=" + round2(momentumPct)
                    + ", volatility%=" + round2(volatilityPct);

            return new AlgoSignal(
                    ticker,
                    action,
                    round2(score),
                    round2(confidence),
                    safePrice(chart),
                    reason
            );

        } catch (Exception ex) {
            return new AlgoSignal(ticker, "HOLD", 40.0, 0.40, 0.0, "Data unavailable: " + ex.getMessage());
        }
    }

    private double score(double momentumPct, double volatilityPct, String riskLevel) {
        double base = 50.0 + (1.8 * momentumPct) - (1.1 * volatilityPct);

        double riskAdjustment = switch (riskLevel) {
            case "LOW" -> volatilityPct > 3.0 ? -8.0 : 3.0;
            case "HIGH" -> volatilityPct > 3.0 ? 4.0 : 1.0;
            default -> volatilityPct > 4.0 ? -3.0 : 2.0;
        };

        return clamp(base + riskAdjustment, 0.0, 100.0);
    }

    private String actionFor(double score, String riskLevel) {
        double buyThreshold = "LOW".equals(riskLevel) ? 68.0 : 62.0;
        double sellThreshold = "HIGH".equals(riskLevel) ? 42.0 : 45.0;

        if (score >= buyThreshold) {
            return "BUY";
        }
        if (score <= sellThreshold) {
            return "SELL";
        }
        return "HOLD";
    }

    private double sma(List<Double> values, int period) {
        int fromIndex = values.size() - period;
        double sum = 0.0;
        for (int i = fromIndex; i < values.size(); i++) {
            sum += values.get(i);
        }
        return sum / period;
    }

    private double percent(double a, double b) {
        if (b == 0.0) {
            return 0.0;
        }
        return ((a - b) / b) * 100.0;
    }

    private double volatilityPercent(List<Double> closes) {
        double mean = closes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        if (mean == 0.0) {
            return 0.0;
        }

        double variance = 0.0;
        for (double close : closes) {
            double diff = close - mean;
            variance += diff * diff;
        }
        variance = variance / closes.size();

        double std = Math.sqrt(variance);
        return (std / mean) * 100.0;
    }

    private double safePrice(ChartDataResponse chart) {
        return chart != null && chart.getCurrentPrice() != null ? chart.getCurrentPrice() : 0.0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}