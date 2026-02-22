package com.crud_spring_react.demo.web;

import com.crud_spring_react.demo.dto.CustomerDto;
import com.crud_spring_react.demo.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerDto> list() {
        return customerService.list();
    }

    @GetMapping("/{id}")
    public CustomerDto get(@PathVariable Long id) {
        return customerService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDto create(@Valid @RequestBody CustomerDto dto) {
        return customerService.create(dto);
    }

    @PutMapping("/{id}")
    public CustomerDto update(@PathVariable Long id,@Valid @RequestBody CustomerDto dto) {
        return customerService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }
}