-- ============================================
-- TEST QUERIES FOR SQL EXECUTOR
-- Copy and paste these into the SQL Executor tab
-- ============================================

-- ============================================
-- BASIC SELECT QUERIES
-- ============================================

-- 1. View all products
SELECT * FROM products;

-- 2. View all products with specific columns
SELECT product_name, unit_price, reorder_level FROM products;

-- 3. View products with their categories (LEFT JOIN)
SELECT p.product_name, c.category_name, p.unit_price 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id;

-- 4. View products with suppliers (INNER JOIN)
SELECT p.product_name, s.supplier_name, p.unit_price 
FROM products p 
INNER JOIN suppliers s ON p.supplier_id = s.supplier_id;

-- 5. Complete product information (multiple JOINs)
SELECT 
    p.product_name,
    c.category_name,
    s.supplier_name,
    p.unit_price,
    p.reorder_level
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
ORDER BY p.product_name;

-- ============================================
-- FILTERING WITH WHERE
-- ============================================

-- 6. Products with price greater than 50
SELECT product_name, unit_price FROM products WHERE unit_price > 50;

-- 7. Products in specific price range (BETWEEN)
SELECT product_name, unit_price FROM products WHERE unit_price BETWEEN 20 AND 100;

-- 8. Products from specific categories (IN)
SELECT product_name, category_id FROM products WHERE category_id IN (1, 2);

-- 9. Search products by name (LIKE)
SELECT product_name, unit_price FROM products WHERE product_name LIKE '%laptop%';

-- 10. Active products only
SELECT product_name, is_active FROM products WHERE is_active = 1;

-- ============================================
-- AGGREGATE FUNCTIONS
-- ============================================

-- 11. Count total products
SELECT COUNT(*) as total_products FROM products;

-- 12. Count active products
SELECT COUNT(*) as active_products FROM products WHERE is_active = 1;

-- 13. Average product price
SELECT AVG(unit_price) as average_price FROM products;

-- 14. Minimum and maximum prices
SELECT MIN(unit_price) as min_price, MAX(unit_price) as max_price FROM products;

-- 15. Total inventory quantity
SELECT SUM(quantity_on_hand) as total_inventory FROM inventory;

-- 16. All aggregate functions together
SELECT 
    COUNT(*) as total_products,
    MIN(unit_price) as lowest_price,
    MAX(unit_price) as highest_price,
    AVG(unit_price) as average_price,
    SUM(unit_price) as sum_of_prices
FROM products;

-- ============================================
-- GROUP BY and HAVING
-- ============================================

-- 17. Count products by category
SELECT c.category_name, COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name
ORDER BY product_count DESC;

-- 18. Average price by category
SELECT 
    c.category_name, 
    COUNT(p.product_id) as count,
    AVG(p.unit_price) as avg_price 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name;

