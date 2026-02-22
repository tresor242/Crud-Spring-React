package com.crud_spring_react.demo;

import com.crud_spring_react.demo.domain.Customer;
import com.crud_spring_react.demo.domain.Order;
import com.crud_spring_react.demo.dto.CustomerDto;
import com.crud_spring_react.demo.exception.DuplicateEmailException;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.CustomerRepository;
import com.crud_spring_react.demo.service.CustomerServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock CustomerRepository customerRepository;
    @InjectMocks
    CustomerServiceImpl service;

    @Test
    void list_returnsDtos() {
        Customer c1 = new Customer(); c1.setId(1L); c1.setFullName("A"); c1.setEmail("a@mail.com");
        Customer c2 = new Customer(); c2.setId(2L); c2.setFullName("B"); c2.setEmail("b@mail.com");

        Order o = new Order(); o.setId(10L);
        c1.getOrders().add(o);

        when(customerRepository.findAll()).thenReturn(List.of(c1, c2));

        List<CustomerDto> res = service.list();

        assertEquals(2, res.size());
        assertEquals(1L, res.get(0).getId());
        assertEquals(List.of(10L), res.get(0).getOrderIds());
        assertEquals(2L, res.get(1).getId());

        verify(customerRepository).findAll();
    }

    @Test
    void get_existing_returnsDto() {
        Customer c = new Customer(); c.setId(1L); c.setFullName("John"); c.setEmail("john@mail.com");
        when(customerRepository.findById(1L)).thenReturn(Optional.of(c));

        CustomerDto dto = service.get(1L);

        assertEquals(1L, dto.getId());
        assertEquals("John", dto.getFullName());
        assertEquals("john@mail.com", dto.getEmail());
        verify(customerRepository).findById(1L);
    }

    @Test
    void get_missing_throwsNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.get(99L));
    }

    @Test
    void create_whenEmailExists_throwsDuplicateEmail() {
        CustomerDto input = new CustomerDto();
        input.setFullName("John");
        input.setEmail("john@mail.com");

        when(customerRepository.existsByEmail("john@mail.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> service.create(input));

        verify(customerRepository).existsByEmail("john@mail.com");
        verify(customerRepository, never()).save(any());
    }

    @Test
    void create_savesAndReturnsDto() {
        CustomerDto input = new CustomerDto();
        input.setFullName("John");
        input.setEmail("john@mail.com");

        when(customerRepository.existsByEmail("john@mail.com")).thenReturn(false);

        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        CustomerDto dto = service.create(input);

        assertEquals(1L, dto.getId());
        assertEquals("John", dto.getFullName());
        assertEquals("john@mail.com", dto.getEmail());

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());
        assertEquals("John", captor.getValue().getFullName());
        assertEquals("john@mail.com", captor.getValue().getEmail());
    }

    @Test
    void update_updatesName_andEmailUniquenessChecked() {
        Customer existing = new Customer();
        existing.setId(1L);
        existing.setFullName("Old");
        existing.setEmail("old@mail.com");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.existsByEmail("new@mail.com")).thenReturn(false);

        CustomerDto patch = new CustomerDto();
        patch.setFullName("New Name");
        patch.setEmail("new@mail.com");

        CustomerDto dto = service.update(1L, patch);

        assertEquals("New Name", dto.getFullName());
        assertEquals("new@mail.com", dto.getEmail());

        verify(customerRepository).findById(1L);
        verify(customerRepository).existsByEmail("new@mail.com");
        verify(customerRepository, never()).save(any()); // managed entity update
    }

    @Test
    void delete_missing_throwsNotFound() {
        when(customerRepository.existsById(9L)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> service.delete(9L));
        verify(customerRepository, never()).deleteById(anyLong());
    }

    @Test
    void delete_existing_deletes() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        service.delete(1L);
        verify(customerRepository).deleteById(1L);
    }
}