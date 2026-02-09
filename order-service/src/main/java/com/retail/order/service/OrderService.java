package com.retail.order.service;

import com.retail.order.entity.Order;
import java.util.List;

public interface OrderService {
    Order createOrder(Order order);

    List<Order> getUserOrders(Long userId);

    Order getOrderById(Long id);

    List<Order> getAllOrders();

    Order updateOrderStatus(Long orderId, String status);
}
