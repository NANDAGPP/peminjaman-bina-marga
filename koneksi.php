<?php
/**
 * ============================================================
 * Koneksi Database — PDO PostgreSQL
 * ============================================================
 * Konfigurasi koneksi ke PostgreSQL menggunakan PDO.
 * Semua query menggunakan prepared statements.
 */

// Tanggal pengajuan dan validasi "tidak boleh di masa lalu" mengikuti waktu kantor,
// bukan zona waktu bawaan server (UTC di Vercel).
date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'Asia/Jakarta');

// --- KONFIGURASI DATABASE FLEKSIBEL (Mendukung Lokal & Hosting) ---
// POSTGRES_URL diisi otomatis oleh integrasi database di Vercel.
$databaseUrl = getenv('DATABASE_URL') ?: (getenv('POSTGRES_URL') ?: '');
$db_options  = '';

if (!empty($databaseUrl)) {
    $dbParts = parse_url($databaseUrl);
    $db_driver   = $dbParts['scheme'] === 'mysql' ? 'mysql' : 'pgsql';
    $db_host     = $dbParts['host'] ?? '127.0.0.1';
    $db_port     = $dbParts['port'] ?? ($db_driver === 'mysql' ? '3306' : '5432');
    $db_name     = ltrim($dbParts['path'] ?? 'binamarga', '/');
    $db_user     = rawurldecode($dbParts['user'] ?? 'postgres');
    $db_password = rawurldecode($dbParts['pass'] ?? 'postgres');

    // Database cloud seperti Neon mewajibkan SSL lewat parameter ?sslmode=require.
    // channel_binding=require sengaja tidak diteruskan: runtime PHP di Vercel menolak
    // koneksi bila nilai itu dipaksa. Dengan nilai bawaan libpq (prefer), channel
    // binding tetap dipakai selama didukung kedua sisi.
    parse_str($dbParts['query'] ?? '', $query);
    if (!empty($query['sslmode']) && preg_match('/^[a-z-]+$/', $query['sslmode'])) {
        $db_options .= ";sslmode={$query['sslmode']}";
    }

    // libpq di runtime PHP Vercel (juga XAMPP) belum mendukung SNI, padahal Neon
    // memakainya untuk menentukan endpoint tujuan. Sebagai gantinya endpoint ID
    // dikirim lewat parameter options, sesuai panduan https://neon.tech/sni
    if (preg_match('/^(ep-[a-z0-9-]+?)(?:-pooler)?\.[a-z0-9.-]+\.neon\.tech$/', $db_host, $neon)) {
        $db_options .= ";options='endpoint={$neon[1]}'";
    }
} else {
    $db_driver   = getenv('DB_DRIVER') ?: 'pgsql';
    $db_host     = getenv('DB_HOST') ?: '127.0.0.1';
    $db_port     = getenv('DB_PORT') ?: ($db_driver === 'mysql' ? '3306' : '5432');
    $db_name     = getenv('DB_NAME') ?: 'binamarga';
    $db_user     = getenv('DB_USER') ?: 'postgres';
    $db_password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : 'postgres';
}

try {
    if ($db_driver === 'mysql') {
        $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    } else {
        $dsn = "pgsql:host={$db_host};port={$db_port};dbname={$db_name}{$db_options}";
    }

    $pdo = new PDO(
        $dsn,
        $db_user,
        $db_password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log('Database Connection Error: ' . $e->getMessage());
    http_response_code(503);

    // Detail koneksi hanya ditampilkan saat APP_DEBUG=1 di lingkungan pengembangan.
    $detail = getenv('APP_DEBUG') === '1'
        ? ' (' . $e->getMessage() . ')'
        : '';

    if (defined('API_CONTEXT')) {
        header('Content-Type: application/json; charset=utf-8');
        die(json_encode([
            'success' => false,
            'message' => 'Layanan database sedang tidak tersedia.' . $detail,
        ]));
    }

    die('Layanan database sedang tidak tersedia. Silakan hubungi administrator sistem.' . htmlspecialchars($detail));
}

// Backward compatibility
$conn = $pdo;

// Auto-check & pastikan kolom 'role' ada pada tabel 'admin'
try {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $hasRole = false;

    if ($driver === 'pgsql') {
        $checkCol = $pdo->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admin' AND column_name = 'role'");
        $hasRole = (bool)$checkCol->fetchColumn();
    } else {
        $checkCol = $pdo->query("SHOW COLUMNS FROM admin LIKE 'role'");
        $hasRole = (bool)$checkCol->fetch();
    }

    if (!$hasRole) {
        $pdo->exec("ALTER TABLE admin ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin'");
        // Pastikan admin default pertama adalah super_admin
        if ($driver === 'pgsql') {
            $pdo->exec("UPDATE admin SET role = 'super_admin' WHERE id_admin = (SELECT id_admin FROM admin ORDER BY id_admin ASC LIMIT 1)");
        } else {
            $pdo->exec("UPDATE admin SET role = 'super_admin' ORDER BY id_admin ASC LIMIT 1");
        }
    }
} catch (Throwable $e) {
    // Jika tabel admin belum ada, akan dibuat oleh script instalasi
}
