package com.retail.cart.service.impl;

import com.retail.cart.entity.CartItem;
import com.retail.cart.repository.CartRepository;
import com.retail.cart.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;

    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public List<CartItem> getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @Override
    public CartItem addToCart(CartItem item) {
        // Validate required fields
        if (item.getUserId() == null || item.getProductId() == null) {
            throw new IllegalArgumentException("userId and productId are required");
        }
        if (item.getQuantity() == null || item.getQuantity() <= 0) {
            item.setQuantity(1); // Default to 1 if not provided
        }
        
        CartItem existingItem = cartRepository.findByUserIdAndProductId(item.getUserId(), item.getProductId());
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
            return cartRepository.save(existingItem);
        }
        return cartRepository.save(item);
    }

    @Override
    @Transactional
    public void removeCartItem(Long userId, Long productId) {
        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId);
        if (item != null) {
            cartRepository.delete(item);
        }
    }

    @Override
    public CartItem updateQuantity(Long userId, Long productId, Integer quantity) {
        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId);
        if (item != null) {
            item.setQuantity(quantity);
            return cartRepository.save(item);
        }
        return null; // Or throw exception
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}
