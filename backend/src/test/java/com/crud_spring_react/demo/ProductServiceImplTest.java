package com.crud_spring_react.demo;

import com.crud_spring_react.demo.domain.Product;
import com.crud_spring_react.demo.dto.ProductDto;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.ProductRepository;
import com.crud_spring_react.demo.service.ProductServiceImpl;
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
class ProductServiceImplTest {

    @Mock ProductRepository productRepository;
    @InjectMocks
    ProductServiceImpl service;

    @Test
    void list_returnsDtos() {
        Product p1 = new Product(); p1.setId(1L); p1.setName("A"); p1.setPrice(new BigDecimal("10.00")); p1.setStock(5);
        Product p2 = new Product(); p2.setId(2L); p2.setName("B"); p2.setPrice(new BigDecimal("20.00")); p2.setStock(2);

        when(productRepository.findAll()).thenReturn(List.of(p1, p2));

        List<ProductDto> res = service.list();

        assertEquals(2, res.size());
        assertEquals("A", res.get(0).getName());
        assertEquals("B", res.get(1).getName());
        verify(productRepository).findAll();
    }

    @Test
    void get_existing_returnsDto() {
        Product p = new Product(); p.setId(1L); p.setName("X");
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));

        ProductDto dto = service.get(1L);

        assertEquals(1L, dto.getId());
        assertEquals("X", dto.getName());
        verify(productRepository).findById(1L);
    }

    @Test
    void get_missing_throwsNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.get(99L));
    }

    @Test
    void create_savesAndReturnsDto() {
        ProductDto input = new ProductDto();
        input.setName("Prod");
        input.setPrice(new BigDecimal("9.99"));
        input.setStock(10);

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductDto dto = service.create(input);

        assertEquals(1L, dto.getId());
        assertEquals("Prod", dto.getName());
        assertEquals(new BigDecimal("9.99"), dto.getPrice());
        assertEquals(10, dto.getStock());

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertEquals("Prod", captor.getValue().getName());
    }

    @Test
    void update_updatesFields() {
        Product existing = new Product();
        existing.setId(1L);
        existing.setName("Old");
        existing.setPrice(new BigDecimal("1.00"));
        existing.setStock(1);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

        ProductDto patch = new ProductDto();
        patch.setName("New");
        patch.setPrice(new BigDecimal("2.50"));
        patch.setStock(5);

        ProductDto dto = service.update(1L, patch);

        assertEquals("New", dto.getName());
        assertEquals(new BigDecimal("2.50"), dto.getPrice());
        assertEquals(5, dto.getStock());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any());
    }

    @Test
    void delete_existing_deletes() {
        when(productRepository.existsById(1L)).thenReturn(true);
        service.delete(1L);
        verify(productRepository).deleteById(1L);
    }
}