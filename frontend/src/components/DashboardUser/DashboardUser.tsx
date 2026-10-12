import React from "react";
import NavbarUser from "../NavbarUser/NavbarUser";

interface DashboardUserProps {
  user?: {
    username?: string;
    nama?: string;
    nip?: string;
  } | null;
  onLogout?: () => void;
  onNavigate?: (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile") => void;
}

export const DashboardUser: React.FC<DashboardUserProps> = ({
  user,
  onLogout,
  onNavigate,
}) => {
  const handleNav = (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile") => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between">
      {/* Navbar */}
      <NavbarUser activePage="beranda" onNavigate={handleNav} currentUser={user} />

      {/* Main Container */}
      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-10 my-auto">
        {/* Welcome Banner */}
        <div className="w-full rounded-3xl bg-linear-to-r from-[#071d63] to-[#0c2f9e] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-[#fed000] font-bold mb-2">
              Sistem Peminjaman Infrastruktur
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Selamat Datang, {user?.nama || user?.username || "Pegawai DPU Bina Marga"}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-light max-w-xl">
              Kelola pengajuan peminjaman mobil dinas, motor dinas, laptop, dan ruangan
              secara praktis, terdata, dan transparan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm font-semibold transition-colors focus:outline-none"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Quick Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Tentang Platform",
              desc: "Informasi seputar sistem peminjaman infrastruktur.",
              page: "tentang" as const,
              color: "border-[#071d63]",
              icon: "🏢",
            },
            {
              title: "Layanan Pengaduan",
              desc: "Sampaikan kendala atau kerusakan pada aset yang digunakan.",
              page: "pengaduan" as const,
              color: "border-[#fed000]",
              icon: "🛠️",
            },
            {
              title: "Bantuan & FAQ",
              desc: "Jawaban atas pertanyaan yang sering diajukan pengguna.",
              page: "faq" as const,
              color: "border-[#071d63]",
              icon: "❓",
            },
            {
              title: "Simulasi Pengajuan",
              desc: "Lihat status konfirmasi pengajuan yang berhasil tersimpan.",
              page: "pengajuan-terkirim" as const,
              color: "border-[#fed000]",
              icon: "📋",
            },
          ].map((card) => (
            <div
              key={card.title}
              onClick={() => handleNav(card.page as any)}
              className="p-6 rounded-2xl border-2 border-gray-100 hover:border-[#fed000] bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h2 className="text-lg font-bold text-[#071d63] group-hover:text-[#fed000] transition-colors mb-2">
                  {card.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#071d63]">
                <span>Buka Layanan</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 select-none">
        SIPINA &copy; {new Date().getFullYear()} - Sistem Peminjaman Sarana dan Prasarana
      </footer>
    </div>
  );
};

export default DashboardUser;
