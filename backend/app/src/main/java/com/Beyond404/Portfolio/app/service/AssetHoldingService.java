package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.AssetHolding;
import com.Beyond404.Portfolio.app.repository.AssetHoldingRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AssetHoldingService {

    private final AssetHoldingRepository assetHoldingRepository;

    public AssetHoldingService(AssetHoldingRepository assetHoldingRepository) {
        this.assetHoldingRepository = assetHoldingRepository;
    }

    public ArrayList<AssetHolding> findByCustomerId(Long customerId) {
        return assetHoldingRepository.findByCustomerId(customerId);
    }

    public AssetHolding findByCustomerIdAndStockId(Long customerId, Long stockId) {
        return assetHoldingRepository.findByCustomerIdAndStockId(customerId, stockId);
    }

    public AssetHolding findById(Long holdingId) {
        return assetHoldingRepository.findById(holdingId);
    }

    public AssetHolding createAssetHolding(AssetHolding assetHolding) {
        return assetHoldingRepository.createAssetHolding(assetHolding);
    }

    public boolean updateAssetHolding(Long holdingId, AssetHolding assetHolding) {
        return assetHoldingRepository.updateAssetHolding(holdingId, assetHolding);
    }

    public boolean deleteAssetHolding(Long holdingId) {
        return assetHoldingRepository.deleteAssetHolding(holdingId);
    }
}

