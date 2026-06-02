<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$userId = $_POST['user_id'] ?? null;
$entryId = $_POST['entry_id'] ?? null;

if (!$userId || !$entryId) {
    jsonResponse(['error' => 'user_id and entry_id required'], 400);
}

if (!isset($_FILES['image'])) {
    jsonResponse(['error' => 'No image uploaded'], 400);
}

$file = $_FILES['image'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($ext, $allowed)) {
    jsonResponse(['error' => 'Invalid file type. Allowed: jpg, png, gif, webp'], 400);
}

if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['error' => 'File too large. Max 5MB'], 400);
}

$uploadDir = __DIR__ . '/../uploads/' . $userId;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = $entryId . '_' . time() . '.' . $ext;
$filepath = $uploadDir . '/' . $filename;

if (move_uploaded_file($file['tmp_name'], $filepath)) {
    $url = 'uploads/' . $userId . '/' . $filename;
    jsonResponse(['url' => $url, 'filename' => $filename]);
} else {
    jsonResponse(['error' => 'Upload failed'], 500);
}
