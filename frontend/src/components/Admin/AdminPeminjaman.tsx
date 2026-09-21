import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import { ActionConfirmModal } from "./Modals/ActionConfirmModal";
import { TolakReasonModal } from "./Modals/TolakReasonModal";
import { AdminPagination } from "./Common/AdminPagination";
import { ApiError, deleteLoan, fetchLoans, updateLoanStatus } from "../../services/api";

import { ASSETS_DATA } from "../Peminjaman/assetData";

interface AdminPeminjamanProps {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

type JenisAset = "Mobil" | "Motor" | "Ruangan";

interface LoanItem {
  id_peminjaman: number;
  namaAset: string;
  kodeAset: string;
  tipeAset: string;
  tahunAset: string;
  jenisAset: JenisAset;
  gambar: string;
  status: string;
  tanggal_mulai?: string;
  jam_mulai?: string;
}

const GAMBAR_DEFAULT: Record<JenisAset, string> = {
  Mobil: "/images/gclass.png",
  Motor: "/images/pcx.png",
  Ruangan: "/images/rapatb.png",
};

function normalizeJenis(value: string): JenisAset {
  const jenis = String(value || "").toLowerCase();

  if (jenis === "motor") return "Motor";
  if (jenis === "ruang" || jenis === "ruangan") return "Ruangan";

  return "Mobil";
}

function resolveAssetImage(row: any, jenisAset: JenisAset): string {
  if (row.gambar && typeof row.gambar === "string" && row.gambar.trim() !== "") {
    const raw = row.gambar.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
      return raw;
    }
    return "/" + raw.replace(/^\/+/, "");
  }

  const namaClean = String(row.nama || "").toLowerCase().trim();
  const platClean = String(row.plat || "").toLowerCase().trim();
  const tipeClean = String(row.tipe || "").toLowerCase().trim();
  const categoryClean = jenisAset === "Ruangan" ? "ruang" : jenisAset.toLowerCase();

  const matched = ASSETS_DATA.find((a) => {
    if (a.category !== categoryClean) return false;
    const aName = a.name.toLowerCase().trim();
    const aCode = a.code.toLowerCase().trim();
    const aTipe = (a.tipe || "").toLowerCase().trim();

    if (namaClean && (aName === namaClean || namaClean.includes(aName) || aName.includes(namaClean))) {
      return true;
    }
    if (platClean && platClean !== "-" && (aCode === platClean || platClean.includes(aCode))) {
      return true;
    }
    if (tipeClean && tipeClean !== "-" && (aTipe === tipeClean || tipeClean.includes(aTipe))) {
      return true;
    }
    return false;
  });

  if (matched && matched.image) {
    return matched.image;
  }

  return GAMBAR_DEFAULT[jenisAset];
}

function resolveAssetYear(row: any, jenisAset: JenisAset): string {
  if (row.tahun && String(row.tahun).trim() !== "" && String(row.tahun) !== "-") {
    return String(row.tahun);
  }
  if (row.kapasitas && String(row.kapasitas).trim() !== "" && String(row.kapasitas) !== "-") {
    return String(row.kapasitas);
  }

  const namaClean = String(row.nama || "").toLowerCase().trim();
  const categoryClean = jenisAset === "Ruangan" ? "ruang" : jenisAset.toLowerCase();

  const matched = ASSETS_DATA.find(
    (a) => a.category === categoryClean && (a.name.toLowerCase().includes(namaClean) || namaClean.includes(a.name.toLowerCase()))
  );

  if (matched) {
    if (jenisAset === "Ruangan" && matched.capacity) {
      return matched.capacity;
    }
    if (matched.tahun) {
      return matched.tahun;
    }
  }

  return "-";
}

function resolveAssetPlate(row: any, jenisAset: JenisAset): string {
  const raw = String(row.plat || row.kode || "").trim();
  const rawUpper = raw.toUpperCase();

  const isInvalidPlate =
    !raw ||
    raw === "-" ||
    rawUpper === "MOTOR" ||
    rawUpper === "MOBIL" ||
    rawUpper === "RUANG" ||
    rawUpper === "RUANGAN";

  if (!isInvalidPlate) {
    return raw;
  }

  const namaClean = String(row.nama || "").toLowerCase().trim();
  const tipeClean = String(row.tipe || "").toLowerCase().trim();
  const categoryClean = jenisAset === "Ruangan" ? "ruang" : jenisAset.toLowerCase();

  const matched = ASSETS_DATA.find((a) => {
    if (a.category !== categoryClean) return false;
    const aName = a.name.toLowerCase().trim();
    const aTipe = (a.tipe || "").toLowerCase().trim();

    if (namaClean && (aName === namaClean || namaClean.includes(aName) || aName.includes(namaClean))) {
      return true;
    }
    if (tipeClean && tipeClean !== "-" && (aTipe === tipeClean || tipeClean.includes(aTipe))) {
      return true;
    }
    return false;
  });

  if (matched && matched.code && matched.code.toUpperCase() !== "MOTOR") {
    return matched.code;
  }

  if (namaClean.includes("nmax")) {
    return "L 5821 BM";
  }

  return raw || "-";
}

