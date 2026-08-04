package com.Beyond404.Portfolio.app.model;
import java.util.List;
public class MarketSearchResponse {
    private String query;
    private List<MarketSearchResult> results;
    private Integer count;

    public MarketSearchResponse() {
    }
    public MarketSearchResponse(String query, List<MarketSearchResult> results, Integer count) {
        this.query = query;
        this.results = results;
        this.count = count;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<MarketSearchResult> getResults() {
        return results;
    }

    public void setResults(List<MarketSearchResult> results) {
        this.results = results;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
