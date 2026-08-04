package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Stocks;
import com.Beyond404.Portfolio.app.service.StocksService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/beyond404/stocks")
public class StocksRestController {

    private final StocksService stocksService;

    public StocksRestController(StocksService stocksService) {
        this.stocksService = stocksService;
    }

    // Get all stocks
    @GetMapping("/all")
    public ArrayList<Stocks> getAllStocks() {
        return stocksService.getAllStocksS();
    }

    // Get stock by ID
    @GetMapping("/{id}")
    public ResponseEntity<Stocks> findById(@PathVariable Long id) {

        Stocks stock = stocksService.findById(id);

        if (stock == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stock);
    }

    // Get stock by ticker
    @GetMapping("/ticker/{ticker}")
    public ResponseEntity<Stocks> findByTicker(@PathVariable String ticker) {

        Stocks stock = stocksService.findByTicker(ticker);

        if (stock == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stock);
    }

    // Create a stock
    @PostMapping("/add")
    public ResponseEntity<Stocks> createStock(@RequestBody Stocks stock) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(stocksService.createStock(stock));
    }

    // Update a stock
    @PutMapping("/update/{id}")
    public ResponseEntity<Stocks> updateStock(
            @PathVariable Long id,
            @RequestBody Stocks stock) {

        if (!stocksService.updateStock(id, stock)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stocksService.findById(id));
    }

    // Delete a stock
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteStock(@PathVariable Long id) {

        if (!stocksService.deleteStock(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(
                "Stock with id " + id + " deleted successfully."
        );
    }

    /*
     * GET /beyond404/stocks/market?market=NASDAQ
     *
     * Filters stocks by stock market.
     *
     * Examples:
     * GET /beyond404/stocks/market?market=NASDAQ
     * GET /beyond404/stocks/market?market=NYSE
     * GET /beyond404/stocks/market?market=NSE
     * GET /beyond404/stocks/market?market=BSE
     * GET /beyond404/stocks/market?market=EURONEXT
     */

    @GetMapping("/market")
    public ArrayList<Stocks> findByMarket(
            @RequestParam String market) {

        System.out.println(
                "Incoming GET request for /beyond404/stocks/market?market="
                        + market
        );

        return stocksService.findByMarket(market);
    }

    @GetMapping("/market/name")
    public ArrayList<Stocks> findByStockName(
            @RequestParam String stockName) {

        System.out.println(
                "Incoming GET request for /beyond404/stocks/name?stockName="
                        + stockName
        );

        return stocksService.findByStockName(stockName);
    }
}