package com.retail.inventory.service.impl;

import com.retail.inventory.client.ProductClient;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductClient productClient;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, ProductClient productClient) {
        this.inventoryRepository = inventoryRepository;
        this.productClient = productClient;
    }

    @Override
    public Inventory getStockByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElse(new Inventory());
    }

    @Override
    public Inventory updateStock(Long productId, Integer quantity) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElse(new Inventory());
        inv.setProductId(productId);
        inv.setQuantity(quantity);
        Inventory saved = inventoryRepository.save(inv);
        
        // Sync with product-service cache
        try {
            productClient.updateStock(productId, quantity);
        } catch (Exception e) {
            System.err.println("Failed to sync with product-service: " + e.getMessage());
        }
        return saved;
    }

    @Override
    public void reduceStock(Long productId, Integer quantity) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product: " + productId));
        
        if (inv.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + productId);
        }
        
        inv.setQuantity(inv.getQuantity() - quantity);
        inventoryRepository.save(inv);
        
        // Sync with product-service
        try {
            productClient.reduceStock(productId, quantity);
        } catch (Exception e) {
            System.err.println("Failed to sync stock reduction with product-service: " + e.getMessage());
        }
    }
}
