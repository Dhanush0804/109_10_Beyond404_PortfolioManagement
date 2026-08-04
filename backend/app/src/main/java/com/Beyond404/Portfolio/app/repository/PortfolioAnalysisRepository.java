package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.PortfolioData;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public class PortfolioAnalysisRepository {

    private final JdbcTemplate jdbcTemplate;
    private final PortfolioDataRowMapper portfolioDataRowMapper;

    public PortfolioAnalysisRepository(
            JdbcTemplate jdbcTemplate,
            PortfolioDataRowMapper portfolioDataRowMapper) {

        this.jdbcTemplate = jdbcTemplate;
        this.portfolioDataRowMapper = portfolioDataRowMapper;
    }

    /**
     * Returns the complete investment history of a customer.
     * Joins Customers, Investments and Stocks tables.
     */
    public ArrayList<PortfolioData> getCustomerPortfolio(Long customerId) {

        String sql = """
                SELECT
                    c.customer_id,
                    c.name,
                    c.risk_lvl,

                    s.stock_id,
                    s.stock_name,
                    s.ticker,
                    s.stock_market,

                    i.transaction_type,
                    i.quantity,
                    i.transaction_amount,
                    i.transaction_timestamp

                FROM customers c

                INNER JOIN investments i
                    ON c.customer_id = i.customer_id

                INNER JOIN stocks s
                    ON s.stock_id = i.stock_id

                WHERE c.customer_id = ?

                ORDER BY i.transaction_timestamp
                """;

        return new ArrayList<>(
                jdbcTemplate.query(
                        sql,
                        portfolioDataRowMapper,
                        customerId
                )
        );
    }

    /**
     * Returns the number of transactions performed by a customer.
     */
    public int getTransactionCount(Long customerId) {

        String sql = """
                SELECT COUNT(*)
                FROM investments
                WHERE customer_id = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                customerId
        );

        return count != null ? count : 0;
    }

    /**
     * Returns the total amount invested through BUY transactions.
     */
    public Double getTotalInvestment(Long customerId) {

        String sql = """
                SELECT
                    COALESCE(SUM(transaction_amount), 0)
                FROM investments
                WHERE customer_id = ?
                AND transaction_type = 'BUY'
                """;

        Double total = jdbcTemplate.queryForObject(
                sql,
                Double.class,
                customerId
        );

        return total != null ? total : 0.0;
    }

    /**
     * Returns the total amount received from SELL transactions.
     */
    public Double getTotalSellValue(Long customerId) {

        String sql = """
                SELECT
                    COALESCE(SUM(transaction_amount), 0)
                FROM investments
                WHERE customer_id = ?
                AND transaction_type = 'SELL'
                """;

        Double total = jdbcTemplate.queryForObject(
                sql,
                Double.class,
                customerId
        );

        return total != null ? total : 0.0;
    }

}