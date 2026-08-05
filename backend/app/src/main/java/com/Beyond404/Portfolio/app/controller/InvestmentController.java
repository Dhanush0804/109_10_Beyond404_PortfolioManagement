package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Investment;
import com.Beyond404.Portfolio.app.model.InvestmentPageResponse;
import com.Beyond404.Portfolio.app.model.StockTransactionRequest;
import com.Beyond404.Portfolio.app.model.StockTransactionResponse;
import com.Beyond404.Portfolio.app.service.InvestmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public ArrayList<Investment> getInvestments(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long stockId) {

        if (customerId != null && stockId != null) {
            return investmentService.getInvestmentsByCustomerAndStock(customerId, stockId);
        }

        if (customerId != null) {
            return investmentService.getInvestmentsByCustomer(customerId);
        }

        return investmentService.getAllInvestments();
    }

    @GetMapping("/history")
    public InvestmentPageResponse getInvestmentHistory(
            @RequestParam Long customerId,
            @RequestParam(required = false) Long stockId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {

        return investmentService.getPaginatedInvestments(customerId, stockId, page, size);
    }

    @GetMapping("/{investmentId}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long investmentId) {

        Investment investment = investmentService.findById(investmentId);

        if (investment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(investment);
    }

    @PostMapping
    public ResponseEntity<Investment> createInvestment(@RequestBody Investment investment) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(investmentService.createInvestment(investment));
    }

    @PostMapping("/buy-stock")
    public ResponseEntity<StockTransactionResponse> buyStock(@RequestBody StockTransactionRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(investmentService.buyStock(request));
    }

    @PostMapping("/sell-stock")
    public ResponseEntity<StockTransactionResponse> sellStock(@RequestBody StockTransactionRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(investmentService.sellStock(request));
    }

    @PutMapping("/{investmentId}")
    public ResponseEntity<Investment> updateInvestment(
            @PathVariable Long investmentId,
            @RequestBody Investment investment) {

        if (!investmentService.updateInvestment(investmentId, investment)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(investmentService.findById(investmentId));
    }

    @DeleteMapping("/{investmentId}")
    public ResponseEntity<String> deleteInvestment(@PathVariable Long investmentId) {

        if (!investmentService.deleteInvestment(investmentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(
                "Investment with id " + investmentId + " deleted successfully."
        );
    }
}

