import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pengaduan from "../components/Pengaduan/Pengaduan";
import { PengaduanBerhasilModal } from "../components/Pengaduan/PengaduanBerhasilModal";

describe("Pengaduan Component", () => {
  const mockNavigate = vi.fn();

  it("passes currentUser to NavbarUser and navigates to profile when logged in", () => {
    const mockUser = {
      nama: "Gentolet",
      username: "gentolet",
      nip: "19872827",
      foto: "/images/avatar_pria.png",
    };

    render(<Pengaduan onNavigate={mockNavigate} currentUser={mockUser} />);

    expect(screen.getByDisplayValue("Gentolet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("19872827")).toBeInTheDocument();

    const profileButton = screen.getByRole("button", { name: /Profil Pengguna/i });
    expect(profileButton).toBeInTheDocument();
    expect(profileButton).toHaveAttribute("title", "Profil: Gentolet");

    fireEvent.click(profileButton);
    expect(mockNavigate).toHaveBeenCalledWith("profile");
  });

  it("navigates to login when user is not logged in", () => {
    render(<Pengaduan onNavigate={mockNavigate} currentUser={null} />);

    const profileButton = screen.getByRole("button", { name: /Login Pengguna/i });
    expect(profileButton).toBeInTheDocument();
    expect(profileButton).toHaveAttribute("title", "Masuk / Login Pengguna");

    fireEvent.click(profileButton);
    expect(mockNavigate).toHaveBeenCalledWith("login");
  });

  it("PengaduanBerhasilModal otomatis menutup setelah delay tanpa harus diklik", () => {
    vi.useFakeTimers();
    const mockClose = vi.fn();

    render(
      <PengaduanBerhasilModal isOpen={true} onClose={mockClose} autoCloseDelay={1500} />
    );

    expect(screen.getByText("Pengaduan Berhasil")).toBeInTheDocument();
    expect(mockClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);

    expect(mockClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
