import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileAdmin } from "../components/Admin/ProfileAdmin";
import * as api from "../services/api";

vi.mock("../services/api", () => {
  class ApiError extends Error {
    status: number;
    constructor(message: string, status: number = 400) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  return {
    fetchSession: vi.fn().mockResolvedValue({
      authenticated: true,
      role: "admin",
      user: {
        id: 1,
        username: "admin_bina",
        nama: "admin_bina",
        nip: "198001012005011001",
        foto: "/images/avatar_pria.png",
        role: "admin",
      },
    }),
    updateAdminProfile: vi.fn().mockResolvedValue({
      user: {
        id: 1,
        username: "admin_baru",
        nama: "admin_baru",
        nip: "198001012005011002",
        foto: "/images/avatar_pria.png",
        role: "admin",
      },
      message: "Profil Administrator berhasil diperbarui.",
    }),
    updateAdminAvatar: vi.fn().mockResolvedValue({
      foto: "/images/avatar_wanita.png",
      message: "Foto karakter profil berhasil diperbarui.",
    }),
    updateUserAvatar: vi.fn().mockResolvedValue({
      foto: "/images/avatar_wanita.png",
      message: "Foto karakter profil berhasil diperbarui.",
    }),
    ApiError,
  };
});

describe("ProfileAdmin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial admin profile data, header PROFIL, and access rights", async () => {
    render(<ProfileAdmin onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("admin_bina")).toBeInTheDocument();
      expect(screen.getByText("198001012005011001")).toBeInTheDocument();
    });

    expect(screen.getByText("PROFIL")).toBeInTheDocument();
    expect(screen.getByText(/Role : Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/\[Kelola Aset\] \[Approve Peminjaman\] \[Kelola User\]/i)).toBeInTheDocument();
  });

  it("opens PilihKarakterModal when avatar pencil is clicked and allows selecting Wanita or Pria", async () => {
    render(<ProfileAdmin onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("admin_bina")).toBeInTheDocument();
    });

    const avatarPencil = screen.getByTitle("Pilih Karakter Profil");
    fireEvent.click(avatarPencil);

    expect(screen.getByRole("heading", { name: "Pilih Karakter Profil" })).toBeInTheDocument();
    expect(screen.getByText("Wanita")).toBeInTheDocument();
    expect(screen.getByText("Pria")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Wanita"));
    fireEvent.click(screen.getByRole("button", { name: "Terapkan" }));

    await waitFor(() => {
      expect(api.updateAdminAvatar).toHaveBeenCalledWith("/images/avatar_wanita.png");
    });
  });

  it("opens edit modal with current data when edit akun button is clicked", async () => {
    render(<ProfileAdmin onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("admin_bina")).toBeInTheDocument();
    });

    const editBtn = screen.getByTitle("Edit Data Akun");
    fireEvent.click(editBtn);

    expect(screen.getByRole("heading", { name: "Edit Profil Admin" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("admin_bina")).toBeInTheDocument();
    expect(screen.getByDisplayValue("198001012005011001")).toBeInTheDocument();
  });

  it("submits updated profile data successfully and displays success alert", async () => {
    render(<ProfileAdmin onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("admin_bina")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Edit Data Akun"));

    const usernameInput = screen.getByDisplayValue("admin_bina");
    const nipInput = screen.getByDisplayValue("198001012005011001");
    const passwordInput = screen.getByPlaceholderText("Kosongkan jika tidak diubah");

    fireEvent.change(usernameInput, { target: { value: "admin_baru" } });
    fireEvent.change(nipInput, { target: { value: "198001012005011002" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    await waitFor(() => {
      expect(api.updateAdminProfile).toHaveBeenCalledWith({
        username: "admin_baru",
        nip: "198001012005011002",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Profil Administrator berhasil diperbarui.")).toBeInTheDocument();
      expect(screen.getByText("admin_baru")).toBeInTheDocument();
      expect(screen.getByText("198001012005011002")).toBeInTheDocument();
    });
  });

  it("displays error message when updateAdminProfile fails", async () => {
    (api.updateAdminProfile as any).mockRejectedValueOnce(
      new (api.ApiError as any)("Username atau NIP Administrator sudah terdaftar di sistem.", 409)
    );

    render(<ProfileAdmin onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("admin_bina")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Edit Data Akun"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    await waitFor(() => {
      expect(
        screen.getByText("Username atau NIP Administrator sudah terdaftar di sistem.")
      ).toBeInTheDocument();
    });
  });
});
