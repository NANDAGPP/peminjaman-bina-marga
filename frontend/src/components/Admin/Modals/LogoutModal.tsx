import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi Keluar"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[560px] bg-[#071d63] rounded-[32px] shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center">
        {/* Illustration */}
        <div className="w-full max-w-[340px] h-48 flex items-center justify-center mb-6 overflow-hidden">
          <img
            src="/images/ilustrasi_logout.png"
            alt="Logout Illustration"
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        </div>

        {/* Message */}
        <h3 className="text-base sm:text-xl font-bold text-white mb-8 tracking-wide">
          Anda akan keluar dari akun. Lanjutkan?
        </h3>

        {/* Action Buttons: White Batal + Red Keluar */}
        <div className="flex items-center justify-center gap-6 w-full max-w-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-gray-100 text-[#071d63] text-base sm:text-lg font-black shadow-md transition-transform active:scale-[0.98] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base sm:text-lg font-black shadow-md transition-transform active:scale-[0.98] cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
