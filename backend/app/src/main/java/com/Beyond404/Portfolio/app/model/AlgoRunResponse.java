package com.Beyond404.Portfolio.app.model;

import java.util.ArrayList;
import java.util.List;

public class AlgoRunResponse {
    private Long customerId;
    private String strategyName;
    private boolean dryRun;
    private String riskLevel;
    private List<AlgoSignal> signals = new ArrayList<>();
    private String disclaimer;

    public AlgoRunResponse() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public boolean isDryRun() {
        return dryRun;
    }

    public void setDryRun(boolean dryRun) {
        this.dryRun = dryRun;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<AlgoSignal> getSignals() {
        return signals;
    }

    public void setSignals(List<AlgoSignal> signals) {
        this.signals = signals;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}