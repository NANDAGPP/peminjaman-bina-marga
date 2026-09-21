import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { PengaduanBerhasilModal } from "../components/Pengaduan/PengaduanBerhasilModal";

describe("PengaduanBerhasilModal Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tidak merender ketika isOpen bernilai false", () => {
    const { container } = render(
      <PengaduanBerhasilModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal dialog sukses saat isOpen bernilai true", () => {
    render(<PengaduanBerhasilModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pengaduan Berhasil")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Terima kasih, laporan Anda sedang dalam proses penanganan."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Klik di mana saja untuk menutup/i)
    ).not.toBeInTheDocument();
  });

  it("menutup modal secara otomatis setelah autoCloseDelay default (1500ms)", () => {
    const handleClose = vi.fn();
    render(<PengaduanBerhasilModal isOpen={true} onClose={handleClose} />);

    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("menghormati custom autoCloseDelay yang diberikan", () => {
    const handleClose = vi.fn();
    render(
      <PengaduanBerhasilModal
        isOpen={true}
        onClose={handleClose}
        autoCloseDelay={3000}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose ketika backdrop diklik", () => {
    const handleClose = vi.fn();
    render(<PengaduanBerhasilModal isOpen={true} onClose={handleClose} />);

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("tidak memicu onClose dua kali jika dialog konten diklik karena event.stopPropagation", () => {
    const handleClose = vi.fn();
    render(<PengaduanBerhasilModal isOpen={true} onClose={handleClose} />);

    const title = screen.getByText("Pengaduan Berhasil");
    fireEvent.click(title);

    expect(handleClose).not.toHaveBeenCalled();
  });

});
