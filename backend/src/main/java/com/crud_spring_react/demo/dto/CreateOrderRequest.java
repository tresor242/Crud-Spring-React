package com.crud_spring_react.demo.dto;

import java.util.List;

public class CreateOrderRequest {

    private Long customerId;
    private List<CreateOrderItem> items;

    public static class CreateOrderItem {
        private Long productId;
        private Integer quantity;

        public CreateOrderItem() {}

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public CreateOrderRequest() {}

    // Ajout des getters/setters pour customerId et items
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<CreateOrderItem> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItem> items) {
        this.items = items;
    }
}