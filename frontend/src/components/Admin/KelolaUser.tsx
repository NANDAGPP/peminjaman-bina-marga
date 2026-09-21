import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import { ActionConfirmModal } from "./Modals/ActionConfirmModal";
import { UserFormModal, UserFormData } from "./Modals/UserFormModal";
import { AdminPagination } from "./Common/AdminPagination";
import {
  ApiError,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchSession,
  promoteUserToAdmin,
  demoteUserFromAdmin,
} from "../../services/api";

interface KelolaUserProps {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  adminRole?: "super_admin" | "admin";
}

export interface UserItem {
  id: number;
  nama: string;
  noHp: string;
  nip?: string;
  password?: string;
  foto: string;
  isAdmin?: boolean;
  adminRole?: "super_admin" | "admin" | null;
}

const STORAGE_KEY = "bina_marga_users_list";

export const KelolaUser: React.FC<KelolaUserProps> = ({
  onNavigate,
  onLogout,
  adminRole,
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Admin Session Role State (super_admin vs admin)
  const [currentAdminRole, setCurrentAdminRole] = useState<"super_admin" | "admin">(() => {
    if (adminRole) return adminRole;
    try {
      const saved = localStorage.getItem("bina_marga_current_admin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === "super_admin" || parsed?.role === "admin") {
          return parsed.role;
        }
      }
    } catch {}
    return "admin";
  });

  // Modal States
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Role Promotion / Demote Modal States
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [roleActionType, setRoleActionType] = useState<"promote" | "demote">("promote");
  const [userToModifyRole, setUserToModifyRole] = useState<UserItem | null>(null);

  useEffect(() => {
    if (adminRole) {
      setCurrentAdminRole(adminRole);
      return;
    }
    fetchSession("admin")
      .then((res) => {
        if (res.authenticated && (res.user || res.role)) {
          const r =
            res.user?.role === "super_admin" || res.role === "super_admin"
              ? "super_admin"
              : "admin";
          setCurrentAdminRole(r);
        }
      })
      .catch(() => {});
  }, [adminRole]);

  const isSuperAdmin = currentAdminRole === "super_admin";

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetchUsers();
      if (response && Array.isArray(response.users)) {
        setUsers(response.users);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.users));
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // Fallback ke localStorage bila server offline
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setIsEdit(true);
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleOpenDelete = (user: UserItem) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleOpenPromote = (user: UserItem) => {
    setUserToModifyRole(user);
    setRoleActionType("promote");
    setRoleModalOpen(true);
  };

  const handleOpenDemote = (user: UserItem) => {
    setUserToModifyRole(user);
    setRoleActionType("demote");
    setRoleModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!userToModifyRole) return;
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (roleActionType === "promote") {
        const res = await promoteUserToAdmin(userToModifyRole.id);
        setSuccessMessage(
          res?.message || `Pegawai ${userToModifyRole.nama} berhasil diangkat menjadi Admin.`
        );
      } else {
        const res = await demoteUserFromAdmin(userToModifyRole.id);
        setSuccessMessage(
          res?.message || `Hak akses Admin untuk ${userToModifyRole.nama} berhasil dicabut.`
        );
      }
      await loadUsers();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal memperbarui role pengguna."
      );
      // Fallback update lokal bila backend tidak dapat diakses
      if (roleActionType === "promote") {
        const updated = users.map((u) =>
          u.id === userToModifyRole.id
            ? { ...u, isAdmin: true, adminRole: "admin" as const }
            : u
        );
        setUsers(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      } else {
        const updated = users.map((u) =>
          u.id === userToModifyRole.id
            ? { ...u, isAdmin: false, adminRole: null }
            : u
        );
        setUsers(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
    } finally {
      setRoleModalOpen(false);
      setUserToModifyRole(null);
    }
  };

  const handleSaveUser = async (data: UserFormData) => {
    setErrorMessage("");
    try {
      if (isEdit && selectedUser) {
        await updateUser({
          id: selectedUser.id,
          nama: data.nama,
          nip: data.nip || selectedUser.nip || "-",
          noHp: data.noHp,
          password: data.password || undefined,
          foto: data.foto || selectedUser.foto,
        });
      } else {
        await createUser({
          nama: data.nama,
          nip: data.nip || "-",
          noHp: data.noHp,
          password: data.password || "user1234",
          foto: data.foto || "/images/avatar_default.png",
        });
      }
      await loadUsers();
      setFormOpen(false);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal menyimpan data user."
      );
      // Simpan lokal jika backend gagal
      if (isEdit && selectedUser) {
        const updated: UserItem = {
          ...selectedUser,
          nama: data.nama,
          noHp: data.noHp,
          nip: data.nip || selectedUser.nip,
          password: data.password ? data.password : selectedUser.password,
          foto: data.foto || selectedUser.foto,
        };
        const newList = users.map((u) => (u.id === selectedUser.id ? updated : u));
        setUsers(newList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      } else {
        const newUser: UserItem = {
          id: Date.now(),
          nama: data.nama,
          noHp: data.noHp,
          nip: data.nip || "-",
          password: data.password || "user1234",
          foto: data.foto || "/images/avatar_default.png",
        };
        const newList = [newUser, ...users];
        setUsers(newList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      }
      setFormOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setErrorMessage("");
    try {
      await deleteUser(userToDelete.id);
      await loadUsers();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Gagal menghapus user."
      );
      const newList = users.filter((u) => u.id !== userToDelete.id);
      setUsers(newList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.nama.toLowerCase().includes(q) ||
      u.noHp.toLowerCase().includes(q) ||
      (u.nip && u.nip.toLowerCase().includes(q))
    );
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedUsers = filteredUsers.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout
      activePage="kelola-user"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {/* Banner informasi role super admin */}
        {isSuperAdmin && (
          <div className="mb-4 px-5 py-3.5 bg-[#071d63] text-white rounded-2xl flex items-center justify-between shadow-xs border border-white/10">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fed000] animate-pulse shrink-0" />
              <span>
                Mode <strong className="text-[#fed000]">Super Admin</strong> aktif. Anda memiliki wewenang untuk mengangkat pegawai menjadi Admin atau mencabut hak akses Admin.
              </span>
            </div>
            <span className="hidden sm:inline-flex text-[11px] font-black uppercase tracking-wider bg-[#fed000] text-[#071d63] px-3 py-1 rounded-full shadow-xs">
              Privileged
            </span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Nama atau Nomor Telepon..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fed000] focus:border-transparent shadow-2xs pl-10"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table Container Card */}
        <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] border border-gray-200/90 shadow-[0_6px_25px_rgba(0,0,0,0.04)] overflow-hidden pb-12 min-h-[520px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black/90">
                  {/* Column 1: Header No. */}
                  <th className="py-4 sm:py-5 px-6 sm:px-8 font-black text-black text-sm sm:text-base tracking-tight w-[140px]">
                    No.
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 font-black text-black text-sm sm:text-base tracking-tight">
                    Nama
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 font-black text-black text-sm sm:text-base tracking-tight">
                    No. telepon
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 font-black text-black text-sm sm:text-base tracking-tight">
                    Password
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 font-black text-black text-sm sm:text-base tracking-tight">
                    Role & Hak Akses
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-right w-[90px]"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, idx) => {
                  const itemNumber = (validCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  return (
                    <tr
                      key={user.id}
                      className="border-b-2 border-black/90 hover:bg-[#f8fafd]/80 transition-colors"
                    >
                      {/* Number + Circular Avatar with Gold Ring */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <span className="font-black text-black text-base sm:text-lg shrink-0 w-6 text-right">
                            {itemNumber}.
                          </span>
                          <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#fbc02d] flex items-center justify-center overflow-hidden shrink-0 bg-white p-0.5 shadow-sm select-none"
                          >
                            <img
                              src={user.foto || "/images/avatar_pria.png"}
                              alt={user.nama}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/images/avatar_pria.png";
                              }}
                              className="w-full h-full object-cover rounded-full pointer-events-none"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Nama */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8 font-bold text-gray-800 text-sm sm:text-[15px] leading-snug select-none">
                        {user.nama}
                      </td>

                      {/* No. telepon */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8 font-medium text-gray-700 text-sm sm:text-[15px]">
                        {user.noHp}
                      </td>

                      {/* Password */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8 font-black text-gray-800 text-sm sm:text-base tracking-widest select-none">
                        *********
                      </td>

                      {/* Role & Akses Badge + Promote/Demote Action Button */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8">
                        <div className="flex flex-wrap items-center gap-2">
                          {user.adminRole === "super_admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#071d63] text-[#fed000] border border-[#fed000]/40 shadow-xs">
                              ★ Super Admin
                            </span>
                          ) : user.isAdmin || user.adminRole === "admin" ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fff8e1] text-[#b78103] border border-[#ffe082]">
                                Admin
                              </span>
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDemote(user)}
                                  title="Cabut hak akses Admin dari pegawai ini"
                                  className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cabut Admin
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                Pegawai
                              </span>
                              {isSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPromote(user)}
                                  title="Jadikan pegawai ini sebagai Admin"
                                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#071d63] hover:text-[#0b2c6a] bg-[#fed000] hover:bg-[#e5bc00] px-3 py-1 rounded-lg transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  <img
                                    src="/images/tambah.png"
                                    alt="Tambah"
                                    className="w-3 h-3 object-contain"
                                  />
                                  <span>+ Jadikan Admin</span>
                                </button>
                              ) : (
                                <span
                                  className="text-[11px] text-gray-400 italic"
                                  title="Hanya Super Admin yang dapat mengangkat user menjadi admin"
                                >
                                  User Biasa
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Action Hapus */}
                      <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(user)}
                          title="Hapus Pengguna"
                          aria-label="Hapus Pengguna"
                          className="p-1 hover:scale-115 active:scale-95 transition-transform cursor-pointer inline-flex items-center justify-center"
                        >
                          <img
                            src="/images/hapus.png"
                            alt=""
                            aria-hidden="true"
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none"
                            onError={(e) => {
                              (e.target as any).src = "/images/hapusfile.png";
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {loading && users.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-sm font-medium">
                <div className="w-8 h-8 border-4 border-[#071d63] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Memuat data pengguna...
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm font-medium">
                Belum ada data user terdaftar.
              </div>
            ) : null}

            {users.length > 0 && (
              <div className="mt-8 mb-4">
                <AdminPagination
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form Tambah / Edit User */}
      <UserFormModal
        isOpen={formOpen}
        isEdit={isEdit}
        initialData={
          selectedUser
            ? {
                id: selectedUser.id,
                nama: selectedUser.nama,
                noHp: selectedUser.noHp,
                nip: selectedUser.nip || "",
                password: "",
                foto: selectedUser.foto,
              }
            : null
        }
        onClose={() => setFormOpen(false)}
        onSave={handleSaveUser}
      />

      {/* Modal Konfirmasi Hapus User */}
      <ActionConfirmModal
        isOpen={deleteModalOpen}
        type="hapus"
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun pegawai ${userToDelete?.nama}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

      {/* Modal Konfirmasi Promosi / Cabut Status Admin */}
      <ActionConfirmModal
        isOpen={roleModalOpen}
        type={roleActionType === "promote" ? "terima" : "hapus"}
        title={roleActionType === "promote" ? "Jadikan Admin?" : "Cabut Hak Akses Admin?"}
        message={
          roleActionType === "promote"
            ? `Apakah Anda yakin ingin mengangkat pegawai "${userToModifyRole?.nama}" menjadi Admin? Pegawai akan dapat login ke portal Admin dengan akun miliknya.`
            : `Apakah Anda yakin ingin mencabut status Admin dari "${userToModifyRole?.nama}"? Pegawai akan kembali menjadi akun pegawai biasa.`
        }
        confirmText={roleActionType === "promote" ? "Jadikan Admin" : "Cabut Hak Akses"}
        onConfirm={handleConfirmRoleChange}
        onClose={() => setRoleModalOpen(false)}
      />
    </AdminLayout>
  );
};
