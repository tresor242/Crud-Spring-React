package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.dto.ProductDto;

import java.util.List;

public interface ProductService {
    List<ProductDto> list();
    ProductDto get(Long id);
    ProductDto create(ProductDto dto);
    ProductDto update(Long id, ProductDto dto);
    void delete(Long id);
}