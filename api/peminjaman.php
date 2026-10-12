<?php
/**
 * Endpoint peminjaman: katalog aset, daftar pengajuan, pengajuan baru,
 * persetujuan admin, dan pembatalan oleh pegawai.
 */

require_once __DIR__ . '/bootstrap.php';

const JENIS_ASET = ['Mobil', 'Motor', 'Ruangan'];
const STATUS_ADMIN = ['Disetujui', 'Ditolak', 'Dikembalikan'];

$action = $_GET['action'] ?? 'list';

if ($action === 'assets') {
    list_assets($pdo);
}

api_require_login();

if ($action === 'list') {
    list_peminjaman($pdo);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_error('Metode request tidak diizinkan.', 405);
}

api_require_csrf();
$input = api_input();

switch ($action) {
    case 'create':
        create_peminjaman($pdo, $input);
        break;

    case 'update_status':
        update_status($pdo, $input);
        break;

    case 'cancel':
        cancel_peminjaman($pdo, $input);
        break;

    case 'return':
        return_peminjaman($pdo, $input);
        break;

    case 'delete':
        delete_peminjaman($pdo, $input);
        break;

    case 'create_asset':
        api_require_admin();
        create_asset($pdo, $input);
        break;

    case 'update_asset':
        api_require_admin();
        update_asset($pdo, $input);
        break;

    case 'delete_asset':
        api_require_admin();
        delete_asset($pdo, $input);
        break;

    default:
        api_error('Action tidak dikenali.', 404);
}

/**
 * Katalog aset bersifat publik supaya halaman peminjaman tetap bisa
 * ditampilkan sebelum pegawai login.
 */
function list_assets($pdo)
{
    $kategori = strtolower($_GET['kategori'] ?? 'all');

    $kolomKendaraan = "id_kendaraan, kategori, nama, plat, tipe, tahun,
        COALESCE(kapasitas, '2-5 Orang') AS kapasitas,
        COALESCE(bahan_bakar, 'Bensin / Pertamax') AS bahan_bakar,
        status, gambar";

    $kolomRuangan = "id, COALESCE(id_ruangan, id) AS id_ruangan, nama,
        COALESCE(kode, 'R-01') AS kode,
        COALESCE(lantai, 'Lantai 1') AS lantai,
        kapasitas,
        COALESCE(fasilitas, 'AC, Proyektor, Meja, Kursi') AS fasilitas,
        status, gambar";

    try {
        $kendaraan = [];
        $ruangan   = [];

        if ($kategori === 'all') {
            $kendaraan = $pdo->query("SELECT {$kolomKendaraan} FROM kendaraan ORDER BY id_kendaraan")->fetchAll();
        } elseif ($kategori === 'mobil' || $kategori === 'motor') {
            $stmt = $pdo->prepare("SELECT {$kolomKendaraan} FROM kendaraan WHERE LOWER(kategori) = :kat ORDER BY id_kendaraan");
            $stmt->execute([':kat' => $kategori]);
            $kendaraan = $stmt->fetchAll();
        }

        if (in_array($kategori, ['all', 'ruang', 'ruangan'], true)) {
            $ruangan = $pdo->query("SELECT {$kolomRuangan} FROM ruangan ORDER BY id")->fetchAll();
        }

        api_success([
            'kendaraan' => array_map('normalize_gambar', $kendaraan),
            'ruangan'   => array_map('normalize_gambar', $ruangan),
        ]);
    } catch (PDOException $e) {
        api_server_error($e, 'peminjaman.assets');
    }
}

function normalize_gambar(array $row)
{
    if (!empty($row['gambar']) && strpos($row['gambar'], '/') !== 0) {
        $row['gambar'] = '/' . ltrim($row['gambar'], '/');
    }

    return $row;
}

