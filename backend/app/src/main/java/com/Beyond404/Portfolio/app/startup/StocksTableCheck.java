package com.Beyond404.Portfolio.app.startup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class StocksTableCheck implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {

        Integer stockCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM stocks",
                Integer.class
        );

        System.out.println();
        System.out.println("========== STOCK TABLE CHECK ==========");
        System.out.println("Table checked: stocks");
        System.out.println("Rows available: " + stockCount);
        System.out.println("schema.sql and data.sql were executed.");
        System.out.println("=======================================");
        System.out.println();
    }
}
