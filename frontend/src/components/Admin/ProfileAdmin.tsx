import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminPage } from "./AdminSidebar";
import { fetchSession, updateAdminProfile, updateAdminAvatar, ApiError } from "../../services/api";
import { PilihKarakterModal } from "../Profile/UserActionModals";

interface ProfileAdminProps {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export const ProfileAdmin: React.FC<ProfileAdminProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [adminData, setAdminData] = useState({
    username: "-",
    nip: "-",
    foto: "/images/avatar_pria.png",
    role: "Admin",
    hakAkses: "[Kelola Aset] [Approve Peminjaman] [Kelola User]",
    password: "••••••••••••••",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isKarakterModalOpen, setIsKarakterModalOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    username: adminData.username,
    nip: adminData.nip,
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    fetchSession("admin")
      .then((session) => {
        if ((session.role === "admin" || session.role === "super_admin") && session.user) {
          const { username, nip, foto } = session.user;
          const userFoto = (foto && foto !== "default.png" && foto !== "/images/profileadmin.png")
            ? foto
            : (localStorage.getItem("bina_marga_admin_avatar") || "/images/avatar_pria.png");

          const isSA = session.user.role === "super_admin" || session.role === "super_admin";
          setAdminData((prev) => ({
            ...prev,
            username: username || prev.username,
            nip: nip || prev.nip,
            foto: userFoto,
            role: isSA ? "Super Admin" : "Admin",
            hakAkses: isSA
              ? "[Kelola Aset] [Approve Peminjaman] [Kelola User] [Pengangkatan Admin]"
              : "[Kelola Aset] [Approve Peminjaman] [Kelola User]",
          }));
          setEditForm((prev) => ({
            ...prev,
            username: username || prev.username,
            nip: nip || prev.nip,
          }));
        }
      })
      .catch(() => {
        // Tetap tampilkan placeholder bila sesi tidak dapat dimuat.
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      const res = await updateAdminProfile({
        username: editForm.username.trim(),
        nip: editForm.nip.trim(),
        password: editForm.password ? editForm.password : undefined,
      });

      const updatedUsername = res.user?.username || editForm.username.trim();
      const updatedNip = res.user?.nip || editForm.nip.trim();

      setAdminData((prev) => ({
        ...prev,
        username: updatedUsername,
        nip: updatedNip,
        foto: res.user?.foto || prev.foto,
      }));
      setSubmitSuccess(res.message || "Profil Administrator berhasil diperbarui.");
      setIsEditModalOpen(false);
      setEditForm({
        username: updatedUsername,
        nip: updatedNip,
        password: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Terjadi kesalahan saat menyimpan perubahan profil.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectKarakter = async (newAvatar: string) => {
    setAdminData((prev) => ({ ...prev, foto: newAvatar }));
    try {
      localStorage.setItem("bina_marga_admin_avatar", newAvatar);
      window.dispatchEvent(new Event("avatarChanged"));
    } catch {}

    try {
      await updateAdminAvatar(newAvatar);
      setSubmitSuccess("Foto karakter profil berhasil diperbarui.");
    } catch {
      setSubmitError("Gagal memperbarui foto karakter profil.");
    }
  };

  const displayAvatar = (adminData.foto && adminData.foto !== "default.png" && adminData.foto !== "/images/profileadmin.png")
    ? adminData.foto
    : "/images/avatar_pria.png";

  return (
    <AdminLayout
      activePage="profile-admin"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="w-full">
        {submitSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">{submitSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccess("")}
              className="text-emerald-500 hover:text-emerald-700 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Header Profil & Role */}
          <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {/* Wide Building Photo */}
            <div className="w-full h-44 sm:h-64 overflow-hidden bg-gray-900 relative">
              <img
                src="/images/admin_banner.png"
                alt="Gedung Dinas Pekerjaan Umum Bina Marga Jawa Timur"
                className="w-full h-full object-cover object-center pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/admin.png";
                }}
              />
            </div>

            {/* Avatar & Role Info Section */}
            <div className="px-6 sm:px-10 pb-6 pt-0 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-14 relative">
              {/* Avatar Admin */}
              <div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-36 sm:h-36 shrink-0">
                <div
                  onClick={() => setIsKarakterModalOpen(true)}
                  title="Klik untuk memilih karakter profil"
                  className="w-full h-full rounded-full border-4 border-white bg-[#cbd5e1] flex items-center justify-center overflow-hidden shadow-md cursor-pointer group hover:ring-4 hover:ring-[#fed000] transition-all"
                >
                  <img
                    src={displayAvatar}
                    alt={adminData.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/avatar_pria.png";
                    }}
                  />
                </div>

                {/* Pencil Edit Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKarakterModalOpen(true);
                  }}
                  title="Pilih Karakter Profil"
                  className="absolute right-1 bottom-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <svg
                    className="w-4 h-4 text-black"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>

              {/* Role & Hak Akses Text */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-14 pt-2">
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-black">
                    Role : {adminData.role}
                  </span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-black block mb-0.5">
                    Hak Akses :
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    {adminData.hakAkses}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Akun */}
          <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-xs p-8 sm:p-12">
            <div className="space-y-6">
              {/* Row 1: Username with Edit Akun Button */}
              <div className="pb-4 border-b border-black flex items-center justify-between gap-4">
                <div className="grid grid-cols-[140px_20px_1fr] sm:grid-cols-[180px_20px_1fr] items-center text-sm sm:text-base text-black flex-1">
                  <span className="font-normal text-gray-800">Username</span>
                  <span className="font-bold">:</span>
                  <span className="font-extrabold text-black">
                    {adminData.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      username: adminData.username !== "-" ? adminData.username : "",
                      nip: adminData.nip !== "-" ? adminData.nip : "",
                      password: "",
                    });
                    setSubmitError("");
                    setIsEditModalOpen(true);
                  }}
                  title="Edit Data Akun"
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-[#fed000]/20 hover:text-[#071d63] text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Data Akun</span>
                </button>
              </div>

              {/* Row 2: NIP */}
              <div className="pb-4 border-b border-black">
                <div className="grid grid-cols-[140px_20px_1fr] sm:grid-cols-[180px_20px_1fr] items-center text-sm sm:text-base text-black">
                  <span className="font-normal text-gray-800">NIP</span>
                  <span className="font-bold">:</span>
                  <span className="font-extrabold text-black">
                    {adminData.nip}
                  </span>
                </div>
              </div>

              {/* Row 3: Password */}
              <div className="pb-4 border-b border-black">
                <div className="grid grid-cols-[140px_20px_1fr] sm:grid-cols-[180px_20px_1fr] items-center text-sm sm:text-base text-black">
                  <span className="font-normal text-gray-800">Password</span>
                  <span className="font-bold">:</span>
                  <span className="font-extrabold tracking-widest text-black">
                    **************
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pilih Karakter Profil */}
      <PilihKarakterModal
        isOpen={isKarakterModalOpen}
        currentAvatar={displayAvatar}
        onClose={() => setIsKarakterModalOpen(false)}
        onSelect={handleSelectKarakter}
      />

      {/* Modal Edit Profil */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-center gap-3 w-full mb-2">
              <div className="flex-1 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#071d63] tracking-wide whitespace-nowrap">
                Edit Profil Admin
              </h2>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  Nama / Username
                </label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#fed000] focus:outline-none text-sm font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nip}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nip: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#fed000] focus:outline-none text-sm font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak diubah"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#fed000] focus:outline-none text-sm font-medium text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#071d63] hover:bg-[#0c2f9e] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
