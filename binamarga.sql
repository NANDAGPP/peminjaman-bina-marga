-- Database: binamarga
-- DPU Bina Marga Jawa Timur System Database

CREATE DATABASE IF NOT EXISTS `binamarga` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `binamarga`;

-- --------------------------------------------------------
-- Table structure for table `admin`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `nip` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) DEFAULT 'default.png',
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default admin (Password: admin123 -> md5: 0192023a7bbd73250516f069df18b500)
INSERT INTO `admin` (`id_admin`, `username`, `nip`, `password`, `foto`, `role`) VALUES
(1, 'admin', '198001012005011001', '0192023a7bbd73250516f069df18b500', 'default.png', 'super_admin')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `role`=VALUES(`role`);

-- --------------------------------------------------------
-- Table structure for table `user`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `nip` VARCHAR(50) NOT NULL UNIQUE,
  `no_hp` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) DEFAULT 'default.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default user (Password: user123 -> md5: 6ad14ba9986e3615423dfca256d04e3f)
INSERT INTO `user` (`id_user`, `username`, `nip`, `no_hp`, `password`, `foto`) VALUES
(1, 'pegawai', '199002022015021002', '081234567890', '6ad14ba9986e3615423dfca256d04e3f', 'default.png')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

-- --------------------------------------------------------
-- Table structure for table `ruangan`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ruangan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ruangan` INT DEFAULT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `lantai` VARCHAR(50) NOT NULL,
  `kode` VARCHAR(50) NOT NULL,
  `kapasitas` INT NOT NULL,
  `gambar` VARCHAR(255) NOT NULL,
  `status` ENUM('Tersedia', 'Dipinjam', 'Maintenance') DEFAULT 'Tersedia',
  `last_edit` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample data for ruangan
INSERT INTO `ruangan` (`id`, `id_ruangan`, `nama`, `lantai`, `kode`, `kapasitas`, `gambar`, `status`) VALUES
(1, 1, 'Ruang Rapat Utama', 'Lantai 2', 'R-201', 30, 'images/ruangrapat.png', 'Tersedia'),
(2, 2, 'Ruang Seminar Bina Marga', 'Lantai 3', 'R-301', 50, 'images/ruangrapat.png', 'Tersedia'),
(3, 3, 'Ruang Pertemuan Khusus', 'Lantai 1', 'R-102', 15, 'images/ruangrapat.png', 'Tersedia')
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);

-- --------------------------------------------------------
-- Table structure for table `kendaraan`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kendaraan` (
  `id_kendaraan` INT AUTO_INCREMENT PRIMARY KEY,
  `kategori` ENUM('Mobil', 'Motor') NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `plat` VARCHAR(20) NOT NULL,
  `tipe` VARCHAR(50) NOT NULL,
  `tahun` VARCHAR(10) NOT NULL,
  `no_mesin` VARCHAR(100) NOT NULL,
  `no_rangka` VARCHAR(100) NOT NULL,
  `status` ENUM('Tersedia', 'Dipinjam', 'Maintenance') DEFAULT 'Tersedia',
  `gambar` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample data for kendaraan
INSERT INTO `kendaraan` (`id_kendaraan`, `kategori`, `nama`, `plat`, `tipe`, `tahun`, `no_mesin`, `no_rangka`, `status`, `gambar`) VALUES
(1, 'Mobil', 'Toyota Innova Reborn', 'L 1234 BM', 'Minivan / MPV', '2021', '2KD1234567', 'MHF1234567890', 'Tersedia', 'images/innova.png'),
(2, 'Mobil', 'Toyota Hilux Double Cabin', 'L 5678 BM', 'Pickup 4x4', '2022', '1GD9876543', 'MR09876543210', 'Tersedia', 'images/hilux.png'),
(3, 'Motor', 'Honda Vario 160', 'L 4321 BM', 'Matic', '2023', 'KF12E1234567', 'MH1KF12345678', 'Tersedia', 'images/vario.png'),
(4, 'Motor', 'Yamaha NMAX 155', 'L 8765 BM', 'Matic', '2022', 'G3J1E7654321', 'MH3G312345678', 'Tersedia', 'images/nmax.png')
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);

-- --------------------------------------------------------
-- Table structure for table `peminjaman`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `peminjaman` (
  `id_peminjaman` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `jenis_aset` ENUM('Mobil', 'Motor', 'Ruangan') NOT NULL,
  `id_aset` INT NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `plat` VARCHAR(50) DEFAULT '',
  `tipe` VARCHAR(50) DEFAULT '',
  `kode` VARCHAR(50) DEFAULT '',
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE NOT NULL,
  `jam_mulai` VARCHAR(20) NOT NULL,
  `status_pengajuan` ENUM('Diproses', 'Disetujui', 'Ditolak', 'Dikembalikan', 'Dibatalkan') DEFAULT 'Diproses',
  `alasan_penolakan` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `pengaduan`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengaduan` (
  `id_pengaduan` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `nip` VARCHAR(50) NOT NULL,
  `keluhan` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Belum',
  `tanggal` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
