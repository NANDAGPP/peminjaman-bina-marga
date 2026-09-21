import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginAdmin } from "../components/Admin/LoginAdmin";
import { registerAdmin } from "../services/api";

vi.mock("../services/api", () => ({
  login: vi.fn(),
  registerAdmin: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(msg: string) {
      super(msg);
    }
  },
}));

describe("LoginAdmin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login mode by default", () => {
    render(<LoginAdmin onLoginSuccess={vi.fn()} onBackToUser={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "MASUK SEBAGAI ADMIN" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "MASUK SEBAGAI ADMIN" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Registrasi Protokol Khusus/i)
    ).toBeInTheDocument();
  });

  it("switches to registration mode with secret key input", () => {
    render(<LoginAdmin onLoginSuccess={vi.fn()} onBackToUser={vi.fn()} />);

    fireEvent.click(screen.getByText(/Registrasi Protokol Khusus/i));

    expect(screen.getByText("REGISTRASI ADMINISTRATOR")).toBeInTheDocument();
    expect(screen.getByText(/Kode Otorisasi Protokol Admin/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "DAFTAR SEBAGAI ADMIN" })
    ).toBeInTheDocument();
  });

  it("handles successful admin registration", async () => {
    vi.mocked(registerAdmin).mockResolvedValueOnce({
      message: "Pendaftaran Administrator berhasil. Silakan masuk.",
    });

    render(<LoginAdmin onLoginSuccess={vi.fn()} onBackToUser={vi.fn()} />);

    fireEvent.click(screen.getByText(/Registrasi Protokol Khusus/i));

    fireEvent.change(screen.getByPlaceholderText("Contoh: admin_logistik"), {
      target: { value: "admin_logistik" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contoh: 198501012010011001"), {
      target: { value: "198501012010011001" },
    });
    fireEvent.change(screen.getByPlaceholderText("Minimal 8 karakter"), {
      target: { value: "adminpass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ketik ulang password"), {
      target: { value: "adminpass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Masukkan kode protokol rahasia"), {
      target: { value: "BINAMARGA_ADMIN_2026" },
    });

    fireEvent.click(screen.getByRole("button", { name: "DAFTAR SEBAGAI ADMIN" }));

    await waitFor(() => {
      expect(registerAdmin).toHaveBeenCalledWith({
        username: "admin_logistik",
        nip: "198501012010011001",
        password: "adminpass123",
        secret_key: "BINAMARGA_ADMIN_2026",
      });
      expect(
        screen.getByText("Pendaftaran Administrator berhasil. Silakan masuk.")
      ).toBeInTheDocument();
    });
  });
});