function list_peminjaman($pdo)
{
    $baseQuery = "
        SELECT p.*,
               COALESCE(k.gambar, r.gambar, k2.gambar, r2.gambar) AS gambar,
               COALESCE(k.tahun, k2.tahun) AS tahun,
               COALESCE(r.kapasitas, r2.kapasitas) AS kapasitas
        FROM peminjaman p
        LEFT JOIN kendaraan k ON (p.jenis_aset IN ('Mobil', 'Motor') AND p.id_aset = k.id_kendaraan)
        LEFT JOIN ruangan r ON (p.jenis_aset = 'Ruangan' AND p.id_aset = r.id)
        LEFT JOIN kendaraan k2 ON (p.jenis_aset IN ('Mobil', 'Motor') AND LOWER(TRIM(p.nama)) = LOWER(TRIM(k2.nama)))
        LEFT JOIN ruangan r2 ON (p.jenis_aset = 'Ruangan' AND LOWER(TRIM(p.nama)) = LOWER(TRIM(r2.nama)))
    ";

    try {
        $orderBy = "
            ORDER BY 
                CASE 
                    WHEN p.status_pengajuan = 'Diproses' THEN 0 
                    WHEN p.status_pengajuan = 'Disetujui' THEN 1 
                    ELSE 2 
                END ASC,
                p.tanggal_mulai ASC,
                p.jam_mulai ASC,
                p.id_peminjaman DESC
        ";

        if (api_is_admin()) {
            $stmt = $pdo->query($baseQuery . ' ' . $orderBy);
        } else {
            $stmt = $pdo->prepare($baseQuery . ' WHERE p.id_user = :uid ' . $orderBy);
            $stmt->execute([':uid' => api_user_id()]);
        }

        $rows = array_map('normalize_gambar', $stmt->fetchAll(PDO::FETCH_ASSOC));
        api_success(['loans' => $rows]);
    } catch (PDOException $e) {
        api_server_error($e, 'peminjaman.list');
    }
}

/**
 * Aturan pengajuan mengikuti proses_peminjaman.php: tanggal harus valid,
 * tidak di masa lalu, aset tidak sedang maintenance, dan jadwalnya belum
 * dipakai pengajuan lain.
 */
function create_peminjaman($pdo, array $input)
{
    if (api_user_id() === null) {
        api_error('Pengajuan peminjaman hanya dapat dilakukan oleh akun pegawai.', 403);
    }

    $jenisAset   = trim($input['jenis_aset'] ?? '');
    $idAset      = (int)($input['id_aset'] ?? 0);
    $namaAset    = trim($input['nama'] ?? ($input['name'] ?? ''));
    $tglMulai    = trim($input['tanggal_mulai'] ?? '');
    $tglSelesai  = trim($input['tanggal_selesai'] ?? '');
    $jamMulai    = trim($input['jam_mulai'] ?? '');

    if ($tglSelesai === '') {
        $tglSelesai = $tglMulai;
    }

    if ($jamMulai === '') {
        api_error('Silakan pilih waktu peminjaman terlebih dahulu.');
    }

    if (!in_array($jenisAset, JENIS_ASET, true) || $idAset <= 0) {
        api_error('Jenis aset atau ID aset tidak valid.');
    }

    if (!is_valid_date($tglMulai) || !is_valid_date($tglSelesai)) {
        api_error('Format tanggal peminjaman tidak valid.');
    }

    if ($tglMulai > $tglSelesai) {
        api_error('Tanggal mulai tidak boleh lebih lambat dari tanggal selesai.');
    }

    if ($tglSelesai < date('Y-m-d')) {
        api_error('Tanggal peminjaman tidak boleh di masa lalu.');
    }

    if (mb_strlen($jamMulai) > 20) {
        api_error('Format jam mulai tidak valid.');
    }

    try {
        $pdo->beginTransaction();

        $aset = find_asset($pdo, $jenisAset, $idAset, $namaAset);

        if (!$aset) {
            $asetNama = $namaAset !== '' ? $namaAset : "Aset {$jenisAset} #{$idAset}";
            $aset = [
                'nama'   => $asetNama,
                'plat'   => trim($input['plat'] ?? ($input['code'] ?? '-')),
                'tipe'   => trim($input['tipe'] ?? 'Operasional'),
                'kode'   => trim($input['kode'] ?? '-'),
                'status' => 'Tersedia',
            ];
        }

        if (isset($aset['status']) && strtolower($aset['status']) === 'maintenance') {
            $pdo->rollBack();
            api_error('Aset sedang dalam perbaikan (Maintenance) dan belum dapat dipinjam.', 409);
        }

        // Pengecekan bentrok berada di dalam transaksi supaya dua pengajuan
        // yang masuk bersamaan tidak sama-sama lolos.
        $bentrok = $pdo->prepare(
            "SELECT COUNT(*) FROM peminjaman
             WHERE jenis_aset = :jenis
               AND id_aset = :id_aset
               AND status_pengajuan IN ('Diproses', 'Disetujui')
               AND tanggal_mulai <= :tgl_selesai
               AND tanggal_selesai >= :tgl_mulai"
        );
        $bentrok->execute([
            ':jenis'       => $jenisAset,
            ':id_aset'     => $idAset,
            ':tgl_selesai' => $tglSelesai,
            ':tgl_mulai'   => $tglMulai,
        ]);

        if ((int)$bentrok->fetchColumn() > 0) {
            $pdo->rollBack();
            api_error('Aset ini sudah memiliki jadwal peminjaman pada rentang tanggal tersebut.', 409);
        }

        // Identitas dan detail aset diambil dari database, atau request jika fallback.
        $insert = $pdo->prepare(
            "INSERT INTO peminjaman (
                id_user, username, jenis_aset, id_aset,
                nama, plat, tipe, kode,
                tanggal_mulai, tanggal_selesai, jam_mulai, status_pengajuan
             ) VALUES (
                :uid, :username, :jenis, :id_aset,
                :nama, :plat, :tipe, :kode,
                :tgl_mulai, :tgl_selesai, :jam_mulai, 'Diproses'
             )"
        );
        $insert->execute([
            ':uid'         => api_user_id(),
            ':username'    => $_SESSION['username_user'] ?? '',
            ':jenis'       => $jenisAset,
            ':id_aset'     => $idAset,
            ':nama'        => $aset['nama'],
            ':plat'        => $aset['plat'] ?? '',
            ':tipe'        => $aset['tipe'] ?? '',
            ':kode'        => $aset['kode'] ?? '',
            ':tgl_mulai'   => $tglMulai,
            ':tgl_selesai' => $tglSelesai,
            ':jam_mulai'   => $jamMulai,
        ]);

        $id = api_last_insert_id($pdo, 'peminjaman_id_peminjaman_seq');
        $pdo->commit();

        api_success(
            ['id_peminjaman' => $id],
            'Permohonan peminjaman berhasil dikirim. Menunggu persetujuan admin.'
        );
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        api_server_error($e, 'peminjaman.create');
    }
}

