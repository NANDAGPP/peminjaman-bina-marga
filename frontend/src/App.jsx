import React, { useState, useEffect } from "react";
import LoginUser from "./components/LoginUser/LoginUser";
import RegisterUser from "./components/RegisterUser/RegisterUser";
import TentangKami from "./components/TentangKami/TentangKami";
import Pengaduan from "./components/Pengaduan/Pengaduan";
import FAQ from "./components/FAQ/FAQ";
import PengajuanTerkirim from "./components/PengajuanTerkirim/PengajuanTerkirim";
import Beranda from "./components/Beranda/Beranda";
import { PeminjamanAset } from "./components/Peminjaman/PeminjamanAset";
import { DetailAset } from "./components/Peminjaman/DetailAset";
import { ProfileUser } from "./components/Profile/ProfileUser";
import { AdminApp } from "./components/Admin/AdminApp";
import { LoginAdmin } from "./components/Admin/LoginAdmin";
import { ASSETS_DATA, parseAssetDbId } from "./components/Peminjaman/assetData";
import { ApiError, createLoan, fetchSession, logout } from "./services/api";
import { LoadingScreen } from "./components/Common/LoadingScreen";
import { CookieConsent } from "./components/Common/CookieConsent";
import "./index.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bina_marga_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("bina_marga_current_admin");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const h = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";
    const activeRole = typeof localStorage !== "undefined" ? localStorage.getItem("bina_marga_active_role") : null;
    const savedAdmin = typeof localStorage !== "undefined" ? localStorage.getItem("bina_marga_current_admin") : null;
    if (h === "#admin-login") return "admin-login";
    if (h === "#admin" || activeRole === "admin") {
      return savedAdmin ? "admin-dashboard" : "admin-login";
    }
    const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("bina_marga_current_user") : null;
    return savedUser ? "beranda-after" : "beranda-before";
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [profileInitialTab, setProfileInitialTab] = useState("profil");
  const [selectedDetailAsset, setSelectedDetailAsset] = useState(ASSETS_DATA[0]);
  const [notice, setNotice] = useState(null);

  // Check initial active session & URL hash
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      const activeRole = localStorage.getItem("bina_marga_active_role");
      const savedAdmin = localStorage.getItem("bina_marga_current_admin");
      if (h === "#admin-login") {
        setCurrentPage("admin-login");
      } else if (h === "#admin" || (activeRole === "admin" && savedAdmin)) {
        setCurrentPage(currentAdmin || savedAdmin ? "admin-dashboard" : "admin-login");
      }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();

    // Fetch user & admin sessions concurrently
    Promise.allSettled([
      fetchSession("user")
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            try {
              localStorage.setItem("bina_marga_current_user", JSON.stringify(data.user));
            } catch {}
            const activeRole = localStorage.getItem("bina_marga_active_role");
            const isHashAdmin = window.location.hash.toLowerCase().includes("admin");
            if (!isHashAdmin && activeRole !== "admin") {
              setCurrentPage((prev) => (prev === "beranda-before" ? "beranda-after" : prev));
            }
          } else {
            const activeRole = localStorage.getItem("bina_marga_active_role");
            const savedUser = localStorage.getItem("bina_marga_current_user");
            if (activeRole === "user" && savedUser) {
              try {
                setCurrentUser(JSON.parse(savedUser));
              } catch {}
            } else if (activeRole !== "admin") {
              setCurrentUser(null);
              try {
                localStorage.removeItem("bina_marga_current_user");
              } catch {}
            }
          }
        })
        .catch(() => {}),
      fetchSession("admin")
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentAdmin(data.user);
            try {
              localStorage.setItem("bina_marga_current_admin", JSON.stringify(data.user));
            } catch {}
            const activeRole = localStorage.getItem("bina_marga_active_role");
            const isHashAdmin = window.location.hash.toLowerCase().includes("admin");
            if (isHashAdmin || activeRole === "admin") {
              setCurrentPage("admin-dashboard");
            }
          } else {
            const savedAdmin = localStorage.getItem("bina_marga_current_admin");
            const activeRole = localStorage.getItem("bina_marga_active_role");
            if (savedAdmin && activeRole === "admin") {
              try {
                setCurrentAdmin(JSON.parse(savedAdmin));
              } catch {}
              setCurrentPage("admin-dashboard");
            } else {
              setCurrentAdmin(null);
              try {
                localStorage.removeItem("bina_marga_current_admin");
                if (localStorage.getItem("bina_marga_active_role") === "admin") {
                  localStorage.removeItem("bina_marga_active_role");
                }
              } catch {}
              if (window.location.hash.toLowerCase().includes("admin")) {
                setCurrentPage("admin-login");
              }
            }
          }
        })
        .catch(() => {
          const savedAdmin = localStorage.getItem("bina_marga_current_admin");
          const activeRole = localStorage.getItem("bina_marga_active_role");
          if (savedAdmin && activeRole === "admin") {
            try {
              setCurrentAdmin(JSON.parse(savedAdmin));
            } catch {}
            setCurrentPage("admin-dashboard");
          }
        })
    ]).finally(() => {
      setIsInitialLoading(false);
    });

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("bina_marga_current_user", JSON.stringify(user));
      localStorage.setItem("bina_marga_active_role", "user");
    } catch {}
    setCurrentPage("beranda-after");
  };

  const handleAdminLoginSuccess = (admin) => {
    setCurrentAdmin(admin);
    try {
      localStorage.setItem("bina_marga_current_admin", JSON.stringify(admin));
      localStorage.setItem("bina_marga_active_role", "admin");
    } catch {}
    window.location.hash = "#admin";
    setCurrentPage("admin-dashboard");
  };

  const handleLogout = async () => {
    try {
      await logout("user");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCurrentUser(null);
      try {
        localStorage.removeItem("bina_marga_current_user");
        localStorage.removeItem("bina_marga_user_phone");
        localStorage.removeItem("bina_marga_user_avatar");
        if (localStorage.getItem("bina_marga_active_role") === "user") {
          localStorage.removeItem("bina_marga_active_role");
        }
        window.dispatchEvent(new Event("avatarChanged"));
      } catch {}
      setCurrentPage("beranda-before");
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logout("admin");
    } catch (err) {
      console.error("Admin logout error:", err);
    } finally {
      setCurrentAdmin(null);
      try {
        localStorage.removeItem("bina_marga_current_admin");
        localStorage.removeItem("bina_marga_admin_page");
        if (localStorage.getItem("bina_marga_active_role") === "admin") {
          localStorage.removeItem("bina_marga_active_role");
        }
      } catch {}
      if (window.location.hash.toLowerCase().includes("admin")) {
        window.location.hash = "";
      }
      setCurrentPage(currentUser ? "beranda-after" : "beranda-before");
    }
  };

  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  const handleNavigate = (page) => {
    if (page === "profile") {
      if (!currentUser) {
        setCurrentPage("login");
        return;
      }
      setProfileInitialTab("profil");
      setCurrentPage("profile");
      return;
    }
    if (page === "admin-login") {
      if (currentAdmin) {
        try {
          localStorage.setItem("bina_marga_active_role", "admin");
        } catch {}
        window.location.hash = "#admin";
        setCurrentPage("admin-dashboard");
      } else {
        window.location.hash = "#admin-login";
        setCurrentPage("admin-login");
      }
      return;
    }
    if (page === "beranda") {
      try {
        localStorage.setItem("bina_marga_active_role", "user");
      } catch {}
      if (window.location.hash.toLowerCase().includes("admin")) {
        window.location.hash = "";
      }
      setCurrentPage(currentUser ? "beranda-after" : "beranda-before");
      return;
    }
    setCurrentPage(page);
  };

  const handleViewDetail = (asset) => {
    setSelectedDetailAsset(asset);
    setCurrentPage("detail-aset");
  };

  const handleBookingSuccess = async (bookingData) => {
    if (!bookingData || !bookingData.asset) {
      return;
    }

    if (!currentUser) {
      setNotice({
        type: "error",
        text: "Silakan login terlebih dahulu untuk mengajukan peminjaman.",
      });
      setCurrentPage("login");
      return;
    }

    const idAset = parseAssetDbId(bookingData.asset.id);

    if (idAset === null) {
      setNotice({
        type: "error",
        text: "Aset ini belum terdaftar di sistem dan tidak dapat dipinjam.",
      });
      return;
    }

    if (!bookingData.time || !bookingData.time.trim()) {
      setNotice({
        type: "error",
        text: "Silakan pilih waktu peminjaman terlebih dahulu.",
      });
      return;
    }

    const rawCat = bookingData.asset.category;
    const jenisAset =
      rawCat === "ruang" ? "Ruangan" : rawCat === "motor" ? "Motor" : "Mobil";

    try {
      await createLoan({
        jenis_aset: jenisAset,
        id_aset: idAset,
        tanggal_mulai: bookingData.startDate,
        tanggal_selesai: bookingData.endDate,
        jam_mulai: bookingData.time.trim(),
      });

      setNotice(null);
      setCurrentPage("pengajuan-terkirim");
    } catch (err) {
      setNotice({
        type: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Pengajuan peminjaman gagal diproses.",
      });
    }
  };

  const handleBackToUser = () => {
    try {
      localStorage.setItem("bina_marga_active_role", "user");
    } catch {}
    if (window.location.hash.toLowerCase().includes("admin")) {
      window.location.hash = "";
    }
    setCurrentPage(currentUser ? "beranda-after" : "beranda-before");
  };

  return (
    <div className="w-full min-h-screen flex-1 flex flex-col font-sans text-[#2c2c2c]">
      {/* Brand Splash Loading Screen with blinking/pulsating animation */}
      <LoadingScreen isLoading={isInitialLoading} minDuration={1000} />

      {/* Professional Cookie & Privacy Consent Banner */}
      <CookieConsent />

      {notice && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-4"
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-rose-400 hover:text-rose-700 font-black cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Page View Renderer */}
      <div className="flex-1 w-full flex flex-col">
        {currentPage === "beranda-before" && (
          <Beranda
            currentUser={null}
            onNavigate={handleNavigate}
            onOpenLogin={() => setCurrentPage("login")}
            onSelectCategory={(category) =>
              setCurrentPage(`peminjaman-${category.toLowerCase()}`)
            }
          />
        )}

        {currentPage === "beranda-after" && (
          <Beranda
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenLogin={() => setCurrentPage("login")}
            onSelectCategory={(category) =>
              setCurrentPage(`peminjaman-${category.toLowerCase()}`)
            }
          />
        )}

        {currentPage === "peminjaman-mobil" && (
          <PeminjamanAset
            category="mobil"
            onBack={() =>
              setCurrentPage(currentUser ? "beranda-after" : "beranda-before")
            }
            onSuccess={handleBookingSuccess}
            onViewDetail={handleViewDetail}
          />
        )}

        {currentPage === "peminjaman-motor" && (
          <PeminjamanAset
            category="motor"
            onBack={() =>
              setCurrentPage(currentUser ? "beranda-after" : "beranda-before")
            }
            onSuccess={handleBookingSuccess}
            onViewDetail={handleViewDetail}
          />
        )}

        {currentPage === "peminjaman-ruang" && (
          <PeminjamanAset
            category="ruang"
            onBack={() =>
              setCurrentPage(currentUser ? "beranda-after" : "beranda-before")
            }
            onSuccess={handleBookingSuccess}
            onViewDetail={handleViewDetail}
          />
        )}

        {currentPage === "detail-aset" && (
          <DetailAset
            asset={selectedDetailAsset}
            onBack={() =>
              setCurrentPage(
                `peminjaman-${selectedDetailAsset.category.toLowerCase()}`
              )
            }
            onSuccess={handleBookingSuccess}
          />
        )}

        {currentPage === "profile" && (
          <ProfileUser
            initialTab={profileInitialTab}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onUpdateUser={(updated) =>
              setCurrentUser((prev) => {
                const next = prev ? { ...prev, ...updated } : prev;
                try {
                  localStorage.setItem("bina_marga_current_user", JSON.stringify(next));
                } catch {}
                return next;
              })
            }
          />
        )}

        {currentPage === "admin-dashboard" && (
          <AdminApp
            initialPage="dashboard"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-kelola-mobil" && (
          <AdminApp
            initialPage="kelola-mobil"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-kelola-motor" && (
          <AdminApp
            initialPage="kelola-motor"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-kelola-ruangan" && (
          <AdminApp
            initialPage="kelola-ruangan"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-kelola-user" && (
          <AdminApp
            initialPage="kelola-user"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-peminjaman" && (
          <AdminApp
            initialPage="peminjaman-berjalan"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-pengaduan" && (
          <AdminApp
            initialPage="laporan-pengaduan"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-profile" && (
          <AdminApp
            initialPage="profile-admin"
            currentAdmin={currentAdmin}
            onBackToUser={handleBackToUser}
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage === "admin-login" && (
          <LoginAdmin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToUser={handleBackToUser}
          />
        )}

        {currentPage === "login" && (
          <LoginUser
            onSwitchToRegister={() => setCurrentPage("register")}
            onLoginSuccess={handleLoginSuccess}
            onSwitchToAdmin={() => setCurrentPage("admin-login")}
          />
        )}

        {currentPage === "register" && (
          <RegisterUser
            onSwitchToLogin={() => setCurrentPage("login")}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentPage === "tentang" && (
          <TentangKami onNavigate={handleNavigate} currentUser={currentUser} />
        )}

        {currentPage === "pengaduan" && (
          <Pengaduan onNavigate={handleNavigate} currentUser={currentUser} />
        )}

        {currentPage === "faq" && (
          <FAQ onNavigate={handleNavigate} currentUser={currentUser} />
        )}

        {currentPage === "pengajuan-terkirim" && (
          <PengajuanTerkirim
            onCheckStatus={() => {
              setProfileInitialTab("status");
              setCurrentPage("profile");
            }}
            onBackToHome={() =>
              setCurrentPage(currentUser ? "beranda-after" : "beranda-before")
            }
          />
        )}
      </div>
    </div>
  );
}
