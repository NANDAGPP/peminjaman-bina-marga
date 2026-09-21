import React, { FormEvent, useState } from "react";
import { TopNavbarCTA } from "../Common/TopNavbarCTA";
import { ApiError, login, SessionUser } from "../../services/api";

interface LoginUserProps {
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (userData: SessionUser) => void;
  onSwitchToAdmin?: () => void;
}

export const LoginUser: React.FC<LoginUserProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
  onSwitchToAdmin,
}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Silakan masukkan username.");
      return;
    }

    if (!password) {
      setError("Silakan masukkan password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password, "user");

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
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

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63] relative overflow-hidden select-none">
      
      {/* Top Header CTA Navbar */}
      <TopNavbarCTA className="pt-5 sm:pt-6 z-20" />

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-auto">
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <img
            src="/images/logo.png"
            alt="Watermark"
            className="w-[500px] h-[500px] object-contain"
          />
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 flex flex-col items-center relative z-20">
          {/* Circular Emblem */}
          <div className="w-20 h-20 rounded-full bg-white shadow-md p-2 flex items-center justify-center mb-4 border border-gray-100">
            <img
              src="/images/logobina.png"
              alt="Logo DPU Bina Marga"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#071d63] tracking-wide text-center uppercase mb-1">
            MASUK SEBAGAI USER
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            Panel Pengelolaan Aset & Peminjaman DPU Bina Marga
          </p>

          {error && (
            <div className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username user"
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
                placeholder="Masukkan password user"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#fed000] hover:bg-[#ebbf00] text-[#071d63] font-black text-xs sm:text-sm tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              {loading ? "MEMPROSES..." : "MASUK"}
            </button>
          </form>

          {/* Bottom links and note */}
          <div className="mt-7 pt-5 border-t border-gray-100 w-full text-center flex flex-col gap-2">
            {onSwitchToRegister && (
              <div className="text-xs text-gray-600 font-medium">
                Belum memiliki akun?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-[#071d63] font-bold hover:underline cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </div>
            )}

            {onSwitchToAdmin && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#071d63] hover:bg-[#0c2a86] text-white font-bold text-xs flex items-center justify-center transition-all active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  <span>Masuk sebagai Administrator / Admin</span>
                </button>
              </div>
            )}

            <span className="text-[11px] text-gray-400 mt-1">
              Hak Akses Petugas & Pengguna Berwenang
            </span>
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="w-full py-3 text-center text-[11px] text-gray-400 select-none">
        DPU Bina Marga Provinsi Jawa Timur &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default LoginUser;
