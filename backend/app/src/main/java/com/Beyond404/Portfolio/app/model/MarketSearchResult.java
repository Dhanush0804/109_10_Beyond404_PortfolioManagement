package com.Beyond404.Portfolio.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarketSearchResult {
    private String symbol;
    private String name;
    private String exchange;
    private String type;

    @JsonProperty("exchange_display")
    private String exchangeDisplay;

    public MarketSearchResult() {
    }

    public MarketSearchResult(String symbol, String name, String exchange, String type, String exchangeDisplay) {
        this.symbol = symbol;
        this.name = name;
        this.exchange = exchange;
        this.type = type;
        this.exchangeDisplay = exchangeDisplay;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getExchangeDisplay() {
        return exchangeDisplay;
    }

    public void setExchangeDisplay(String exchangeDisplay) {
        this.exchangeDisplay = exchangeDisplay;
    }
}