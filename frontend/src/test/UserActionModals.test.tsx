import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  EditAkunModal,
  PilihKarakterModal,
  BatalkanPinjamanModal,
  KembalikanBarangModal,
} from "../components/Profile/UserActionModals";

describe("EditAkunModal Component", () => {
  it("tidak merender apapun ketika isOpen bernilai false", () => {
    const { container } = render(
      <EditAkunModal
        isOpen={false}
        initialPhone="08123456789"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender form modal dengan nomor telepon awal ketika isOpen bernilai true", () => {
    render(
      <EditAkunModal
        isOpen={true}
        initialPhone="08123456789"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("No.Tlpn")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByDisplayValue("08123456789")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Simpan/i })).toBeInTheDocument();
  });

  it("dapat mengubah nilai input dan memanggil onSave dengan data yang diisi", () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditAkunModal
        isOpen={true}
        initialPhone="08123456789"
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const phoneInput = screen.getByDisplayValue("08123456789");
    const passwordInput = screen.getByPlaceholderText("**********");

    fireEvent.change(phoneInput, { target: { value: "089988776655" } });
    fireEvent.change(passwordInput, { target: { value: "rahasianew123" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith({
      phone: "089988776655",
      password: "rahasianew123",
    });
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <EditAkunModal
        isOpen={true}
        initialPhone="08123456789"
        onClose={handleClose}
        onSave={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("PilihKarakterModal Component", () => {
  it("tidak merender ketika isOpen bernilai false", () => {
    const { container } = render(
      <PilihKarakterModal
        isOpen={false}
        currentAvatar="/images/avatar_pria.png"
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender 3 pilihan avatar ketika isOpen bernilai true", () => {
    render(
      <PilihKarakterModal
        isOpen={true}
        currentAvatar="/images/avatar_pria.png"
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pilih Karakter Profil")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Pria")).toBeInTheDocument();
    expect(screen.getByText("Wanita")).toBeInTheDocument();
  });

  it("dapat memilih avatar wanita dan memanggil onSelect dengan path avatar saat Terapkan diklik", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <PilihKarakterModal
        isOpen={true}
        currentAvatar="/images/avatar_pria.png"
        onClose={handleClose}
        onSelect={handleSelect}
      />
    );

    const wanitaOption = screen.getByText("Wanita");
    fireEvent.click(wanitaOption);

    const applyBtn = screen.getByRole("button", { name: /Terapkan/i });
    fireEvent.click(applyBtn);

    expect(handleSelect).toHaveBeenCalledWith("/images/avatar_wanita.png");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("menggunakan fallback avatar pria bila currentAvatar tidak dikenali", () => {
    const handleSelect = vi.fn();
    render(
      <PilihKarakterModal
        isOpen={true}
        currentAvatar="/images/avatar_tidak_valid.png"
        onClose={vi.fn()}
        onSelect={handleSelect}
      />
    );

    const applyBtn = screen.getByRole("button", { name: /Terapkan/i });
    fireEvent.click(applyBtn);

    expect(handleSelect).toHaveBeenCalledWith("/images/avatar_pria.png");
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <PilihKarakterModal
        isOpen={true}
        currentAvatar="/images/avatar_pria.png"
        onClose={handleClose}
        onSelect={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("BatalkanPinjamanModal Component", () => {
  it("tidak merender ketika isOpen bernilai false", () => {
    const { container } = render(
      <BatalkanPinjamanModal
        isOpen={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal konfirmasi pembatalan peminjaman", () => {
    render(
      <BatalkanPinjamanModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Batalkan Pinjaman Anda?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YA/i })).toBeInTheDocument();
  });

  it("memanggil onConfirm saat tombol YA diklik", () => {
    const handleConfirm = vi.fn();
    render(
      <BatalkanPinjamanModal
        isOpen={true}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /YA/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose saat tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <BatalkanPinjamanModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("KembalikanBarangModal Component", () => {
  it("tidak merender ketika isOpen bernilai false", () => {
    const { container } = render(
      <KembalikanBarangModal
        isOpen={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("merender modal konfirmasi pengembalian barang", () => {
    render(
      <KembalikanBarangModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ingin Mengembalikan Barang?")).toBeInTheDocument();
    expect(
      screen.getByText(/Apakah Anda yakin ingin mengembalikan barang ini\?/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YA/i })).toBeInTheDocument();
  });

  it("memanggil onConfirm saat tombol YA diklik", () => {
    const handleConfirm = vi.fn();
    render(
      <KembalikanBarangModal
        isOpen={true}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /YA/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose saat tombol Batal diklik", () => {
    const handleClose = vi.fn();
    render(
      <KembalikanBarangModal
        isOpen={true}
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
