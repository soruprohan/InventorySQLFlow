-- ============================================
-- SQL OPERATIONS QUICK REFERENCE GUIDE
-- Inventory Management System
-- ============================================

-- This file contains examples of all SQL operations
-- demonstrated in the Inventory Management System

-- ============================================
-- 1. TABLE OPERATIONS
-- ============================================

-- CREATE TABLE
CREATE TABLE example_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    created_date DATE DEFAULT (CURDATE())
);

-- DROP TABLE
DROP TABLE IF EXISTS example_table;

-- ALTER TABLE - ADD COLUMN
ALTER TABLE products ADD COLUMN barcode VARCHAR(50);

-- ALTER TABLE - MODIFY COLUMN
ALTER TABLE products MODIFY COLUMN product_name VARCHAR(150);

-- ALTER TABLE - RENAME COLUMN
ALTER TABLE products RENAME COLUMN product_name TO name;

-- ALTER TABLE - DROP COLUMN
ALTER TABLE products DROP COLUMN barcode;

-- ============================================
-- 2. CONSTRAINTS
-- ============================================

-- PRIMARY KEY (defined in CREATE TABLE)
CREATE TABLE test (
    id INT AUTO_INCREMENT PRIMARY KEY
);

-- FOREIGN KEY with ON DELETE CASCADE
ALTER TABLE products 
ADD FOREIGN KEY (category_id) REFERENCES categories(category_id) 
ON DELETE CASCADE;

-- FOREIGN KEY with ON DELETE SET NULL
ALTER TABLE products 
ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) 
ON DELETE SET NULL;

-- UNIQUE constraint
ALTER TABLE categories ADD UNIQUE (category_name);

-- NOT NULL constraint
ALTER TABLE products MODIFY COLUMN product_name VARCHAR(100) NOT NULL;

-- CHECK constraint
ALTER TABLE products ADD CHECK (unit_price >= 0);

-- DEFAULT value
ALTER TABLE products 
ALTER COLUMN is_active SET DEFAULT TRUE;

-- ============================================
-- 3. BASIC CRUD OPERATIONS
-- ============================================

-- INSERT INTO - Single row
INSERT INTO suppliers (supplier_name, contact_person, phone, email) 
VALUES ('ABC Corp', 'John Doe', '555-1234', 'john@abc.com');

-- INSERT INTO - Multiple rows
INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices'),
('Furniture', 'Office furniture'),
('Supplies', 'Office supplies');

-- INSERT INTO ... SELECT
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand)
SELECT product_id, 1, 0 
FROM products 
WHERE product_id NOT IN (SELECT product_id FROM inventory WHERE warehouse_id = 1);

-- SELECT - Basic
SELECT * FROM products;

-- SELECT - Specific columns
SELECT product_name, unit_price FROM products;

-- SELECT DISTINCT
SELECT DISTINCT category_id FROM products;

-- SELECT ALL
SELECT ALL product_name FROM products;

-- SELECT with WHERE
SELECT * FROM products WHERE unit_price > 50;

-- UPDATE
UPDATE products 
SET unit_price = 599.99 
WHERE product_id = 1;

-- DELETE
DELETE FROM suppliers WHERE supplier_id = 5;

-- ============================================
-- 4. WHERE CLAUSE OPERATIONS
-- ============================================

-- BETWEEN
SELECT * FROM products 
WHERE unit_price BETWEEN 20 AND 100;

-- IN
SELECT * FROM products 
WHERE category_id IN (1, 2, 3);

-- LIKE (pattern matching)
SELECT * FROM products 
WHERE product_name LIKE '%laptop%';

-- Multiple conditions
SELECT * FROM products 
WHERE unit_price > 50 AND category_id = 1;

-- ============================================
-- 5. SORTING AND ORDERING
-- ============================================

-- ORDER BY - Ascending
SELECT * FROM products ORDER BY product_name ASC;

-- ORDER BY - Descending
SELECT * FROM products ORDER BY unit_price DESC;

