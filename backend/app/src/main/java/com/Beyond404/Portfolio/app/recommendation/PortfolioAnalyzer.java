package com.Beyond404.Portfolio.app.recommendation;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PortfolioAnalyzer {

    /**
     * Calculates the net portfolio value.
     *
     * Portfolio Value =
     * Total BUY Amount - Total SELL Amount
     */
    public double calculatePortfolioValue(List<PortfolioData> portfolio) {

        double portfolioValue = 0.0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("BUY")) {

                portfolioValue += investment.getTransactionAmount();

            } else {

                portfolioValue -= investment.getTransactionAmount();

            }
        }

        return portfolioValue;
    }

    /**
     * Returns total number of transactions.
     */
    public int calculateTotalTransactions(List<PortfolioData> portfolio) {

        return portfolio.size();
    }

    /**
     * Calculates total BUY transactions.
     */
    public int calculateBuyTransactions(List<PortfolioData> portfolio) {

        int buyCount = 0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("BUY")) {

                buyCount++;

            }
        }

        return buyCount;
    }

    /**
     * Calculates total SELL transactions.
     */
    public int calculateSellTransactions(List<PortfolioData> portfolio) {

        int sellCount = 0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("SELL")) {

                sellCount++;

            }
        }

        return sellCount;
    }

    /**
     * Calculates total quantity currently owned.
     *
     * BUY adds quantity.
     * SELL subtracts quantity.
     */
    public double calculateCurrentHoldings(List<PortfolioData> portfolio) {

        double quantity = 0.0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("BUY")) {

                quantity += investment.getQuantity();

            } else {

                quantity -= investment.getQuantity();

            }
        }

        return quantity;
    }

    /**
     * Calculates market allocation.
     *
     * Example:
     * NASDAQ -> 40%
     * NYSE -> 25%
     * NSE -> 20%
     * BSE -> 10%
     * EURONEXT -> 5%
     */
    public Map<String, Double> calculateMarketDistribution(List<PortfolioData> portfolio) {

        Map<String, Double> marketAmount = new HashMap<>();

        double totalInvestment = 0.0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("BUY")) {

                String market = investment.getStockMarket();

                marketAmount.put(
                        market,
                        marketAmount.getOrDefault(market, 0.0)
                                + investment.getTransactionAmount()
                );

                totalInvestment += investment.getTransactionAmount();
            }
        }

        Map<String, Double> distribution = new HashMap<>();

        for (String market : marketAmount.keySet()) {

            distribution.put(
                    market,
                    (marketAmount.get(market) / totalInvestment) * 100
            );

        }

        return distribution;
    }

    /**
     * Calculates portfolio diversification.
     *
     * Returns number of unique companies.
     */
    public int calculateUniqueStocks(List<PortfolioData> portfolio) {

        Map<Long, Boolean> stocks = new HashMap<>();

        for (PortfolioData investment : portfolio) {

            stocks.put(
                    investment.getStockId(),
                    true
            );
        }

        return stocks.size();
    }

    /**
     * Average investment amount.
     */
    public double calculateAverageInvestment(List<PortfolioData> portfolio) {

        double total = 0.0;

        int count = 0;

        for (PortfolioData investment : portfolio) {

            if (investment.getTransactionType().equalsIgnoreCase("BUY")) {

                total += investment.getTransactionAmount();

                count++;
            }
        }

        if (count == 0) {

            return 0;

        }

        return total / count;
    }

}