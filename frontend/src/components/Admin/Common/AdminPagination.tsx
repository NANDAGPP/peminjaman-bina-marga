import React from "react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Always at least 1 page
  const pagesCount = Math.max(1, totalPages);
  const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2 select-none">
      {/* Tombol Halaman Sebelumnya */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 cursor-pointer shadow-2xs"
        aria-label="Halaman Sebelumnya"
        title="Halaman Sebelumnya"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Tombol Angka Halaman */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs ${isActive
                ? "bg-[#071d63] text-white border-2 border-[#071d63] shadow-xs scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Tombol Halaman Berikutnya */}
      <button
        type="button"
        disabled={currentPage >= pagesCount}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 cursor-pointer shadow-2xs"
        aria-label="Halaman Berikutnya"
        title="Halaman Berikutnya"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
