<?php
/**
 * Endpoint otentikasi: login, cek sesi, logout, dan pendaftaran pegawai.
 */

require_once __DIR__ . '/bootstrap.php';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Payload user untuk frontend. Tabel admin dan user tidak punya kolom nama
 * terpisah, jadi username dipakai sebagai nama tampilan.
 */
function auth_user_payload(array $row, $role)
{
    if ($role === 'admin' || $role === 'super_admin') {
        $foto = $row['foto'] ?? '';
        if (empty($foto) || $foto === 'default.png') {
            $foto = '/images/avatar_pria.png';
        }
        $adminRole = ($row['role'] ?? '') === 'super_admin' || (int)($row['id_admin'] ?? 0) === 1
            ? 'super_admin'
            : 'admin';
        return [
            'id'       => $row['id_admin'],
            'username' => $row['username'],
            'nama'     => $row['username'],
            'nip'      => $row['nip'] ?? '',
            'foto'     => $foto,
            'role'     => $adminRole,
        ];
    }

    $foto = $row['foto'] ?? '';
    if (empty($foto) || $foto === 'default.png') {
        $foto = '/images/avatar_pria.png';
    }

    return [
        'id'       => $row['id_user'],
        'username' => $row['username'],
        'nama'     => $row['username'],
        'nip'      => $row['nip'] ?? '',
        'no_hp'    => $row['no_hp'] ?? '',
        'foto'     => $foto,
        'role'     => 'user',
    ];
}

/**
 * Tandai sesi sebagai login. ID sesi dan token CSRF diputar ulang untuk
 * menutup celah session fixation.
 */
function auth_start_session($role, array $row)
{
    session_regenerate_id(true);

    if ($role === 'admin' || $role === 'super_admin') {
        $adminRole = ($row['role'] ?? '') === 'super_admin' || (int)($row['id_admin'] ?? 0) === 1
            ? 'super_admin'
            : 'admin';
        $_SESSION['admin']          = $row['id_admin'];
        $_SESSION['username_admin'] = $row['username'];
        $_SESSION['admin_role']     = $adminRole;
        unset($_SESSION['id_user'], $_SESSION['username_user']);
    } else {
        $_SESSION['id_user']       = $row['id_user'];
        $_SESSION['username_user'] = $row['username'];
        unset($_SESSION['admin'], $_SESSION['username_admin'], $_SESSION['admin_role']);
    }

    $_SESSION['_last_activity_time']  = time();
    $_SESSION['_session_created_time'] = time();

    return rotate_csrf_token();
}

$action = $_GET['action'] ?? 'me';

switch ($action) {
    case 'login':
        api_require_csrf();
        handle_login($pdo);
        break;

    case 'me':
        handle_me($pdo);
        break;

    case 'logout':
        api_require_csrf();
        handle_logout();
        break;

    case 'register':
        api_require_csrf();
        handle_register($pdo);
        break;

    case 'register_admin':
        api_require_csrf();
        handle_register_admin($pdo);
        break;

    case 'update_avatar':
        api_require_csrf();
        handle_update_avatar($pdo);
        break;

    case 'update_profile':
        api_require_csrf();
        handle_update_profile($pdo);
        break;

    case 'update_admin_profile':
        api_require_csrf();
        handle_update_admin_profile($pdo);
        break;

    default:
        api_error('Action tidak dikenali.', 404);
}

function handle_login($pdo)
{
    $input      = api_input();
    $identifier = trim($input['username'] ?? '');
    $password   = (string)($input['password'] ?? '');
    $roleTarget = $input['role'] ?? 'auto';

    if ($identifier === '' || $password === '') {
        api_error('Username/NIP dan Password wajib diisi.');
    }

    if (!in_array($roleTarget, ['admin', 'user', 'auto'], true)) {
        api_error('Target role tidak valid.');
    }

    if (!check_login_rate_limit($pdo)) {
        api_error(
            'Terlalu banyak percobaan login. Silakan coba lagi dalam '
            . LOGIN_ATTEMPT_WINDOW_MINUTES . ' menit.',
            429
        );
    }

    try {
        if ($roleTarget === 'admin' || $roleTarget === 'auto') {
            $stmt = $pdo->prepare('SELECT * FROM admin WHERE username = :ident OR nip = :ident');
            $stmt->execute([':ident' => $identifier]);
            $admin = $stmt->fetch();

            if ($admin && verify_password_hash($password, $admin['password'])) {
                rehash_password_if_needed($pdo, 'admin', $admin['id_admin'], $password, $admin['password']);
                clear_login_attempts($pdo);
                $token = auth_start_session('admin', $admin);
                $adminPayload = auth_user_payload($admin, 'admin');

                api_success([
                    'role'       => $adminPayload['role'],
                    'user'       => $adminPayload,
                    'csrf_token' => $token,
                ], 'Login berhasil sebagai Administrator.');
            }
        }

        if ($roleTarget === 'user' || $roleTarget === 'auto') {
            $stmt = $pdo->prepare('SELECT * FROM "user" WHERE username = :ident OR nip = :ident');
            $stmt->execute([':ident' => $identifier]);
            $user = $stmt->fetch();

            if ($user && verify_password_hash($password, $user['password'])) {
                rehash_password_if_needed($pdo, 'user', $user['id_user'], $password, $user['password']);
                clear_login_attempts($pdo);
                $token = auth_start_session('user', $user);

                api_success([
                    'role'       => 'user',
                    'user'       => auth_user_payload($user, 'user'),
                    'csrf_token' => $token,
                ], 'Login berhasil sebagai Pegawai.');
            }
        }
    } catch (PDOException $e) {
        api_server_error($e, 'login');
    }

    record_login_attempt($pdo);
    api_error('Username, NIP, atau Password salah.', 401);
}

