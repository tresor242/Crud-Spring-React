package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.domain.OrderStatus;
import com.crud_spring_react.demo.dto.CreateOrderRequest;
import com.crud_spring_react.demo.dto.OrderDto;

import java.util.List;

public interface OrderService {
    List<OrderDto> list();
    OrderDto get(Long id);
    List<OrderDto> listByCustomer(Long customerId);

    OrderDto create(CreateOrderRequest request);

    OrderDto updateStatus(Long id, OrderStatus status);
    void delete(Long id);
}