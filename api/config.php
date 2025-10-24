<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'inventoryflow');

// Create connection
function getConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die(json_encode([
            'success' => false,
            'message' => 'Connection failed: ' . $conn->connect_error
        ]));
    }
    
    return $conn;
}

// Execute query and return results
function executeQuery($sql, $returnData = true) {
    $conn = getConnection();
    $result = $conn->query($sql);
    
    $response = [
        'success' => false,
        'sql' => $sql,
        'data' => null,
        'message' => ''
    ];
    
    if ($result === false) {
        $response['message'] = 'Query error: ' . $conn->error;
    } else {
        $response['success'] = true;
        
        if ($returnData && $result instanceof mysqli_result) {
            $response['data'] = [];
            while ($row = $result->fetch_assoc()) {
                $response['data'][] = $row;
            }
        } else {
            $response['message'] = 'Query executed successfully. Affected rows: ' . $conn->affected_rows;
            $response['affected_rows'] = $conn->affected_rows;
            $response['insert_id'] = $conn->insert_id;
        }
    }
    
    $conn->close();
    return $response;
}

// Sanitize input
function sanitize($data) {
    $conn = getConnection();
    $sanitized = $conn->real_escape_string(trim($data));
    $conn->close();
    return $sanitized;
}

// Send JSON response
function sendResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
