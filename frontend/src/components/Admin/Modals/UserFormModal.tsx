import React, { useState, useEffect } from "react";

export interface UserFormData {
  id?: number;
  nama: string;
  noHp: string;
  nip?: string;
  password?: string;
  foto: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  initialData?: UserFormData | null;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}

const AVATAR_OPTIONS = [
  { label: "Default", url: "/images/avatar_default.png" },
  { label: "Pria", url: "/images/avatar_pria.png" },
  { label: "Wanita", url: "/images/avatar_wanita.png" },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  isEdit,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    nama: "",
    noHp: "",
    nip: "",
    password: "",
    foto: "/images/avatar_pria.png",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: "",
        noHp: "",
        nip: "",
        password: "",
        foto: "/images/avatar_pria.png",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[560px] max-h-[94vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl p-6 sm:p-10 border border-gray-100">
        {/* Header with decorative line */}
        <div className="flex items-center justify-center gap-3 w-full mb-1.5">
          <div className="flex-1 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071d63] tracking-wide whitespace-nowrap">
            {isEdit ? "Update Data Pengguna" : "Tambah Pengguna Baru"}
          </h2>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 text-center font-normal mb-8">
          {isEdit
            ? "Perbarui informasi akun pengguna pegawai dengan lengkap dan benar"
            : "Lengkapi data pengguna baru untuk pendaftaran akun sistem"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Nama */}
          <div className="flex items-center gap-4">
            <label className="w-24 sm:w-28 text-sm sm:text-base font-bold text-black shrink-0">
              Nama
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Nama lengkap pegawai"
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Row 2: No. Telepon */}
          <div className="flex items-center gap-4">
            <label className="w-24 sm:w-28 text-sm sm:text-base font-bold text-black shrink-0">
              No. Telepon
            </label>
            <input
              type="text"
              required
              value={formData.noHp}
              onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
              placeholder="+62 8..."
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Row 3: NIP */}
          <div className="flex items-center gap-4">
            <label className="w-24 sm:w-28 text-sm sm:text-base font-bold text-black shrink-0">
              NIP
            </label>
            <input
              type="text"
              value={formData.nip || ""}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="19xxxxxxxxxxxx"
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Row 4: Password */}
          <div className="flex items-center gap-4">
            <label className="w-24 sm:w-28 text-sm sm:text-base font-bold text-black shrink-0">
              Password
            </label>
            <input
              type="password"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={isEdit ? "(Kosongkan bila tidak diubah)" : "Minimal 8 karakter"}
              required={!isEdit}
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#fed000] focus:border-[#fed000] focus:ring-1 focus:ring-[#fed000] outline-none text-sm sm:text-base text-gray-800 bg-white shadow-2xs"
            />
          </div>

          {/* Row 5: Pilihan Avatar */}
          <div className="pt-2 flex items-center gap-4">
            <label className="w-24 sm:w-28 text-sm sm:text-base font-bold text-black shrink-0">
              Pilih Foto
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.url}
                  type="button"
                  onClick={() => setFormData({ ...formData, foto: av.url })}
                  className={`w-11 h-11 rounded-full border-2 overflow-hidden p-0.5 cursor-pointer transition-transform hover:scale-105 ${
                    formData.foto === av.url
                      ? "border-[#fed000] ring-2 ring-[#071d63] scale-110 shadow-sm"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                  title={av.label}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                  />
                </button>
              ))}
            </div>
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
