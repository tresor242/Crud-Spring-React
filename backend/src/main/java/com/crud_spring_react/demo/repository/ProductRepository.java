package com.crud_spring_react.demo.repository;

import com.crud_spring_react.demo.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

}