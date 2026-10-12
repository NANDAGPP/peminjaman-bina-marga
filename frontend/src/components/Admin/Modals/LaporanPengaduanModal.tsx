import React, { useState } from "react";

export interface PengaduanModalItem {
  id: number;
  nama: string;
  nip: string;
  keluhan: string;
  status: string;
  tanggal?: string;
}

interface LaporanPengaduanModalProps {
  isOpen: boolean;
  item: PengaduanModalItem | null;
  onClose: () => void;
}

export const LaporanPengaduanModal: React.FC<LaporanPengaduanModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  if (!isOpen || !item) return null;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDate = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : today;

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      alert("Popup blocker memblokir pencetakan. Izinkan popup browser untuk mencetak laporan.");
      return;
    }

    const logoUrl = window.location.origin + "/images/logobina.png";

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Pengaduan - ${escapeHtml(item.nama)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 20mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.35;
    }
    .kop-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2px;
    }
    .kop-table td {
      vertical-align: middle;
      border: none;
      padding: 0;
    }
    .kop-logo {
      width: 85px;
      text-align: center;
      padding-right: 12px;
    }
    .kop-logo img {
      width: 70px !important;
      max-width: 70px !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }
    .kop-text {
      text-align: center;
    }
    .kop-prov {
      font-size: 12.5pt;
      font-weight: normal;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
    }
    .kop-dinas {
      font-size: 16pt;
      font-weight: bold;
      margin: 0 0 3px 0;
      letter-spacing: 0.5px;
    }
    .kop-alamat, .kop-kontak {
      font-size: 9pt;
      margin: 1px 0;
      color: #111;
    }
    .kop-line {
      border-top: 3px solid #000;
      border-bottom: 1px solid #000;
      height: 2px;
      margin: 6px 0 20px 0;
    }
    .doc-title {
      text-align: center;
      font-size: 13.5pt;
      font-weight: bold;
      text-decoration: underline;
      letter-spacing: 1px;
      margin: 0 0 18px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .info-table td {
      border: 1px solid #333;
      padding: 6px 12px;
      font-size: 10.5pt;
    }
    .info-table td.label {
      width: 32%;
      font-weight: bold;
      background-color: #f5f5f5 !important;
    }
    .keluhan-title {
      font-size: 11pt;
      font-weight: bold;
      margin: 0 0 6px 0;
    }
    .keluhan-box {
      border: 1px solid #333;
      padding: 10px 14px;
      font-size: 10.5pt;
      line-height: 1.6;
      min-height: 100px;
      white-space: pre-wrap;
      text-align: justify;
      margin-bottom: 24px;
    }
    .ttd-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .ttd-table td {
      border: none;
      padding: 0;
      vertical-align: top;
    }
    .ttd-cell-left {
      width: 55%;
    }
    .ttd-cell-right {
      width: 45%;
      text-align: right;
      font-size: 10.5pt;
    }
    .ttd-space {
      height: 65px;
    }
    .ttd-name {
      font-weight: bold;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <table class="kop-table" style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
    <tr>
      <td class="kop-logo" style="width: 85px; vertical-align: middle; text-align: center; padding-right: 12px;">
        <img src="${logoUrl}" alt="Logo SIPINA" style="width: 70px; max-width: 70px; height: auto; display: block; margin: 0 auto;" />
      </td>
      <td class="kop-text" style="vertical-align: middle; text-align: center;">
        <p class="kop-prov" style="font-size: 12.5pt; margin: 0 0 2px 0;">PEMERINTAH PROVINSI JAWA TIMUR</p>
        <p class="kop-dinas" style="font-size: 16pt; font-weight: bold; margin: 0 0 3px 0;">DINAS PEKERJAAN UMUM BINA MARGA</p>
        <p class="kop-alamat" style="font-size: 9pt; margin: 1px 0;">Jalan Gayung Kebonsari Nomor 167, Gayungsari, Gayungan, Surabaya, Jawa Timur 60235</p>
        <p class="kop-kontak" style="font-size: 9pt; margin: 1px 0;">Telepon (031) 8280919, Laman binamarga.jatimprov.go.id, Pos-el <span style="text-decoration: underline;">binamarga@jatimprov.go.id</span></p>
      </td>
    </tr>
  </table>

  <div class="kop-line" style="border-top: 3px solid #000; border-bottom: 1px solid #000; height: 2px; margin: 6px 0 20px 0;"></div>

  <div class="doc-title" style="text-align: center; font-size: 13.5pt; font-weight: bold; text-decoration: underline; margin-bottom: 18px;">
    LAPORAN PENGADUAN
  </div>

  <table class="info-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td class="label" style="border: 1px solid #333; padding: 6px 12px; font-weight: bold; background-color: #f5f5f5; width: 32%;">Nama Pegawai</td>
      <td style="border: 1px solid #333; padding: 6px 12px;">${escapeHtml(item.nama)}</td>
    </tr>
    <tr>
      <td class="label" style="border: 1px solid #333; padding: 6px 12px; font-weight: bold; background-color: #f5f5f5;">NIP</td>
      <td style="border: 1px solid #333; padding: 6px 12px;">${escapeHtml(item.nip || "-")}</td>
    </tr>
    <tr>
      <td class="label" style="border: 1px solid #333; padding: 6px 12px; font-weight: bold; background-color: #f5f5f5;">Tanggal Pengaduan</td>
      <td style="border: 1px solid #333; padding: 6px 12px;">${escapeHtml(formattedDate)}</td>
    </tr>
    <tr>
      <td class="label" style="border: 1px solid #333; padding: 6px 12px; font-weight: bold; background-color: #f5f5f5;">Status Tindak Lanjut</td>
      <td style="border: 1px solid #333; padding: 6px 12px; font-weight: bold;">${escapeHtml(item.status)}</td>
    </tr>
  </table>

  <p class="keluhan-title" style="font-weight: bold; margin-bottom: 6px;">Isi Pengaduan / Keluhan:</p>
  <div class="keluhan-box" style="border: 1px solid #333; padding: 10px 14px; min-height: 100px; white-space: pre-wrap; text-align: justify; margin-bottom: 24px;">${escapeHtml(item.keluhan || "Tidak ada rincian keluhan.")}</div>

  <table class="ttd-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <tr>
      <td class="ttd-cell-left" style="width: 55%; border: none;"></td>
      <td class="ttd-cell-right" style="width: 45%; text-align: right; border: none;">
        <p style="margin: 0;">Surabaya, ${escapeHtml(today)}</p>
        <p style="margin: 4px 0 0 0;">Admin Pengelola Layanan SIPINA</p>
        <div class="ttd-space" style="height: 65px;"></div>
        <p class="ttd-name" style="margin: 0; font-weight: bold; text-decoration: underline;">(________________________)</p>
      </td>
    </tr>
  </table>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() {
          window.close();
        };
      }, 300);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch(`/api/printpengaduan.php?id=${item.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Gagal mengunduh berkas (Kode ${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (item.nama || "Pegawai").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `Laporan_Pengaduan_${cleanName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunduh file Microsoft Word.";
      console.error("Download Word error:", err);
      // Fallback direct window open if fetch has issues
      try {
        window.open(`/api/printpengaduan.php?id=${item.id}`, "_blank");
      } catch {
        setDownloadError(msg);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[800px] max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#071d63] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#fed000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-bold">Preview Template Laporan Pengaduan Resmi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Letterhead Preview */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-gray-50/50">
          {downloadError && (
            <div className="mb-4 max-w-[680px] mx-auto p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center justify-between">
              <span>{downloadError}</span>
              <button
                type="button"
                onClick={() => setDownloadError("")}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div
            className="bg-white p-8 sm:p-12 rounded-xl border border-gray-200 shadow-sm max-w-[680px] mx-auto text-black font-serif"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Kop Surat */}
            <table className="w-full border-collapse mb-2">
              <tbody>
                <tr>
                  <td className="w-20 align-middle text-center pr-3">
                    <img
                      src="/images/sipina_logo_cropped.png"
                      alt="Logo SIPINA"
                      style={{ width: "70px", height: "auto" }}
                      className="mx-auto object-contain"
                    />
                  </td>
                  <td className="align-middle text-center leading-tight">
                    <p className="text-[12pt] m-0 tracking-wide">
                      PEMERINTAH PROVINSI JAWA TIMUR
                    </p>
                    <p className="text-[16pt] font-extrabold m-0 text-black tracking-wider">
                      DINAS PEKERJAAN UMUM BINA MARGA
                    </p>
                    <p className="text-[9pt] text-gray-800 m-0 mt-1">
                      Jalan Gayung Kebonsari Nomor 167, Gayungsari, Gayungan, Surabaya, Jawa Timur 60235
                    </p>
                    <p className="text-[9pt] text-gray-800 m-0">
                      Telepon (031) 8280919, Laman binamarga.jatimprov.go.id, Pos-el{" "}
                      <span className="underline">binamarga@jatimprov.go.id</span>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Garis Ganda Kop Surat Resmi */}
            <div className="border-t-[3px] border-b border-black h-1 my-3"></div>

            {/* Judul Dokumen */}
            <h2 className="text-center text-[13pt] font-bold underline tracking-wider mt-4 mb-5">
              LAPORAN PENGADUAN
            </h2>

            {/* Tabel Identitas Pegawai */}
            <table className="w-full border-collapse border border-gray-400 mb-5 text-[10.5pt]">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-1.5 font-bold bg-gray-50 w-1/3">
                    Nama Pegawai
                  </td>
                  <td className="border border-gray-400 px-3 py-1.5 font-medium">
                    {item.nama}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-1.5 font-bold bg-gray-50">
                    NIP
                  </td>
                  <td className="border border-gray-400 px-3 py-1.5 font-medium">
                    {item.nip || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-1.5 font-bold bg-gray-50">
                    Tanggal Pengaduan
                  </td>
                  <td className="border border-gray-400 px-3 py-1.5 font-medium">
                    {formattedDate}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-1.5 font-bold bg-gray-50">
                    Status Tindak Lanjut
                  </td>
                  <td className="border border-gray-400 px-3 py-1.5 font-semibold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-sm text-xs font-bold ${
                        item.status === "Selesai" || item.status === "Disetujui"
                          ? "text-emerald-700 bg-emerald-50"
                          : item.status === "Diproses"
                          ? "text-amber-700 bg-amber-50"
                          : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Isi Keluhan */}
            <div className="mb-6">
              <p className="font-bold text-[10.5pt] mb-1.5">Isi Pengaduan / Keluhan:</p>
              <div className="border border-gray-400 p-3.5 rounded-xs text-[10.5pt] leading-relaxed text-justify min-h-[90px] whitespace-pre-wrap bg-white">
                {item.keluhan || "Tidak ada rincian keluhan."}
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="flex justify-end mt-8 text-[10.5pt] leading-snug">
              <div className="text-right w-64">
                <p>Surabaya, {today}</p>
                <p className="font-medium mt-0.5">Admin Pengelola Layanan SIPINA</p>
                <div className="h-16"></div>
                <p className="font-bold underline">(________________________)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white border-t border-gray-200 shrink-0">
          <p className="text-xs text-gray-500">
            *Format dokumen resmi Pemerintah Provinsi Jawa Timur - DPU Bina Marga.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071d63] hover:bg-[#0b2984] text-white font-bold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer ${
                isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2b579a] hover:bg-[#1e3f70]"
              }`}
              title="Unduh format Microsoft Word (.docx)"
            >
              {isDownloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Mengunduh Word...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Unduh Word (.docx)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
