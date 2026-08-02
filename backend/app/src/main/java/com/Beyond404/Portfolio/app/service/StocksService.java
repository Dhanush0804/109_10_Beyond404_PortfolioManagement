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

    public ArrayList<Stocks> getAllStocksS() {
        return stocksRepository.getAllStocksR();
    }

    public Stocks findById(Long id) {
        return stocksRepository.findById(id);
    }

    public Stocks createStock(Stocks stock) {
        return stocksRepository.createStock(stock);
    }

    public boolean updateStock(Long id, Stocks stock) {
        return stocksRepository.updateStock(id, stock);
    }

    public boolean deleteStock(Long id) {
        return stocksRepository.deleteStock(id);
    }

    public ArrayList<Stocks> findBySector(String sector) {
        return stocksRepository.findBySector(sector);
    }
}
