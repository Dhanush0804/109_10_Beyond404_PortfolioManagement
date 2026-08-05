package com.Beyond404.Portfolio.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FastApiQuoteResponse {
    private String symbol;
    private Double price;
    private String currency;
    private String timestamp;

    @JsonProperty("previous_close")
    private Double previousClose;

    public FastApiQuoteResponse() {
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Double getPreviousClose() {
        return previousClose;
    }

    public void setPreviousClose(Double previousClose) {
        this.previousClose = previousClose;
    }
}

