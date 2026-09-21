import React, { useEffect } from "react";

interface PengaduanBerhasilModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const PengaduanBerhasilModal: React.FC<PengaduanBerhasilModalProps> = ({
  isOpen,
  onClose,
  autoCloseDelay = 1500,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, autoCloseDelay]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-success-title"
    >
      <div
        className="relative w-full max-w-[760px] bg-[#071d63] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#fed000] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full border-4 border-[#fed000] pointer-events-none"
        />

        <div className="w-full sm:w-2/5 flex justify-center z-10">
          <img
            src="/images/pengaduanpopup.png"
            alt="Ilustrasi Pengaduan Berhasil"
            className="w-48 sm:w-56 h-auto object-contain select-none"
          />
        </div>

        <div className="w-full sm:w-3/5 flex flex-col justify-center text-left z-10">
          <h2
            id="modal-success-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
          >
            Pengaduan Berhasil
          </h2>

          <hr className="w-full border-t border-white/40 my-3 sm:my-4" />

          <p className="text-white text-sm sm:text-base font-light leading-relaxed">
            Terima kasih, laporan Anda sedang dalam proses penanganan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PengaduanBerhasilModal;
