# Order Service API Documentation

The Order Service manages order creation, history, and status updates.

**Base URL through Gateway:** `http://localhost:8080/api/orders`  
**Direct Service URL:** `http://localhost:8083/api/orders`

---

## 1. Create Order (Checkout)
**Method:** `POST`  
**Endpoint:** `/`

### Required Headers:
- `Authorization`: `Bearer <token>`

### Request Body:
```json
{
  "userId": 14,
  "items": [
    {
      "productId": 8,
      "quantity": 1,
      "price": 99000,
      "name": "iphone15"
    }
  ],
  "totalAmount": 99000,
  "shippingAddress": "123 Main St, Anytown, AT 12345"
}
```

### Expected Output (200 OK):
```json
{
  "id": 16,
  "userId": 14,
  "status": "PENDING",
  "totalAmount": 99000,
  "shippingAddress": "123 Main St...",
  "createdAt": "2026-02-09T...",
  "items": [...]
}
```

---

## 2. Get User Orders
**Method:** `GET`  
**Endpoint:** `/user/{userId}`

### Required Headers:
- `Authorization`: `Bearer <token>`

---

## 3. Get All Orders (Admin)
**Method:** `GET`  
**Endpoint:** `/`

### Required Headers:
- `Authorization`: `Bearer <admin_token>`

---

## 4. Update Order Status (Admin)
**Method:** `PUT`  
**Endpoint:** `/{id}/status?status={APPROVED|DENIED|DELIVERED}`

### Expected Output (200 OK):
Returns the updated order object and triggers a customer notification.
