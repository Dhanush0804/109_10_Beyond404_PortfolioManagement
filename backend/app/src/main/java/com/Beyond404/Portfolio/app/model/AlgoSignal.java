package com.Beyond404.Portfolio.app.model;

public class AlgoSignal {
    private String ticker;
    private String action; // BUY | SELL | HOLD
    private double score;
    private double confidence;
    private double lastPrice;
    private String reason;

    public AlgoSignal() {
    }

    public AlgoSignal(String ticker, String action, double score, double confidence, double lastPrice, String reason) {
        this.ticker = ticker;
        this.action = action;
        this.score = score;
        this.confidence = confidence;
        this.lastPrice = lastPrice;
        this.reason = reason;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public double getLastPrice() {
        return lastPrice;
    }

    public void setLastPrice(double lastPrice) {
        this.lastPrice = lastPrice;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}