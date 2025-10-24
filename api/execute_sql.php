<?php
require_once 'config.php';

header('Content-Type: application/json');

// POST - Execute raw SQL
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['sql']) || empty(trim($input['sql']))) {
        sendResponse([
            'success' => false,
            'message' => 'No SQL query provided'
        ]);
    }
    
    $sql = trim($input['sql']);
    
    // Security check - prevent multiple statements (basic protection)
    if (substr_count($sql, ';') > 1) {
        sendResponse([
            'success' => false,
            'message' => 'Multiple statements are not allowed. Please execute one query at a time.'
        ]);
    }
    
    // Remove trailing semicolon
    $sql = rtrim($sql, ';');
    
    // Determine query type
    $queryType = strtoupper(substr(ltrim($sql), 0, 6));
    
    $returnData = false;
    if ($queryType === 'SELECT' || $queryType === 'SHOW T' || $queryType === 'SHOW C' || $queryType === 'DESCRI') {
        $returnData = true;
    }
    
    $result = executeQuery($sql, $returnData);
    
    if ($result['success']) {
        if ($returnData) {
            $result['type'] = 'select';
        } else {
            $result['type'] = 'modify';
        }
    }
    
    sendResponse($result);
}
?>
