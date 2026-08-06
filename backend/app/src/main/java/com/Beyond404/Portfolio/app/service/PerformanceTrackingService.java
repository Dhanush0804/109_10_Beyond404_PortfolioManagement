package com.Beyond404.Portfolio.app.service;


import com.Beyond404.Portfolio.app.model.ChartDataPoint;
import com.Beyond404.Portfolio.app.model.ChartDataResponse;
import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.model.PortfolioPerformancePoint;
import com.Beyond404.Portfolio.app.model.PortfolioPerformanceResponse;
import com.Beyond404.Portfolio.app.model.StockPerformancePoint;
import com.Beyond404.Portfolio.app.repository.PortfolioAnalysisRepository;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;


@Service
public class PerformanceTrackingService {


    private final PortfolioAnalysisRepository portfolioAnalysisRepository;

    private final MarketDataService marketDataService;


    public PerformanceTrackingService(
            PortfolioAnalysisRepository portfolioAnalysisRepository,
            MarketDataService marketDataService) {


        this.portfolioAnalysisRepository =
                portfolioAnalysisRepository;

        this.marketDataService =
                marketDataService;

    }


    /*
     * Complete portfolio growth graph
     */
    public PortfolioPerformanceResponse getPortfolioPerformance(
            Long customerId,
            String range) {


        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository
                        .getCustomerPortfolio(customerId);

        Map<String, PortfolioData> stockMap =
                createStockMap(portfolio);

        if(portfolio.isEmpty()) {
            return null;
        }



        LocalDate startDate =
                portfolio.stream()
                        .map(
                                p -> p.getTransactionTimestamp()
                                        .toLocalDate()
                        )
                        .min(
                                LocalDate::compareTo
                        )
                        .orElse(
                                LocalDate.now()
                        );



        List<LocalDate> timeline =
                generateTimeline(
                        startDate,
                        range
                );



        List<PortfolioPerformancePoint> result =
                new ArrayList<>();



//        double totalInvested =
//                calculateTotalInvested(portfolio);



        for(LocalDate date : timeline) {


            Map<String, Double> holdings =
                    calculateHoldingsUntilDate(
                            portfolio,
                            date
                    );

            double invested =
                    calculateInvestedAmountUntilDate(
                            portfolio,
                            date
                    );

            double portfolioValue = 0;



            for(String ticker : holdings.keySet()) {


                double quantity =
                        holdings.get(ticker);



                if(quantity <= 0) {
                    continue;
                }



                PortfolioData stock =
                        stockMap.get(
                                ticker.toUpperCase()
                        );



                if(stock == null) {
                    continue;
                }



                Double price =
                        getHistoricalPriceWithFallback(
                                ticker,
                                date
                        );



                if(price == null) {
                    continue;
                }



                double value =
                        quantity * price;



                portfolioValue += value;

            }



            double profitLoss =
                    portfolioValue - invested;


            double returnPercentage =
                    invested == 0
                            ? 0
                            :
                            (profitLoss / invested) * 100;



            result.add(
                    new PortfolioPerformancePoint(
                            date,
                            portfolioValue,
                            invested,
                            profitLoss,
                            returnPercentage
                    )
            );

        }



        Map<String, Double> summary =
                new HashMap<>();


        double currentValue =
                result.isEmpty()
                        ? 0
                        :
                        result.get(result.size() - 1)
                                .getPortfolioValue();



        double currentInvested =
                calculateInvestedAmountUntilDate(
                        portfolio,
                        LocalDate.now()
                );



        double currentProfitLoss =
                currentValue - currentInvested;



        double currentReturnPercentage =
                currentInvested == 0
                        ? 0
                        :
                        (currentProfitLoss / currentInvested) * 100;



        summary.put(
                "totalInvested",
                currentInvested
        );



        summary.put(
                "currentValue",
                currentValue
        );



        summary.put(
                "profitLoss",
                currentProfitLoss
        );



        summary.put(
                "returnPercentage",
                currentReturnPercentage
        );



        return new PortfolioPerformanceResponse(
                customerId,
                "USD",
                summary,
                result
        );

    }

    private Map<String, PortfolioData> createStockMap(
            List<PortfolioData> portfolio) {


        Map<String, PortfolioData> stockMap =
                new HashMap<>();


        for(PortfolioData data : portfolio) {


            stockMap.put(
                    data.getTicker()
                            .toUpperCase(),
                    data
            );

        }


        return stockMap;
    }

