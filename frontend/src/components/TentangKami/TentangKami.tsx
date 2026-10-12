import React from "react";
import NavbarUser from "../NavbarUser/NavbarUser";

interface TentangKamiProps {
  onNavigate: (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile") => void;
  currentUser?: any;
}

export const TentangKami: React.FC<TentangKamiProps> = ({ onNavigate, currentUser }) => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between">
      {/* Top navigation header */}
      <NavbarUser activePage="tentang" onNavigate={onNavigate} currentUser={currentUser} />

      {/* Main content body */}
      <main className="w-full max-w-[1240px] mx-auto px-6 py-10 sm:py-16 my-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Left asset photo collage */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="w-full max-w-[480px] overflow-hidden rounded-3xl">
              <img
                src="/images/tentang.png"
                alt="Fasilitas dan Infrastruktur Dinas Pekerjaan Umum Bina Marga"
                className="w-full h-auto object-cover select-none"
              />
            </div>
          </div>

          {/* Right descriptive text */}
          <article className="w-full lg:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              <span className="text-[#071d63]">Tentang </span>
              <span className="text-[#fed000]">Kami</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify mb-5 font-normal">
              Sistem ini merupakan platform digital yang dirancang untuk mempermudah
              pengelolaan peminjaman infrastruktur seperti mobil, motor, laptop, dan
              ruang dalam satu sistem yang terintegrasi. Melalui platform ini, pengguna
              dapat melakukan pengajuan peminjaman, memantau status penggunaan, serta
              mengelola jadwal secara lebih terstruktur dan efisien.
            </p>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify font-normal">
              Selain itu, sistem ini juga mendukung proses persetujuan yang lebih
              transparan serta pencatatan data yang terdokumentasi dengan baik, sehingga
              dapat meningkatkan efektivitas pengelolaan aset dan mendukung kelancaran
              kegiatan operasional.
            </p>
          </article>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 select-none">
        SIPINA &copy; {new Date().getFullYear()} - Sistem Peminjaman Sarana dan Prasarana
      </footer>
    </div>
  );
};

export default TentangKami;
