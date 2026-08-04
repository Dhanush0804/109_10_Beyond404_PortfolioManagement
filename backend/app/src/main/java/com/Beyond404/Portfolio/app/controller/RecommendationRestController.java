package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.service.RecommendationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/beyond404/recommendation")
public class RecommendationRestController {

    private final RecommendationService recommendationService;

    public RecommendationRestController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Get complete portfolio of a customer
     *
     * Example:
     * GET /beyond404/recommendation/1/portfolio
     */
    @GetMapping("/{customerId}/portfolio")
    public ResponseEntity<ArrayList<PortfolioData>> getCustomerPortfolio(
            @PathVariable Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationService.getCustomerPortfolio(customerId);

        if (portfolio.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(portfolio);
    }

    /**
     * Portfolio Value
     *
     * Example:
     * GET /beyond404/recommendation/1/value
     */
    @GetMapping("/{customerId}/value")
    public ResponseEntity<Double> getPortfolioValue(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getPortfolioValue(customerId)
        );
    }

    /**
     * Total Transactions
     *
     * Example:
     * GET /beyond404/recommendation/1/transactions
     */
    @GetMapping("/{customerId}/transactions")
    public ResponseEntity<Integer> getTransactionCount(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getTransactionCount(customerId)
        );
    }

    /**
     * Total BUY Transactions
     *
     * Example:
     * GET /beyond404/recommendation/1/buy
     */
    @GetMapping("/{customerId}/buy")
    public ResponseEntity<Integer> getBuyCount(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getBuyCount(customerId)
        );
    }

    /**
     * Total SELL Transactions
     *
     * Example:
     * GET /beyond404/recommendation/1/sell
     */
    @GetMapping("/{customerId}/sell")
    public ResponseEntity<Integer> getSellCount(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getSellCount(customerId)
        );
    }

    /**
     * Current Holdings
     *
     * Example:
     * GET /beyond404/recommendation/1/holdings
     */
    @GetMapping("/{customerId}/holdings")
    public ResponseEntity<Double> getCurrentHoldings(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getCurrentHoldings(customerId)
        );
    }

    /**
     * Number of Unique Stocks
     *
     * Example:
     * GET /beyond404/recommendation/1/unique-stocks
     */
    @GetMapping("/{customerId}/unique-stocks")
    public ResponseEntity<Integer> getUniqueStocks(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getUniqueStocks(customerId)
        );
    }

    /**
     * Average Investment Amount
     *
     * Example:
     * GET /beyond404/recommendation/1/average-investment
     */
    @GetMapping("/{customerId}/average-investment")
    public ResponseEntity<Double> getAverageInvestment(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getAverageInvestment(customerId)
        );
    }

    /**
     * Market Distribution
     *
     * Example:
     * GET /beyond404/recommendation/1/distribution
     */
    @GetMapping("/{customerId}/distribution")
    public ResponseEntity<Map<String, Double>> getMarketDistribution(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                recommendationService.getMarketDistribution(customerId)
        );
    }

}