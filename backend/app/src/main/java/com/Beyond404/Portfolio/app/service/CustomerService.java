package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.Customer;
import com.Beyond404.Portfolio.app.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    public List<Customer> getAllCustomers() {
        return customerRepository.getAllCustomers();
    }
    public Customer getCustomerById(Integer id) {
        return customerRepository.getCustomerById(id);
    }
    public Integer addCustomer(Customer customer) {
        return customerRepository.addCustomer(customer);
    }
    public Integer updateCustomer(Integer id, Customer customer) {
        return customerRepository.updateCustomer(id, customer);
    }

    public Integer deleteCustomer(Integer id) {
        return customerRepository.deleteCustomer(id);
    }
}