    private Double getHistoricalPriceWithFallback(
            String ticker,
            LocalDate date) {


        /*
         * Step 1:
         * Try original ticker
         * with nearby dates
         */
        Double price =
                getNearestHistoricalPrice(
                        ticker,
                        date
                );


        if(price != null) {

            return price;

        }



        /*
         * Step 2:
         * If .BO failed,
         * try corresponding .NS
         *
         * Example:
         * RELIANCE.BO
         *        |
         *        ↓
         * RELIANCE.NS
         */
        if(ticker.endsWith(".BO")) {


            String nsTicker =
                    ticker.replace(
                            ".BO",
                            ".NS"
                    );


            price =
                    getNearestHistoricalPrice(
                            nsTicker,
                            date
                    );


            if(price != null) {

                return price;

            }

        }



        /*
         * Step 3:
         * If .NS failed,
         * try corresponding .BO
         *
         * Example:
         * RELIANCE.NS
         *        |
         *        ↓
         * RELIANCE.BO
         */
        if(ticker.endsWith(".NS")) {


            String boTicker =
                    ticker.replace(
                            ".NS",
                            ".BO"
                    );


            price =
                    getNearestHistoricalPrice(
                            boTicker,
                            date
                    );


            if(price != null) {

                return price;

            }

        }



        return null;

    }

    private Double getNearestHistoricalPrice(
            String ticker,
            LocalDate date) {


        int[] offsets = {

                0,

                -1,
                1,

                -2,
                2,

                -3,
                3,

                -7,
                7

        };


        for(int offset : offsets) {


            LocalDate adjustedDate =
                    date.plusDays(offset);



            try {


                Double price =
                        marketDataService
                                .getHistoricalPrice(
                                        ticker,
                                        adjustedDate.atStartOfDay()
                                );



                if(price != null) {

                    return price;

                }


            }
            catch(Exception e) {


                // Ignore failed date
                // continue searching

            }

        }


        return null;

    }


    /*
     * Individual stock performance
     */
    public List<StockPerformancePoint> getStockPerformance(
            Long customerId,
            String ticker,
            String range) {


        ArrayList<PortfolioData> portfolio =
                portfolioAnalysisRepository
                        .getCustomerPortfolio(customerId);



        List<StockPerformancePoint> result =
                new ArrayList<>();



        if(portfolio.isEmpty()) {

            return result;

        }



        // Find first transaction date for this stock
        LocalDate startDate =
                portfolio.stream()
                        .filter(
                                p -> p.getTicker()
                                        .equalsIgnoreCase(ticker)
                        )
                        .map(
                                p -> p.getTransactionTimestamp()
                                        .toLocalDate()
                        )
                        .min(
                                LocalDate::compareTo
                        )
                        .orElse(
                                LocalDate.now()
                        );



        List<LocalDate> timeline =
                generateTimeline(
                        startDate,
                        range
                );



        for(LocalDate date : timeline) {


            double quantity =
                    calculateStockQuantityUntilDate(
                            portfolio,
                            ticker,
                            date
                    );



            // No holding yet
            if(quantity <= 0) {

                continue;

            }



            Double stockPrice =
                    getHistoricalPriceWithFallback(
                            ticker,
                            date
                    );



            if(stockPrice == null) {

                continue;

            }



            double holdingValue =
                    quantity *
                            stockPrice;



            double investedAmount =
                    calculateStockInvestedAmountUntilDate(
                            portfolio,
                            ticker,
                            date
                    );



            double profitLoss =
                    holdingValue -
                            investedAmount;

            double returnPercentage =
                    investedAmount == 0
                            ? 0
                            :
                            (profitLoss / investedAmount) * 100;



            result.add(
                    new StockPerformancePoint(
                            date,
                            ticker,
                            quantity,
                            stockPrice,
                            holdingValue,
                            investedAmount,
                            profitLoss,
                            returnPercentage
                    )
            );

        }



        return result;

    }


    private Map<String, Double> calculateCurrentHoldings(
            List<PortfolioData> portfolio) {


        Map<String, Double> holdings =
                new HashMap<>();


        for (PortfolioData data : portfolio) {


            double qty =
                    data.getQuantity();


            if (data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                holdings.put(
                        data.getTicker(),
                        holdings.getOrDefault(
                                data.getTicker(),
                                0.0
                        )
                                +
                                qty
                );

            } else {


                holdings.put(
                        data.getTicker(),
                        holdings.getOrDefault(
                                data.getTicker(),
                                0.0
                        )
                                -
                                qty
                );

            }

        }


        return holdings;

    }


    private double calculateStockQuantity(
            List<PortfolioData> portfolio,
            String ticker) {


        double quantity = 0;


        for (PortfolioData data : portfolio) {


            if (data.getTicker()
                    .equalsIgnoreCase(ticker)) {


                if (data.getTransactionType()
                        .equalsIgnoreCase("BUY")) {


                    quantity += data.getQuantity();

                } else {

                    quantity -= data.getQuantity();

                }

            }

        }


        return quantity;

    }


