package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.StockwiseAnalytics;
import com.Beyond404.Portfolio.app.service.StockWiseAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StockWiseAnalyticsController.class)
class StockWiseAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StockWiseAnalyticsService stockWiseAnalyticsService;

    @Test
    void getStockWise_returnsOk_withCustomerData() throws Exception {
        ArrayList<StockwiseAnalytics> list = new ArrayList<>();

        StockwiseAnalytics row = new StockwiseAnalytics();
        row.setStockId(14L);
        row.setTicker("KO");
        row.setCompanyName("Coca-Cola Company");
        row.setInvested(60000);
        row.setCurrentValue(2597);
        row.setPnl(-57403);
        row.setPnlPercent(new BigDecimal("-95.67"));
        row.setLastPrice(new BigDecimal("86.56"));
        row.setPrevPrice(new BigDecimal("86.86"));
        row.setMarketCap("");
        row.setVolume("50.0000");
        list.add(row);

        when(stockWiseAnalyticsService.getStockWiseAnalytics(2L)).thenReturn(list);

        mockMvc.perform(
                        get("/api/portfolio-analytics/stock-wise")
                                .param("customerId", "2")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockId").value(14))
                .andExpect(jsonPath("$[0].ticker").value("KO"))
                .andExpect(jsonPath("$[0].companyName").value("Coca-Cola Company"))
                .andExpect(jsonPath("$[0].invested").value(60000))
                .andExpect(jsonPath("$[0].currentValue").value(2597))
                .andExpect(jsonPath("$[0].pnl").value(-57403))
                .andExpect(jsonPath("$[0].pnlPercent").value(-95.67))
                .andExpect(jsonPath("$[0].lastPrice").value(86.56))
                .andExpect(jsonPath("$[0].prevPrice").value(86.86))
                .andExpect(jsonPath("$[0].marketCap").value(""))
                .andExpect(jsonPath("$[0].volume").value("50.0000"));
    }

    @Test
    void getStockWise_returnsOk_withEmptyList() throws Exception {
        when(stockWiseAnalyticsService.getStockWiseAnalytics(999L)).thenReturn(new ArrayList<>());

        mockMvc.perform(
                        get("/api/portfolio-analytics/stock-wise")
                                .param("customerId", "999")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
