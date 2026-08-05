package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.AssetHolding;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class AssetHoldingRowMapper implements RowMapper<AssetHolding> {

    @Override
    public AssetHolding mapRow(ResultSet resultSet, int rowNumber) throws SQLException {
        Long holdingId = resultSet.getLong("holding_id");
        Long customerId = resultSet.getLong("customer_id");
        Long stockId = resultSet.getLong("stock_id");
        Double quantity = resultSet.getDouble("quantity");

        return new AssetHolding(holdingId, customerId, stockId, quantity);
    }
}

