package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.ChartDataPoint;
import com.Beyond404.Portfolio.app.model.ChartDataResponse;
import com.Beyond404.Portfolio.app.service.MarketDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ChartDataController.class)
class ChartDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MarketDataService marketDataService;

    @Test
    void getChartData_returnsOk_forValidRange() throws Exception {
        ChartDataResponse response = new ChartDataResponse();
        response.setTickerId("AAPL");
        response.setCompanyName("Apple Inc.");
        response.setCurrency("USD");
        response.setCurrentPrice(189.50);
        response.setPreviousClose(182.30);

        response.setRanges(Map.of(
                "1D", List.of(new ChartDataPoint("2026-08-05T10:00:00Z", "10:00 AM", 189.50, 1200000L))
        ));

        when(marketDataService.getChartData("AAPL", "1D")).thenReturn(response);

        mockMvc.perform(get("/api/chart-data/AAPL").param("range", "1D"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tickerId").value("AAPL"))
                .andExpect(jsonPath("$.companyName").value("Apple Inc."))
                .andExpect(jsonPath("$.currentPrice").value(189.5))
                .andExpect(jsonPath("$.ranges.1D[0].price").value(189.5));
    }

    @Test
    void getChartData_returnsBadRequest_forInvalidRange() throws Exception {
        when(marketDataService.getChartData("AAPL", "10Y"))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Range must be one of: 1D, 1W, 1M, 1Y"));

        mockMvc.perform(get("/api/chart-data/AAPL").param("range", "10Y"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getChartData_returnsNotFound_forUnknownTicker() throws Exception {
        when(marketDataService.getChartData("ZZZZ", "1D"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticker not found: ZZZZ"));

        mockMvc.perform(get("/api/chart-data/ZZZZ").param("range", "1D"))
                .andExpect(status().isNotFound());
    }
}
