package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.MarketSearchResponse;
import com.Beyond404.Portfolio.app.model.MarketQuote;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
public class MarketDataService {


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

}