export const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export interface MonthView {
  year: number;
  /** 0 = Januari, 11 = Desember (mengikuti Date#getMonth). */
  month: number;
}

export function currentMonthView(): MonthView {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth(view: MonthView, delta: number): MonthView {
  const date = new Date(view.year, view.month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * Susunan tanggal satu bulan untuk grid kalender 7 kolom (Minggu di kiri).
 * leadingDays berisi tanggal akhir bulan sebelumnya sebagai pengisi baris pertama.
 */
export function buildMonthGrid(view: MonthView) {
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const daysInPrevMonth = new Date(view.year, view.month, 0).getDate();

  const leadingDays = Array.from(
    { length: firstWeekday },
    (_, i) => daysInPrevMonth - firstWeekday + i + 1
  );
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return { leadingDays, days };
}

/** Format YYYY-MM-DD tanpa konversi zona waktu (toISOString memakai UTC). */
export function toIsoDate(view: MonthView, day: number): string {
  const mm = String(view.month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${view.year}-${mm}-${dd}`;
}

export function todayIso(): string {
  const now = new Date();
  return toIsoDate({ year: now.getFullYear(), month: now.getMonth() }, now.getDate());
}

/**
 * Kolom jam_mulai hanya menyimpan jam mulai (VARCHAR 20), sedangkan opsi di
 * form berupa label seperti "08:00 - 12:00 WIB (Pagi)" atau "09.00".
 * Ambil jam pertamanya dalam format HH:MM.
 */
export function extractStartTime(label: string, fallback = "08:00"): string {
  const match = /(\d{2})[:.](\d{2})/.exec(label);
  return match ? `${match[1]}:${match[2]}` : fallback;
}
