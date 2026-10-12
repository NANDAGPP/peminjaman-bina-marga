<?php
/**
 * ============================================================
 * Bootstrap Endpoint API
 * ============================================================
 * CORS, sesi, parsing input, otorisasi, dan format respons JSON
 * untuk seluruh file di folder api/.
 */

// Di Vercel setiap file api/*.php bisa dipanggil lewat URL, termasuk file ini.
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

define('API_CONTEXT', true);

/**
 * Origin yang boleh memanggil API, diatur lewat ALLOWED_ORIGINS (dipisah koma).
 * Contoh: ALLOWED_ORIGINS="https://peminjaman-binamarga.vercel.app,http://localhost:5173"
 */
function allowed_origins()
{
    $configured = getenv('ALLOWED_ORIGINS') ?: '';
    if ($configured !== '') {
        return array_values(array_filter(array_map('trim', explode(',', $configured))));
    }

    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
}

/**
 * Verifikasi apakah origin diizinkan (mendukung custom domain, vercel preview, dan localhost dev)
 */
function is_origin_allowed(string $origin): bool
{
    if ($origin === '') {
        return true;
    }

    $allowedList = allowed_origins();
    if (in_array($origin, $allowedList, true)) {
        return true;
    }

    // Izinkan same-host jika aplikasi diakses dari domain yang sama
    $currentHost = $_SERVER['HTTP_HOST'] ?? '';
    if ($currentHost !== '') {
        if ($origin === "https://{$currentHost}" || $origin === "http://{$currentHost}") {
            return true;
        }
    }

    // Izinkan subdomain vercel.app resmi (deployment & preview)
    if (preg_match('/^https:\/\/[a-zA-Z0-9_\-]+\.vercel\.app$/', $origin)) {
        return true;
    }

    // Izinkan localhost / 127.0.0.1 pada port dev umum (5173, 3000, 4173, 8080)
    if (preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{2,5})?$/', $origin)) {
        return true;
    }

    return false;
}

/**
 * Header CORS & Security Headers defensif
 */
function apply_cors_headers()
{
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    header('Vary: Origin');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '' && is_origin_allowed($origin)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
    }

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code($origin === '' || is_origin_allowed($origin) ? 204 : 403);
        exit;
    }
}

/**
 * Ambil payload request, baik JSON maupun form biasa.
 */
function api_input()
{
    static $input = null;

    if ($input === null) {
        $decoded = json_decode(file_get_contents('php://input'), true);
        $input   = is_array($decoded) ? $decoded : $_POST;
    }

    return $input;
}

function api_respond(array $payload, $code = 200)
{
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function api_success(array $payload = [], $message = '')
{
    api_respond(array_merge(['success' => true, 'message' => $message], $payload));
}

function api_error($message, $code = 400, array $extra = [])
{
    api_respond(array_merge(['success' => false, 'message' => $message], $extra), $code);
}

/**
 * Detail exception masuk ke log server, klien hanya menerima pesan umum.
 */
function api_server_error(Throwable $e, $context)
{
    error_log("[api][{$context}] " . $e->getMessage());
    api_error('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.', 500);
}

function api_is_admin()
{
    return !empty($_SESSION['admin']);
}

function api_user_id()
{
    return $_SESSION['id_user'] ?? null;
}

function api_require_login()
{
    if (!api_is_admin() && api_user_id() === null) {
        api_error('Sesi tidak ditemukan. Silakan login terlebih dahulu.', 401);
    }
}

function api_require_admin()
{
    if (!api_is_admin()) {
        api_error('Akses ditolak. Menu ini khusus administrator.', 403);
    }
}

function api_is_super_admin()
{
    return api_is_admin() && (($_SESSION['admin_role'] ?? '') === 'super_admin');
}

function api_require_super_admin()
{
    api_require_admin();
    if (!api_is_super_admin()) {
        api_error('Akses ditolak. Tindakan ini hanya dapat dilakukan oleh Super Admin.', 403);
    }
}

/**
 * Wajib untuk request yang mengubah data. Klien mengambil token dari
 * auth.php?action=me lalu mengirimnya lewat header X-CSRF-Token.
 */
function api_require_csrf()
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        return;
    }

    $sent    = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? (api_input()['csrf_token'] ?? '');
    $session = $_SESSION['csrf_token'] ?? '';

    if ($sent === '' || $session === '' || !hash_equals($session, $sent)) {
        api_error('Token keamanan tidak valid. Silakan muat ulang halaman.', 419);
    }
}

function api_last_insert_id($pdo, string $seq = '')
{
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'pgsql' && $seq !== '') {
            return (int)$pdo->lastInsertId($seq);
        }
    } catch (Throwable $t) {
    }

    return (int)$pdo->lastInsertId();
}

// Header dikirim lebih dulu supaya respons kegagalan koneksi pun tetap
// berformat JSON dan lolos CORS.
apply_cors_headers();

require_once __DIR__ . '/../auth_guard.php';
require_once __DIR__ . '/../koneksi.php';
