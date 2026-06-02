<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = explode('/', trim($path, '/'));

// /api/entries.php or /api/entries.php?id=xxx
$userId = $_GET['user_id'] ?? null;
$entryId = $_GET['id'] ?? null;

// Parse body for POST/PUT
$input = getJsonInput();
if (!$userId && isset($input['user_id'])) $userId = $input['user_id'];

if (!$userId) {
    jsonResponse(['error' => 'user_id required'], 400);
}

switch ($method) {
    case 'GET':
        if ($entryId) {
            getEntry($pdo, $userId, $entryId);
        } else {
            getAllEntries($pdo, $userId);
        }
        break;
    case 'POST':
        createEntry($pdo, $userId, $input);
        break;
    case 'PUT':
        if (!$entryId) jsonResponse(['error' => 'id required'], 400);
        updateEntry($pdo, $userId, $entryId, $input);
        break;
    case 'DELETE':
        if ($entryId) {
            deleteEntry($pdo, $userId, $entryId);
        } else {
            deleteAllEntries($pdo, $userId);
        }
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getAllEntries($pdo, $userId) {
    $stmt = $pdo->prepare(
        'SELECT id, user_id, title, body, mood, image_url, tags, word_count, date_key, created_at, updated_at
         FROM entries WHERE user_id = ? ORDER BY created_at DESC'
    );
    $stmt->execute([$userId]);
    $entries = $stmt->fetchAll();

    foreach ($entries as &$entry) {
        $entry['tags'] = json_decode($entry['tags'] ?? '[]', true);
        $entry['image_url'] = $entry['image_url'] ?: null;
    }

    jsonResponse($entries);
}

function getEntry($pdo, $userId, $entryId) {
    $stmt = $pdo->prepare(
        'SELECT id, user_id, title, body, mood, image_url, tags, word_count, date_key, created_at, updated_at
         FROM entries WHERE id = ? AND user_id = ?'
    );
    $stmt->execute([$entryId, $userId]);
    $entry = $stmt->fetch();

    if (!$entry) {
        jsonResponse(['error' => 'Entry not found'], 404);
    }

    $entry['tags'] = json_decode($entry['tags'] ?? '[]', true);
    $entry['image_url'] = $entry['image_url'] ?: null;
    jsonResponse($entry);
}

function createEntry($pdo, $userId, $input) {
    $title = $input['title'] ?? '';
    $body = $input['body'] ?? '';
    $mood = $input['mood'] ?? 'calm';
    $imageUrl = $input['image_url'] ?? null;
    $tags = $input['tags'] ?? [];

    if (empty($title)) jsonResponse(['error' => 'title required'], 400);
    if (strlen($body) < 10) jsonResponse(['error' => 'body must be at least 10 characters'], 400);

    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $wordCount = str_word_count(trim($body));
    $dateKey = date('Y-m-d');
    $tagsJson = json_encode($tags);

    $stmt = $pdo->prepare(
        'INSERT INTO entries (id, user_id, title, body, mood, image_url, tags, word_count, date_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$id, $userId, $title, $body, $mood, $imageUrl, $tagsJson, $wordCount, $dateKey]);

    jsonResponse([
        'id' => $id,
        'user_id' => $userId,
        'title' => $title,
        'body' => $body,
        'mood' => $mood,
        'image_url' => $imageUrl,
        'tags' => $tags,
        'word_count' => $wordCount,
        'date_key' => $dateKey,
        'created_at' => date('c'),
        'updated_at' => date('c'),
    ]);
}

function updateEntry($pdo, $userId, $entryId, $input) {
    $fields = [];
    $params = [];

    foreach (['title', 'body', 'mood', 'image_url'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }

    if (isset($input['tags'])) {
        $fields[] = 'tags = ?';
        $params[] = json_encode($input['tags']);
    }

    if (isset($input['body'])) {
        $fields[] = 'word_count = ?';
        $params[] = str_word_count(trim($input['body']));
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }

    $params[] = $entryId;
    $params[] = $userId;

    $sql = 'UPDATE entries SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Entry not found'], 404);
    }

    jsonResponse(['success' => true]);
}

function deleteEntry($pdo, $userId, $entryId) {
    $stmt = $pdo->prepare('DELETE FROM entries WHERE id = ? AND user_id = ?');
    $stmt->execute([$entryId, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Entry not found'], 404);
    }

    jsonResponse(['success' => true]);
}

function deleteAllEntries($pdo, $userId) {
    $stmt = $pdo->prepare('DELETE FROM entries WHERE user_id = ?');
    $stmt->execute([$userId]);
    jsonResponse(['success' => true]);
}
