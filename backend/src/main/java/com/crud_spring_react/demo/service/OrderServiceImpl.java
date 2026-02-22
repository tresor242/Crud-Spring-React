package com.crud_spring_react.demo.service;

import com.crud_spring_react.demo.domain.*;
import com.crud_spring_react.demo.dto.CreateOrderRequest;
import com.crud_spring_react.demo.dto.OrderDto;
import com.crud_spring_react.demo.dto.OrderItemDto;
import com.crud_spring_react.demo.exception.InsufficientStockException;
import com.crud_spring_react.demo.exception.NotFoundException;
import com.crud_spring_react.demo.repository.CustomerRepository;
import com.crud_spring_react.demo.repository.OrderRepository;
import com.crud_spring_react.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> list() {
        return orderRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto get(Long id) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Commande introuvable: id=" + id));
        return toDto(o);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> listByCustomer(Long customerId) {
        // option: vérifier customer existe pour renvoyer 404 si client inexistant
        if (!customerRepository.existsById(customerId)) {
            throw new NotFoundException("Customer introuvable: id=" + customerId);
        }
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public OrderDto create(CreateOrderRequest request) {
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("customerId est obligatoire");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("items est obligatoire");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new NotFoundException("Customer introuvable: id=" + request.getCustomerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.CREATED);

        for (CreateOrderRequest.CreateOrderItem i : request.getItems()) {
            if (i.getProductId() == null) throw new IllegalArgumentException("productId est obligatoire");
            if (i.getQuantity() == null || i.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity doit être > 0");
            }

            Product product = productRepository.findById(i.getProductId())
                    .orElseThrow(() -> new NotFoundException("Produit introuvable: id=" + i.getProductId()));

            int available = product.getStock() == null ? 0 : product.getStock();
            if (available < i.getQuantity()) {
                throw new InsufficientStockException(
                        "Stock insuffisant pour productId=" + product.getId() +
                                " (stock=" + available + ", demandé=" + i.getQuantity() + ")"
                );
            }

            // décrément stock
            product.setStock(available - i.getQuantity());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(i.getQuantity());
            item.setUnitPrice(product.getPrice()); // snapshot au moment de l'achat

            order.getItems().add(item);
        }

        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Override
    public OrderDto updateStatus(Long id, OrderStatus status) {
        if (status == null) throw new IllegalArgumentException("status est obligatoire");

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Commande introuvable: id=" + id));

        order.setStatus(status);
        return toDto(order);
    }

    @Override
    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Commande introuvable: id=" + id);
        }
        orderRepository.deleteById(id);
    }

    private OrderDto toDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setStatus(o.getStatus());

        if (o.getCustomer() != null) {
            dto.setCustomerId(o.getCustomer().getId());
            dto.setCustomerName(o.getCustomer().getFullName());
        }

        List<OrderItemDto> items = (o.getItems() == null) ? List.of() :
                o.getItems().stream().map(oi -> {
                    OrderItemDto i = new OrderItemDto();
                    i.setId(oi.getId());
                    i.setQuantity(oi.getQuantity());
                    i.setUnitPrice(oi.getUnitPrice());

                    if (oi.getProduct() != null) {
                        i.setProductId(oi.getProduct().getId());
                        i.setProductName(oi.getProduct().getName());
                    }
                    return i;
                }).toList();

        dto.setItems(items);
        return dto;
    }
}