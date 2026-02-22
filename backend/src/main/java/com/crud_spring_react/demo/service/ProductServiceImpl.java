package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.domain.Product;
import com.crud_spring_react.demo.dto.ProductDto;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> list() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: id=" + id));
        return toDto(p);
    }

    @Override
    public ProductDto create(ProductDto dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setStock(dto.getStock());

        return toDto(productRepository.save(p));
    }

    @Override
    public ProductDto update(Long id, ProductDto dto) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: id=" + id));

        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getStock() != null) p.setStock(dto.getStock());

        return toDto(p);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Produit introuvable: id=" + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        return dto;
    }
}