package com.Beyond404.Portfolio.app.model;


import com.fasterxml.jackson.annotation.JsonProperty;


public class MarketQuote {


    private String symbol;


    private Double price;


    private String currency;


    private String timestamp;


    private Double open;


    private Double high;


    private Double low;


    @JsonProperty("previous_close")
    private Double previousClose;


    private Double change;


    @JsonProperty("percent_change")
    private Double percentChange;


    private Long volume;



    public MarketQuote() {

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



    public Double getOpen() {
        return open;
    }


    public void setOpen(Double open) {
        this.open = open;
    }



    public Double getHigh() {
        return high;
    }


    public void setHigh(Double high) {
        this.high = high;
    }



    public Double getLow() {
        return low;
    }


    public void setLow(Double low) {
        this.low = low;
    }



    public Double getPreviousClose() {
        return previousClose;
    }


    public void setPreviousClose(Double previousClose) {
        this.previousClose = previousClose;
    }



    public Double getChange() {
        return change;
    }


    public void setChange(Double change) {
        this.change = change;
    }



    public Double getPercentChange() {
        return percentChange;
    }


    public void setPercentChange(Double percentChange) {
        this.percentChange = percentChange;
    }



    public Long getVolume() {
        return volume;
    }


    public void setVolume(Long volume) {
        this.volume = volume;
    }

}