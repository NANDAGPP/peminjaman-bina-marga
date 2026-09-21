import React, { useState } from "react";
import { AdminSidebar, AdminPage } from "./AdminSidebar";
import { LogoutModal } from "./Modals/LogoutModal";

interface AdminLayoutProps {
  activePage: AdminPage;
  title?: string;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const PAGE_TITLES: Record<AdminPage, string> = {
  "dashboard": "DASHBOARD",
  "kelola-mobil": "KELOLA MOBIL",
  "kelola-motor": "KELOLA MOTOR",
  "kelola-ruangan": "KELOLA RUANGAN",
  "kelola-user": "KELOLA USER",
  "peminjaman-berjalan": "PEMINJAMAN BERJALAN",
  "laporan-pengaduan": "LAPORAN PENGADUAN",
  "profile-admin": "PROFIL",
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activePage,
  title,
  onNavigate,
  onLogout,
  children,
}) => {
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    onLogout();
  };

  const handleMobileNavigate = (page: AdminPage) => {
    setMobileDrawerOpen(false);
    onNavigate(page);
  };

  const currentTitle = title || PAGE_TITLES[activePage] || "ADMIN";

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col p-3 sm:p-5 lg:p-6 pr-0 sm:pr-0 lg:pr-0 gap-4 lg:gap-6 font-sans selection:bg-[#fed000] selection:text-[#071d63] overflow-x-hidden">
      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex gap-4 lg:gap-6 items-stretch w-full">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex flex-col shrink-0 self-stretch">
          <AdminSidebar
            activePage={activePage}
            onNavigate={onNavigate}
            onLogout={() => setLogoutModalOpen(true)}
          />
        </div>

        {/* Sidebar Mobile */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative z-10 p-4 max-w-[320px] w-full flex flex-col max-h-screen overflow-y-auto">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center font-black shadow-md cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <AdminSidebar
                activePage={activePage}
                onNavigate={handleMobileNavigate}
                onLogout={() => {
                  setMobileDrawerOpen(false);
                  setLogoutModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Top Page Indicator Navbar */}
          <div className="w-full flex justify-end mb-3 sm:mb-4 overflow-hidden">
            <div className="w-full sm:w-[calc(100%-60px)] lg:w-[calc(100%-80px)] bg-[#071d63] text-white font-black text-sm sm:text-base tracking-wider px-4 sm:pl-10 py-2.5 sm:py-3.5 rounded-l-2xl shadow-md uppercase select-none flex items-center justify-between sm:justify-start gap-3">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Buka Menu Admin"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <span className="truncate">{currentTitle}</span>
            </div>
          </div>

          {/* Children Content Area with proper right padding */}
          <div className="w-full pr-3 sm:pr-6 lg:pr-8">{children}</div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onConfirm={handleConfirmLogout}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};
