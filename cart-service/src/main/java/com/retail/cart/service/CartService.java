package com.retail.cart.service;

import com.retail.cart.entity.CartItem;
import java.util.List;

public interface CartService {
    List<CartItem> getCartByUserId(Long userId);

    CartItem addToCart(CartItem item);

    void removeCartItem(Long userId, Long productId);

    CartItem updateQuantity(Long userId, Long productId, Integer quantity);

    void clearCart(Long userId);
}
