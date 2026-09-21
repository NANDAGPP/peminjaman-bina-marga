import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import { ActionConfirmModal } from "./Modals/ActionConfirmModal";
import { LaporanPengaduanModal } from "./Modals/LaporanPengaduanModal";
import { AdminPagination } from "./Common/AdminPagination";
import {
  ApiError,
  deletePengaduan,
  fetchPengaduan,
  updatePengaduanStatus,
} from "../../services/api";

interface AdminPengaduanProps {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

interface PengaduanItem {
  id: number;
  nama: string;
  nip: string;
  keluhan: string;
  status: string;
  tanggal?: string;
}

const getStatusSelectStyle = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "disetujui") return "bg-[#09db22] text-white";
  if (s === "ditolak") return "bg-[#ff0000] text-white";
  if (s === "diproses") return "bg-[#071d63] text-white";
  if (s === "selesai") return "bg-[#071d63] text-white";
  return "bg-[#5c5c5c] text-white";
};

export const AdminPengaduan: React.FC<AdminPengaduanProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [reports, setReports] = useState<PengaduanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<PengaduanItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<PengaduanItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReports = reports.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetchPengaduan();
      setReports(
        response.data.map((item: any) => ({
          id: Number(item.id_pengaduan ?? item.id),
          nama: item.nama,
          nip: item.nip,
          keluhan: item.keluhan,
          status: item.status || "Belum",
          tanggal: item.tanggal,
        }))
      );
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memuat laporan pengaduan."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSelectStatus = async (id: number, newStatus: string) => {
    const target = reports.find((r) => r.id === id);
    if (!target || target.status === newStatus) return;

    setErrorMessage("");
    setIsUpdatingStatus(id);

    try {
      await updatePengaduanStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memperbarui status pengaduan."
      );
      await loadReports();
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDownloadReport = (item: PengaduanItem) => {
    setPreviewItem(item);
    setPreviewModalOpen(true);
  };

  const handleOpenDelete = (item: PengaduanItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setErrorMessage("");

    try {
      await deletePengaduan(itemToDelete.id);
      await loadReports();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal menghapus laporan pengaduan."
      );
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <AdminLayout
      activePage="laporan-pengaduan"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {/* Table Container Card */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs p-6 pb-28 min-h-[500px]">
          {errorMessage && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              {errorMessage}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
              <thead>
                <tr className="text-black font-extrabold pb-4">
                  <th className="py-4 px-4 w-16"></th>
                  <th className="py-4 px-6 font-bold text-black text-sm">Nama</th>
                  <th className="py-4 px-6 font-bold text-black text-sm">NIP</th>
                  <th className="py-4 px-6 font-bold text-black text-sm">Keluhan</th>
                  <th className="py-4 px-6 font-bold text-black text-sm">Status</th>
                  <th className="py-4 px-4 text-center w-28"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((item, idx) => {
                  const itemNumber = (validCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50/70 transition-colors">
                        {/* Number */}
                        <td className="py-5 px-4 font-extrabold text-black text-sm">
                          {String(itemNumber).padStart(2, "0")}.
                        </td>

                        {/* Nama */}
                        <td className="py-5 px-6 font-medium text-gray-900 text-sm">
                          {item.nama}
                        </td>

                        {/* NIP */}
                        <td className="py-5 px-6 font-medium text-gray-800 text-sm">
                          {item.nip}
                        </td>

                        {/* Keluhan */}
                        <td className="py-5 px-6 font-medium text-gray-800 text-sm">
                          {item.keluhan}
                        </td>

                        {/* Status Select */}
                        <td className="py-5 px-6">
                          <div className="relative inline-flex items-center">
                            <select
                              value={item.status}
                              disabled={isUpdatingStatus === item.id}
                              onChange={(e) =>
                                handleSelectStatus(item.id, e.target.value)
                              }
                              className={`appearance-none font-bold text-xs px-3.5 py-1.5 pr-7 rounded-xl cursor-pointer transition-all shadow-2xs border-0 outline-none text-center select-none ${getStatusSelectStyle(
                                item.status
                              )}`}
                              title="Ubah status pengaduan"
                            >
                              <option value="Belum" className="bg-white text-gray-800 font-semibold py-1">
                                Belum
                              </option>
                              <option value="Diproses" className="bg-white text-gray-800 font-semibold py-1">
                                Diproses
                              </option>
                              <option value="Disetujui" className="bg-white text-gray-800 font-semibold py-1">
                                Disetujui
                              </option>
                              <option value="Ditolak" className="bg-white text-gray-800 font-semibold py-1">
                                Ditolak
                              </option>
                              <option value="Selesai" className="bg-white text-gray-800 font-semibold py-1">
                                Selesai
                              </option>
                            </select>
                            {/* White dropdown arrow */}
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white flex items-center">
                              {isUpdatingStatus === item.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Icons: Navy Download Tray + Red Trash Can */}
                        <td className="py-5 px-4">
                          <div className="flex items-center justify-end gap-3.5">
                            {/* Navy Download Tray Icon */}
                            <button
                              type="button"
                              onClick={() => handleDownloadReport(item)}
                              title="Unduh / Cetak Laporan"
                              className="w-7 h-7 rounded-md bg-[#071d63] hover:bg-[#0b2984] flex items-center justify-center text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            </button>

                            {/* Red Trash Can Icon */}
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              title="Hapus Laporan"
                              className="hover:opacity-80 transition-opacity cursor-pointer p-0.5"
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

                      {/* Decorative Line Divider */}
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="w-full h-px bg-gray-300 relative my-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 absolute -left-1 -top-[3.5px]"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 absolute -right-1 -top-[3.5px]"></div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {isLoading && (
              <div className="py-16 text-center text-gray-400 text-xs">
                Memuat laporan pengaduan...
              </div>
            )}

            {!isLoading && reports.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-xs">
                Belum ada laporan pengaduan masuk.
              </div>
            )}

            {reports.length > 0 && (
              <AdminPagination
                currentPage={validCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Laporan */}
      <ActionConfirmModal
        isOpen={deleteModalOpen}
        type="hapus"
        title="Hapus Laporan Pengaduan"
        message={`Apakah Anda yakin ingin menghapus laporan pengaduan dari ${itemToDelete?.nama}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

      {/* Official Letterhead Report Modal */}
      <LaporanPengaduanModal
        isOpen={previewModalOpen}
        item={previewItem}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewItem(null);
        }}
      />
    </AdminLayout>
  );
};
