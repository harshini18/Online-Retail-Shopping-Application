# Backend API Testing Guide

This document provides details for testing all available endpoints in the microservice ecosystem. All requests should be directed to the **API Gateway** at `http://localhost:8080` unless otherwise specified.

---

## � Authentication & Users (User Service)
**Base Port**: 8081 | **Gateway Path**: `/api/users`

### 1. Register a User
- **URL**: `POST http://localhost:8080/api/users/register`
- **Body**:
```json
{
  "email": "tester@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "1234567890",
  "role": "CUSTOMER"
}
```
- **Expected Output**: Status 201 Created, returns `AuthResponse` with JWT token, email, role, and userId.

### 2. Login
- **URL**: `POST http://localhost:8080/api/users/login`
- **Body**:
```json
{
  "email": "tester@example.com",
  "password": "password123"
}
```
- **Expected Output**: Status 200 OK, returns `AuthResponse` with JWT token.

### 3. Get Profile
- **URL**: `GET http://localhost:8080/api/users/profile`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Expected Output**: Returns user details (id, email, names, phone, role).

---

## 📦 Products & Categories (Product Service)
**Base Port**: 8082 | **Gateway Path**: `/api/products` & `/api/categories`

### 1. Get All Products
- **URL**: `GET http://localhost:8080/api/products`
- **Expected Output**: List of all product objects.

### 2. Search Products
- **URL**: `GET http://localhost:8080/api/products/search?q=iphone`
- **Expected Output**: List of products matching the query.

### 3. Create Product (Admin)
- **URL**: `POST http://localhost:8080/api/products`
- **Body**:
```json
{
  "name": "New Phone",
  "description": "Latest model",
  "price": 500.0,
  "quantity": 100,
  "category": { "id": 1 },
  "imageUrl": "http://image.url"
}
```
- **Expected Output**: Created product object.

---

## 🏢 Inventory Management (Inventory Service)
**Base Port**: 8086 | **Gateway Path**: `/api/inventory`

### 1. Check Stock
- **URL**: `GET http://localhost:8080/api/inventory/{productId}`
- **Expected Output**: Inventory object showing `quantity` and `reservedQuantity`.

### 2. Update Stock (Manual)
- **URL**: `PUT http://localhost:8080/api/inventory/{productId}/stock?quantity=50`
- **Expected Output**: Updated inventory object.

---

## 🛒 Shopping Cart (Cart Service)
**Base Port**: 8084 | **Gateway Path**: `/api/cart`

### 1. Add to Cart
- **URL**: `POST http://localhost:8080/api/cart`
- **Body**:
```json
{
  "userId": 1,
  "productId": 8,
  "quantity": 1,
  "name": "IPhone",
  "price": 99000,
  "imageUrl": "..."
}
```
- **Expected Output**: Cart item object.

### 2. Get User Cart
- **URL**: `GET http://localhost:8080/api/cart/{userId}`
- **Expected Output**: List of items in the user's cart.

---

## 🧾 Orders (Order Service)
**Base Port**: 8083 | **Gateway Path**: `/api/orders`

### 1. Place Order
- **URL**: `POST http://localhost:8080/api/orders`
- **Body**:
```json
{
  "userId": 1,
  "items": [
    { "productId": 8, "quantity": 1, "price": 99000, "name": "IPhone" }
  ],
  "totalAmount": 99000,
  "shippingAddress": "123 Test St"
}
```
- **Expected Output**: Order object with status `PENDING`.

---

## 💳 Payments (Payment Service)
**Base Port**: 8085 | **Gateway Path**: `/api/payments`

### 1. Process Payment
- **URL**: `POST http://localhost:8080/api/payments`
- **Body**:
```json
{
  "userId": 1,
  "amount": 99000.0,
  "paymentMethod": "CREDIT_CARD",
  "status": "SUCCESS"
}
```
- **Expected Output**: Payment record with `transactionId`.

---

## 🔔 Notifications (Notification Service)
**Base Port**: 8087 | **Gateway Path**: `/api/notifications`

### 1. Get User Notifications
- **URL**: `GET http://localhost:8080/api/notifications/user/{userId}`
- **Expected Output**: List of notifications sent to the user.

---

## 🩺 System Health Checks
You can check the health of any service by appending `/health` to its gateway path or calling its direct port:

- **Gateway**: `http://localhost:8080/api/users/health`
- **User**: `http://localhost:8081/api/users/health`
- **Product**: `http://localhost:8082/api/products/health`
- **Order**: `http://localhost:8083/api/orders/health`
- **Cart**: `http://localhost:8084/api/cart/health`
- **Payment**: `http://localhost:8085/api/payments/health`
- **Inventory**: `http://localhost:8086/api/inventory/health`
- **Notification**: `http://localhost:8087/api/notifications/health`
