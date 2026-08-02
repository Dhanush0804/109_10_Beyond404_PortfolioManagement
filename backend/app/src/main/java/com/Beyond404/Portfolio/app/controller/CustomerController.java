package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Customer;
import com.Beyond404.Portfolio.app.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;
    @GetMapping("/all")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    @GetMapping("/{id}")
    public Customer getCustomerById( @PathVariable Integer id) {
        return customerService.getCustomerById(id);
    }
    @PostMapping("/add")
    public Integer addCustomer(@RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }
    @PutMapping("/update/{id}")
    public Integer updateCustomer(@PathVariable Integer id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }
    @DeleteMapping("/delete/{id}")
    public Integer deleteCustomer(@PathVariable Integer id) {
        return customerService.deleteCustomer(id);
    }
}

