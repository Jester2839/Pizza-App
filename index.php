<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Admin-Token");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

define('ADMIN_TOKEN', 'MojeSuperTajneHesloPizzerie2026');

$host = "localhost";
$db_name = "c345pizza_DB";
$username = "c345pizza_user";
$password = "8qomiHmZA#A"; 

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

function is_authorized() {
    $headers = getallheaders();
    return (isset($headers['X-Admin-Token']) && $headers['X-Admin-Token'] === ADMIN_TOKEN);
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // --- GET (Veřejné čtení) ---
    if ($method === 'GET') {
        $pizzaId = isset($_GET['id']) ? $_GET['id'] : null;
        $query = "SELECT p.id_pizzas AS id, p.code, p.name, p.description, p.price, p.image, b.id_bases AS defaultBaseId, GROUP_CONCAT(t.code) as categories
                  FROM pizzas p LEFT JOIN bases b ON p.default_base_code = b.code
                  LEFT JOIN pizzas_tags pt ON p.id_pizzas = pt.id_pizzas LEFT JOIN tags t ON pt.id_tags = t.id_tags";
        
        if ($pizzaId) $query .= " WHERE p.id_pizzas = :pizzaId OR p.code = :pizzaId ";
        $query .= " GROUP BY p.id_pizzas ";
        
        $stmt = $conn->prepare($query);
        if ($pizzaId) $stmt->bindValue(':pizzaId', $pizzaId);
        $stmt->execute();
        
        $finalPizzas = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $finalPizzas[] = [
                "id" => (int)$row['id'], "code" => $row['code'], "name" => $row['name'], "description" => $row['description'],
                "price" => (int)$row['price'], "image" => $row['image'], "defaultBaseId" => (int)$row['defaultBaseId'],
                "category" => $row['categories'] ? explode(",", $row['categories']) : []
            ];
        }
        
        if ($pizzaId) {
            if (count($finalPizzas) > 0) echo json_encode($finalPizzas[0]);
            else { http_response_code(404); echo json_encode(["error" => "Pizza nenalezena"]); }
        } else echo json_encode($finalPizzas);
        exit();
    }

    // Ochrana pro zápis
    if (!is_authorized()) { http_response_code(403); echo json_encode(["error" => "Neplatný API klíč."]); exit(); }

    // --- POST (Admin: Přidání nové pizzy včetně kategorií) ---
    if ($method === 'POST') {
        $conn->beginTransaction(); // Spustíme transakci, ať se zapíše všechno nebo nic

        $query = "INSERT INTO pizzas (code, name, description, price, image, default_base_code) 
                  VALUES (:code, :name, :description, :price, :image, :default_base_code)";
        $stmt = $conn->prepare($query);
        $stmt->bindValue(':code', $data->code); 
        $stmt->bindValue(':name', $data->name); 
        $stmt->bindValue(':description', $data->description);
        $stmt->bindValue(':price', $data->price); 
        $stmt->bindValue(':image', $data->image); 
        $stmt->bindValue(':default_base_code', $data->default_base_code);
        $stmt->execute();
        
        $newPizzaId = $conn->lastInsertId();

        // Pokud admin vybral pro novou pizzu nějaké kategorie/tagy
        if (!empty($data->categories) && is_array($data->categories)) {
            $stmtTag = $conn->prepare("INSERT INTO pizzas_tags (id_pizzas, id_tags) VALUES (:id_pizzas, :id_tags)");
            foreach ($data->categories as $tagId) {
                $stmtTag->bindValue(':id_pizzas', $newPizzaId);
                $stmtTag->bindValue(':id_tags', $tagId); // Očekává číselné ID tagu (např. 1, 2...)
                $stmtTag->execute();
            }
        }

        $conn->commit();
        echo json_encode(["message" => "Pizza i s kategoriemi byla úspěšně přidána.", "id" => $newPizzaId]);
        exit();
    }

    // --- PUT (Admin: Kompletní úprava pizzy VČETNĚ KATEGORIÍ) ---
    elseif ($method === 'PUT') {
        $conn->beginTransaction();

        // 1. Aktualizujeme základní údaje o pizze
        $query = "UPDATE pizzas 
                  SET code = :code, name = :name, description = :description, price = :price, image = :image, default_base_code = :default_base_code 
                  WHERE id_pizzas = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindValue(':code', $data->code); 
        $stmt->bindValue(':name', $data->name); 
        $stmt->bindValue(':description', $data->description);
        $stmt->bindValue(':price', $data->price); 
        $stmt->bindValue(':image', $data->image); 
        $stmt->bindValue(':default_base_code', $data->default_base_code);
        $stmt->bindValue(':id', $data->id_pizzas);
        $stmt->execute();

        // 2. Smažeme všechny dosavadní kategorie této pizzy
        $stmtDeleteTags = $conn->prepare("DELETE FROM pizzas_tags WHERE id_pizzas = :id");
        $stmtDeleteTags->bindValue(':id', $data->id_pizzas);
        $stmtDeleteTags->execute();

        // 3. Zapíšeme z frontendu nově vybrané kategorie
        if (!empty($data->categories) && is_array($data->categories)) {
            $stmtInsertTag = $conn->prepare("INSERT INTO pizzas_tags (id_pizzas, id_tags) VALUES (:id_pizzas, :id_tags)");
            foreach ($data->categories as $tagId) {
                $stmtInsertTag->bindValue(':id_pizzas', $data->id_pizzas);
                $stmtInsertTag->bindValue(':id_tags', $tagId); // Posíláme číselná ID nových tagů
                $stmtInsertTag->execute();
            }
        }

        $conn->commit();
        echo json_encode(["message" => "Pizza i její kategorie byly úspěšně aktualizovány."]);
        exit();
    }

    // --- DELETE (Admin: Smazání) ---
    elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM pizzas WHERE id_pizzas = :id");
        $stmt->bindValue(':id', $data->id_pizzas);
        if ($stmt->execute()) echo json_encode(["message" => "Pizza smazána."]);
        exit();
    }

} catch(PDOException $e) {
    http_response_code(500); echo json_encode(["error" => "Chyba: " . $e->getMessage()]);
}
?>