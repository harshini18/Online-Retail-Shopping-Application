package com.retail.product.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PostMapping("/api/inventory")
    void createInventory(@RequestParam("productId") Long productId, @RequestParam("quantity") Integer quantity);
}
