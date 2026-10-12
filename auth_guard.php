<?php
/**
 * ============================================================
 * Auth Guard — Session Protection, CSRF Token & Security Layer
 * ============================================================
 * Melindungi sesi aplikasi, mencegah Session Fixation, Session Hijacking,
 * CSRF Attack, Brute Force Rate Limiting, dan Cross-Site Scripting (XSS).
 *
 * Mendukung PostgreSQL & MySQL dengan penanganan fail-safe di Vercel / serverless.
 */

// Konfigurasi ketat PHP Session Engine sebelum session_start
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.gc_maxlifetime', '7200'); // 2 jam

    // Pakai SESSION_SAMESITE=None bila frontend dan API berada di domain berbeda.
    // Browser hanya menerima None bila cookie juga Secure (HTTPS).
    $sameSite = getenv('SESSION_SAMESITE') ?: 'Lax';
    $isHttps  = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_set_cookie_params([
        'lifetime' => 0, // Sesi cookie browser
        'path'     => '/',
        'secure'   => $isHttps || $sameSite === 'None',
        'httponly' => true,
        'samesite' => $sameSite,
    ]);

    // Di Vercel tiap request bisa ditangani instance berbeda, jadi sesi disimpan di database.
    $sessionDriver = getenv('SESSION_DRIVER') ?: (getenv('VERCEL') ? 'database' : 'files');

    if ($sessionDriver === 'database') {
        require_once __DIR__ . '/koneksi.php';
        require_once __DIR__ . '/session_db.php';
        session_set_save_handler(new DatabaseSessionHandler($pdo), true);
    }

    session_start();

    // 1. Inactivity (Idle) Timeout Enforcement: 2 Jam (7200 Detik)
    $idleLimit = 7200;
    if (isset($_SESSION['_last_activity_time']) && (time() - $_SESSION['_last_activity_time'] > $idleLimit)) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        session_start();
    }
    $_SESSION['_last_activity_time'] = time();

    // 2. Periodic Session ID Regeneration: Rotasi ID setiap 30 menit untuk sesi aktif panjang
    if (!isset($_SESSION['_session_created_time'])) {
        $_SESSION['_session_created_time'] = time();
    } elseif (time() - $_SESSION['_session_created_time'] > 1800) {
        session_regenerate_id(true);
        $_SESSION['_session_created_time'] = time();
    }

    // 3. Session Fingerprint Guard (Mitigasi Session Hijacking antar perangkat)
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'standard_client';
    $clientSubnet = substr(client_ip(), 0, 7); // Mengizinkan rotasi IP dinamis dalam subnet lokal
    $clientFingerprint = hash('sha256', $ua . '|' . $clientSubnet);

    if (!isset($_SESSION['_client_fingerprint'])) {
        $_SESSION['_client_fingerprint'] = $clientFingerprint;
    } elseif (!hash_equals($_SESSION['_client_fingerprint'], $clientFingerprint)) {
        // Jika fingerprint berbeda secara ekstrem (indikasi pencurian cookie ke browser berbeda)
        error_log('[Security Guard] Sesi dihentikan karena anomali fingerprint perangkat pemohon.');
        $_SESSION = [];
        session_destroy();
        session_start();
        $_SESSION['_client_fingerprint'] = $clientFingerprint;
        $_SESSION['_session_created_time'] = time();
        $_SESSION['_last_activity_time'] = time();
    }
}

/**
 * Redirect ke halaman login jika bukan admin
 */
function require_admin()
{
    if (!isset($_SESSION['admin'])) {
        header('Location: loginadmin.php');
        exit;
    }
}

/**
 * Cek apakah session yang login adalah Super Admin
 */
function is_super_admin()
{
    return isset($_SESSION['admin']) && (($_SESSION['admin_role'] ?? '') === 'super_admin');
}

/**
 * Wajibkan akses Super Admin
 */
function require_super_admin()
{
    require_admin();
    if (!is_super_admin()) {
        http_response_code(403);
        die("Akses ditolak: Tindakan ini hanya dapat dilakukan oleh Super Admin.");
    }
}

