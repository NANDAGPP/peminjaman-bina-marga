import React, { useState } from "react";

interface TolakReasonModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const TolakReasonModal: React.FC<TolakReasonModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  const options = [
    "Dalam perawatan",
    "Pengurusan Surat",
    "Pengajuan Melebihi Kuota",
    "Pengajuan diluar Jadwal",
  ];

  const [selectedReason, setSelectedReason] = useState<string>("Dalam perawatan");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-10 border border-gray-100">
        <h3 className="text-2xl sm:text-3xl font-black text-black text-center mb-1.5">
          Detail Penolakan
        </h3>
        <p className="text-sm sm:text-base text-gray-700 text-center mb-8 font-normal">
          Pilih 1 alasan penolakan pengajuan
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            {options.map((opt) => {
              const isSelected = selectedReason === opt;
              return (
                <label
                  key={opt}
                  onClick={() => setSelectedReason(opt)}
                  className="flex items-center gap-3.5 cursor-pointer select-none group"
                >
                  <div
                    className={`w-7 h-7 rounded-full border-[2.5px] border-[#071d63] flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "bg-white" : "group-hover:border-[#fed000]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#071d63]" />
                    )}
                  </div>
                  <span className="text-[#071d63] font-bold text-base sm:text-[17px]">
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 max-w-[170px] py-3.5 rounded-2xl bg-[#ff0000] hover:bg-[#e00000] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 max-w-[170px] py-3.5 rounded-2xl bg-[#071d63] hover:bg-[#0a277e] text-white text-base font-extrabold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              Konfirmasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
