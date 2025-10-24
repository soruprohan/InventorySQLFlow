-- Enhanced Database Schema for Inventory Management System
-- With MySQL-specific syntax and features

-- Drop existing tables if they exist (for fresh installation)
DROP TABLE IF EXISTS stock_adjustments;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS suppliers;

-- Create suppliers table
CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_date DATE DEFAULT (CURDATE())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table with UNIQUE constraint
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create warehouses table
CREATE TABLE warehouses (
  warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  manager_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create products table with CHECK constraint
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  reorder_level INT DEFAULT 10,
  unit_of_measure VARCHAR(20) DEFAULT 'pieces',
  category_id INT,
  supplier_id INT,
  created_date DATE DEFAULT (CURDATE()),
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create inventory table
CREATE TABLE inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_available INT AS (quantity_on_hand - quantity_reserved) STORED,
  avg_cost DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  warehouse_id INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_warehouse (product_id, warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create purchase_orders table
CREATE TABLE purchase_orders (
  po_id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INT,
  order_date DATE DEFAULT (CURDATE()),
  expected_delivery DATE,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SENT', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED')),
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create purchase_order_items table
CREATE TABLE purchase_order_items (
  po_item_id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_ordered INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) AS (quantity_ordered * unit_price) STORED,
  quantity_received INT DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
  quantity_change INT NOT NULL,
  unit_cost DECIMAL(10,2),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_number VARCHAR(50),
  notes TEXT,
  po_id INT,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create stock_adjustments table
CREATE TABLE stock_adjustments (
  adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  old_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  adjustment_quantity INT AS (new_quantity - old_quantity) STORED,
  reason VARCHAR(20) NOT NULL CHECK (reason IN ('DAMAGED', 'EXPIRED', 'LOST', 'FOUND', 'CYCLE_COUNT', 'OTHER')),
  adjustment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  adjusted_by VARCHAR(100) NOT NULL,
  notes TEXT,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data

-- Sample suppliers
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES
('Tech Suppliers Inc', 'John Smith', '555-0101', 'john@techsuppliers.com', '123 Tech Street, Silicon Valley, CA'),
('Office Depot Corp', 'Sarah Johnson', '555-0102', 'sarah@officedepot.com', '456 Office Ave, New York, NY'),
('Global Electronics', 'Mike Chen', '555-0103', 'mike@globalelec.com', '789 Electronics Blvd, Austin, TX');

-- Sample categories
INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Office Supplies', 'Office stationery and supplies'),
('Furniture', 'Office and home furniture'),
('Tools', 'Hardware and tools');

-- Sample warehouses
INSERT INTO warehouses (warehouse_name, location, manager_name, phone) VALUES
('Main Warehouse', '100 Warehouse St, City, State', 'Alice Brown', '555-0201'),
('East Coast Hub', '200 East St, Boston, MA', 'Bob Wilson', '555-0202'),
('West Coast Hub', '300 West St, Los Angeles, CA', 'Carol Davis', '555-0203');

-- Sample products
INSERT INTO products (product_name, description, unit_price, reorder_level, unit_of_measure, category_id, supplier_id) VALUES
('Laptop Computer', 'High-performance laptop', 999.99, 5, 'pieces', 1, 1),
('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 20, 'pieces', 1, 1),
('Office Chair', 'Ergonomic office chair', 299.99, 10, 'pieces', 3, 2),
('Printer Paper', 'A4 printer paper - 500 sheets', 9.99, 50, 'reams', 2, 2),
('USB Flash Drive 32GB', '32GB USB 3.0 flash drive', 15.99, 30, 'pieces', 1, 3),
('Desk Lamp', 'LED desk lamp', 39.99, 15, 'pieces', 1, 3);

-- Sample inventory
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, avg_cost) VALUES
(1, 1, 25, 5, 950.00),
(2, 1, 150, 10, 25.00),
(3, 1, 40, 5, 280.00),
(4, 1, 200, 20, 8.50),
(5, 2, 100, 0, 14.00),
(6, 2, 50, 5, 35.00);

-- Sample purchase orders
INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery, status, total_amount, notes) VALUES
('PO-2024-001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'PENDING', 5000.00, 'Urgent order for laptops'),
('PO-2024-002', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'APPROVED', 1500.00, 'Regular office supplies order');

-- Sample transactions
INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity_change, unit_cost, reference_number, notes) VALUES
(1, 1, 'IN', 10, 950.00, 'RCV-001', 'Received shipment from supplier'),
(2, 1, 'IN', 50, 25.00, 'RCV-002', 'Stock replenishment'),
(3, 1, 'OUT', -5, 280.00, 'SHIP-001', 'Shipped to customer'),
(4, 1, 'IN', 100, 8.50, 'RCV-003', 'Bulk order received');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);

-- Create a view for low stock products
CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT 
    p.product_id,
    p.product_name,
    p.reorder_level,
    i.quantity_on_hand,
    i.quantity_available,
    w.warehouse_name,
    s.supplier_name
FROM products p
INNER JOIN inventory i ON p.product_id = i.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE i.quantity_available <= p.reorder_level
ORDER BY i.quantity_available ASC;

-- Create a view for inventory value
CREATE OR REPLACE VIEW vw_inventory_value AS
SELECT 
    w.warehouse_name,
    p.product_name,
    c.category_name,
    i.quantity_on_hand,
    i.avg_cost,
    (i.quantity_on_hand * i.avg_cost) AS total_value
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN categories c ON p.category_id = c.category_id
ORDER BY total_value DESC;

-- Display success message
SELECT 'Database schema created successfully!' AS message;
SELECT 'Sample data inserted!' AS message;
