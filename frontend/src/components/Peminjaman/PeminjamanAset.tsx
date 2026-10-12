import React, { useState, useEffect, useMemo } from "react";
import { ASSETS_DATA, Asset, fetchDynamicAssets, getStoredAssets } from "./assetData";
import { AssetCard } from "./AssetCard";
import { BookingCalendarModal } from "./BookingCalendarModal";
import { StatusPopupModal } from "./StatusPopupModal";

interface PeminjamanAsetProps {
  category: "mobil" | "motor" | "ruang";
  onBack: () => void;
  onSuccess: (bookingData: any) => void;
  onViewDetail?: (asset: Asset) => void;
}

export const PeminjamanAset: React.FC<PeminjamanAsetProps> = ({
  category,
  onBack,
  onSuccess,
  onViewDetail,
}) => {
  const [allAssets, setAllAssets] = useState<Asset[]>(() => getStoredAssets());
  const [activeFilter, setActiveFilter] = useState<
    "semua" | "tersedia" | "dipinjam" | "maintenance"
  >("semua");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [modalAsset, setModalAsset] = useState<Asset | null>(null);
  const [modalType, setModalType] = useState<
    "dipinjam" | "maintenance" | null
  >(null);

  useEffect(() => {
    const refreshAssets = () => {
      fetchDynamicAssets().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllAssets(data);
        } else {
          setAllAssets(getStoredAssets());
        }
      });
    };
    refreshAssets();

    window.addEventListener("assetsUpdated", refreshAssets);
    window.addEventListener("storage", refreshAssets);
    return () => {
      window.removeEventListener("assetsUpdated", refreshAssets);
      window.removeEventListener("storage", refreshAssets);
    };
  }, []);



  const categoryAssets = useMemo(() => {
    return allAssets.filter((item) => item.category === category);
  }, [allAssets, category]);

  const filteredAssets = useMemo(() => {
    if (activeFilter === "semua") return categoryAssets;
    return categoryAssets.filter((item) => item.status === activeFilter);
  }, [categoryAssets, activeFilter]);

  const handleCardClick = (asset: Asset) => {
    if (onViewDetail) {
      onViewDetail(asset);
      return;
    }

    if (asset.status === "dipinjam") {
      setModalAsset(asset);
      setModalType("dipinjam");
      return;
    }

    if (asset.status === "maintenance") {
      setModalAsset(asset);
      setModalType("maintenance");
      return;
    }

    setSelectedAsset(asset);
    setBookingModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setModalAsset(null);
    setModalType(null);
  };

  const handleBookingSubmit = (bookingData: any) => {
    setBookingModalOpen(false);
    onSuccess(bookingData);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63]">
      <header className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 pt-8 pb-2">
        <div className="flex items-center gap-3.5 mb-6">
          <img
            src="/images/sipina_logo_cropped.png"
            alt="Logo SIPINA"
            className="h-12 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col justify-center">
            <span className="text-[15px] font-black tracking-wider text-[#071d63] uppercase leading-tight">
              SIPINA
            </span>
            <span className="text-[11px] text-[#071d63] font-extrabold tracking-wider uppercase leading-tight">
              SISTEM PEMINJAMAN SARANA & PRASARANA
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#071d63] tracking-tight leading-[1.2]">
            {category === "mobil" ? (
              <>
                Ajukan Peminjaman Mobil Dinas
                <br />
                dengan Mudah dan Cepat
              </>
            ) : category === "motor" ? (
              <>
                Ajukan Peminjaman Motor
                <br />
                Dinas dengan Mudah dan Cepat
              </>
            ) : (
              <>
                Ajukan Peminjaman Ruangan
                <br />
                dengan Mudah dan Cepat
              </>
            )}
          </h1>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2.5 text-[#e52e2e] hover:text-[#c92626] font-black text-lg sm:text-xl shrink-0 cursor-pointer transition-transform active:scale-95 select-none"
          >
            <img
              src="/images/kembali.png"
              alt="Kembali"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
            <span>Kembali</span>
          </button>
        </div>

        <div className="w-full h-[1.5px] bg-[#071d63]/30 mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full mb-8 select-none">
          <button
            type="button"
            onClick={() =>
              setActiveFilter(activeFilter === "tersedia" ? "semua" : "tersedia")
            }
            className={`w-full py-3 sm:py-3.5 rounded-full font-black text-base sm:text-lg text-center tracking-wide transition-all cursor-pointer ${
              activeFilter === "tersedia"
                ? "bg-[#071d63] text-white border-[3px] border-[#071d63] shadow-md"
                : "bg-white border-[3px] border-[#071d63] text-[#071d63] hover:bg-slate-50"
            }`}
          >
            Tersedia
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveFilter(activeFilter === "dipinjam" ? "semua" : "dipinjam")
            }
            className={`w-full py-3 sm:py-3.5 rounded-full font-black text-base sm:text-lg text-center tracking-wide transition-all cursor-pointer ${
              activeFilter === "dipinjam"
                ? "bg-[#071d63] text-white border-[3px] border-[#071d63] shadow-md"
                : "bg-white border-[3px] border-[#071d63] text-[#071d63] hover:bg-slate-50"
            }`}
          >
            Dipinjam
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveFilter(
                activeFilter === "maintenance" ? "semua" : "maintenance"
              )
            }
            className={`w-full py-3 sm:py-3.5 rounded-full font-black text-base sm:text-lg text-center tracking-wide transition-all cursor-pointer ${
              activeFilter === "maintenance"
                ? "bg-[#071d63] text-white border-[3px] border-[#071d63] shadow-md"
                : "bg-white border-[3px] border-[#071d63] text-[#071d63] hover:bg-slate-50"
            }`}
          >
            Maintenance
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 py-2 pb-14 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAsset?.id === asset.id}
              onSelect={handleCardClick}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="w-full py-20 text-center text-gray-500">
            <p className="text-sm font-bold">
              Tidak ada aset pada status ini.
            </p>
          </div>
        )}
      </main>

      {/* Modal Kalender Peminjaman */}
      <BookingCalendarModal
        isOpen={bookingModalOpen}
        asset={selectedAsset}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedAsset(null);
        }}
        onSubmit={handleBookingSubmit}
      />

      {/* Modal Status Popup */}
      <StatusPopupModal
        asset={modalAsset}
        type={modalType}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
};
