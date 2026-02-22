package com.crud_spring_react.demo;

import com.crud_spring_react.demo.domain.*;
import com.crud_spring_react.demo.dto.CreateOrderRequest;
import com.crud_spring_react.demo.dto.OrderDto;
import com.crud_spring_react.demo.exception.InsufficientStockException;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.CustomerRepository;
import com.crud_spring_react.demo.repository.OrderRepository;
import com.crud_spring_react.demo.repository.ProductRepository;
import com.crud_spring_react.demo.service.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock OrderRepository orderRepository;
    @Mock CustomerRepository customerRepository;
    @Mock ProductRepository productRepository;

    @InjectMocks
    OrderServiceImpl service;

    @Test
    void list_returnsDtos() {
        Customer c = new Customer(); c.setId(1L); c.setFullName("John");
        Order o = new Order(); o.setId(10L); o.setCustomer(c); o.setStatus(OrderStatus.CREATED);

        when(orderRepository.findAll()).thenReturn(List.of(o));

        List<OrderDto> res = service.list();

        assertEquals(1, res.size());
        assertEquals(10L, res.get(0).getId());
        assertEquals(1L, res.get(0).getCustomerId());
        assertEquals("John", res.get(0).getCustomerName());
        verify(orderRepository).findAll();
    }

    @Test
    void get_missing_throwsNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.get(99L));
    }

    @Test
    void listByCustomer_customerMissing_throwsNotFound() {
        when(customerRepository.existsById(7L)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> service.listByCustomer(7L));
        verify(orderRepository, never()).findByCustomerId(anyLong());
    }

    @Test
    void create_customerMissing_throwsNotFound() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setItems(List.of(item(2L, 1)));

        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.create(req));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void create_productMissing_throwsNotFound() {
        Customer customer = new Customer(); customer.setId(1L); customer.setFullName("John");

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setItems(List.of(item(99L, 1)));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.create(req));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void create_insufficientStock_throws() {
        Customer customer = new Customer(); customer.setId(1L); customer.setFullName("John");
        Product product = new Product(); product.setId(2L); product.setName("P"); product.setPrice(new BigDecimal("10.00")); product.setStock(1);

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setItems(List.of(item(2L, 2))); // demande 2, stock 1

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class, () -> service.create(req));
        verify(orderRepository, never()).save(any());
        assertEquals(1, product.getStock()); // stock inchangé
    }

    @Test
    void create_success_decrementsStock_andSavesOrder_withSnapshotPrice() {
        Customer customer = new Customer(); customer.setId(1L); customer.setFullName("John");
        Product product = new Product();
        product.setId(2L);
        product.setName("Keyboard");
        product.setPrice(new BigDecimal("49.99"));
        product.setStock(10);

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setItems(List.of(item(2L, 3)));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);

            if (o.getItems() != null) {
                long id = 1000L;
                for (OrderItem oi : o.getItems()) oi.setId(id++);
            }
            return o;
        });

        OrderDto dto = service.create(req);

        assertEquals(100L, dto.getId());
        assertEquals(1L, dto.getCustomerId());
        assertEquals("John", dto.getCustomerName());
        assertEquals(OrderStatus.CREATED, dto.getStatus());
        assertEquals(1, dto.getItems().size());
        assertEquals(2L, dto.getItems().get(0).getProductId());
        assertEquals("Keyboard", dto.getItems().get(0).getProductName());
        assertEquals(3, dto.getItems().get(0).getQuantity());
        assertEquals(new BigDecimal("49.99"), dto.getItems().get(0).getUnitPrice());

        assertEquals(7, product.getStock()); // 10 - 3

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());

        Order saved = captor.getValue();
        assertNotNull(saved.getCustomer());
        assertEquals(1L, saved.getCustomer().getId());
        assertEquals(1, saved.getItems().size());
        assertEquals(new BigDecimal("49.99"), saved.getItems().get(0).getUnitPrice());
    }

    @Test
    void updateStatus_updates() {
        Customer c = new Customer(); c.setId(1L); c.setFullName("John");
        Order o = new Order(); o.setId(10L); o.setCustomer(c); o.setStatus(OrderStatus.CREATED);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(o));

        OrderDto dto = service.updateStatus(10L, OrderStatus.PAID);

        assertEquals(OrderStatus.PAID, dto.getStatus());
        verify(orderRepository).findById(10L);
    }

    @Test
    void delete_missing_throwsNotFound() {
        when(orderRepository.existsById(9L)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> service.delete(9L));
        verify(orderRepository, never()).deleteById(anyLong());
    }

    private static CreateOrderRequest.CreateOrderItem item(Long productId, int qty) {
        CreateOrderRequest.CreateOrderItem i = new CreateOrderRequest.CreateOrderItem();
        i.setProductId(productId);
        i.setQuantity(qty);
        return i;
    }
}