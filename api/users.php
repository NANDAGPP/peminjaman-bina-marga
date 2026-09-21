<?php
/**
 * Endpoint Kelola User untuk Admin:
 * - Menampilkan seluruh data pegawai terdaftar dari tabel "user"
 * - Tambah pegawai baru
 * - Edit data pegawai
 * - Hapus pegawai
 */

require_once __DIR__ . '/bootstrap.php';

api_require_login();
api_require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    list_users($pdo);
}

if ($method !== 'POST') {
    api_error('Metode request tidak diizinkan.', 405);
}

api_require_csrf();

$input  = api_input();
$action = $_GET['action'] ?? ($input['action'] ?? 'create');

switch ($action) {
    case 'create':
        create_user($pdo, $input);
        break;
    case 'update':
        update_user($pdo, $input);
        break;
    case 'delete':
        delete_user($pdo, $input);
        break;
    case 'promote_to_admin':
        promote_to_admin($pdo, $input);
        break;
    case 'demote_from_admin':
        demote_from_admin($pdo, $input);
        break;
    default:
        api_error('Action user tidak dikenali.', 400);
}

function list_users($pdo)
{
    try {
        // Ambil pemetaan admin yang terdaftar di tabel admin
        $adminMap = [];
        try {
            $adminStmt = $pdo->query('SELECT id_admin, username, nip, role FROM admin');
            $adminRows = $adminStmt->fetchAll();
            foreach ($adminRows as $ar) {
                $role = ($ar['role'] ?? '') === 'super_admin' || (int)($ar['id_admin'] ?? 0) === 1
                    ? 'super_admin'
                    : 'admin';
                if (!empty($ar['nip'])) {
                    $adminMap[$ar['nip']] = $role;
                }
                if (!empty($ar['username'])) {
                    $adminMap[$ar['username']] = $role;
                }
            }
        } catch (Throwable $t) {
            // Abaikan jika tabel admin bermasalah
        }

        $stmt = $pdo->query(
            'SELECT id_user, username, nip, no_hp, foto FROM "user" ORDER BY id_user DESC'
        );
        $users = $stmt->fetchAll();

        $data = array_map(function ($u) use ($adminMap) {
            $foto = $u['foto'] ?: 'avatar_pria.png';
            if ($foto === 'default.png') {
                $foto = 'avatar_pria.png';
            }
            if (!str_starts_with($foto, 'http') && !str_starts_with($foto, '/')) {
                $foto = '/images/' . $foto;
            }

            $userNip   = (string)($u['nip'] ?? '');
            $userUname = (string)($u['username'] ?? '');
            $adminRole = $adminMap[$userNip] ?? ($adminMap[$userUname] ?? null);
            $isAdmin   = $adminRole !== null;

            return [
                'id'        => (int)$u['id_user'],
                'nama'      => $u['username'],
                'username'  => $u['username'],
                'nip'       => $u['nip'] ?: '-',
                'noHp'      => $u['no_hp'] ?: '-',
                'foto'      => $foto,
                'isAdmin'   => $isAdmin,
                'adminRole' => $adminRole,
            ];
        }, $users);

        api_success(['users' => $data]);
    } catch (PDOException $e) {
        api_server_error($e, 'users.list');
    }
}

