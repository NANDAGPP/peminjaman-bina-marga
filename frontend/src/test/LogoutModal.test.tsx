import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LogoutModal } from "../components/Admin/Modals/LogoutModal";

describe("LogoutModal Component - TDD", () => {
  it("tidak merender apapun ketika isOpen bernilai false", () => {
    const { container } = render(
      <LogoutModal
        isOpen={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal konfirmasi logout dengan pesan dan gambar ketika isOpen bernilai true", () => {
    render(
      <LogoutModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Anda akan keluar dari akun. Lanjutkan?")
    ).toBeInTheDocument();
    expect(screen.getByAltText("Logout Illustration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Keluar/i })).toBeInTheDocument();
  });

  it("memanggil onConfirm saat tombol Keluar diklik", () => {
    const handleConfirm = vi.fn();
    render(
      <LogoutModal
        isOpen={true}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Keluar/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose saat tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <LogoutModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
