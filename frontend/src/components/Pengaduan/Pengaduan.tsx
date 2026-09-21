import React, { FormEvent, useState } from "react";
import NavbarUser from "../NavbarUser/NavbarUser";
import PengaduanBerhasilModal from "./PengaduanBerhasilModal";
import { ApiError, createPengaduan } from "../../services/api";

type NavbarPage = "beranda" | "tentang" | "pengaduan" | "faq" | "login" | "profile" | "admin-login";

interface PengaduanProps {
  onNavigate: (page: NavbarPage) => void;
  currentUser?: {
    nama?: string;
    username?: string;
    nip?: string;
    foto?: string;
  } | null;
}

export const Pengaduan: React.FC<PengaduanProps> = ({ onNavigate, currentUser }) => {
  const [keluhan, setKeluhan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Identitas pelapor diambil backend dari sesi login, kolom ini hanya konfirmasi.
  const nama = currentUser?.nama || currentUser?.username || "";
  const nip = currentUser?.nip || "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage("Silakan login terlebih dahulu untuk mengajukan pengaduan.");
      return;
    }

    if (!keluhan.trim()) {
      setErrorMessage("Kolom keluhan wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPengaduan(keluhan.trim());
      setKeluhan("");
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Terjadi kendala saat memproses laporan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between select-none">
      <NavbarUser
        activePage="pengaduan"
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <main className="w-full max-w-[1060px] mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="relative w-full rounded-[28px] bg-white shadow-[0_12px_45px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[550px]">
          
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-0 bottom-0 w-[27%] bg-[#071d63] z-0"
          />

          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-0 right-10 w-7 h-14 bg-[#fed000] z-10 shadow-xs"
          />

          <section className="w-full lg:w-[68%] p-8 sm:p-12 lg:p-14 z-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl sm:text-[34px] font-black text-[#071d63] tracking-tight mb-2 font-sans">
                Ada Kendala? Laporkan di Sini
              </h1>
              <p className="text-sm text-gray-500 font-normal mb-8 leading-relaxed max-w-[450px]">
                Gunakan formulir ini untuk melaporkan kerusakan atau kendala pada
                aset yang sedang digunakan
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-[430px]">
                <div>
                  <label htmlFor="nama" className="sr-only">
                    Nama
                  </label>
                  <input
                    id="nama"
                    type="text"
                    value={nama}
                    readOnly
                    placeholder="Nama"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm text-[#071d63] placeholder:text-[#071d63] placeholder:font-semibold focus:border-[#071d63] focus:outline-none focus:ring-1 focus:ring-[#071d63] transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="nip" className="sr-only">
                    NIP
                  </label>
                  <input
                    id="nip"
                    type="text"
                    value={nip}
                    readOnly
                    placeholder="NIP"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm text-[#071d63] placeholder:text-[#071d63] placeholder:font-semibold focus:border-[#071d63] focus:outline-none focus:ring-1 focus:ring-[#071d63] transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="keluhan" className="sr-only">
                    Keluhan
                  </label>
                  <textarea
                    id="keluhan"
                    rows={6}
                    value={keluhan}
                    onChange={(event) => setKeluhan(event.target.value)}
                    placeholder="Keluhan"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3.5 text-sm text-[#071d63] placeholder:text-[#071d63] placeholder:font-semibold focus:border-[#071d63] focus:outline-none focus:ring-1 focus:ring-[#071d63] resize-none transition-all"
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm font-semibold text-red-600" role="alert">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-9 rounded-2xl bg-[#071d63] text-white font-black text-sm shadow-md hover:bg-[#0c2a86] transition-all focus:outline-none focus:ring-2 focus:ring-[#fed000] active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? "Mengirim..." : "Ajukan Pengaduan"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <div className="lg:absolute lg:right-16 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[325px] p-4 lg:p-0 z-20">
            <div className="w-full bg-[#fed000] rounded-[26px] p-6 sm:p-7 shadow-xl text-white">
              <h2 className="text-xl sm:text-[22px] font-serif font-black tracking-wide text-white mb-6 uppercase">
                Alamat Kontak
              </h2>

              <ul className="space-y-4 text-[11.5px] sm:text-xs text-white font-medium leading-tight">
                <li className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center shrink-0 mt-0.5">
                    <img
                      src="/images/alamat.png"
                      alt="Alamat"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-white leading-snug">
                    Jl. Gayung Kebonsari No.167, Gayungan, Kec. Gayungan, Surabaya, Jawa Timur 60235
                  </span>
                </li>

                <li className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                    <img
                      src="/images/telp.png"
                      alt="Telepon"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-white font-semibold">031-8290186, 8280433</span>
                </li>

                <li className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                    <img
                      src="/images/email.png"
                      alt="Email"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <a
                    href="mailto:binamarga@jatimprov.go.id"
                    className="text-white font-semibold hover:underline"
                  >
                    binamarga@jatimprov.go.id
                  </a>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center shrink-0 mt-0.5">
                    <img
                      src="/images/waktu.png"
                      alt="Jam Operasional"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-white leading-relaxed">
                    <span>Senin - Kamis : 08:00 – 16:00</span>
                    <span>Jumat : 07:30 – 16:00</span>
                    <span>Sabtu - Minggu : Libur</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-3.5 absolute bottom-6 right-8 z-20">
            <a
              href="https://x.com/dbmjatim"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X Twitter"
              className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <img
                src="/images/twitter.png"
                alt="Twitter"
                className="w-5 h-5 object-contain"
              />
            </a>

            <a
              href="https://www.instagram.com/binamargajatim?stkn=ZmMxcWYzbTB3Zjl1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <img
                src="/images/instagram.png"
                alt="Instagram"
                className="w-5 h-5 object-contain"
              />
            </a>

            <a
              href="https://youtube.com/@dbmjatim?si=qIWAAk8L5fMt3QQs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <img
                src="/images/youtube.png"
                alt="YouTube"
                className="w-5 h-5 object-contain"
              />
            </a>

            <a
              href="https://www.facebook.com/share/1EKHfjwTXG/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <img
                src="/images/facebook.png"
                alt="Facebook"
                className="w-5 h-5 object-contain"
              />
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-400 select-none">
        DPU Bina Marga Provinsi Jawa Timur &copy; {new Date().getFullYear()}
      </footer>

      <PengaduanBerhasilModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default Pengaduan;
