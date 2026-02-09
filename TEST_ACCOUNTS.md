# Testing Authentication

## Create a Customer Account

1. Go to http://localhost:3000/
2. Click "Customer" card with "Login" button
3. You should see "Customer Login" page
4. **Look at the bottom** - there's a link that says "Don't have an account? Sign Up"
5. Click that link to switch to sign-up mode
6. Fill in:
   - First Name: John
   - Last Name: Doe  
   - Phone: 1234567890
   - Email: customer@test.com
   - Password: password123
7. Click "Create Account"

## Create an Admin Account (via API)

Since admin accounts should not be created through the UI for security, use this curl command:

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"ADMIN\"}"
```

Or use Postman/Insomnia with:
- URL: POST http://localhost:8080/api/users/register
- Body (JSON):
```json
{
  "email": "admin@test.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

Then login at http://localhost:3000/admin/login with:
- Email: admin@test.com
- Password: admin123
