package com.crud_spring_react.demo.web;

import com.crud_spring_react.demo.dto.CreateOrderRequest;
import com.crud_spring_react.demo.dto.OrderDto;
import com.crud_spring_react.demo.dto.UpdateOrderStatusRequest;
import com.crud_spring_react.demo.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderDto> list() {
        return orderService.list();
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<OrderDto> listByCustomer(@PathVariable Long customerId) {
        return orderService.listByCustomer(customerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto create(@RequestBody CreateOrderRequest request) {
        return orderService.create(request);
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }
}