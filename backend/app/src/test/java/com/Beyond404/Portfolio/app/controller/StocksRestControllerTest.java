package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Stocks;
import com.Beyond404.Portfolio.app.service.StocksService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StocksRestController.class)
class StocksRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StocksService stocksService;

    @Test
    void getAllStocks_returnsOk() throws Exception {
        ArrayList<Stocks> list = new ArrayList<>();
        list.add(new Stocks(1L, "Apple Inc.", "AAPL", "NASDAQ"));

        when(stocksService.getAllStocksS()).thenReturn(list);

        mockMvc.perform(get("/beyond404/stocks/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockId").value(1))
                .andExpect(jsonPath("$[0].ticker").value("AAPL"));
    }

    @Test
    void findById_returnsOk_whenExists() throws Exception {
        when(stocksService.findById(1L)).thenReturn(new Stocks(1L, "Apple Inc.", "AAPL", "NASDAQ"));

        mockMvc.perform(get("/beyond404/stocks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockId").value(1))
                .andExpect(jsonPath("$.stockName").value("Apple Inc."));
    }

    @Test
    void findById_returnsNotFound_whenMissing() throws Exception {
        when(stocksService.findById(404L)).thenReturn(null);

        mockMvc.perform(get("/beyond404/stocks/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void findByTicker_returnsOk_whenExists() throws Exception {
        when(stocksService.findByTicker("AAPL")).thenReturn(new Stocks(1L, "Apple Inc.", "AAPL", "NASDAQ"));

        mockMvc.perform(get("/beyond404/stocks/ticker/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("AAPL"));
    }

    @Test
    void findByTicker_returnsNotFound_whenMissing() throws Exception {
        when(stocksService.findByTicker("ZZZZ")).thenReturn(null);

        mockMvc.perform(get("/beyond404/stocks/ticker/ZZZZ"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createStock_returnsCreated() throws Exception {
        String requestJson = """
                {
                  \"stockId\": 99,
                  \"stockName\": \"Test Corp\",
                  \"ticker\": \"TEST\",
                  \"stockMarket\": \"NASDAQ\"
                }
                """;

        when(stocksService.createStock(any(Stocks.class))).thenReturn(new Stocks(99L, "Test Corp", "TEST", "NASDAQ"));

        mockMvc.perform(post("/beyond404/stocks/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stockId").value(99))
                .andExpect(jsonPath("$.ticker").value("TEST"));
    }

    @Test
    void updateStock_returnsOk_whenUpdated() throws Exception {
        String requestJson = """
                {
                  \"stockId\": 1,
                  \"stockName\": \"Apple Inc. Updated\",
                  \"ticker\": \"AAPL\",
                  \"stockMarket\": \"NASDAQ\"
                }
                """;

        when(stocksService.updateStock(any(Long.class), any(Stocks.class))).thenReturn(true);
        when(stocksService.findById(1L)).thenReturn(new Stocks(1L, "Apple Inc. Updated", "AAPL", "NASDAQ"));

        mockMvc.perform(put("/beyond404/stocks/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockName").value("Apple Inc. Updated"));
    }

    @Test
    void updateStock_returnsNotFound_whenMissing() throws Exception {
        String requestJson = """
                {
                  \"stockId\": 404,
                  \"stockName\": \"Missing\",
                  \"ticker\": \"MISS\",
                  \"stockMarket\": \"NASDAQ\"
                }
                """;

        when(stocksService.updateStock(any(Long.class), any(Stocks.class))).thenReturn(false);

        mockMvc.perform(put("/beyond404/stocks/update/404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteStock_returnsOk_whenDeleted() throws Exception {
        when(stocksService.deleteStock(1L)).thenReturn(true);

        mockMvc.perform(delete("/beyond404/stocks/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Stock with id 1 deleted successfully."));
    }

    @Test
    void deleteStock_returnsNotFound_whenMissing() throws Exception {
        when(stocksService.deleteStock(404L)).thenReturn(false);

        mockMvc.perform(delete("/beyond404/stocks/delete/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void findByMarket_returnsOk() throws Exception {
        ArrayList<Stocks> list = new ArrayList<>();
        list.add(new Stocks(1L, "Apple Inc.", "AAPL", "NASDAQ"));

        when(stocksService.findByMarket("NASDAQ")).thenReturn(list);

        mockMvc.perform(get("/beyond404/stocks/market").param("market", "NASDAQ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockMarket").value("NASDAQ"));
    }

    @Test
    void findByStockName_returnsOk() throws Exception {
        ArrayList<Stocks> list = new ArrayList<>();
        list.add(new Stocks(1L, "Apple Inc.", "AAPL", "NASDAQ"));

        when(stocksService.findByStockName("Apple")).thenReturn(list);

        mockMvc.perform(get("/beyond404/stocks/market/name").param("stockName", "Apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockName").value("Apple Inc."));
    }
}
