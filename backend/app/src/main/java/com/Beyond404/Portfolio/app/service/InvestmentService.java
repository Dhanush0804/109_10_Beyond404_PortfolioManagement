package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.Investment;
import com.Beyond404.Portfolio.app.repository.InvestmentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;

    public InvestmentService(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    public ArrayList<Investment> getAllInvestments() {
        return investmentRepository.getAllInvestments();
    }

    public Investment findById(Long id) {
        return investmentRepository.findById(id);
    }

    public Investment createInvestment(Investment investment) {
        return investmentRepository.createInvestment(investment);
    }

    public boolean updateInvestment(Long id, Investment investment) {
        return investmentRepository.updateInvestment(id, investment);
    }

    public boolean deleteInvestment(Long id) {
        return investmentRepository.deleteInvestment(id);
    }
}

