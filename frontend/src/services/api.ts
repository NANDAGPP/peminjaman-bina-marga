/**
 * Satu-satunya pintu komunikasi ke backend PHP.
 *
 * Menangani base URL, pengiriman cookie sesi, token CSRF, dan penerjemahan
 * error server menjadi ApiError yang bisa ditampilkan ke pengguna.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface SessionUser {
  id: number;
  username: string;
  nama: string;
  nip: string;
  no_hp?: string;
  foto?: string;
  role: "super_admin" | "admin" | "user";
}

export interface SessionResponse {
  authenticated: boolean;
  role: "super_admin" | "admin" | "user" | null;
  user: SessionUser | null;
  csrf_token?: string;
}

let csrfToken = "";

/**
 * Token CSRF ikut dikirim server pada setiap respons auth, jadi cukup
 * disimpan di memori. Menyimpannya di localStorage justru memperluas
 * dampak bila terjadi XSS.
 */
async function ensureCsrfToken(): Promise<void> {
  if (csrfToken) return;

  const response = await fetch(`${BASE_URL}/api/auth.php?action=me`, {
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);

  if (payload?.csrf_token) {
    csrfToken = payload.csrf_token;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = "GET", body } = options;
  const headers: Record<string, string> = {};

  if (method !== "GET") {
    await ensureCsrfToken();
    headers["X-CSRF-Token"] = csrfToken;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.", 0);
  }

  const payload = await response.json().catch(() => null);

  if (payload?.csrf_token) {
    csrfToken = payload.csrf_token;
  }

  // Sesi kedaluwarsa membuat token lama ditolak; ambil token baru lalu ulangi sekali.
  if (response.status === 419 && !isRetry) {
    csrfToken = "";
    return request<T>(path, options, true);
  }

  if (payload === null) {
    throw new ApiError("Respons server tidak dapat dibaca.", response.status);
  }

  if (!response.ok) {
    throw new ApiError(payload.message ?? "Permintaan gagal diproses.", response.status);
  }

  return payload as T;
}

export function clearCsrfToken(): void {
  csrfToken = "";
}

// --- Otentikasi ---

export function fetchSession(role?: "admin" | "user") {
  const query = role ? `&role=${role}` : "";
  return request<SessionResponse>(`/api/auth.php?action=me${query}`);
}

export function login(username: string, password: string, role: "admin" | "user" | "auto" = "auto") {
  return request<{ role: "super_admin" | "admin" | "user"; user: SessionUser; message: string }>(
    "/api/auth.php?action=login",
    { method: "POST", body: { username, password, role } }
  );
}

export function logout(role?: "admin" | "user") {
  const query = role ? `?role=${role}` : "";
  return request<{ message: string }>(`/api/auth.php?action=logout${query}`, { method: "POST" });
}

export function register(data: {
  username: string;
  nip: string;
  no_hp: string;
  password: string;
}) {
  return request<{ message: string }>("/api/auth.php?action=register", {
    method: "POST",
    body: data,
  });
}

export function registerAdmin(data: {
  username: string;
  nip: string;
  password: string;
  secret_key: string;
}) {
  return request<{ message: string }>("/api/auth.php?action=register_admin", {
    method: "POST",
    body: data,
  });
}

export function updateUserAvatar(foto: string) {
  return request<{ foto: string; message: string }>("/api/auth.php?action=update_avatar", {
    method: "POST",
    body: { foto },
  });
}

export const updateAdminAvatar = updateUserAvatar;

export function updateUserProfile(data: { phone?: string; no_hp?: string; password?: string }) {
  return request<{ no_hp: string; user?: SessionUser; message: string }>("/api/auth.php?action=update_profile", {
    method: "POST",
    body: data,
  });
}

export function updateAdminProfile(data: {
  username: string;
  nip: string;
  password?: string;
}) {
  return request<{ user: SessionUser; message: string }>("/api/auth.php?action=update_admin_profile", {
    method: "POST",
    body: data,
  });
}

// --- Peminjaman ---

export function fetchAssets(kategori = "all") {
  return request<{ kendaraan: any[]; ruangan: any[] }>(
    `/api/peminjaman.php?action=assets&kategori=${encodeURIComponent(kategori)}`
  );
}

export function fetchLoans() {
  return request<{ loans: any[] }>("/api/peminjaman.php?action=list");
}

export function createLoan(data: {
  jenis_aset: string;
  id_aset: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
}) {
  return request<{ id_peminjaman: number; message: string }>("/api/peminjaman.php?action=create", {
    method: "POST",
    body: data,
  });
}

export function updateLoanStatus(idPeminjaman: number, status: string, alasan = "") {
  return request<{ message: string }>("/api/peminjaman.php?action=update_status", {
    method: "POST",
    body: { id_peminjaman: idPeminjaman, status, alasan },
  });
}

export function cancelLoan(idPeminjaman: number) {
  return request<{ message: string }>("/api/peminjaman.php?action=cancel", {
    method: "POST",
    body: { id_peminjaman: idPeminjaman },
  });
}

export function returnLoan(idPeminjaman: number) {
  return request<{ message: string }>("/api/peminjaman.php?action=return", {
    method: "POST",
    body: { id_peminjaman: idPeminjaman },
  });
}

export function deleteLoan(idPeminjaman: number) {
  return request<{ message: string }>("/api/peminjaman.php?action=delete", {
    method: "POST",
    body: { id_peminjaman: idPeminjaman },
  });
}

export function createAsset(data: {
  category: "mobil" | "motor" | "ruang";
  name: string;
  code: string;
  tipe?: string;
  tahun?: string;
  lantai?: string;
  capacity?: string;
  status?: string;
  image?: string;
}) {
  return request<{ id: string; message: string }>("/api/peminjaman.php?action=create_asset", {
    method: "POST",
    body: data,
  });
}

export function updateAsset(data: {
  id: string | number;
  category: "mobil" | "motor" | "ruang";
  name: string;
  code: string;
  tipe?: string;
  tahun?: string;
  lantai?: string;
  capacity?: string;
  status?: string;
  image?: string;
}) {
  return request<{ message: string }>("/api/peminjaman.php?action=update_asset", {
    method: "POST",
    body: data,
  });
}

export function deleteAsset(id: string | number) {
  return request<{ message: string }>("/api/peminjaman.php?action=delete_asset", {
    method: "POST",
    body: { id },
  });
}

// --- Pengaduan ---

export function fetchPengaduan() {
  return request<{ data: any[] }>("/api/pengaduan.php");
}

export function createPengaduan(keluhan: string) {
  return request<{ id: number; message: string }>("/api/pengaduan.php", {
    method: "POST",
    body: { keluhan },
  });
}

export function updatePengaduanStatus(idPengaduan: number, status: string) {
  return request<{ message: string }>("/api/pengaduan.php?action=status", {
    method: "POST",
    body: { id_pengaduan: idPengaduan, status },
  });
}

export function deletePengaduan(idPengaduan: number) {
  return request<{ message: string }>("/api/pengaduan.php?action=delete", {
    method: "POST",
    body: { id_pengaduan: idPengaduan },
  });
}

// --- Dashboard ---

export function fetchDashboard() {
  return request<{ counts: any; status: any; recentLoans: any[] }>("/api/dashboard.php");
}

// --- Users (Admin) ---

export interface ApiUserItem {
  id: number;
  nama: string;
  username: string;
  nip: string;
  noHp: string;
  foto: string;
  isAdmin?: boolean;
  adminRole?: "super_admin" | "admin" | null;
}

export function fetchUsers() {
  return request<{ users: ApiUserItem[] }>("/api/users.php");
}

export function createUser(data: {
  nama: string;
  nip: string;
  noHp: string;
  password?: string;
  foto?: string;
}) {
  return request<{ id: number; message: string }>("/api/users.php?action=create", {
    method: "POST",
    body: data,
  });
}

export function updateUser(data: {
  id: number;
  nama: string;
  nip: string;
  noHp: string;
  password?: string;
  foto?: string;
}) {
  return request<{ message: string }>("/api/users.php?action=update", {
    method: "POST",
    body: data,
  });
}

export function deleteUser(id: number) {
  return request<{ message: string }>("/api/users.php?action=delete", {
    method: "POST",
    body: { id },
  });
}

export function promoteUserToAdmin(id: number) {
  return request<{ message: string }>("/api/users.php?action=promote_to_admin", {
    method: "POST",
    body: { id },
  });
}

export function demoteUserFromAdmin(id: number) {
  return request<{ message: string }>("/api/users.php?action=demote_from_admin", {
    method: "POST",
    body: { id },
  });
}
