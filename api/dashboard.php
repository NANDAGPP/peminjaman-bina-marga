<?php
/**
 * Ringkasan data untuk dashboard admin: jumlah aset per status,
 * jumlah pegawai, dan peminjaman terbaru.
 */

require_once __DIR__ . '/bootstrap.php';

api_require_login();
api_require_admin();

/**
 * Susun rekap {total, tersedia, dipinjam, maintenance} dari hasil GROUP BY.
 */
function rekap_status(array $rows)
{
    $rekap = ['total' => 0, 'tersedia' => 0, 'dipinjam' => 0, 'maintenance' => 0];

    foreach ($rows as $row) {
        $status = strtolower($row['status'] ?? '');
        $jumlah = (int)$row['jumlah'];

        $rekap['total'] += $jumlah;

        if (isset($rekap[$status])) {
            $rekap[$status] += $jumlah;
        }
    }

    return $rekap;
}

try {
    $kendaraan = $pdo->query(
        'SELECT kategori, status, COUNT(*) AS jumlah FROM kendaraan GROUP BY kategori, status'
    )->fetchAll();

    $mobil = rekap_status(array_filter($kendaraan, function ($row) {
        return strtolower($row['kategori']) === 'mobil';
    }));

    $motor = rekap_status(array_filter($kendaraan, function ($row) {
        return strtolower($row['kategori']) === 'motor';
    }));

    $ruangan = rekap_status(
        $pdo->query('SELECT status, COUNT(*) AS jumlah FROM ruangan GROUP BY status')->fetchAll()
    );

    $totalUser = (int)$pdo->query('SELECT COUNT(*) FROM "user"')->fetchColumn();

    $recentLoans = $pdo->query(
        'SELECT id_peminjaman, username, jenis_aset, nama, tanggal_mulai, tanggal_selesai, status_pengajuan
         FROM peminjaman ORDER BY id_peminjaman DESC LIMIT 5'
    )->fetchAll();

    api_success([
        'counts' => [
            'totalUser'    => $totalUser,
            'totalMobil'   => $mobil['total'],
            'totalMotor'   => $motor['total'],
            'totalRuangan' => $ruangan['total'],
        ],
        'status' => [
            'mobil'   => $mobil,
            'motor'   => $motor,
            'ruangan' => $ruangan,
        ],
        'recentLoans' => $recentLoans,
    ]);
} catch (PDOException $e) {
    api_server_error($e, 'dashboard');
}
