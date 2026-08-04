package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.Stocks;
import com.Beyond404.Portfolio.app.repository.StocksRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class StocksService {

    private final StocksRepository stocksRepository;

    public StocksService(StocksRepository stocksRepository) {
        this.stocksRepository = stocksRepository;
    }

    // Get all stocks
    public ArrayList<Stocks> getAllStocksS() {
        return stocksRepository.getAllStocksR();
    }

    // Get stock by ID
    public Stocks findById(Long id) {
        return stocksRepository.findById(id);
    }

    // Get stock by ticker
    public Stocks findByTicker(String ticker) {
        return stocksRepository.findByTicker(ticker);
    }

    // Add a new stock
    public Stocks createStock(Stocks stock) {
        return stocksRepository.createStock(stock);
    }

    // Update stock
    public boolean updateStock(Long id, Stocks stock) {
        return stocksRepository.updateStock(id, stock);
    }

    // Delete stock
    public boolean deleteStock(Long id) {
        return stocksRepository.deleteStock(id);
    }

    // Filter stocks by market
    public ArrayList<Stocks> findByMarket(String market) {
        return stocksRepository.findByMarket(market);
    }

    public ArrayList<Stocks> findByStockName(String stockName) {
        return stocksRepository.findByStockName(stockName);
    }
}