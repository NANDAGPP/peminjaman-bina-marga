import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  promoteUserToAdmin,
  demoteUserFromAdmin,
  fetchSession,
  clearCsrfToken,
  ApiError,
  fetchUsers,
} from "../services/api";

describe("TDD: Core API & Super Admin RBAC Services", () => {
  beforeEach(() => {
    clearCsrfToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearCsrfToken();
  });

  it("promoteUserToAdmin: should fetch CSRF token first, then POST to /api/users.php?action=promote_to_admin", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        authenticated: true,
        role: "super_admin",
        csrf_token: "mock-csrf-token-12345",
      }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Pegawai ryan berhasil diangkat menjadi Admin.",
      }),
    });

    const result = await promoteUserToAdmin(42);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock.mock.calls[0][0]).toContain("/api/auth.php?action=me");

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/api/users.php?action=promote_to_admin");
    expect(options.method).toBe("POST");
    expect(options.headers["X-CSRF-Token"]).toBe("mock-csrf-token-12345");
    expect(JSON.parse(options.body)).toEqual({ id: 42 });
    expect(result.message).toBe("Pegawai ryan berhasil diangkat menjadi Admin.");
  });

  it("promoteUserToAdmin: should throw ApiError with status 403 if non-super-admin tries to promote", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ csrf_token: "csrf-token-abc" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        message: "Akses ditolak. Tindakan ini hanya dapat dilakukan oleh Super Admin.",
      }),
    });

    await expect(promoteUserToAdmin(99)).rejects.toThrow(
      "Akses ditolak. Tindakan ini hanya dapat dilakukan oleh Super Admin."
    );
  });

  it("demoteUserFromAdmin: should send POST to /api/users.php?action=demote_from_admin with target id", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ csrf_token: "token-demote-777" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Hak akses Admin berhasil dicabut.",
      }),
    });

    const res = await demoteUserFromAdmin(15);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/api/users.php?action=demote_from_admin");
    expect(options.method).toBe("POST");
    expect(options.headers["X-CSRF-Token"]).toBe("token-demote-777");
    expect(JSON.parse(options.body)).toEqual({ id: 15 });
    expect(res.message).toBe("Hak akses Admin berhasil dicabut.");
  });

  it("fetchSession: should correctly parse super_admin session payload", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        authenticated: true,
        role: "super_admin",
        user: {
          id: 1,
          username: "super_admin",
          nama: "Super Administrator",
          nip: "198001012005011001",
          role: "super_admin",
        },
        csrf_token: "csrf-super-admin-xyz",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const session = await fetchSession();

    expect(session.authenticated).toBe(true);
    expect(session.role).toBe("super_admin");
    expect(session.user?.role).toBe("super_admin");
    expect(session.user?.username).toBe("super_admin");
  });

  it("CSRF 419 token expiration: should automatically refresh token and retry request once", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ csrf_token: "expired-old-token" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 419,
      json: async () => ({
        success: false,
        message: "Token keamanan tidak valid.",
      }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ csrf_token: "fresh-new-token" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Operasi berhasil setelah refresh token.",
      }),
    });

    const result = await promoteUserToAdmin(10);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.message).toBe("Operasi berhasil setelah refresh token.");
  });

  it("network error: should throw ApiError with status 0 on connection failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch"))
    );

    try {
      await fetchUsers();
      expect.unreachable("Should have thrown network error");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(0);
      expect((err as ApiError).message).toContain("Tidak dapat terhubung ke server");
    }
  });
});