    private double calculateStockInvestment(
            List<PortfolioData> portfolio,
            String ticker) {


        double amount = 0;


        for (PortfolioData data : portfolio) {


            if (data.getTicker()
                    .equalsIgnoreCase(ticker)
                    &&
                    data.getTransactionType()
                            .equalsIgnoreCase("BUY")) {


                Double historicalPrice =
                        marketDataService.getHistoricalPrice(
                                ticker,
                                data.getTransactionTimestamp()
                        );


                if (historicalPrice != null) {


                    amount +=
                            historicalPrice *
                                    data.getQuantity();

                }

            }

        }


        return amount;

    }


    private double calculateTotalInvested(
            List<PortfolioData> portfolio) {


        double total = 0;


        for (PortfolioData data : portfolio) {


            if (data.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                Double historicalPrice =
                        marketDataService.getHistoricalPrice(
                                data.getTicker(),
                                data.getTransactionTimestamp()
                        );


                if (historicalPrice != null) {


                    total +=
                            historicalPrice *
                                    data.getQuantity();

                }

            }

        }


        return total;

    }

    private Map<String, Double> calculateHoldingsUntilDate(
            List<PortfolioData> portfolio,
            LocalDate date) {


        Map<String, Double> holdings =
                new HashMap<>();


        for (PortfolioData transaction : portfolio) {


            LocalDate transactionDate =
                    transaction.getTransactionTimestamp()
                            .toLocalDate();



            if(transactionDate.isAfter(date)) {

                continue;

            }



            String ticker =
                    transaction.getTicker();



            double quantity =
                    transaction.getQuantity();



            if(transaction.getTransactionType()
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

    private List<LocalDate> generateTimeline(
            LocalDate startDate,
            String range) {


        List<LocalDate> dates =
                new ArrayList<>();


        LocalDate today =
                LocalDate.now();


        LocalDate current =
                startDate;



        while (!current.isAfter(today)) {


            dates.add(current);



            switch(range.toUpperCase()) {


                case "WEEKLY":

                    current =
                            current.plusWeeks(1);

                    break;



                case "MONTHLY":

                    current =
                            current.plusMonths(1);

                    break;



                case "YEARLY":

                    current =
                            current.plusYears(1);

                    break;



                default:

                    current =
                            current.plusMonths(1);

            }

        }



        /*
         * Add today's point if the next interval
         * has not completed yet
         */
        if (!dates.isEmpty()) {


            LocalDate lastDate =
                    dates.get(
                            dates.size() - 1
                    );


            if (!lastDate.equals(today)
                    &&
                    lastDate.isBefore(today)) {


                dates.add(today);

            }

        }


        return dates;

    }

    private double calculateInvestedAmountUntilDate(
            List<PortfolioData> portfolio,
            LocalDate date) {


        double invested = 0;


        for (PortfolioData transaction : portfolio) {


            LocalDate transactionDate =
                    transaction.getTransactionTimestamp()
                            .toLocalDate();


            if (transactionDate.isAfter(date)) {
                continue;
            }



            Double price =
                    getHistoricalPriceWithFallback(
                            transaction.getTicker(),
                            transactionDate
                    );


            if (price == null) {
                continue;
            }



            double amount =
                    price * transaction.getQuantity();



            if (transaction.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                invested += amount;


            } else {


                invested -= amount;

            }

        }


        return invested;

    }

    private double calculateStockQuantityUntilDate(
            List<PortfolioData> portfolio,
            String ticker,
            LocalDate date) {


        double quantity = 0;


        for(PortfolioData transaction : portfolio) {


            if(!transaction.getTicker()
                    .equalsIgnoreCase(ticker)) {

                continue;

            }


            LocalDate transactionDate =
                    transaction.getTransactionTimestamp()
                            .toLocalDate();



            if(transactionDate.isAfter(date)) {

                continue;

            }



            if(transaction.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                quantity += transaction.getQuantity();


            }
            else {


                quantity -= transaction.getQuantity();

            }

        }


        return quantity;

    }

    private double calculateStockInvestedAmountUntilDate(
            List<PortfolioData> portfolio,
            String ticker,
            LocalDate date) {


        double invested = 0;


        for (PortfolioData transaction : portfolio) {


            if (!transaction.getTicker()
                    .equalsIgnoreCase(ticker)) {

                continue;
            }



            LocalDate transactionDate =
                    transaction.getTransactionTimestamp()
                            .toLocalDate();



            if (transactionDate.isAfter(date)) {

                continue;

            }



            Double price =
                    getHistoricalPriceWithFallback(
                            ticker,
                            transactionDate
                    );


            if(price == null) {

                continue;

            }



            double amount =
                    price *
                            transaction.getQuantity();



            if(transaction.getTransactionType()
                    .equalsIgnoreCase("BUY")) {


                invested += amount;


            }
            else {


                invested -= amount;

            }

        }


        return invested;

    }
}