-- ORDER BY - Multiple columns
SELECT * FROM products 
ORDER BY category_id ASC, unit_price DESC;

-- ============================================
-- 6. AGGREGATE FUNCTIONS
-- ============================================

-- COUNT
SELECT COUNT(*) as total_products FROM products;

-- SUM
SELECT SUM(quantity_on_hand) as total_inventory FROM inventory;

-- AVG
SELECT AVG(unit_price) as average_price FROM products;

-- MIN
SELECT MIN(unit_price) as lowest_price FROM products;

-- MAX
SELECT MAX(unit_price) as highest_price FROM products;

-- Multiple aggregates
SELECT 
    COUNT(*) as count,
    MIN(unit_price) as min_price,
    MAX(unit_price) as max_price,
    AVG(unit_price) as avg_price
FROM products;

-- ============================================
-- 7. GROUP BY and HAVING
-- ============================================

-- GROUP BY
SELECT category_id, COUNT(*) as product_count 
FROM products 
GROUP BY category_id;

-- GROUP BY with multiple columns
SELECT category_id, supplier_id, COUNT(*) as count 
FROM products 
GROUP BY category_id, supplier_id;

-- GROUP BY with HAVING
SELECT category_id, COUNT(*) as product_count 
FROM products 
GROUP BY category_id 
HAVING COUNT(*) > 5;

-- GROUP BY with aggregate and HAVING
SELECT 
    category_id, 
    AVG(unit_price) as avg_price,
    COUNT(*) as count
FROM products 
GROUP BY category_id 
HAVING AVG(unit_price) > 100;

-- ============================================
-- 8. JOINS
-- ============================================

-- INNER JOIN
SELECT p.product_name, c.category_name 
FROM products p 
INNER JOIN categories c ON p.category_id = c.category_id;

-- LEFT OUTER JOIN (LEFT JOIN)
SELECT p.product_name, c.category_name 
FROM products p 
LEFT OUTER JOIN categories c ON p.category_id = c.category_id;

-- RIGHT OUTER JOIN (RIGHT JOIN)
SELECT p.product_name, c.category_name 
FROM products p 
RIGHT OUTER JOIN categories c ON p.category_id = c.category_id;

-- Multiple joins
SELECT 
    p.product_name, 
    c.category_name, 
    s.supplier_name,
    i.quantity_on_hand
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
LEFT JOIN inventory i ON p.product_id = i.product_id;

-- USING clause (when column names are same)
SELECT p.product_name, i.quantity_on_hand
FROM products p
INNER JOIN inventory i USING (product_id);

-- NATURAL JOIN (automatic matching of columns)
SELECT * FROM products NATURAL JOIN categories;

-- CROSS JOIN (Cartesian product)
SELECT p.product_name, w.warehouse_name
FROM products p
CROSS JOIN warehouses w;

-- Self Join
SELECT 
    e1.employee_name as employee,
    e2.employee_name as manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id;

-- ============================================
-- 9. SUBQUERIES
-- ============================================

-- Subquery in WHERE clause
SELECT product_name, unit_price 
FROM products 
WHERE unit_price > (SELECT AVG(unit_price) FROM products);

-- Subquery with IN
SELECT product_name 
FROM products 
WHERE category_id IN (
    SELECT category_id 
    FROM categories 
    WHERE category_name LIKE '%Electronic%'
);

-- Subquery in SELECT (scalar subquery)
SELECT 
    product_name,
    unit_price,
    (SELECT AVG(unit_price) FROM products) as avg_price,
    unit_price - (SELECT AVG(unit_price) FROM products) as price_diff
FROM products;

-- Subquery in FROM (derived table)
SELECT 
    category_name, 
    avg_price 
FROM (
    SELECT 
        c.category_name, 
        AVG(p.unit_price) as avg_price
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    GROUP BY c.category_id, c.category_name
) as category_averages
WHERE avg_price > 100;

