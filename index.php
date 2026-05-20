<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "c345pizza_DB";
$username = "c345pizza_user";
$password = "8qomiHmZA#A"; // Doplň své heslo

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $output = [
        "doughs" => [],
        "bases" => [],
        "edges" => []
    ];

    // 1. Načtení těst (doughs)
    $stmt = $conn->prepare("SELECT code AS id, name, price FROM doughs");
    $stmt->execute();
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $output["doughs"][] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "price" => (int)$row['price']
        ];
    }

    // 2. Načtení základů (bases)
    $stmt = $conn->prepare("SELECT code AS id, name, price FROM bases");
    $stmt->execute();
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $output["bases"][] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "price" => (int)$row['price']
        ];
    }

    // 3. Načtení okrajů (edges)
    $stmt = $conn->prepare("SELECT code AS id, name, displayName, price FROM edges");
    $stmt->execute();
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $output["edges"][] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "displayName" => $row['displayName'], // Přejmenováno pro React Edge interface
            "price" => (int)$row['price']
        ];
    }

    echo json_encode($output);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Chyba: " . $e->getMessage()]);
}
?>