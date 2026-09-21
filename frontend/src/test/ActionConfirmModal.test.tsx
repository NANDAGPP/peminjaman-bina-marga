import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionConfirmModal } from "../components/Admin/Modals/ActionConfirmModal";

describe("ActionConfirmModal Component", () => {
  it("tidak merender apapun ketika isOpen bernilai false", () => {
    const { container } = render(
      <ActionConfirmModal
        isOpen={false}
        type="setujui"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal dengan ilustrasi hapus ketika type adalah hapus", () => {
    render(
      <ActionConfirmModal
        isOpen={true}
        type="hapus"
        title="Hapus Data Aset"
        message="Data ini akan dihapus secara permanen."
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Hapus Data Aset")).toBeDefined();
    expect(screen.getByText("Data ini akan dihapus secara permanen.")).toBeDefined();
    const img = screen.getByAltText("Hapus");
    expect(img).toHaveAttribute("src", "/images/ilustrasi_hapus.png");
  });

  it("merender badge vektor sukses dan tidak menggunakan gambar modal_setujui_f ketika type adalah setujui atau terima", () => {
    const { container } = render(
      <ActionConfirmModal
        isOpen={true}
        type="setujui"
        title="Persetujuan Peminjaman"
        message="Konfirmasi persetujuan unit mobil."
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Persetujuan Peminjaman")).toBeDefined();
    expect(screen.getByText("Konfirmasi persetujuan unit mobil.")).toBeDefined();
    expect(container.querySelector('img[src*="modal_setujui_f"]')).toBeNull();
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("merender custom icon ketika icon prop disediakan", () => {
    render(
      <ActionConfirmModal
        isOpen={true}
        type="terima"
        title="Jadikan Admin?"
        message="Pegawai akan diangkat menjadi admin."
        icon={<div data-testid="custom-admin-icon">Admin Icon</div>}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId("custom-admin-icon")).toBeDefined();
    expect(screen.getByText("Jadikan Admin?")).toBeDefined();
  });

  it("memanggil onConfirm ketika tombol konfirmasi diklik", () => {
    const handleConfirm = vi.fn();
    render(
      <ActionConfirmModal
        isOpen={true}
        type="terima"
        title="Jadikan Admin?"
        confirmText="Jadikan Admin"
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    const btn = screen.getByRole("button", { name: "Jadikan Admin" });
    fireEvent.click(btn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <ActionConfirmModal
        isOpen={true}
        type="terima"
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "Batal" });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
