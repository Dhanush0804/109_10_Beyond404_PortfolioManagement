package com.Beyond404.Portfolio.app.model;

public class Stocks {

    private Long stockId;
    private String companyName;
    private String sector;

    public Stocks(Long stockId, String companyName, String sector) {
        this.stockId = stockId;
        this.companyName = companyName;
        this.sector = sector;
    }

    public Long getStockId() {
        return stockId;
    }

    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }
}
