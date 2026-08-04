package com.Beyond404.Portfolio.app.model;

import java.util.List;

public class FastApiMarketHistoryResponse {
    private String symbol;
    private String interval;
    private String timezone;
    private String start;
    private String end;
    private Integer count;
    private List<FastApiCandleData> data;

    public FastApiMarketHistoryResponse() {
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public List<FastApiCandleData> getData() {
        return data;
    }

    public void setData(List<FastApiCandleData> data) {
        this.data = data;
    }
}