function update_status($pdo, array $input)
{
    api_require_admin();

    $id     = (int)($input['id_peminjaman'] ?? 0);
    $status = trim($input['status'] ?? '');
    $alasan = trim($input['alasan'] ?? '');

    if ($id <= 0) {
        api_error('ID peminjaman tidak valid.');
    }

    if (!in_array($status, STATUS_ADMIN, true)) {
        api_error('Status peminjaman tidak dikenali.');
    }

    if ($status === 'Ditolak' && $alasan === '') {
        api_error('Alasan penolakan wajib diisi.');
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT jenis_aset, id_aset, status_pengajuan FROM peminjaman WHERE id_peminjaman = :id'
        );
        $stmt->execute([':id' => $id]);
        $loan = $stmt->fetch();

        if (!$loan) {
            $pdo->rollBack();
            api_error('Data peminjaman tidak ditemukan.', 404);
        }

        if ($status === 'Dikembalikan' && $loan['status_pengajuan'] !== 'Disetujui') {
            $pdo->rollBack();
            api_error('Hanya peminjaman berstatus Disetujui yang dapat dikembalikan.', 409);
        }

        $update = $pdo->prepare(
            'UPDATE peminjaman SET status_pengajuan = :status, alasan_penolakan = :alasan
             WHERE id_peminjaman = :id'
        );
        $update->execute([
            ':status' => $status,
            ':alasan' => $status === 'Ditolak' ? $alasan : null,
            ':id'     => $id,
        ]);

        if ($status === 'Disetujui') {
            set_asset_status($pdo, $loan['jenis_aset'], $loan['id_aset'], 'Dipinjam');
        } elseif ($loan['status_pengajuan'] === 'Disetujui') {
            set_asset_status($pdo, $loan['jenis_aset'], $loan['id_aset'], 'Tersedia');
        }

        $pdo->commit();
        api_success([], 'Status peminjaman berhasil diperbarui menjadi ' . $status . '.');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        api_server_error($e, 'peminjaman.update_status');
    }
}

