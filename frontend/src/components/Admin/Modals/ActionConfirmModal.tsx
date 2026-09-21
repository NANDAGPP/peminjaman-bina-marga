import React from "react";

interface ActionConfirmModalProps {
  isOpen: boolean;
  type: "hapus" | "setujui" | "terima";
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const defaultTitle = type === "hapus" ? "Hapus Aset?" : "Konfirmasi Persetujuan";
  const defaultMessage =
    type === "hapus"
      ? "Tindakan ini akan menghapus data secara permanen dan tidak dapat dikembalikan"
      : "Apakah Anda yakin ingin menyetujui tindakan ini?";
  const defaultConfirmText = type === "hapus" ? "Hapus" : "Konfirmasi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {type === "hapus" ? (
          <div className="w-full flex flex-col items-center">
            {/* Ilustrasi Hapus */}
            <div className="w-52 h-28 flex items-center justify-center mb-3 overflow-hidden">
              <img
                src="/images/ilustrasi_hapus.png"
                alt="Hapus"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>

            <h3 className="text-2xl font-black text-[#071d63] mb-2">
              {title || defaultTitle}
            </h3>

            <p className="text-sm text-[#071d63] leading-relaxed mb-8 font-medium max-w-sm">
              {message || defaultMessage}
            </p>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-center gap-5 w-full max-w-sm">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                {confirmText || defaultConfirmText}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Ilustrasi Konfirmasi */}
            <div className="w-52 h-28 flex items-center justify-center mb-3 overflow-hidden">
              <img
                src="/images/modal_setujui_f.png"
                alt="Konfirmasi"
                onError={(e) => {
                  (e.target as any).src = "/images/sukses.png";
                }}
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>

            <h3 className="text-2xl font-black text-[#071d63] mb-2">
              {title || defaultTitle}
            </h3>

            <p className="text-sm text-[#071d63] leading-relaxed mb-8 font-medium max-w-sm">
              {message || defaultMessage}
            </p>

            {/* Action Buttons: Red Batal + Navy Konfirmasi */}
            <div className="flex items-center justify-center gap-5 w-full max-w-sm">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                {confirmText || defaultConfirmText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
