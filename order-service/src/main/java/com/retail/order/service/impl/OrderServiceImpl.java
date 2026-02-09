package com.retail.order.service.impl;

import com.retail.order.entity.Order;
import com.retail.order.repository.OrderRepository;
import com.retail.order.service.OrderService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final com.retail.order.client.ProductClient productClient;
    private final com.retail.order.client.InventoryClient inventoryClient;
    private final com.retail.order.client.NotificationClient notificationClient;

    public OrderServiceImpl(OrderRepository orderRepository, 
                           com.retail.order.client.ProductClient productClient,
                           com.retail.order.client.InventoryClient inventoryClient,
                           com.retail.order.client.NotificationClient notificationClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
        this.notificationClient = notificationClient;
    }

    @Override
    public Order createOrder(Order order) {
        if (order.getItems() != null) {
            for (com.retail.order.entity.OrderItem item : order.getItems()) {
                try {
                    inventoryClient.reduceStock(item.getProductId(), item.getQuantity());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to reduce stock for product " + item.getName() + 
                        " (ID: " + item.getProductId() + "): " + e.getMessage());
                }
            }
        }
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);
        
        // Send notification to customer
        try {
            notificationClient.sendNotification(new com.retail.order.client.NotificationRequest(
                savedOrder.getUserId(),
                "EMAIL",
                "customer@email.com",
                "Order Placed Successfully",
                "Your order #" + savedOrder.getId() + " has been placed and is now PENDING approval."
            ));
        } catch (Exception e) {
            System.err.println("Failed to send order creation notification: " + e.getMessage());
        }
        
        return savedOrder;
    }

    @Override
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        // Send notification based on status
        try {
            System.out.println("Updating order " + orderId + " to status: " + status + " for user: " + updatedOrder.getUserId());
            String subject = "";
            String message = "";
            
            if ("APPROVED".equals(status)) {
                subject = "Order Approved";
                message = "Your order #" + orderId + " has been approved and will be processed soon.";
            } else if ("DELIVERED".equals(status)) {
                subject = "Order Delivered";
                message = "Your order #" + orderId + " has been delivered. Thank you for shopping with us!";
            } else if ("DENIED".equals(status)) {
                subject = "Order Denied";
                message = "Your order #" + orderId + " has been denied. Please contact support for details.";
            }
            
            if (!subject.isEmpty()) {
                System.out.println("Sending status update notification. Subject: " + subject);
                notificationClient.sendNotification(new com.retail.order.client.NotificationRequest(
                    updatedOrder.getUserId(),
                    "ORDER_UPDATE",
                    "customer@email.com",
                    subject,
                    message
                ));
                System.out.println("Notification sent successfully to user " + updatedOrder.getUserId());
            } else {
                System.out.println("No notification sent: subject is empty for status " + status);
            }
        } catch (Exception e) {
            System.err.println("Failed to send status update notification for order " + orderId + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return updatedOrder;
    }
}
