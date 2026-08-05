package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.PortfolioAnalysisResponse;
import com.Beyond404.Portfolio.app.model.PortfolioData;
import com.Beyond404.Portfolio.app.service.PortfolioAnalysisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PortfolioAnalysisRestController.class)
class PortfolioAnalysisRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PortfolioAnalysisService portfolioAnalysisService;

    @Test
    void getCustomerPortfolio_returnsOk_whenDataExists() throws Exception {
        ArrayList<PortfolioData> portfolio = new ArrayList<>();
        PortfolioData row = new PortfolioData();
        row.setCustomerId(1L);
        row.setCustomerName("Rahul Sharma");
        row.setRiskLevel("MEDIUM");
        row.setStockId(1L);
        row.setStockName("Apple Inc.");
        row.setTicker("AAPL");
        row.setStockMarket("NASDAQ");
        row.setTransactionType("BUY");
        row.setQuantity(10.0);
        row.setTransactionAmount(1500.0);
        row.setTransactionTimestamp(LocalDateTime.now());
        portfolio.add(row);

        when(portfolioAnalysisService.getCustomerPortfolio(1L)).thenReturn(portfolio);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].ticker").value("AAPL"));
    }

    @Test
    void getCustomerPortfolio_returnsNotFound_whenEmpty() throws Exception {
        when(portfolioAnalysisService.getCustomerPortfolio(99L)).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/beyond404/Portfolio/analysis/99/portfolio"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getPortfolioValue_returnsOk() throws Exception {
        when(portfolioAnalysisService.getPortfolioValue(1L)).thenReturn(12345.67);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/value"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(12345.67));
    }

    @Test
    void getTransactionCount_returnsOk() throws Exception {
        when(portfolioAnalysisService.getTransactionCount(1L)).thenReturn(12);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(12));
    }

    @Test
    void getBuyCount_returnsOk() throws Exception {
        when(portfolioAnalysisService.getBuyCount(1L)).thenReturn(9);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/buy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(9));
    }

    @Test
    void getSellCount_returnsOk() throws Exception {
        when(portfolioAnalysisService.getSellCount(1L)).thenReturn(3);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/sell"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3));
    }

    @Test
    void getCurrentHoldings_returnsOk() throws Exception {
        when(portfolioAnalysisService.getCurrentHoldings(1L)).thenReturn(52.5);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/holdings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(52.5));
    }

    @Test
    void getUniqueStocks_returnsOk() throws Exception {
        when(portfolioAnalysisService.getUniqueStocks(1L)).thenReturn(6);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/unique-stocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(6));
    }

    @Test
    void getAverageInvestment_returnsOk() throws Exception {
        when(portfolioAnalysisService.getAverageInvestment(1L)).thenReturn(10250.0);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/average-investment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(10250.0));
    }

    @Test
    void getMarketDistribution_returnsOk() throws Exception {
        Map<String, Double> distribution = new HashMap<>();
        distribution.put("NASDAQ", 60.0);
        distribution.put("NYSE", 40.0);

        when(portfolioAnalysisService.getMarketDistribution(1L)).thenReturn(distribution);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.NASDAQ").value(60.0))
                .andExpect(jsonPath("$.NYSE").value(40.0));
    }

    @Test
    void getPortfolioSummary_returnsOk_whenDataExists() throws Exception {
        Map<String, Double> prices = new HashMap<>();
        prices.put("AAPL", 189.50);

        Map<String, Double> distribution = new HashMap<>();
        distribution.put("NASDAQ", 100.0);

        PortfolioAnalysisResponse summary = new PortfolioAnalysisResponse(
                1L,
                "Rahul Sharma",
                "MEDIUM",
                "USD",
                100000.0,
                20000.0,
                120000.0,
                prices,
                25000.0,
                5000.0,
                20000.0,
                20.0,
                100.0,
                12,
                9,
                3,
                6,
                11111.0,
                distribution
        );

        when(portfolioAnalysisService.getPortfolioAnalysis(1L)).thenReturn(summary);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/1/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.customerName").value("Rahul Sharma"))
                .andExpect(jsonPath("$.totalInvested").value(100000.0));
    }

    @Test
    void getPortfolioSummary_returnsNotFound_whenNull() throws Exception {
        when(portfolioAnalysisService.getPortfolioAnalysis(99L)).thenReturn(null);

        mockMvc.perform(get("/beyond404/Portfolio/analysis/99/summary"))
                .andExpect(status().isNotFound());
    }
}
