package com.retail.inventory.service;

import com.retail.inventory.entity.Inventory;

public interface InventoryService {
    Inventory getStockByProductId(Long productId);

    Inventory updateStock(Long productId, Integer quantity);

    void reduceStock(Long productId, Integer quantity);
    
    void createInventory(Long productId, Integer quantity);
}
