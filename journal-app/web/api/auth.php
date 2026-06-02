<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getJsonInput();
    $deviceId = $input['device_id'] ?? null;

    if (!$deviceId) {
        jsonResponse(['error' => 'device_id required'], 400);
    }

    // Find or create user
    $stmt = $pdo->prepare('SELECT id FROM users WHERE device_id = ?');
    $stmt->execute([$deviceId]);
    $user = $stmt->fetch();

    if ($user) {
        jsonResponse(['user_id' => $user['id']]);
    }

    // Create new user
    $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $stmt = $pdo->prepare('INSERT INTO users (id, device_id) VALUES (?, ?)');
    $stmt->execute([$userId, $deviceId]);

    jsonResponse(['user_id' => $userId]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
