package com.Beyond404.Portfolio.app.model;

import java.util.List;

public class InvestmentPageResponse {
    private List<Investment> items;
    private Long totalItems;
    private Integer page;
    private Integer size;
    private Integer totalPages;

    public InvestmentPageResponse() {
    }

    public InvestmentPageResponse(List<Investment> items, Long totalItems, Integer page, Integer size, Integer totalPages) {
        this.items = items;
        this.totalItems = totalItems;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
    }

    public List<Investment> getItems() {
        return items;
    }

    public void setItems(List<Investment> items) {
        this.items = items;
    }

    public Long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Long totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}