# Inventory Management System with SQL Query Visualization

A comprehensive web-based inventory management system built with HTML, CSS, JavaScript, and PHP that provides real-time SQL query visualization for educational purposes.

## Features

### Core Functionality
- **Dashboard**: Real-time statistics and recent transactions overview
- **Products Management**: Add, view, update, and delete products with category and supplier associations
- **Inventory Management**: Track stock levels, adjust quantities, and monitor warehouse inventory
- **Suppliers Management**: Manage supplier information and contacts
- **Purchase Orders**: Create and track purchase orders with supplier information
- **Inventory Transactions**: Record and view all inventory movements (IN, OUT, TRANSFER, ADJUSTMENT)

### Educational SQL Features
1. **Real-time SQL Query Display**: Every operation shows the exact SQL query being executed
2. **SQL Query History**: Complete history of all SQL operations performed
3. **Raw SQL Executor**: Write and execute custom SQL queries directly
4. **Comprehensive SQL Coverage**: Demonstrates all major SQL operations from the requirements:
   - SELECT, INSERT, UPDATE, DELETE
   - JOINs (INNER, LEFT OUTER, RIGHT OUTER)
   - Aggregate functions (COUNT, SUM, AVG, MIN, MAX)
   - GROUP BY and HAVING clauses
   - ORDER BY, DISTINCT, WHERE, BETWEEN, IN, LIKE
   - Subqueries
   - UNION operations
   - Views
   - Foreign Keys with ON DELETE CASCADE and ON DELETE SET NULL
   - CHECK and UNIQUE constraints
   - DEFAULT values

## Requirements

- **Web Server**: Apache (XAMPP recommended)
- **Database**: MySQL/MariaDB
- **PHP**: Version 7.4 or higher
- **Browser**: Modern browser with JavaScript enabled

## Installation

### 1. Set Up XAMPP
1. Install XAMPP if not already installed
2. Start Apache and MySQL services

### 2. Configure Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named `inventory_system`
3. Import the database schema:
   - Click on the `inventory_system` database
   - Go to the "SQL" tab
   - Copy and paste the contents of `install_database.sql`
   - Click "Go" to execute

Alternatively, you can use the MySQL command line:
```bash
mysql -u root -p
CREATE DATABASE inventory_system;
USE inventory_system;
SOURCE C:/xampp/htdocs/inventoryflowv2/install_database.sql;
```

### 3. Configure PHP Connection
Edit `api/config.php` if your MySQL credentials are different:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Change if needed
define('DB_PASS', '');            // Change if needed
define('DB_NAME', 'inventory_system');
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost/inventoryflowv2/
```

## Project Structure

```
inventoryflowv2/
│
├── index.html              # Main application interface
├── install_database.sql    # Database schema and sample data
├── README.md              # This file
├── mysql_schema_syntax.sql # Original schema syntax
├── all_sqls_list.txt      # SQL operations reference
│
├── css/
│   └── style.css          # Application styles
│
├── js/
│   └── app.js             # Frontend JavaScript logic
│
└── api/                   # PHP Backend API
    ├── config.php         # Database configuration
    ├── dashboard.php      # Dashboard statistics
    ├── products.php       # Products CRUD operations
    ├── suppliers.php      # Suppliers CRUD operations
    ├── inventory.php      # Inventory management
    ├── categories.php     # Categories management
    ├── warehouses.php     # Warehouses management
    ├── purchase_orders.php # Purchase orders management
    ├── transactions.php   # Inventory transactions
    ├── adjustments.php    # Stock adjustments
    └── execute_sql.php    # Raw SQL executor
