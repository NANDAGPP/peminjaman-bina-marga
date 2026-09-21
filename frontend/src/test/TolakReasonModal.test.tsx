import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TolakReasonModal } from "../components/Admin/Modals/TolakReasonModal";

describe("TolakReasonModal Component - TDD", () => {
  it("tidak merender apapun ketika isOpen bernilai false", () => {
    const { container } = render(
      <TolakReasonModal
        isOpen={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal dengan judul dan deskripsi default ketika dibuka", () => {
    render(
      <TolakReasonModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detail Penolakan")).toBeInTheDocument();
    expect(screen.getByText("Pilih 1 alasan penolakan pengajuan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Konfirmasi/i })).toBeInTheDocument();
  });

  it("merender custom title dan custom message ketika disediakan sebagai props", () => {
    render(
      <TolakReasonModal
        isOpen={true}
        title="Penolakan Peminjaman Khusus"
        message="Berikan alasan penolakan peminjaman untuk unit Avanza:"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Penolakan Peminjaman Khusus")).toBeInTheDocument();
    expect(
      screen.getByText("Berikan alasan penolakan peminjaman untuk unit Avanza:")
    ).toBeInTheDocument();
  });

  it("merender ke-4 opsi penolakan dengan 'Dalam perawatan' terpilih secara default", () => {
    const handleConfirm = vi.fn();
    render(
      <TolakReasonModal
        isOpen={true}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Dalam perawatan")).toBeInTheDocument();
    expect(screen.getByText("Pengurusan Surat")).toBeInTheDocument();
    expect(screen.getByText("Pengajuan Melebihi Kuota")).toBeInTheDocument();
    expect(screen.getByText("Pengajuan diluar Jadwal")).toBeInTheDocument();

    // Default submit tanpa ubah pilihan harus mengirim 'Dalam perawatan'
    fireEvent.click(screen.getByRole("button", { name: /Konfirmasi/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith("Dalam perawatan");
  });

  it("dapat memilih alasan lain dan memanggil onConfirm dengan opsi terpilih", () => {
    const handleConfirm = vi.fn();
    render(
      <TolakReasonModal
        isOpen={true}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    const targetOption = screen.getByText("Pengajuan Melebihi Kuota");
    fireEvent.click(targetOption);

    const submitBtn = screen.getByRole("button", { name: /Konfirmasi/i });
    fireEvent.click(submitBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith("Pengajuan Melebihi Kuota");
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <TolakReasonModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
