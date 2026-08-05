package com.Beyond404.Portfolio.app.model;

public class StockTransactionResponse {

    private String message;
    private Stocks stock;
    private Investment investment;
    private AssetHolding assetHolding;
    private Double resultingQuantity;
    private boolean holdingClosed;

    public StockTransactionResponse() {
    }

    public StockTransactionResponse(
            String message,
            Stocks stock,
            Investment investment,
            AssetHolding assetHolding,
            Double resultingQuantity,
            boolean holdingClosed) {
        this.message = message;
        this.stock = stock;
        this.investment = investment;
        this.assetHolding = assetHolding;
        this.resultingQuantity = resultingQuantity;
        this.holdingClosed = holdingClosed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Stocks getStock() {
        return stock;
    }

    public void setStock(Stocks stock) {
        this.stock = stock;
    }

    public Investment getInvestment() {
        return investment;
    }

    public void setInvestment(Investment investment) {
        this.investment = investment;
    }

    public AssetHolding getAssetHolding() {
        return assetHolding;
    }

    public void setAssetHolding(AssetHolding assetHolding) {
        this.assetHolding = assetHolding;
    }

    public Double getResultingQuantity() {
        return resultingQuantity;
    }

    public void setResultingQuantity(Double resultingQuantity) {
        this.resultingQuantity = resultingQuantity;
    }

    public boolean isHoldingClosed() {
        return holdingClosed;
    }

    public void setHoldingClosed(boolean holdingClosed) {
        this.holdingClosed = holdingClosed;
    }
}

