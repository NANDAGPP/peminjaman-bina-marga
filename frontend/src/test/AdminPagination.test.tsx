import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminPagination } from "../components/Admin/Common/AdminPagination";

describe("AdminPagination", () => {
  it("menampilkan tombol halaman 1 ketika totalPages adalah 1 atau sedikit", () => {
    const handlePageChange = vi.fn();
    render(
      <AdminPagination
        currentPage={1}
        totalPages={1}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByTitle(/halaman sebelumnya/i)).toBeDisabled();
    expect(screen.getByTitle(/halaman berikutnya/i)).toBeDisabled();
  });

  it("menampilkan nomor halaman 1, 2, 3 jika data bertambah dan totalPages 3", () => {
    const handlePageChange = vi.fn();
    render(
      <AdminPagination
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.getByTitle(/halaman sebelumnya/i)).toBeDisabled();
    expect(screen.getByTitle(/halaman berikutnya/i)).not.toBeDisabled();
  });

  it("memanggil onPageChange saat nomor halaman atau tombol berikutnya diklik", () => {
    const handlePageChange = vi.fn();
    render(
      <AdminPagination
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(handlePageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTitle(/halaman berikutnya/i));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
