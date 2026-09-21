import React from "react";

export type AdminPage =
  | "dashboard"
  | "kelola-mobil"
  | "kelola-motor"
  | "kelola-ruangan"
  | "kelola-user"
  | "peminjaman-berjalan"
  | "laporan-pengaduan"
  | "profile-admin";

interface AdminSidebarProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activePage,
  onNavigate,
  onLogout,
}) => {
  const menuItems: { id: AdminPage; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "/images/nav/icon_dashboard.png" },
    { id: "kelola-mobil", label: "Kelola Mobil", icon: "/images/nav/icon_mobil.png" },
    { id: "kelola-motor", label: "Kelola Motor", icon: "/images/nav/icon_motor.png" },
    { id: "kelola-ruangan", label: "Kelola Ruangan", icon: "/images/nav/icon_ruangan.png" },
    { id: "kelola-user", label: "Kelola User", icon: "/images/nav/icon_user.png" },
    { id: "peminjaman-berjalan", label: "Peminjaman Berjalan", icon: "/images/nav/icon_pinjam.png" },
    { id: "laporan-pengaduan", label: "Laporan Pengaduan", icon: "/images/nav/icon_pengaduan.png" },
    { id: "profile-admin", label: "Profile", icon: "/images/nav/icon_profile.png" },
  ];

  return (
    <aside className="w-[240px] sm:w-[260px] xl:w-[275px] bg-white rounded-[28px] sm:rounded-[32px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 sm:p-5 pt-5 pb-5 flex flex-col justify-between h-full flex-1 shrink-0 select-none">
      <div>
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200">
          <img
            src="/images/logobina.png"
            alt="Logo DPU Bina Marga"
            className="w-9 h-10 object-contain shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-black tracking-tight text-[#071d63] uppercase">
              DINAS PEKERJAAN UMUM BINA
            </span>
            <span className="text-[10px] font-black tracking-tight text-[#071d63] uppercase">
              MARGA PROVINSI JAWA TIMUR
            </span>
          </div>
        </div>

        <nav className="space-y-1.5 sm:space-y-2">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-[13.5px] font-extrabold transition-all cursor-pointer select-none active:scale-[0.98] ${
                  isActive
                    ? "bg-[#fed000] text-[#071d63] shadow-xs"
                    : "text-[#071d63] hover:bg-gray-100/70"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow-xs"
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 mt-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full bg-[#ff0000] hover:bg-[#d90000] text-white font-bold py-2.5 sm:py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-95 cursor-pointer text-sm sm:text-base select-none"
          title="Keluar"
        >
          <img
            src="/images/keluar.png"
            alt="Keluar"
            className="w-4 h-4 object-contain brightness-0 invert"
          />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
