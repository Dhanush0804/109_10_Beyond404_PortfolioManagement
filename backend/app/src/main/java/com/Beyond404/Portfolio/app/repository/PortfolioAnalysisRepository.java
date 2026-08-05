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
     * Returns complete investment history of a customer.
     *
     * Values like transaction amount are calculated dynamically
     * using historical market prices.
     */
    public ArrayList<PortfolioData> getCustomerPortfolio(
            Long customerId) {


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
     * Returns number of transactions performed by customer.
     */
    public int getTransactionCount(
            Long customerId) {


        String sql = """

                SELECT COUNT(*)

                FROM investments

                WHERE customer_id = ?

                """;


        Integer count =
                jdbcTemplate.queryForObject(
                        sql,
                        Integer.class,
                        customerId
                );


        return count != null
                ?
                count
                :
                0;

    }

}