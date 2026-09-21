import React from "react";
import { Asset } from "./assetData";

interface StatusPopupModalProps {
  asset: Asset | null;
  type: "dipinjam" | "maintenance" | null;
  onClose: () => void;
}

export const StatusPopupModal: React.FC<StatusPopupModalProps> = ({
  type,
  onClose,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#071d63] hover:opacity-75 w-8 h-8 flex items-center justify-center cursor-pointer transition-opacity z-10"
          aria-label="Tutup"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Illustration */}
        <div className="w-full h-56 flex items-center justify-center pt-2 pb-4">
          <img
            src={
              type === "maintenance"
                ? "/images/maintenancepopup.png"
                : "/images/dipinjampopup.png"
            }
            alt={type === "maintenance" ? "Sedang Dalam Perawatan" : "Sedang Dipinjam"}
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        </div>

        {/* Solid Navy Card Banner */}
        <div className="w-full bg-[#071d63] text-white py-5 px-6 sm:px-8 rounded-2xl flex flex-col items-center shadow-md">
          <h3 className="font-serif text-2xl sm:text-[26px] font-bold mb-2.5 tracking-normal text-white">
            {type === "maintenance" ? "Sedang Dalam Perawatan" : "Sedang Dipinjam"}
          </h3>
          <p className="font-serif text-xs sm:text-[13.5px] text-white/95 leading-relaxed font-normal max-w-md">
            {type === "maintenance"
              ? "Aset ini sedang dalam proses perawatan atau perbaikan sehingga belum dapat digunakan untuk sementara waktu."
              : "Aset ini sedang digunakan oleh pengguna lain dan belum tersedia untuk dipinjam saat ini. Silakan pilih aset lain yang tersedia."}
          </p>
        </div>
      </div>
    </div>
  );
};
