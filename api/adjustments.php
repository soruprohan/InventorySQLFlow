<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve adjustments
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all adjustments with HAVING clause example
    $sql = "SELECT sa.*, p.product_name, w.warehouse_name 
            FROM stock_adjustments sa 
            LEFT JOIN products p ON sa.product_id = p.product_id 
            LEFT JOIN warehouses w ON sa.warehouse_id = w.warehouse_id 
            ORDER BY sa.adjustment_date DESC";
    
    $result = executeQuery($sql);
    sendResponse($result);
}

// POST - Create stock adjustment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = intval($_POST['product_id']);
    $warehouse_id = intval($_POST['warehouse_id']);
    $old_quantity = intval($_POST['old_quantity']);
    $new_quantity = intval($_POST['new_quantity']);
    $adjustment_quantity = $new_quantity - $old_quantity;
    $reason = sanitize($_POST['reason']);
    $adjusted_by = sanitize($_POST['adjusted_by']);
    $notes = isset($_POST['notes']) ? sanitize($_POST['notes']) : '';
    
    // Insert adjustment record
    $sql = "INSERT INTO stock_adjustments (product_id, warehouse_id, old_quantity, new_quantity, adjustment_quantity, reason, adjusted_by, notes, adjustment_date) 
            VALUES ($product_id, $warehouse_id, $old_quantity, $new_quantity, $adjustment_quantity, '$reason', '$adjusted_by', '$notes', NOW())";
    
    $result = executeQuery($sql, false);
    
    if ($result['success']) {
        // Update inventory
        $updateSql = "UPDATE inventory 
                     SET quantity_on_hand = $new_quantity, 
                         last_updated = NOW() 
                     WHERE product_id = $product_id AND warehouse_id = $warehouse_id";
        
        executeQuery($updateSql, false);
        
        // Also create a transaction record
        $transType = $adjustment_quantity > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT';
        $transSql = "INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity_change, notes, transaction_date) 
                    VALUES ($product_id, $warehouse_id, '$transType', $adjustment_quantity, 'Stock adjustment: $reason', NOW())";
        
        executeQuery($transSql, false);
        
        $result['sql'] = $sql . ";\n" . $updateSql . ";\n" . $transSql;
    }
    
    sendResponse($result);
}
?>
