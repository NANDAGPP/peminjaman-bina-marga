import React from "react";

interface PengajuanTerkirimProps {
  onCheckStatus?: () => void;
  onBackToHome?: () => void;
}

export const PengajuanTerkirim: React.FC<PengajuanTerkirimProps> = ({
  onCheckStatus,
  onBackToHome,
}) => {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        {/* Celebration Illustration */}
        <div className="w-full max-w-[420px] mb-8">
          <img
            src="/images/pengajuan.png"
            alt="Ilustrasi Pengajuan Berhasil"
            className="w-full h-auto object-contain mx-auto select-none"
          />
        </div>

        {/* Heading with subtle divider line */}
        <div className="relative w-full flex items-center justify-center mb-3">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <h1 className="relative bg-white px-6 text-2xl sm:text-4xl font-extrabold text-[#071d63] tracking-tight">
            Pengajuan Terkirim
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm sm:text-base font-normal max-w-lg mb-10">
          Data peminjaman telah tersimpan dan sedang dalam proses verifikasi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
          <button
            type="button"
            onClick={onCheckStatus}
            className="flex-1 min-w-[200px] h-13 sm:h-14 rounded-xl bg-[#fed000] text-[#071d63] text-base sm:text-lg font-bold shadow-md hover:bg-[#e6bd00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#071d63] active:scale-[0.98]"
          >
            Status Peminjaman
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="flex-1 min-w-[200px] h-13 sm:h-14 rounded-xl bg-[#071d63] text-white text-base sm:text-lg font-bold shadow-md hover:bg-[#0b2880] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fed000] active:scale-[0.98]"
          >
            Kembali Ke Beranda
          </button>
        </div>
      </div>
    </main>
  );
};

export default PengajuanTerkirim;
