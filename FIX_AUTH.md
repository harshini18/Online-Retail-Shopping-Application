# Quick Fix Guide

## Problem
The backend `RegisterRequest` DTO didn't have a `role` field, so the frontend couldn't specify CUSTOMER vs ADMIN during registration.

## What I Fixed
1. ✅ Added `role` field to `RegisterRequest.java`
2. ✅ Updated `UserService.java` to use the role from the request
3. ✅ Changed frontend from sending "USER" to "CUSTOMER"

## What You Need to Do

### Step 1: Restart the User Service
The user-service needs to be restarted to pick up the code changes:

1. In the terminal running `user-service`, press `Ctrl+C` to stop it
2. Then run it again with: `mvn spring-boot:run` in the `user-service` directory

OR easier - just restart all services by closing all terminals and running:
```powershell
# In the main project directory
cd eureka-server; mvn spring-boot:run
# Open new terminals for each service...
```

### Step 2: Test Customer Signup
1. Go to http://localhost:3000/
2. Click **Customer** → **Continue**
3. At the bottom, click "Don't have an account? Sign Up"
4. Fill in the form and submit
5. Should redirect to customer dashboard!

### Step 3: Create an Admin Account
Use PowerShell/Command Prompt:
```powershell
curl -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"ADMIN\"}"
```

Then login at http://localhost:3000/ → Click **Admin** → **Continue** with:
- Email: admin@test.com
- Password: admin123

## Why It Wasn't Working
- Backend was ignoring the `role` field from frontend
- Frontend was sending "USER" but backend expected "CUSTOMER"
- Both issues are now fixed!
