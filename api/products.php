<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Get single product with JOIN
        $id = intval($_GET['id']);
        $sql = "SELECT p.*, c.category_name, s.supplier_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
                WHERE p.product_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all products with JOIN
        $sql = "SELECT p.*, c.category_name, s.supplier_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
                ORDER BY p.product_id DESC";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create product
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_name = sanitize($_POST['product_name']);
    $description = isset($_POST['description']) ? sanitize($_POST['description']) : '';
    $unit_price = floatval($_POST['unit_price']);
    $reorder_level = isset($_POST['reorder_level']) ? intval($_POST['reorder_level']) : 10;
    $unit_of_measure = isset($_POST['unit_of_measure']) ? sanitize($_POST['unit_of_measure']) : 'pieces';
    $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== '' ? intval($_POST['category_id']) : 'NULL';
    $supplier_id = isset($_POST['supplier_id']) && $_POST['supplier_id'] !== '' ? intval($_POST['supplier_id']) : 'NULL';
    
    $sql = "INSERT INTO products (product_name, description, unit_price, reorder_level, unit_of_measure, category_id, supplier_id, created_date, is_active) 
            VALUES ('$product_name', '$description', $unit_price, $reorder_level, '$unit_of_measure', $category_id, $supplier_id, CURDATE(), 1)";
    
    $result = executeQuery($sql, false);
    sendResponse($result);
}

// DELETE - Delete product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        // Hard delete - permanently remove from database
        $sql = "DELETE FROM products WHERE product_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}

// PUT - Update product
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    
    if (isset($_PUT['product_id'])) {
        $id = intval($_PUT['product_id']);
        $product_name = sanitize($_PUT['product_name']);
        $description = isset($_PUT['description']) ? sanitize($_PUT['description']) : '';
        $unit_price = floatval($_PUT['unit_price']);
        $reorder_level = isset($_PUT['reorder_level']) ? intval($_PUT['reorder_level']) : 10;
        $unit_of_measure = isset($_PUT['unit_of_measure']) ? sanitize($_PUT['unit_of_measure']) : 'pieces';
        $category_id = isset($_PUT['category_id']) && $_PUT['category_id'] !== '' ? intval($_PUT['category_id']) : 'NULL';
        $supplier_id = isset($_PUT['supplier_id']) && $_PUT['supplier_id'] !== '' ? intval($_PUT['supplier_id']) : 'NULL';
        
        $sql = "UPDATE products SET 
                product_name = '$product_name', 
                description = '$description', 
                unit_price = $unit_price, 
                reorder_level = $reorder_level, 
                unit_of_measure = '$unit_of_measure', 
                category_id = $category_id, 
                supplier_id = $supplier_id 
                WHERE product_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
