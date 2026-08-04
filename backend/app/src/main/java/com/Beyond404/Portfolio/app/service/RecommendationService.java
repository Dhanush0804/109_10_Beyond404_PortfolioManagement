package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.recommendation.PortfolioAnalyzer;
import com.Beyond404.Portfolio.app.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final PortfolioAnalyzer portfolioAnalyzer;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            PortfolioAnalyzer portfolioAnalyzer) {

        this.recommendationRepository = recommendationRepository;
        this.portfolioAnalyzer = portfolioAnalyzer;
    }

    public ArrayList<PortfolioData> getCustomerPortfolio(Long customerId) {
        return recommendationRepository.getCustomerPortfolio(customerId);
    }

    public double getPortfolioValue(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculatePortfolioValue(portfolio);
    }

    public int getTransactionCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateTotalTransactions(portfolio);
    }

    public int getBuyCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateBuyTransactions(portfolio);
    }

    public int getSellCount(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateSellTransactions(portfolio);
    }

    public double getCurrentHoldings(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateCurrentHoldings(portfolio);
    }

    public int getUniqueStocks(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateUniqueStocks(portfolio);
    }

    public double getAverageInvestment(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateAverageInvestment(portfolio);
    }

    public Map<String, Double> getMarketDistribution(Long customerId) {

        ArrayList<PortfolioData> portfolio =
                recommendationRepository.getCustomerPortfolio(customerId);

        return portfolioAnalyzer.calculateMarketDistribution(portfolio);
    }
}