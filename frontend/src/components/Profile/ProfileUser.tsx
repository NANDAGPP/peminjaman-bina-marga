import React, { useState, useEffect, useCallback } from "react";
import NavbarUser from "../NavbarUser/NavbarUser";
import { ApiError, cancelLoan, fetchLoans, returnLoan, updateUserAvatar, updateUserProfile } from "../../services/api";
import {
  EditAkunModal,
  PilihKarakterModal,
  BatalkanPinjamanModal,
  KembalikanBarangModal,
} from "./UserActionModals";
import { LogoutModal } from "../Admin/Modals/LogoutModal";

interface ProfileUserProps {
  currentUser?: {
    username?: string;
    nama?: string;
    nip?: string;
    no_hp?: string;
    foto?: string;
  } | null;
  onNavigate: (page: any) => void;
  onLogout?: () => void;
  onUpdateUser?: (updated: Partial<any>) => void;
  initialTab?: "profil" | "riwayat" | "status";
}

interface LoanHistoryItem {
  id_peminjaman: number;
  nama: string;
  jenis_aset: string;
  plat?: string;
  kode?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_pengajuan: string;
}

export const ProfileUser: React.FC<ProfileUserProps> = ({
  currentUser,
  onNavigate,
  onLogout,
  onUpdateUser,
  initialTab = "profil",
}) => {
  const [activeTab, setActiveTab] = useState<"profil" | "riwayat" | "status">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!currentUser) {
      onNavigate("login");
    }
  }, [currentUser, onNavigate]);

  const [loans, setLoans] = useState<LoanHistoryItem[]>([]);
  const [activeLoans, setActiveLoans] = useState<LoanHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const VALID_AVATARS = [
    "/images/avatar_wanita.png",
    "/images/avatar_pria.png",
    "/images/avatar_default.png",
  ];

  const [avatar, setAvatar] = useState<string>(() => {
    try {
      if (currentUser?.foto && VALID_AVATARS.includes(currentUser.foto)) {
        return currentUser.foto;
      }
      const userKey = currentUser?.username ? `bina_marga_user_avatar_${currentUser.username}` : "";
      if (userKey) {
        const savedUser = localStorage.getItem(userKey);
        if (savedUser && VALID_AVATARS.includes(savedUser)) return savedUser;
      }
      const saved = localStorage.getItem("bina_marga_user_avatar");
      if (saved && VALID_AVATARS.includes(saved)) return saved;
      return "/images/avatar_pria.png";
    } catch {
      return "/images/avatar_pria.png";
    }
  });

  useEffect(() => {
    if (currentUser?.foto && VALID_AVATARS.includes(currentUser.foto)) {
      setAvatar(currentUser.foto);
    }
  }, [currentUser?.foto]);

  const [phone, setPhone] = useState<string>(() => {
    try {
      const userKey = currentUser?.username ? `bina_marga_user_phone_${currentUser.username}` : "";
      if (userKey) {
        const savedPhone = localStorage.getItem(userKey);
        if (savedPhone) return savedPhone;
      }
      return currentUser?.no_hp || localStorage.getItem("bina_marga_user_phone") || "";
    } catch {
      return currentUser?.no_hp || "";
    }
  });

  useEffect(() => {
    if (currentUser?.no_hp) {
      setPhone(currentUser.no_hp);
    }
  }, [currentUser?.no_hp]);

  const [pilihKarakterOpen, setPilihKarakterOpen] = useState<boolean>(false);
  const [editAkunOpen, setEditAkunOpen] = useState<boolean>(false);
  const [batalkanOpen, setBatalkanOpen] = useState<boolean>(false);
  const [kembalikanOpen, setKembalikanOpen] = useState<boolean>(false);
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanHistoryItem | null>(null);

  const loadLoans = useCallback(async () => {
    setErrorMessage("");

    try {
      const { loans: rows } = await fetchLoans();
      const byStatus = (statuses: string[]) =>
        rows.filter((l: LoanHistoryItem) =>
          statuses.includes(String(l.status_pengajuan).toLowerCase())
        );

      const parseDateValue = (dateStr?: string, timeStr?: string): number => {
        if (!dateStr) return Infinity;
        const cleanDate = dateStr.trim();
        const cleanTime = (timeStr && timeStr.trim()) || "00:00";
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          const timeNorm = cleanTime.length === 5 ? cleanTime + ":00" : cleanTime;
          const t = new Date(`${cleanDate}T${timeNorm}`).getTime();
          if (!isNaN(t)) return t;
        }
        const t = new Date(cleanDate).getTime();
        if (!isNaN(t)) return t;
        return cleanDate.localeCompare("") || 0;
      };

      // Urutkan tanggal mulai yang paling mepet (terdekat / lebih awal) di paling atas
      const sortByNearestDate = (items: LoanHistoryItem[]) =>
        [...items].sort((a, b) => {
          const timeA = parseDateValue(a.tanggal_mulai, a.jam_mulai);
          const timeB = parseDateValue(b.tanggal_mulai, b.jam_mulai);
          if (timeA !== timeB) {
            return timeA - timeB;
          }
          return (a.id_peminjaman || 0) - (b.id_peminjaman || 0);
        });

      // Riwayat peminjaman: urutkan dari yang terbaru
      const sortByNewestHistory = (items: LoanHistoryItem[]) =>
        [...items].sort((a, b) => {
          const timeA = parseDateValue(a.tanggal_selesai || a.tanggal_mulai, a.jam_mulai);
          const timeB = parseDateValue(b.tanggal_selesai || b.tanggal_mulai, b.jam_mulai);
          if (timeA !== timeB) {
            return timeB - timeA;
          }
          return (b.id_peminjaman || 0) - (a.id_peminjaman || 0);
        });

      setLoans(sortByNewestHistory(byStatus(["dikembalikan", "dibatalkan", "ditolak"])));
      setActiveLoans(sortByNearestDate(byStatus(["diproses", "disetujui"])));
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memuat data peminjaman."
      );
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return "-";
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const formatSingle = (val?: string) => {
      if (!val) return "";
      if (val.includes(" ")) return val;
      const parts = val.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(monthIndex) && months[monthIndex]) {
          return `${day} ${months[monthIndex]} ${year}`;
        }
      }
      return val;
    };
    return `${formatSingle(start)} - ${formatSingle(end)}`;
  };

  const getStatusMeta = (status: string) => {
    const s = status.toLowerCase();
    if (s === "disetujui") {
      return {
        icon: "/images/terima.png",
        text: "Pengajuan Berhasil",
        action: "kembalikan",
      };
    }
    if (s === "ditolak") {
      return {
        icon: "/images/tolak.png",
        text: "Pengajuan Ditolak",
        action: "none",
      };
    }
    if (s === "dibatalkan") {
      return {
        icon: "/images/batal.png",
        text: "Pengajuan Dibatalkan",
        action: "none",
      };
    }
    if (s === "dikembalikan") {
      return {
        icon: "/images/dikembalikan.png",
        text: "Dikembalikan",
        action: "none",
      };
    }
    return {
      icon: "/images/diproses.png",
      text: "Sedang Diproses",
      action: "batalkan",
    };
  };

  const handleOpenCancelLoan = (loan: LoanHistoryItem) => {
    setSelectedLoan(loan);
    setBatalkanOpen(true);
  };

  const handleOpenReturnLoan = (loan: LoanHistoryItem) => {
    setSelectedLoan(loan);
    setKembalikanOpen(true);
  };

  const handleConfirmCancelLoan = async () => {
    if (!selectedLoan) return;

    try {
      await cancelLoan(selectedLoan.id_peminjaman);
      await loadLoans();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal membatalkan pengajuan."
      );
    }

    setBatalkanOpen(false);
    setSelectedLoan(null);
  };

  const handleConfirmReturnLoan = async () => {
    if (!selectedLoan) return;

    try {
      await returnLoan(selectedLoan.id_peminjaman);
      await loadLoans();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memproses pengembalian aset."
      );
    }

    setKembalikanOpen(false);
    setSelectedLoan(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#f4f5f7] flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center max-w-sm">
          <div className="w-10 h-10 border-4 border-[#071d63] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-bold mb-4">Memuat data profil...</p>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="px-6 py-2.5 rounded-xl bg-[#071d63] hover:bg-[#0a277e] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            Menuju Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 w-full bg-[#f4f5f7] flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63]">
      <div className="pt-4 px-4 sm:px-6">
        <NavbarUser activePage="profile" onNavigate={onNavigate} currentUser={currentUser} />
      </div>

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-[220px] flex flex-col justify-between self-stretch shrink-0">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200/80 flex flex-col gap-4">
            {/* Tab Profil */}
            <button
              type="button"
              onClick={() => setActiveTab("profil")}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-center text-base sm:text-lg transition-all cursor-pointer underline underline-offset-4 ${
                activeTab === "profil"
                  ? "bg-[#071d63] text-white shadow-sm"
                  : "bg-transparent text-[#071d63] hover:bg-gray-50"
              }`}
            >
              Profil
            </button>

            {/* Tab Riwayat */}
            <button
              type="button"
              onClick={() => setActiveTab("riwayat")}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-center text-base sm:text-lg transition-all cursor-pointer underline underline-offset-4 ${
                activeTab === "riwayat"
                  ? "bg-[#071d63] text-white shadow-sm"
                  : "bg-transparent text-[#071d63] hover:bg-gray-50"
              }`}
            >
              Riwayat
            </button>

            {/* Tab Status */}
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-center text-base sm:text-lg transition-all cursor-pointer underline underline-offset-4 ${
                activeTab === "status"
                  ? "bg-[#071d63] text-white shadow-sm"
                  : "bg-transparent text-[#071d63] hover:bg-gray-50"
              }`}
            >
              Status
            </button>
          </div>

          {/* Keluar Button */}
          <div className="mt-8 md:mt-auto pt-4">
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="w-full bg-[#ff0000] hover:bg-[#d90000] text-white font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer text-sm sm:text-base"
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

        {/* Right Main Content Card */}
        <section className="flex-1 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 w-full min-h-[540px]">
          {errorMessage && activeTab !== "profil" && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              {errorMessage}
            </p>
          )}

          {/* Tab Profil */}
          {activeTab === "profil" && (
            <div>
              {/* Header Banner */}
              <div className="w-full h-[190px] sm:h-[230px] rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-2xs">
                <img
                  src="/images/header_profil.png?v=3"
                  alt="Banner Gedung Dinas PU Bina Marga"
                  className="w-full h-full object-cover object-center pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/sepeda.png?v=3";
                  }}
                />
              </div>

              {/* Avatar & Edit Button Row */}
              <div className="flex items-end justify-between -mt-[68px] sm:-mt-[84px] mb-6 px-4 sm:px-6 relative z-10">
                <div className="relative">
                  <div
                    onClick={() => setPilihKarakterOpen(true)}
                    title="Klik untuk ubah karakter profil"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl sm:rounded-[28px] bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={`${avatar || "/images/avatar_default.png"}?v=4`}
                      alt="Avatar Karakter"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.target as any).src = "/images/avatar_default.png?v=4";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPilihKarakterOpen(true);
                    }}
                    title="Pilih Karakter Profil"
                    className="absolute bottom-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors z-20"
                  >
                    <img
                      src="/images/edit.png"
                      alt="Pilih Karakter"
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditAkunOpen(true)}
                  className="bg-[#fed000] hover:bg-[#eab308] text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm sm:text-base shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <img
                    src="/images/edit.png"
                    alt="Edit"
                    className="w-4 h-4 object-contain brightness-0 invert"
                  />
                  <span>Edit</span>
                </button>
              </div>

              {/* 4 Info Rows */}
              <div className="px-4 sm:px-6 pt-2">
                {/* Username */}
                <div className="grid grid-cols-12 items-center text-sm sm:text-base py-3.5 border-b border-gray-300">
                  <span className="col-span-3 sm:col-span-2 text-gray-800 font-medium shrink-0">
                    Username
                  </span>
                  <span className="col-span-1 text-gray-900 font-bold shrink-0 text-center">:</span>
                  <span className="col-span-8 sm:col-span-9 font-bold text-gray-950 truncate">
                    {currentUser?.nama || currentUser?.username || "-"}
                  </span>
                </div>

                {/* NIP */}
                <div className="grid grid-cols-12 items-center text-sm sm:text-base py-3.5 border-b border-gray-300">
                  <span className="col-span-3 sm:col-span-2 text-gray-800 font-medium shrink-0">
                    NIP
                  </span>
                  <span className="col-span-1 text-gray-900 font-bold shrink-0 text-center">:</span>
                  <span className="col-span-8 sm:col-span-9 font-bold text-gray-950 truncate">
                    {currentUser?.nip || "-"}
                  </span>
                </div>

                {/* No.Tlpn */}
                <div className="grid grid-cols-12 items-center text-sm sm:text-base py-3.5 border-b border-gray-300">
                  <span className="col-span-3 sm:col-span-2 text-gray-800 font-medium shrink-0">
                    No.Tlpn
                  </span>
                  <span className="col-span-1 text-gray-900 font-bold shrink-0 text-center">:</span>
                  <span className="col-span-8 sm:col-span-9 font-bold text-gray-950 truncate">
                    {phone || currentUser?.no_hp || "-"}
                  </span>
                </div>

                {/* Password */}
                <div className="grid grid-cols-12 items-center text-sm sm:text-base py-3.5 border-b border-gray-300">
                  <span className="col-span-3 sm:col-span-2 text-gray-800 font-medium shrink-0">
                    Password
                  </span>
                  <span className="col-span-1 text-gray-900 font-bold shrink-0 text-center">:</span>
                  <span className="col-span-8 sm:col-span-9 font-bold text-gray-950 tracking-widest text-base sm:text-lg">
                    **************
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Riwayat */}
          {activeTab === "riwayat" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-center tracking-wider text-[#1e293b] uppercase mb-4">
                - RIWAYAT PEMINJAMAN ANDA -
              </h2>
              {/* Split Dual-Color Bar */}
              <div className="w-full h-1 flex mb-8 rounded-full overflow-hidden">
                <div className="w-[18%] bg-[#fde047]"></div>
                <div className="flex-1 bg-[#071d63]"></div>
              </div>

              <div className="flex flex-col">
                {loans.map((item, idx) => (
                  <div key={item.id_peminjaman || idx}>
                    <div className="bg-[#071d63] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs">
                      <p className="text-sm sm:text-base text-gray-200">
                        {item.jenis_aset === "Mobil"
                          ? "Mobil Dinas"
                          : item.jenis_aset === "Motor"
                          ? "Motor Dinas"
                          : "Ruangan"}{" "}
                        - <strong className="text-white font-black tracking-wide uppercase">{item.nama}</strong>
                      </p>
                      <p className="text-sm sm:text-base text-gray-200 mt-2">
                        {item.jenis_aset === "Ruangan" ? "Kode Ruangan" : "Plat"} :{" "}
                        <strong className="text-white font-bold">{item.plat || item.kode || "-"}</strong>
                      </p>
                      <p className="text-sm sm:text-base text-gray-200 mt-2">
                        Tanggal Peminjaman :{" "}
                        <strong className="text-white font-bold">
                          {formatDateRange(item.tanggal_mulai, item.tanggal_selesai)}
                        </strong>
                      </p>
                    </div>
                    {/* Divider Line */}
                    <div className="w-full h-px bg-gray-300 my-6"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Status */}
          {activeTab === "status" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-center tracking-wider text-[#1e293b] uppercase mb-4">
                - LIHAT STATUS PEMINJAMAN AKTIF -
              </h2>
              {/* Split Dual-Color Bar */}
              <div className="w-full h-1 flex mb-5 rounded-full overflow-hidden">
                <div className="w-[18%] bg-[#fde047]"></div>
                <div className="flex-1 bg-[#071d63]"></div>
              </div>

              {/* Info Notice */}
              <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-4 px-2">
                <img
                  src="/images/info.png"
                  alt="Info"
                  className="w-4 h-4 object-contain opacity-70 shrink-0"
                />
                <span>Jika Peminjaman Anda telah disetujui. Silakan ambil aset sesuai jadwal.</span>
              </div>

              {/* Dark Navy Table Header Bar */}
              <div className="bg-[#071d63] text-white rounded-xl py-2.5 px-6 grid grid-cols-12 items-center mb-6 shadow-2xs">
                <div className="col-span-6 sm:col-span-7 font-bold text-sm sm:text-base">
                  Detail Data
                </div>
                <div className="col-span-3 sm:col-span-3 text-center font-bold text-sm sm:text-base">
                  Status
                </div>
                <div className="col-span-3 sm:col-span-2"></div>
              </div>

              {/* Status Loan Items */}
              <div className="flex flex-col">
                {activeLoans.map((item, idx) => {
                  const meta = getStatusMeta(item.status_pengajuan);
                  return (
                    <div key={item.id_peminjaman || idx}>
                      <div className="grid grid-cols-12 items-center px-2 sm:px-4 py-2 gap-2">
                        {/* Detail Data Column */}
                        <div className="col-span-6 sm:col-span-7 text-xs sm:text-sm text-gray-800 leading-relaxed">
                          <p>
                            {item.jenis_aset === "Mobil"
                              ? "Mobil Dinas"
                              : item.jenis_aset === "Motor"
                              ? "Motor Dinas"
                              : "Ruangan"}{" "}
                            - <strong className="text-gray-950 font-black tracking-wide uppercase">{item.nama}</strong>
                          </p>
                          <p className="mt-1.5">
                            {item.jenis_aset === "Ruangan" ? "Kode Ruangan" : "Plat"} :{" "}
                            <strong className="text-gray-950 font-bold">{item.plat || item.kode || "-"}</strong>
                          </p>
                          <p className="mt-1.5">
                            Tanggal Peminjaman :{" "}
                            <strong className="text-gray-950 font-bold">
                              {formatDateRange(item.tanggal_mulai, item.tanggal_selesai)}
                            </strong>
                          </p>
                        </div>

                        {/* Status Column */}
                        <div className="col-span-3 sm:col-span-3 flex flex-col items-center justify-center text-center">
                          <img
                            src={meta.icon}
                            alt={meta.text}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1.5"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                            {meta.text}
                          </span>
                        </div>

                        {/* Action Column */}
                        <div className="col-span-3 sm:col-span-2 flex justify-end items-center">
                          {meta.action === "batalkan" && (
                            <button
                              type="button"
                              onClick={() => handleOpenCancelLoan(item)}
                              className="bg-[#ff0000] hover:bg-[#d90000] text-white font-bold py-2 px-5 sm:px-6 rounded-xl text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                              Batalkan
                            </button>
                          )}
                          {meta.action === "kembalikan" && (
                            <button
                              type="button"
                              onClick={() => handleOpenReturnLoan(item)}
                              className="bg-[#071d63] hover:bg-[#0a277e] text-white font-bold py-2 px-4 sm:px-6 rounded-xl text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                              Pengembalian
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Divider Line */}
                      <div className="w-full h-px bg-gray-300 my-6"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Edit Akun Modal */}
      <EditAkunModal
        isOpen={editAkunOpen}
        initialPhone={phone}
        onClose={() => setEditAkunOpen(false)}
        onSave={async (data) => {
          setPhone(data.phone);
          try {
            if (currentUser?.username) {
              localStorage.setItem(`bina_marga_user_phone_${currentUser.username}`, data.phone);
            }
            localStorage.setItem("bina_marga_user_phone", data.phone);
            const res = await updateUserProfile({ phone: data.phone, password: data.password });
            if (onUpdateUser) {
              onUpdateUser(res.user || { no_hp: data.phone });
            }
          } catch (err) {
            console.error("Gagal simpan data akun:", err);
          }
          setEditAkunOpen(false);
        }}
      />

      {/* Pilih Karakter Profil Modal */}
      <PilihKarakterModal
        isOpen={pilihKarakterOpen}
        currentAvatar={avatar}
        onClose={() => setPilihKarakterOpen(false)}
        onSelect={async (newAvatar) => {
          setAvatar(newAvatar);
          try {
            if (currentUser?.username) {
              localStorage.setItem(`bina_marga_user_avatar_${currentUser.username}`, newAvatar);
            }
            localStorage.setItem("bina_marga_user_avatar", newAvatar);
            window.dispatchEvent(new Event("avatarChanged"));
            await updateUserAvatar(newAvatar);
            if (onUpdateUser) {
              onUpdateUser({ foto: newAvatar });
            }
          } catch (err) {
            console.error("Gagal simpan avatar:", err);
          }
        }}
      />

      {/* Modal Batalkan Pinjaman */}
      <BatalkanPinjamanModal
        isOpen={batalkanOpen}
        onConfirm={handleConfirmCancelLoan}
        onClose={() => {
          setBatalkanOpen(false);
          setSelectedLoan(null);
        }}
      />

      {/* Modal Kembalikan Barang */}
      <KembalikanBarangModal
        isOpen={kembalikanOpen}
        onConfirm={handleConfirmReturnLoan}
        onClose={() => {
          setKembalikanOpen(false);
          setSelectedLoan(null);
        }}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutOpen}
        onConfirm={async () => {
          setLogoutOpen(false);
          if (onLogout) {
            await onLogout();
          } else {
            onNavigate("beranda");
          }
        }}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
};
