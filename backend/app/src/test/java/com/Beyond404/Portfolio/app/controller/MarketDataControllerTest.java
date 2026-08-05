package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.MarketQuote;
import com.Beyond404.Portfolio.app.model.MarketSearchResponse;
import com.Beyond404.Portfolio.app.model.MarketSearchResult;
import com.Beyond404.Portfolio.app.service.MarketDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MarketDataController.class)
class MarketDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MarketDataService marketDataService;

    @Test
    void searchSymbols_returnsOk_withResults() throws Exception {
        List<MarketSearchResult> results = List.of(
                new MarketSearchResult("AAPL", "Apple Inc.", "NASDAQ", "EQUITY", "NASDAQ")
        );

        MarketSearchResponse response = new MarketSearchResponse("apple", results, 1);

        when(marketDataService.searchSymbols("apple")).thenReturn(response);

        mockMvc.perform(get("/api/market/search").param("companyName", "apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("apple"))
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.results[0].symbol").value("AAPL"));
    }

    @Test
    void getQuote_returnsOk() throws Exception {
        MarketQuote quote = new MarketQuote();
        quote.setSymbol("AAPL");
        quote.setPrice(189.50);
        quote.setCurrency("USD");
        quote.setPreviousClose(182.30);
        quote.setVolume(62100000L);

        when(marketDataService.getQuote("AAPL", null)).thenReturn(quote);

        mockMvc.perform(get("/api/market/AAPL/quote"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.price").value(189.50))
            .andExpect(jsonPath("$.previous_close").value(182.30))
                .andExpect(jsonPath("$.volume").value(62100000));
    }
}
