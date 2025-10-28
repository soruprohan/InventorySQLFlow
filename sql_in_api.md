# SQL Operations Used in API Folder
## Complete Reference of SQL Queries by Type

This document catalogs all SQL operations found in the `/api` folder, organized by SQL operation type.

---

## Table of Contents
1. [SELECT Queries](#select-queries)
2. [INSERT Queries](#insert-queries)
3. [UPDATE Queries](#update-queries)
4. [DELETE Queries](#delete-queries)
5. [JOIN Operations](#join-operations)
6. [Aggregate Functions](#aggregate-functions)
7. [Filtering & Conditions](#filtering--conditions)
8. [Sorting & Ordering](#sorting--ordering)
9. [Grouping](#grouping)
10. [Date Functions](#date-functions)
11. [Summary Statistics](#summary-statistics)

---

## SELECT Queries

### Basic SELECT
**Files:** All API files  
**Usage:** Retrieving data from database tables

#### api/products.php
```sql
-- Get single product with categories and suppliers
SELECT p.*, c.category_name, s.supplier_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
WHERE p.product_id = [id]

-- Get all products
SELECT p.*, c.category_name, s.supplier_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
ORDER BY p.product_id DESC
```

#### api/suppliers.php
```sql
-- Get single supplier
SELECT * FROM suppliers WHERE supplier_id = [id]

-- Get all suppliers with DISTINCT
SELECT DISTINCT * FROM suppliers ORDER BY supplier_id DESC
```

#### api/categories.php
```sql
-- Get single category with product count
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
WHERE c.category_id = [id]
GROUP BY c.category_id, c.category_name, c.description

-- Get all categories with product count
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name, c.description
ORDER BY c.category_name
```

#### api/warehouses.php
```sql
-- Get single warehouse
SELECT * FROM warehouses WHERE warehouse_id = [id]

-- Get all warehouses
SELECT * FROM warehouses ORDER BY warehouse_id DESC
```

#### api/inventory.php
```sql
-- Get all inventory with product and warehouse details
SELECT 
    i.*,
    p.product_name,
    p.unit_price,
    p.reorder_level,
    w.warehouse_name,
    w.location
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
ORDER BY i.inventory_id DESC
```

#### api/purchase_orders.php
```sql
-- Get single purchase order with supplier
SELECT po.*, s.supplier_name 
FROM purchase_orders po 
LEFT OUTER JOIN suppliers s ON po.supplier_id = s.supplier_id 
WHERE po.po_id = [id]

-- Get all purchase orders
SELECT po.*, s.supplier_name 
FROM purchase_orders po 
LEFT OUTER JOIN suppliers s ON po.supplier_id = s.supplier_id 
ORDER BY po.po_id DESC
```

#### api/transactions.php
```sql
-- Get single transaction
SELECT t.*, p.product_name, w.warehouse_name 
FROM inventory_transactions t 
LEFT JOIN products p ON t.product_id = p.product_id 
LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id 
WHERE t.transaction_id = [id]

-- Get all transactions with limit
SELECT t.*, p.product_name, w.warehouse_name 
FROM inventory_transactions t 
LEFT JOIN products p ON t.product_id = p.product_id 
LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id 
ORDER BY t.transaction_date DESC 
LIMIT [limit]
```

#### api/adjustments.php
```sql
-- Get all stock adjustments
SELECT sa.*, p.product_name, w.warehouse_name 
FROM stock_adjustments sa 
LEFT JOIN products p ON sa.product_id = p.product_id 
LEFT JOIN warehouses w ON sa.warehouse_id = w.warehouse_id 
ORDER BY sa.adjustment_date DESC
```

#### api/dashboard.php
```sql
-- Total active products
SELECT COUNT(*) as total FROM products WHERE is_active = 1

-- Total inventory records
SELECT COUNT(*) as total FROM inventory

-- Total suppliers
SELECT COUNT(*) as total FROM suppliers

-- Pending orders count
SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'PENDING'
```

---

## INSERT Queries

### Basic INSERT INTO

#### api/products.php
```sql
INSERT INTO products 
(product_name, description, unit_price, unit_of_measure, reorder_level, category_id, supplier_id, is_active, created_date) 
VALUES ('[name]', '[desc]', [price], '[uom]', [reorder], [cat_id], [sup_id], 1, CURDATE())
```

#### api/suppliers.php
```sql
INSERT INTO suppliers 
(supplier_name, contact_person, phone, email, address, created_date) 
VALUES ('[name]', '[person]', '[phone]', '[email]', '[address]', CURDATE())
```

#### api/categories.php
```sql
INSERT INTO categories 
(category_name, description) 
VALUES ('[name]', '[description]')
```

#### api/warehouses.php
```sql
INSERT INTO warehouses 
(warehouse_name, location, manager_name, phone, is_active) 
VALUES ('[name]', '[location]', '[manager]', '[phone]', 1)
```

#### api/purchase_orders.php
```sql
INSERT INTO purchase_orders 
(po_number, supplier_id, order_date, expected_delivery, status, total_amount, notes, created_date) 
VALUES ('[po_num]', [sup_id], '[order_date]', '[exp_delivery]', 'PENDING', [amount], '[notes]', NOW())
```

#### api/transactions.php
```sql
INSERT INTO inventory_transactions 
(product_id, warehouse_id, transaction_type, quantity_change, unit_cost, reference_number, notes, transaction_date) 
VALUES ([prod_id], [wh_id], '[type]', [qty], [cost], '[ref]', '[notes]', NOW())
```

#### api/adjustments.php
```sql
-- Insert stock adjustment
INSERT INTO stock_adjustments 
(product_id, warehouse_id, old_quantity, new_quantity, adjustment_quantity, reason, adjusted_by, notes, adjustment_date) 
VALUES ([prod_id], [wh_id], [old_qty], [new_qty], [adj_qty], '[reason]', '[adjusted_by]', '[notes]', NOW())

-- Insert corresponding transaction
INSERT INTO inventory_transactions 
(product_id, warehouse_id, transaction_type, quantity_change, notes, transaction_date) 
VALUES ([prod_id], [wh_id], '[type]', [adj_qty], 'Stock adjustment: [reason]', NOW())
```

---

## UPDATE Queries

### Basic UPDATE

#### api/products.php
```sql
UPDATE products SET 
product_name = '[name]', 
description = '[desc]', 
unit_price = [price], 
unit_of_measure = '[uom]', 
reorder_level = [reorder], 
category_id = [cat_id], 
supplier_id = [sup_id] 
WHERE product_id = [id]

-- Soft delete (set inactive)
UPDATE products SET is_active = 0 WHERE product_id = [id]
```

#### api/categories.php
```sql
UPDATE categories SET 
category_name = '[name]', 
description = '[desc]' 
WHERE category_id = [id]
```

#### api/warehouses.php
```sql
UPDATE warehouses SET 
warehouse_name = '[name]', 
location = '[location]', 
manager_name = '[manager]', 
phone = '[phone]' 
WHERE warehouse_id = [id]
```

#### api/purchase_orders.php
```sql
UPDATE purchase_orders SET 
status = '[status]', 
total_amount = [amount], 
notes = '[notes]' 
WHERE po_id = [id]
```

#### api/transactions.php
```sql
UPDATE inventory_transactions SET 
product_id = [prod_id], 
warehouse_id = [wh_id], 
transaction_type = '[type]', 
quantity_change = [qty], 
unit_cost = [cost], 
reference_number = '[ref]', 
notes = '[notes]' 
WHERE transaction_id = [id]
```

#### api/inventory.php
```sql
UPDATE inventory SET 
quantity_on_hand = [qty], 
last_updated = NOW() 
WHERE product_id = [prod_id] AND warehouse_id = [wh_id]
```

#### api/adjustments.php
```sql
-- Update inventory quantity
UPDATE inventory SET 
quantity_on_hand = [new_qty], 
last_updated = NOW() 
WHERE product_id = [prod_id] AND warehouse_id = [wh_id]
```

---

## DELETE Queries

### Basic DELETE

#### api/suppliers.php
```sql
DELETE FROM suppliers WHERE supplier_id = [id]
```

#### api/categories.php
```sql
DELETE FROM categories WHERE category_id = [id]
```

#### api/warehouses.php
```sql
DELETE FROM warehouses WHERE warehouse_id = [id]
```

#### api/purchase_orders.php
```sql
DELETE FROM purchase_orders WHERE po_id = [id]
```

#### api/transactions.php
```sql
DELETE FROM inventory_transactions WHERE transaction_id = [id]
```

**Note:** Products use soft delete (UPDATE is_active = 0) instead of hard DELETE

---

## JOIN Operations

### INNER JOIN

#### api/inventory.php
```sql
-- Multiple INNER JOINs
SELECT i.*, p.product_name, p.unit_price, p.reorder_level, w.warehouse_name, w.location
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
```

### LEFT JOIN (LEFT OUTER JOIN)

#### api/products.php
```sql
SELECT p.*, c.category_name, s.supplier_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
```

#### api/categories.php
```sql
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name, c.description
```

#### api/purchase_orders.php
```sql
SELECT po.*, s.supplier_name 
FROM purchase_orders po 
LEFT OUTER JOIN suppliers s ON po.supplier_id = s.supplier_id
```

#### api/transactions.php
```sql
SELECT t.*, p.product_name, w.warehouse_name 
FROM inventory_transactions t 
LEFT JOIN products p ON t.product_id = p.product_id 
LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id
```

#### api/adjustments.php
```sql
SELECT sa.*, p.product_name, w.warehouse_name 
FROM stock_adjustments sa 
LEFT JOIN products p ON sa.product_id = p.product_id 
LEFT JOIN warehouses w ON sa.warehouse_id = w.warehouse_id
```

---

## Aggregate Functions

### COUNT()

#### api/dashboard.php
```sql
-- Count active products
SELECT COUNT(*) as total FROM products WHERE is_active = 1

-- Count inventory records
SELECT COUNT(*) as total FROM inventory

-- Count suppliers
SELECT COUNT(*) as total FROM suppliers

-- Count pending orders
SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'PENDING'
```

#### api/categories.php
```sql
-- Count products per category
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name, c.description
```

### SUM()
**Note:** Not directly used in current API files, but available in dashboard for future inventory value calculations

### AVG()
**Note:** Available for price calculations, can be added to dashboard or products API

### MIN() / MAX()
**Note:** Available for price range calculations in products API

---

## Filtering & Conditions

### WHERE Clause

#### Simple WHERE
```sql
-- By ID
WHERE product_id = [id]
WHERE supplier_id = [id]
WHERE category_id = [id]
WHERE warehouse_id = [id]
WHERE po_id = [id]
WHERE transaction_id = [id]

-- By Status
WHERE is_active = 1
WHERE status = 'PENDING'
```

#### Combined WHERE with AND
```sql
WHERE product_id = [prod_id] AND warehouse_id = [wh_id]
```

### DISTINCT

#### api/suppliers.php
```sql
SELECT DISTINCT * FROM suppliers ORDER BY supplier_id DESC
```

---

## Sorting & Ordering

### ORDER BY

#### Descending Order (DESC)
```sql
-- Products
ORDER BY p.product_id DESC

-- Suppliers
ORDER BY supplier_id DESC

-- Warehouses
ORDER BY warehouse_id DESC

-- Purchase Orders
ORDER BY po.po_id DESC

-- Transactions
ORDER BY t.transaction_date DESC

-- Adjustments
ORDER BY sa.adjustment_date DESC

-- Inventory
ORDER BY i.inventory_id DESC
```

#### Ascending Order (ASC)
```sql
-- Categories
ORDER BY c.category_name ASC  -- or just ORDER BY c.category_name
```

### LIMIT

#### api/transactions.php
```sql
SELECT t.*, p.product_name, w.warehouse_name 
FROM inventory_transactions t 
LEFT JOIN products p ON t.product_id = p.product_id 
LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id 
ORDER BY t.transaction_date DESC 
LIMIT [limit]
```

---

## Grouping

### GROUP BY

#### api/categories.php
```sql
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name, c.description
ORDER BY c.category_name
```

**Note:** HAVING clause is prepared for in adjustments.php structure but not actively used in current queries

---

## Date Functions

### NOW()
**Usage:** Current timestamp for datetime columns

```sql
-- In INSERT statements
created_date = NOW()
transaction_date = NOW()
adjustment_date = NOW()
last_updated = NOW()
```

**Files:** 
- api/purchase_orders.php
- api/transactions.php
- api/adjustments.php
- api/inventory.php

### CURDATE()
**Usage:** Current date for date-only columns

```sql
-- In INSERT statements
created_date = CURDATE()
```

**Files:**
- api/products.php
- api/suppliers.php

---

## Summary Statistics

### Total SQL Operations by Type

| Operation Type | Count | Files Using |
|---------------|-------|-------------|
| **SELECT** | 15+ | All API files |
| **INSERT** | 8 | All CRUD files |
| **UPDATE** | 7 | 6 files |
| **DELETE** | 5 | 5 files |
| **INNER JOIN** | 1 | inventory.php |
| **LEFT JOIN** | 6+ | products.php, categories.php, purchase_orders.php, transactions.php, adjustments.php |
| **COUNT()** | 5 | dashboard.php, categories.php |
| **WHERE** | 20+ | All files |
| **ORDER BY** | 10+ | Most files |
| **GROUP BY** | 2 | categories.php |
| **LIMIT** | 1 | transactions.php |
| **DISTINCT** | 1 | suppliers.php |
| **NOW()** | 5 | Multiple files |
| **CURDATE()** | 2 | products.php, suppliers.php |

### Files by SQL Complexity

#### High Complexity (Multiple JOINs, Aggregates)
- ✅ **api/categories.php** - LEFT JOIN + COUNT + GROUP BY
- ✅ **api/inventory.php** - Multiple INNER JOINs
- ✅ **api/adjustments.php** - Multiple INSERT + UPDATE in transaction

#### Medium Complexity (JOINs, Conditions)
- ✅ **api/products.php** - Multiple LEFT JOINs, UPDATE, soft DELETE
- ✅ **api/purchase_orders.php** - LEFT OUTER JOIN
- ✅ **api/transactions.php** - LEFT JOIN + ORDER BY + LIMIT
- ✅ **api/dashboard.php** - Multiple aggregate COUNT queries

#### Basic Complexity (Simple CRUD)
- ✅ **api/suppliers.php** - Basic CRUD with DISTINCT
- ✅ **api/warehouses.php** - Basic CRUD operations

### SQL Features Coverage

✅ **Basic CRUD**
- CREATE (INSERT INTO) - All files
- READ (SELECT) - All files  
- UPDATE - 6 files
- DELETE - 5 files

✅ **JOINs**
- INNER JOIN - inventory.php
- LEFT JOIN - products.php, categories.php, transactions.php, adjustments.php
- LEFT OUTER JOIN - purchase_orders.php

✅ **Aggregate Functions**
- COUNT(*) - dashboard.php, categories.php

✅ **Clauses**
- WHERE - All files
- ORDER BY - Most files
- GROUP BY - categories.php
- LIMIT - transactions.php
- DISTINCT - suppliers.php

✅ **Date Functions**
- NOW() - 5 files
- CURDATE() - 2 files

✅ **Special Features**
- Soft Delete - products.php (UPDATE is_active = 0)
- Multiple related queries - adjustments.php
- Aggregate with GROUP BY - categories.php
- Query result limiting - transactions.php

---

## File-by-File SQL Operations Summary

### api/config.php
**SQL Operations:** Query execution wrapper, connection management  
**Key Functions:** `executeQuery()`, `getConnection()`

### api/dashboard.php
**SQL Operations:**
- 4x SELECT with COUNT()
- WHERE clause filtering
- Multiple aggregate queries

### api/products.php
**SQL Operations:**
- SELECT with multiple LEFT JOINs
- INSERT INTO
- UPDATE
- Soft DELETE (UPDATE is_active = 0)
- WHERE conditions
- ORDER BY DESC
- CURDATE()

### api/suppliers.php
**SQL Operations:**
- SELECT with DISTINCT
- INSERT INTO
- DELETE
- WHERE conditions
- ORDER BY DESC
- CURDATE()

### api/categories.php
**SQL Operations:**
- SELECT with LEFT JOIN
- COUNT() aggregate
- GROUP BY
- INSERT INTO
- UPDATE
- DELETE
- WHERE conditions
- ORDER BY ASC

### api/warehouses.php
**SQL Operations:**
- SELECT
- INSERT INTO
- UPDATE
- DELETE
- WHERE conditions
- ORDER BY DESC

### api/inventory.php
**SQL Operations:**
- SELECT with multiple INNER JOINs
- UPDATE with NOW()
- WHERE with AND
- ORDER BY DESC

### api/purchase_orders.php
**SQL Operations:**
- SELECT with LEFT OUTER JOIN
- INSERT INTO with NOW()
- UPDATE
- DELETE
- WHERE conditions
- ORDER BY DESC

### api/transactions.php
**SQL Operations:**
- SELECT with multiple LEFT JOINs
- INSERT INTO with NOW()
- UPDATE
- DELETE
- WHERE conditions
- ORDER BY DESC
- LIMIT

### api/adjustments.php
**SQL Operations:**
- SELECT with multiple LEFT JOINs
- Multiple INSERT statements (adjustment + transaction)
- UPDATE inventory with NOW()
- Transaction-like behavior (multiple related queries)
- WHERE conditions
- ORDER BY DESC

### api/execute_sql.php
**SQL Operations:**
- Dynamic SQL execution
- Query type detection
- Security checks
- Result formatting

---

## Advanced SQL Patterns

### Transaction Pattern (Multiple Related Queries)

#### api/adjustments.php
```sql
-- Step 1: Insert adjustment record
INSERT INTO stock_adjustments (...) VALUES (...)

-- Step 2: Update inventory
UPDATE inventory SET quantity_on_hand = [new_qty] WHERE ...

-- Step 3: Create transaction record
INSERT INTO inventory_transactions (...) VALUES (...)
```

### Aggregate with JOIN Pattern

#### api/categories.php
```sql
SELECT c.*, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name, c.description
```

### Multiple JOIN Pattern

#### api/inventory.php
```sql
SELECT i.*, p.product_name, p.unit_price, p.reorder_level, 
       w.warehouse_name, w.location
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
```

---

## Notes

1. **All files use parameterized values** (shown as [id], [name], etc.) which are sanitized through the `sanitize()` function in config.php
2. **Foreign key relationships** are maintained through JOIN operations
3. **Soft delete** is used for products to maintain data integrity
4. **Hard delete** is used for other entities (suppliers, categories, warehouses, etc.)
5. **Timestamps** use either NOW() for datetime or CURDATE() for date-only fields
6. **Security:** All inputs are sanitized using `mysqli_real_escape_string()` in the sanitize() function

---

## SQL Learning Path

**Beginner Level:**
1. Start with api/suppliers.php (basic CRUD)
2. Move to api/warehouses.php (basic CRUD)

**Intermediate Level:**
3. Study api/products.php (LEFT JOINs)
4. Explore api/dashboard.php (aggregate functions)
5. Review api/categories.php (GROUP BY with COUNT)

**Advanced Level:**
6. Analyze api/inventory.php (INNER JOINs)
7. Understand api/transactions.php (complex queries with LIMIT)
8. Master api/adjustments.php (multiple related queries)

---

**Document Generated:** 2025  
**Total API Files Analyzed:** 11  
**Total Unique SQL Operations:** 50+  
**Coverage:** Complete API folder analysis