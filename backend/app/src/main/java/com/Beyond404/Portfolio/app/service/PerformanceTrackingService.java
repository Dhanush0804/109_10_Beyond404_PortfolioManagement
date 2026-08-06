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



        Map<LocalDate, Double> portfolioValues =
                new HashMap<>();



        Map<String, Double> holdings =
                calculateCurrentHoldings(portfolio);



        double investedAmount =
                calculateTotalInvested(portfolio);



        for (String ticker : holdings.keySet()) {


            Double quantity =
                    holdings.get(ticker);



            ChartDataResponse response =
                    marketDataService
                            .getChartData(
                                    ticker,
                                    range
                            );


            if (response == null) {
                continue;
            }



            List<ChartDataPoint> points =
                    response.getRanges()
                            .get(range);



            if (points == null) {
                continue;
            }



            for (ChartDataPoint point : points) {


                LocalDate date =
                        OffsetDateTime
                                .parse(
                                        point.getTimestamp()
                                )
                                .toLocalDate();



                double value =
                        quantity *
                                point.getPrice();



                portfolioValues.put(
                        date,
                        portfolioValues.getOrDefault(
                                date,
                                0.0
                        )
                                +
                                value
                );

            }

        }




        List<PortfolioPerformancePoint> result =
                new ArrayList<>();



        for (LocalDate date : portfolioValues.keySet()) {


            double value =
                    portfolioValues.get(date);



            double profit =
                    value - investedAmount;



            double returnPercentage =
                    investedAmount == 0
                            ? 0
                            :
                            (profit / investedAmount) * 100;



            result.add(
                    new PortfolioPerformancePoint(
                            date,
                            value,
                            investedAmount,
                            profit,
                            returnPercentage
                    )
            );

        }



        // Sort data chronologically for graph plotting
        result.sort(
                Comparator.comparing(
                        PortfolioPerformancePoint::getDate
                )
        );



        double currentValue =
                result.isEmpty()
                        ? 0
                        :
                        result.get(result.size() - 1)
                                .getPortfolioValue();



        double profitLoss =
                currentValue - investedAmount;



        double returnPercentage =
                investedAmount == 0
                        ? 0
                        :
                        (profitLoss / investedAmount) * 100;



        Map<String, Double> summary =
                new HashMap<>();



        summary.put(
                "totalInvested",
                investedAmount
        );


        summary.put(
                "currentValue",
                currentValue
        );


        summary.put(
                "profitLoss",
                profitLoss
        );


        summary.put(
                "returnPercentage",
                returnPercentage
        );



        return new PortfolioPerformanceResponse(
                customerId,
                "USD",
                summary,
                result
        );

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


        double quantity =
                calculateStockQuantity(
                        portfolio,
                        ticker
                );


        double invested =
                calculateStockInvestment(
                        portfolio,
                        ticker
                );


        ChartDataResponse response =
                marketDataService
                        .getChartData(
                                ticker,
                                range
                        );


        List<StockPerformancePoint> result =
                new ArrayList<>();


        if (response == null ||
                response.getRanges()
                        .get("1Y") == null) {

            return result;

        }


        for (ChartDataPoint point :
                response.getRanges()
                        .get("1Y")) {


            LocalDate date =
                    OffsetDateTime
                            .parse(
                                    point.getTimestamp()
                            )
                            .toLocalDate();


            double value =
                    quantity *
                            point.getPrice();


            result.add(
                    new StockPerformancePoint(
                            date,
                            ticker,
                            quantity,
                            point.getPrice(),
                            value,
                            invested,
                            value - invested
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
}