package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.AssetHolding;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;

@Repository
public class AssetHoldingRepository {

    private final JdbcTemplate jdbcTemplate;
    private final AssetHoldingRowMapper assetHoldingRowMapper;

    public AssetHoldingRepository(JdbcTemplate jdbcTemplate, AssetHoldingRowMapper assetHoldingRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.assetHoldingRowMapper = assetHoldingRowMapper;
    }

    public ArrayList<AssetHolding> findByCustomerId(Long customerId) {
        return new ArrayList<>(
                jdbcTemplate.query(
                        "SELECT holding_id, customer_id, stock_id, quantity FROM assets_holdings WHERE customer_id = ? ORDER BY holding_id",
                        assetHoldingRowMapper,
                        customerId
                )
        );
    }

    public AssetHolding findByCustomerIdAndStockId(Long customerId, Long stockId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT holding_id, customer_id, stock_id, quantity FROM assets_holdings WHERE customer_id = ? AND stock_id = ?",
                    assetHoldingRowMapper,
                    customerId,
                    stockId
            );
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public AssetHolding findById(Long holdingId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT holding_id, customer_id, stock_id, quantity FROM assets_holdings WHERE holding_id = ?",
                    assetHoldingRowMapper,
                    holdingId
            );
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public AssetHolding createAssetHolding(AssetHolding assetHolding) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO assets_holdings (customer_id, stock_id, quantity) VALUES (?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );

            preparedStatement.setLong(1, assetHolding.getCustomerId());
            preparedStatement.setLong(2, assetHolding.getStockId());
            preparedStatement.setDouble(3, assetHolding.getQuantity());

            return preparedStatement;
        }, keyHolder);

        Number generatedId = keyHolder.getKey();
        if (generatedId == null) {
            throw new IllegalStateException("Failed to create asset holding: no generated holding_id returned");
        }

        assetHolding.setHoldingId(generatedId.longValue());
        return findById(assetHolding.getHoldingId());
    }

    public boolean updateAssetHolding(Long holdingId, AssetHolding assetHolding) {
        return jdbcTemplate.update(
                "UPDATE assets_holdings SET customer_id = ?, stock_id = ?, quantity = ? WHERE holding_id = ?",
                assetHolding.getCustomerId(),
                assetHolding.getStockId(),
                assetHolding.getQuantity(),
                holdingId
        ) > 0;
    }

    public boolean deleteAssetHolding(Long holdingId) {
        return jdbcTemplate.update(
                "DELETE FROM assets_holdings WHERE holding_id = ?",
                holdingId
        ) > 0;
    }
}

