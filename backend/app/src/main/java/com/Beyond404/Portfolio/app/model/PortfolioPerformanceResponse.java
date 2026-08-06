package com.Beyond404.Portfolio.app.model;

import java.util.List;
import java.util.Map;

public class PortfolioPerformanceResponse {


    private Long customerId;

    private String currency;

    private Map<String, Double> summary;

    private List<PortfolioPerformancePoint> chartData;



    public PortfolioPerformanceResponse(
            Long customerId,
            String currency,
            Map<String, Double> summary,
            List<PortfolioPerformancePoint> chartData) {

        this.customerId = customerId;

        this.currency = currency;

        this.summary = summary;

        this.chartData = chartData;

    }



    public Long getCustomerId() {
        return customerId;
    }



    public String getCurrency() {
        return currency;
    }



    public Map<String, Double> getSummary() {
        return summary;
    }



    public List<PortfolioPerformancePoint> getChartData() {
        return chartData;
    }

}