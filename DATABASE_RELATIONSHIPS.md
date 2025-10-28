# Database Relationships Implementation Guide

## Overview
This document explains where each database relationship is implemented in the Inventory Management System, covering both database schema (SQL) and application code (PHP/JavaScript).

---

## 1. Suppliers ↔ Products (One-to-Many)
**Relationship:** `suppliers.supplier_id → products.supplier_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 99)
- **Foreign Key:** 
  ```sql
  ALTER TABLE `products` ADD FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);
  ```
- **Behavior:** ON DELETE SET NULL (if supplier deleted, product keeps existing with NULL supplier)

### Frontend Implementation
- **Location:** `index.html` / `index.php`
- **Form:** Products section - Add/Edit Product forms
  - Line ~95: `<select name="supplier_id" required id="product-supplier-select">`
  - Line ~145: `<select name="supplier_id" required id="edit-product-supplier-select">`

### Backend Implementation
- **API:** `api/products.php`
  - POST method: Creates product with `supplier_id`
  - PUT method: Updates product including `supplier_id`
  - GET method with JOIN:
    ```sql
    SELECT p.*, c.category_name, s.supplier_name 
    FROM products p 
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    ```

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadSuppliersForSelect()` - Populates supplier dropdown
  - `handleProductSubmit()` - Sends supplier_id when creating product
  - `handleProductUpdate()` - Updates supplier_id when editing product
  - `displayProducts()` - Shows supplier name in product list

### Example Usage
```javascript
// When creating a product
{
  product_name: "Wireless Mouse",
  supplier_id: 3,  // Links to "Global Electronics"
  category_id: 1,
  unit_price: 25.99
}
```

---

## 2. Categories ↔ Products (One-to-Many)
**Relationship:** `categories.category_id → products.category_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 97)
- **Foreign Key:**
  ```sql
  ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);
  ```
- **Behavior:** ON DELETE SET NULL

### Frontend Implementation
- **Location:** `index.html` / `index.php`
- **Forms:**
  - Add Product: Line ~92 `<select name="category_id" required id="product-category-select">`
  - Edit Product: Line ~142 `<select name="category_id" required id="edit-product-category-select">`
- **Categories Section:** Lines 283-351 (Full CRUD for categories)
  - Add Category Form
  - Edit Category Form
  - View/Delete buttons

### Backend Implementation
- **API:** `api/categories.php` (NEW - Added in this session)
  - GET: Retrieve all categories with product count
    ```sql
    SELECT c.*, COUNT(p.product_id) as product_count 
    FROM categories c 
    LEFT JOIN products p ON c.category_id = p.category_id 
    GROUP BY c.category_id
    ```
  - POST: Create new category
  - PUT: Update category
  - DELETE: Delete category
  
- **API:** `api/products.php`
  - Uses category_id in INSERT/UPDATE
  - JOINs with categories table to show category_name

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadCategories()` - Displays all categories (Line ~715)
  - `loadCategoriesForSelect()` - Populates category dropdown
  - `handleCategorySubmit()` - Creates new category
  - `handleCategoryUpdate()` - Updates category
  - `deleteCategory()` - Deletes category with confirmation
  - `viewCategory()` - Shows category details with product count

### Example Usage
```sql
-- Category with multiple products
Electronics (category_id: 1)
  ├── Laptop Computer (product_id: 1)
  ├── Wireless Mouse (product_id: 2)
  └── USB Flash Drive (product_id: 3)
```

---

## 3. Products ↔ Inventory (One-to-Many)
**Relationship:** `products.product_id → inventory.product_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 101)
- **Foreign Key:**
  ```sql
  ALTER TABLE `inventory` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
  ```
- **Behavior:** ON DELETE CASCADE (if product deleted, inventory records deleted)

### Frontend Implementation
- **Location:** `index.html`
- **Section:** Inventory Management (Lines ~185-237)
- **Display:** Shows product name, warehouse, and quantity

### Backend Implementation
- **API:** `api/inventory.php`
  - GET: Retrieves inventory with product details
    ```sql
    SELECT 
      i.*,
      p.product_name,
      p.unit_price,
      c.category_name,
      w.warehouse_name
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    ```
  - POST: Creates inventory record for product in warehouse
  - PUT: Updates inventory quantity

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadInventory()` - Shows all inventory records
  - `displayInventory()` - Renders inventory table with product names
  - `viewInventory()` - Shows detailed inventory info for specific product/warehouse

