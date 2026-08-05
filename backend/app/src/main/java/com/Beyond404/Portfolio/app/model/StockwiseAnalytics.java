package com.Beyond404.Portfolio.app.model;

import java.math.BigDecimal;

public class StockwiseAnalytics{

    private Long stockId;
    private String ticker;
    private String companyName;

    private Integer invested;
    private Integer currentValue;
    private Integer pnl;
    private BigDecimal pnlPercent;

    private BigDecimal lastPrice;
    private BigDecimal prevPrice;
    private String marketCap;
    private String volume;

    public StockwiseAnalytics() {
    }
    public StockwiseAnalytics(Long stockId, String ticker, String companyName, Integer invested, Integer currentValue, Integer pnl, BigDecimal pnlPercent, BigDecimal lastPrice, BigDecimal prevPrice, String marketCap, String volume) {
        this.stockId = stockId;
        this.ticker = ticker;
        this.companyName = companyName;
        this.invested = invested;
        this.currentValue = currentValue;
        this.pnl = pnl;
        this.pnlPercent = pnlPercent;
        this.lastPrice = lastPrice;
        this.prevPrice = prevPrice;
        this.marketCap = marketCap;
        this.volume = volume;
    }

    public Long getStockId() {
        return stockId;
    }

    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Integer getInvested() {
        return invested;
    }

    public void setInvested(Integer invested) {
        this.invested = invested;
    }

    public Integer getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Integer currentValue) {
        this.currentValue = currentValue;
    }

    public Integer getPnl() {
        return pnl;
    }

    public void setPnl(Integer pnl) {
        this.pnl = pnl;
    }

    public BigDecimal getPnlPercent() {
        return pnlPercent;
    }

    public void setPnlPercent(BigDecimal pnlPercent) {
        this.pnlPercent = pnlPercent;
    }

    public BigDecimal getLastPrice() {
        return lastPrice;
    }

    public void setLastPrice(BigDecimal lastPrice) {
        this.lastPrice = lastPrice;
    }

    public BigDecimal getPrevPrice() {
        return prevPrice;
    }

    public void setPrevPrice(BigDecimal prevPrice) {
        this.prevPrice = prevPrice;
    }

    public String getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(String marketCap) {
        this.marketCap = marketCap;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }
}