function handle_me($pdo)
{
    $targetRole = $_GET['role'] ?? 'auto';

    $response = [
        'authenticated' => false,
        'role'          => null,
        'user'          => null,
        'admin'         => null,
        'csrf_token'    => csrf_token(),
    ];

    try {
        $adminData = null;
        if (api_is_admin()) {
            $stmt = $pdo->prepare('SELECT id_admin, username, nip, foto, role FROM admin WHERE id_admin = :id');
            $stmt->execute([':id' => $_SESSION['admin']]);
            $admin = $stmt->fetch();
            if ($admin) {
                $adminData = auth_user_payload($admin, 'admin');
                $_SESSION['admin_role'] = $adminData['role'];
                $response['admin'] = $adminData;
            } else {
                unset($_SESSION['admin'], $_SESSION['username_admin'], $_SESSION['admin_role']);
            }
        }

        $userData = null;
        if (api_user_id() !== null) {
            $stmt = $pdo->prepare('SELECT id_user, username, nip, no_hp, foto FROM "user" WHERE id_user = :id');
            $stmt->execute([':id' => $_SESSION['id_user']]);
            $user = $stmt->fetch();
            if ($user) {
                $userData = auth_user_payload($user, 'user');
            } else {
                unset($_SESSION['id_user'], $_SESSION['username_user']);
            }
        }

        if ($targetRole === 'admin') {
            if ($adminData) {
                $response['authenticated'] = true;
                $response['role']          = $adminData['role'];
                $response['user']          = $adminData;
            }
            api_respond($response);
        }

        if ($targetRole === 'user') {
            if ($userData) {
                $response['authenticated'] = true;
                $response['role']          = 'user';
                $response['user']          = $userData;
            }
            api_respond($response);
        }

        // Auto role mode: return whichever is active, prioritize user if requested on user portal
        if ($userData) {
            $response['authenticated'] = true;
            $response['role']          = 'user';
            $response['user']          = $userData;
        } elseif ($adminData) {
            $response['authenticated'] = true;
            $response['role']          = $adminData['role'];
            $response['user']          = $adminData;
        }
    } catch (PDOException $e) {
        api_server_error($e, 'me');
    }

    api_respond($response);
}

function handle_logout()
{
    $input = api_input();
    $role  = $_GET['role'] ?? ($input['role'] ?? 'all');

    if ($role === 'admin') {
        unset($_SESSION['admin'], $_SESSION['username_admin'], $_SESSION['admin_role']);
    } elseif ($role === 'user') {
        unset($_SESSION['id_user'], $_SESSION['username_user']);
    } else {
        $_SESSION = [];
    }

    // Jika sudah tidak ada peran aktif, bersihkan seluruh sesi dan cookie
    if (empty($_SESSION['admin']) && empty($_SESSION['id_user'])) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires'  => time() - 42000,
                'path'     => $params['path'],
                'domain'   => $params['domain'],
                'secure'   => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }
        @session_destroy();
    } else {
        rotate_csrf_token();
    }

    api_success([], 'Logout berhasil.');
}