### Example Usage
```sql
-- One product in multiple warehouses
Laptop Computer (product_id: 1)
  ├── Main Warehouse: 50 units
  ├── North Branch: 30 units
  └── South Branch: 20 units
```

---

## 4. Warehouses ↔ Inventory (One-to-Many)
**Relationship:** `warehouses.warehouse_id → inventory.warehouse_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 103)
- **Foreign Key:**
  ```sql
  ALTER TABLE `inventory` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);
  ```
- **Behavior:** ON DELETE CASCADE

### Frontend Implementation
- **Location:** `index.html`
- **Warehouses Section:** Lines 353-455 (NEW - Added in this session)
  - Add Warehouse Form
  - Edit Warehouse Form  
  - View/Delete buttons
- **Inventory Section:** Uses warehouse dropdown for stock adjustments

### Backend Implementation
- **API:** `api/warehouses.php` (UPDATED - Added PUT method)
  - GET: Retrieve all warehouses
  - GET with id: Single warehouse details
  - POST: Create new warehouse
  - PUT: Update warehouse (NEW)
  - DELETE: Hard delete warehouse (UPDATED from soft delete)

- **API:** `api/inventory.php`
  - JOINs with warehouses to show warehouse_name

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadWarehouses()` - Displays all warehouses (Line ~895)
  - `loadWarehousesForSelect()` - Populates warehouse dropdowns
  - `handleWarehouseSubmit()` - Creates new warehouse
  - `handleWarehouseUpdate()` - Updates warehouse
  - `deleteWarehouse()` - Deletes warehouse with confirmation
  - `viewWarehouse()` - Shows warehouse details

### Example Usage
```sql
-- One warehouse stores multiple products
Main Warehouse (warehouse_id: 1)
  ├── Laptop Computer: 50 units
  ├── Wireless Mouse: 200 units
  ├── Office Chair: 75 units
  └── Desk Lamp: 150 units
```

---

## 5. Suppliers ↔ Purchase Orders (One-to-Many)
**Relationship:** `suppliers.supplier_id → purchase_orders.supplier_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 105)
- **Foreign Key:**
  ```sql
  ALTER TABLE `purchase_orders` ADD FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);
  ```
- **Behavior:** ON DELETE SET NULL

### Frontend Implementation
- **Location:** `index.html`
- **Section:** Purchase Orders (Lines ~457-522)
- **Form:** `<select name="supplier_id" required id="po-supplier-select">`

### Backend Implementation
- **API:** `api/purchase_orders.php`
  - GET: Retrieves POs with supplier details
    ```sql
    SELECT po.*, s.supplier_name, s.contact_person 
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
    ```
  - POST: Creates PO with supplier_id
  - DELETE: Deletes purchase order

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadPurchaseOrders()` - Shows all POs with supplier names
  - `handlePOSubmit()` - Creates PO linked to supplier
  - `viewPO()` - Shows PO details including supplier info

### Example Usage
```sql
-- One supplier has multiple purchase orders
Office Depot Corp (supplier_id: 2)
  ├── PO-001: $5,000 (Pending)
  ├── PO-005: $3,200 (Received)
  └── PO-012: $7,500 (Approved)
```

---

## 6. Purchase Orders ↔ Purchase Order Items (One-to-Many)
**Relationship:** `purchase_orders.po_id → purchase_order_items.po_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 107)
- **Foreign Key:**
  ```sql
  ALTER TABLE `purchase_order_items` ADD FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`);
  ```
- **Behavior:** ON DELETE CASCADE

### Frontend Implementation
- **Status:** ⚠️ **NOT FULLY IMPLEMENTED** in current UI
- **Note:** Purchase order items management is missing from the frontend

### Backend Implementation
- **Schema:** Table exists in `mysql_schema_syntax.sql`
- **Table Structure:**
  ```sql
  CREATE TABLE purchase_order_items (
    po_item_id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
  )
  ```
- **API:** ⚠️ No dedicated API file for purchase_order_items yet

