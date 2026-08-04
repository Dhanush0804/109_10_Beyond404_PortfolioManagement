package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.MarketSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MarketDataService {

    @Value("${market.data.base-url:http://localhost:8000}")
    private String marketDataBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public MarketSearchResponse searchSymbols(String companyName) {
        String url = UriComponentsBuilder
                .fromUriString(marketDataBaseUrl + "/api/v1/market/search")
                .queryParam("query", companyName)
                .toUriString();

        return restTemplate.getForObject(url, MarketSearchResponse.class);
    }
}