function cancel_peminjaman($pdo, array $input)
{
    if (api_user_id() === null) {
        api_error('Pembatalan dilakukan lewat menu persetujuan peminjaman.', 403);
    }

    $id = (int)($input['id_peminjaman'] ?? 0);

    if ($id <= 0) {
        api_error('ID peminjaman tidak valid.');
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT jenis_aset, id_aset, status_pengajuan FROM peminjaman
             WHERE id_peminjaman = :id AND id_user = :uid'
        );
        $stmt->execute([':id' => $id, ':uid' => api_user_id()]);
        $loan = $stmt->fetch();

        if (!$loan) {
            $pdo->rollBack();
            api_error('Data peminjaman tidak ditemukan.', 404);
        }

        if (in_array($loan['status_pengajuan'], ['Dibatalkan', 'Dikembalikan', 'Ditolak'], true)) {
            $pdo->rollBack();
            api_error('Peminjaman ini sudah tidak dapat dibatalkan.', 409);
        }

        $update = $pdo->prepare(
            "UPDATE peminjaman SET status_pengajuan = 'Dibatalkan'
             WHERE id_peminjaman = :id AND id_user = :uid"
        );
        $update->execute([':id' => $id, ':uid' => api_user_id()]);

        if ($loan['status_pengajuan'] === 'Disetujui') {
            set_asset_status($pdo, $loan['jenis_aset'], $loan['id_aset'], 'Tersedia');
        }

        $pdo->commit();
        api_success([], 'Pengajuan peminjaman berhasil dibatalkan.');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        api_server_error($e, 'peminjaman.cancel');
    }
}

/**
 * Pegawai mengembalikan aset miliknya, mengikuti pengembalian.php.
 */
function return_peminjaman($pdo, array $input)
{
    if (api_user_id() === null) {
        api_error('Pengembalian oleh admin dilakukan lewat menu persetujuan peminjaman.', 403);
    }

    $id = (int)($input['id_peminjaman'] ?? 0);

    if ($id <= 0) {
        api_error('ID peminjaman tidak valid.');
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT jenis_aset, id_aset, status_pengajuan FROM peminjaman
             WHERE id_peminjaman = :id AND id_user = :uid'
        );
        $stmt->execute([':id' => $id, ':uid' => api_user_id()]);
        $loan = $stmt->fetch();

        if (!$loan) {
            $pdo->rollBack();
            api_error('Data peminjaman tidak ditemukan.', 404);
        }

        if ($loan['status_pengajuan'] !== 'Disetujui') {
            $pdo->rollBack();
            api_error('Hanya peminjaman yang disetujui yang dapat dikembalikan.', 409);
        }

        $pdo->prepare(
            "UPDATE peminjaman SET status_pengajuan = 'Dikembalikan'
             WHERE id_peminjaman = :id AND id_user = :uid"
        )->execute([':id' => $id, ':uid' => api_user_id()]);

        set_asset_status($pdo, $loan['jenis_aset'], $loan['id_aset'], 'Tersedia');

        $pdo->commit();
        api_success([], 'Aset berhasil dikembalikan. Terima kasih.');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        api_server_error($e, 'peminjaman.return');
    }
}

/**
 * Hapus catatan peminjaman. Bila peminjaman masih berstatus Disetujui,
 * aset dikembalikan ke Tersedia supaya tidak tertinggal berstatus Dipinjam.
 */
function delete_peminjaman($pdo, array $input)
{
    api_require_admin();

    $id = (int)($input['id_peminjaman'] ?? 0);

    if ($id <= 0) {
        api_error('ID peminjaman tidak valid.');
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT jenis_aset, id_aset, status_pengajuan FROM peminjaman WHERE id_peminjaman = :id'
        );
        $stmt->execute([':id' => $id]);
        $loan = $stmt->fetch();

        if (!$loan) {
            $pdo->rollBack();
            api_error('Data peminjaman tidak ditemukan.', 404);
        }

        $pdo->prepare('DELETE FROM peminjaman WHERE id_peminjaman = :id')->execute([':id' => $id]);

        if ($loan['status_pengajuan'] === 'Disetujui') {
            set_asset_status($pdo, $loan['jenis_aset'], $loan['id_aset'], 'Tersedia');
        }

        $pdo->commit();
        api_success([], 'Data peminjaman berhasil dihapus.');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        api_server_error($e, 'peminjaman.delete');
    }
}

