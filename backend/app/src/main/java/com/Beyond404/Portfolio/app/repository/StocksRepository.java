package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Stocks;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Repository
public class StocksRepository {

    private final JdbcTemplate jdbcTemplate;
    private final StocksRowMapper stocksRowMapper;

    public StocksRepository(JdbcTemplate jdbcTemplate, StocksRowMapper stocksRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.stocksRowMapper = stocksRowMapper;
    }

    public ArrayList<Stocks> getAllStocksR() {
        return new ArrayList<>(
                jdbcTemplate.query(
                        "SELECT stock_id, company_name, sector FROM stocks ORDER BY stock_id",
                        stocksRowMapper
                )
        );
    }

    public Stocks findById(Long id) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT stock_id, company_name, sector FROM stocks WHERE stock_id=?",
                    stocksRowMapper,
                    id
            );
        }
        catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Stocks createStock(Stocks stock) {

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {

            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO stocks (company_name, sector) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );

            ps.setString(1, stock.getCompanyName());
            ps.setString(2, stock.getSector());

            return ps;

        }, keyHolder);

        stock.setStockId(keyHolder.getKey().longValue());

        return stock;
    }

    public boolean updateStock(Long id, Stocks stock) {

        return jdbcTemplate.update(
                "UPDATE stocks SET company_name=?, sector=? WHERE stock_id=?",
                stock.getCompanyName(),
                stock.getSector(),
                id
        ) > 0;
    }

    public boolean deleteStock(Long id) {

        return jdbcTemplate.update(
                "DELETE FROM stocks WHERE stock_id=?",
                id
        ) > 0;
    }

    /**
     * Finds all stocks belonging to a given sector.
     *
     * Example:
     * IT
     * Banking
     * Energy
     * FMCG
     */

    public ArrayList<Stocks> findBySector(String sector) {

        String sql = """
                SELECT stock_id, company_name, sector
                FROM stocks
                WHERE sector = ?
                ORDER BY company_name
                """;

        List<Stocks> results = jdbcTemplate.query(
                sql,
                stocksRowMapper,
                sector
        );

        return new ArrayList<>(results);
    }
}
