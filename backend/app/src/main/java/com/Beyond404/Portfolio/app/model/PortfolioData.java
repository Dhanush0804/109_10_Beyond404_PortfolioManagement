package com.Beyond404.Portfolio.app.model;

import java.time.LocalDateTime;

public class PortfolioData {

    private Long customerId;

    private String customerName;

    private String riskLevel;


    private Long stockId;

    private String stockName;

    private String ticker;

    private String stockMarket;


    private String transactionType;

    private Double quantity;

    private LocalDateTime transactionTimestamp;



    // Default Constructor
    public PortfolioData() {

    }



    // Parameterized Constructor
    public PortfolioData(
            Long customerId,
            String customerName,
            String riskLevel,
            Long stockId,
            String stockName,
            String ticker,
            String stockMarket,
            String transactionType,
            Double quantity,
            LocalDateTime transactionTimestamp) {


        this.customerId = customerId;

        this.customerName = customerName;

        this.riskLevel = riskLevel;

        this.stockId = stockId;

        this.stockName = stockName;

        this.ticker = ticker;

        this.stockMarket = stockMarket;

        this.transactionType = transactionType;

        this.quantity = quantity;

        this.transactionTimestamp = transactionTimestamp;

    }



    public Long getCustomerId() {
        return customerId;
    }


    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }


    public String getCustomerName() {
        return customerName;
    }


    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }


    public String getRiskLevel() {
        return riskLevel;
    }


    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }


    public Long getStockId() {
        return stockId;
    }


    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }


    public String getStockName() {
        return stockName;
    }


    public void setStockName(String stockName) {
        this.stockName = stockName;
    }


    public String getTicker() {
        return ticker;
    }


    public void setTicker(String ticker) {
        this.ticker = ticker;
    }


    public String getStockMarket() {
        return stockMarket;
    }


    public void setStockMarket(String stockMarket) {
        this.stockMarket = stockMarket;
    }


    public String getTransactionType() {
        return transactionType;
    }


    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }


    public Double getQuantity() {
        return quantity;
    }


    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }


    public LocalDateTime getTransactionTimestamp() {
        return transactionTimestamp;
    }


    public void setTransactionTimestamp(
            LocalDateTime transactionTimestamp) {

        this.transactionTimestamp = transactionTimestamp;

    }

}