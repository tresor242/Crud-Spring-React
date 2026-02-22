package com.crud_spring_react.demo.dto;

import com.crud_spring_react.demo.domain.OrderStatus;

public class UpdateOrderStatusRequest {
    private OrderStatus status;

    public UpdateOrderStatusRequest() {}

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}