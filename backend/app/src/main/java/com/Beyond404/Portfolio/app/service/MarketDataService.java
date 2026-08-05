package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.MarketSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.Beyond404.Portfolio.app.model.MarketQuote;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
public class MarketDataService {


    @Value("${market.data.base-url:http://localhost:8000}")
    private String marketDataBaseUrl;


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
    public MarketSearchResponse searchSymbols(String companyName) {


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
                                + "/api/v1/market/recent"
                )
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