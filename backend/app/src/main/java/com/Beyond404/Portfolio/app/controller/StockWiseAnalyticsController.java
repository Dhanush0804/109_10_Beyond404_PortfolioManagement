package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.StockwiseAnalytics;
import com.Beyond404.Portfolio.app.service.StockWiseAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/portfolio-analytics")
public class StockWiseAnalyticsController {

    private final StockWiseAnalyticsService stockWiseAnalyticsService;

    public StockWiseAnalyticsController(StockWiseAnalyticsService stockWiseAnalyticsService) {
        this.stockWiseAnalyticsService = stockWiseAnalyticsService;
    }

    @GetMapping("/stock-wise")
    public ResponseEntity<ArrayList<StockwiseAnalytics>> getStockWise(
            @RequestParam Long customerId) {

        ArrayList<StockwiseAnalytics> data =
                stockWiseAnalyticsService.getStockWiseAnalytics(customerId);

        return ResponseEntity.ok(data);
    }
}