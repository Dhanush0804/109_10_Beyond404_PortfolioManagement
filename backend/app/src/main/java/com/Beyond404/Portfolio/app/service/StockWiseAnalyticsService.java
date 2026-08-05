package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.model.StockwiseAnalytics;
import com.Beyond404.Portfolio.app.recommendation.PortfolioAnalyzer;
import com.Beyond404.Portfolio.app.repository.StockWiseAnalyticsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class StockWiseAnalyticsService {

    @Value("${market.data.base-url:http://localhost:8000}")
    private String marketDataBaseUrl;

    private final StockWiseAnalyticsRepository stockWiseAnalyticsRepository;
    private final PortfolioAnalyzer portfolioAnalyzer;
    private final RestTemplate restTemplate;

    public StockWiseAnalyticsService(
            StockWiseAnalyticsRepository stockWiseAnalyticsRepository,
            PortfolioAnalyzer portfolioAnalyzer,
            RestTemplate restTemplate) {

        this.stockWiseAnalyticsRepository = stockWiseAnalyticsRepository;
        this.portfolioAnalyzer = portfolioAnalyzer;
        this.restTemplate = restTemplate;
    }

    public ArrayList<StockwiseAnalytics> getStockWiseAnalytics(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                stockWiseAnalyticsRepository.getCustomerPortfolio(customerId);

        ArrayList<StockwiseAnalytics> output = new ArrayList<>();

        if (portfolio.isEmpty()) {
            return output;
        }

        Map<String, Double> holdings =
                portfolioAnalyzer.getStockHoldings(portfolio);

        Map<String, Double> investedByTicker =
                portfolioAnalyzer.getNetInvestedByStock(portfolio);

        Map<String, PortfolioData> stockMeta = new HashMap<>();
        for (PortfolioData row : portfolio) {
            stockMeta.putIfAbsent(row.getTicker(), row);
        }

        for (Map.Entry<String, Double> entry : holdings.entrySet()) {

            String ticker = entry.getKey();
            double netQty = entry.getValue();

            if (netQty <= 0) {
                continue;
            }

            PortfolioData meta = stockMeta.get(ticker);
            if (meta == null) {
                continue;
            }

            double invested = investedByTicker.getOrDefault(ticker, 0.0);

            double lastPrice = 0.0;
            double prevPrice = 0.0;
            String marketCap = "";
            String volume = "";

            try {
                Map<String, Object> quote = fetchQuoteMap(ticker);

                lastPrice = asDouble(quote.get("price"));
                prevPrice = asDouble(quote.get("previous_close"));
                volume = formatLargeNumber(quote.get("volume"));

                // marketCap is not returned by your current market-data-server quote API
                marketCap = "";
            } catch (Exception e) {
                System.out.println("Quote unavailable for " + ticker + ": " + e.getMessage());
            }

            double currentValue = netQty * lastPrice;
            double pnl = currentValue - invested;
            double pnlPercent = invested == 0 ? 0.0 : (pnl / invested) * 100.0;

            StockwiseAnalytics item = new StockwiseAnalytics();
            item.setStockId(meta.getStockId());
            item.setTicker(meta.getTicker());
            item.setCompanyName(meta.getStockName());

            item.setInvested((int) Math.round(invested));
            item.setCurrentValue((int) Math.round(currentValue));
            item.setPnl((int) Math.round(pnl));
            item.setPnlPercent(round2(pnlPercent));

            item.setLastPrice(round2(lastPrice));
            item.setPrevPrice(round2(prevPrice));
            item.setMarketCap(marketCap);
            item.setVolume(volume);

            output.add(item);
        }

        return output;
    }

    private Map<String, Object> fetchQuoteMap(String ticker) {
        String url = UriComponentsBuilder
                .fromUriString(marketDataBaseUrl + "/api/v1/market/quote")
                .queryParam("symbol", ticker)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        return response != null ? response : new HashMap<>();
    }

    private double asDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private String formatLargeNumber(Object value) {
        if (value == null) {
            return "";
        }

        double number = asDouble(value);

        if (number >= 1_000_000_000_000.0) {
            return round1(number / 1_000_000_000_000.0) + "T";
        }
        if (number >= 1_000_000_000.0) {
            return round1(number / 1_000_000_000.0) + "B";
        }
        if (number >= 1_000_000.0) {
            return round1(number / 1_000_000.0) + "M";
        }
        if (number >= 1_000.0) {
            return round1(number / 1_000.0) + "K";
        }

        return String.valueOf((long) number);
    }

    private String round1(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .toPlainString();
    }

    private BigDecimal round2(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP);
    }
}