```

## Usage Guide

### SQL Query Monitor
The SQL Query Monitor (bottom-right corner) displays:
- **Current Query**: The most recent SQL operation executed
- **History**: All SQL queries executed during the session
- Actions:
  - Copy query to clipboard
  - Execute query in SQL Executor
  - Toggle history view
  - Clear history

### SQL Executor
Navigate to the "SQL Executor" tab to:
1. Write custom SQL queries
2. Execute SELECT, INSERT, UPDATE, DELETE operations
3. View query results in table format
4. Test different SQL operations

### Example SQL Queries to Try

**Basic SELECT:**
```sql
SELECT * FROM products WHERE unit_price > 50
```

**JOIN Example:**
```sql
SELECT p.product_name, c.category_name, s.supplier_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id 
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
```

**Aggregate Function:**
```sql
SELECT c.category_name, COUNT(p.product_id) as product_count, AVG(p.unit_price) as avg_price 
FROM categories c 
LEFT JOIN products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.category_name
```

**Subquery Example:**
```sql
SELECT product_name, unit_price 
FROM products 
WHERE unit_price > (SELECT AVG(unit_price) FROM products)
```

**View Low Stock Products:**
```sql
SELECT * FROM vw_low_stock_products
```

**UNION Example:**
```sql
SELECT 'High Value' AS category, product_name FROM products WHERE unit_price > 500
UNION
SELECT 'Low Value' AS category, product_name FROM products WHERE unit_price <= 500
```

## Database Schema

### Tables
- **suppliers**: Supplier information
- **categories**: Product categories
- **warehouses**: Storage locations
- **products**: Product master data with foreign keys
- **inventory**: Current stock levels per warehouse
- **purchase_orders**: Purchase order headers
- **purchase_order_items**: Purchase order line items
- **inventory_transactions**: All inventory movements
- **stock_adjustments**: Stock adjustment records

### Views
- **vw_low_stock_products**: Products below reorder level
- **vw_inventory_value**: Inventory valuation by warehouse

### Key Features
- Foreign keys with CASCADE and SET NULL
- CHECK constraints for data validation
- UNIQUE constraints for data integrity
- Computed columns (quantity_available, adjustment_quantity, total_price)
- Indexes for performance optimization

## SQL Operations Demonstrated

The system demonstrates all required SQL operations:

### Basic Operations
✓ CREATE TABLE, DROP TABLE  
✓ ALTER TABLE (ADD, MODIFY, RENAME, DROP COLUMN)  
✓ INSERT, SELECT, UPDATE, DELETE  

### Constraints & Keys
✓ PRIMARY KEY, FOREIGN KEY  
✓ ON DELETE CASCADE, ON DELETE SET NULL  
✓ UNIQUE, NOT NULL, CHECK, DEFAULT  

### Query Operations
✓ SELECT DISTINCT, SELECT ALL  
✓ Column aliases (AS)  
✓ WHERE, BETWEEN, IN, LIKE  
✓ ORDER BY (ASC/DESC)  

### Aggregate & Group Operations
✓ COUNT, SUM, AVG, MIN, MAX  
✓ GROUP BY, HAVING  

### Advanced Queries
✓ Subqueries (SELECT, FROM, WHERE)  
✓ INSERT INTO ... SELECT  
✓ UNION, UNION ALL  

### Joins
✓ INNER JOIN, LEFT OUTER JOIN  
✓ Multiple table joins  
✓ Self joins (can be added)  

### Database Objects
✓ CREATE OR REPLACE VIEW  
✓ SELECT from views  

## Troubleshooting

### "Connection failed" Error
- Verify MySQL is running in XAMPP
- Check database credentials in `api/config.php`
- Ensure `inventory_system` database exists

### SQL Query Errors
- Check the error message in the SQL results area
- Verify table and column names
- Ensure proper SQL syntax

### No Data Showing
- Verify database was installed correctly
- Check browser console for JavaScript errors
- Ensure PHP errors are displayed (check php.ini)

## Educational Value

This project is designed to teach:
1. **SQL Fundamentals**: See how every button click translates to SQL
2. **Database Design**: Understand relationships and normalization
3. **CRUD Operations**: Learn Create, Read, Update, Delete patterns
4. **JOINs**: Visualize how tables connect through foreign keys
5. **Aggregate Functions**: See real-time calculations
6. **Subqueries**: Understand nested query execution
7. **Views**: Learn about virtual tables
8. **Constraints**: Understand data integrity mechanisms

## Security Notes

**Important**: This application is designed for learning purposes in a local environment. For production use, implement:
- SQL injection prevention (prepared statements)
- User authentication and authorization
- Input validation and sanitization
- CSRF protection
- HTTPS encryption
- Password hashing
- Session management

## License

This project is created for educational purposes. Feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the SQL Query Monitor for error messages
2. Review the browser console for JavaScript errors
3. Check Apache error logs in XAMPP
4. Verify database connection and schema

## Future Enhancements

Potential additions:
- User authentication system
- Role-based access control
- Advanced reporting and analytics
- Export functionality (PDF, Excel)
- Barcode scanning integration
- Email notifications for low stock
- Multi-language support
- RESTful API documentation

---

**Version**: 1.0  
**Last Updated**: 2025  
**Technology Stack**: HTML5, CSS3, JavaScript (ES6), PHP 7.4+, MySQL 8.0+
