package com.Beyond404.Portfolio.app.model;

import java.util.Map;

public class PortfolioAnalysisResponse {

    private Long customerId;

    private String customerName;

    private String riskLevel;

    private Double totalInvested;

    private Double totalSoldValue;

    private Double currentPortfolioValue;

    private Double currentHoldings;

    private Integer totalTransactions;

    private Integer buyTransactions;

    private Integer sellTransactions;

    private Integer uniqueStocks;

    private Double averageInvestment;

    private Map<String, Double> marketDistribution;


    public PortfolioAnalysisResponse() {
    }


    public PortfolioAnalysisResponse(
            Long customerId,
            String customerName,
            String riskLevel,
            Double totalInvested,
            Double totalSoldValue,
            Double currentPortfolioValue,
            Double currentHoldings,
            Integer totalTransactions,
            Integer buyTransactions,
            Integer sellTransactions,
            Integer uniqueStocks,
            Double averageInvestment,
            Map<String, Double> marketDistribution) {

        this.customerId = customerId;
        this.customerName = customerName;
        this.riskLevel = riskLevel;
        this.totalInvested = totalInvested;
        this.totalSoldValue = totalSoldValue;
        this.currentPortfolioValue = currentPortfolioValue;
        this.currentHoldings = currentHoldings;
        this.totalTransactions = totalTransactions;
        this.buyTransactions = buyTransactions;
        this.sellTransactions = sellTransactions;
        this.uniqueStocks = uniqueStocks;
        this.averageInvestment = averageInvestment;
        this.marketDistribution = marketDistribution;
    }


    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public Double getTotalInvested() {
        return totalInvested;
    }

    public Double getTotalSoldValue() {
        return totalSoldValue;
    }

    public Double getCurrentPortfolioValue() {
        return currentPortfolioValue;
    }

    public Double getCurrentHoldings() {
        return currentHoldings;
    }

    public Integer getTotalTransactions() {
        return totalTransactions;
    }

    public Integer getBuyTransactions() {
        return buyTransactions;
    }

    public Integer getSellTransactions() {
        return sellTransactions;
    }

    public Integer getUniqueStocks() {
        return uniqueStocks;
    }

    public Double getAverageInvestment() {
        return averageInvestment;
    }

    public Map<String, Double> getMarketDistribution() {
        return marketDistribution;
    }
}