package com.Beyond404.Portfolio.app.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ChartDataResponse {
    private String tickerId;
    private String companyName;
    private String currency;
    private Double currentPrice;
    private Double previousClose;
    private Map<String, List<ChartDataPoint>> ranges;

    public ChartDataResponse() {
        this.ranges = defaultRanges();
    }

    public String getTickerId() {
        return tickerId;
    }

    public void setTickerId(String tickerId) {
        this.tickerId = tickerId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getPreviousClose() {
        return previousClose;
    }

    public void setPreviousClose(Double previousClose) {
        this.previousClose = previousClose;
    }

    public Map<String, List<ChartDataPoint>> getRanges() {
        return ranges;
    }

    public void setRanges(Map<String, List<ChartDataPoint>> ranges) {
        this.ranges = ranges;
    }

    public static Map<String, List<ChartDataPoint>> defaultRanges() {
        Map<String, List<ChartDataPoint>> map = new LinkedHashMap<>();
        map.put("1D", new ArrayList<>());
        map.put("1W", new ArrayList<>());
        map.put("1M", new ArrayList<>());
        map.put("1Y", new ArrayList<>());
        return map;
    }
}

