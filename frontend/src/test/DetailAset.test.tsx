import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DetailAset } from "../components/Peminjaman/DetailAset";
import { Asset } from "../components/Peminjaman/assetData";

describe("DetailAset Component - Status & Detail Layout", () => {
  const mockRuangan: Asset = {
    id: 1,
    name: "R. RAPAT B",
    category: "ruang",
    status: "tersedia",
    image: "/images/aula.png",
    code: "GD-01",
    capacity: "50 Orang",
    lantai: "2",
  };

  const mockMobil: Asset = {
    id: 2,
    name: "PORSCHE",
    tipe: "PORSCHE 911",
    category: "mobil",
    status: "tersedia",
    image: "/images/porsche.png",
    code: "L 1234 AB",
    fuel: "Pertamax",
    transmission: "Matic",
    capacity: "4 Orang",
  };

  const mockMotor: Asset = {
    id: 3,
    name: "NMAX",
    tipe: "YAMAHA NMAX",
    category: "motor",
    status: "tersedia",
    image: "/images/nmax.png",
    code: "L 5678 CD",
    fuel: "Pertalite",
    transmission: "Matic",
    capacity: "2 Orang",
  };

  it("tidak menampilkan note / badge 'Tersedia' di bawah nama ruangan", () => {
    render(
      <DetailAset
        asset={mockRuangan}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getAllByText("R. RAPAT B").length).toBeGreaterThan(0);
    expect(screen.queryByText("Tersedia")).not.toBeInTheDocument();
  });

  it("tidak menampilkan note / badge 'Tersedia' di bawah nama mobil", () => {
    render(
      <DetailAset
        asset={mockMobil}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getAllByText("PORSCHE 911").length).toBeGreaterThan(0);
    expect(screen.queryByText("Tersedia")).not.toBeInTheDocument();
  });

  it("tidak menampilkan note / badge 'Tersedia' di bawah nama motor", () => {
    render(
      <DetailAset
        asset={mockMotor}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getAllByText("YAMAHA NMAX").length).toBeGreaterThan(0);
    expect(screen.queryByText("Tersedia")).not.toBeInTheDocument();
  });

  it("tetap menampilkan badge status jika berstatus dipinjam", () => {
    const assetDipinjam: Asset = {
      ...mockMobil,
      status: "dipinjam",
    };

    render(
      <DetailAset
        asset={assetDipinjam}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("Dipinjam")).toBeInTheDocument();
  });

  it("memanggil onBack ketika tombol Kembali diklik", () => {
    const handleBack = vi.fn();
    render(
      <DetailAset
        asset={mockRuangan}
        onBack={handleBack}
        onSuccess={vi.fn()}
      />
    );

    const backBtn = screen.getByRole("button", { name: /Kembali/i });
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
