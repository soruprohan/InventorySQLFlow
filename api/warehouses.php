<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve warehouses
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM warehouses WHERE warehouse_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all warehouses WHERE active
        $sql = "SELECT * FROM warehouses WHERE is_active = 1 ORDER BY warehouse_name";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create warehouse
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $warehouse_name = sanitize($_POST['warehouse_name']);
    $location = isset($_POST['location']) ? sanitize($_POST['location']) : '';
    $manager_name = isset($_POST['manager_name']) ? sanitize($_POST['manager_name']) : '';
    $phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
    
    $sql = "INSERT INTO warehouses (warehouse_name, location, manager_name, phone, is_active) 
            VALUES ('$warehouse_name', '$location', '$manager_name', '$phone', 1)";
    
    $result = executeQuery($sql, false);
    sendResponse($result);
}

// DELETE - Delete warehouse
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        // Soft delete
        $sql = "UPDATE warehouses SET is_active = 0 WHERE warehouse_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
