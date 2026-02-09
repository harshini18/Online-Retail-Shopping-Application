#!/bin/bash

# Base URL for Product Service
PRODUCT_URL="http://localhost:8082/api/products"
CATEGORY_URL="http://localhost:8082/api/categories"

echo "Seeding Categories..."

# Create Categories
curl -X POST "$CATEGORY_URL" -H "Content-Type: application/json" -d '{"name": "Electronics", "description": "Gadgets and devices"}'
echo ""
curl -X POST "$CATEGORY_URL" -H "Content-Type: application/json" -d '{"name": "Fashion", "description": "Clothing and accessories"}'
echo ""
curl -X POST "$CATEGORY_URL" -H "Content-Type: application/json" -d '{"name": "Home & Garden", "description": "Furniture and decor"}'
echo ""

echo -e "\nSeeding Products..."

# Create Products
# Electronics (Category ID 1)
curl -X POST "$PRODUCT_URL" -H "Content-Type: application/json" -d '{
    "name": "Smartphone X",
    "description": "Latest model with high-res camera",
    "price": 999.99,
    "quantity": 50,
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnRwaG9mV8ZW58MHx8MHx8fDA%3D",
    "category": {"id": 1}
}'
echo ""

curl -X POST "$PRODUCT_URL" -H "Content-Type: application/json" -d '{
    "name": "Laptop Pro",
    "description": "Powerful laptop for professionals",
    "price": 1499.50,
    "quantity": 25,
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww",
    "category": {"id": 1}
}'
echo ""

# Fashion (Category ID 2)
curl -X POST "$PRODUCT_URL" -H "Content-Type: application/json" -d '{
    "name": "Leather Jacket",
    "description": "Genuine leather jacket",
    "price": 199.99,
    "quantity": 100,
    "imageUrl": "https://images.unsplash.com/photo-1551028919-ac7bcb7d7162?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFja2V0fGVufDB8fDB8fHww",
    "category": {"id": 2}
}'
echo ""

echo -e "\nSeeding Complete!"
