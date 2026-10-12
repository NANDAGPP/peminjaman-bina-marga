import React, { useState, useEffect } from "react";

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("bina_marga_cookie_consent");
      if (!consent) {
        // Natural gentle delay so user sees page first
        const timer = setTimeout(() => {
          setShow(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("bina_marga_cookie_consent", "all");
      localStorage.setItem("bina_marga_cookie_consent_time", new Date().toISOString());
    } catch {}
    setShow(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem("bina_marga_cookie_consent", "essential");
      localStorage.setItem("bina_marga_cookie_consent_time", new Date().toISOString());
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Persetujuan Cookie"
      className="fixed inset-x-0 bottom-6 flex justify-center px-4 z-[9990] pointer-events-none"
    >
      <div className="w-full max-w-[520px] pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.18)] p-4 sm:p-5 text-gray-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start gap-3.5">
          {/* Cookie Icon with Soft Glow */}
          <div className="w-10 h-10 rounded-xl bg-[#fed000]/20 border border-[#fed000]/40 flex items-center justify-center shrink-0 text-xl shadow-xs">
            🍪
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#071d63] tracking-tight">
                Persetujuan Cookie & Privasi
              </h3>
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer transition-colors"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mt-1.5 font-normal">
              Website <strong>Dinas PU Bina Marga Jawa Timur</strong> menggunakan cookie untuk
              menjaga keamanan sesi login, mengingat preferensi profil, dan memastikan kelancaran
              alur peminjaman aset.
            </p>

            {/* Expandable Details Toggle */}
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              className="text-[11px] font-bold text-[#071d63] hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{detailsOpen ? "Sembunyikan detail" : "Pelajari jenis cookie"}</span>
              <svg
                className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {detailsOpen && (
              <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-gray-600 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>
                    <strong>Cookie Esensial (Wajib):</strong> Menjaga status autentikasi login pengguna dan token keamanan CSRF.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#071d63] font-bold">✓</span>
                  <span>
                    <strong>Cookie Preferensi:</strong> Menyimpan pilihan karakter avatar dan preferensi antarmuka Anda.
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-3.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3.5 rounded-xl bg-[#071d63] hover:bg-[#0a277e] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                Terima Semua
              </button>
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="py-2 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                Hanya Esensial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
