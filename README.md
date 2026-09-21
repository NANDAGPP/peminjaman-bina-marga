# Sistem Peminjaman Aset & Pengaduan Kendala
### Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)](https://peminjaman-binamarga.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-100%25%20Passed%20(16%20suites)-4CAF50?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

Aplikasi web modern untuk tata kelola reservasi, peminjaman kendaraan dan ruangan dinas, serta pelaporan pengaduan kendala fasilitas di lingkungan **Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur**.

🌐 **Aplikasi Live**: [https://peminjaman-binamarga.vercel.app](https://peminjaman-binamarga.vercel.app)

---

## 📌 Fitur Utama

### 1. Portal Pegawai (User)
* **Katalog Aset Dinas**: Informasi spesifikasi kendaraan dinas (Mobil, Motor) dan fasilitas ruangan rapat/aula secara terstruktur.
* **Peminjaman Terjadwal (Booking Calendar)**:
  * Pemilihan jadwal peminjaman interaktif.
  * Validasi cerdas: tanggal yang telah lewat otomatis dinonaktifkan untuk mencegah kesalahan input.
* **Form Pengaduan Kendala Aset**:
  * Pengisian otomatis (*auto-fill*) identitas pelapor berdasarkan sesi akun (Nama & NIP).
  * Notifikasi modal konfirmasi pengaduan berhasil dengan fitur penutupan otomatis (*auto-close*).
* **Profil & Personalisasi Akun**:
  * Pilihan karakter avatar profil (Pria, Wanita, Default).
  * Pembaruan kontak (Nomor Telepon) dan kata sandi.
  * Riwayat peminjaman terurut kronologis dengan modal konfirmasi pembatalan peminjaman dan pengembalian aset dinas.

### 2. Portal Administrasi (Admin & Super Admin)
* **Dashboard Monitoring**: Visualisasi statistik aset aktif, kendaraan operasional, ketersediaan ruangan, dan peminjaman yang sedang berjalan.
* **Persetujuan Peminjaman Aset**: Verifikasi pengajuan peminjaman (Setujui / Tolak disertai alasan penolakan).
* **Kelola Aset (Mobil, Motor, Ruangan)**: Tambah, edit data spesifikasi, hapus aset, dan perbarui status operasional (*Tersedia, Dipinjam, Perawatan*).
* **Manajemen Pengguna & Multi-Role**:
  * **Super Admin**: Memiliki hak istimewa untuk mengangkat pegawai menjadi admin (`+ Jadikan Admin`) atau mencabut hak admin (`Cabut Admin`).
  * **Admin**: Mengelola operasional harian aset tanpa hak mengubah wewenang role akun lain.
  * Proteksi akun Super Admin utama dengan badge khusus dan pencegahan penghapusan akun mandiri.
* **Cetak Laporan Pengaduan Resmi**:
  * Tampilan dokumen terstandarisasi dengan **Kop Surat Pemerintah Provinsi Jawa Timur**.
  * Opsi ekspor/cetak langsung ke **PDF** maupun unduh berkas **Microsoft Word (.docx)**.

---

## 🛠️ Tech Stack & Arsitektur

* **Frontend**:
  * React 18
  * Vite (HMR & Fast Bundler)
  * TypeScript & JSX
  * Tailwind CSS (Palet warna resmi: Navy `#071d63`, Kuning Emas `#fed000`, Merah `#ff0000`)
* **Backend**:
  * PHP 8.x (Arsitektur Serverless Functions untuk Vercel / Native PHP untuk Apache)
  * PHPWord (`phpoffice/phpword`) untuk pembuatan dokumen `.docx`
  * PDO Database Driver
* **Database**:
  * PostgreSQL (Supabase / Neon Database untuk Cloud Production)
  * MySQL / MariaDB (Kompatibel untuk pengembangan lokal / XAMPP)
* **Keamanan**:
  * Proteksi CSRF Token pada seluruh endpoint mutasi data (`POST`, `PUT`, `DELETE`).
  * Penanganan otomatis kedaluwarsa token (HTTP 419 retry & auto-refresh token).
  * Hash password aman menggunakan `password_hash()` BCRYPT.
* **Testing & Quality Assurance**:
  * Vitest + React Testing Library (100 tes unit & integrasi terverifikasi lulus).
  * Oxlint untuk validasi kode bersih.

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
* Node.js (versi 18 ke atas) & npm
* PHP 8.0+
* Composer
* Web Server lokal (XAMPP / Laragon / PHP built-in server) atau koneksi PostgreSQL

### Langkah-langkah:

1. **Clone Repository**
   ```bash
   git clone https://github.com/NANDAGPP/peminjaman-bina-marga.git
   cd peminjaman-bina-marga
   ```

2. **Instal Dependensi Backend**
   ```bash
   composer install
   ```

3. **Setup Database**
   * Buat database baru bernama `binamarga`.
   * Impor skrip SQL sesuai database yang digunakan:
     * MySQL: `binamarga.sql`
     * PostgreSQL: `binamarga_postgresql.sql`
   * Sesuaikan kredensial koneksi di file `.env` (salin dari `.env.example`).

4. **Instal Dependensi & Jalankan Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Aplikasi frontend akan aktif di `http://localhost:5173`.

5. **Menjalankan Pengujian (Unit & Integration Tests)**
   ```bash
   cd frontend
   npm test -- --run
   ```

---

## 📂 Struktur Direktori

```plaintext
Peminjaman-Bina-Marga-main/
├── api/                     # Backend API serverless (Auth, Aset, Peminjaman, Pengaduan, Users)
├── frontend/                # Sumber kode frontend React + Vite
│   ├── public/              # Aset statis dan favicon
│   ├── src/
│   │   ├── components/      # Komponen UI (Admin, User, Peminjaman, Pengaduan, Profile)
│   │   ├── services/        # Service API client & penanganan CSRF
│   │   └── test/            # Unit & integration test suites (16 test files)
│   └── package.json
├── images/                  # Aset grafis, ikon, dan ilustrasi UI
├── uploads/                 # Berkas gambar aset dinas
├── binamarga.sql            # Skema dan data awal MySQL
├── binamarga_postgresql.sql # Skema dan data awal PostgreSQL
├── vercel.json              # Konfigurasi deployment Vercel Serverless
└── README.md
```

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk **Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur**.  
Hak cipta dilindungi undang-undang &copy; 2026.
