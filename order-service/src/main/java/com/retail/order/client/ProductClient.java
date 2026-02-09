package com.retail.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductClient {
    @PutMapping("/api/products/{id}/reduceStock")
    void reduceStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}
