#!/bin/bash

echo "Registering new Admin user..."

curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@retail.com",
    "password": "password123",
    "role": "ADMIN",
    "firstName": "Super",
    "lastName": "Admin"
  }'

echo -e "\n\nDone! Try logging in with:"
echo "Email: superadmin@retail.com"
echo "Password: password123"
