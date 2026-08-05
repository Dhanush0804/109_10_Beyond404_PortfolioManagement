package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Stocks;
import org.springframework.dao.EmptyResultDataAccessException;
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

    // Get all stocks
    public ArrayList<Stocks> getAllStocksR() {

        String sql = """
                SELECT
                    stock_id,
                    stock_name,
                    ticker,
                    stock_market
                FROM stocks
                ORDER BY stock_id
                """;

        return new ArrayList<>(jdbcTemplate.query(sql, stocksRowMapper));
    }

    // Get stock by ID
    public Stocks findById(Long id) {

        try {

            String sql = """
                    SELECT
                        stock_id,
                        stock_name,
                        ticker,
                        stock_market
                    FROM stocks
                    WHERE stock_id = ?
                    """;

            return jdbcTemplate.queryForObject(sql, stocksRowMapper, id);

        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    // Create stock
    public Stocks createStock(Stocks stock) {

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {

            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO stocks
                    (
                        stock_name,
                        ticker,
                        stock_market
                    )
                    VALUES
                    (
                        ?, ?, ?
                    )
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );

            ps.setString(1, stock.getStockName());
            ps.setString(2, stock.getTicker());
            ps.setString(3, stock.getStockMarket());

            return ps;

        }, keyHolder);

        stock.setStockId(keyHolder.getKey().longValue());

        return stock;
    }

    // Update stock
    public boolean updateStock(Long id, Stocks stock) {

        String sql = """
                UPDATE stocks
                SET
                    stock_name = ?,
                    ticker = ?,
                    stock_market = ?
                WHERE stock_id = ?
                """;

        return jdbcTemplate.update(
                sql,
                stock.getStockName(),
                stock.getTicker(),
                stock.getStockMarket(),
                id
        ) > 0;
    }

    // Delete stock
    public boolean deleteStock(Long id) {

        return jdbcTemplate.update(
                "DELETE FROM stocks WHERE stock_id = ?",
                id
        ) > 0;
    }

    // Filter stocks by market
    public ArrayList<Stocks> findByMarket(String market) {

        String sql = """
                SELECT
                    stock_id,
                    stock_name,
                    ticker,
                    stock_market
                FROM stocks
                WHERE stock_market = ?
                ORDER BY stock_name
                """;

        List<Stocks> results = jdbcTemplate.query(
                sql,
                stocksRowMapper,
                market
        );

        return new ArrayList<>(results);
    }

    // Find stock by ticker
    public Stocks findByTicker(String ticker) {

        try {

            String sql = """
                SELECT
                    stock_id,
                    stock_name,
                    ticker,
                    stock_market
                FROM stocks
                WHERE ticker = ?
                LIMIT 1
                """;

            return jdbcTemplate.queryForObject(
                    sql,
                    stocksRowMapper,
                    ticker
            );

        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Stocks findByTickerAndMarket(String ticker, String stockMarket) {

        try {

            String sql = """
                SELECT
                    stock_id,
                    stock_name,
                    ticker,
                    stock_market
                FROM stocks
                WHERE ticker = ? AND stock_market = ?
                LIMIT 1
                """;

            return jdbcTemplate.queryForObject(
                    sql,
                    stocksRowMapper,
                    ticker,
                    stockMarket
            );

        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ArrayList<Stocks> findByStockName(String stockName) {

        String sql = """
            SELECT
                stock_id,
                stock_name,
                ticker,
                stock_market
            FROM stocks
            WHERE stock_name LIKE ?
            ORDER BY stock_market
            """;

        List<Stocks> results = jdbcTemplate.query(
                sql,
                stocksRowMapper,
                "%" + stockName + "%"
        );

        return new ArrayList<>(results);
    }
}