package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.ChartDataResponse;
import com.Beyond404.Portfolio.app.service.MarketDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChartDataController {

    private final MarketDataService marketDataService;

    public ChartDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/chart-data/{ticker}")
    public ChartDataResponse getChartData(
            @PathVariable String ticker,
            @RequestParam String range
    ) {
        return marketDataService.getChartData(ticker, range);
    }
}

