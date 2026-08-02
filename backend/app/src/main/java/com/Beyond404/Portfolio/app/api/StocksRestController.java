package com.Beyond404.Portfolio.app.api;

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

    @GetMapping("/all")
    public ArrayList<Stocks> getAllStocks() {
        return stocksService.getAllStocksS();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stocks> findById(@PathVariable Long id) {

        Stocks stock = stocksService.findById(id);

        if (stock == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stock);
    }

    @PostMapping("/")
    public ResponseEntity<Stocks> createStock(@RequestBody Stocks stock) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(stocksService.createStock(stock));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stocks> updateStock(
            @PathVariable Long id,
            @RequestBody Stocks stock) {

        if (!stocksService.updateStock(id, stock)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stocksService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStock(@PathVariable Long id) {

        if (!stocksService.deleteStock(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(
                "Stock with id " + id + " deleted successfully."
        );
    }

    /*
     * GET /beyond404/stocks/sector?sector=IT
     *
     * Filters stocks by sector.
     *
     * Examples:
     * GET /beyond404/stocks/sector?sector=IT
     * GET /beyond404/stocks/sector?sector=Banking
     * GET /beyond404/stocks/sector?sector=Energy
     */

    @GetMapping("/sector")
    public ArrayList<Stocks> findBySector(
            @RequestParam String sector) {

        System.out.println(
                "Incoming GET request for /beyond404/stocks/sector?sector="
                        + sector
        );

        return stocksService.findBySector(sector);
    }
}
