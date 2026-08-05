package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.ChartDataPoint;
import com.Beyond404.Portfolio.app.model.ChartDataResponse;
import com.Beyond404.Portfolio.app.model.FastApiCandleData;
import com.Beyond404.Portfolio.app.model.FastApiMarketHistoryResponse;
import com.Beyond404.Portfolio.app.model.FastApiQuoteResponse;
import com.Beyond404.Portfolio.app.model.MarketSearchResponse;

import com.Beyond404.Portfolio.app.model.MarketQuote;

import com.Beyond404.Portfolio.app.model.MarketSearchResult;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class MarketDataService {

    private static final Set<String> SUPPORTED_RANGES = Set.of("1D", "1W", "1M", "1Y");

    @Value("${market.data.base-url:http://localhost:8000}")
    private String marketDataBaseUrl;


    @Value("${currency.api.base-url:https://api.frankfurter.app}")
    private String currencyApiBaseUrl;


    private final RestTemplate restTemplate;


    public MarketDataService(RestTemplate restTemplate){

        this.restTemplate = restTemplate;

    }




    /**
     * Search stock ticker/company symbols
     *
     * API:
     * GET /api/v1/market/search
     */
    public MarketSearchResponse searchSymbols(
            String companyName) {


        String url = UriComponentsBuilder
                .fromUriString(
                        marketDataBaseUrl
                                + "/api/v1/market/search"
                )
                .queryParam(
                        "query",
                        companyName
                )
                .toUriString();


        return restTemplate.getForObject(
                url,
                MarketSearchResponse.class
        );
    }






    /**
     * Get latest stock price and quote details
     *
     * API:
     * GET /api/v1/market/quote
     */
    public MarketQuote getQuote(
            String ticker,
            String market) {


        String url = UriComponentsBuilder
                .fromUriString(
                        marketDataBaseUrl
                                + "/api/v1/market/quote"
                )
                .queryParam(
                        "symbol",
                        ticker
                )
                .toUriString();


        return restTemplate.getForObject(
                url,
                MarketQuote.class
        );
    }







    /**
     * Convert foreign currency amount to INR
     *
     * Example:
     *
     * 100 USD -> INR
     */
    public double convertToINR(
            double amount,
            String currency) {


        if(currency == null ||
                currency.equalsIgnoreCase("INR")) {

            return amount;
        }


        try {


            String url = UriComponentsBuilder
                    .fromUriString(
                            currencyApiBaseUrl
                                    + "/latest"
                    )
                    .queryParam(
                            "from",
                            currency
                    )
                    .queryParam(
                            "to",
                            "INR"
                    )
                    .toUriString();



            Map response =
                    restTemplate.getForObject(
                            url,
                            Map.class
                    );


            Map rates =
                    (Map) response.get(
                            "rates"
                    );


            Double exchangeRate =
                    Double.valueOf(
                            rates.get("INR")
                                    .toString()
                    );


            System.out.println(
                    currency
                            + " conversion rate: "
                            + exchangeRate
            );


            if(exchangeRate == null ||
                    exchangeRate <= 0) {

                return amount;
            }


            double convertedAmount =
                    amount * exchangeRate;


            System.out.println(
                    amount
                            + " "
                            + currency
                            + " -> "
                            + convertedAmount
                            + " INR"
            );


            return convertedAmount;


        }
        catch(Exception e) {


            System.out.println(
                    "Currency conversion failed for "
                            + currency
            );


            return amount;
        }

    }

    /**
     * Get historical stock market data
     *
     * API:
     * GET /api/v1/market/history
     */
    public Map<String,Object> getHistoricalData(
            String ticker,
            String market,
            String startDate,
            String endDate) {


        String url = UriComponentsBuilder
                .fromUriString(
                        marketDataBaseUrl
                                + "/api/v1/market/history"
                )
                .queryParam(
                        "ticker",
                        ticker
                )
                .queryParam(
                        "market",
                        market
                )
                .queryParam(
                        "startDate",
                        startDate
                )
                .queryParam(
                        "endDate",
                        endDate
                )
                .toUriString();

        return restTemplate.getForObject(
                url,
                Map.class
        );

    }

    /**
     * Get recent candle data
     *
     * API:
     * GET /api/v1/market/recent
     */
    public Map<String,Object> getRecentData(
            String ticker,
            String market) {

        String url = UriComponentsBuilder
                .fromUriString(
                        marketDataBaseUrl
                                + "/api/v1/market/recent")
                                .queryParam(
                                        "ticker",
                                        ticker
                                )
                                .queryParam(
                                        "market",
                                        market
                                )
                                .toUriString();

        return restTemplate.getForObject(
                url,
                Map.class
        );

    }

    public ChartDataResponse getChartData(String ticker, String range) {
        String normalizedTicker = normalizeTicker(ticker);
        String normalizedRange = normalizeRange(range);
        String interval = intervalForRange(normalizedRange);
        int days = daysForRange(normalizedRange);

        try {
            FastApiQuoteResponse quote = fetchQuote(normalizedTicker);
            FastApiMarketHistoryResponse history = fetchRecentHistory(normalizedTicker, interval, days);

            ChartDataResponse response = new ChartDataResponse();
            response.setTickerId(normalizedTicker);
            response.setCompanyName(resolveCompanyName(normalizedTicker));
            response.setCurrency(quote.getCurrency());
            response.setCurrentPrice(quote.getPrice());
            response.setPreviousClose(quote.getPreviousClose());

            Map<String, List<ChartDataPoint>> ranges = ChartDataResponse.defaultRanges();
            ranges.put(normalizedRange, toChartDataPoints(history.getData(), normalizedRange));
            response.setRanges(ranges);

            return response;
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticker not found: " + normalizedTicker);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400 || e.getStatusCode().value() == 422) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input for ticker/range");
            }
            throw e;

        }  catch (RestClientException e) {
        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Market data server is unavailable"
        );
    }
    }


    private FastApiQuoteResponse fetchQuote(String ticker) {
        String url = UriComponentsBuilder
                .fromUriString(marketDataBaseUrl + "/api/v1/market/quote")
                .queryParam("symbol", ticker)
                .toUriString();

        FastApiQuoteResponse quote = restTemplate.getForObject(url, FastApiQuoteResponse.class);
        if (quote == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty quote response from market data server");
        }
        return quote;
    }

    private FastApiMarketHistoryResponse fetchRecentHistory(String ticker, String interval, int days) {
        String url = UriComponentsBuilder
                .fromUriString(marketDataBaseUrl + "/api/v1/market/recent")
                .queryParam("symbol", ticker)
                .queryParam("interval", interval)
                .queryParam("days", days)
                .toUriString();

        FastApiMarketHistoryResponse history = restTemplate.getForObject(url, FastApiMarketHistoryResponse.class);
        if (history == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty history response from market data server");
        }
        return history;
    }

    private String normalizeTicker(String ticker) {
        String normalizedTicker = ticker == null ? "" : ticker.trim().toUpperCase(Locale.ROOT);
        if (normalizedTicker.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticker is required");
        }
        return normalizedTicker;
    }

    private String normalizeRange(String range) {
        String normalizedRange = range == null ? "" : range.trim().toUpperCase(Locale.ROOT);
        if (!SUPPORTED_RANGES.contains(normalizedRange)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Range must be one of: 1D, 1W, 1M, 1Y");
        }
        return normalizedRange;
    }

    private String resolveCompanyName(String ticker) {
        try {
            MarketSearchResponse searchResponse = searchSymbols(ticker);
            if (searchResponse == null || searchResponse.getResults() == null) {
                return ticker;
            }

            for (MarketSearchResult result : searchResponse.getResults()) {
                if (result != null && ticker.equalsIgnoreCase(result.getSymbol()) && result.getName() != null) {
                    return result.getName();
                }
            }

            MarketSearchResult firstResult = searchResponse.getResults().stream()
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
            return firstResult != null && firstResult.getName() != null ? firstResult.getName() : ticker;
        } catch (RestClientException e) {
            return ticker;
        }
    }

    private List<ChartDataPoint> toChartDataPoints(List<FastApiCandleData> candles, String range) {
        if (candles == null || candles.isEmpty()) {
            return Collections.emptyList();
        }

        List<ChartDataPoint> points = new ArrayList<>();
        for (FastApiCandleData candle : candles) {
            if (candle == null || candle.getTimestamp() == null || candle.getClose() == null) {
                continue;
            }

            points.add(new ChartDataPoint(
                    candle.getTimestamp(),
                    formatDateLabel(candle.getTimestamp(), range),
                    candle.getClose(),
                    candle.getVolume()
            ));
        }

        return points;
    }

    private String formatDateLabel(String isoTimestamp, String range) {
        try {
            OffsetDateTime parsed = OffsetDateTime.parse(isoTimestamp);
            DateTimeFormatter formatter;

            switch (range) {
                case "1D" -> formatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.US);
                case "1W", "1M" -> formatter = DateTimeFormatter.ofPattern("MMM dd", Locale.US);
                case "1Y" -> formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.US);
                default -> formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
            }

            return parsed.format(formatter);
        } catch (Exception e) {
            return isoTimestamp;
        }
    }

    private String intervalForRange(String range) {
        return switch (range) {
            case "1D" -> "60m";
            case "1W" -> "1d";
            case "1M" -> "1d";
            case "1Y" -> "1wk";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported range: " + range);
        };
    }

    private int daysForRange(String range) {
        return switch (range) {
            case "1D" -> 1;
            case "1W" -> 7;
            case "1M" -> 30;
            case "1Y" -> 365;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported range: " + range);
        };
    }
}