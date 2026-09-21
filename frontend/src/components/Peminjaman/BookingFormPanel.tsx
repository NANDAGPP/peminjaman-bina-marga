import React, { useState } from "react";
import { Asset } from "./assetData";
import {
  MonthView,
  NAMA_BULAN,
  buildMonthGrid,
  currentMonthView,
  extractStartTime,
  shiftMonth,
  toIsoDate,
  todayIso,
} from "./calendar";

interface BookingFormPanelProps {
  selectedAsset: Asset | null;
  onCancel: () => void;
  onSubmit: (bookingData: {
    asset: Asset;
    startDate: string;
    endDate: string;
    purpose: string;
    time: string;
  }) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TIME_OPTIONS = [
  "09:00 WIB",
  "10:00 WIB",
  "13:00 WIB",
  "14:00 WIB",
];

const TIME_PLACEHOLDER = "Pilih opsi yang tersedia";

interface CalendarCardProps {
  idPrefix: string;
  view: MonthView;
  onChangeView: (view: MonthView) => void;
  selected: string;
  minDate: string;
  onSelect: (isoDate: string) => void;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  idPrefix,
  view,
  onChangeView,
  selected,
  minDate,
  onSelect,
}) => {
  const { leadingDays, days } = buildMonthGrid(view);
  const navButtonClass =
    "w-7 h-7 rounded-md border border-[#fed000] text-[#fed000] flex items-center justify-center font-bold text-xs hover:bg-amber-50 cursor-pointer";

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-lg p-5 sm:p-6 flex flex-col">
      {/* Header: Prev, Month/Year, Next */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangeView(shiftMonth(view, -1))}
          className={navButtonClass}
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>

        <div className="flex flex-col items-center">
          <span className="font-black text-base text-[#071d63] leading-tight">
            {NAMA_BULAN[view.month]}
          </span>
          <span className="text-[10px] text-gray-400 font-bold leading-tight">
            {view.year}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChangeView(shiftMonth(view, 1))}
          className={navButtonClass}
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      {/* Separator */}
      <div className="w-full border-b border-[#071d63] my-3.5" />

      {/* Day Header Badges */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {DAYS_OF_WEEK.map((day) => (
          <span
            key={`${idPrefix}-d-${day}`}
            className="py-1 rounded-md bg-[#fed000] text-[#071d63] font-black text-xs select-none"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
        {leadingDays.map((d) => (
          <span key={`${idPrefix}-prev-${d}`} className="p-1.5 text-gray-300">
            {d}
          </span>
        ))}

        {days.map((day) => {
          const iso = toIsoDate(view, day);
          const isSelected = iso === selected;
          const isDisabled = iso < minDate;

          return (
            <button
              key={`${idPrefix}-day-${day}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(iso)}
              className={`p-1.5 rounded-lg transition-colors select-none ${
                isSelected
                  ? "bg-[#071d63] text-white font-extrabold shadow-sm cursor-pointer"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-900 hover:bg-amber-50 cursor-pointer"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const BookingFormPanel: React.FC<BookingFormPanelProps> = ({
  selectedAsset,
  onCancel,
  onSubmit,
}) => {
  const today = todayIso();

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [startView, setStartView] = useState<MonthView>(currentMonthView);
  const [endView, setEndView] = useState<MonthView>(currentMonthView);
  const [time, setTime] = useState<string>(TIME_PLACEHOLDER);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [timeError, setTimeError] = useState<string>("");

  const handleSelectStart = (iso: string) => {
    setStartDate(iso);
    if (iso > endDate) setEndDate(iso);
  };

  const handleBookingSubmit = () => {
    if (!selectedAsset) return;

    if (!time || time === TIME_PLACEHOLDER) {
      setTimeError("Silakan pilih waktu peminjaman terlebih dahulu.");
      return;
    }

    setTimeError("");
    onSubmit({
      asset: selectedAsset,
      startDate,
      endDate,
      purpose: "Keperluan Operasional",
      time: extractStartTime(time),
    });
  };

  return (
    <div className="w-full max-w-[780px] mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-100 animate-in fade-in duration-200">
      {/* Centered Main Title */}
      <h2 className="text-2xl sm:text-[32px] font-black text-[#071d63] text-center tracking-tight mb-3 [font-family:'Poppins',sans-serif]">
        Tentukan Tanggal dan Waktu Peminjaman
      </h2>

      {/* Split Line */}
      <div className="w-full h-1.5 rounded-full overflow-hidden flex mb-8 sm:mb-10">
        <div className="w-[18%] bg-[#fed000]" />
        <div className="w-[82%] bg-[#071d63]" />
      </div>

      {/* Dual Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
        <div className="flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-[#071d63] text-center mb-4 [font-family:'Poppins',sans-serif]">
            Tanggal Mulai
          </h3>
          <CalendarCard
            idPrefix="start"
            view={startView}
            onChangeView={setStartView}
            selected={startDate}
            minDate={today}
            onSelect={handleSelectStart}
          />
        </div>

        <div className="flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-[#071d63] text-center mb-4 [font-family:'Poppins',sans-serif]">
            Tanggal Selesai
          </h3>
          <CalendarCard
            idPrefix="end"
            view={endView}
            onChangeView={setEndView}
            selected={endDate}
            minDate={startDate}
            onSelect={setEndDate}
          />
        </div>
      </div>

      {/* Waktu Mulai Section with Diamond Divider Line */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-black text-xl sm:text-2xl text-[#071d63] whitespace-nowrap [font-family:'Poppins',sans-serif]">
          Waktu Mulai
        </span>
        <span className="text-black font-bold text-xs select-none">◆</span>
        <div className="flex-1 h-[2px] bg-black" />
      </div>

      {/* Yellow Select Pill */}
      <div className="relative mb-12 sm:mb-14 w-full sm:w-[380px]">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full bg-[#fed000] hover:bg-[#f0c400] text-white font-black text-base sm:text-lg py-3.5 px-6 rounded-2xl flex items-center justify-between shadow-md cursor-pointer transition-colors focus:outline-none ${
            timeError ? "ring-2 ring-red-500 border-2 border-red-500" : ""
          }`}
        >
          <span className="truncate">{time}</span>
          <span className="text-[#071d63] text-xs font-black ml-3">▼</span>
        </button>

        {timeError && (
          <p className="mt-2 text-sm font-bold text-red-600 flex items-center gap-1.5 animate-in fade-in duration-150">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0" />
            {timeError}
          </p>
        )}

        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setTime(opt);
                  setTimeError("");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-5 py-2.5 text-sm font-bold transition-colors hover:bg-amber-50 cursor-pointer ${
                  time === opt ? "text-[#071d63] bg-amber-50/70" : "text-gray-800"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Red Batal & Navy Ajukan Peminjaman */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-4 sm:py-5 rounded-2xl bg-[#ff0000] hover:bg-[#d90000] text-white font-black text-lg sm:text-xl shadow-md transition-all active:scale-[0.99] cursor-pointer text-center"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleBookingSubmit}
          className="w-full py-4 sm:py-5 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white font-black text-lg sm:text-xl shadow-md transition-all active:scale-[0.99] cursor-pointer text-center"
        >
          Ajukan Peminjaman
        </button>
      </div>
    </div>
  );
};

export default BookingFormPanel;
