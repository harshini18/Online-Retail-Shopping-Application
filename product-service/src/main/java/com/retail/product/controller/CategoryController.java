package com.retail.product.controller;

import com.retail.product.entity.Category;
import com.retail.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final ProductService productService;
    

    public CategoryController(ProductService productService) {
		//super();
		this.productService = productService;
	}

	@GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(productService.createCategory(category));
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<String> deleteAllCategories() {
        productService.deleteAllCategories();
        return ResponseEntity.ok("All categories deleted");
    }
}
