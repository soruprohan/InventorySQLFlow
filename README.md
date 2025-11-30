# 📦 Inventory Management System

> Learn SQL through interactive visualization - See every query as you click!

A web-based inventory system that displays real-time SQL queries for educational purposes. Built with PHP, MySQL, and vanilla JavaScript.

## ✨ Features

- **Real-time SQL Display** - Watch queries execute live
- **Interactive SQL Executor** - Test custom queries
- **Complete CRUD** - Products, Categories, Warehouses, Suppliers
- **Stock Management** - Track inventory across multiple warehouses
- **Modern UI** - Toast notifications, modal dialogs, draggable panels
- **50+ SQL Examples** - JOINs, aggregates, subqueries, views

## 🚀 Quick Start

**Requirements:** XAMPP, PHP 7.4+, MySQL 8.0+

## Installation

1. **Clone & Setup**
   ```bash
   git clone https://github.com/soruprohan/InventorySQLFlow.git
   # Copy to: C:\xampp\htdocs\inventoryflowv2
   ```

2. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create database: `inventory_system`
   - Import: `install_database.sql`

3. **Configure** (if needed)
   - Edit `api/config.php` with your MySQL credentials

4. **Launch**
   ```
   http://localhost/inventoryflowv2/
   ```

## 📚 SQL Coverage

**All major operations demonstrated:**
- Basic: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Joins: `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN`
- Aggregates: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`
- Clauses: `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`
- Advanced: Subqueries, `UNION`, `DISTINCT`, Views
- Constraints: `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`

See `SQL_REFERENCE.sql` for 50+ examples.

## 📁 Structure

```
inventoryflowv2/
├── api/              # PHP backend (11 endpoints)
├── css/style.css     # Application styles
├── js/app.js         # Frontend logic (2000+ lines)
├── index.html        # Main interface
└── *.sql            # Database & documentation
```

## 🎓 Learning Path

1. **Beginner**: View Dashboard → See `COUNT()` queries
2. **Intermediate**: Add Products → Watch `JOIN` operations
3. **Advanced**: Try SQL Executor → Write custom queries

## 📖 Documentation

- `DATABASE_RELATIONSHIPS.md` - ER diagram & relationships
- `SQL_REFERENCE.sql` - Complete SQL guide
- `API_SQL_OPERATIONS.md` - Query catalog by file

## 📄 License

MIT License - Free for educational use

---
