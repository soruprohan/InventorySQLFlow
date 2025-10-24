<?php
require_once 'config.php';

header('Content-Type: application/json');

// GET - Retrieve suppliers
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Get single supplier
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM suppliers WHERE supplier_id = $id";
        
        $result = executeQuery($sql);
        
        if ($result['success'] && count($result['data']) > 0) {
            $result['data'] = $result['data'][0];
        }
        
        sendResponse($result);
    } else {
        // Get all suppliers - using DISTINCT
        $sql = "SELECT DISTINCT * FROM suppliers ORDER BY supplier_id DESC";
        
        $result = executeQuery($sql);
        sendResponse($result);
    }
}

// POST - Create supplier
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $supplier_name = sanitize($_POST['supplier_name']);
    $contact_person = isset($_POST['contact_person']) ? sanitize($_POST['contact_person']) : '';
    $phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
    $email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
    $address = isset($_POST['address']) ? sanitize($_POST['address']) : '';
    
    $sql = "INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, created_date) 
            VALUES ('$supplier_name', '$contact_person', '$phone', '$email', '$address', CURDATE())";
    
    $result = executeQuery($sql, false);
    sendResponse($result);
}

// DELETE - Delete supplier
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $sql = "DELETE FROM suppliers WHERE supplier_id = $id";
        
        $result = executeQuery($sql, false);
        sendResponse($result);
    }
}
?>