-- 19. Categories with more than 2 products (HAVING)
SELECT 
    c.category_name, 
    COUNT(p.product_id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name
HAVING COUNT(p.product_id) > 2;

-- 20. Total inventory by warehouse
SELECT 
    w.warehouse_name, 
    SUM(i.quantity_on_hand) as total_quantity,
    COUNT(i.inventory_id) as unique_products
FROM warehouses w 
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id 
GROUP BY w.warehouse_id, w.warehouse_name;

-- ============================================
-- SUBQUERIES
-- ============================================

-- 21. Products above average price
SELECT product_name, unit_price 
FROM products 
WHERE unit_price > (SELECT AVG(unit_price) FROM products);

-- 22. Products with no inventory (NOT IN subquery)
SELECT product_name 
FROM products 
WHERE product_id NOT IN (SELECT product_id FROM inventory);

-- 23. Most expensive product in each category
SELECT p1.product_name, p1.category_id, p1.unit_price
FROM products p1
WHERE p1.unit_price = (
    SELECT MAX(p2.unit_price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);

-- 24. Suppliers with products (EXISTS)
SELECT s.supplier_name
FROM suppliers s
WHERE EXISTS (
    SELECT 1 
    FROM products p 
    WHERE p.supplier_id = s.supplier_id
);

-- ============================================
-- UNION OPERATIONS
-- ============================================

-- 25. Combine expensive and low stock products
SELECT 'Expensive' as type, product_name, unit_price as value 
FROM products 
WHERE unit_price > 500
UNION
SELECT 'Low Stock' as type, p.product_name, i.quantity_on_hand as value
FROM products p
JOIN inventory i ON p.product_id = i.product_id
WHERE i.quantity_on_hand < p.reorder_level;

-- 26. All categories and all suppliers (UNION ALL)
SELECT category_name as name, 'Category' as type FROM categories
UNION ALL
SELECT supplier_name as name, 'Supplier' as type FROM suppliers
ORDER BY type, name;

-- ============================================
-- COMPLEX QUERIES
-- ============================================

-- 27. Complete inventory view with all details
SELECT 
    p.product_name,
    c.category_name,
    s.supplier_name,
    w.warehouse_name,
    i.quantity_on_hand,
    i.quantity_reserved,
    (i.quantity_on_hand - i.quantity_reserved) as available,
    i.avg_cost,
    (i.quantity_on_hand * i.avg_cost) as inventory_value
FROM inventory i
JOIN products p ON i.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
ORDER BY inventory_value DESC;

-- 28. Purchase orders with supplier details
SELECT 
    po.po_number,
    s.supplier_name,
    s.contact_person,
    po.order_date,
    po.expected_delivery,
    po.status,
    po.total_amount,
    DATEDIFF(po.expected_delivery, po.order_date) as lead_time_days
FROM purchase_orders po
LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
ORDER BY po.order_date DESC;

-- 29. Transaction summary by type
SELECT 
    transaction_type,
    COUNT(*) as transaction_count,
    SUM(quantity_change) as total_quantity_change,
    AVG(unit_cost) as avg_cost
FROM inventory_transactions
GROUP BY transaction_type;

-- 30. Products needing reorder (low stock alert)
SELECT 
    p.product_name,
    i.quantity_on_hand,
    p.reorder_level,
    (p.reorder_level - i.quantity_on_hand) as quantity_needed,
    s.supplier_name,
    s.phone as supplier_phone
FROM products p
JOIN inventory i ON p.product_id = i.product_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE i.quantity_on_hand <= p.reorder_level
ORDER BY quantity_needed DESC;

-- ============================================
-- USING VIEWS
-- ============================================

-- 31. Select from low stock view
SELECT * FROM vw_low_stock_products;

-- 32. Select from inventory value view
SELECT * FROM vw_inventory_value ORDER BY total_value DESC;

-- 33. Total inventory value by warehouse
SELECT 
    warehouse_name,
    SUM(total_value) as warehouse_total_value,
    COUNT(*) as product_count
FROM vw_inventory_value
GROUP BY warehouse_name;

-- ============================================
-- DATE-BASED QUERIES
-- ============================================

-- 34. Products created in last 30 days
SELECT product_name, created_date 
FROM products 
WHERE created_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- 35. Transactions from today
SELECT * FROM inventory_transactions 
WHERE DATE(transaction_date) = CURDATE();

-- 36. Purchase orders expected this week
SELECT po_number, supplier_id, expected_delivery 
FROM purchase_orders 
WHERE expected_delivery BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);

-- ============================================
-- STATISTICAL QUERIES
-- ============================================

-- 37. Price distribution by range
SELECT 
    CASE 
        WHEN unit_price < 20 THEN 'Under $20'
        WHEN unit_price BETWEEN 20 AND 100 THEN '$20-$100'
        WHEN unit_price BETWEEN 100 AND 500 THEN '$100-$500'
        ELSE 'Over $500'
    END as price_range,
    COUNT(*) as product_count
FROM products
GROUP BY price_range
ORDER BY MIN(unit_price);

-- 38. Warehouse utilization
SELECT 
    w.warehouse_name,
    COUNT(DISTINCT i.product_id) as unique_products,
    SUM(i.quantity_on_hand) as total_units,
    AVG(i.quantity_on_hand) as avg_units_per_product
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
GROUP BY w.warehouse_id, w.warehouse_name;

-- 39. Top 5 most expensive products
SELECT product_name, unit_price, category_id 
FROM products 
ORDER BY unit_price DESC 
LIMIT 5;

-- 40. Top 5 suppliers by product count
SELECT 
    s.supplier_name,
    COUNT(p.product_id) as product_count
FROM suppliers s
LEFT JOIN products p ON s.supplier_id = p.supplier_id
GROUP BY s.supplier_id, s.supplier_name
ORDER BY product_count DESC
LIMIT 5;

-- ============================================
-- ADVANCED ANALYTICS
-- ============================================

-- 41. Category performance analysis
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    AVG(p.unit_price) as avg_price,
    MIN(p.unit_price) as min_price,
    MAX(p.unit_price) as max_price,
    SUM(COALESCE(i.quantity_on_hand, 0)) as total_stock
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
LEFT JOIN inventory i ON p.product_id = i.product_id
GROUP BY c.category_id, c.category_name
ORDER BY product_count DESC;

-- 42. Inventory turnover candidates (high stock, low activity)
SELECT 
    p.product_name,
    i.quantity_on_hand,
    COUNT(t.transaction_id) as transaction_count,
    MAX(t.transaction_date) as last_transaction
FROM products p
JOIN inventory i ON p.product_id = i.product_id
LEFT JOIN inventory_transactions t ON p.product_id = t.product_id
GROUP BY p.product_id, p.product_name, i.quantity_on_hand
HAVING i.quantity_on_hand > 50 AND COUNT(t.transaction_id) < 5
ORDER BY i.quantity_on_hand DESC;

-- 43. Complete warehouse inventory summary
SELECT 
    w.warehouse_name,
    w.location,
    COUNT(DISTINCT i.product_id) as total_products,
    SUM(i.quantity_on_hand) as total_units,
    SUM(i.quantity_reserved) as reserved_units,
    SUM(i.quantity_on_hand - i.quantity_reserved) as available_units,
    SUM(i.quantity_on_hand * i.avg_cost) as total_value
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
WHERE w.is_active = 1
GROUP BY w.warehouse_id, w.warehouse_name, w.location
ORDER BY total_value DESC;

-- ============================================
-- DISTINCT EXAMPLES
-- ============================================

-- 44. Distinct categories used
SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL;

-- 45. Distinct transaction types
SELECT DISTINCT transaction_type FROM inventory_transactions;

-- ============================================
-- ORDER BY VARIATIONS
-- ============================================

-- 46. Products sorted by multiple criteria
SELECT product_name, category_id, unit_price 
FROM products 
ORDER BY category_id ASC, unit_price DESC;

-- 47. Suppliers alphabetically
SELECT supplier_name, contact_person 
FROM suppliers 
ORDER BY supplier_name ASC;

-- ============================================
-- NULL HANDLING
-- ============================================

-- 48. Products without description
SELECT product_name, description FROM products WHERE description IS NULL;

-- 49. Products with description
SELECT product_name, description FROM products WHERE description IS NOT NULL;

-- 50. Products with fallback for NULL values
SELECT 
    product_name, 
    COALESCE(description, 'No description available') as description
FROM products;

-- ============================================
-- BONUS: INSERT, UPDATE, DELETE EXAMPLES
-- (Be careful - these modify data!)
-- ============================================

-- Insert a new category
-- INSERT INTO categories (category_name, description) VALUES ('Test Category', 'This is a test');

-- Update a product price
-- UPDATE products SET unit_price = 99.99 WHERE product_id = 1;

-- Delete a test record
-- DELETE FROM categories WHERE category_name = 'Test Category';

-- ============================================
-- END OF TEST QUERIES
-- ============================================

-- TIP: Start with simple queries and gradually move to complex ones
-- TIP: Watch the SQL Monitor to see how the system constructs queries
-- TIP: Try modifying these queries to create your own variations
-- TIP: Use LIMIT clause to restrict results for large tables
