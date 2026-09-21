<?php
require_once __DIR__ . '/bootstrap.php';

// Pastikan ada sesi aktif (admin atau user yang mengajukan)
if (!api_is_admin() && api_user_id() === null) {
    http_response_code(401);
    die('Akses ditolak. Silakan login terlebih dahulu untuk mengunduh laporan.');
}

$id_pengaduan = intval($_GET['id'] ?? 0);
if ($id_pengaduan <= 0) {
    http_response_code(400);
    die('ID Pengaduan tidak valid.');
}

$stmt = $pdo->prepare("SELECT * FROM pengaduan WHERE id_pengaduan = ?");
$stmt->execute([$id_pengaduan]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    http_response_code(404);
    die('Data pengaduan tidak ditemukan.');
}

// Jika bukan admin, pastikan user hanya bisa mengunduh pengaduannya sendiri
if (!api_is_admin() && api_user_id() !== null) {
    if ((int)$data['id_user'] !== (int)api_user_id()) {
        http_response_code(403);
        die('Anda tidak memiliki hak akses untuk mengunduh laporan ini.');
    }
}

$nama     = $data['nama'];
$nip      = $data['nip'];
$keluhan  = $data['keluhan'];
$status   = $data['status'];
$tanggal  = $data['tanggal'];

error_reporting(0);
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    http_response_code(500);
    die('Dependensi sistem cetak dokumen belum tersedia. Silakan jalankan "composer install".');
}

require_once __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

$phpWord = new PhpWord();
$phpWord->setDefaultFontName('Times New Roman');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection([
    'marginTop'    => 700,
    'marginBottom' => 700,
    'marginLeft'   => 900,
    'marginRight'  => 900
]);

$kopTable = $section->addTable([
    'alignment' => Jc::CENTER,
    'borderSize' => 0,
    'borderColor' => 'FFFFFF',
    'cellMargin' => 0
]);

$kopTable->addRow();

$cellLogo = $kopTable->addCell(1400, [
    'borderSize' => 0,
    'borderColor' => 'FFFFFF',
    'valign' => 'center'
]);

$logoPath = __DIR__ . '/../images/logobina.png';
if (!file_exists($logoPath)) {
    $logoPath = __DIR__ . '/../frontend/public/images/logobina.png';
}

if (file_exists($logoPath)) {
    $cellLogo->addImage($logoPath, [
        'width' => 65,
        'height' => 78,
        'alignment' => Jc::CENTER
    ]);
}

$cellText = $kopTable->addCell(8600, [
    'borderSize' => 0,
    'borderColor' => 'FFFFFF',
    'valign' => 'center'
]);

$cellText->addText(
    'PEMERINTAH PROVINSI JAWA TIMUR',
    ['size' => 12, 'name' => 'Times New Roman'],
    ['alignment' => Jc::CENTER, 'spaceAfter' => 0]
);

$cellText->addText(
    'DINAS PEKERJAAN UMUM BINA MARGA',
    ['bold' => true, 'size' => 16, 'name' => 'Times New Roman'],
    ['alignment' => Jc::CENTER, 'spaceAfter' => 20]
);

$cellText->addText(
    'Jalan Gayung Kebonsari Nomor 167, Gayungsari, Gayungan, Surabaya, Jawa Timur 60235',
    ['size' => 9.5, 'name' => 'Times New Roman'],
    ['alignment' => Jc::CENTER, 'spaceAfter' => 0]
);

$cellText->addText(
    'Telepon (031) 8280919, Laman binamarga.jatimprov.go.id, Pos-el binamarga@jatimprov.go.id',
    ['size' => 9.5, 'name' => 'Times New Roman'],
    ['alignment' => Jc::CENTER, 'spaceAfter' => 0]
);

// Garis Pembatas Kop Surat
$section->addLine([
    'weight' => 2,
    'width'  => 520,
    'height' => 0,
    'color'  => '000000',
    'alignment' => Jc::CENTER
]);

// Judul Dokumen
$section->addText(
    'LAPORAN PENGADUAN',
    ['bold' => true, 'size' => 13, 'underline' => 'single'],
    ['alignment' => Jc::CENTER, 'spaceBefore' => 120, 'spaceAfter' => 120]
);

// Tabel Data Pegawai & Status
$infoTable = $section->addTable([
    'borderSize' => 6,
    'borderColor' => '999999',
    'cellMargin' => 80
]);

$formattedDate = $tanggal ? date('d F Y', strtotime($tanggal)) : date('d F Y');

$rows = [
    'Nama Pegawai'         => $nama,
    'NIP'                  => $nip,
    'Tanggal Pengaduan'    => $formattedDate,
    'Status Tindak Lanjut' => $status,
];

foreach ($rows as $label => $value) {
    $infoTable->addRow();
    $infoTable->addCell(2800, ['bgColor' => 'F5F5F5'])->addText(
        $label,
        ['bold' => true, 'name' => 'Times New Roman', 'size' => 10.5]
    );
    $infoTable->addCell(6700)->addText(
        $value,
        ['name' => 'Times New Roman', 'size' => 10.5]
    );
}

$section->addTextBreak(1);
$section->addText(
    'Isi Pengaduan / Keluhan:',
    ['bold' => true, 'name' => 'Times New Roman', 'size' => 11]
);

$keluhanTable = $section->addTable([
    'borderSize' => 6,
    'borderColor' => '999999',
    'cellMargin' => 120
]);
$keluhanTable->addRow();
$keluhanTable->addCell(9500)->addText(
    $keluhan ?: 'Tidak ada rincian keluhan.',
    ['name' => 'Times New Roman', 'size' => 11],
    ['alignment' => Jc::BOTH]
);

$section->addTextBreak(1);
$section->addText(
    'Surabaya, ' . date('d F Y'),
    ['name' => 'Times New Roman', 'size' => 11],
    ['alignment' => Jc::RIGHT]
);
$section->addText(
    'Admin Pengelola Dinas PU Bina Marga',
    ['name' => 'Times New Roman', 'size' => 11],
    ['alignment' => Jc::RIGHT]
);
$section->addTextBreak(3);
$section->addText(
    '(________________________)',
    ['bold' => true, 'name' => 'Times New Roman', 'size' => 11],
    ['alignment' => Jc::RIGHT]
);

$cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nama);
$fileName  = 'Laporan_Pengaduan_' . $cleanName . '.docx';
$filePath  = sys_get_temp_dir() . '/' . uniqid('pengaduan_', true) . '.docx';

$writer = IOFactory::createWriter($phpWord, 'Word2007');
$writer->save($filePath);

if (ob_get_length()) {
    ob_end_clean();
}

header("Content-Description: File Transfer");
header("Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document");
header("Content-Disposition: attachment; filename=\"$fileName\"");
header("Content-Transfer-Encoding: binary");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Pragma: public");
header("Content-Length: " . filesize($filePath));

flush();
readfile($filePath);

@unlink($filePath);
exit;
