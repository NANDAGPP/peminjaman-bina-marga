import React, { useState } from "react";
import { Asset } from "./assetData";
import { StatusPopupModal } from "./StatusPopupModal";
import { BookingFormPanel } from "./BookingFormPanel";

interface DetailAsetProps {
  asset: Asset;
  onBack: () => void;
  onSuccess: (bookingData: any) => void;
}

export const DetailAset: React.FC<DetailAsetProps> = ({
  asset,
  onBack,
  onSuccess,
}) => {
  const [modalType, setModalType] = useState<"dipinjam" | "maintenance" | null>(
    null
  );
  const [showBookingPanel, setShowBookingPanel] = useState<boolean>(false);

  const getStatusBadge = () => {
    switch (asset.status) {
      case "tersedia":
        return null;
      case "dipinjam":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Dipinjam
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const handleActionClick = () => {
    if (asset.status === "dipinjam") {
      setModalType("dipinjam");
      return;
    }
    if (asset.status === "maintenance") {
      setModalType("maintenance");
      return;
    }
    setShowBookingPanel(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Poppins',sans-serif]">
      {/* Top Bar with Contacts and Socials */}
      <div className="w-full bg-[#222222] text-white text-xs sm:text-sm py-3 px-4 sm:px-8 border-b border-gray-800">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <span className="text-gray-300 font-medium">binamargajawatimur@gmail.com</span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a
              href="https://wa.me/6289612548511"
              target="_blank"
              rel="noreferrer"
              className="text-gray-300 hover:text-[#fed000] font-medium transition-colors"
            >
              WA : +62-896-1254-8511
            </a>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="text-gray-300 hover:text-[#fed000] font-medium transition-colors"
            >
              WA : +62-812-3456-7890
            </a>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <span className="hidden sm:inline text-gray-500 mr-2">|</span>
            <a href="https://x.com/dbmjatim" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/twitter.png" alt="X" className="w-4 h-4 object-contain brightness-0 invert" />
            </a>
            <a href="https://www.instagram.com/binamargajatim?stkn=ZmMxcWYzbTB3Zjl1" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/instagram.png" alt="Instagram" className="w-4 h-4 object-contain brightness-0 invert" />
            </a>
            <a href="https://youtube.com/@dbmjatim?si=qIWAAk8L5fMt3QQs" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/youtube.png" alt="YouTube" className="w-4 h-4 object-contain brightness-0 invert" />
            </a>
            <a href="https://www.facebook.com/share/1EKHfjwTXG/" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/facebook.png" alt="Facebook" className="w-4 h-4 object-contain brightness-0 invert" />
            </a>
          </div>
        </div>
      </div>

      {/* Sub Header with DPU Bina Marga Logo */}
      <div className="w-full bg-white border-b border-gray-100 py-3.5 px-6 sm:px-12">
        <div className="max-w-[1280px] mx-auto flex items-center">
          <div className="flex items-center gap-3.5">
            <img
              src="/images/logobina.png"
              alt="Logo DPU Bina Marga"
              className="h-11 sm:h-12 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs sm:text-[13px] font-bold tracking-tight text-[#071d63] uppercase leading-tight">
                DINAS PEKERJAAN UMUM BINA MARGA
              </span>
              <span className="text-xs sm:text-[13px] font-bold tracking-tight text-[#071d63] uppercase leading-tight">
                PROVINSI JAWA TIMUR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        {showBookingPanel ? (
          <div className="max-w-[820px] mx-auto w-full">
            <BookingFormPanel
              selectedAsset={asset}
              onCancel={() => setShowBookingPanel(false)}
              onSubmit={(data) => onSuccess(data)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pt-2">
            {/* Left Column: Back button + Vehicle Showcase & Name Badge */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2.5 text-[#ff0000] hover:text-[#d00000] font-bold text-base sm:text-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <img
                    src="/images/kembali.png"
                    alt="Kembali"
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  />
                  <span>Kembali</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-[560px] h-[260px] sm:h-[350px] flex items-center justify-center mb-6 overflow-hidden">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        asset.category === "ruang"
                          ? "/images/aula.png"
                          : asset.category === "motor"
                            ? "/images/nmax.png"
                            : "/images/porsche.png";
                    }}
                    className={`max-h-full max-w-full select-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-105 ${
                      asset.category === "ruang" ? "w-full h-full object-cover rounded-2xl shadow-md" : "object-contain"
                    }`}
                  />
                </div>

                <div className="bg-white rounded-2xl py-3 px-10 border border-gray-200 shadow-sm inline-block text-center">
                  <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-wider text-[#071d63] uppercase">
                    {asset.tipe || asset.name}
                  </h2>
                  {getStatusBadge() && (
                    <div className="mt-2 flex justify-center">
                      {getStatusBadge()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Specifications & Pinjam Button */}
            <div className="lg:col-span-6 flex flex-col lg:pt-14">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-8">
                Deskripsi & Spesifikasi
              </h1>

              <div className="flex flex-col space-y-4 mb-10 text-base sm:text-lg">
                {asset.category === "ruang" ? (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Nama</span>
                      <span className="font-medium text-gray-800 text-right">{asset.name}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Lantai</span>
                      <span className="font-medium text-gray-800 text-right">{asset.lantai || "1"}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Kode Gedung</span>
                      <span className="font-medium text-gray-800 text-right">{asset.code}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Kapasitas</span>
                      <span className="font-medium text-gray-800 text-right whitespace-nowrap">{asset.capacity}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Nama</span>
                      <span className="font-medium text-gray-800 text-right">
                        {asset.name === "REBORN" ? "Reborn" : asset.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Plat Nomor</span>
                      <span className="font-medium text-gray-800 text-right">{asset.code}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Tahun Produksi</span>
                      <span className="font-medium text-gray-800 text-right">{asset.tahun || "2024"}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Warna</span>
                      <span className="font-medium text-gray-800 text-right">{asset.warna || "Silver"}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Mesin</span>
                      <span className="font-medium text-gray-800 text-right">
                        {asset.mesin || (asset.category === "motor" ? "150 cc" : "2500 cc")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-gray-950">Kapasitas</span>
                      <span className="font-medium text-gray-800 text-right whitespace-nowrap">{asset.capacity || "5 Orang"}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleActionClick}
                className="w-full py-4 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white font-black text-lg sm:text-xl tracking-wider uppercase shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                PINJAM SEKARANG
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Status Modal */}
      <StatusPopupModal
        asset={asset}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};
