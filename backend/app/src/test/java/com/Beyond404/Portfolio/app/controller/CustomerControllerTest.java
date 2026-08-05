package com.Beyond404.Portfolio.app.controller;

import com.Beyond404.Portfolio.app.model.Customer;
import com.Beyond404.Portfolio.app.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    @Test
    void getAllCustomers_returnsOk() throws Exception {
        List<Customer> customers = List.of(
                new Customer(1, "Rahul Sharma", "MEDIUM"),
                new Customer(2, "Priya Nair", "LOW")
        );

        when(customerService.getAllCustomers()).thenReturn(customers);

        mockMvc.perform(get("/api/customers/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[1].customerName").value("Priya Nair"));
    }

    @Test
    void getCustomerById_returnsOk() throws Exception {
        Customer customer = new Customer(1, "Rahul Sharma", "MEDIUM");

        when(customerService.getCustomerById(1)).thenReturn(customer);

        mockMvc.perform(get("/api/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.customerName").value("Rahul Sharma"));
    }

    @Test
    void addCustomer_returnsOk() throws Exception {
        String requestJson = """
            {
              \"customerId\": 0,
              \"customerName\": \"New User\",
              \"riskLevel\": \"LOW\"
            }
            """;

        when(customerService.addCustomer(any(Customer.class))).thenReturn(101);

        mockMvc.perform(post("/api/customers/add")
                        .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(101));
    }

    @Test
    void updateCustomer_returnsOk() throws Exception {
        String requestJson = """
            {
              \"customerId\": 1,
              \"customerName\": \"Rahul Sharma\",
              \"riskLevel\": \"HIGH\"
            }
            """;

        when(customerService.updateCustomer(any(Integer.class), any(Customer.class))).thenReturn(1);

        mockMvc.perform(put("/api/customers/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1));
    }

    @Test
    void deleteCustomer_returnsOk() throws Exception {
        when(customerService.deleteCustomer(1)).thenReturn(1);

        mockMvc.perform(delete("/api/customers/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1));
    }
}