function create_user($pdo, array $input)
{
    $username = trim($input['nama'] ?? ($input['username'] ?? ''));
    $nip      = trim($input['nip'] ?? '');
    $noHp     = trim($input['noHp'] ?? ($input['no_hp'] ?? ''));
    $password = (string)($input['password'] ?? 'user1234');
    $foto     = trim($input['foto'] ?? 'default.png');

    if ($username === '' || $nip === '') {
        api_error('Nama/Username dan NIP wajib diisi.');
    }

    try {
        $check = $pdo->prepare('SELECT id_user FROM "user" WHERE nip = :nip OR username = :username');
        $check->execute([':nip' => $nip, ':username' => $username]);
        if ($check->fetch()) {
            api_error('NIP atau Username sudah terdaftar.');
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare(
            'INSERT INTO "user" (username, nip, no_hp, password, foto)
             VALUES (:u, :nip, :hp, :pass, :foto)'
        );
        $stmt->execute([
            ':u'    => $username,
            ':nip'  => $nip,
            ':hp'   => $noHp,
            ':pass' => $hashed,
            ':foto' => $foto,
        ]);

        api_success(['id' => api_last_insert_id($pdo, 'user_id_user_seq')], 'Pegawai berhasil ditambahkan.');
    } catch (PDOException $e) {
        api_server_error($e, 'users.create');
    }
}

function update_user($pdo, array $input)
{
    $id       = (int)($input['id'] ?? ($input['id_user'] ?? 0));
    $username = trim($input['nama'] ?? ($input['username'] ?? ''));
    $nip      = trim($input['nip'] ?? '');
    $noHp     = trim($input['noHp'] ?? ($input['no_hp'] ?? ''));
    $password = isset($input['password']) ? trim((string)$input['password']) : '';
    $foto     = trim($input['foto'] ?? '');

    if ($id <= 0) {
        api_error('ID user tidak valid.');
    }

    if ($username === '' || $nip === '') {
        api_error('Nama/Username dan NIP wajib diisi.');
    }

    try {
        $check = $pdo->prepare('SELECT id_user FROM "user" WHERE (nip = :nip OR username = :username) AND id_user != :id');
        $check->execute([':nip' => $nip, ':username' => $username, ':id' => $id]);
        if ($check->fetch()) {
            api_error('NIP atau Username sudah digunakan oleh pengguna lain.');
        }

        $sql = 'UPDATE "user" SET username = :u, nip = :nip, no_hp = :hp';
        $params = [
            ':u'   => $username,
            ':nip' => $nip,
            ':hp'  => $noHp,
            ':id'  => $id,
        ];

        if ($password !== '') {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $sql .= ', password = :p';
            $params[':p'] = $hashed;
        }

        if ($foto !== '') {
            $sql .= ', foto = :foto';
            $params[':foto'] = $foto;
        }

        $sql .= ' WHERE id_user = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        api_success([], 'Data pegawai berhasil diperbarui.');
    } catch (PDOException $e) {
        api_server_error($e, 'users.update');
    }
}

function delete_user($pdo, array $input)
{
    $id = (int)($input['id'] ?? ($input['id_user'] ?? 0));

    if ($id <= 0) {
        api_error('ID user tidak valid.');
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM "user" WHERE id_user = :id');
        $stmt->execute([':id' => $id]);

        api_success([], 'Data pegawai berhasil dihapus.');
    } catch (PDOException $e) {
        api_server_error($e, 'users.delete');
    }
}

function promote_to_admin($pdo, array $input)
{
    // Hanya Super Admin yang berhak mengangkat user menjadi admin!
    api_require_super_admin();

    $id = (int)($input['id'] ?? ($input['id_user'] ?? 0));
    if ($id <= 0) {
        api_error('ID user tidak valid.');
    }

    try {
        $uStmt = $pdo->prepare('SELECT id_user, username, nip, password, foto FROM "user" WHERE id_user = :id');
        $uStmt->execute([':id' => $id]);
        $user = $uStmt->fetch();

        if (!$user) {
            api_error('Data pegawai tidak ditemukan.', 404);
        }

        // Cek apakah sudah terdaftar di tabel admin
        $checkStmt = $pdo->prepare('SELECT id_admin, role FROM admin WHERE nip = :nip OR username = :u');
        $checkStmt->execute([':nip' => $user['nip'], ':u' => $user['username']]);
        $existingAdmin = $checkStmt->fetch();

        if ($existingAdmin) {
            if (($existingAdmin['role'] ?? '') === 'super_admin') {
                api_error('Pengguna ini sudah memiliki hak akses Super Admin.');
            }
            $upd = $pdo->prepare('UPDATE admin SET role = :role, password = :p WHERE id_admin = :id');
            $upd->execute([
                ':role' => 'admin',
                ':p'    => $user['password'],
                ':id'   => $existingAdmin['id_admin'],
            ]);
        } else {
            $ins = $pdo->prepare(
                'INSERT INTO admin (username, nip, password, foto, role) VALUES (:u, :nip, :p, :foto, :role)'
            );
            $ins->execute([
                ':u'    => $user['username'],
                ':nip'  => $user['nip'],
                ':p'    => $user['password'],
                ':foto' => $user['foto'] ?: 'default.png',
                ':role' => 'admin',
            ]);
        }

        api_success([], 'Pegawai ' . $user['username'] . ' berhasil diangkat menjadi Admin.');
    } catch (PDOException $e) {
        api_server_error($e, 'users.promote_to_admin');
    }
}

function demote_from_admin($pdo, array $input)
{
    // Hanya Super Admin yang berhak mencabut status admin
    api_require_super_admin();

    $id = (int)($input['id'] ?? ($input['id_user'] ?? 0));
    if ($id <= 0) {
        api_error('ID user tidak valid.');
    }

    try {
        $uStmt = $pdo->prepare('SELECT username, nip FROM "user" WHERE id_user = :id');
        $uStmt->execute([':id' => $id]);
        $user = $uStmt->fetch();

        if (!$user) {
            api_error('Data pegawai tidak ditemukan.', 404);
        }

        $check = $pdo->prepare('SELECT id_admin, role FROM admin WHERE nip = :nip OR username = :u');
        $check->execute([':nip' => $user['nip'], ':u' => $user['username']]);
        $adminRow = $check->fetch();

        if (!$adminRow) {
            api_error('Pengguna ini belum terdaftar sebagai admin.', 400);
        }

        if (($adminRow['role'] ?? '') === 'super_admin' || (int)$adminRow['id_admin'] === 1) {
            api_error('Akun Super Admin utama tidak dapat dicabut hak aksesnya.', 400);
        }

        $del = $pdo->prepare('DELETE FROM admin WHERE id_admin = :id');
        $del->execute([':id' => $adminRow['id_admin']]);

        api_success([], 'Hak akses Admin untuk ' . $user['username'] . ' berhasil dicabut.');
    } catch (PDOException $e) {
        api_server_error($e, 'users.demote_from_admin');
    }
}
