package com.Beyond404.Portfolio.app.model;

public class AssetHolding {

    private Long holdingId;
    private Long customerId;
    private Long stockId;
    private Double quantity;

    public AssetHolding() {
    }

    public AssetHolding(Long holdingId, Long customerId, Long stockId, Double quantity) {
        this.holdingId = holdingId;
        this.customerId = customerId;
        this.stockId = stockId;
        this.quantity = quantity;
    }

    public Long getHoldingId() {
        return holdingId;
    }

    public void setHoldingId(Long holdingId) {
        this.holdingId = holdingId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getStockId() {
        return stockId;
    }

    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }
}

