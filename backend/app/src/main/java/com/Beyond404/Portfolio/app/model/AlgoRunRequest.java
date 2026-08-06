package com.Beyond404.Portfolio.app.model;

import java.util.ArrayList;
import java.util.List;

public class AlgoRunRequest {
    private Long customerId;
    private List<String> tickers = new ArrayList<>();
    private String strategyName = "MOMENTUM_SMA";
    private Boolean dryRun = true;

    public AlgoRunRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<String> getTickers() {
        return tickers;
    }

    public void setTickers(List<String> tickers) {
        this.tickers = tickers;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public Boolean getDryRun() {
        return dryRun;
    }

    public void setDryRun(Boolean dryRun) {
        this.dryRun = dryRun;
    }
}