package com.Beyond404.Portfolio.app.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Investment {

    private Long assetId;
    private Long customerId;
    private Long stockId;
    private String transactionType;
    private BigDecimal transactionAmount;
    private BigDecimal quantity;
    private Timestamp transactionTimestamp;

    public Investment() {
    }

    public Investment(Long assetId, Long customerId, Long stockId,
                      String transactionType, BigDecimal transactionAmount,
                      BigDecimal quantity, Timestamp transactionTimestamp) {
        this.assetId = assetId;
        this.customerId = customerId;
        this.stockId = stockId;
        this.transactionType = transactionType;
        this.transactionAmount = transactionAmount;
        this.quantity = quantity;
        this.transactionTimestamp = transactionTimestamp;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
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

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(BigDecimal transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public Timestamp getTransactionTimestamp() {
        return transactionTimestamp;
    }

    public void setTransactionTimestamp(Timestamp transactionTimestamp) {
        this.transactionTimestamp = transactionTimestamp;
    }
}

