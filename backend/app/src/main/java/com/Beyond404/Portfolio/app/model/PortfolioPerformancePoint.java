package com.Beyond404.Portfolio.app.model;

import java.time.LocalDate;

public class PortfolioPerformancePoint {


    private LocalDate date;
    private Double portfolioValue;
    private Double investedAmount;
    private Double profitLoss;
    private Double returnPercentage;

    public PortfolioPerformancePoint() {

    }

    public PortfolioPerformancePoint(
            LocalDate date,
            Double portfolioValue,
            Double investedAmount,
            Double profitLoss,
            Double returnPercentage) {

        this.date = date;
        this.portfolioValue = portfolioValue;
        this.investedAmount = investedAmount;
        this.profitLoss = profitLoss;
        this.returnPercentage = returnPercentage;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getPortfolioValue() {
        return portfolioValue;
    }

    public void setPortfolioValue(Double portfolioValue) {
        this.portfolioValue = portfolioValue;
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

    public Double getReturnPercentage() {
        return returnPercentage;
    }

    public void setReturnPercentage(Double returnPercentage) {
        this.returnPercentage = returnPercentage;
    }
}