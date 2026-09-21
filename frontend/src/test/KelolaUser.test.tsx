import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { KelolaUser } from "../components/Admin/KelolaUser";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchSession: vi.fn(),
  promoteUserToAdmin: vi.fn(),
  demoteUserFromAdmin: vi.fn(),
}));

describe("KelolaUser Component - Layout and Features", () => {
  const dummyUsers = [
    {
      id: 1,
      nama: "Muhammad Ryan Ardiansyah",
      noHp: "+62 89612548511",
      nip: "198001012010011001",
      foto: "/images/avatar_pria.png",
      isAdmin: false,
      adminRole: null,
    },
    {
      id: 2,
      nama: "Siti Fatimah",
      noHp: "+62 81234567890",
      nip: "198502022012022002",
      foto: "/images/avatar_wanita.png",
      isAdmin: true,
      adminRole: "admin",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchUsers as any).mockResolvedValue({ users: dummyUsers });
    (api.fetchSession as any).mockResolvedValue({
      authenticated: true,
      role: "admin",
      user: { id: 2, username: "admin_biasa", role: "admin" },
    });
    (api.promoteUserToAdmin as any).mockResolvedValue({
      message: "Pegawai berhasil diangkat menjadi Admin.",
    });
    (api.demoteUserFromAdmin as any).mockResolvedValue({
      message: "Hak akses Admin berhasil dicabut.",
    });
  });

  it("renders table with headers: Nama, No. telepon, Password and NO NIP column", async () => {
    const handleNavigate = vi.fn();
    const handleLogout = vi.fn();

    render(
      <KelolaUser onNavigate={handleNavigate} onLogout={handleLogout} />
    );

    await waitFor(() => {
      expect(screen.getByText("Nama")).toBeDefined();
      expect(screen.getByText("No. telepon")).toBeDefined();
      expect(screen.getByText("Password")).toBeDefined();
    });

    const tableHeader = screen.getAllByRole("row")[0];
    expect(tableHeader.textContent).not.toContain("NIP");
  });

  it("renders user rows with avatar, phone, masked password, and red trash button", async () => {
    const handleNavigate = vi.fn();
    const handleLogout = vi.fn();

    render(
      <KelolaUser onNavigate={handleNavigate} onLogout={handleLogout} />
    );

    await waitFor(() => {
      expect(screen.getByText("Muhammad Ryan Ardiansyah")).toBeDefined();
      expect(screen.getByText("+62 89612548511")).toBeDefined();
    });

    const passwords = screen.getAllByText("*********");
    expect(passwords.length).toBe(2);

    const deleteButtons = screen.getAllByTitle("Hapus Pengguna");
    expect(deleteButtons.length).toBe(2);
  });

  it("does NOT render add user button since Kelola User is only for deleting users", async () => {
    const handleNavigate = vi.fn();
    const handleLogout = vi.fn();

    render(
      <KelolaUser onNavigate={handleNavigate} onLogout={handleLogout} />
    );

    await waitFor(() => {
      expect(screen.queryByTitle("Tambah User")).toBeNull();
      expect(screen.getByText("No.")).toBeDefined();
    });
  });

  it("opens delete confirmation modal when red trash can button is clicked", async () => {
    const handleNavigate = vi.fn();
    const handleLogout = vi.fn();

    render(
      <KelolaUser onNavigate={handleNavigate} onLogout={handleLogout} />
    );

    await waitFor(() => {
      expect(screen.getAllByTitle("Hapus Pengguna").length).toBe(2);
    });

    const firstDeleteBtn = screen.getAllByTitle("Hapus Pengguna")[0];
    fireEvent.click(firstDeleteBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Hapus" })).toBeDefined();
    });
  });

  it("does NOT display '+ Jadikan Admin' button when logged in as regular Admin", async () => {
    (api.fetchSession as any).mockResolvedValue({
      authenticated: true,
      role: "admin",
      user: { id: 2, username: "admin_biasa", role: "admin" },
    });

    render(
      <KelolaUser onNavigate={vi.fn()} onLogout={vi.fn()} adminRole="admin" />
    );

    await waitFor(() => {
      expect(screen.getByText("Muhammad Ryan Ardiansyah")).toBeDefined();
    });

    expect(screen.queryByText("+ Jadikan Admin")).toBeNull();
    expect(screen.getByText("User Biasa")).toBeDefined();
  });

  it("displays '+ Jadikan Admin' button and promotes user when logged in as Super Admin", async () => {
    (api.fetchSession as any).mockResolvedValue({
      authenticated: true,
      role: "super_admin",
      user: { id: 1, username: "super_admin", role: "super_admin" },
    });

    render(
      <KelolaUser onNavigate={vi.fn()} onLogout={vi.fn()} adminRole="super_admin" />
    );

    await waitFor(() => {
      expect(screen.getByText("Muhammad Ryan Ardiansyah")).toBeDefined();
      expect(screen.getByText("+ Jadikan Admin")).toBeDefined();
      expect(screen.getByText(/Anda memiliki wewenang untuk mengangkat pegawai/)).toBeDefined();
    });

    const promoteBtn = screen.getByText("+ Jadikan Admin");
    fireEvent.click(promoteBtn);

    await waitFor(() => {
      expect(screen.getByText("Jadikan Admin?")).toBeDefined();
    });

    const confirmPromoteBtn = screen.getByRole("button", { name: "Jadikan Admin" });
    fireEvent.click(confirmPromoteBtn);

    await waitFor(() => {
      expect(api.promoteUserToAdmin).toHaveBeenCalledWith(1);
    });
  });

  it("displays 'Cabut Admin' button and calls demoteUserFromAdmin when Super Admin revokes access", async () => {
    (api.fetchSession as any).mockResolvedValue({
      authenticated: true,
      role: "super_admin",
      user: { id: 1, username: "super_admin", role: "super_admin" },
    });

    render(
      <KelolaUser onNavigate={vi.fn()} onLogout={vi.fn()} adminRole="super_admin" />
    );

    await waitFor(() => {
      expect(screen.getByText("Siti Fatimah")).toBeDefined();
      expect(screen.getByText("Cabut Admin")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Cabut Admin"));

    await waitFor(() => {
      expect(screen.getByText("Cabut Hak Akses Admin?")).toBeDefined();
    });

    const confirmDemoteBtn = screen.getByRole("button", { name: "Cabut Hak Akses" });
    fireEvent.click(confirmDemoteBtn);

    await waitFor(() => {
      expect(api.demoteUserFromAdmin).toHaveBeenCalledWith(2);
    });
  });

  it("protects primary Super Admin with '★ Super Admin' badge and no promote/demote action", async () => {
    (api.fetchUsers as any).mockResolvedValue({
      users: [
        {
          id: 99,
          nama: "Budi Super Admin",
          noHp: "+62 81333334444",
          nip: "197501012000011001",
          foto: "/images/avatar_pria.png",
          isAdmin: true,
          adminRole: "super_admin",
        },
      ],
    });

    render(
      <KelolaUser onNavigate={vi.fn()} onLogout={vi.fn()} adminRole="super_admin" />
    );

    await waitFor(() => {
      expect(screen.getByText("Budi Super Admin")).toBeDefined();
      expect(screen.getByText("★ Super Admin")).toBeDefined();
      expect(screen.queryByText("+ Jadikan Admin")).toBeNull();
      expect(screen.queryByText("Cabut Admin")).toBeNull();
    });
  });

  it("filters users dynamically when typing in the search box", async () => {
    render(
      <KelolaUser onNavigate={vi.fn()} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Muhammad Ryan Ardiansyah")).toBeDefined();
      expect(screen.getByText("Siti Fatimah")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Cari Nama atau Nomor Telepon/i);
    fireEvent.change(searchInput, { target: { value: "Siti" } });

    await waitFor(() => {
      expect(screen.queryByText("Muhammad Ryan Ardiansyah")).toBeNull();
      expect(screen.getByText("Siti Fatimah")).toBeDefined();
    });
  });
});
