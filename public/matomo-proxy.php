<?php
/**
 * Matomo Proxy Script
 * Proxies requests to the Matomo tracking server to avoid ad blockers
 */

// Configuration
define('MATOMO_URL', 'https://tracking.mhitzelberger.de/');

// Get the requested file (matomo.js or matomo.php)
$file = isset($_GET['file']) ? $_GET['file'] : 'matomo.php';

// Only allow specific files
if (!in_array($file, ['matomo.js', 'matomo.php'])) {
    http_response_code(404);
    exit('Not found');
}

// Build the target URL
$url = MATOMO_URL . $file;

// For matomo.php, forward POST data and query parameters
if ($file === 'matomo.php') {
    // Forward query parameters
    if (!empty($_SERVER['QUERY_STRING'])) {
        $url .= '?' . $_SERVER['QUERY_STRING'];
    }
    
    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    // Forward POST data if present
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }
    
    // Forward relevant headers
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $header = str_replace('_', '-', substr($key, 5));
            if (!in_array($header, ['HOST', 'CONNECTION'])) {
                $headers[] = $header . ': ' . $value;
            }
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    // Execute request
    $response = curl_exec($ch);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $response_headers = substr($response, 0, $header_size);
    $response_body = substr($response, $header_size);
    
    // Forward response headers
    $header_lines = explode("\r\n", $response_headers);
    foreach ($header_lines as $header) {
        if (!empty($header) && strpos($header, ':') !== false) {
            header($header);
        }
    }
    
    curl_close($ch);
    echo $response_body;
    
} else {
    // For matomo.js, just fetch and serve with proper content type
    $content = file_get_contents($url);
    header('Content-Type: application/javascript');
    header('Cache-Control: max-age=3600');
    echo $content;
}
