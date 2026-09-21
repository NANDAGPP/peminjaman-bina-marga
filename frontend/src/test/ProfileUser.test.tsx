import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileUser } from "../components/Profile/ProfileUser";
import { PilihKarakterModal } from "../components/Profile/UserActionModals";
import { fetchLoans } from "../services/api";

vi.mock("../services/api", () => ({
  fetchLoans: vi.fn().mockResolvedValue({ loans: [] }),
  cancelLoan: vi.fn().mockResolvedValue({ message: "OK" }),
  returnLoan: vi.fn().mockResolvedValue({ message: "OK" }),
  updateUserAvatar: vi.fn().mockResolvedValue({ message: "OK" }),
  updateUserProfile: vi.fn().mockResolvedValue({ message: "OK", no_hp: "08123456789" }),
  fetchSession: vi.fn().mockResolvedValue({ authenticated: true, user: { username: "Tamabackend", nama: "Tamabackend", nip: "1987654321" } }),
  ApiError: class ApiError extends Error {
    constructor(msg: string) {
      super(msg);
    }
  },
}));

describe("ProfileUser Component", () => {
  const mockUser = {
    username: "Tamabackend",
    nama: "Tamabackend",
    nip: "1987654321",
    no_hp: "08123456789",
    foto: "/images/avatar_pria.png",
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("renders profile data correctly without crashing", async () => {
    const handleNavigate = vi.fn();

    render(
      <ProfileUser
        currentUser={mockUser}
        onNavigate={handleNavigate}
        onLogout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Profil/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Tamabackend")).toBeInTheDocument();
    expect(screen.getByText("1987654321")).toBeInTheDocument();
  });

  it("renders PilihKarakterModal and allows switching between pria and wanita", () => {
    const handleClose = vi.fn();
    const handleSelect = vi.fn();

    render(
      <PilihKarakterModal
        isOpen={true}
        currentAvatar="/images/avatar_pria.png"
        onClose={handleClose}
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText("Pilih Karakter Profil")).toBeInTheDocument();
    expect(screen.getByText("Wanita")).toBeInTheDocument();
    expect(screen.getByText("Pria")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Wanita"));
    fireEvent.click(screen.getByText("Terapkan"));

    expect(handleSelect).toHaveBeenCalledWith("/images/avatar_wanita.png");
  });

  it("renders fallback when currentUser is null without blank screen", async () => {
    const handleNavigate = vi.fn();

    render(
      <ProfileUser
        currentUser={null}
        onNavigate={handleNavigate}
        onLogout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Memuat data profil...")).toBeInTheDocument();
    });
    expect(screen.getByText("Menuju Halaman Login")).toBeInTheDocument();
    expect(handleNavigate).toHaveBeenCalledWith("login");
  });

  it("mengurutkan status peminjaman aktif berdasarkan tanggal yang paling mepet (terdekat)", async () => {
    const mockLoans = [
      {
        id_peminjaman: 1,
        nama: "VARIO 120",
        jenis_aset: "Motor",
        plat: "L 736 NDU",
        tanggal_mulai: "2026-09-24",
        tanggal_selesai: "2026-09-24",
        status_pengajuan: "Diproses",
      },
      {
        id_peminjaman: 2,
        nama: "PORSCHE",
        jenis_aset: "Mobil",
        plat: "L 333 NTO",
        tanggal_mulai: "2026-09-19",
        tanggal_selesai: "2026-09-19",
        status_pengajuan: "Diproses",
      },
      {
        id_peminjaman: 3,
        nama: "VARIO 120",
        jenis_aset: "Motor",
        plat: "L 736 NDU",
        tanggal_mulai: "2026-09-13",
        tanggal_selesai: "2026-09-20",
        status_pengajuan: "Diproses",
      },
    ];

    vi.mocked(fetchLoans).mockResolvedValueOnce({ loans: mockLoans } as any);

    render(
      <ProfileUser
        currentUser={mockUser}
        initialTab="status"
        onNavigate={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PORSCHE")).toBeInTheDocument();
    });

    const dates = screen
      .getAllByText(/Tanggal Peminjaman :/i)
      .map((el) => el.parentElement?.textContent);

    expect(dates[0]).toContain("13 September 2026");
    expect(dates[1]).toContain("19 September 2026");
    expect(dates[2]).toContain("24 September 2026");
  });
});
