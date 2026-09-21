import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminPeminjaman } from "../components/Admin/AdminPeminjaman";
import { fetchLoans, updateLoanStatus, deleteLoan } from "../services/api";

vi.mock("../services/api", async () => {
  const actual = await vi.importActual<typeof import("../services/api")>("../services/api");

  return {
    ...actual,
    fetchLoans: vi.fn(),
    updateLoanStatus: vi.fn(),
    deleteLoan: vi.fn(),
  };
});

const loanMobil = {
  id_peminjaman: 7,
  jenis_aset: "Mobil",
  nama: "G CLASS",
  plat: "L 333 NT0",
  tipe: "MERCEDES-BENZ G 63",
  tahun: "2024",
  gambar: "images/gclass.png",
  status_pengajuan: "Diproses",
};

describe("AdminPeminjaman", () => {
  beforeEach(() => {
    vi.mocked(fetchLoans).mockResolvedValue({ loans: [loanMobil] } as any);
    vi.mocked(updateLoanStatus).mockResolvedValue({ message: "ok" } as any);
    vi.mocked(deleteLoan).mockResolvedValue({ message: "ok" } as any);
  });

  it("menampilkan tab kategori dan data peminjaman dari API", async () => {
    render(<AdminPeminjaman onNavigate={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Mobil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Motor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ruangan" })).toBeInTheDocument();

    expect(await screen.findByText("G CLASS")).toBeInTheDocument();
    expect(screen.getByText("L 333 NT0")).toBeInTheDocument();
  });

  it("mengganti judul kolom saat tab Ruangan dipilih", async () => {
    render(<AdminPeminjaman onNavigate={vi.fn()} onLogout={vi.fn()} />);
    await screen.findByText("G CLASS");

    fireEvent.click(screen.getByRole("button", { name: "Ruangan" }));

    expect(screen.getByText("Kode")).toBeInTheDocument();
    expect(screen.queryByText("Plat")).not.toBeInTheDocument();
  });

  it("mengirim persetujuan ke API lalu memuat ulang daftar", async () => {
    render(<AdminPeminjaman onNavigate={vi.fn()} onLogout={vi.fn()} />);
    await screen.findByText("G CLASS");

    fireEvent.click(screen.getByTitle("Setujui Peminjaman"));
    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => {
      expect(updateLoanStatus).toHaveBeenCalledWith(7, "Disetujui", "");
    });

    expect(fetchLoans).toHaveBeenCalledTimes(2);
  });

  it("menampilkan pesan error bila API menolak perubahan status", async () => {
    const { ApiError } = await vi.importActual<typeof import("../services/api")>("../services/api");
    vi.mocked(updateLoanStatus).mockRejectedValue(
      new ApiError("Alasan penolakan wajib diisi.", 400)
    );

    render(<AdminPeminjaman onNavigate={vi.fn()} onLogout={vi.fn()} />);
    await screen.findByText("G CLASS");

    fireEvent.click(screen.getByTitle("Setujui Peminjaman"));
    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Alasan penolakan wajib diisi."
    );
  });

  it("membaca gambar dan memperbaiki plat nomor NMAX yang sebelumnya tertulis 'Motor'", async () => {
    const loansData = [
      {
        id_peminjaman: 1,
        jenis_aset: "Motor",
        nama: "NMAX",
        plat: "MOTOR",
        tipe: "MAXI SCOOTER 155CC",
        status_pengajuan: "Diproses",
      },
      {
        id_peminjaman: 2,
        jenis_aset: "Motor",
        nama: "PCX 160",
        plat: "L 837 NHD",
        tipe: "MAXI SCOOTER 160CC",
        status_pengajuan: "Diproses",
      },
      {
        id_peminjaman: 3,
        jenis_aset: "Motor",
        nama: "VARIO 120",
        plat: "L 736 NDU",
        tipe: "MATIC 125CC",
        status_pengajuan: "Diproses",
      },
    ];

    vi.mocked(fetchLoans).mockResolvedValue({ loans: loansData } as any);

    render(<AdminPeminjaman onNavigate={vi.fn()} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Motor" }));

    expect(await screen.findByText("NMAX")).toBeInTheDocument();
    expect(screen.getByText("PCX 160")).toBeInTheDocument();
    expect(screen.getByText("VARIO 120")).toBeInTheDocument();

    expect(screen.queryByText("MOTOR")).not.toBeInTheDocument();
    expect(screen.getByText("L 5821 BM")).toBeInTheDocument();

    const imgNmax = screen.getByAltText("NMAX");
    const imgPcx = screen.getByAltText("PCX 160");
    const imgVario = screen.getByAltText("VARIO 120");

    expect(imgNmax).toHaveAttribute("src", "/images/nmax.png");
    expect(imgPcx).toHaveAttribute("src", "/images/pcx.png");
    expect(imgVario).toHaveAttribute("src", "/images/vario.png");
  });
});
