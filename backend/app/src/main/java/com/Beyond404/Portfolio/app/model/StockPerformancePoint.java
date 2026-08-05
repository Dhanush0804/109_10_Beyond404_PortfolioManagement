package com.Beyond404.Portfolio.app.model;

import java.time.LocalDate;

public class StockPerformancePoint {


    private LocalDate date;

    private String ticker;

    private Double quantity;

    private Double stockPrice;

    private Double holdingValue;

    private Double investedAmount;

    private Double profitLoss;



    public StockPerformancePoint() {

    }

    public StockPerformancePoint(
            LocalDate date,
            String ticker,
            Double quantity,
            Double stockPrice,
            Double holdingValue,
            Double investedAmount,
            Double profitLoss) {


        this.date = date;

        this.ticker = ticker;

        this.quantity = quantity;

        this.stockPrice = stockPrice;

        this.holdingValue = holdingValue;

        this.investedAmount = investedAmount;

        this.profitLoss = profitLoss;

    }

    public LocalDate getDate() {

        return date;

    }

    public void setDate(LocalDate date) {

        this.date = date;

    }

    public String getTicker() {

        return ticker;

    }

    public void setTicker(String ticker) {

        this.ticker = ticker;

    }

    public Double getQuantity() {

        return quantity;

    }

    public void setQuantity(Double quantity) {

        this.quantity = quantity;

    }

    public Double getStockPrice() {

        return stockPrice;

    }

    public void setStockPrice(Double stockPrice) {

        this.stockPrice = stockPrice;

    }

    public Double getHoldingValue() {

        return holdingValue;

    }

    public void setHoldingValue(Double holdingValue) {

        this.holdingValue = holdingValue;

    }

    public Double getInvestedAmount() {

        return investedAmount;

    }

    public void setInvestedAmount(Double investedAmount) {

        this.investedAmount = investedAmount;

    }

    public Double getProfitLoss() {

        return profitLoss;

    }

    public void setProfitLoss(Double profitLoss) {

        this.profitLoss = profitLoss;

    }
}