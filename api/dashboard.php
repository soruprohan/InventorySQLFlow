<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get dashboard statistics
    
    // Total products
    $sql1 = "SELECT COUNT(*) as total FROM products WHERE is_active = 1";
    $result1 = executeQuery($sql1);
    $totalProducts = $result1['success'] ? $result1['data'][0]['total'] : 0;
    
    // Total inventory
    $sql2 = "SELECT SUM(quantity_on_hand) as total FROM inventory";
    $result2 = executeQuery($sql2);
    $totalInventory = $result2['success'] && $result2['data'][0]['total'] ? $result2['data'][0]['total'] : 0;
    
    // Total suppliers
    $sql3 = "SELECT COUNT(*) as total FROM suppliers";
    $result3 = executeQuery($sql3);
    $totalSuppliers = $result3['success'] ? $result3['data'][0]['total'] : 0;
    
    // Pending orders
    $sql4 = "SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'PENDING'";
    $result4 = executeQuery($sql4);
    $pendingOrders = $result4['success'] ? $result4['data'][0]['total'] : 0;
    
    $combinedSQL = "-- Dashboard queries:\n" . $sql1 . ";\n" . $sql2 . ";\n" . $sql3 . ";\n" . $sql4;
    
    sendResponse([
        'success' => true,
        'data' => [
            'total_products' => $totalProducts,
            'total_inventory' => $totalInventory,
            'total_suppliers' => $totalSuppliers,
            'pending_orders' => $pendingOrders
        ],
        'sql' => $combinedSQL
    ]);
}
?>
