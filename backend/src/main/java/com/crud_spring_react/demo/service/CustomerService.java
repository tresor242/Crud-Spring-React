package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.dto.CustomerDto;

import java.util.List;

public interface CustomerService {
    List<CustomerDto> list();
    CustomerDto get(Long id);
    CustomerDto create(CustomerDto dto);
    CustomerDto update(Long id, CustomerDto dto);
    void delete(Long id);
}
