# InventIQ SQL Database Guide

This guide provides the SQL commands needed to view and manage the InventIQ database in MySQL Workbench.

## Connection Setup

1. Open MySQL Workbench
2. Create a new connection with the following details:
   - Connection Name: InventIQ
   - Hostname: localhost
   - Port: 3306
   - Username: root
   - Password: (your MySQL password)

## Viewing Database Tables

### View all databases
```sql
SHOW DATABASES;
```

### Select the InventIQ database
```sql
USE inventiq;
```

### View all tables in the database
```sql
SHOW TABLES;
```

## Querying Product Data

### View all products
```sql
SELECT * FROM products;
```

### View low stock products
```sql
SELECT * FROM products WHERE current_stock <= reorder_level AND current_stock > 0;
```

### View out of stock products
```sql
SELECT * FROM products WHERE current_stock = 0;
```

### View products by category
```sql
SELECT * FROM products WHERE category = 'Electronics';
```

### View products by supplier
```sql
SELECT * FROM products WHERE supplier = 'Supplier A';
```

## Querying Transaction Data

### View all transactions
```sql
SELECT * FROM transactions;
```

### View transactions for a specific product
```sql
SELECT * FROM transactions WHERE product_id = 'P0001';
```

### View transactions by type
```sql
SELECT * FROM transactions WHERE transaction_type = 'sale';
```

### View recent transactions
```sql
SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 10;
```

## Joining Tables for Advanced Queries

### View products with their transaction counts
```sql
SELECT p.id, p.name, p.category, p.current_stock, COUNT(t.id) as transaction_count 
FROM products p 
LEFT JOIN transactions t ON p.id = t.product_id 
GROUP BY p.id;
```

### View sales by category
```sql
SELECT p.category, SUM(t.quantity) as total_sales 
FROM products p 
JOIN transactions t ON p.id = t.product_id 
WHERE t.transaction_type = 'sale' 
GROUP BY p.category;
```

## Database Maintenance

### Check database status
```sql
STATUS;
```

### Optimize tables
```sql
OPTIMIZE TABLE products, transactions;
```

### Backup the database (Run this in your OS terminal, not in MySQL)
```bash
mysqldump -u root -p inventiq > inventiq_backup.sql
```

### Restore the database (Run this in your OS terminal, not in MySQL)
```bash
mysql -u root -p inventiq < inventiq_backup.sql
```

## Troubleshooting

If you encounter any issues with database reflection:

1. Ensure the MySQL service is running
2. Verify your connection settings
3. Check that the database exists
4. Ensure you have proper permissions

For more advanced queries or database management, refer to the MySQL documentation.
