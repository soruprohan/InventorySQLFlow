<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve transactions
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 1000;
    
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT t.*, p.product_name, w.warehouse_name 
                FROM inventory_transactions t 
                LEFT JOIN products p ON t.product_id = p.product_id 
                LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id 
                WHERE t.transaction_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all transactions with ORDER BY
        $sql = "SELECT t.*, p.product_name, w.warehouse_name 
                FROM inventory_transactions t 
                LEFT JOIN products p ON t.product_id = p.product_id 
                LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id 
                ORDER BY t.transaction_date DESC 
                LIMIT $limit";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create transaction
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = intval($_POST['product_id']);
    $warehouse_id = intval($_POST['warehouse_id']);
    $transaction_type = sanitize($_POST['transaction_type']);
    $quantity_change = intval($_POST['quantity_change']);
    $unit_cost = isset($_POST['unit_cost']) && $_POST['unit_cost'] !== '' ? floatval($_POST['unit_cost']) : 'NULL';
    $reference_number = isset($_POST['reference_number']) ? sanitize($_POST['reference_number']) : '';
    $notes = isset($_POST['notes']) ? sanitize($_POST['notes']) : '';
    
    // Insert transaction
    $sql = "INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity_change, unit_cost, reference_number, notes, transaction_date) 
            VALUES ($product_id, $warehouse_id, '$transaction_type', $quantity_change, $unit_cost, '$reference_number', '$notes', NOW())";
    
    $result = executeQuery($sql, false);
    
    if ($result['success']) {
        // Update inventory
        // First check if inventory record exists
        $checkSql = "SELECT quantity_on_hand FROM inventory WHERE product_id = $product_id AND warehouse_id = $warehouse_id";
        $checkResult = executeQuery($checkSql);
        
        if ($checkResult['success'] && count($checkResult['data']) > 0) {
            $currentQty = $checkResult['data'][0]['quantity_on_hand'];
            $newQty = $currentQty + $quantity_change;
            
            $updateSql = "UPDATE inventory 
                         SET quantity_on_hand = $newQty, 
                             last_updated = NOW() 
                         WHERE product_id = $product_id AND warehouse_id = $warehouse_id";
            
            executeQuery($updateSql, false);
        } else {
            // Create new inventory record
            $insertSql = "INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, last_updated) 
                         VALUES ($product_id, $warehouse_id, $quantity_change, NOW())";
            
            executeQuery($insertSql, false);
        }
        
        $result['sql'] = $sql . ";\n-- Inventory updated automatically";
    }
    
    sendResponse($result);
}

// PUT - Update transaction
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    
    if (isset($_PUT['transaction_id'])) {
        $transaction_id = intval($_PUT['transaction_id']);
        $product_id = intval($_PUT['product_id']);
        $warehouse_id = intval($_PUT['warehouse_id']);
        $transaction_type = sanitize($_PUT['transaction_type']);
        $quantity_change = intval($_PUT['quantity_change']);
        $unit_cost = isset($_PUT['unit_cost']) && $_PUT['unit_cost'] !== '' ? floatval($_PUT['unit_cost']) : 'NULL';
        $reference_number = isset($_PUT['reference_number']) ? sanitize($_PUT['reference_number']) : '';
        $notes = isset($_PUT['notes']) ? sanitize($_PUT['notes']) : '';
        
        $sql = "UPDATE inventory_transactions 
                SET product_id = $product_id,
                    warehouse_id = $warehouse_id,
                    transaction_type = '$transaction_type',
                    quantity_change = $quantity_change,
                    unit_cost = $unit_cost,
                    reference_number = '$reference_number',
                    notes = '$notes'
                WHERE transaction_id = $transaction_id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}

// DELETE - Delete transaction
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $sql = "DELETE FROM inventory_transactions WHERE transaction_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
