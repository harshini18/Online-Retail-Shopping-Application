# Database Setup Guide

This project consists of multiple microservices, each with its own database to ensure data isolation. Follow the instructions below to set up your MySQL environment.

## Prerequisites
- **MySQL Server** (Version 8.0+ recommended)
- **MySQL User**: `root`
- **MySQL Password**: `Deepika@18`

> [!NOTE]
> If you have a different root password, you will need to update the `src/main/resources/application.yml` (or `application.properties`) file in each service folder.

## Required Databases

Create the following databases in your MySQL instance:

```sql
CREATE DATABASE IF NOT EXISTS retail_user_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS retail_inventory_db;
CREATE DATABASE IF NOT EXISTS retail_cart_db;
CREATE DATABASE IF NOT EXISTS retail_payment_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS retail_notification_db;
```

## Automatic Table Creation
The services are configured with `ddl-auto: update`, which means the tables will be automatically created when each service starts. You only need to ensure the empty databases exist.

## Manual Initializations

### 1. Admin User Setup
To log in to the admin portal, you need at least one user with the `ADMIN` role. You can create one by running this SQL in `retail_user_db`:

```sql
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) 
VALUES ('admin@retail.com', '$2a$10$Ukg9xZBqhVY.VggAvDWfkuaC9Rpaunnel5E/KPuSjKy3DsIsaEpgW', 'Admin', 'User', 'ADMIN', NOW(), NOW());
```
*(The password above is `admin123` hashed with BCrypt)*

### 2. Category & Product Presets
While not strictly required for the app to run, it is recommended to populate some categories and products via the Admin Dashboard or by importing a JSON/SQL dump if provided.

## Database Connection Summary

| Service | Database Name | Port |
|---------|---------------|------|
| User | `retail_user_db` | 3306 |
| Product | `product_db` | 3306 |
| Inventory | `retail_inventory_db` | 3306 |
| Cart | `retail_cart_db` | 3306 |
| Order | `order_db` | 3306 |
| Payment | `retail_payment_db` | 3306 |
| Notification | `retail_notification_db` | 3306 |

## Troubleshooting
- **Connection Refused**: Ensure MySQL is running on port 3306.
- **Access Denied**: Verify the password in the service configuration files matches your MySQL root password.
- **Missing Columns**: If you see "Unknown column" errors, ensure `hibernate.ddl-auto` is set to `update` (it is by default).
