package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class PortfolioDataRowMapper implements RowMapper<PortfolioData> {


    @Override
    public PortfolioData mapRow(
            ResultSet resultSet,
            int rowNumber) throws SQLException {


        Long customerId =
                resultSet.getLong("customer_id");


        String customerName =
                resultSet.getString("name");


        String riskLevel =
                resultSet.getString("risk_lvl");



        Long stockId =
                resultSet.getLong("stock_id");


        String stockName =
                resultSet.getString("stock_name");


        String ticker =
                resultSet.getString("ticker");


        String stockMarket =
                resultSet.getString("stock_market");



        String transactionType =
                resultSet.getString("transaction_type");


        Double quantity =
                resultSet.getDouble("quantity");



        Timestamp transactionTimestamp =
                resultSet.getTimestamp(
                        "transaction_timestamp"
                );



        return new PortfolioData(

                customerId,

                customerName,

                riskLevel,

                stockId,

                stockName,

                ticker,

                stockMarket,

                transactionType,

                quantity,

                transactionTimestamp.toLocalDateTime()

        );

    }

}