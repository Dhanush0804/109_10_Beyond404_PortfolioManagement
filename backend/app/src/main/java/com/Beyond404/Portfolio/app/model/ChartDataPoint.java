package com.Beyond404.Portfolio.app.model;

public class ChartDataPoint {
    private String timestamp;
    private String date;
    private Double price;
    private Long volume;

    public ChartDataPoint() {
    }

    public ChartDataPoint(String timestamp, String date, Double price, Long volume) {
        this.timestamp = timestamp;
        this.date = date;
        this.price = price;
        this.volume = volume;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getVolume() {
        return volume;
    }

    public void setVolume(Long volume) {
        this.volume = volume;
    }
}