/**
 * Redirect ke halaman login jika bukan user
 */
function require_user()
{
    if (!isset($_SESSION['id_user'])) {
        header('Location: loginuser.php');
        exit;
    }
}

/**
 * Cek apakah sudah login (admin ATAU user)
 */
function require_login()
{
    if (!isset($_SESSION['admin']) && !isset($_SESSION['id_user'])) {
        header('Location: loginuser.php');
        exit;
    }
}

// ============================================================
// CSRF Token Functions
// ============================================================

/**
 * Generate CSRF token dan simpan di session
 */
function csrf_token()
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Buat ulang CSRF token, dipakai setiap kali status login berubah
 */
function rotate_csrf_token()
{
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf_token'];
}

/**
 * Return hidden input field dengan CSRF token
 */
function csrf_field()
{
    return '<input type="hidden" name="csrf_token" value="' . csrf_token() . '">';
}

/**
 * Validasi CSRF token dari POST/GET request atau HTTP header (X-CSRF-Token).
 * Mendukung form biasa maupun AJAX fetch request.
 */
function verify_csrf($is_ajax = false)
{
    $token = $_POST['csrf_token'] 
        ?? $_SERVER['HTTP_X_CSRF_TOKEN'] 
        ?? $_GET['csrf_token'] 
        ?? '';

    $sessionToken = $_SESSION['csrf_token'] ?? '';

    if (empty($token) || empty($sessionToken) || !hash_equals($sessionToken, $token)) {
        http_response_code(403);
        if ($is_ajax || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status'  => 'error',
                'message' => 'Akses ditolak: token keamanan (CSRF) tidak valid.'
            ]);
            exit;
        }
        die("Akses ditolak: token keamanan tidak valid. Silakan muat ulang halaman.");
    }
}

// ============================================================
// Sanitization & Output Helpers
// ============================================================

/**
 * Escape HTML output (mencegah XSS)
 */
function e($value)
{
    return htmlspecialchars((string)($value ?? ''), ENT_QUOTES, 'UTF-8');
}

/**
 * Helper untuk response JSON yang seragam
 */
function json_response($status, $message = '', $data = [], $code = 200)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status'  => $status,
        'message' => $message,
        'data'    => $data
    ]);
    exit;
}

// ============================================================
// Flash Messages System
// ============================================================

/**
 * Simpan flash message ke session
 * @param string $type 'success' | 'error' | 'warning' | 'info'
 * @param string $message
 */
function set_flash($type, $message)
{
    $_SESSION['flash'] = [
        'type'    => $type,
        'message' => $message
    ];
}

/**
 * Cek apakah ada flash message
 */
function has_flash()
{
    return !empty($_SESSION['flash']);
}

/**
 * Ambil flash message lalu bersihkan dari session
 */
