package com.retail.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service", url = "http://localhost:8086")
public interface InventoryClient {
    @PutMapping("/api/inventory/{productId}/reduce")
    void reduceStock(@PathVariable("productId") Long productId, @RequestParam("quantity") Integer quantity);
}
