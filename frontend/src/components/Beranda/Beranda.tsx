import React from "react";
import NavbarUser from "../NavbarUser/NavbarUser";
import facebook from "../LoginUser/facebook.svg";
import instagram from "../LoginUser/instagram.svg";
import x from "../LoginUser/x.svg";
import youTube from "../LoginUser/you-tube.svg";

interface BerandaProps {
  currentUser?: {
    username?: string;
    nama?: string;
    nip?: string;
  } | null;
  onNavigate: (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile" | "peminjaman-mobil" | "peminjaman-motor" | "peminjaman-ruang") => void;
  onOpenLogin: () => void;
  onSelectCategory?: (category: "Mobil" | "Motor" | "Ruang") => void;
}

export const Beranda: React.FC<BerandaProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
  onSelectCategory,
}) => {
  const isLoggedIn = Boolean(currentUser);

  const handleHeroAction = () => {
    const target = document.getElementById("kategori-infrastruktur");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryAction = (category: "Mobil" | "Motor" | "Ruang") => {
    if (isLoggedIn) {
      if (onSelectCategory) {
        onSelectCategory(category);
      } else {
        const target = `peminjaman-${category.toLowerCase()}` as any;
        onNavigate(target);
      }
    } else {
      onOpenLogin();
    }
  };

  const handlePengaduanAction = () => {
    onNavigate("pengaduan");
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans selection:bg-[#fed000] selection:text-[#071d63]">
      {/* Top Navbar */}
      <NavbarUser activePage="beranda" onNavigate={onNavigate as any} currentUser={currentUser} />

      {/* Hero Section */}
      <section className="w-full max-w-[1100px] mx-auto px-6 pt-8 sm:pt-12 pb-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Hero Left Content */}
          <div className="w-full lg:w-[56%] flex flex-col items-start text-left z-10">
            <h1 className="text-3xl sm:text-[42px] lg:text-[46px] font-black text-[#071d63] leading-[1.14] tracking-tight mb-5 [font-family:'Poppins',sans-serif] [text-shadow:_0_4px_10px_rgba(7,29,99,0.3)]">
              Kelola Peminjaman <br />
              <span className="whitespace-nowrap">
                <span className="text-[#fed000]">Infrastruktur</span>{" "}
                <span className="text-[#071d63]">dengan</span>
              </span> <br />
              Lebih Mudah dan <br />
              Terintegrasi
            </h1>

            <p className="text-sm sm:text-[15px] text-[#071d63] leading-[1.65] max-w-[500px] mb-7 font-semibold">
              Satu platform untuk mengatur peminjaman kendaraan, ruang,
              barang, hingga alat berat secara cepat, transparan, dan efisien
              guna mendukung kegiatan operasional Anda.
            </p>

            <button
              type="button"
              onClick={handleHeroAction}
              className="px-8 py-3.5 rounded-2xl bg-[#fed000] text-[#071d63] font-black text-sm sm:text-base shadow-md hover:bg-[#e6bd00] transition-transform active:scale-95 focus:outline-none cursor-pointer"
            >
              Ajukan Peminjaman
            </button>
          </div>

          {/* Hero Right Visual */}
          <div className="w-full lg:w-[44%] flex justify-end items-center relative">
            <img
              src="/images/hero-glow.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-12 -right-8 w-[125%] max-w-[620px] h-auto object-contain pointer-events-none select-none -z-0 opacity-90"
              style={{
                maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 72%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 72%)",
              }}
            />
            <img
              src="/images/beranda.png"
              alt="Ilustrasi Peminjaman Infrastruktur DPU Bina Marga"
              className="relative z-10 w-full max-w-[500px] h-auto object-contain select-none"
            />
          </div>
        </div>
      </section>

      {/* Section: Kategori Infrastruktur yang Tersedia */}
      <section id="kategori-infrastruktur" className="w-full max-w-[1100px] mx-auto px-6 pt-8 pb-20 scroll-mt-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-[34px] font-black text-[#071d63] tracking-tight mb-3 [font-family:'Poppins',sans-serif]">
            Kategori Infrastruktur yang Tersedia
          </h2>

          <p className="text-xs sm:text-[13.5px] text-gray-700 max-w-[760px] mx-auto mb-14 leading-[1.6] font-normal">
            Pilih berbagai fasilitas yang dapat dipinjam sesuai kebutuhan
            operasional Anda, mulai dari kendaraan hingga perangkat kerja,
            semuanya tersedia dalam satu sistem yang mudah dan terintegrasi.
          </p>

          {/* 3 Kategori Cards */}
          <div className="flex flex-wrap justify-center gap-7 lg:gap-10">
            {/* Card Mobil */}
            <div
              onClick={() => handleCategoryAction("Mobil")}
              className="w-[280px] sm:w-[290px] h-[490px] sm:h-[505px] flex flex-col items-center text-center pt-8 pb-8 px-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer select-none group rounded-[38px] border border-[#fed000] bg-white shadow-[0_8px_25px_rgba(254,208,0,0.18)] hover:shadow-[0_16px_35px_rgba(254,208,0,0.28)]"
            >
              <div className="w-full h-full flex flex-col items-center">
                <h3 className="text-sm font-black tracking-[0.25em] text-[#111111] uppercase mb-4">
                  MOBIL
                </h3>
                <div className="h-32 w-full flex items-center justify-center my-auto">
                  <img
                    src="/images/mobil.png"
                    alt="Mobil"
                    className="w-[150px] h-auto object-contain select-none group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[75%] border-t border-gray-300 my-4" />
                <p className="text-xs sm:text-[12.5px] text-[#222222] leading-[1.65] font-normal max-w-[220px] text-center mb-6">
                  Mendukung mobilitas kegiatan operasional dengan kendaraan dinas
                  yang siap digunakan untuk perjalanan resmi maupun kegiatan
                  lapangan.
                </p>
                <span className="mt-auto text-xs sm:text-[13px] font-medium text-[#071d63] underline underline-offset-4 group-hover:text-[#0c2a86] transition-colors">
                  Ajukan Peminjaman
                </span>
              </div>
            </div>

            {/* Card Motor */}
            <div
              onClick={() => handleCategoryAction("Motor")}
              className="w-[280px] sm:w-[290px] h-[490px] sm:h-[505px] flex flex-col items-center text-center pt-8 pb-8 px-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer select-none group rounded-[38px] border border-[#fed000] bg-white shadow-[0_8px_25px_rgba(254,208,0,0.18)] hover:shadow-[0_16px_35px_rgba(254,208,0,0.28)]"
            >
              <div className="w-full h-full flex flex-col items-center">
                <h3 className="text-sm font-black tracking-[0.25em] text-[#111111] uppercase mb-4">
                  MOTOR
                </h3>
                <div className="h-32 w-full flex items-center justify-center my-auto">
                  <img
                    src="/images/motor.png"
                    alt="Motor"
                    className="w-[125px] h-auto object-contain select-none group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[75%] border-t border-gray-300 my-4" />
                <p className="text-xs sm:text-[12.5px] text-[#222222] leading-[1.65] font-normal max-w-[220px] text-center mb-6">
                  Solusi transportasi yang praktis dan efisien untuk menunjang
                  aktivitas operasional jarak dekat dengan lebih cepat dan
                  fleksibel.
                </p>
                <span className="mt-auto text-xs sm:text-[13px] font-medium text-[#071d63] underline underline-offset-4 group-hover:text-[#0c2a86] transition-colors">
                  Ajukan Peminjaman
                </span>
              </div>
            </div>

            {/* Card Ruang */}
            <div
              onClick={() => handleCategoryAction("Ruang")}
              className="w-[280px] sm:w-[290px] h-[490px] sm:h-[505px] flex flex-col items-center text-center pt-8 pb-8 px-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer select-none group rounded-[38px] border border-[#fed000] bg-white shadow-[0_8px_25px_rgba(254,208,0,0.18)] hover:shadow-[0_16px_35px_rgba(254,208,0,0.28)]"
            >
              <div className="w-full h-full flex flex-col items-center">
                <h3 className="text-sm font-black tracking-[0.25em] text-[#111111] uppercase mb-4">
                  RUANG
                </h3>
                <div className="h-32 w-full flex items-center justify-center my-auto">
                  <img
                    src="/images/ruang.png"
                    alt="Ruang"
                    className="w-[145px] h-auto object-contain select-none group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[75%] border-t border-gray-300 my-4" />
                <p className="text-xs sm:text-[12.5px] text-[#222222] leading-[1.65] font-normal max-w-[220px] text-center mb-6">
                  Gunakan fasilitas ruang untuk berbagai keperluan seperti rapat,
                  koordinasi, dan kegiatan internal dengan lebih terjadwal dan
                  terorganisir.
                </p>
                <span className="mt-auto text-xs sm:text-[13px] font-medium text-[#071d63] underline underline-offset-4 group-hover:text-[#0c2a86] transition-colors">
                  Ajukan Peminjaman
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Dari Proses Manual ke Manajemen Infrastruktur yang Lebih Cerdas */}
      <section className="w-full max-w-[1100px] mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-[36px] font-serif font-black text-[#111111] tracking-tight mb-3 leading-tight">
            Dari Proses Manual ke Manajemen <br />
            Infrastruktur yang Lebih Cerdas.
          </h2>
          <p className="text-xs sm:text-[13.5px] text-gray-700 font-normal leading-relaxed max-w-[680px] mx-auto">
            Ada beberapa alasan mendasar mengapa kami merancang sistem peminjaman
            infrastruktur digital ini, terutama sebagai upaya optimalisasi tata
            kelola aset di lingkungan Dinas PU Bina Marga.
          </p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-12 order-2 lg:order-1">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#071d63] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                1.
              </div>
              <div>
                <h3 className="text-sm font-bold text-black mb-1.5">
                  Akuntabilitas Pemanfaatan Infrastruktur
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed max-w-[280px]">
                  Membangun sistem pencatatan riwayat penggunaan yang sistematis
                  guna menjamin transparansi dan kemudahan proses audit aset.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fed000] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                2.
              </div>
              <div>
                <h3 className="text-sm font-bold text-black mb-1.5">
                  Pusat Informasi Terintegrasi
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed max-w-[280px]">
                  Menyatukan seluruh data infrastruktur dalam satu kendali untuk
                  menghilangkan sekat informasi antar bidang.
                </p>
              </div>
            </div>
          </div>

          {/* Center Column */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="w-full max-w-[340px] sm:max-w-[380px]">
              <img
                src="/images/infra.png"
                alt="Manajemen Infrastruktur Terpadu"
                className="w-full h-auto object-contain select-none hover:scale-102 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 order-3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fed000] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                3.
              </div>
              <div>
                <h3 className="text-sm font-bold text-black mb-1.5">
                  Kemudahan Prosedur dalam Satu Pintu
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed max-w-[280px]">
                  Memberikan akses yang lebih luas bagi unit terkait untuk
                  melakukan permohonan peminjaman secara mandiri melalui satu
                  antarmuka digital.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#071d63] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                4.
              </div>
              <div>
                <h3 className="text-sm font-bold text-black mb-1.5">
                  Keseragaman Prosedur Administrasi
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed max-w-[280px]">
                  Menerapkan standar operasional (SOP) yang sama untuk setiap
                  proses peminjaman guna menciptakan tata kelola birokrasi yang
                  konsisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Optimalisasi Pengawasan Aset Infrastruktur */}
      <section className="w-full bg-[#f0f2f5] py-14 sm:py-20 px-4 sm:px-6">
        <div className="w-full max-w-[1060px] mx-auto flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8">
          {/* Photo Card Left */}
          <div className="w-full lg:w-1/2 rounded-[32px] overflow-hidden shadow-sm">
            <img
              src="/images/pengaduan.png"
              alt="Tim Pengawasan Aset dan Layanan Pengaduan"
              className="w-full h-full min-h-[360px] sm:min-h-[420px] object-cover"
            />
          </div>

          {/* White Content Card Right */}
          <div className="w-full lg:w-1/2 rounded-[32px] bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center items-start text-left shadow-sm">
            <h2 className="text-2xl sm:text-[34px] lg:text-[38px] font-black text-black tracking-tight leading-[1.15] mb-5 [font-family:'Poppins-ExtraBold',sans-serif]">
              Optimalisasi <br />
              Pengawasan Aset <br />
              Infrastruktur
            </h2>

            <p className="text-xs sm:text-[13px] text-[#1e1e1e] leading-[1.7] font-normal max-w-[440px] mb-8">
              Laporkan ketidaksesuaian prosedur, kerusakan aset, atau kendala
              administrasi di sini. Kami berkomitmen menjaga transparansi demi
              mewujudkan tata kelola aset yang akuntabel di lingkungan Dinas PU
              Bina Marga.
            </p>

            <button
              type="button"
              onClick={handlePengaduanAction}
              className="px-7 py-3 rounded-[12px] bg-[#071d63] text-white font-bold text-xs sm:text-sm hover:bg-[#0c2a86] transition-transform active:scale-95 shadow-sm focus:outline-none"
            >
              Buat Pengaduan
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#262626] text-white pt-12 pb-7 px-6 mt-auto">
        <div className="w-full max-w-[1050px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Footer Left: Brand & Quote */}
          <div className="md:col-span-5 flex flex-col">
            <div className="flex items-center gap-3.5 mb-6">
              <img
                src="/images/sipina_logo_cropped.png"
                alt="Logo SIPINA"
                className="h-11 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col text-white font-bold leading-tight tracking-tight uppercase">
                <span className="text-sm font-black text-white">SIPINA</span>
                <span className="text-[10px] text-gray-300">SISTEM PEMINJAMAN SARANA & PRASARANA</span>
              </div>
            </div>

            <blockquote className="border-l-4 border-[#fed000] pl-4 text-xs sm:text-[13px] text-white font-normal leading-relaxed">
              &ldquo;Mulai kelola peminjaman
              <br />
              infrastruktur dengan lebih mudah dan
              <br />
              terstruktur melalui satu sistem
              <br />
              terintegrasi.&rdquo;
            </blockquote>
          </div>

          {/* Footer Middle: Contact Info */}
          <div className="md:col-span-5 flex flex-col">
            <h3 className="text-sm sm:text-[15px] font-bold text-white mb-4">
              Alamat Kontak SIPINA
            </h3>
            <ul className="space-y-3.5 text-[11px] sm:text-xs text-gray-200 leading-relaxed font-light">
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>
                  Layanan SIPINA - Jl. Gayung Kebonsari No.167, Gayungan, Kec. Gayungan, Surabaya, Jawa Timur 60235
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a
                  href="https://wa.me/6289612548511"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white transition-colors"
                >
                  WA SIPINA: 031-8290186, +62-896-1254-8511
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:sipina@jatimprov.go.id"
                  className="hover:underline hover:text-white transition-colors"
                >
                  sipina@jatimprov.go.id
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex flex-col">
                  <span>Senin - Kamis : 08:00 – 16:00</span>
                  <span>Jumat : 07:30 – 16:00</span>
                  <span>Sabtu - Minggu : Libur</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Footer Right: Social Media */}
          <div className="md:col-span-2 flex flex-row md:flex-col justify-start md:justify-center items-center md:items-end gap-3.5 pt-2">
            {[
              { name: "X", icon: x, url: "https://x.com/sipina_jatim" },
              { name: "Instagram", icon: instagram, url: "https://www.instagram.com/sipina_jatim" },
              { name: "YouTube", icon: youTube, url: "https://youtube.com/@sipina_jatim" },
              { name: "Facebook", icon: facebook, url: "https://www.facebook.com/sipina.jatim" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                className="w-6 h-6 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-transform"
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-full h-full"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="w-full max-w-[650px] mx-auto border-t border-gray-600/70 mt-10 mb-4" />
        <div className="w-full max-w-[1050px] mx-auto text-center text-[11px] text-gray-300 font-light">
          Copyright &copy; {new Date().getFullYear()} |{" "}
          <span className="underline underline-offset-2">
            SIPINA - Sistem Peminjaman Sarana dan Prasarana
          </span>
          . All rights reserved
        </div>

      </footer>
    </div>
  );
};

export default Beranda;
