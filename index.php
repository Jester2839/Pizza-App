<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Admin-Token");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('ADMIN_TOKEN', 'MojeSuperTajneHesloPizzerie2026'); // Tvůj token z index.php

$host = "localhost";
$db_name = "c345pizza_DB";
$username = "c345pizza_user";
$password = "8qomiHmZA#A"; 

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Chybí přihlašovací údaje."]);
    exit();
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Hledáme uživatele a rovnou porovnáváme SHA2 zahashované heslo
    $query = "SELECT role FROM users WHERE username = :username AND password = SHA2(:password, 256)";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':username', $data->username);
    $stmt->bindValue(':password', $data->password);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Přihlášení úspěšné - vrátíme roli a token
        echo json_encode([
            "message" => "Přihlášení úspěšné.",
            "role" => $user['role'],
            "token" => ADMIN_TOKEN // Tento token si React uloží
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Nesprávné uživatelské jméno nebo heslo."]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Chyba databáze: " . $e->getMessage()]);
}
?>