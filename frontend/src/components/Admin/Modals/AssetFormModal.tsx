import React, { useState, useEffect } from "react";

export interface AssetFormData {
  id?: string | number;
  nama: string;
  kodePlat: string;
  tipe: string;
  tahunLantai: string;
  kapasitas: string;
  status: "Tersedia" | "Dipinjam" | "Maintenance" | "Status";
  gambar?: string;
  kategori: "mobil" | "motor" | "ruang";
}

interface AssetFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  kategori: "mobil" | "motor" | "ruang";
  initialData?: AssetFormData | null;
  onClose: () => void;
  onSave: (data: AssetFormData) => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  isEdit,
  kategori,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AssetFormData>({
    nama: "",
    kodePlat: "",
    tipe: "",
    tahunLantai: "",
    kapasitas: "",
    status: "Status",
    gambar: "",
    kategori,
  });

  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: "",
        kodePlat: "",
        tipe: "",
        tahunLantai: "",
        kapasitas: "",
        status: "Status",
        gambar: "",
        kategori,
      });
    }
    setStatusDropdownOpen(false);
  }, [initialData, kategori, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, gambar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getKategoriTitle = () => {
    switch (kategori) {
      case "mobil":
        return "Mobil";
      case "motor":
        return "Motor";
      case "ruang":
        return "Ruang";
      default:
        return "Aset";
    }
  };

  const getKategoriDesc = () => {
    switch (kategori) {
      case "mobil":
        return "mobil";
      case "motor":
        return "motor";
      case "ruang":
        return "ruang";
      default:
        return "aset";
    }
  };

  const isRuang = kategori === "ruang";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] max-h-[94vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl p-6 sm:p-10 border border-gray-100">
        {/* Header with decorative line */}
        <div className="flex items-center justify-center gap-3 w-full mb-1.5">
          <div className="flex-1 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071d63] tracking-wide whitespace-nowrap">
            {isEdit ? "Update Data Aset " : "Tambah Data Aset "} {getKategoriTitle()}
          </h2>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 text-center font-normal mb-8">
          {isEdit
            ? `Perbarui informasi data aset ${getKategoriDesc()} dengan lengkap dan benar`
            : `Lengkapi informasi data aset baru ${getKategoriDesc()} dengan lengkap dan benar`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Nama */}
          <div className="flex items-center gap-4">
            <label className="w-20 sm:w-24 text-sm sm:text-base font-bold text-black shrink-0">
              Nama
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Plat / Kode */}
          <div className="flex items-center gap-4">
            <label className="w-20 sm:w-24 text-sm sm:text-base font-bold text-black shrink-0">
              {isRuang ? "Kode" : "Plat"}
            </label>
            <input
              type="text"
              required
              value={formData.kodePlat}
              onChange={(e) =>
                setFormData({ ...formData, kodePlat: e.target.value })
              }
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Tipe / Lantai */}
          <div className="flex items-center gap-4">
            <label className="w-20 sm:w-24 text-sm sm:text-base font-bold text-black shrink-0">
              {isRuang ? "Lantai" : "Tipe"}
            </label>
            <input
              type="text"
              value={isRuang ? formData.tahunLantai : formData.tipe}
              onChange={(e) =>
                isRuang
                  ? setFormData({ ...formData, tahunLantai: e.target.value })
                  : setFormData({ ...formData, tipe: e.target.value })
              }
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Tahun / Kapasitas */}
          <div className="flex items-center gap-4">
            <label className="w-20 sm:w-24 text-sm sm:text-base font-bold text-black shrink-0">
              {isRuang ? "Kapasitas" : "Tahun"}
            </label>
            <input
              type="text"
              value={isRuang ? formData.kapasitas : formData.tahunLantai}
              onChange={(e) =>
                isRuang
                  ? setFormData({ ...formData, kapasitas: e.target.value })
                  : setFormData({ ...formData, tahunLantai: e.target.value })
              }
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Row 5: Foto / Gambar Aset */}
          <div className="flex items-center gap-4">
            <label className="w-20 sm:w-24 text-sm sm:text-base font-bold text-black shrink-0">
              Foto Aset
            </label>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-12 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={
                    formData.gambar ||
                    (kategori === "ruang"
                      ? "/images/aula.png"
                      : kategori === "motor"
                        ? "/images/nmax.png"
                        : "/images/porsche.png")
                  }
                  alt="Preview"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      kategori === "ruang"
                        ? "/images/aula.png"
                        : kategori === "motor"
                          ? "/images/nmax.png"
                          : "/images/porsche.png";
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <label className="flex-1 px-3 py-1.5 rounded-xl border border-dashed border-gray-400 hover:border-[#071d63] bg-gray-50 hover:bg-white text-xs sm:text-sm text-gray-600 font-medium cursor-pointer transition-colors flex items-center justify-between">
                <span className="truncate">
                  {formData.gambar ? "Ganti Foto..." : "Unggah Gambar Aset..."}
                </span>
                <span className="text-[11px] font-bold text-[#071d63] px-2 py-0.5 rounded bg-blue-50">
                  Pilih
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {formData.gambar && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gambar: "" })}
                  className="text-xs font-bold text-red-600 hover:underline px-1 cursor-pointer"
                  title="Reset ke gambar default"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Status Dropdown Pill */}
          <div className="pt-2 relative">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="inline-flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#071d63] bg-white min-w-[145px] cursor-pointer shadow-2xs select-none hover:bg-gray-50/70"
            >
              <span className="text-sm sm:text-base font-extrabold text-[#071d63]">
                {formData.status || "Status"}
              </span>
              <svg
                className={`w-4 h-4 text-[#071d63] transition-transform duration-150 ${statusDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Options with Backdrop */}
            {statusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setStatusDropdownOpen(false)}
                />
                <div className="absolute left-0 bottom-full mb-2 z-40 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-gray-100 p-2 flex flex-col gap-1.5 w-[145px] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-0.5 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Pilih Status
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, status: "Tersedia" });
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#00d02b] hover:bg-[#00ba26] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                  >
                    <span>Tersedia</span>
                    {formData.status === "Tersedia" && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, status: "Dipinjam" });
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#ff0000] hover:bg-[#e00000] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                  >
                    <span>Dipinjam</span>
                    {formData.status === "Dipinjam" && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, status: "Maintenance" });
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-white bg-[#071d63] hover:bg-[#0a277e] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                  >
                    <span>Maintenance</span>
                    {formData.status === "Maintenance" && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons: Red Batal + Navy Tambah/Simpan */}
          <div className="flex items-center justify-center gap-5 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 max-w-[200px] py-3.5 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base sm:text-lg font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 max-w-[200px] py-3.5 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white text-base sm:text-lg font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              {isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
