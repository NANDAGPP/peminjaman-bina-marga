-- ============================================================
-- Database: binamarga (PostgreSQL Version)
-- DPU Bina Marga Jawa Timur System Database
-- Migrated from MySQL to PostgreSQL
-- ============================================================
-- Skrip instalasi baru. Seluruh tabel dihapus lalu dibuat ulang,
-- jadi JANGAN dijalankan pada database yang sudah berisi data.

-- Drop tables if exist (in correct order due to dependencies)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS pengaduan CASCADE;
DROP TABLE IF EXISTS peminjaman CASCADE;
DROP TABLE IF EXISTS kendaraan CASCADE;
DROP TABLE IF EXISTS ruangan CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

-- --------------------------------------------------------
-- Table structure for table "admin"
-- --------------------------------------------------------
CREATE TABLE admin (
    id_admin SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    nip VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    foto VARCHAR(255) DEFAULT 'default.png',
    role VARCHAR(50) NOT NULL DEFAULT 'admin'
);

-- Seed default admin (Username: admin, Password: admin123)
INSERT INTO admin (id_admin, username, nip, password, foto, role) VALUES
(1, 'admin', '198001012005011001', '$2y$10$8/up4aKvlNzgoGG1T08c8ehbv1FAZ9ZFaiV0QSfWSCF0kcajYoy6i', 'default.png', 'super_admin')
ON CONFLICT (id_admin) DO NOTHING;

SELECT setval('admin_id_admin_seq', (SELECT COALESCE(MAX(id_admin), 0) FROM admin));

-- --------------------------------------------------------
-- Table structure for table "user"
-- --------------------------------------------------------
CREATE TABLE "user" (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    nip VARCHAR(50) NOT NULL UNIQUE,
    no_hp VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    foto VARCHAR(255) DEFAULT 'default.png'
);

-- Seed default user (Username: pegawai, Password: user1234)
INSERT INTO "user" (id_user, username, nip, no_hp, password, foto) VALUES
(1, 'pegawai', '199002022015021002', '081234567890', '$2y$10$ZJMSjy7/04djIfNEEtqCfuBmI7KAZ/BKP0kJATH7axQWoqQgYgSIm', 'default.png')
ON CONFLICT (id_user) DO NOTHING;

SELECT setval('user_id_user_seq', (SELECT COALESCE(MAX(id_user), 0) FROM "user"));

-- --------------------------------------------------------
-- Table structure for table "ruangan"
-- --------------------------------------------------------
CREATE TABLE ruangan (
    id SERIAL PRIMARY KEY,
    id_ruangan INT DEFAULT NULL,
    nama VARCHAR(100) NOT NULL,
    lantai VARCHAR(50) NOT NULL,
    kode VARCHAR(50) NOT NULL,
    kapasitas INT NOT NULL,
    gambar VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Dipinjam', 'Maintenance')),
    last_edit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fasilitas VARCHAR(255) DEFAULT 'AC, Proyektor, Sound System, Meja & Kursi'
);

INSERT INTO ruangan (id, nama, lantai, kode, kapasitas, gambar, status, fasilitas) VALUES
(13, 'R. RAPAT B', 'Lantai 2', 'B.2.130.115', 40, '/images/rapatb.png', 'Tersedia', 'AC, Proyektor, Sound System'),
(14, 'R. RAPAT K', 'Lantai 2', 'A.2.350.225', 15, '/images/rapatk.png', 'Dipinjam', 'Meja Konferensi, TV Display, AC'),
(15, 'R. DISKUSI', 'Lantai 3', 'B.3.131.116', 10, '/images/diskusi.png', 'Dipinjam', 'Smart Board, AC, Kursi Ergonomis'),
(16, 'R. AVI', 'Lantai 1', 'C.1.339.467', 100, '/images/avi.png', 'Tersedia', 'Panggung, Mic Wireless, Proyektor Ganda'),
(17, 'R. WEB', 'Lantai 2', 'C.2.755.911', 50, '/images/web.png', 'Tersedia', 'Koneksi LAN, Meja Komputer, AC'),
(18, 'PANDHAWA', 'Lantai 3', 'A.3.550.458', 350, '/images/pandhawa.png', 'Dipinjam', 'Auditorium Utama, Lighting, Tata Suara Profesional'),
(19, 'LAP.TENNIS', 'Outdoor Gedung Utama', 'B.1.120.111', 4, '/images/tennis.png', 'Dipinjam', 'Net Lapangan, Penerangan Malam'),
(20, 'LAB', 'Lantai 1', 'A.1.250.222', 10, '/images/lab.png', 'Tersedia', 'Komputer Desain, Server Lokal, AC'),
(21, 'AULA', 'Lantai 3', 'C.3.321.756', 300, '/images/aula.png', 'Maintenance', 'Aula Serbaguna, Proyektor, Panggung Utama')
ON CONFLICT (id) DO NOTHING;

