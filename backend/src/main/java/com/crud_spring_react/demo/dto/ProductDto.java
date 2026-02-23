package com.crud_spring_react.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class ProductDto {

    private Long id;

    @NotBlank(message = "name est obligatoire")
    @Size(min = 2, max = 150, message = "name doit être entre 2 et 150 caractères")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÿ0-9' -]+$",
            message = "name ne doit contenir que des lettres, chiffres, espaces, tirets ou apostrophes"
    )
    private String name;

    @NotNull(message = "price est obligatoire")
    @Positive(message = "price doit être supérieur à 0")
    private BigDecimal price;

    @NotNull(message = "stock est obligatoire")
    @PositiveOrZero(message = "stock doit être supérieur ou égal à 0")
    private Integer stock;

    public ProductDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}