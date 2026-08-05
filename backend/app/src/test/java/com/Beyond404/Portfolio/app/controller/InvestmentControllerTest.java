package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Investment;
import com.Beyond404.Portfolio.app.service.InvestmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = InvestmentController.class)
class InvestmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InvestmentService investmentService;

    @Test
    void getAllInvestments_returnsOk() throws Exception {
        ArrayList<Investment> list = new ArrayList<>();
        list.add(new Investment(1L, 1L, 1L, "BUY", new BigDecimal("1500.00"), new BigDecimal("10.0000"), Timestamp.valueOf("2026-01-01 10:00:00")));

        when(investmentService.getAllInvestments()).thenReturn(list);

        mockMvc.perform(get("/api/investments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assetId").value(1))
                .andExpect(jsonPath("$[0].transactionType").value("BUY"));
    }

    @Test
    void getInvestmentById_returnsOk_whenExists() throws Exception {
        Investment inv = new Investment(2L, 1L, 4L, "SELL", new BigDecimal("1200.00"), new BigDecimal("5.0000"), Timestamp.valueOf("2026-01-02 10:00:00"));

        when(investmentService.findById(2L)).thenReturn(inv);

        mockMvc.perform(get("/api/investments/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetId").value(2))
                .andExpect(jsonPath("$.transactionType").value("SELL"));
    }

    @Test
    void getInvestmentById_returnsNotFound_whenMissing() throws Exception {
        when(investmentService.findById(404L)).thenReturn(null);

        mockMvc.perform(get("/api/investments/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createInvestment_returnsCreated() throws Exception {
        String requestJson = """
                {
                  \"customerId\": 1,
                  \"stockId\": 1,
                  \"transactionType\": \"BUY\",
                  \"transactionAmount\": 1500.00
                }
                """;

        Investment created = new Investment(10L, 1L, 1L, "BUY", new BigDecimal("1500.00"), new BigDecimal("10.0000"), Timestamp.valueOf("2026-01-03 10:00:00"));

        when(investmentService.createInvestment(any(Investment.class))).thenReturn(created);

        mockMvc.perform(post("/api/investments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetId").value(10))
                .andExpect(jsonPath("$.transactionType").value("BUY"));
    }

    @Test
    void updateInvestment_returnsOk_whenUpdated() throws Exception {
        String requestJson = """
                {
                  \"customerId\": 1,
                  \"stockId\": 2,
                  \"transactionType\": \"SELL\",
                  \"transactionAmount\": 1800.00
                }
                """;

        Investment updated = new Investment(5L, 1L, 2L, "SELL", new BigDecimal("1800.00"), new BigDecimal("7.0000"), Timestamp.valueOf("2026-01-04 10:00:00"));

        when(investmentService.updateInvestment(any(Long.class), any(Investment.class))).thenReturn(true);
        when(investmentService.findById(5L)).thenReturn(updated);

        mockMvc.perform(put("/api/investments/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetId").value(5))
                .andExpect(jsonPath("$.transactionType").value("SELL"));
    }

    @Test
    void updateInvestment_returnsNotFound_whenMissing() throws Exception {
        String requestJson = """
                {
                  \"customerId\": 1,
                  \"stockId\": 2,
                  \"transactionType\": \"SELL\",
                  \"transactionAmount\": 1800.00
                }
                """;

        when(investmentService.updateInvestment(any(Long.class), any(Investment.class))).thenReturn(false);

        mockMvc.perform(put("/api/investments/404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteInvestment_returnsOk_whenDeleted() throws Exception {
        when(investmentService.deleteInvestment(7L)).thenReturn(true);

        mockMvc.perform(delete("/api/investments/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Investment with id 7 deleted successfully."));
    }

    @Test
    void deleteInvestment_returnsNotFound_whenMissing() throws Exception {
        when(investmentService.deleteInvestment(404L)).thenReturn(false);

        mockMvc.perform(delete("/api/investments/404"))
                .andExpect(status().isNotFound());
    }
}
