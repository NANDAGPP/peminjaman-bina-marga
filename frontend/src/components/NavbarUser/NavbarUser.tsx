import React, { useState, useEffect } from "react";

export interface NavbarUserProps {
  activePage: "beranda" | "tentang" | "pengaduan" | "faq" | "profile";
  onNavigate: (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile" | "admin-login") => void;
  currentUser?: {
    username?: string;
    nama?: string;
    nip?: string;
    foto?: string;
  } | null;
}

const VALID_NAVBAR_AVATARS = [
  "/images/avatar_wanita.png",
  "/images/avatar_pria.png",
  "/images/avatar_default.png",
];

export const NavbarUser: React.FC<NavbarUserProps> = ({ activePage, onNavigate, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>(() => {
    try {
      if (!currentUser) return "/images/profile.png";
      if (currentUser.foto && VALID_NAVBAR_AVATARS.includes(currentUser.foto)) {
        return currentUser.foto;
      }
      const userKey = currentUser.username ? `bina_marga_user_avatar_${currentUser.username}` : "";
      if (userKey) {
        const savedUser = localStorage.getItem(userKey);
        if (savedUser && VALID_NAVBAR_AVATARS.includes(savedUser)) return savedUser;
      }
      const saved = localStorage.getItem("bina_marga_user_avatar");
      if (saved && VALID_NAVBAR_AVATARS.includes(saved)) return saved;
      return "/images/avatar_pria.png";
    } catch {
      return "/images/profile.png";
    }
  });

  useEffect(() => {
    const updateAvatar = () => {
      try {
        if (!currentUser) {
          setAvatar("/images/profile.png");
          return;
        }
        if (currentUser.foto && VALID_NAVBAR_AVATARS.includes(currentUser.foto)) {
          setAvatar(currentUser.foto);
          return;
        }

        const userKey = currentUser.username ? `bina_marga_user_avatar_${currentUser.username}` : "";
        if (userKey) {
          const savedUser = localStorage.getItem(userKey);
          if (savedUser && VALID_NAVBAR_AVATARS.includes(savedUser)) {
            setAvatar(savedUser);
            return;
          }
        }
        const saved = localStorage.getItem("bina_marga_user_avatar");
        if (saved && VALID_NAVBAR_AVATARS.includes(saved)) {
          setAvatar(saved);
        } else {
          setAvatar("/images/avatar_pria.png");
        }
      } catch {
        setAvatar("/images/profile.png");
      }
    };

    window.addEventListener("avatarChanged", updateAvatar);
    window.addEventListener("storage", updateAvatar);
    updateAvatar();

    return () => {
      window.removeEventListener("avatarChanged", updateAvatar);
      window.removeEventListener("storage", updateAvatar);
    };
  }, [currentUser]);

  const navItems = [
    { key: "beranda", label: "Beranda" },
    { key: "tentang", label: "Tentang" },
    { key: "pengaduan", label: "Pengaduan" },
    { key: "faq", label: "FAQ" },
  ] as const;

  const handleMobileNav = (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile" | "admin-login") => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 relative z-50">
      <div className="w-full rounded-[22px] bg-[#fed000] px-4 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        {/* Left branding */}
        <div
          onClick={() => onNavigate("beranda")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
        >
          <img
            src="/images/logobina.png"
            alt="Logo DPU Bina Marga Jawa Timur"
            className="h-8 sm:h-11 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col text-[#071d63] font-black text-[9.5px] sm:text-[11.5px] leading-tight tracking-tight uppercase [font-family:'Poppins',sans-serif]">
            <span>Dinas Pekerjaan Umum Bina</span>
            <span>Marga Provinsi Jawa Timur</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-9">
          {navItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`relative text-sm sm:text-[15px] font-bold text-[#071d63] transition-opacity hover:opacity-80 focus:outline-none cursor-pointer ${
                  isActive ? "font-extrabold" : "font-bold"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#071d63] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Profile Avatar + Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Profile Circle Avatar Button */}
          <button
            type="button"
            onClick={() => onNavigate(currentUser ? "profile" : "login")}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center shadow-sm hover:opacity-95 transition-transform active:scale-95 focus:outline-none cursor-pointer border-2 border-[#071d63] bg-white shrink-0"
            title={currentUser ? `Profil: ${currentUser.nama || currentUser.username}` : "Masuk / Login Pengguna"}
            aria-label={currentUser ? "Profil Pengguna" : "Login Pengguna"}
          >
            <img
              src={avatar}
              alt="Profil Pengguna"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = currentUser ? "/images/avatar_default.png" : "/images/profile.png";
              }}
            />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#071d63] text-white hover:bg-[#0c2a86] transition-colors focus:outline-none cursor-pointer"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 w-full rounded-2xl bg-white border border-[#fed000] shadow-xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMobileNav(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${
                  isActive
                    ? "bg-[#fed000] text-[#071d63] font-black"
                    : "text-[#071d63] hover:bg-gray-100"
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#071d63]" />}
              </button>
            );
          })}
          <hr className="my-1 border-gray-100" />
          <button
            type="button"
            onClick={() => handleMobileNav(currentUser ? "profile" : "login")}
            className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-[#071d63] hover:bg-gray-100 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full overflow-hidden inline-block border border-[#071d63]">
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              </span>
              <span>{currentUser ? "Profil & Riwayat" : "Masuk / Login"}</span>
            </span>
            <svg className="w-4 h-4 text-[#071d63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default NavbarUser;
