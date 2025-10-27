<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve purchase orders
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Get single purchase order with supplier info
        $id = intval($_GET['id']);
        $sql = "SELECT po.*, s.supplier_name 
                FROM purchase_orders po 
                LEFT OUTER JOIN suppliers s ON po.supplier_id = s.supplier_id 
                WHERE po.po_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all purchase orders with LEFT OUTER JOIN
        $sql = "SELECT po.*, s.supplier_name 
                FROM purchase_orders po 
                LEFT OUTER JOIN suppliers s ON po.supplier_id = s.supplier_id 
                ORDER BY po.po_id DESC";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create purchase order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $po_number = sanitize($_POST['po_number']);
    $supplier_id = intval($_POST['supplier_id']);
    $order_date = sanitize($_POST['order_date']);
    $expected_delivery = isset($_POST['expected_delivery']) ? "'" . sanitize($_POST['expected_delivery']) . "'" : 'NULL';
    $status = isset($_POST['status']) ? sanitize($_POST['status']) : 'PENDING';
    $total_amount = isset($_POST['total_amount']) ? floatval($_POST['total_amount']) : 0;
    $notes = isset($_POST['notes']) ? sanitize($_POST['notes']) : '';
    
    $sql = "INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery, status, total_amount, notes) 
            VALUES ('$po_number', $supplier_id, '$order_date', $expected_delivery, '$status', $total_amount, '$notes')";
    
    $result = executeQuery($sql, false);
    sendResponse($result);
}

// DELETE - Delete purchase order
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $sql = "DELETE FROM purchase_orders WHERE po_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}

// PUT - Update purchase order status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    
    if (isset($_PUT['po_id'])) {
        $id = intval($_PUT['po_id']);
        $status = sanitize($_PUT['status']);
        
        $sql = "UPDATE purchase_orders SET status = '$status' WHERE po_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
