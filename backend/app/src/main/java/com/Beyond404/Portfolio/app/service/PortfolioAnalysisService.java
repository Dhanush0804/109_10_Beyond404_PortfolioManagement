package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.recommendation.PortfolioAnalyzer;
import com.Beyond404.Portfolio.app.repository.PortfolioAnalysisRepository;
import com.Beyond404.Portfolio.app.model.PortfolioAnalysisResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

@Service
public class PortfolioAnalysisService {

    private final PortfolioAnalysisRepository portfolioAnalysisRepository;
    private final PortfolioAnalyzer portfolioAnalyzer;

    public PortfolioAnalysisService(
            PortfolioAnalysisRepository portfolioAnalysisRepository,
            PortfolioAnalyzer portfolioAnalyzer) {

        this.portfolioAnalysisRepository = portfolioAnalysisRepository;
        this.portfolioAnalyzer = portfolioAnalyzer;
    }

    public ArrayList<PortfolioData> getCustomerPortfolio(Long customerId) {
        return portfolioAnalysisRepository.getCustomerPortfolio(customerId);
    }

    public double getPortfolioValue(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculatePortfolioValue(portfolio);
    }

    public int getTransactionCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateTotalTransactions(portfolio);
    }

    public int getBuyCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateBuyTransactions(portfolio);
    }

    public int getSellCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateSellTransactions(portfolio);
    }

    public double getCurrentHoldings(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateCurrentHoldings(portfolio);
    }

    public int getUniqueStocks(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateUniqueStocks(portfolio);
    }

    public double getAverageInvestment(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateAverageInvestment(portfolio);
    }

    public Map<String, Double> getMarketDistribution(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateMarketDistribution(portfolio);
    }

    public PortfolioAnalysisResponse getPortfolioAnalysis(Long customerId) {


        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository
                        .getCustomerPortfolio(customerId);


        return portfolioAnalyzer
                .analyzePortfolio(portfolio);
    }
}