import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LaporanPengaduanModal, PengaduanModalItem } from "../components/Admin/Modals/LaporanPengaduanModal";

describe("LaporanPengaduanModal Component", () => {
  const dummyItem: PengaduanModalItem = {
    id: 1,
    nama: "TAMA",
    nip: "1122334455667788",
    keluhan: "AC mobil tidak dingin dan bau apek.",
    status: "Diproses",
    tanggal: "2026-09-12",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <LaporanPengaduanModal
        isOpen={false}
        item={dummyItem}
        onClose={handleClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Kop Surat and employee data correctly when open", () => {
    const handleClose = vi.fn();
    render(
      <LaporanPengaduanModal
        isOpen={true}
        item={dummyItem}
        onClose={handleClose}
      />
    );

    expect(screen.getAllByText(/PEMERINTAH PROVINSI JAWA TIMUR/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DINAS PEKERJAAN UMUM BINA MARGA/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText(/LAPORAN PENGADUAN/i).length).toBeGreaterThan(0);

    expect(screen.getByText("TAMA")).toBeDefined();
    expect(screen.getByText("1122334455667788")).toBeDefined();
    expect(screen.getByText(/AC mobil tidak dingin/i)).toBeDefined();
    expect(screen.getByText("Diproses")).toBeDefined();

    expect(screen.getByRole("button", { name: /Cetak \/ Simpan PDF/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Unduh Word \(\.docx\)/i })).toBeDefined();
  });

  it("handles print trigger without crashing", () => {
    const handleClose = vi.fn();
    const mockOpen = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
    });
    vi.stubGlobal("open", mockOpen);

    render(
      <LaporanPengaduanModal
        isOpen={true}
        item={dummyItem}
        onClose={handleClose}
      />
    );

    const printButton = screen.getByRole("button", { name: /Cetak \/ Simpan PDF/i });
    fireEvent.click(printButton);

    expect(mockOpen).toHaveBeenCalled();
  });

  it("calls onClose when Tutup or X button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <LaporanPengaduanModal
        isOpen={true}
        item={dummyItem}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole("button", { name: /Tutup/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("triggers docx download from /api/printpengaduan.php when Unduh Word is clicked", async () => {
    const mockBlob = new Blob(["mock-docx-content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => mockBlob,
    });
    vi.stubGlobal("fetch", fetchMock);
    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-url");
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    render(
      <LaporanPengaduanModal
        isOpen={true}
        item={dummyItem}
        onClose={vi.fn()}
      />
    );

    const downloadBtn = screen.getByRole("button", { name: /Unduh Word/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/printpengaduan.php?id=1"),
        expect.objectContaining({ credentials: "include" })
      );
    });
  });
});
