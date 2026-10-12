import React, { useState } from "react";
import NavbarUser from "../NavbarUser/NavbarUser";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQProps {
  onNavigate: (page: "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile") => void;
  currentUser?: any;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Apa itu sistem peminjaman infrastruktur ini ?",
    answer:
      "Sistem ini merupakan platform digital yang digunakan untuk mengelola peminjaman fasilitas infrastruktur operasional kedinasan (kendaraan roda empat, kendaraan roda dua, dan ruangan) secara terintegrasi, transparan, dan akuntabel.",
  },
  {
    id: 2,
    question: "Siapa saja yang dapat menggunakan sistem ini ?",
    answer:
      "Sistem ini dapat digunakan oleh pegawai atau pihak yang memiliki akses untuk mengajukan peminjaman infrastruktur sesuai dengan kebutuhan operasional.",
  },
  {
    id: 3,
    question: "Bagaimana cara mengajukan peminjaman ?",
    answer:
      "Pengguna cukup memilih kategori infrastruktur, menentukan aset yang tersedia, mengisi form peminjaman, dan mengajukan permintaan melalui sistem. Selanjutnya, permintaan akan diproses melalui tahap persetujuan.",
  },
  {
    id: 4,
    question: "Apakah saya bisa melihat status peminjaman ?",
    answer:
      "Ya, pengguna dapat memantau status peminjaman secara langsung melalui sistem, mulai dari proses pengajuan, persetujuan, hingga selesai.",
  },
  {
    id: 5,
    question: "Apa yang harus dilakukan jika aset mengalami kerusakan ?",
    answer:
      "Pengguna dapat melaporkan kerusakan melalui fitur pengaduan yang tersedia di sistem. Laporan akan diproses oleh admin untuk ditindaklanjuti.",
  },
];

export const FAQ: React.FC<FAQProps> = ({ onNavigate, currentUser }) => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between">
      {/* Top Navbar */}
      <NavbarUser activePage="faq" onNavigate={onNavigate} currentUser={currentUser} />

      {/* Main FAQ content */}
      <main className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 py-10 sm:py-14 my-auto">
        {/* FAQ Header title */}
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <img
            src="/images/faq1.png"
            alt="FAQ"
            className="w-10 sm:w-11 h-auto object-contain select-none"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-serif text-[#111827] tracking-wide">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end">
          {/* Left Accordion Column */}
          <section className="lg:col-span-7 flex flex-col space-y-4 w-full">
            {faqData.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="w-full transition-all duration-200">
                  {/* Accordion Question Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full rounded-2xl bg-[#071d63] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-left text-white font-medium text-sm sm:text-base shadow-sm hover:bg-[#0a277e] transition-all cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 font-['Poppins',sans-serif] tracking-normal">
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className="w-4 h-4 fill-[#fed000]"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12,16.5 5,8 19,8" />
                      </svg>
                    </span>
                  </button>

                  {/* Accordion Answer Body */}
                  {isOpen && (
                    <div className="mt-2 rounded-2xl bg-[#fed000] text-[#071d63] px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base leading-relaxed font-semibold shadow-sm animate-fade-in font-['Poppins',sans-serif]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Right Illustration Column */}
          <aside className="lg:col-span-5 flex justify-center lg:justify-end items-end">
            <div className="w-full max-w-[440px] lg:max-w-[480px]">
              <img
                src="/images/faq.png"
                alt="FAQ Illustration"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 select-none">
        SIPINA &copy; {new Date().getFullYear()} - Sistem Peminjaman Sarana dan Prasarana
      </footer>
    </div>
  );
};

export default FAQ;
