package com.retail.cart.controller;

import com.retail.cart.entity.CartItem;
import com.retail.cart.service.CartService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }

    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {
        try {
            return cartService.addToCart(item);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid cart item: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public void clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public void removeCartItem(@PathVariable Long userId, @PathVariable Long productId) {
        cartService.removeCartItem(userId, productId);
    }

    @PutMapping("/{userId}/items/{productId}")
    public CartItem updateQuantity(@PathVariable Long userId, @PathVariable Long productId,
            @RequestParam Integer quantity) {
        return cartService.updateQuantity(userId, productId, quantity);
    }

    @GetMapping("/health")
    public String health() {
        return "Cart Service is running";
    }
}
