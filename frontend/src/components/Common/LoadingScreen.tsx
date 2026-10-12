import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoading: boolean;
  minDuration?: number; // Minimum display time in ms to avoid flickering
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  minDuration = 1200,
  onFinish,
}) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        setFadeOut(true);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          if (onFinish) onFinish();
        }, 500);
        return () => clearTimeout(hideTimer);
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [isLoading, minDuration, onFinish]);

  // Handle when isLoading finishes after minDuration
  useEffect(() => {
    if (!isLoading && !fadeOut) {
      setFadeOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, fadeOut, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md select-none transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Soft Glow Circles */}
      <div className="absolute w-72 h-72 rounded-full bg-[#fed000]/15 blur-3xl -top-10 -left-10 pointer-events-none animate-pulse" />
      <div className="absolute w-80 h-80 rounded-full bg-[#071d63]/10 blur-3xl -bottom-10 -right-10 pointer-events-none animate-pulse" />

      {/* Main Logo & Blinking / Breathing Pulse Animation */}
      <div className="relative flex flex-col items-center">
        {/* Animated Ripple Pulse Rings */}
        <div className="absolute -inset-4 rounded-full bg-[#fed000]/30 animate-ping opacity-75 duration-1000" />
        <div className="absolute -inset-2 rounded-full bg-[#071d63]/10 animate-pulse duration-700" />

        {/* Logo Container with Smooth Breathing Scale & Glow */}
        <div className="relative w-44 sm:w-52 h-20 sm:h-24 rounded-3xl bg-white px-5 py-3 shadow-xl border border-gray-100 flex items-center justify-center animate-pulse">
          <img
            src="/images/sipina_logo_cropped.png"
            alt="Logo SIPINA"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Brand Text */}
        <div className="mt-6 text-center">
          <h2 className="text-base sm:text-lg font-black tracking-wider text-[#071d63] uppercase">
            SIPINA
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-500 tracking-wide mt-0.5">
            Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur
          </p>
        </div>

        {/* High-tech Indeterminate Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-6 shadow-inner relative">
          <div className="absolute top-0 bottom-0 bg-gradient-to-r from-[#071d63] via-[#fed000] to-[#071d63] w-1/2 rounded-full animate-[shimmer_1.4s_infinite_linear]" 
               style={{
                 animation: "loading-slide 1.4s ease-in-out infinite"
               }}
          />
        </div>

        {/* Subtle Status Text */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fed000] animate-ping" />
          <span>Memuat Sistem SIPINA...</span>
        </div>
      </div>

      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(250%); width: 30%; }
        }
      `}</style>
    </div>
  );
};
