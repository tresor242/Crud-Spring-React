package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.domain.Customer;
import com.crud_spring_react.demo.dto.CustomerDto;
import com.crud_spring_react.demo.exception.DuplicateEmailException;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> list() {
        return customerRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto get(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client introuvable: id=" + id));
        return toDto(customer);
    }

    @Override
    public CustomerDto create(CustomerDto dto) {
        if (dto.getEmail() != null && customerRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email déjà utilisé: " + dto.getEmail());
        }

        Customer c = new Customer();
        c.setFullName(dto.getFullName());
        c.setEmail(dto.getEmail());

        Customer saved = customerRepository.save(c);
        return toDto(saved);
    }

    @Override
    public CustomerDto update(Long id, CustomerDto dto) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client introuvable: id=" + id));


        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(c.getEmail())) {
            if (customerRepository.existsByEmail(dto.getEmail())) {
                throw new DuplicateEmailException("Email déjà utilisé: " + dto.getEmail());
            }
            c.setEmail(dto.getEmail());
        }

        if (dto.getFullName() != null) c.setFullName(dto.getFullName());

        return toDto(c);
    }

    @Override
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new NotFoundException("Client introuvable: id=" + id);
        }
        customerRepository.deleteById(id);
    }

    private CustomerDto toDto(Customer c) {
        CustomerDto dto = new CustomerDto();
        dto.setId(c.getId());
        dto.setFullName(c.getFullName());
        dto.setEmail(c.getEmail());
        return dto;
    }
}