/**
 * Ubah satu baris peminjaman dari API menjadi bentuk yang dipakai tabel.
 */
function toLoanItem(row: any): LoanItem {
  const jenisAset = normalizeJenis(row.jenis_aset);
  const gambar = resolveAssetImage(row, jenisAset);
  const tahunAset = resolveAssetYear(row, jenisAset);
  const kodeAset = resolveAssetPlate(row, jenisAset);

  return {
    id_peminjaman: Number(row.id_peminjaman),
    namaAset: row.nama || "Aset Dinas",
    kodeAset,
    tipeAset: row.tipe || row.lantai || "-",
    tahunAset,
    jenisAset,
    gambar,
    status: row.status_pengajuan || "Diproses",
    tanggal_mulai: row.tanggal_mulai,
    jam_mulai: row.jam_mulai,
  };
}

export const AdminPeminjaman: React.FC<AdminPeminjamanProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"Mobil" | "Motor" | "Ruangan">(
    "Mobil"
  );
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [accModalOpen, setAccModalOpen] = useState<boolean>(false);
  const [tolakModalOpen, setTolakModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LoanItem | null>(null);

  const loadLoans = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchLoans();
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

      const mapped = (data?.loans || []).map(toLoanItem);
      const sorted = [...mapped].sort((a, b) => {
        const priority = (s: string) => {
          const st = s.toLowerCase();
          if (st === "diproses") return 0;
          if (st === "disetujui") return 1;
          return 2;
        };
        const pA = priority(a.status);
        const pB = priority(b.status);
        if (pA !== pB) return pA - pB;

        const timeA = parseDateValue(a.tanggal_mulai, a.jam_mulai);
        const timeB = parseDateValue(b.tanggal_mulai, b.jam_mulai);
        if (timeA !== timeB) return timeA - timeB;

        return (a.id_peminjaman || 0) - (b.id_peminjaman || 0);
      });

      setLoans(sorted);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memuat data peminjaman."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredLoans = loans.filter((l) => l.jenisAset === activeTab);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLoans = filteredLoans.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  const applyStatusChange = async (id: number, status: string, alasan = "") => {
    setErrorMessage("");

    try {
      await updateLoanStatus(id, status, alasan);
      await loadLoans();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memperbarui status peminjaman."
      );
    }
  };

  const handleOpenAcc = (loan: LoanItem) => {
    setSelectedLoan(loan);
    setAccModalOpen(true);
  };

  const handleOpenTolak = (loan: LoanItem) => {
    setSelectedLoan(loan);
    setTolakModalOpen(true);
  };

  const handleOpenDelete = (loan: LoanItem) => {
    setItemToDelete(loan);
    setDeleteModalOpen(true);
  };

  const handleConfirmAcc = async () => {
    if (!selectedLoan) return;

    await applyStatusChange(selectedLoan.id_peminjaman, "Disetujui");
    setAccModalOpen(false);
    setSelectedLoan(null);
  };

  const handleConfirmTolak = async (reason: string) => {
    if (!selectedLoan) return;

    await applyStatusChange(selectedLoan.id_peminjaman, "Ditolak", reason);
    setTolakModalOpen(false);
    setSelectedLoan(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setErrorMessage("");

    try {
      await deleteLoan(itemToDelete.id_peminjaman);
      await loadLoans();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal menghapus data peminjaman."
      );
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const renderStatusBadge = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "disetujui") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#00d02b] text-white shadow-2xs">
          Disetujui
        </span>
      );
    }
    if (s === "ditolak") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#ff0000] text-white shadow-2xs">
          Ditolak
        </span>
      );
    }
    if (s === "dikembalikan") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#071d63] text-white shadow-2xs">
          Dikembalikan
        </span>
      );
    }
    if (s === "dibatalkan") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-2xs">
          Dibatalkan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#fed000] text-[#071d63] shadow-2xs">
        Diproses
      </span>
    );
  };

  return (
    <AdminLayout
      activePage="peminjaman-berjalan"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {/* Table Container Card */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs p-6 pb-28 min-h-[500px]">
          {/* Category Filter Tabs: Mobil, Motor, Ruangan */}
          <div className="flex items-center gap-5 mb-8">
            {(["Mobil", "Motor", "Ruangan"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`min-w-[160px] py-3 px-8 rounded-2xl font-extrabold text-base sm:text-lg text-center transition-all cursor-pointer shadow-xs ${isActive
                      ? "bg-[#071d63] text-white"
                      : "bg-white border-2 border-[#071d63] text-[#071d63] hover:bg-gray-50"
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              {errorMessage}
            </p>
          )}

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-black text-black font-extrabold pb-3">
                  <th className="py-3 px-3 w-36"></th>
                  <th className="py-3 px-4 font-bold text-black text-sm">Nama</th>
                  <th className="py-3 px-4 font-bold text-black text-sm">
                    {activeTab === "Ruangan" ? "Kode" : "Plat"}
                  </th>
                  <th className="py-3 px-4 font-bold text-black text-sm">
                    {activeTab === "Ruangan" ? "Lantai" : "Tipe"}
                  </th>
                  <th className="py-3 px-4 font-bold text-black text-sm">
                    {activeTab === "Ruangan" ? "Kapasitas" : "Tahun"}
                  </th>
                  <th className="py-3 px-4 font-bold text-black text-sm">Status</th>
                  <th className="py-3 px-4 text-center w-28"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedLoans.map((item, idx) => {
                  const isDiproses = item.status.toLowerCase() === "diproses";
                  const itemNumber = (validCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  return (
                    <tr
                      key={item.id_peminjaman}
                      className="border-b border-black hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Number + Vehicle Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-black text-sm">
                            {String(itemNumber).padStart(2, "0")}.
                          </span>
                          <div className="w-16 h-10 flex items-center justify-center">
                            <img
                              src={item.gambar}
                              alt={item.namaAset}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  item.jenisAset === "Motor"
                                    ? "/images/pcx.png"
                                    : item.jenisAset === "Ruangan"
                                      ? "/images/rapatb.png"
                                      : "/images/gclass.png";
                              }}
                              className="max-h-full max-w-full object-contain pointer-events-none"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Nama */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 uppercase">
                        {item.namaAset}
                      </td>

                      {/* Plat / Kode */}
                      <td className="py-3.5 px-4 font-medium text-gray-800 uppercase">
                        {item.kodeAset}
                      </td>

                      {/* Tipe / Lantai */}
                      <td className="py-3.5 px-4 font-medium text-gray-800 uppercase max-w-[220px]">
                        {item.tipeAset}
                      </td>

                      {/* Tahun / Kapasitas */}
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {item.tahunAset}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2.5">
                          {isDiproses && (
                            <>
                              {/* Tombol Tolak */}
                              <button
                                type="button"
                                onClick={() => handleOpenTolak(item)}
                                title="Tolak Peminjaman"
                                className="hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                              >
                                <img
                                  src="/images/tolak.png"
                                  alt="Tolak"
                                  className="w-7 h-7 object-contain"
                                />
                              </button>

                              {/* Tombol Setujui */}
                              <button
                                type="button"
                                onClick={() => handleOpenAcc(item)}
                                title="Setujui Peminjaman"
                                className="hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                              >
                                <img
                                  src="/images/terima.png"
                                  alt="Setujui"
                                  className="w-7 h-7 object-contain"
                                />
                              </button>
                            </>
                          )}

                          {/* Tombol Hapus Record Peminjaman */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Data Peminjaman"
                            className="hover:opacity-80 transition-opacity cursor-pointer p-1"
                          >
                            <img
                              src="/images/hapus.png"
                              alt="Hapus"
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as any).src = "/images/hapusfile.png";
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {isLoading && (
              <div className="py-16 text-center text-gray-400 text-xs">
                Memuat data peminjaman...
              </div>
            )}

            {!isLoading && filteredLoans.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-xs">
                Tidak ada data peminjaman berjalan untuk kategori {activeTab}.
              </div>
            )}

            {!isLoading && filteredLoans.length > 0 && (
              <AdminPagination
                currentPage={validCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Persetujuan */}
      <ActionConfirmModal
        isOpen={accModalOpen}
        type="setujui"
        title="Persetujuan Peminjaman"
        message={`Apakah Anda yakin ingin menyetujui peminjaman untuk unit ${selectedLoan?.namaAset} (${selectedLoan?.kodeAset})?`}
        onConfirm={handleConfirmAcc}
        onClose={() => setAccModalOpen(false)}
      />

      {/* Modal Alasan Penolakan */}
      <TolakReasonModal
        isOpen={tolakModalOpen}
        title="Penolakan Peminjaman"
        message={`Berikan keterangan alasan penolakan peminjaman unit ${selectedLoan?.namaAset}:`}
        onConfirm={handleConfirmTolak}
        onClose={() => setTolakModalOpen(false)}
      />

      {/* Modal Konfirmasi Hapus Data Peminjaman */}
      <ActionConfirmModal
        isOpen={deleteModalOpen}
        type="hapus"
        title="Hapus Data Peminjaman"
        message={`Apakah Anda yakin ingin menghapus data peminjaman unit "${itemToDelete?.namaAset}" (${itemToDelete?.kodeAset})?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </AdminLayout>
  );
};
