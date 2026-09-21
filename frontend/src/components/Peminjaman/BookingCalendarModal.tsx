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

interface BookingCalendarModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSubmit: (bookingData: {
    asset: Asset;
    startDate: string;
    endDate: string;
    time: string;
  }) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_OPTIONS = ["09.00", "10.00", "11.00", "14.00"];

interface MiniCalendarProps {
  idPrefix: string;
  view: MonthView;
  onChangeView: (view: MonthView) => void;
  selected: string;
  minDate: string;
  onSelect: (isoDate: string) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  idPrefix,
  view,
  onChangeView,
  selected,
  minDate,
  onSelect,
}) => {
  const { leadingDays, days } = buildMonthGrid(view);
  const navButtonClass =
    "w-6 h-6 rounded-md border border-[#fed000] flex items-center justify-center text-[#fed000] font-black text-xs cursor-pointer";

  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl border border-gray-100 shadow-md p-3.5 flex flex-col">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between px-2 pb-3 border-b border-[#071d63]/30 mb-2">
        <button
          type="button"
          onClick={() => onChangeView(shiftMonth(view, -1))}
          className={navButtonClass}
          aria-label="Bulan sebelumnya"
        >
          &lt;
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-extrabold text-[#071d63]">
            {NAMA_BULAN[view.month]}
          </span>
          <span className="text-[8px] text-gray-400">{view.year}</span>
        </div>
        <button
          type="button"
          onClick={() => onChangeView(shiftMonth(view, 1))}
          className={navButtonClass}
          aria-label="Bulan berikutnya"
        >
          &gt;
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={`${idPrefix}-${d}`}
            className="py-1 rounded bg-[#fed000] text-black font-extrabold text-[10px]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {leadingDays.map((d) => (
          <span key={`${idPrefix}-prev-${d}`} className="text-gray-300 py-1">
            {d}
          </span>
        ))}

        {days.map((d) => {
          const iso = toIsoDate(view, d);
          const isSelected = iso === selected;
          const isDisabled = iso < minDate;

          return (
            <button
              key={`${idPrefix}-day-${d}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(iso)}
              className={`py-1 rounded-lg font-bold text-xs transition-colors ${
                isSelected
                  ? "bg-[#071d63] text-white shadow-xs cursor-pointer"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const BookingCalendarModal: React.FC<BookingCalendarModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSubmit,
}) => {
  const today = todayIso();

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [startView, setStartView] = useState<MonthView>(currentMonthView);
  const [endView, setEndView] = useState<MonthView>(currentMonthView);
  const [time, setTime] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const [timeDropdownOpen, setTimeDropdownOpen] = useState<boolean>(false);

  if (!isOpen || !asset) return null;

  const handleSelectStart = (iso: string) => {
    setStartDate(iso);
    if (iso > endDate) setEndDate(iso);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) {
      setTimeError("Silakan pilih waktu peminjaman terlebih dahulu.");
      return;
    }
    setTimeError("");
    onSubmit({
      asset,
      startDate,
      endDate,
      time: extractStartTime(time),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[700px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-[#071d63] text-center mb-2 tracking-tight">
          Tentukan Tanggal dan Waktu Peminjaman
        </h2>

        {/* Decorative Divider Line */}
        <div className="w-full h-1.5 bg-gradient-to-r from-[#fed000] via-[#071d63] to-[#071d63] rounded-full mb-6"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dual Calendar: Tanggal Mulai & Tanggal Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-[#071d63] mb-3">
                Tanggal Mulai
              </span>
              <MiniCalendar
                idPrefix="start"
                view={startView}
                onChangeView={setStartView}
                selected={startDate}
                minDate={today}
                onSelect={handleSelectStart}
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-[#071d63] mb-3">
                Tanggal Selesai
              </span>
              <MiniCalendar
                idPrefix="end"
                view={endView}
                onChangeView={setEndView}
                selected={endDate}
                minDate={startDate}
                onSelect={setEndDate}
              />
            </div>
          </div>

          {/* Waktu Mulai Section */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-black text-[#071d63] whitespace-nowrap">
                Waktu Mulai
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#071d63]"></div>
              <div className="flex-1 h-0.5 bg-[#071d63]"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-[#071d63]"></div>
            </div>

            {/* Dropdown Button */}
            <div className="relative w-full max-w-xs">
              <button
                type="button"
                onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                className={`w-full py-3 px-5 rounded-2xl bg-[#fed000] hover:bg-[#ebbf00] text-white font-extrabold text-sm flex items-center justify-between shadow-xs transition-colors cursor-pointer ${
                  timeError ? "ring-2 ring-red-500 border-2 border-red-500" : ""
                }`}
              >
                <span>{time ? `${time} WIB` : "Pilih opsi yang tersedia"}</span>
                <svg
                  className="w-4 h-4 text-[#071d63]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {timeError && (
                <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {timeError}
                </p>
              )}

              {/* Time Options Menu */}
              {timeDropdownOpen && (
                <div className="absolute left-0 top-14 z-30 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 animate-in fade-in duration-150">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTime(t);
                        setTimeError("");
                        setTimeDropdownOpen(false);
                      }}
                      className="w-full py-2 px-4 rounded-xl text-left font-bold text-xs sm:text-sm text-[#071d63] hover:bg-[#fed000]/20 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{t} WIB</span>
                      <span className="text-[10px] text-gray-400">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Red Batal + Navy Ajukan Peminjaman */}
          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 max-w-[200px] py-3.5 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white font-extrabold text-base shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 max-w-[220px] py-3.5 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white font-extrabold text-base shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              Ajukan Peminjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
