import React from "react";

interface ActionConfirmModalProps {
  isOpen: boolean;
  type: "hapus" | "setujui" | "terima";
  title?: string;
  message?: string;
  confirmText?: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText,
  icon,
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
        {/* Top Graphic / Icon */}
        {icon ? (
          <div className="mb-3 flex items-center justify-center">{icon}</div>
        ) : type === "hapus" ? (
          <div className="w-52 h-28 flex items-center justify-center mb-3 overflow-hidden">
            <img
              src="/images/ilustrasi_hapus.png"
              alt="Hapus"
              className="max-w-full max-h-full object-contain pointer-events-none"
            />
          </div>
        ) : (
          <div className="w-20 h-20 mb-3 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}

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
    </div>
  );
};