function find_asset($pdo, $jenisAset, $idAset, $namaAset = '')
{
    if ($jenisAset === 'Ruangan') {
        $stmt = $pdo->prepare('SELECT id, nama, kode, status FROM ruangan WHERE id = :id OR id_ruangan = :id_alt');
        $stmt->execute([':id' => $idAset, ':id_alt' => $idAset]);
        $row = $stmt->fetch();
        if (!$row && $namaAset !== '') {
            $stmt2 = $pdo->prepare('SELECT id, nama, kode, status FROM ruangan WHERE LOWER(TRIM(nama)) = LOWER(TRIM(:nama)) LIMIT 1');
            $stmt2->execute([':nama' => $namaAset]);
            $row = $stmt2->fetch();
        }
    } else {
        $stmt = $pdo->prepare('SELECT id_kendaraan, nama, plat, tipe, status FROM kendaraan WHERE id_kendaraan = :id');
        $stmt->execute([':id' => $idAset]);
        $row = $stmt->fetch();
        if (!$row && $namaAset !== '') {
            $stmt2 = $pdo->prepare('SELECT id_kendaraan, nama, plat, tipe, status FROM kendaraan WHERE LOWER(TRIM(nama)) = LOWER(TRIM(:nama)) LIMIT 1');
            $stmt2->execute([':nama' => $namaAset]);
            $row = $stmt2->fetch();
        }
    }

    return $row;
}

function set_asset_status($pdo, $jenisAset, $idAset, $status)
{
    if ($jenisAset === 'Ruangan') {
        $stmt = $pdo->prepare('UPDATE ruangan SET status = :status WHERE id = :id OR id_ruangan = :id_alt');
        $stmt->execute([':status' => $status, ':id' => $idAset, ':id_alt' => $idAset]);
        return;
    }

    $stmt = $pdo->prepare('UPDATE kendaraan SET status = :status WHERE id_kendaraan = :id');
    $stmt->execute([':status' => $status, ':id' => $idAset]);
}

function is_valid_date($value)
{
    $date = DateTime::createFromFormat('Y-m-d', $value);

    return $date && $date->format('Y-m-d') === $value;
}

function create_asset($pdo, array $input) {
    $category  = strtolower(trim($input['category'] ?? 'mobil'));
    $nama      = trim($input['name'] ?? ($input['nama'] ?? ''));
    $code      = trim($input['code'] ?? ($input['kodePlat'] ?? ''));
    $tipe      = trim($input['tipe'] ?? 'Kendaraan Dinas');
    $tahun     = trim($input['tahun'] ?? '2024');
    $lantai    = trim($input['lantai'] ?? 'Lantai 1');
    $kapasitas = trim($input['capacity'] ?? ($input['kapasitas'] ?? '5 Orang'));
    $status    = ucfirst(strtolower(trim($input['status'] ?? 'Tersedia')));
    if (!in_array($status, ['Tersedia', 'Dipinjam', 'Maintenance'])) $status = 'Tersedia';
    $gambar    = trim($input['image'] ?? ($input['gambar'] ?? ''));

    if ($nama === '' || $code === '') {
        api_error('Nama aset dan Kode/Plat wajib diisi.');
    }

    try {
        if ($category === 'ruang') {
            if (!$gambar) $gambar = '/images/aula.png';
            $kapNum = (int)filter_var($kapasitas, FILTER_SANITIZE_NUMBER_INT) ?: 20;
            $stmt = $pdo->prepare(
                'INSERT INTO ruangan (nama, lantai, kode, kapasitas, status, gambar)
                 VALUES (:nama, :lantai, :kode, :kap, :status, :gambar)'
            );
            $stmt->execute([
                ':nama'   => $nama,
                ':lantai' => $lantai,
                ':kode'   => $code,
                ':kap'    => $kapNum,
                ':status' => $status,
                ':gambar' => $gambar,
            ]);
            $id = api_last_insert_id($pdo, 'ruangan_id_seq');
            api_success(['id' => "r-{$id}"], 'Ruangan berhasil ditambahkan.');
        } else {
            $catName = $category === 'motor' ? 'Motor' : 'Mobil';
            if (!$gambar) $gambar = $category === 'motor' ? '/images/nmax.png' : '/images/porsche.png';
            $stmt = $pdo->prepare(
                'INSERT INTO kendaraan (kategori, nama, plat, tipe, tahun, no_mesin, no_rangka, status, gambar, kapasitas)
                 VALUES (:cat, :nama, :plat, :tipe, :tahun, :mesin, :rangka, :status, :gambar, :kap)'
            );
            $stmt->execute([
                ':cat'    => $catName,
                ':nama'   => $nama,
                ':plat'   => $code,
                ':tipe'   => $tipe,
                ':tahun'  => $tahun,
                ':mesin'  => 'MESIN-' . strtoupper(substr(md5($code), 0, 6)),
                ':rangka' => 'RANGKA-' . strtoupper(substr(md5($code), 0, 6)),
                ':status' => $status,
                ':gambar' => $gambar,
                ':kap'    => $kapasitas,
            ]);
            $id = api_last_insert_id($pdo, 'kendaraan_id_kendaraan_seq');
            api_success(['id' => "k-{$id}"], "{$catName} berhasil ditambahkan.");
        }
    } catch (PDOException $e) {
        api_server_error($e, 'asset.create');
    }
}

