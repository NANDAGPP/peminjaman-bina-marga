import React, { useState } from "react";
import { TopNavbarCTA } from "../Common/TopNavbarCTA";
import { ApiError, login, registerAdmin, SessionUser } from "../../services/api";

interface LoginAdminProps {
  onLoginSuccess: (user: SessionUser) => void;
  onBackToUser: () => void;
}

export const LoginAdmin: React.FC<LoginAdminProps> = ({
  onLoginSuccess,
  onBackToUser,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await login(username.trim(), password, "admin");
      onLoginSuccess(result.user);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Terjadi kendala saat memproses login."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerAdmin({
        username: username.trim(),
        nip: nip.trim(),
        password,
        secret_key: secretKey.trim(),
      });

      setSuccess(res.message || "Pendaftaran Administrator berhasil. Silakan login.");
      setPassword("");
      setConfirmPassword("");
      setSecretKey("");
      setMode("login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Pendaftaran administrator gagal diproses."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63] relative overflow-hidden">
      {/* Top Navbar */}
      <div className="w-full relative z-20 pt-5 sm:pt-6">
        <TopNavbarCTA />
        <div className="w-full max-w-[1060px] mx-auto px-4 pt-2 flex justify-end">
          <button
            type="button"
            onClick={onBackToUser}
            className="text-xs text-[#071d63] hover:underline font-semibold cursor-pointer"
          >
            &larr; Kembali ke Portal User
          </button>
        </div>
      </div>

      {/* Main Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        {/* Background Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <img
            src="/images/logo.png"
            alt="Watermark"
            className="w-[500px] h-[500px] object-contain"
          />
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 flex flex-col items-center relative z-20">
          <div className="w-20 h-20 rounded-full bg-white shadow-md p-2 flex items-center justify-center mb-4 border border-gray-100">
            <img
              src="/images/logobina.png"
              alt="Logo DPU Bina Marga"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#071d63] tracking-wide text-center uppercase mb-1">
            {mode === "login" ? "MASUK SEBAGAI ADMIN" : "REGISTRASI ADMINISTRATOR"}
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            {mode === "login"
              ? "Panel Pengelolaan Aset & Peminjaman DPU Bina Marga"
              : "Pendaftaran Pengelola dengan Protokol Otorisasi Khusus"}
          </p>

          {error && (
            <div className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center mb-4">
              {success}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="w-full space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">
                  Username atau NIP
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau NIP admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-full bg-[#fed000] hover:bg-[#ebbf00] text-[#071d63] font-black text-xs sm:text-sm tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                {loading ? "MEMPROSES..." : "MASUK SEBAGAI ADMIN"}
              </button>

              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("register");
                  }}
                  className="text-xs text-[#071d63] hover:underline font-bold cursor-pointer"
                >
                  Belum punya akun admin? Registrasi Protokol Khusus
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="w-full space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Username Administrator
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin_logistik"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  NIP Administrator (8-20 digit)
                </label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Contoh: 198501012010011001"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Password Administrator
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
                  <span>Kode Otorisasi Protokol Admin</span>
                  <span className="text-[10px] text-amber-600 font-semibold">*Protokol Rahasia</span>
                </label>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Masukkan kode protokol rahasia"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Kode otorisasi resmi instansi untuk mencegah pendaftaran publik yang tidak sah.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-full bg-[#071d63] hover:bg-[#0c2a86] text-white font-black text-xs sm:text-sm tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                {loading ? "MEMPROSES REGISTRASI..." : "DAFTAR SEBAGAI ADMIN"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("login");
                  }}
                  className="text-xs text-[#071d63] hover:underline font-bold cursor-pointer"
                >
                  Sudah punya akun admin? Masuk di sini
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
            <span className="text-[11px] text-gray-400">
              Hak Akses Khusus Petugas & Pejabat Berwenang
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

