package com.Beyond404.Portfolio.app.recommendation;

import com.Beyond404.Portfolio.app.model.MarketQuote;
import com.Beyond404.Portfolio.app.model.PortfolioAnalysisResponse;
import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.service.MarketDataService;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PortfolioAnalyzer {


    private final MarketDataService marketDataService;


    public PortfolioAnalyzer(MarketDataService marketDataService) {

        this.marketDataService = marketDataService;

    }



    /*
     * Total amount invested
     * Only BUY transactions
     */
    public double calculateTotalInvestment(
            List<PortfolioData> portfolio) {


        double total = 0;


        for (PortfolioData investment : portfolio) {


            if (investment.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                total += investment.getTransactionAmount();

            }

        }


        return total;

    }





    /*
     * Total amount received from selling stocks
     */
    public double calculateTotalSellValue(
            List<PortfolioData> portfolio) {


        double total = 0;


        for (PortfolioData investment : portfolio) {


            if (investment.getTransactionType()
                    .equalsIgnoreCase("SELL")) {


                total += investment.getTransactionAmount();

            }

        }


        return total;

    }






    /*
     * Calculates stock wise current holdings
     *
     * Example:
     *
     * AAPL
     * BUY 50
     * SELL 10
     *
     * Holding = 40
     */
    private Map<String, Double> calculateStockHoldings(
            List<PortfolioData> portfolio) {


        Map<String, Double> holdings =
                new HashMap<>();



        for (PortfolioData investment : portfolio) {


            String ticker =
                    investment.getTicker();



            double quantity =
                    investment.getQuantity();



            if (investment.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                holdings.put(
                        ticker,
                        holdings.getOrDefault(
                                ticker,
                                0.0
                        )
                                +
                                quantity
                );


            }
            else {


                holdings.put(
                        ticker,
                        holdings.getOrDefault(
                                ticker,
                                0.0
                        )
                                -
                                quantity
                );

            }

        }


        return holdings;

    }








    /*
     * Current portfolio market value
     *
     * Formula:
     *
     * Current Holding Quantity
     *          *
     * Current Market Price
     */
    public double calculateCurrentValue(
            List<PortfolioData> portfolio) {


        double currentValue = 0;


        Map<String, Double> holdings =
                calculateStockHoldings(portfolio);



        for(String ticker : holdings.keySet()) {


            double quantity =
                    holdings.get(ticker);



            if(quantity <= 0)
                continue;



            PortfolioData stock =
                    getStockData(
                            portfolio,
                            ticker
                    );


            if(stock == null)
                continue;



            try {


                MarketQuote quote =
                        marketDataService.getQuote(
                                ticker,
                                stock.getStockMarket()
                        );



                if(quote != null &&
                        quote.getCurrentPrice()!=null) {



                    currentValue +=
                            quantity *
                                    quote.getCurrentPrice();

                }


            }
            catch(Exception e) {


                System.out.println(
                        "Market data unavailable for "
                                + ticker
                );

            }


        }


        return currentValue;

    }









    /*
     * Returns current market price of each stock
     */
    public Map<String, Double> getCurrentStockPrices(
            List<PortfolioData> portfolio) {


        Map<String, Double> prices =
                new HashMap<>();


        Map<String, Double> holdings =
                calculateStockHoldings(portfolio);



        for(String ticker : holdings.keySet()) {


            PortfolioData stock =
                    getStockData(
                            portfolio,
                            ticker
                    );



            if(stock == null)
                continue;



            try {


                MarketQuote quote =
                        marketDataService.getQuote(
                                ticker,
                                stock.getStockMarket()
                        );



                if(quote != null &&
                        quote.getCurrentPrice()!=null) {


                    prices.put(
                            ticker,
                            quote.getCurrentPrice()
                    );

                }


            }
            catch(Exception e) {


                System.out.println(
                        "Price unavailable for "
                                + ticker
                );

            }


        }


        return prices;

    }







    private PortfolioData getStockData(
            List<PortfolioData> portfolio,
            String ticker) {


        for(PortfolioData data : portfolio) {


            if(data.getTicker()
                    .equalsIgnoreCase(ticker)) {


                return data;

            }

        }


        return null;

    }








    public int calculateTotalTransactions(
            List<PortfolioData> portfolio) {

        return portfolio.size();

    }







    public int calculateBuyTransactions(
            List<PortfolioData> portfolio) {


        int count = 0;


        for(PortfolioData data : portfolio) {


            if(data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {

                count++;

            }

        }


        return count;

    }







    public int calculateSellTransactions(
            List<PortfolioData> portfolio) {


        int count = 0;


        for(PortfolioData data : portfolio) {


            if(data.getTransactionType()
                    .equalsIgnoreCase("SELL")) {

                count++;

            }

        }


        return count;

    }

    public Map<String, Double> getStockHoldings(List<PortfolioData> portfolio) {
    return calculateStockHoldings(portfolio);
}

public Map<String, Double> getNetInvestedByStock(List<PortfolioData> portfolio) {
    Map<String, Double> invested = new HashMap<>();

    for (PortfolioData tx : portfolio) {
        String ticker = tx.getTicker();
        double amount = tx.getTransactionAmount();

        if (tx.getTransactionType().equalsIgnoreCase("BUY")) {
            invested.put(ticker, invested.getOrDefault(ticker, 0.0) + amount);
        } else {
            invested.put(ticker, invested.getOrDefault(ticker, 0.0) - amount);
        }
    }

    return invested;
}







    public double calculateCurrentHoldings(
            List<PortfolioData> portfolio) {


        double quantity = 0;


        for(PortfolioData data : portfolio) {


            if(data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                quantity += data.getQuantity();


            }
            else {


                quantity -= data.getQuantity();

            }

        }


        return quantity;

    }








    public Map<String, Double> calculateMarketDistribution(
            List<PortfolioData> portfolio) {


        Map<String, Double> distribution =
                new HashMap<>();


        double totalInvestment =
                calculateTotalInvestment(portfolio);



        for(PortfolioData data : portfolio) {


            if(data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                String market =
                        data.getStockMarket();



                distribution.put(
                        market,
                        distribution.getOrDefault(
                                market,
                                0.0
                        )
                                +
                                data.getTransactionAmount()
                                        /
                                        totalInvestment
                                        *
                                        100
                );

            }

        }


        return distribution;

    }








    public int calculateUniqueStocks(
            List<PortfolioData> portfolio) {


        Map<Long, Boolean> stocks =
                new HashMap<>();


        for(PortfolioData data : portfolio) {


            stocks.put(
                    data.getStockId(),
                    true
            );

        }


        return stocks.size();

    }







    public double calculateAverageInvestment(
            List<PortfolioData> portfolio) {


        double total = 0;

        int count = 0;


        for(PortfolioData data : portfolio) {


            if(data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                total += data.getTransactionAmount();

                count++;

            }

        }


        return count == 0
                ? 0
                : total / count;

    }








    public PortfolioAnalysisResponse analyzePortfolio(
            List<PortfolioData> portfolio) {


        if(portfolio.isEmpty()) {

            return null;

        }



        PortfolioData customer =
                portfolio.get(0);



        double invested =
                calculateTotalInvestment(portfolio);



        double sold =
                calculateTotalSellValue(portfolio);



        double currentValue =
                calculateCurrentValue(portfolio);



        double profitLoss =
                currentValue - invested;



        double returnPercentage =
                invested == 0
                        ?
                        0
                        :
                        (profitLoss / invested) * 100;



        return new PortfolioAnalysisResponse(

                customer.getCustomerId(),

                customer.getCustomerName(),

                customer.getRiskLevel(),

                invested,

                sold,

                currentValue,

                getCurrentStockPrices(portfolio),

                Math.max(profitLoss,0),

                Math.max(-profitLoss,0),

                profitLoss,

                returnPercentage,

                calculateCurrentHoldings(portfolio),

                calculateTotalTransactions(portfolio),

                calculateBuyTransactions(portfolio),

                calculateSellTransactions(portfolio),

                calculateUniqueStocks(portfolio),

                calculateAverageInvestment(portfolio),

                calculateMarketDistribution(portfolio)

        );

    }

}