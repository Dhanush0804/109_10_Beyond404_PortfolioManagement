package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Investment;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class InvestmentRowMapper implements RowMapper<Investment> {

    @Override
    public Investment mapRow(ResultSet resultSet, int rowNumber) throws SQLException {

        Long assetId = resultSet.getLong("asset_id");
        Long customerId = resultSet.getLong("customer_id");
        Long stockId = resultSet.getLong("stock_id");
        String transactionType = resultSet.getString("transaction_type");
        java.math.BigDecimal transactionAmount = resultSet.getBigDecimal("transaction_amount");
        java.math.BigDecimal quantity = resultSet.getBigDecimal("quantity");
        java.sql.Timestamp transactionTimestamp = resultSet.getTimestamp("transaction_timestamp");

        return new Investment(assetId, customerId, stockId, transactionType, transactionAmount, quantity, transactionTimestamp);
    }
}

