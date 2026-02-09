package com.retail.product.service;

import com.retail.product.entity.Product;
import com.retail.product.entity.Category;
import com.retail.product.repository.ProductRepository;
import com.retail.product.repository.CategoryRepository;
import com.retail.product.client.InventoryClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryClient inventoryClient;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, InventoryClient inventoryClient) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
        this.inventoryClient = inventoryClient;
	}

	public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public Product createProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        try {
            inventoryClient.createInventory(savedProduct.getId(), savedProduct.getQuantity());
        } catch (Exception e) {
            System.err.println("Failed to create inventory for product: " + e.getMessage());
        }
        return savedProduct;
    }

    public Product updateProduct(Long id, Product product) {
        Product existingProduct = getProductById(id);
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setCategory(product.getCategory());
        return productRepository.save(existingProduct);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public void deleteAllProducts() {
        productRepository.deleteAll();
    }

    public void reduceStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product id: " + id);
        }
        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);
    }

    public void updateStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        product.setQuantity(quantity);
        productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void deleteAllCategories() {
        categoryRepository.deleteAll();
    }
}
