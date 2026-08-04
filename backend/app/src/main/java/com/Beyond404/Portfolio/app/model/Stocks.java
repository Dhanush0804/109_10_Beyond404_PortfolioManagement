package com.Beyond404.Portfolio.app.model;

public class Stocks {

    private Long stockId;
    private String stockName;
    private String ticker;
    private String stockMarket;

    public Stocks(Long stockId, String stockName, String ticker, String stockMarket) {
        this.stockId = stockId;
        this.stockName = stockName;
        this.ticker = ticker;
        this.stockMarket = stockMarket;
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
}
