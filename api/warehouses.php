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
        // Get all warehouses (both active and inactive)
        $sql = "SELECT * FROM warehouses ORDER BY warehouse_id DESC";
        
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

// PUT - Update warehouse
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    
    if (isset($_PUT['warehouse_id'])) {
        $id = intval($_PUT['warehouse_id']);
        $warehouse_name = sanitize($_PUT['warehouse_name']);
        $location = isset($_PUT['location']) ? sanitize($_PUT['location']) : '';
        $manager_name = isset($_PUT['manager_name']) ? sanitize($_PUT['manager_name']) : '';
        $phone = isset($_PUT['phone']) ? sanitize($_PUT['phone']) : '';
        
        $sql = "UPDATE warehouses SET 
                warehouse_name = '$warehouse_name', 
                location = '$location', 
                manager_name = '$manager_name', 
                phone = '$phone' 
                WHERE warehouse_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}

// DELETE - Delete warehouse
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        // Hard delete
        $sql = "DELETE FROM warehouses WHERE warehouse_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
