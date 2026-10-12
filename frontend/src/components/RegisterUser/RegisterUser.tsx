import React, { FormEvent, useState } from "react";
import { TopNavbarCTA } from "../Common/TopNavbarCTA";
import { ApiError, register } from "../../services/api";

interface RegisterUserProps {
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterUser: React.FC<RegisterUserProps> = ({
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [username, setUsername] = useState<string>("");
  const [noHp, setNoHp] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!username.trim()) {
      setStatusMessage({ text: "Username wajib diisi.", type: "error" });
      return;
    }

    if (!noHp.trim()) {
      setStatusMessage({ text: "Nomor handphone wajib diisi.", type: "error" });
      return;
    }

    if (!nip.trim() || !/^[0-9]+$/.test(nip)) {
      setStatusMessage({
        text: "NIP wajib diisi dengan format angka.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      setStatusMessage({
        text: "Password minimal harus 8 karakter.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: username.trim(),
        nip: nip.trim(),
        no_hp: noHp.trim(),
        password,
      });

      setStatusMessage({
        text: "Pendaftaran akun berhasil! Mengalihkan ke login...",
        type: "success",
      });

      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 1200);
    } catch (err) {
      setStatusMessage({
        text:
          err instanceof ApiError
            ? err.message
            : "Gagal melakukan pendaftaran akun.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63] relative overflow-hidden select-none">
      {/* Top Header CTA Navbar */}
      <TopNavbarCTA className="pt-5 sm:pt-6 z-20" />

      {/* Main Centered Register Card */}
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
          {/* Emblem */}
          <div className="h-16 px-4 py-2 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 border border-gray-100">
            <img
              src="/images/sipina_logo_cropped.png"
              alt="Logo SIPINA"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#071d63] tracking-wide text-center uppercase mb-1">
            DAFTAR AKUN BARU
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            Panel Pengelolaan Aset & Peminjaman DPU Bina Marga
          </p>

          {statusMessage && (
            <div
              className={`w-full p-3 rounded-xl text-xs font-bold text-center mb-4 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="Masukkan username"
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                No. Handphone
              </label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => {
                  setNoHp(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="Masukkan nomor handphone"
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                NIP
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => {
                  setNip(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="Masukkan NIP"
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="Masukkan password (minimal 8 karakter)"
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#fed000] focus:ring-2 focus:ring-[#fed000]/40 outline-none transition-all text-xs"
              />
              <span className="text-[10.5px] text-gray-400 mt-1 block">
                * Password minimal 8 karakter
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-full bg-[#fed000] hover:bg-[#ebbf00] text-[#071d63] font-black text-xs sm:text-sm tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? "MEMPROSES..." : "DAFTAR"}
            </button>
          </form>

          {/* Bottom links and note */}
          <div className="mt-6 pt-5 border-t border-gray-100 w-full text-center flex flex-col gap-2">
            {onSwitchToLogin && (
              <div className="text-xs text-gray-600 font-medium">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-[#071d63] font-bold hover:underline cursor-pointer"
                >
                  Masuk sekarang
                </button>
              </div>
            )}
            <span className="text-[11px] text-gray-400">
              Hak Akses Petugas & Pengguna Berwenang
            </span>
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="w-full py-3 text-center text-[11px] text-gray-400 select-none">
        SIPINA &copy; {new Date().getFullYear()} - Sistem Peminjaman Sarana dan Prasarana
      </footer>
    </div>
  );
};

export default RegisterUser;
