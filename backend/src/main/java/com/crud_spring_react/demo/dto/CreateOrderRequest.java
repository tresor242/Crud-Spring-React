package com.crud_spring_react.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public class CreateOrderRequest {

    @NotNull(message = "customerId est obligatoire")
    @Positive(message = "customerId doit être > 0")
    private Long customerId;

    @NotNull(message = "items est obligatoire")
    @Size(min = 1, message = "items doit contenir au moins 1 élément")
    @Valid
    private List<CreateOrderItem> items;

    public static class CreateOrderItem {

        @NotNull(message = "productId est obligatoire")
        @Positive(message = "productId doit être > 0")
        private Long productId;

        @NotNull(message = "quantity est obligatoire")
        @Min(value = 1, message = "quantity doit être >= 1")
        private Integer quantity;

        public CreateOrderItem() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public CreateOrderRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public List<CreateOrderItem> getItems() { return items; }
    public void setItems(List<CreateOrderItem> items) { this.items = items; }
}