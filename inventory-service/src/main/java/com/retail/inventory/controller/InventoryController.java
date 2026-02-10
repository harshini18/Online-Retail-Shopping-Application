package com.retail.inventory.controller;

import com.retail.inventory.entity.Inventory;
import com.retail.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public Inventory getStock(@PathVariable Long productId) {
        return inventoryService.getStockByProductId(productId);
    }

    @PutMapping("/{productId}/stock")
    public Inventory updateStock(@PathVariable Long productId, @RequestParam Integer quantity) {
        return inventoryService.updateStock(productId, quantity);
    }

    @PutMapping("/{productId}/reduce")
    public void reduceStock(@PathVariable Long productId, @RequestParam Integer quantity) {
        inventoryService.reduceStock(productId, quantity);
    }

    @PostMapping
    public void createInventory(@RequestParam Long productId, @RequestParam Integer quantity) {
        inventoryService.createInventory(productId, quantity);
    }

    @GetMapping("/health")
    public String health() {
        return "Inventory Service is running";
    }
}
