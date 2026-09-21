import React, { useState, useEffect } from "react";

interface EditAkunModalProps {
  isOpen: boolean;
  initialPhone?: string;
  onClose: () => void;
  onSave: (data: { phone: string; password?: string }) => void;
}

export const EditAkunModal: React.FC<EditAkunModalProps> = ({
  isOpen,
  initialPhone = "",
  onClose,
  onSave,
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ phone, password });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Data Akun"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[560px] bg-[#071d63] rounded-[28px] shadow-2xl p-8 sm:p-10 border border-blue-900">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center px-5 py-3 rounded-xl border-2 border-[#fed000] bg-transparent">
            <span className="w-24 text-sm sm:text-base font-bold text-white shrink-0">
              No.Tlpn
            </span>
            <span className="text-white font-bold mr-2">:</span>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent text-white font-bold text-sm sm:text-base outline-none tracking-wider"
            />
          </div>

          <div className="flex items-center px-5 py-3 rounded-xl border-2 border-[#fed000] bg-transparent">
            <span className="w-24 text-sm sm:text-base font-bold text-white shrink-0">
              Password
            </span>
            <span className="text-white font-bold mr-2">:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="**********"
              className="flex-1 bg-transparent text-white font-bold text-sm sm:text-base outline-none tracking-widest placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 max-w-[170px] py-3 rounded-2xl bg-white hover:bg-gray-100 text-[#071d63] text-base font-extrabold shadow-md transition-transform active:scale-[0.98] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 max-w-[170px] py-3 rounded-2xl bg-[#fed000] hover:bg-[#ebbf00] text-white font-extrabold text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PilihKarakterModalProps {
  isOpen: boolean;
  currentAvatar: string;
  onClose: () => void;
  onSelect: (avatarPath: string) => void;
}

export const PilihKarakterModal: React.FC<PilihKarakterModalProps> = ({
  isOpen,
  currentAvatar,
  onClose,
  onSelect,
}) => {
  const VALID_AVATARS = [
    "/images/avatar_wanita.png",
    "/images/avatar_pria.png",
    "/images/avatar_default.png",
  ];

  const [selected, setSelected] = useState<string>(
    VALID_AVATARS.includes(currentAvatar)
      ? currentAvatar
      : "/images/avatar_pria.png"
  );

  useEffect(() => {
    if (VALID_AVATARS.includes(currentAvatar)) {
      setSelected(currentAvatar);
    } else {
      setSelected("/images/avatar_pria.png");
    }
  }, [currentAvatar, isOpen]);

  if (!isOpen) return null;

  const characters = [
    { id: "default", name: "Default", img: "/images/avatar_default.png" },
    { id: "pria", name: "Pria", img: "/images/avatar_pria.png" },
    { id: "wanita", name: "Wanita", img: "/images/avatar_wanita.png" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Karakter Profil"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[580px] bg-white rounded-[32px] shadow-2xl p-6 sm:p-10 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-3 text-left">
          Pilih Karakter Profil
        </h2>
        <div className="w-full h-px bg-gray-400/80 mb-8" />

        <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-[460px] mx-auto mb-10">
          {characters.map((char) => {
            const isPicked = selected === char.img;
            return (
              <div
                key={char.id}
                onClick={() => setSelected(char.img)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className={`w-full aspect-square rounded-[22px] sm:rounded-[26px] overflow-hidden border-[4px] sm:border-[5px] border-[#fed000] shadow-md transition-all duration-200 flex items-center justify-center ${
                    isPicked
                      ? "ring-4 ring-[#071d63] scale-105 shadow-xl"
                      : "hover:scale-102 hover:shadow-lg"
                  }`}
                >
                  <img
                    src={`${char.img}?v=4`}
                    alt={char.name}
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </div>
                <span className="mt-3 text-sm sm:text-base font-bold text-black tracking-wide">
                  {char.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-6 px-2 sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="w-[160px] sm:w-[200px] py-3.5 rounded-full bg-[#ff0000] hover:bg-[#e00000] text-white font-black text-base sm:text-lg shadow-md transition-transform active:scale-95 cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            className="w-[160px] sm:w-[200px] py-3.5 rounded-full bg-[#fed000] hover:bg-[#ebbf00] text-[#071d63] font-black text-base sm:text-lg shadow-md transition-transform active:scale-95 cursor-pointer text-center"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};

interface BatalkanPinjamanModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const BatalkanPinjamanModal: React.FC<BatalkanPinjamanModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Batalkan Pinjaman"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[460px] bg-[#071d63] rounded-[28px] shadow-2xl p-8 flex flex-col items-center text-center">
        <h3 className="text-xl sm:text-2xl font-black text-white mb-8 tracking-wide">
          Batalkan Pinjaman Anda?
        </h3>

        <div className="flex items-center justify-center gap-6 w-full max-w-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl bg-white hover:bg-gray-100 text-[#071d63] text-base font-black shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base font-black shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            YA
          </button>
        </div>
      </div>
    </div>
  );
};

interface KembalikanBarangModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const KembalikanBarangModal: React.FC<KembalikanBarangModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kembalikan Barang"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[500px] bg-[#071d63] rounded-[28px] shadow-2xl p-8 flex flex-col items-center text-center">
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-wide">
          Ingin Mengembalikan Barang?
        </h3>

        <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mb-8 font-normal max-w-sm">
          Apakah Anda yakin ingin mengembalikan barang ini? Pastikan semua kondisi barang sudah sesuai dengan ketentuan yang berlaku.
        </p>

        <div className="flex items-center justify-center gap-6 w-full max-w-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl bg-white hover:bg-gray-100 text-[#071d63] text-base font-black shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base font-black shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            YA
          </button>
        </div>
      </div>
    </div>
  );
};