function update_asset($pdo, array $input) {
    $rawId    = trim((string)($input['id'] ?? ''));
    $category = strtolower(trim($input['category'] ?? 'mobil'));
    $nama     = trim($input['name'] ?? ($input['nama'] ?? ''));
    $code     = trim($input['code'] ?? ($input['kodePlat'] ?? ''));
    $tipe     = trim($input['tipe'] ?? '');
    $tahun    = trim($input['tahun'] ?? '');
    $lantai   = trim($input['lantai'] ?? '');
    $kapasitas = trim($input['capacity'] ?? ($input['kapasitas'] ?? ''));
    $status   = ucfirst(strtolower(trim($input['status'] ?? 'Tersedia')));
    if (!in_array($status, ['Tersedia', 'Dipinjam', 'Maintenance'])) $status = 'Tersedia';
    $gambar   = trim($input['image'] ?? ($input['gambar'] ?? ''));

    $idNum = (int)preg_replace('/\D/', '', $rawId);
    if ($idNum <= 0) {
        api_error('ID Aset tidak valid.');
    }

    try {
        if ($category === 'ruang' || str_starts_with($rawId, 'r-')) {
            $kapNum = (int)filter_var($kapasitas, FILTER_SANITIZE_NUMBER_INT) ?: 0;
            $sql = 'UPDATE ruangan SET nama = :nama, kode = :kode, status = :status';
            $params = [
                ':nama'   => $nama,
                ':kode'   => $code,
                ':status' => $status,
                ':id'     => $idNum,
            ];
            if ($lantai !== '') {
                $sql .= ', lantai = :lantai';
                $params[':lantai'] = $lantai;
            }
            if ($kapNum > 0) {
                $sql .= ', kapasitas = :kap';
                $params[':kap'] = $kapNum;
            }
            if ($gambar !== '') {
                $sql .= ', gambar = :gambar';
                $params[':gambar'] = $gambar;
            }
            $sql .= ' WHERE id = :id OR id_ruangan = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            api_success([], 'Data ruangan berhasil diperbarui.');
        } else {
            $sql = 'UPDATE kendaraan SET nama = :nama, plat = :plat, status = :status';
            $params = [
                ':nama'   => $nama,
                ':plat'   => $code,
                ':status' => $status,
                ':id'     => $idNum,
            ];
            if ($tipe !== '') {
                $sql .= ', tipe = :tipe';
                $params[':tipe'] = $tipe;
            }
            if ($tahun !== '') {
                $sql .= ', tahun = :tahun';
                $params[':tahun'] = $tahun;
            }
            if ($gambar !== '') {
                $sql .= ', gambar = :gambar';
                $params[':gambar'] = $gambar;
            }
            if ($kapasitas !== '') {
                $sql .= ', kapasitas = :kap';
                $params[':kap'] = $kapasitas;
            }
            $sql .= ' WHERE id_kendaraan = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            api_success([], 'Data kendaraan berhasil diperbarui.');
        }
    } catch (PDOException $e) {
        api_server_error($e, 'asset.update');
    }
}

function delete_asset($pdo, array $input) {
    $rawId = trim((string)($input['id'] ?? ''));
    $idNum = (int)preg_replace('/\D/', '', $rawId);

    if ($idNum <= 0) {
        api_error('ID Aset tidak valid.');
    }

    try {
        if (str_starts_with($rawId, 'r-')) {
            $stmt = $pdo->prepare('DELETE FROM ruangan WHERE id = :id OR id_ruangan = :id');
            $stmt->execute([':id' => $idNum]);
        } else {
            $stmt = $pdo->prepare('DELETE FROM kendaraan WHERE id_kendaraan = :id');
            $stmt->execute([':id' => $idNum]);
        }
        api_success([], 'Aset berhasil dihapus.');
    } catch (PDOException $e) {
        api_server_error($e, 'asset.delete');
    }
}
