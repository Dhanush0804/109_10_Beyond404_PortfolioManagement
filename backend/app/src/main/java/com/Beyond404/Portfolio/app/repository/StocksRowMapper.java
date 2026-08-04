package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Stocks;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class StocksRowMapper implements RowMapper<Stocks> {

    @Override
    public Stocks mapRow(ResultSet resultSet, int rowNumber) throws SQLException {

        long stockId=resultSet.getLong("stock_id");

        String stockName=resultSet.getString("stock_name");

        String ticker=resultSet.getString("ticker");

        String stockMarket=resultSet.getString("stock_market");

        return new Stocks(
                stockId,
                stockName,
                ticker,
                stockMarket
        );
    }
}
