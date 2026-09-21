import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingFormPanel } from "../components/Peminjaman/BookingFormPanel";
import { Asset } from "../components/Peminjaman/assetData";
import {
  buildMonthGrid,
  extractStartTime,
  shiftMonth,
  todayIso,
} from "../components/Peminjaman/calendar";

const mockAsset: Asset = {
  id: "mob-1",
  name: "PORSCHE",
  category: "mobil",
  image: "/images/porsche.png",
  code: "L 333 NT0",
  capacity: "2 Orang",
  status: "tersedia",
  tipe: "PORSCHE 911 GT3 RS",
  tahun: "2024",
};

describe("BookingFormPanel Component", () => {
  it("harus merender judul dan instruksi form peminjaman", () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    );

    expect(
      screen.getByText(/Tentukan Tanggal dan Waktu Peminjaman/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Tanggal Mulai/i)).toBeInTheDocument();
    expect(screen.getByText(/Tanggal Selesai/i)).toBeInTheDocument();
  });

  it("harus memanggil onCancel saat tombol Batal diklik", () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    );

    const backButton = screen.getByRole("button", { name: /Batal/i });
    fireEvent.click(backButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("tidak boleh submit jika belum memilih waktu peminjaman", () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    );

    const submitButton = screen.getByRole("button", {
      name: /Ajukan Peminjaman/i,
    });
    fireEvent.click(submitButton);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Silakan pilih waktu peminjaman terlebih dahulu/i)).toBeInTheDocument();
  });

  it("harus mengirimkan payload booking yang valid saat tombol Ajukan Peminjaman diklik setelah memilih waktu", () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Pilih opsi yang tersedia/i }));
    fireEvent.click(screen.getByRole("button", { name: "10:00 WIB" }));

    const submitButton = screen.getByRole("button", {
      name: /Ajukan Peminjaman/i,
    });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submittedData = handleSubmit.mock.calls[0][0];

    expect(submittedData.asset.name).toBe("PORSCHE");
    expect(submittedData.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(submittedData.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(submittedData.startDate).toBe(todayIso());
    expect(submittedData.endDate >= submittedData.startDate).toBe(true);
    expect(submittedData.purpose).toBe("Keperluan Operasional");
    expect(submittedData.time).toBe("10:00");
  });

  it("mengirim jam mulai saja agar muat di kolom jam_mulai", () => {
    const handleSubmit = vi.fn();

    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Pilih opsi yang tersedia/i }));
    fireEvent.click(screen.getByRole("button", { name: "13:00 WIB" }));
    fireEvent.click(screen.getByRole("button", { name: /Ajukan Peminjaman/i }));

    expect(handleSubmit.mock.calls[0][0].time).toBe("13:00");
  });

  it("menonaktifkan tanggal yang sudah lewat", () => {
    render(
      <BookingFormPanel
        selectedAsset={mockAsset}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Bulan sebelumnya" })[0]);

    const tanggalSatu = screen.getAllByRole("button", { name: "1" })[0];
    expect(tanggalSatu).toBeDisabled();
  });
});

describe("helper kalender", () => {
  it("menyusun grid September 2026 yang dimulai hari Selasa", () => {
    const { leadingDays, days } = buildMonthGrid({ year: 2026, month: 8 });

    expect(leadingDays).toEqual([30, 31]);
    expect(days).toHaveLength(30);
  });

  it("menangani tahun kabisat pada bulan Februari", () => {
    expect(buildMonthGrid({ year: 2028, month: 1 }).days).toHaveLength(29);
    expect(buildMonthGrid({ year: 2027, month: 1 }).days).toHaveLength(28);
  });

  it("berpindah tahun saat navigasi melewati Desember", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it("mengambil jam pertama dari label opsi waktu", () => {
    expect(extractStartTime("08:00 - 17:00 WIB (Seharian)")).toBe("08:00");
    expect(extractStartTime("09.00")).toBe("09:00");
    expect(extractStartTime("Pilih opsi yang tersedia")).toBe("08:00");
  });
});
