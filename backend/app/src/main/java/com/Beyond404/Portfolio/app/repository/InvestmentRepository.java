package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Investment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;

@Repository
public class InvestmentRepository {

    private final JdbcTemplate jdbcTemplate;
    private final InvestmentRowMapper investmentRowMapper;

    public InvestmentRepository(JdbcTemplate jdbcTemplate, InvestmentRowMapper investmentRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.investmentRowMapper = investmentRowMapper;
    }

    public ArrayList<Investment> getAllInvestments() {
        return new ArrayList<>(
                jdbcTemplate.query(
                        "SELECT asset_id, customer_id, stock_id, transaction_type, transaction_amount, quantity, transaction_timestamp FROM investments ORDER BY asset_id",
                        investmentRowMapper
                )
        );
    }

    public Investment findById(Long id) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT asset_id, customer_id, stock_id, transaction_type, transaction_amount, quantity, transaction_timestamp FROM investments WHERE asset_id = ?",
                    investmentRowMapper,
                    id
            );
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Investment createInvestment(Investment investment) {

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {

            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO investments (customer_id, stock_id, transaction_type, transaction_amount, quantity, transaction_timestamp) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                    Statement.RETURN_GENERATED_KEYS
            );

            ps.setLong(1, investment.getCustomerId());
            ps.setLong(2, investment.getStockId());
            ps.setString(3, investment.getTransactionType());
            ps.setBigDecimal(4, investment.getTransactionAmount());
            ps.setBigDecimal(5, investment.getQuantity());

            return ps;

        }, keyHolder);

        Number generatedId = keyHolder.getKey();
        if (generatedId == null) {
            throw new IllegalStateException("Failed to create investment: no generated asset_id returned");
        }
        investment.setAssetId(generatedId.longValue());

        return findById(investment.getAssetId());
    }

    public boolean updateInvestment(Long id, Investment investment) {

        return jdbcTemplate.update(
                "UPDATE investments SET customer_id = ?, stock_id = ?, transaction_type = ?, transaction_amount = ?, quantity = ?, transaction_timestamp = CURRENT_TIMESTAMP WHERE asset_id = ?",
                investment.getCustomerId(),
                investment.getStockId(),
                investment.getTransactionType(),
                investment.getTransactionAmount(),
                investment.getQuantity(),
                id
        ) > 0;
    }

    public boolean deleteInvestment(Long id) {

        return jdbcTemplate.update(
                "DELETE FROM investments WHERE asset_id = ?",
                id
        ) > 0;
    }
}


