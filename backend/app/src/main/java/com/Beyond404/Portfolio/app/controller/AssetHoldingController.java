package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.AssetHolding;
import com.Beyond404.Portfolio.app.service.AssetHoldingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/asset-holdings")
public class AssetHoldingController {

    private final AssetHoldingService assetHoldingService;

    public AssetHoldingController(AssetHoldingService assetHoldingService) {
        this.assetHoldingService = assetHoldingService;
    }

    @GetMapping("/customer/{customer_id}")
    public ArrayList<AssetHolding> getByCustomerId(@PathVariable("customer_id") Long customerId) {
        return assetHoldingService.findByCustomerId(customerId);
    }

    @GetMapping("/customer/{customer_id}/stock/{stock_id}")
    public ResponseEntity<AssetHolding> getByCustomerIdAndStockId(
            @PathVariable("customer_id") Long customerId,
            @PathVariable("stock_id") Long stockId) {

        AssetHolding assetHolding = assetHoldingService.findByCustomerIdAndStockId(customerId, stockId);

        if (assetHolding == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(assetHolding);
    }

    @PostMapping
    public ResponseEntity<AssetHolding> createAssetHolding(@RequestBody AssetHolding assetHolding) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assetHoldingService.createAssetHolding(assetHolding));
    }

    @PutMapping("/{holdingId}")
    public ResponseEntity<AssetHolding> updateAssetHolding(
            @PathVariable Long holdingId,
            @RequestBody AssetHolding assetHolding) {

        if (!assetHoldingService.updateAssetHolding(holdingId, assetHolding)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(assetHoldingService.findById(holdingId));
    }

    @DeleteMapping("/{holdingId}")
    public ResponseEntity<String> deleteAssetHolding(@PathVariable Long holdingId) {
        if (!assetHoldingService.deleteAssetHolding(holdingId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok("Asset holding with id " + holdingId + " deleted successfully.");
    }
}
