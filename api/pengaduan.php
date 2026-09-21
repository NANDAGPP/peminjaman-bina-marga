<?php
/**
 * Endpoint pengaduan: daftar laporan, pengajuan baru, update status, dan hapus.
 */

require_once __DIR__ . '/bootstrap.php';

// Mengikuti daftar status pada status_pengaduan.php
const STATUS_PENGADUAN = ['Belum', 'Diproses', 'Disetujui', 'Ditolak', 'Selesai', 'Ditanggapi'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    list_pengaduan($pdo);
}

if ($method !== 'POST') {
    api_error('Metode request tidak diizinkan.', 405);
}

api_require_csrf();

$input     = api_input();
$subAction = $_GET['action'] ?? ($input['action'] ?? '');

switch ($subAction) {
    case 'status':
        update_status($pdo, $input);
        break;

    case 'delete':
        delete_pengaduan($pdo, $input);
        break;

    default:
        create_pengaduan($pdo, $input);
}

/**
 * Admin melihat seluruh laporan, pegawai hanya laporan miliknya sendiri.
 */
function list_pengaduan($pdo)
{
    api_require_login();

    try {
        if (api_is_admin()) {
            $stmt = $pdo->query(
                'SELECT id_pengaduan, id_user, nama, nip, keluhan, status, tanggal
                 FROM pengaduan ORDER BY id_pengaduan DESC'
            );
        } else {
            $stmt = $pdo->prepare(
                'SELECT id_pengaduan, id_user, nama, nip, keluhan, status, tanggal
                 FROM pengaduan WHERE id_user = :uid ORDER BY id_pengaduan DESC'
            );
            $stmt->execute([':uid' => api_user_id()]);
        }

        api_success(['data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        api_server_error($e, 'pengaduan.list');
    }
}

/**
 * Nama dan NIP diambil dari sesi, bukan dari body request, supaya laporan
 * tidak bisa diatasnamakan pegawai lain.
 */
function create_pengaduan($pdo, array $input)
{
    api_require_login();

    if (api_user_id() === null) {
        api_error('Pengaduan hanya dapat diajukan oleh akun pegawai.', 403);
    }

    $keluhan = trim($input['keluhan'] ?? '');

    if ($keluhan === '') {
        api_error('Isi keluhan wajib diisi.');
    }

    if (mb_strlen($keluhan) > 2000) {
        api_error('Isi keluhan maksimal 2000 karakter.');
    }

    try {
        $stmt = $pdo->prepare('SELECT id_user, username, nip FROM "user" WHERE id_user = :id');
        $stmt->execute([':id' => api_user_id()]);
        $user = $stmt->fetch();

        if (!$user) {
            api_error('Akun pegawai tidak ditemukan.', 401);
        }

        $insert = $pdo->prepare(
            'INSERT INTO pengaduan (id_user, nama, nip, keluhan, status, tanggal)
             VALUES (:uid, :nama, :nip, :keluhan, :status, :tanggal)'
        );
        $insert->execute([
            ':uid'     => $user['id_user'],
            ':nama'    => $user['username'],
            ':nip'     => $user['nip'],
            ':keluhan' => $keluhan,
            ':status'  => 'Belum',
            ':tanggal' => date('Y-m-d'),
        ]);

        api_success(['id' => $pdo->lastInsertId()], 'Pengaduan berhasil diajukan.');
    } catch (PDOException $e) {
        api_server_error($e, 'pengaduan.create');
    }
}

function update_status($pdo, array $input)
{
    api_require_admin();

    $id     = (int)($input['id_pengaduan'] ?? $input['id'] ?? 0);
    $status = trim($input['status'] ?? '');

    if ($id <= 0) {
        api_error('ID pengaduan tidak valid.');
    }

    if (!in_array($status, STATUS_PENGADUAN, true)) {
        api_error('Status pengaduan tidak dikenali.');
    }

    try {
        $stmt = $pdo->prepare('UPDATE pengaduan SET status = :status WHERE id_pengaduan = :id');
        $stmt->execute([':status' => $status, ':id' => $id]);

        if ($stmt->rowCount() === 0) {
            api_error('Pengaduan tidak ditemukan.', 404);
        }

        api_success([], 'Status pengaduan berhasil diperbarui.');
    } catch (PDOException $e) {
        api_server_error($e, 'pengaduan.status');
    }
}

function delete_pengaduan($pdo, array $input)
{
    api_require_admin();

    $id = (int)($input['id_pengaduan'] ?? $input['id'] ?? 0);

    if ($id <= 0) {
        api_error('ID pengaduan tidak valid.');
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM pengaduan WHERE id_pengaduan = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            api_error('Pengaduan tidak ditemukan.', 404);
        }

        api_success([], 'Laporan pengaduan berhasil dihapus.');
    } catch (PDOException $e) {
        api_server_error($e, 'pengaduan.delete');
    }
}
