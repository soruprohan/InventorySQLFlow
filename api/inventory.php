<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve inventory
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['product_id']) && isset($_GET['warehouse_id'])) {
        // Get specific inventory item
        $product_id = intval($_GET['product_id']);
        $warehouse_id = intval($_GET['warehouse_id']);
        
        $sql = "SELECT i.*, p.product_name, w.warehouse_name, 
                (i.quantity_on_hand - i.quantity_reserved) as quantity_available
                FROM inventory i
                INNER JOIN products p ON i.product_id = p.product_id
                INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
                WHERE i.product_id = $product_id AND i.warehouse_id = $warehouse_id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        } else {
            $result['data'] = ['quantity_on_hand' => 0];
        }
        
        sendResponse($result);
    } else {
        // Get all inventory with INNER JOIN
        $sql = "SELECT i.*, p.product_name, w.warehouse_name, 
                (i.quantity_on_hand - i.quantity_reserved) as quantity_available
                FROM inventory i
                INNER JOIN products p ON i.product_id = p.product_id
                INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
                ORDER BY i.inventory_id DESC";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Update inventory (usually done through transactions)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = intval($_POST['product_id']);
    $warehouse_id = intval($_POST['warehouse_id']);
    $quantity_on_hand = intval($_POST['quantity_on_hand']);
    $quantity_reserved = isset($_POST['quantity_reserved']) ? intval($_POST['quantity_reserved']) : 0;
    $avg_cost = isset($_POST['avg_cost']) ? floatval($_POST['avg_cost']) : 0;
    
    // Check if inventory record exists
    $checkSql = "SELECT inventory_id FROM inventory WHERE product_id = $product_id AND warehouse_id = $warehouse_id";
    $checkResult = executeQuery($checkSql);
    
    if ($checkResult['success'] && count($checkResult['data']) > 0) {
        // Update existing
        $sql = "UPDATE inventory 
                SET quantity_on_hand = $quantity_on_hand, 
                    quantity_reserved = $quantity_reserved, 
                    avg_cost = $avg_cost, 
                    last_updated = NOW()
                WHERE product_id = $product_id AND warehouse_id = $warehouse_id";
    } else {
        // Insert new
        $sql = "INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, avg_cost, last_updated) 
                VALUES ($product_id, $warehouse_id, $quantity_on_hand, $quantity_reserved, $avg_cost, NOW())";
    }
    
    $result = executeQuery($sql, false);
    $result['sql'] = $checkSql . ";\n" . $sql;
    sendResponse($result);
}
?>
