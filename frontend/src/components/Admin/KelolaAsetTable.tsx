import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import {
  Asset,
  fetchDynamicAssets,
  addStoredAsset,
  updateStoredAsset,
  deleteStoredAsset,
} from "../Peminjaman/assetData";
import { createAsset, updateAsset, deleteAsset } from "../../services/api";
import { AssetFormModal, AssetFormData } from "./Modals/AssetFormModal";
import { ActionConfirmModal } from "./Modals/ActionConfirmModal";
import { AdminPagination } from "./Common/AdminPagination";

interface KelolaAsetTableProps {
  kategori: "mobil" | "motor" | "ruang";
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export const KelolaAsetTable: React.FC<KelolaAsetTableProps> = ({
  kategori,
  onNavigate,
  onLogout,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Asset | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<Asset | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  const getPageConfig = () => {
    switch (kategori) {
      case "mobil":
        return {
          title: "KELOLA MOBIL",
          activePage: "kelola-mobil" as AdminPage,
          codeLabel: "Plat",
          typeLabel: "Tipe",
          yearLabel: "Tahun",
        };
      case "motor":
        return {
          title: "KELOLA MOTOR",
          activePage: "kelola-motor" as AdminPage,
          codeLabel: "Plat",
          typeLabel: "Tipe",
          yearLabel: "Tahun",
        };
      case "ruang":
        return {
          title: "KELOLA RUANGAN",
          activePage: "kelola-ruangan" as AdminPage,
          codeLabel: "Kode",
          typeLabel: "Lantai",
          yearLabel: "Kapasitas",
        };
    }
  };

  const config = getPageConfig();

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await fetchDynamicAssets();
      const filtered = all.filter((a) => a.category === kategori);
      setAssets(filtered);
    } catch (e) {
      console.warn("Failed to load dynamic assets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("assetsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("assetsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [kategori]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: Asset) => {
    setIsEdit(true);
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleOpenDelete = (item: Asset) => {
    setItemToDelete(item);
    setDeleteOpen(true);
  };

  const handleSaveData = async (data: AssetFormData) => {
    if (isEdit && selectedItem) {
      const updatedItem: Asset = {
        ...selectedItem,
        name: data.nama,
        code: data.kodePlat,
        capacity: kategori === "ruang" ? data.kapasitas : selectedItem.capacity,
        tipe: kategori === "ruang" ? selectedItem.tipe : data.tipe,
        lantai: kategori === "ruang" ? data.tahunLantai : selectedItem.lantai,
        tahun: kategori !== "ruang" ? data.tahunLantai : selectedItem.tahun,
        status: (data.status === "Status" ? "tersedia" : data.status.toLowerCase()) as any,
        image: data.gambar || selectedItem.image,
      };

      try {
        await updateAsset({
          id: selectedItem.id,
          category: kategori,
          name: data.nama,
          code: data.kodePlat,
          tipe: data.tipe,
          lantai: kategori === "ruang" ? data.tahunLantai : undefined,
          tahun: kategori !== "ruang" ? data.tahunLantai : undefined,
          capacity: data.kapasitas,
          status: data.status === "Status" ? "Tersedia" : data.status,
          image: data.gambar || selectedItem.image,
        });
      } catch (e) {
        console.warn("Failed to update asset in backend:", e);
      }

      updateStoredAsset(updatedItem);
      setAssets((prev) =>
        prev.map((a) => (a.id === selectedItem.id ? updatedItem : a))
      );
    } else {
      let assignedId = kategori === "ruang" ? `r-${Date.now()}` : `k-${Date.now()}`;
      try {
        const res = await createAsset({
          category: kategori,
          name: data.nama,
          code: data.kodePlat,
          tipe: kategori === "ruang" ? "Ruang Dinas" : data.tipe,
          lantai: kategori === "ruang" ? data.tahunLantai : undefined,
          tahun: kategori !== "ruang" ? data.tahunLantai : "2024",
          capacity: kategori === "ruang" ? data.kapasitas : "5 Orang",
          status: data.status === "Status" ? "Tersedia" : data.status,
          image:
            data.gambar ||
            (kategori === "ruang"
              ? "/images/aula.png"
              : kategori === "motor"
              ? "/images/nmax.png"
              : "/images/porsche.png"),
        });
        if (res && res.id) {
          assignedId = res.id;
        }
      } catch (e) {
        console.warn("Failed to create asset in backend:", e);
      }

      const newAsset: Asset = {
        id: assignedId,
        name: data.nama,
        category: kategori,
        code: data.kodePlat,
        capacity: kategori === "ruang" ? data.kapasitas : "5 Orang",
        tipe: kategori === "ruang" ? "Ruang Dinas" : data.tipe,
        lantai: kategori === "ruang" ? data.tahunLantai : undefined,
        tahun: kategori !== "ruang" ? data.tahunLantai : "2024",
        status: (data.status === "Status" ? "tersedia" : data.status.toLowerCase()) as any,
        image:
          data.gambar ||
          (kategori === "ruang"
            ? "/images/aula.png"
            : kategori === "motor"
            ? "/images/nmax.png"
            : "/images/porsche.png"),
      };

      addStoredAsset(newAsset);
      setAssets((prev) => [newAsset, ...prev]);
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteAsset(itemToDelete.id);
      } catch (e) {
        console.warn("Failed to delete asset in backend:", e);
      }
      deleteStoredAsset(itemToDelete.id);
      setAssets((prev) => prev.filter((a) => a.id !== itemToDelete.id));
      setDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateStatus = async (assetId: string, newStatus: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (target) {
      const normalizedStatus = (newStatus === "status" ? "tersedia" : newStatus.toLowerCase()) as any;
      const statusTitle =
        newStatus === "status"
          ? "Tersedia"
          : newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      const updated = {
        ...target,
        status: normalizedStatus,
      };

      try {
        await updateAsset({
          id: assetId,
          category: kategori,
          name: target.name,
          code: target.code,
          status: statusTitle,
        });
      } catch (e) {
        console.warn("Failed to update status in backend:", e);
      }

      updateStoredAsset(updated);
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? updated : a))
      );
    }
    setStatusDropdownOpen(null);
  };

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(assets.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedAssets = assets.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout
      activePage={config.activePage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {/* Table Container Card */}
        <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] border border-gray-200/90 shadow-[0_6px_25px_rgba(0,0,0,0.04)] overflow-hidden pb-24 min-h-[540px]">
          {loading ? (
            <div className="py-24 text-center text-gray-400 text-sm">
              Memuat data inventaris...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    {/* Column 1: Yellow "+ Tambah" Button */}
                    <th className="py-4 sm:py-5 px-6 sm:px-8 w-[210px]">
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none block"
                        title="Tambah"
                      >
                        <img
                          src="/images/btn_tambah.png"
                          alt="Tambah"
                          className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs"
                        />
                      </button>
                    </th>
                    <th className="py-4 sm:py-5 px-4 font-black text-gray-900 text-sm sm:text-base tracking-tight w-[140px]">
                      Nama
                    </th>
                    <th className="py-4 sm:py-5 px-4 font-black text-gray-900 text-sm sm:text-base tracking-tight w-[140px]">
                      {config.codeLabel}
                    </th>
                    <th className="py-4 sm:py-5 px-4 font-black text-gray-900 text-sm sm:text-base tracking-tight w-[220px]">
                      {config.typeLabel}
                    </th>
                    <th className="py-4 sm:py-5 px-4 font-black text-gray-900 text-sm sm:text-base tracking-tight w-[110px]">
                      {config.yearLabel}
                    </th>
                    <th className="py-4 sm:py-5 px-4 font-black text-gray-900 text-sm sm:text-base tracking-tight w-[130px]">
                      Status
                    </th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-right w-[120px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.map((item, idx) => {
                    const itemNumber = (validCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-300 hover:bg-[#f8fafd]/80 transition-colors"
                      >
                        {/* Number + Thumbnail */}
                        <td className="py-4 sm:py-5 px-6 sm:px-8">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="font-black text-gray-900 text-sm sm:text-base shrink-0 w-8">
                              {String(itemNumber).padStart(2, "0")}.
                            </span>
                          <div className="w-20 sm:w-24 h-11 sm:h-12 flex items-center justify-center shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  kategori === "ruang"
                                    ? "/images/aula.png"
                                    : kategori === "motor"
                                      ? "/images/nmax.png"
                                      : "/images/porsche.png";
                              }}
                              className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-xs"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Nama */}
                      <td className="py-4 sm:py-5 px-4 font-bold text-gray-800 text-sm sm:text-[15px] uppercase tracking-wide">
                        {item.name}
                      </td>

                      {/* Plat / Kode */}
                      <td className="py-4 sm:py-5 px-4 font-medium text-gray-700 text-sm sm:text-[14px] uppercase tracking-wider">
                        {item.code}
                      </td>

                      {/* Tipe / Lantai */}
                      <td className="py-4 sm:py-5 px-4 font-medium text-gray-700 text-xs sm:text-[13px] uppercase tracking-tight max-w-[220px] leading-snug">
                        {item.tipe || item.lantai || (kategori === "ruang" ? "Ruang Dinas" : "Kendaraan Dinas")}
                      </td>

                      {/* Tahun / Kapasitas */}
                      <td className="py-4 sm:py-5 px-4 font-medium text-gray-700 text-sm sm:text-[14px]">
                        {kategori === "ruang" ? item.capacity : (item.tahun || "2024")}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 sm:py-5 px-4">
                        {(() => {
                          const isBottomRow =
                            idx >= 3 ||
                            (paginatedAssets.length > 2 &&
                              idx >= paginatedAssets.length - 2);

                          return (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setStatusDropdownOpen(
                                    statusDropdownOpen === item.id ? null : item.id
                                  )
                                }
                                className="inline-flex items-center justify-between w-[124px] px-3.5 py-1.5 rounded-full text-xs font-black text-white shadow-2xs transition-all cursor-pointer hover:brightness-105 active:scale-95 select-none"
                                style={{
                                  backgroundColor:
                                    item.status === "tersedia"
                                      ? "#00d02b"
                                      : item.status === "dipinjam"
                                      ? "#ff0000"
                                      : item.status === "maintenance"
                                      ? "#071d63"
                                      : "#6b7280",
                                }}
                                title="Klik untuk ubah status"
                              >
                                <span className="capitalize tracking-wide">
                                  {item.status ? item.status : "Status"}
                                </span>
                                <svg
                                  className={`w-3.5 h-3.5 text-white/95 shrink-0 transition-transform duration-150 ${
                                    statusDropdownOpen === item.id ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {/* Dropdown Menu with Backdrop */}
                              {statusDropdownOpen === item.id && (
                                <>
                                  {/* Click outside backdrop */}
                                  <div
                                    className="fixed inset-0 z-30 cursor-default"
                                    onClick={() => setStatusDropdownOpen(null)}
                                  />
                                  <div
                                    className={`absolute left-0 z-40 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-gray-100 p-2 flex flex-col gap-1.5 w-[142px] animate-in fade-in zoom-in-95 duration-150 ${
                                      isBottomRow ? "bottom-full mb-2" : "top-full mt-2"
                                    }`}
                                  >
                                    <div className="px-2 py-0.5 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                      Ubah Status
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateStatus(item.id, "tersedia");
                                        setStatusDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#00d02b] hover:bg-[#00ba26] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                                    >
                                      <span>Tersedia</span>
                                      {item.status === "tersedia" && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateStatus(item.id, "dipinjam");
                                        setStatusDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#ff0000] hover:bg-[#e00000] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                                    >
                                      <span>Dipinjam</span>
                                      {item.status === "dipinjam" && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateStatus(item.id, "maintenance");
                                        setStatusDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#071d63] hover:bg-[#0b2984] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                                    >
                                      <span>Maintenance</span>
                                      {item.status === "maintenance" && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Aksi Edit & Hapus */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8">
                        <div className="flex items-center justify-end gap-3.5 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data"
                            className="hover:scale-115 active:scale-95 transition-transform cursor-pointer p-1"
                          >
                            <img
                              src="/images/editfile.png"
                              alt="Edit"
                              className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain"
                              onError={(e) => {
                                (e.target as any).src = "/images/edit.png";
                              }}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Data"
                            className="hover:scale-115 active:scale-95 transition-transform cursor-pointer p-1"
                          >
                            <img
                              src="/images/hapus.png"
                              alt="Hapus"
                              className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain"
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

              {assets.length === 0 && (
                <div className="py-20 text-center text-gray-400 text-sm">
                  Belum ada inventaris untuk kategori ini.
                </div>
              )}

              {assets.length > 0 && (
                <AdminPagination
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah / Update */}
      <AssetFormModal
        isOpen={formOpen}
        isEdit={isEdit}
        kategori={kategori}
        initialData={
          selectedItem
            ? {
              nama: selectedItem.name,
              kodePlat: selectedItem.code,
              tipe: selectedItem.tipe || "",
              tahunLantai:
                kategori === "ruang"
                  ? selectedItem.lantai || "Lantai 2"
                  : selectedItem.tahun || "2024",
              kapasitas: selectedItem.capacity || "30 Orang",
              status: (selectedItem.status
                ? selectedItem.status.charAt(0).toUpperCase() +
                selectedItem.status.slice(1)
                : "Status") as any,
              gambar: selectedItem.image,
              kategori,
            }
            : null
        }
        onClose={() => setFormOpen(false)}
        onSave={handleSaveData}
      />

      {/* Modal Konfirmasi Hapus */}
      <ActionConfirmModal
        isOpen={deleteOpen}
        type="hapus"
        title={`Hapus Data ${config.title}`}
        message={`Apakah Anda yakin ingin menghapus unit "${itemToDelete?.name}" (${itemToDelete?.code})?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </AdminLayout>
  );
};
