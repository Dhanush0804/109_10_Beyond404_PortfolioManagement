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

        long stockId = resultSet.getLong("stock_id");
        String companyName = resultSet.getString("company_name");
        String sector = resultSet.getString("sector");

        return new Stocks(stockId, companyName, sector);
    }
}
