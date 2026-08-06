package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.AlgoRunRequest;
import com.Beyond404.Portfolio.app.model.AlgoRunResponse;
import com.Beyond404.Portfolio.app.service.AlgoTradingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/algo")
public class AlgoTradingController {

    private final AlgoTradingService algoTradingService;

    public AlgoTradingController(AlgoTradingService algoTradingService) {
        this.algoTradingService = algoTradingService;
    }

    @PostMapping("/run-once")
    public ResponseEntity<?> runOnce(@RequestBody AlgoRunRequest request) {
        try {
            AlgoRunResponse response = algoTradingService.runOnce(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (ArithmeticException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid customerId range");
        }
    }
}