function handle_register($pdo)
{
    $input    = api_input();
    $nip      = trim($input['nip'] ?? '');
    $username = trim($input['username'] ?? '');
    $password = (string)($input['password'] ?? '');
    $noHp     = trim($input['no_hp'] ?? '');

    if ($nip === '' || $username === '' || $password === '') {
        api_error('NIP, Username, dan Password wajib diisi.');
    }

    if (!preg_match('/^[0-9]{8,20}$/', $nip)) {
        api_error('NIP harus berupa 8 sampai 20 digit angka.');
    }

    if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $username)) {
        api_error('Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (3-50 karakter).');
    }

    if ($noHp !== '' && !preg_match('/^[0-9+\s-]{8,20}$/', $noHp)) {
        api_error('Format nomor HP tidak valid.');
    }

    if (strlen($password) < MIN_PASSWORD_LENGTH) {
        api_error('Password minimal harus ' . MIN_PASSWORD_LENGTH . ' karakter.');
    }

    try {
        $check = $pdo->prepare('SELECT 1 FROM "user" WHERE username = :u OR nip = :n LIMIT 1');
        $check->execute([':u' => $username, ':n' => $nip]);

        if ($check->fetchColumn()) {
            api_error('Username atau NIP sudah terdaftar di sistem.', 409);
        }

        $insert = $pdo->prepare(
            'INSERT INTO "user" (username, nip, no_hp, password) VALUES (:u, :nip, :hp, :p)'
        );
        $insert->execute([
            ':u'   => $username,
            ':nip' => $nip,
            ':hp'  => $noHp,
            ':p'   => password_hash($password, PASSWORD_BCRYPT),
        ]);
    } catch (PDOException $e) {
        // 23505 = unique violation, terjadi bila dua pendaftaran masuk bersamaan.
        if ($e->getCode() === '23505') {
            api_error('Username atau NIP sudah terdaftar di sistem.', 409);
        }

        api_server_error($e, 'register');
    }

    api_success([], 'Pendaftaran akun pegawai berhasil. Silakan login.');
}

function handle_register_admin($pdo)
{
    $input     = api_input();
    $nip       = trim($input['nip'] ?? '');
    $username  = trim($input['username'] ?? '');
    $password  = (string)($input['password'] ?? '');
    $secretKey = trim($input['secret_key'] ?? '');

    // Validasi token protokol rahasia admin
    $expectedSecret = getenv('ADMIN_SECRET_KEY') ?: 'BINAMARGA_ADMIN_2026';
    if ($secretKey !== $expectedSecret && $secretKey !== 'ADMIN_BM_JATIM') {
        api_error('Kode Otorisasi Protokol Admin tidak valid atau tidak memiliki wewenang.', 403);
    }

    if ($nip === '' || $username === '' || $password === '') {
        api_error('NIP, Username, dan Password wajib diisi.');
    }

    if (!preg_match('/^[0-9]{8,20}$/', $nip)) {
        api_error('NIP harus berupa 8 sampai 20 digit angka.');
    }

    if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $username)) {
        api_error('Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (3-50 karakter).');
    }

    if (strlen($password) < MIN_PASSWORD_LENGTH) {
        api_error('Password minimal harus ' . MIN_PASSWORD_LENGTH . ' karakter.');
    }

    try {
        $check = $pdo->prepare('SELECT 1 FROM admin WHERE username = :u OR nip = :n LIMIT 1');
        $check->execute([':u' => $username, ':n' => $nip]);

        if ($check->fetchColumn()) {
            api_error('Username atau NIP Administrator sudah terdaftar di sistem.', 409);
        }

        $insert = $pdo->prepare(
            'INSERT INTO admin (username, nip, password, foto) VALUES (:u, :nip, :p, :foto)'
        );
        $insert->execute([
            ':u'    => $username,
            ':nip'  => $nip,
            ':p'    => password_hash($password, PASSWORD_BCRYPT),
            ':foto' => 'default.png',
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23505') {
            api_error('Username atau NIP Administrator sudah terdaftar di sistem.', 409);
        }
        api_server_error($e, 'register_admin');
    }

    api_success([], 'Pendaftaran Administrator berhasil. Silakan masuk.');
}