### Recommended Implementation
```javascript
// SUGGESTED: Add to api/purchase_order_items.php
GET /api/purchase_order_items.php?po_id=1
POST /api/purchase_order_items.php (create line item)
DELETE /api/purchase_order_items.php?id=5 (remove line item)
```

### Example Usage
```sql
-- One PO contains multiple items
Purchase Order PO-001 (po_id: 1)
  ├── USB Flash Drive: 50 units @ $12.00 = $600
  ├── Wireless Mouse: 20 units @ $25.00 = $500
  └── Keyboard: 10 units @ $45.00 = $450
  Total: $1,550
```

---

## 7. Products ↔ Purchase Order Items (One-to-Many)
**Relationship:** `products.product_id → purchase_order_items.product_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 109)
- **Foreign Key:**
  ```sql
  ALTER TABLE `purchase_order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
  ```

### Implementation Status
- **Status:** ⚠️ **NOT IMPLEMENTED** in application layer
- **Exists:** Database table and foreign key only
- **Missing:** Frontend forms, backend API, JavaScript functions

### Example Usage
```sql
-- One product appears in multiple POs
USB Flash Drive (product_id: 3)
  ├── PO-001: 50 units ordered
  ├── PO-003: 100 units ordered
  └── PO-007: 75 units ordered
```

---

## 8. Products ↔ Inventory Transactions (One-to-Many)
**Relationship:** `products.product_id → inventory_transactions.product_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 111)
- **Foreign Key:**
  ```sql
  ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
  ```

### Frontend Implementation
- **Location:** `index.html`
- **Section:** Transactions (Lines ~524-640)
- **Forms:**
  - Add Transaction Form
  - Edit Transaction Form (IMPLEMENTED in this session)

### Backend Implementation
- **API:** `api/transactions.php`
  - GET: Retrieves transactions with product details
    ```sql
    SELECT 
      t.*,
      p.product_name,
      w.warehouse_name,
      po.po_number
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.product_id
    JOIN warehouses w ON t.warehouse_id = w.warehouse_id
    LEFT JOIN purchase_orders po ON t.po_id = po.po_id
    ```
  - POST: Create transaction (IN, OUT, TRANSFER, ADJUSTMENT)
  - PUT: Update transaction (ADDED in this session)
  - DELETE: Delete transaction

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `loadTransactions()` - Shows all transactions
  - `handleTransactionSubmit()` - Creates transaction
  - `handleTransactionUpdate()` - Updates transaction (NEW)
  - `editTransaction()` - Opens edit form (NEW)
  - `deleteTransaction()` - Deletes with confirmation
  - `viewTransaction()` - Shows transaction details

### Example Usage
```sql
-- Transaction history for one product
Laptop Computer (product_id: 1)
  ├── 2025-01-15: IN +50 units (PO-001 received)
  ├── 2025-01-20: OUT -5 units (Sales order)
  ├── 2025-01-25: TRANSFER -10 units (to Branch)
  └── 2025-02-01: ADJUSTMENT -2 units (Damaged)
```

---

## 9. Warehouses ↔ Inventory Transactions (One-to-Many)
**Relationship:** `warehouses.warehouse_id → inventory_transactions.warehouse_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 113)
- **Foreign Key:**
  ```sql
  ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);
  ```

### Implementation
- Same as relationship #8 above
- Transaction forms include warehouse selection
- All transactions tracked by warehouse location

### Example Usage
```sql
-- All transactions at one warehouse
Main Warehouse (warehouse_id: 1)
  ├── 2025-01-15: Laptop IN +50 units
  ├── 2025-01-16: Mouse IN +200 units
  ├── 2025-01-20: Laptop OUT -5 units
  └── 2025-01-25: Chair IN +75 units
```

---

## 10. Purchase Orders ↔ Inventory Transactions (One-to-Many)
**Relationship:** `purchase_orders.po_id → inventory_transactions.po_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 115)
- **Foreign Key:**
  ```sql
  ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`);
  ```
- **Note:** This field is OPTIONAL (can be NULL for non-PO transactions)

### Frontend Implementation
- **Location:** `index.html` - Transactions section
- **Form Field:** Reference Number (can include PO number)

### Backend Implementation
- **API:** `api/transactions.php`
  - Links transactions to purchase orders when items are received
  - JOINs with purchase_orders to show PO number

