import React, { useState } from "react";
import { AdminPage } from "./AdminSidebar";
import { DashboardAdmin } from "./DashboardAdmin";
import { KelolaAsetTable } from "./KelolaAsetTable";
import { AdminPeminjaman } from "./AdminPeminjaman";
import { KelolaUser } from "./KelolaUser";
import { AdminPengaduan } from "./AdminPengaduan";
import { ProfileAdmin } from "./ProfileAdmin";
import { LoginAdmin } from "./LoginAdmin";
import { logout } from "../../services/api";

interface AdminAppProps {
  onBackToUser: () => void;
  initialPage?: AdminPage;
  onLogout?: () => void;
  currentAdmin?: {
    id?: number;
    username?: string;
    nama?: string;
    role?: "super_admin" | "admin";
  } | null;
}

export const AdminApp: React.FC<AdminAppProps> = ({
  onBackToUser,
  initialPage = "dashboard",
  onLogout,
  currentAdmin,
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(true);
  const [activeAdminPage, setActiveAdminPage] = useState<AdminPage>(() => {
    try {
      const saved = localStorage.getItem("bina_marga_admin_page");
      return (saved as AdminPage) || initialPage;
    } catch {
      return initialPage;
    }
  });

  const handleNavigatePage = (page: AdminPage) => {
    setActiveAdminPage(page);
    try {
      localStorage.setItem("bina_marga_admin_page", page);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await logout("admin");
    } catch {}
    try {
      localStorage.removeItem("bina_marga_admin_page");
    } catch {}
    setIsAdminLoggedIn(false);
    if (onLogout) onLogout();
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    handleNavigatePage("dashboard");
  };

  if (!isAdminLoggedIn) {
    return (
      <LoginAdmin
        onLoginSuccess={handleLoginSuccess}
        onBackToUser={onBackToUser}
      />
    );
  }

  switch (activeAdminPage) {
    case "dashboard":
      return (
        <DashboardAdmin
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "kelola-mobil":
      return (
        <KelolaAsetTable
          kategori="mobil"
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "kelola-motor":
      return (
        <KelolaAsetTable
          kategori="motor"
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "kelola-ruangan":
      return (
        <KelolaAsetTable
          kategori="ruang"
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "kelola-user":
      return (
        <KelolaUser
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
          adminRole={currentAdmin?.role}
        />
      );
    case "peminjaman-berjalan":
      return (
        <AdminPeminjaman
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "laporan-pengaduan":
      return (
        <AdminPengaduan
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    case "profile-admin":
      return (
        <ProfileAdmin
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
    default:
      return (
        <DashboardAdmin
          onNavigate={handleNavigatePage}
          onLogout={handleLogout}
        />
      );
  }
};
