import React from "react";
import { Asset } from "./assetData";

interface AssetCardProps {
  asset: Asset;
  isSelected?: boolean;
  onSelect: (asset: Asset) => void;
  onViewDetail?: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected = false,
  onSelect,
}) => {
  const getStatusContent = () => {
    switch (asset.status) {
      case "tersedia":
        return (
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-gray-900">
            <img
              src="/images/tersedia.png"
              alt="Tersedia"
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Tersedia</span>
          </div>
        );
      case "dipinjam":
        return (
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-gray-900">
            <img
              src="/images/dipinjam.png"
              alt="Dipinjam"
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Dipinjam</span>
          </div>
        );
      case "maintenance":
        return (
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-gray-900">
            <img
              src="/images/maintenance.png"
              alt="Maintenance"
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Maintenance</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(asset)}
      className={`group relative w-full h-[148px] sm:h-[156px] bg-[#eff1f5] hover:bg-[#e8ecf3] rounded-[22px] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer transition-all duration-200 select-none shadow-2xs hover:shadow-md ${
        isSelected ? "ring-2 ring-[#071d63] bg-[#e4eaf5]" : ""
      }`}
    >
      <div className="w-[45%] sm:w-[44%] h-full flex items-center justify-center relative overflow-hidden pr-1 shrink-0">
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
          className={
            asset.category === "ruang"
              ? "w-full h-full object-cover rounded-[16px] pointer-events-none shadow-xs"
              : "max-w-full max-h-[115px] sm:max-h-[125px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300 pointer-events-none"
          }
        />
      </div>

      <div className="flex-1 min-w-0 h-full bg-white rounded-[18px] px-3 py-2.5 sm:px-3.5 sm:py-3 flex flex-col justify-between shadow-2xs overflow-hidden">
        <h4 className="font-black text-sm sm:text-base tracking-[0.15em] text-black uppercase leading-tight truncate">
          {asset.name}
        </h4>

        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-gray-800 leading-normal min-w-0">
          {asset.category === "ruang" ? (
            <img
              src="/images/no.png"
              alt="Kode"
              className="w-3.5 h-4 object-contain shrink-0 opacity-80"
            />
          ) : asset.code === "Motor" ? (
            <svg
              className="w-4 h-4 text-gray-700 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5l2-4.5h4.5" />
              <path d="M9 17.5l2-6 3-1" />
              <path d="M13 6l2 4" />
            </svg>
          ) : (
            <img
              src="/images/plat.png"
              alt="Plat"
              className="w-5 h-3.5 object-contain shrink-0"
            />
          )}
          <span className="truncate">{asset.code}</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-gray-800 leading-normal min-w-0">
          <img
            src="/images/user.png"
            alt="Kapasitas"
            className="w-4 h-4 object-contain shrink-0 opacity-80"
          />
          <span className="whitespace-nowrap overflow-visible font-bold text-gray-800">
            {asset.capacity}
          </span>
        </div>

        <div className="leading-normal">{getStatusContent()}</div>
      </div>
    </div>
  );
};