### Example Usage
```sql
-- When PO-001 is received, it creates transactions
Purchase Order PO-001 (po_id: 1)
  ├── Transaction #45: USB Drive IN +50 units (Main Warehouse)
  ├── Transaction #46: Mouse IN +20 units (Main Warehouse)
  └── Transaction #47: Keyboard IN +10 units (Main Warehouse)
```

---

## 11. Products ↔ Stock Adjustments (One-to-Many)
**Relationship:** `products.product_id → stock_adjustments.product_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 117)
- **Foreign Key:**
  ```sql
  ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
  ```

### Frontend Implementation
- **Location:** `index.html`
- **Section:** Inventory Management - Stock Adjustment Form (Lines ~215-237)
- **Form Fields:**
  - Product selection
  - Warehouse selection
  - Old quantity (auto-filled)
  - New quantity
  - Reason (DAMAGED, EXPIRED, LOST, FOUND, CYCLE_COUNT, OTHER)
  - Adjusted by
  - Notes

### Backend Implementation
- **API:** `api/stock_adjustments.php`
  - POST: Create adjustment record
    ```sql
    INSERT INTO stock_adjustments 
    (product_id, warehouse_id, old_quantity, new_quantity, reason, adjusted_by, notes)
    VALUES (...)
    ```
  - Also updates inventory.quantity_on_hand
  - Creates corresponding inventory_transaction record

### JavaScript Implementation
- **File:** `js/app.js`
- **Functions:**
  - `showStockAdjustmentForm()` - Opens adjustment form
  - `loadCurrentQuantity()` - Auto-fills current stock level
  - `handleAdjustmentSubmit()` - Saves adjustment

### Example Usage
```sql
-- Adjustment history for one product
USB Flash Drive (product_id: 3)
  ├── 2025-01-10: Qty 100→97 (DAMAGED: 3 units broken)
  ├── 2025-01-20: Qty 97→95 (EXPIRED: 2 units past date)
  └── 2025-02-01: Qty 95→98 (FOUND: 3 units located in storage)
```

---

## 12. Warehouses ↔ Stock Adjustments (One-to-Many)
**Relationship:** `warehouses.warehouse_id → stock_adjustments.warehouse_id`

### Database Implementation
- **Schema File:** `mysql_schema_syntax.sql` (Line 119)
- **Foreign Key:**
  ```sql
  ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);
  ```

### Implementation
- Same as relationship #11 above
- Adjustments are warehouse-specific
- Each adjustment records which warehouse it occurred in

### Example Usage
```sql
-- All adjustments at one warehouse
Main Warehouse (warehouse_id: 1)
  ├── 2025-01-10: USB Drive DAMAGED (-3)
  ├── 2025-01-15: Laptop CYCLE_COUNT (+2)
  └── 2025-01-20: Mouse LOST (-5)
