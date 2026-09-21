import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssetFormModal } from "../components/Admin/Modals/AssetFormModal";

describe("AssetFormModal Component", () => {
  it("renders Add Asset Modal for Mobil without crashing when isEdit is false", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <AssetFormModal
        isOpen={true}
        isEdit={false}
        kategori="mobil"
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    expect(screen.getByText(/Tambah Data Aset Mobil/i)).toBeDefined();
    expect(screen.getByText(/Plat/i)).toBeDefined();
    expect(screen.getByText(/Tipe/i)).toBeDefined();
    expect(screen.getByText(/Tahun/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Tambah/i })).toBeDefined();
  });

  it("renders Add Asset Modal for Motor without crashing", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <AssetFormModal
        isOpen={true}
        isEdit={false}
        kategori="motor"
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    expect(screen.getByText(/Tambah Data Aset Motor/i)).toBeDefined();
    expect(screen.getByText(/Plat/i)).toBeDefined();
  });

  it("renders Add Asset Modal for Ruangan with Kode and Lantai fields", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <AssetFormModal
        isOpen={true}
        isEdit={false}
        kategori="ruang"
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    expect(screen.getByText(/Tambah Data Aset Ruang/i)).toBeDefined();
    expect(screen.getByText(/Kode/i)).toBeDefined();
    expect(screen.getByText(/Lantai/i)).toBeDefined();
    expect(screen.getByText(/Kapasitas/i)).toBeDefined();
  });

  it("renders Edit Asset Modal when isEdit is true and initialData provided", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <AssetFormModal
        isOpen={true}
        isEdit={true}
        kategori="mobil"
        initialData={{
          nama: "Toyota Innova",
          kodePlat: "L 1234 AB",
          tipe: "MPV",
          tahunLantai: "2023",
          kapasitas: "7 Orang",
          status: "Tersedia",
          kategori: "mobil",
        }}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    expect(screen.getByText(/Update Data Aset Mobil/i)).toBeDefined();
    expect(screen.getByDisplayValue("Toyota Innova")).toBeDefined();
    expect(screen.getByDisplayValue("L 1234 AB")).toBeDefined();
    expect(screen.getByRole("button", { name: /Simpan/i })).toBeDefined();
  });

  it("toggles status dropdown and allows selecting a new status", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <AssetFormModal
        isOpen={true}
        isEdit={false}
        kategori="mobil"
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const statusButton = screen.getByText("Status");
    expect(statusButton).toBeDefined();

    fireEvent.click(statusButton);

    expect(screen.getByText("Pilih Status")).toBeDefined();
    const dipinjamOption = screen.getByRole("button", { name: /Dipinjam/i });
    expect(dipinjamOption).toBeDefined();

    fireEvent.click(dipinjamOption);

    expect(screen.getByText("Dipinjam")).toBeDefined();
  });
});
