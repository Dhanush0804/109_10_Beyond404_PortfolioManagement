package com.Beyond404.Portfolio.app.model;

public class Customer {
    private  Integer customerId;
    private String customerName;
    private  String riskLevel;

    public Customer() {
    }
    public Customer(Integer customerId, String customerName, String riskLevel) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.riskLevel = riskLevel;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}