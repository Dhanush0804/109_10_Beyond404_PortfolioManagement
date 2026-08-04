package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.MarketSearchResponse;
import com.Beyond404.Portfolio.app.service.MarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market")
public class MarketDataController {

    @Autowired
    private MarketDataService marketDataService;

    @GetMapping("/search")
    public MarketSearchResponse searchSymbols(@RequestParam String companyName) {
        return marketDataService.searchSymbols(companyName);
    }
}