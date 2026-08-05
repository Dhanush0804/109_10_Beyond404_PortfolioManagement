package com.Beyond404.Portfolio.app.repository;

import com.Beyond404.Portfolio.app.model.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class CustomerRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    public List<Customer> getAllCustomers() {
        String sql = "SELECT * FROM customers";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Customer(
                rs.getInt("customer_id"),
                rs.getString("name"),
                rs.getString("risk_lvl")
        ));
    }
    public Customer getCustomerById(Integer id) {
        String sql = "SELECT * FROM customers WHERE customer_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) -> new Customer(
                rs.getInt("customer_id"),
                rs.getString("name"),
                rs.getString("risk_lvl")
        ));
    }
    public int addCustomer(Customer customer) {
        String sql = "INSERT INTO customers (name, risk_lvl) VALUES (?, ?)";
        return jdbcTemplate.update(sql, customer.getCustomerName(), customer.getRiskLevel());
    }
    public int updateCustomer(Integer id, Customer customer) {
        String sql = "UPDATE customers SET name = ?, risk_lvl = ? WHERE customer_id = ?";
        return jdbcTemplate.update(sql, customer.getCustomerName(), customer.getRiskLevel(), id);
    }

    @Transactional
    public Integer deleteCustomer(Integer id) {
        String deleteInvestmentsSql = "DELETE FROM investments WHERE customer_id = ?";
        jdbcTemplate.update(deleteInvestmentsSql, id);

        String deleteCustomerSql = "DELETE FROM customers WHERE customer_id = ?";
        return jdbcTemplate.update(deleteCustomerSql, id);
    }
}
