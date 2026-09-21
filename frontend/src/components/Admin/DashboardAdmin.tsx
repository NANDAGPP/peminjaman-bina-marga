import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import { ApiError, fetchDashboard } from "../../services/api";

interface DashboardAdminProps {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  delay?: number;
}> = ({ value, duration = 1200, delay = 100 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth easeOutCubic curve
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(easeProgress * value));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(value);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, delay]);

  return <span>{count}</span>;
};

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [counts, setCounts] = useState({
    totalUser: 0,
    totalMobil: 0,
    totalMotor: 0,
    totalRuangan: 0,
    tersediaMobil: 0,
    tersediaMotor: 0,
    tersediaRuang: 0,
    perbaikanMobil: 0,
    perbaikanMotor: 0,
    perbaikanRuang: 0,
    pinjamMobil: 0,
    pinjamMotor: 0,
    pinjamRuang: 0,
  });

  useEffect(() => {
    // Trigger smooth left-to-right progress bar animation
    const animTimer = setTimeout(() => {
      setAnimateProgress(true);
    }, 120);

    fetchDashboard()
      .then(({ counts, status }) => {
        setCounts({
          totalUser: counts.totalUser,
          totalMobil: counts.totalMobil,
          totalMotor: counts.totalMotor,
          totalRuangan: counts.totalRuangan,
          tersediaMobil: status.mobil.tersedia,
          tersediaMotor: status.motor.tersedia,
          tersediaRuang: status.ruangan.tersedia,
          perbaikanMobil: status.mobil.maintenance,
          perbaikanMotor: status.motor.maintenance,
          perbaikanRuang: status.ruangan.maintenance,
          pinjamMobil: status.mobil.dipinjam,
          pinjamMotor: status.motor.dipinjam,
          pinjamRuang: status.ruangan.dipinjam,
        });
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiError ? err.message : "Gagal memuat ringkasan dashboard."
        );
      });

    return () => clearTimeout(animTimer);
  }, []);

  // Calculation for progress bars (percentage based on available vs total or baseline)
  const maxMobil = Math.max(counts.totalMobil || 0, counts.tersediaMobil || 0, 40);
  const pctMobil = Math.min(
    100,
    Math.max(counts.tersediaMobil > 0 ? 5 : 0, Math.round(((counts.tersediaMobil || 0) / maxMobil) * 100))
  );

  const maxMotor = Math.max(counts.totalMotor || 0, counts.tersediaMotor || 0, 40);
  const pctMotor = Math.min(
    100,
    Math.max(counts.tersediaMotor > 0 ? 5 : 0, Math.round(((counts.tersediaMotor || 0) / maxMotor) * 100))
  );

  const maxRuang = Math.max(counts.totalRuangan || 0, counts.tersediaRuang || 0, 40);
  const pctRuang = Math.min(
    100,
    Math.max(counts.tersediaRuang > 0 ? 5 : 0, Math.round(((counts.tersediaRuang || 0) / maxRuang) * 100))
  );

  return (
    <AdminLayout
      activePage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {errorMessage}
          </p>
        )}

        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Metric Total Pengguna */}
          <div className="h-[120px] sm:h-[125px] rounded-[22px] p-3.5 sm:p-4 bg-gradient-to-br from-[#f5c638] via-[#eebf34] to-[#dfab22] relative overflow-hidden text-white shadow-[0_6px_16px_rgba(190,144,36,0.15)] flex flex-col justify-between select-none">
            <div>
              <div className="mb-1">
                <img
                  src="/images/totalpengguna.png"
                  alt="Total Pengguna"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain brightness-0 invert drop-shadow-xs"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold block text-white tracking-wide">
                Total Pengguna
              </span>
            </div>

            {/* Large Number & Visual Indicator */}
            <div className="flex items-center mt-auto w-full relative">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none shrink-0 mr-2 drop-shadow-xs">
                <AnimatedCounter value={counts.totalUser} duration={1000} delay={50} />
              </span>
              <div className="flex-1 flex items-center min-w-0 pr-0">
                <div className="w-1.5 h-1.5 bg-white rotate-45 shrink-0" />
                <div className="flex-1 h-[2px] bg-white" />
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3.5px] border-white flex items-center justify-center shrink-0 -mr-1 -mb-1">
                <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Metric Total Mobil */}
          <div className="h-[120px] sm:h-[125px] rounded-[22px] p-3.5 sm:p-4 bg-[#dde3ea] relative overflow-hidden text-[#071d63] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-200/60 flex flex-col justify-between select-none">
            <div>
              <div className="mb-1">
                <img
                  src="/images/totalmobil.png"
                  alt="Total Mobil"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold block text-[#1e293b] tracking-wide">
                Total Mobil
              </span>
            </div>

            {/* Large Number & Visual Indicator */}
            <div className="flex items-center mt-auto w-full relative">
              <span className="text-3xl sm:text-4xl font-black text-[#1e293b] leading-none shrink-0 mr-2 drop-shadow-xs">
                <AnimatedCounter value={counts.totalMobil} duration={1100} delay={100} />
              </span>
              <div className="flex-1 flex items-center min-w-0 pr-0">
                <div className="w-1.5 h-1.5 bg-[#071d63] rotate-45 shrink-0" />
                <div className="flex-1 h-[2px] bg-[#071d63]" />
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3.5px] border-[#071d63] flex items-center justify-center shrink-0 -mr-1 -mb-1">
                <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#071d63]" />
              </div>
            </div>
          </div>

          {/* Metric Total Motor */}
          <div className="h-[120px] sm:h-[125px] rounded-[22px] p-3.5 sm:p-4 bg-[#dde3ea] relative overflow-hidden text-[#071d63] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-200/60 flex flex-col justify-between select-none">
            <div>
              <div className="mb-1">
                <img
                  src="/images/totalmotor.png"
                  alt="Total Motor"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold block text-[#1e293b] tracking-wide">
                Total Motor
              </span>
            </div>

            {/* Large Number & Visual Indicator */}
            <div className="flex items-center mt-auto w-full relative">
              <span className="text-3xl sm:text-4xl font-black text-[#1e293b] leading-none shrink-0 mr-2 drop-shadow-xs">
                <AnimatedCounter value={counts.totalMotor} duration={1200} delay={150} />
              </span>
              <div className="flex-1 flex items-center min-w-0 pr-0">
                <div className="w-1.5 h-1.5 bg-[#071d63] rotate-45 shrink-0" />
                <div className="flex-1 h-[2px] bg-[#071d63]" />
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3.5px] border-[#071d63] flex items-center justify-center shrink-0 -mr-1 -mb-1">
                <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#071d63]" />
              </div>
            </div>
          </div>

          {/* Metric Total Ruangan */}
          <div className="h-[120px] sm:h-[125px] rounded-[22px] p-3.5 sm:p-4 bg-[#dde3ea] relative overflow-hidden text-[#071d63] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-200/60 flex flex-col justify-between select-none">
            <div>
              <div className="mb-1">
                <img
                  src="/images/totalruangan.png"
                  alt="Total Ruangan"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold block text-[#1e293b] tracking-wide">
                Total Ruangan
              </span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center mt-auto w-full relative">
              <span className="text-3xl sm:text-4xl font-black text-[#1e293b] leading-none shrink-0 mr-2 drop-shadow-xs">
                <AnimatedCounter value={counts.totalRuangan} duration={1300} delay={200} />
              </span>
              <div className="flex-1 flex items-center min-w-0 pr-0">
                <div className="w-1.5 h-1.5 bg-[#071d63] rotate-45 shrink-0" />
                <div className="flex-1 h-[2px] bg-[#071d63]" />
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3.5px] border-[#071d63] flex items-center justify-center shrink-0 -mr-1 -mb-1">
                <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#071d63]" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Aset dengan Status Tersedia */}
        <div className="w-full bg-white rounded-[22px] border border-gray-200/80 shadow-xs p-4 sm:p-5 mb-4">
          <div className="text-xs sm:text-sm font-extrabold text-[#071d63] tracking-wide mb-2">
            Aset dengan Status Tersedia
          </div>
          <div className="w-full h-px bg-gray-300 relative mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute left-0 -top-[2.5px]" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute right-0 -top-[2.5px]" />
          </div>

          <div className="space-y-4">
            {/* Baris 1: Kendaraan Mobil */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 w-36 sm:w-44 shrink-0">
                <img
                  src="/images/totalmobil.png"
                  alt="Mobil"
                  className="w-6 h-6 shrink-0 object-contain"
                />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Kendaraan Mobil
                </span>
              </div>
              <div className="flex-1 mx-3 sm:mx-5 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-[#c99710] transition-all ease-out"
                  style={{
                    width: animateProgress ? `${pctMobil}%` : "0%",
                    transitionDuration: "1200ms",
                    transitionDelay: "150ms",
                  }}
                />
              </div>
              <span className="font-black text-gray-900 text-base sm:text-lg w-8 text-right shrink-0">
                <AnimatedCounter value={counts.tersediaMobil} duration={1200} delay={150} />
              </span>
            </div>

            {/* Baris 2: Kendaraan Motor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 w-36 sm:w-44 shrink-0">
                <img
                  src="/images/totalmotor.png"
                  alt="Motor"
                  className="w-6 h-6 shrink-0 object-contain"
                />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Kendaraan Motor
                </span>
              </div>
              <div className="flex-1 mx-3 sm:mx-5 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-[#c99710] transition-all ease-out"
                  style={{
                    width: animateProgress ? `${pctMotor}%` : "0%",
                    transitionDuration: "1350ms",
                    transitionDelay: "300ms",
                  }}
                />
              </div>
              <span className="font-black text-gray-900 text-base sm:text-lg w-8 text-right shrink-0">
                <AnimatedCounter value={counts.tersediaMotor} duration={1350} delay={300} />
              </span>
            </div>

            {/* Baris 3: Ruangan */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 w-36 sm:w-44 shrink-0">
                <img
                  src="/images/totalruangan.png"
                  alt="Ruang"
                  className="w-6 h-6 shrink-0 object-contain"
                />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Ruangan
                </span>
              </div>
              <div className="flex-1 mx-3 sm:mx-5 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-[#c99710] transition-all ease-out"
                  style={{
                    width: animateProgress ? `${pctRuang}%` : "0%",
                    transitionDuration: "1500ms",
                    transitionDelay: "450ms",
                  }}
                />
              </div>
              <span className="font-black text-gray-900 text-base sm:text-lg w-8 text-right shrink-0">
                <AnimatedCounter value={counts.tersediaRuang} duration={1500} delay={450} />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card Kiri: Aset dalam Proses Perbaikan */}
          <div className="w-full bg-white rounded-[22px] border border-gray-200/80 shadow-xs p-4 sm:p-5">
            <div className="text-xs sm:text-sm font-extrabold text-[#071d63] tracking-wide mb-2">
              Aset dalam Proses Perbaikan
            </div>
            <div className="w-full h-px bg-gray-300 relative mb-3.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute left-0 -top-[2.5px]" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute right-0 -top-[2.5px]" />
            </div>

            <div className="space-y-3.5">
              {/* Baris 1: Kendaraan Mobil */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalmobil.png"
                      alt="Mobil"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Kendaraan Mobil
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.perbaikanMobil}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#ef4444] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] absolute left-0 -top-[2.25px]" />
                </div>
              </div>

              {/* Baris 2: Kendaraan Motor */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalmotor.png"
                      alt="Motor"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Kendaraan Motor
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.perbaikanMotor}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#ef4444] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] absolute left-0 -top-[2.25px]" />
                </div>
              </div>

              {/* Baris 3: Ruangan */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalruangan.png"
                      alt="Ruangan"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Ruangan
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.perbaikanRuang}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#ef4444] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] absolute left-0 -top-[2.25px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card Kanan: Aset dalam Status Peminjaman */}
          <div className="w-full bg-white rounded-[22px] border border-gray-200/80 shadow-xs p-4 sm:p-5">
            <div className="text-xs sm:text-sm font-extrabold text-[#071d63] tracking-wide mb-2">
              Aset dalam Status Peminjaman
            </div>
            <div className="w-full h-px bg-gray-300 relative mb-3.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute left-0 -top-[2.5px]" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute right-0 -top-[2.5px]" />
            </div>

            <div className="space-y-3.5">
              {/* Baris 1: Kendaraan Mobil */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalmobil.png"
                      alt="Mobil"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Kendaraan Mobil
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.pinjamMobil}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#071d63] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#071d63] absolute left-0 -top-[2.25px]" />
                </div>
              </div>

              {/* Baris 2: Kendaraan Motor */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalmotor.png"
                      alt="Motor"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Kendaraan Motor
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.pinjamMotor}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#071d63] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#071d63] absolute left-0 -top-[2.25px]" />
                </div>
              </div>

              {/* Baris 3: Ruangan */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/totalruangan.png"
                      alt="Ruangan"
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      Ruangan
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    {counts.pinjamRuang}
                  </span>
                </div>
                <div className="w-full h-[1.5px] bg-[#071d63] relative mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#071d63] absolute left-0 -top-[2.25px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
