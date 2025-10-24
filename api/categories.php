<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve categories
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM categories WHERE category_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all categories with COUNT aggregate function
        $sql = "SELECT c.*, COUNT(p.product_id) as product_count 
                FROM categories c 
                LEFT JOIN products p ON c.category_id = p.category_id 
                GROUP BY c.category_id, c.category_name, c.description
                ORDER BY c.category_name";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create category
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category_name = sanitize($_POST['category_name']);
    $description = isset($_POST['description']) ? sanitize($_POST['description']) : '';
    
    $sql = "INSERT INTO categories (category_name, description) 
            VALUES ('$category_name', '$description')";
    
    $result = executeQuery($sql, false);
    sendResponse($result);
}

// DELETE - Delete category
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $sql = "DELETE FROM categories WHERE category_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
