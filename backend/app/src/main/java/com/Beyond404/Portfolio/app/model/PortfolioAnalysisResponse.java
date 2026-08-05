package com.Beyond404.Portfolio.app.model;

import java.util.Map;

public class PortfolioAnalysisResponse {


    private Long customerId;

    private String customerName;

    private String riskLevel;


    private Double totalInvested;

    private Double totalSoldValue;


    // Current value of all holdings using live market prices
    private Double currentPortfolioValue;


    // Individual stock current prices
    // Example:
    // {
    //   "AAPL": 225.5,
    //   "ICICIBANK.NS": 1400
    // }
    private Map<String, Double> currentStockPrices;



    private Double gainAmount;

    private Double lossAmount;

    private Double profitLoss;

    private Double returnPercentage;


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

            Map<String, Double> currentStockPrices,

            Double gainAmount,

            Double lossAmount,

            Double profitLoss,

            Double returnPercentage,

            Double currentHoldings,

            Integer totalTransactions,

            Integer buyTransactions,

            Integer sellTransactions,

            Integer uniqueStocks,

            Double averageInvestment,

            Map<String, Double> marketDistribution
    ) {


        this.customerId = customerId;

        this.customerName = customerName;

        this.riskLevel = riskLevel;


        this.totalInvested = totalInvested;

        this.totalSoldValue = totalSoldValue;


        this.currentPortfolioValue = currentPortfolioValue;

        this.currentStockPrices = currentStockPrices;



        this.gainAmount = gainAmount;

        this.lossAmount = lossAmount;

        this.profitLoss = profitLoss;

        this.returnPercentage = returnPercentage;



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



    public Map<String, Double> getCurrentStockPrices() {

        return currentStockPrices;

    }



    public Double getGainAmount() {

        return gainAmount;

    }



    public Double getLossAmount() {

        return lossAmount;

    }



    public Double getProfitLoss() {

        return profitLoss;

    }



    public Double getReturnPercentage() {

        return returnPercentage;

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