SELECT setval('ruangan_id_seq', (SELECT COALESCE(MAX(id), 0) FROM ruangan));

-- --------------------------------------------------------
-- Table structure for table "kendaraan"
-- --------------------------------------------------------
CREATE TABLE kendaraan (
    id_kendaraan SERIAL PRIMARY KEY,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('Mobil', 'Motor')),
    nama VARCHAR(100) NOT NULL,
    plat VARCHAR(20) NOT NULL,
    tipe VARCHAR(50) NOT NULL,
    tahun VARCHAR(10) NOT NULL,
    no_mesin VARCHAR(100) NOT NULL,
    no_rangka VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Dipinjam', 'Maintenance')),
    gambar VARCHAR(255) NOT NULL,
    kapasitas VARCHAR(50) DEFAULT '5 Orang',
    bahan_bakar VARCHAR(50) DEFAULT 'Bensin / Pertamax'
);

INSERT INTO kendaraan (id_kendaraan, kategori, nama, plat, tipe, tahun, no_mesin, no_rangka, status, gambar, kapasitas, bahan_bakar) VALUES
(23, 'Mobil', 'PORSCHE', 'L 333 NT0', 'Sport Car', '2024', 'MESIN-BM', 'RANGKA-BM', 'Tersedia', '/images/porsche.png', '2 Orang', 'Pertamax Turbo'),
(24, 'Mobil', 'CAMRY', 'L 333 NYE', 'Sedan Eksekutif', '2023', 'MESIN-BM', 'RANGKA-BM', 'Maintenance', '/images/camry.png', '2 Orang', 'Pertamax'),
(25, 'Mobil', 'ZENIX', 'L 333 SBI', 'MPV Hybrid', '2024', 'MESIN-BM', 'RANGKA-BM', 'Dipinjam', '/images/zenix.png', '2 Orang', 'Hybrid / Bensin'),
(26, 'Mobil', 'REBORN', 'L 000 GJY', 'MPV Diesel', '2022', 'MESIN-BM', 'RANGKA-BM', 'Dipinjam', '/images/reborn.png', '2 Orang', 'Dexlite / Solar'),
(27, 'Mobil', 'G CLASS', 'L 123 YRH', 'SUV 4x4', '2024', 'MESIN-BM', 'RANGKA-BM', 'Tersedia', '/images/gclass.png', '2 Orang', 'Pertamax Turbo'),
(28, 'Mobil', 'AUDI', 'L 444 RYY', 'Sport Coupe', '2023', 'MESIN-BM', 'RANGKA-BM', 'Maintenance', '/images/audi.png', '2 Orang', 'Pertamax Turbo'),
(29, 'Mobil', 'DENZA D9', 'L 188 BUD', 'Luxury EV MPV', '2024', 'MESIN-BM', 'RANGKA-BM', 'Tersedia', '/images/denza.png', '2 Orang', 'Electric (EV)'),
(30, 'Mobil', 'IONIC 5', 'L 111 NTH', 'Crossover EV', '2024', 'MESIN-BM', 'RANGKA-BM', 'Tersedia', '/images/ionic.png', '2 Orang', 'Electric (EV)'),
(31, 'Mobil', 'S CLASS', 'L 333 KNG', 'Sedan Eksekutif VIP', '2023', 'MESIN-BM', 'RANGKA-BM', 'Dipinjam', '/images/sclass.png', '2 Orang', 'Pertamax Turbo'),
(32, 'Motor', 'SUPRA 125', 'L 276 TYN', 'Motor Bebek', '2021', 'MESIN-MOT', 'RANGKA-MOT', 'Dipinjam', '/images/supra.png', '2 Orang', 'Pertalite / Bensin'),
(33, 'Motor', 'VARIO 120', 'L 736 NDU', 'Matic 125cc', '2023', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/vario.png', '2 Orang', 'Pertamax'),
(34, 'Motor', 'NMAX', 'Motor', 'Maxi Scooter 155cc', '2023', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/nmax.png', '2 Orang', 'Pertamax'),
(35, 'Motor', 'PCX 160', 'L 837 NHD', 'Maxi Scooter 160cc', '2023', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/pcx.png', '2 Orang', 'Pertamax'),
(36, 'Motor', 'BEAT EsP', 'L 837 KSD', 'Matic 110cc', '2023', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/beat.png', '2 Orang', 'Pertalite / Bensin'),
(37, 'Motor', 'SCOOPY', 'L 326 KSJ', 'Retro Matic 110cc', '2022', 'MESIN-MOT', 'RANGKA-MOT', 'Maintenance', '/images/scoopy.png', '2 Orang', 'Pertamax'),
(38, 'Motor', 'VERZA', 'L 539 YDB', 'Sport Tourer 150cc', '2022', 'MESIN-MOT', 'RANGKA-MOT', 'Dipinjam', '/images/verza.png', '2 Orang', 'Pertamax'),
(39, 'Motor', 'CB 150 R', 'L 736 NXU', 'Naked Sport 150cc', '2023', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/cb150r.png', '2 Orang', 'Pertamax'),
(40, 'Motor', 'VIXION', 'L 983 NMJ', 'Sport 150cc', '2022', 'MESIN-MOT', 'RANGKA-MOT', 'Tersedia', '/images/vixion.png', '2 Orang', 'Pertamax')
ON CONFLICT (id_kendaraan) DO NOTHING;

SELECT setval('kendaraan_id_kendaraan_seq', (SELECT COALESCE(MAX(id_kendaraan), 0) FROM kendaraan));

-- --------------------------------------------------------
-- Table structure for table "peminjaman"
-- --------------------------------------------------------
CREATE TABLE peminjaman (
    id_peminjaman SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    jenis_aset VARCHAR(20) NOT NULL CHECK (jenis_aset IN ('Mobil', 'Motor', 'Ruangan')),
    id_aset INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    plat VARCHAR(50) DEFAULT '',
    tipe VARCHAR(50) DEFAULT '',
    kode VARCHAR(50) DEFAULT '',
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jam_mulai VARCHAR(20) NOT NULL,
    status_pengajuan VARCHAR(50) DEFAULT 'Diproses' CHECK (status_pengajuan IN ('Diproses', 'Disetujui', 'Ditolak', 'Dikembalikan', 'Dibatalkan')),
    alasan_penolakan TEXT DEFAULT NULL
);

-- Index for faster lookups on active bookings
CREATE INDEX idx_peminjaman_aset ON peminjaman (jenis_aset, id_aset, status_pengajuan);
CREATE INDEX idx_peminjaman_user ON peminjaman (id_user);

-- --------------------------------------------------------
-- Table structure for table "pengaduan"
-- --------------------------------------------------------
CREATE TABLE pengaduan (
    id_pengaduan SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    nip VARCHAR(50) NOT NULL,
    keluhan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Belum',
    tanggal DATE NOT NULL
);

-- --------------------------------------------------------
-- Table for login attempt rate limiting
-- --------------------------------------------------------
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_ip ON login_attempts (ip_address, attempted_at);

-- --------------------------------------------------------
-- Table for PHP sessions (dipakai saat berjalan di Vercel)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    data TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions (last_activity);
