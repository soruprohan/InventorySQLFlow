CREATE TABLE `suppliers` (
  `supplier_id` integer PRIMARY KEY,
  `supplier_name` varchar(100) NOT NULL,
  `contact_person` varchar(100),
  `phone` varchar(20),
  `email` varchar(100),
  `address` text,
  `created_date` date DEFAULT (CURRENT_DATE)
);

CREATE TABLE `categories` (
  `category_id` integer PRIMARY KEY,
  `category_name` varchar(50) UNIQUE NOT NULL,
  `description` text
);

CREATE TABLE `warehouses` (
  `warehouse_id` integer PRIMARY KEY,
  `warehouse_name` varchar(100) NOT NULL,
  `location` varchar(200),
  `manager_name` varchar(100),
  `phone` varchar(20),
  `is_active` boolean DEFAULT true
);

CREATE TABLE `products` (
  `product_id` integer PRIMARY KEY,
  `product_name` varchar(100) NOT NULL,
  `description` text,
  `unit_price` decimal(10,2) NOT NULL,
  `reorder_level` integer DEFAULT 10,
  `unit_of_measure` varchar(20) DEFAULT 'pieces',
  `category_id` integer,
  `supplier_id` integer,
  `created_date` date DEFAULT (CURRENT_DATE),
  `is_active` boolean DEFAULT true
);

CREATE TABLE `inventory` (
  `inventory_id` integer PRIMARY KEY,
  `product_id` integer,
  `quantity_on_hand` integer DEFAULT 0,
  `quantity_reserved` integer DEFAULT 0,
  `quantity_available` integer DEFAULT 0 COMMENT 'quantity_on_hand - quantity_reserved',
  `avg_cost` decimal(10,2) DEFAULT 0,
  `last_updated` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `warehouse_id` integer
);

CREATE TABLE `purchase_orders` (
  `po_id` integer PRIMARY KEY,
  `po_number` varchar(50) UNIQUE NOT NULL,
  `supplier_id` integer,
  `order_date` date DEFAULT (CURRENT_DATE),
  `expected_delivery` date,
  `status` varchar(20) DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, SENT, PARTIAL_RECEIVED, RECEIVED, CANCELLED',
  `total_amount` decimal(12,2) DEFAULT 0,
  `notes` text
);

CREATE TABLE `purchase_order_items` (
  `po_item_id` integer PRIMARY KEY,
  `po_id` integer,
  `product_id` integer,
  `quantity_ordered` integer NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) DEFAULT 0 COMMENT 'quantity_ordered * unit_price',
  `quantity_received` integer DEFAULT 0
);

CREATE TABLE `inventory_transactions` (
  `transaction_id` integer PRIMARY KEY,
  `product_id` integer,
  `warehouse_id` integer,
  `transaction_type` varchar(20) NOT NULL COMMENT 'IN, OUT, TRANSFER, ADJUSTMENT',
  `quantity_change` integer NOT NULL,
  `unit_cost` decimal(10,2),
  `transaction_date` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `reference_number` varchar(50),
  `notes` text,
  `po_id` integer
);

CREATE TABLE `stock_adjustments` (
  `adjustment_id` integer PRIMARY KEY,
  `product_id` integer,
  `warehouse_id` integer,
  `old_quantity` integer NOT NULL,
  `new_quantity` integer NOT NULL,
  `adjustment_quantity` integer DEFAULT 0 COMMENT 'new_quantity - old_quantity',
  `reason` varchar(20) NOT NULL COMMENT 'DAMAGED, EXPIRED, LOST, FOUND, CYCLE_COUNT, OTHER',
  `adjustment_date` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `adjusted_by` varchar(100) NOT NULL,
  `notes` text
);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

ALTER TABLE `products` ADD FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);

ALTER TABLE `inventory` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `inventory` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);

ALTER TABLE `purchase_orders` ADD FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);

ALTER TABLE `purchase_order_items` ADD FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`);

ALTER TABLE `purchase_order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);

ALTER TABLE `inventory_transactions` ADD FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`);

ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`);