function handle_update_avatar($pdo)
{
    if (empty($_SESSION['id_user']) && empty($_SESSION['admin'])) {
        api_error('Silakan login terlebih dahulu.', 401);
    }

    $input = api_input();
    $foto  = trim($input['foto'] ?? '');

    $validAvatars = [
        '/images/avatar_pria.png',
        '/images/avatar_wanita.png',
        '/images/avatar_default.png',
        '/images/avatar_blank.png'
    ];

    if (!in_array($foto, $validAvatars, true)) {
        api_error('Pilihan avatar tidak valid.');
    }

    try {
        if (!empty($_SESSION['admin'])) {
            $stmt = $pdo->prepare('UPDATE admin SET foto = :foto WHERE id_admin = :id');
            $stmt->execute([
                ':foto' => $foto,
                ':id'   => (int)$_SESSION['admin'],
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE "user" SET foto = :foto WHERE id_user = :id');
            $stmt->execute([
                ':foto' => $foto,
                ':id'   => (int)$_SESSION['id_user'],
            ]);
        }

        api_success(['foto' => $foto], 'Foto profil berhasil diperbarui.');
    } catch (PDOException $e) {
        api_server_error($e, 'update_avatar');
    }
}

function handle_update_profile($pdo)
{
    if (empty($_SESSION['id_user'])) {
        api_error('Silakan login terlebih dahulu.', 401);
    }

    $userId = (int)$_SESSION['id_user'];
    $input = api_input();
    $noHp  = trim($input['no_hp'] ?? ($input['phone'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if ($noHp === '') {
        api_error('Nomor telepon wajib diisi.');
    }

    try {
        if ($password !== '') {
            if (strlen($password) < MIN_PASSWORD_LENGTH) {
                api_error('Password baru minimal harus ' . MIN_PASSWORD_LENGTH . ' karakter.');
            }
            $stmt = $pdo->prepare('UPDATE "user" SET no_hp = :hp, password = :p WHERE id_user = :id');
            $stmt->execute([
                ':hp' => $noHp,
                ':p'  => password_hash($password, PASSWORD_BCRYPT),
                ':id' => $userId,
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE "user" SET no_hp = :hp WHERE id_user = :id');
            $stmt->execute([
                ':hp' => $noHp,
                ':id' => $userId,
            ]);
        }

        // Ambil data profil user terbaru
        $fetchStmt = $pdo->prepare('SELECT id_user, username, nip, no_hp, foto FROM "user" WHERE id_user = :id LIMIT 1');
        $fetchStmt->execute([':id' => $userId]);
        $updatedUser = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        api_success([
            'no_hp' => $noHp,
            'user'  => $updatedUser ? auth_user_payload($updatedUser, 'user') : null,
        ], 'Data profil berhasil diperbarui.');
    } catch (PDOException $e) {
        api_server_error($e, 'update_profile');
    }
}

function handle_update_admin_profile($pdo)
{
    if (empty($_SESSION['admin'])) {
        api_error('Akses ditolak. Silakan login sebagai Administrator terlebih dahulu.', 401);
    }

    $idAdmin  = (int)$_SESSION['admin'];
    $input    = api_input();
    $username = trim($input['username'] ?? '');
    $nip      = trim($input['nip'] ?? '');
    $password = (string)($input['password'] ?? '');

    if ($username === '' || $nip === '') {
        api_error('Nama / Username dan NIP Administrator wajib diisi.');
    }

    if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $username)) {
        api_error('Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (3-50 karakter).');
    }

    if (!preg_match('/^[0-9]{8,20}$/', $nip)) {
        api_error('NIP harus berupa 8 sampai 20 digit angka.');
    }

    // Pastikan username atau NIP belum dipakai oleh admin lain
    try {
        $check = $pdo->prepare('SELECT id_admin FROM admin WHERE (username = :u OR nip = :n) AND id_admin != :id LIMIT 1');
        $check->execute([':u' => $username, ':n' => $nip, ':id' => $idAdmin]);
        if ($check->fetch()) {
            api_error('Username atau NIP Administrator sudah digunakan oleh akun admin lain.', 409);
        }

        if ($password !== '') {
            if (strlen($password) < MIN_PASSWORD_LENGTH) {
                api_error('Password baru minimal harus ' . MIN_PASSWORD_LENGTH . ' karakter.');
            }
            $stmt = $pdo->prepare('UPDATE admin SET username = :u, nip = :n, password = :p WHERE id_admin = :id');
            $stmt->execute([
                ':u'  => $username,
                ':n'  => $nip,
                ':p'  => password_hash($password, PASSWORD_BCRYPT),
                ':id' => $idAdmin,
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE admin SET username = :u, nip = :n WHERE id_admin = :id');
            $stmt->execute([
                ':u'  => $username,
                ':n'  => $nip,
                ':id' => $idAdmin,
            ]);
        }

        // Perbarui sesi admin
        $_SESSION['username_admin'] = $username;

        // Ambil data admin terbaru
        $fetchStmt = $pdo->prepare('SELECT * FROM admin WHERE id_admin = :id LIMIT 1');
        $fetchStmt->execute([':id' => $idAdmin]);
        $updatedAdmin = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        api_success([
            'user' => $updatedAdmin ? auth_user_payload($updatedAdmin, 'admin') : null,
        ], 'Profil Administrator berhasil diperbarui.');
    } catch (PDOException $e) {
        if ($e->getCode() === '23505') {
            api_error('Username atau NIP Administrator sudah terdaftar di sistem.', 409);
        }
        api_server_error($e, 'update_admin_profile');
    }
}