function get_flash()
{
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

/**
 * Verifikasi password terhadap hash bcrypt. Seluruh penulisan password
 * di aplikasi ini memakai password_hash(PASSWORD_BCRYPT).
 */
function verify_password_hash($inputPassword, $storedHash)
{
    if (empty($storedHash)) {
        // Verifikasi dummy supaya waktu respons akun tidak ada dan akun ada tetap mirip (anti timing attack).
        password_verify($inputPassword, '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30M1MlGnPy');
        return false;
    }

    return password_verify($inputPassword, $storedHash);
}

/**
 * Perbarui hash password bila parameter bcrypt sudah tidak sesuai standar terbaru.
 */
function rehash_password_if_needed($pdo, $account, $id, $plainPassword, $storedHash)
{
    $targets = [
        'admin' => ['table' => 'admin', 'id' => 'id_admin'],
        'user'  => ['table' => '"user"', 'id' => 'id_user'],
    ];

    if (!isset($targets[$account]) || !password_needs_rehash($storedHash, PASSWORD_BCRYPT)) {
        return;
    }

    $table    = $targets[$account]['table'];
    $idColumn = $targets[$account]['id'];

    try {
        $stmt = $pdo->prepare("UPDATE {$table} SET password = :hash WHERE {$idColumn} = :id");
        $stmt->execute([
            ':hash' => password_hash($plainPassword, PASSWORD_BCRYPT),
            ':id'   => $id,
        ]);
    } catch (PDOException $e) {
        error_log('Gagal memperbarui hash password: ' . $e->getMessage());
    }
}

// ============================================================
// Login Rate Limiting (Cross-Database: PostgreSQL & MySQL)
// ============================================================

define('LOGIN_ATTEMPT_WINDOW_MINUTES', 15);
define('LOGIN_MAX_ATTEMPTS', 8);

/**
 * IP pemanggil. X-Forwarded-For hanya dipakai di belakang proxy tepercaya
 * (TRUSTED_PROXY=1, atau Vercel yang selalu menimpa header tersebut).
 */
function client_ip()
{
    $trustProxy = getenv('TRUSTED_PROXY') === '1' || getenv('VERCEL') === '1';

    if ($trustProxy && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $forwarded = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($forwarded[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Memastikan tabel login_attempts tersedia baik di PostgreSQL maupun MySQL
 */
function ensure_login_attempts_table($pdo)
{
    static $ready = false;
    if ($ready) return;

    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) ?: 'pgsql';
        if ($driver === 'pgsql') {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS login_attempts (
                    id SERIAL PRIMARY KEY,
                    ip_address VARCHAR(45) NOT NULL,
                    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip_address, attempted_at);
            ");
        } else {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `login_attempts` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `ip_address` VARCHAR(45) NOT NULL,
                    `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX `idx_login_attempts_ip` (`ip_address`, `attempted_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
        }
        $ready = true;
    } catch (Throwable $e) {
        // Abaikan jika sudah ada
    }
}

/**
 * Cek apakah IP sudah melampaui batas percobaan login dalam rentang waktu aktif.
 */
function check_login_rate_limit($pdo)
{
    ensure_login_attempts_table($pdo);
    $ip     = client_ip();
    $window = LOGIN_ATTEMPT_WINDOW_MINUTES;

    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) ?: 'pgsql';
        
        // Kompatibilitas query interval antara PostgreSQL & MySQL
        if ($driver === 'pgsql') {
            $cleanQuery = "DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '{$window} minutes'";
            $countQuery = "SELECT COUNT(*) AS total FROM login_attempts WHERE ip_address = :ip AND attempted_at > NOW() - INTERVAL '{$window} minutes'";
        } else {
            $cleanQuery = "DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL {$window} MINUTE)";
            $countQuery = "SELECT COUNT(*) AS total FROM login_attempts WHERE ip_address = :ip AND attempted_at > DATE_SUB(NOW(), INTERVAL {$window} MINUTE)";
        }

        $pdo->prepare($cleanQuery)->execute();

        $stmt = $pdo->prepare($countQuery);
        $stmt->execute([':ip' => $ip]);

        return (int)($stmt->fetch()['total'] ?? 0) < LOGIN_MAX_ATTEMPTS;
    } catch (PDOException $e) {
        error_log('Rate limit check error: ' . $e->getMessage());
        return true;
    }
}

/**
 * Catat satu percobaan login yang gagal.
 */
function record_login_attempt($pdo)
{
    ensure_login_attempts_table($pdo);
    try {
        $stmt = $pdo->prepare('INSERT INTO login_attempts (ip_address) VALUES (:ip)');
        $stmt->execute([':ip' => client_ip()]);
    } catch (PDOException $e) {
        error_log('Gagal mencatat percobaan login: ' . $e->getMessage());
    }
}

/**
 * Hapus record login attempts setelah berhasil login
 */
function clear_login_attempts($pdo)
{
    ensure_login_attempts_table($pdo);
    try {
        $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE ip_address = :ip');
        $stmt->execute([':ip' => client_ip()]);
    } catch (PDOException $e) {
        error_log('Gagal membersihkan percobaan login: ' . $e->getMessage());
    }
}
?>