-- Correlated subquery
SELECT p1.product_name, p1.unit_price
FROM products p1
WHERE p1.unit_price > (
    SELECT AVG(p2.unit_price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);

-- EXISTS subquery
SELECT s.supplier_name
FROM suppliers s
WHERE EXISTS (
    SELECT 1 
    FROM products p 
    WHERE p.supplier_id = s.supplier_id
);

-- ============================================
-- 10. SET OPERATIONS
-- ============================================

-- UNION (removes duplicates)
SELECT product_name FROM products WHERE unit_price > 500
UNION
SELECT product_name FROM products WHERE reorder_level > 20;

-- UNION ALL (keeps duplicates)
SELECT product_name FROM products WHERE unit_price > 500
UNION ALL
SELECT product_name FROM products WHERE category_id = 1;

-- INTERSECT (MySQL doesn't support directly, use JOIN or IN)
SELECT product_name FROM products WHERE unit_price > 500
AND product_name IN (
    SELECT product_name FROM products WHERE category_id = 1
);

-- MINUS / EXCEPT (MySQL doesn't support directly, use NOT IN or LEFT JOIN)
SELECT product_name FROM products WHERE unit_price > 500
AND product_name NOT IN (
    SELECT product_name FROM products WHERE category_id = 1
);

-- ============================================
-- 11. VIEWS
-- ============================================

-- CREATE VIEW
CREATE VIEW vw_product_details AS
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    s.supplier_name,
    p.unit_price
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id;

-- CREATE OR REPLACE VIEW
CREATE OR REPLACE VIEW vw_low_stock AS
SELECT 
    p.product_name,
    i.quantity_on_hand,
    p.reorder_level
FROM products p
JOIN inventory i ON p.product_id = i.product_id
WHERE i.quantity_on_hand <= p.reorder_level;

-- SELECT from VIEW
SELECT * FROM vw_product_details;

-- UPDATE through VIEW (if updatable)
UPDATE vw_product_details 
SET unit_price = 699.99 
WHERE product_id = 1;

-- DROP VIEW
DROP VIEW IF EXISTS vw_product_details;

-- ============================================
-- 12. ADVANCED QUERIES
-- ============================================

-- Complete query with all clauses
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    AVG(p.unit_price) as avg_price,
    SUM(i.quantity_on_hand) as total_stock
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
LEFT JOIN inventory i ON p.product_id = i.product_id
WHERE p.is_active = 1
GROUP BY c.category_id, c.category_name
HAVING COUNT(p.product_id) > 2
ORDER BY total_stock DESC;

-- Window functions (MySQL 8.0+)
SELECT 
    product_name,
    unit_price,
    category_id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY unit_price DESC) as price_rank
FROM products;

-- CASE statement
SELECT 
    product_name,
    unit_price,
    CASE 
        WHEN unit_price > 500 THEN 'Premium'
        WHEN unit_price > 100 THEN 'Standard'
        ELSE 'Budget'
    END as price_category
FROM products;

-- Common Table Expression (CTE)
WITH category_stats AS (
    SELECT 
        category_id,
        COUNT(*) as product_count,
        AVG(unit_price) as avg_price
    FROM products
    GROUP BY category_id
)
SELECT 
    c.category_name,
    cs.product_count,
    cs.avg_price
FROM categories c
JOIN category_stats cs ON c.category_id = cs.category_id;

-- Recursive CTE (for hierarchical data)
WITH RECURSIVE category_hierarchy AS (
    SELECT category_id, category_name, parent_id, 1 as level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.category_id, c.category_name, c.parent_id, ch.level + 1
    FROM categories c
    JOIN category_hierarchy ch ON c.parent_id = ch.category_id
)
SELECT * FROM category_hierarchy;

-- ============================================
-- 13. STRING FUNCTIONS
-- ============================================

-- CONCAT
SELECT CONCAT(supplier_name, ' - ', contact_person) as full_info 
FROM suppliers;

-- SUBSTRING
SELECT SUBSTRING(product_name, 1, 10) as short_name FROM products;

-- UPPER / LOWER
SELECT UPPER(product_name) as uppercase_name FROM products;

-- TRIM
SELECT TRIM(product_name) as trimmed_name FROM products;

-- LENGTH
SELECT product_name, LENGTH(product_name) as name_length FROM products;

-- REGEXP (pattern matching)
SELECT * FROM products WHERE product_name REGEXP '^[A-C]';

-- ============================================
-- 14. DATE FUNCTIONS
-- ============================================

-- CURDATE / CURRENT_DATE
SELECT CURDATE() as today;

-- NOW / CURRENT_TIMESTAMP
SELECT NOW() as current_datetime;

-- DATE_ADD / DATE_SUB
SELECT DATE_ADD(CURDATE(), INTERVAL 7 DAY) as next_week;

-- DATEDIFF
SELECT DATEDIFF(expected_delivery, order_date) as days_to_delivery 
FROM purchase_orders;

-- DATE_FORMAT
SELECT DATE_FORMAT(order_date, '%Y-%m-%d') as formatted_date 
FROM purchase_orders;

-- YEAR, MONTH, DAY
SELECT 
    YEAR(order_date) as year,
    MONTH(order_date) as month,
    DAY(order_date) as day
FROM purchase_orders;

-- ============================================
-- 15. NUMERIC FUNCTIONS
-- ============================================

-- ROUND
SELECT ROUND(unit_price, 2) as rounded_price FROM products;

-- CEILING / FLOOR
SELECT CEILING(unit_price) as ceil_price FROM products;

-- MOD (modulo)
SELECT MOD(product_id, 2) as is_even FROM products;

-- ABS (absolute value)
SELECT ABS(quantity_change) as absolute_change FROM inventory_transactions;

-- ============================================
-- 16. NULL HANDLING
-- ============================================

-- IS NULL
SELECT * FROM products WHERE description IS NULL;

-- IS NOT NULL
SELECT * FROM products WHERE description IS NOT NULL;

-- COALESCE (return first non-null value)
SELECT 
    product_name,
    COALESCE(description, 'No description') as description
FROM products;

-- IFNULL (MySQL specific)
SELECT 
    product_name,
    IFNULL(description, 'No description') as description
FROM products;

-- ============================================
-- 17. INDEXES
-- ============================================

-- CREATE INDEX
CREATE INDEX idx_product_name ON products(product_name);

-- CREATE UNIQUE INDEX
CREATE UNIQUE INDEX idx_po_number ON purchase_orders(po_number);

-- CREATE COMPOSITE INDEX
CREATE INDEX idx_product_category_supplier ON products(category_id, supplier_id);

-- DROP INDEX
DROP INDEX idx_product_name ON products;

-- SHOW INDEXES
SHOW INDEXES FROM products;

-- ============================================
-- 18. TRANSACTIONS
-- ============================================

-- START TRANSACTION
START TRANSACTION;

-- Multiple operations
INSERT INTO products (product_name, unit_price) VALUES ('Test Product', 99.99);
UPDATE inventory SET quantity_on_hand = quantity_on_hand + 10 WHERE product_id = 1;

-- COMMIT
COMMIT;

-- ROLLBACK (if error occurs)
ROLLBACK;

-- ============================================
-- 19. DATABASE OPERATIONS
-- ============================================

-- CREATE DATABASE
CREATE DATABASE my_database;

-- USE DATABASE
USE inventory_system;

-- DROP DATABASE
DROP DATABASE IF EXISTS my_database;

-- SHOW DATABASES
SHOW DATABASES;

-- SHOW TABLES
SHOW TABLES;

-- DESCRIBE TABLE
DESCRIBE products;

-- SHOW CREATE TABLE
SHOW CREATE TABLE products;

-- ============================================
-- END OF SQL OPERATIONS REFERENCE
-- ============================================
