<?php

class Database {

    private $host = "localhost"; // usually localhost on Hostinger
    private $db_name = "u433748162_matrimony";
    private $username = "u433748162_matrimony";  // check in hPanel
    private $password = "Rukman@123"; // replace
    private $conn;

    public function getConnection(): PDO {

        if ($this->conn === null) {
            try {

                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";

                $this->conn = new PDO(
                    $dsn,
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );

            } catch (PDOException $e) {

                error_log("DB ERROR: " . $e->getMessage());

                http_response_code(500);
                echo json_encode([
                    'error' => 'Database connection failed'
                ]);
                exit;
            }
        }

        return $this->conn;
    }
}