```

---

## Complete Business Flow Example

### Scenario: Ordering and Receiving Laptops

#### Step 1: Create Purchase Order
```sql
-- Relationship #5: Supplier → Purchase Order
INSERT INTO purchase_orders (po_number, supplier_id, order_date, status)
VALUES ('PO-2025-001', 3, '2025-01-15', 'PENDING');
-- Links to "Global Electronics" (supplier_id: 3)
```

**Implemented in:**
- Form: `index.html` - Purchase Orders section
- API: `api/purchase_orders.php` - POST method
- JS: `handlePOSubmit()` in `app.js`

#### Step 2: Add Items to PO
```sql
-- Relationship #6 & #7: PO → PO Items ← Product
INSERT INTO purchase_order_items (po_id, product_id, quantity_ordered, unit_price)
VALUES (1, 1, 50, 899.99);  -- 50 Laptops
-- Links PO-2025-001 to Laptop product
```

**Implementation Status:** ⚠️ **NOT IMPLEMENTED** (Needs development)

#### Step 3: Receive Items
```sql
-- Relationship #8 & #9 & #10: Product + Warehouse + PO → Transaction
INSERT INTO inventory_transactions 
(product_id, warehouse_id, transaction_type, quantity_change, po_id)
VALUES (1, 1, 'IN', 50, 1);
-- Records receipt of 50 laptops at Main Warehouse from PO-2025-001
```

**Implemented in:**
- Form: `index.html` - Transactions section
- API: `api/transactions.php` - POST method
- JS: `handleTransactionSubmit()` in `app.js`

#### Step 4: Update Inventory
```sql
-- Relationship #3 & #4: Product + Warehouse → Inventory
UPDATE inventory 
SET quantity_on_hand = quantity_on_hand + 50
WHERE product_id = 1 AND warehouse_id = 1;
```

**Implemented in:**
- API: `api/stock_adjustments.php` - Auto-updates inventory
- Triggered automatically when transaction is created

#### Step 5: Stock Adjustment (if needed)
```sql
-- Relationship #11 & #12: Product + Warehouse → Adjustment
INSERT INTO stock_adjustments 
(product_id, warehouse_id, old_quantity, new_quantity, reason)
VALUES (1, 1, 50, 48, 'DAMAGED');
-- 2 laptops damaged during inspection
```

**Implemented in:**
- Form: `index.html` - Inventory section, Stock Adjustment form
- API: `api/stock_adjustments.php` - POST method
- JS: `handleAdjustmentSubmit()` in `app.js`

---

## Implementation Summary

### ✅ Fully Implemented Relationships
1. ✅ Suppliers → Products
2. ✅ Categories → Products  
3. ✅ Products → Inventory
4. ✅ Warehouses → Inventory
5. ✅ Suppliers → Purchase Orders
8. ✅ Products → Inventory Transactions
9. ✅ Warehouses → Inventory Transactions
10. ✅ Purchase Orders → Inventory Transactions
11. ✅ Products → Stock Adjustments
12. ✅ Warehouses → Stock Adjustments

### ⚠️ Partially Implemented
6. ⚠️ Purchase Orders → PO Items (Database only, no UI/API)
7. ⚠️ Products → PO Items (Database only, no UI/API)

### 📝 Recommended Next Steps
1. **Implement PO Items Management:**
   - Create `api/purchase_order_items.php`
   - Add UI section for managing PO line items
   - Add JavaScript functions for CRUD operations

2. **Enhance PO Workflow:**
   - Link PO status updates with inventory receipts
   - Auto-create transactions when PO is marked "RECEIVED"
   - Calculate PO totals from line items

3. **Add Reporting:**
   - Product movement history report
   - Supplier performance report
   - Warehouse inventory levels report
   - Adjustment audit trail

---

## File Locations Reference

### Database Schema
- `mysql_schema_syntax.sql` - Complete schema with all foreign keys
- `install_database.sql` - Installation script
- `all_sqls_list.txt` - SQL commands reference

### Backend APIs
- `api/categories.php` - Categories CRUD (**NEW**)
- `api/warehouses.php` - Warehouses CRUD (**UPDATED**)
- `api/products.php` - Products CRUD
- `api/suppliers.php` - Suppliers CRUD
- `api/inventory.php` - Inventory management
- `api/purchase_orders.php` - Purchase orders
- `api/transactions.php` - Inventory transactions (**UPDATED**)
- `api/stock_adjustments.php` - Stock adjustments

### Frontend
- `index.html` / `index.php` - Main application UI
- `login.php` - Login page (**NEW**)
- `logout.php` - Logout script (**NEW**)
- `auth_check.php` - Session authentication (**NEW**)

### JavaScript
- `js/app.js` - All application logic (2000+ lines)
  - Categories management functions (Lines ~715-900)
  - Warehouses management functions (Lines ~900-1100)
  - Transactions CRUD with edit capability
  - All form handlers and data display functions

### Styles
- `css/style.css` - Complete application styling
  - Header with user info (**NEW**)
  - Badge styles for product counts
  - Modal and toast notification styles

---

## SQL Learning Features

Every CRUD operation displays the executed SQL query in the draggable SQL Monitor, allowing users to:
- Learn SQL syntax by seeing real queries
- Understand JOINs and relationships
- Copy queries for learning/testing
- View query history

**Examples shown:**
- `SELECT` with multiple `LEFT JOIN`
- `INSERT INTO` with foreign keys
- `UPDATE` with `WHERE` clauses
- `DELETE FROM` with relationship impacts
- `GROUP BY` with `COUNT()` aggregates
- Subqueries and correlated subqueries

---

*Document last updated: Session with comprehensive Categories and Warehouses CRUD implementation*
