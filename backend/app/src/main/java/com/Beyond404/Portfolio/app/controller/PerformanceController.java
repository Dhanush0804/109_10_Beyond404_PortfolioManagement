package com.Beyond404.Portfolio.app.controller;


import com.Beyond404.Portfolio.app.model.PortfolioPerformanceResponse;
import com.Beyond404.Portfolio.app.model.StockPerformancePoint;
import com.Beyond404.Portfolio.app.service.PerformanceTrackingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/performance")
@CrossOrigin
public class PerformanceController {


    private final PerformanceTrackingService performanceTrackingService;


    public PerformanceController(
            PerformanceTrackingService performanceTrackingService) {

        this.performanceTrackingService =
                performanceTrackingService;

    }



    @GetMapping("/{customerId}")
    public PortfolioPerformanceResponse getPortfolioPerformance(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "MONTHLY") String range) {


        return performanceTrackingService
                .getPortfolioPerformance(
                        customerId,
                        range
                );

    }



    @GetMapping("/{customerId}/{ticker}")
    public List<StockPerformancePoint> getStockPerformance(
            @PathVariable Long customerId,
            @PathVariable String ticker,
            @RequestParam(defaultValue = "MONTHLY") String range) {


        return performanceTrackingService
                .getStockPerformance(
                        customerId,
                        ticker,
                        range
                );

    }

}