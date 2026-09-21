import { fetchAssets } from "../../services/api";

export interface Asset {
  id: string;
  name: string;
  category: "mobil" | "motor" | "ruang";
  image: string;
  code: string;
  capacity: string;
  status: "tersedia" | "dipinjam" | "maintenance";
  tipe?: string;
  tahun?: string;
  bahanBakar?: string;
  lantai?: string;
  fasilitas?: string;
  warna?: string;
  mesin?: string;
}

/**
 * Ambil ID database dari ID aset. Aset dari API berformat "k-23" (kendaraan)
 * atau "r-5" (ruangan); aset contoh bawaan seperti "mob-1" tidak punya
 * padanan di database sehingga mengembalikan null.
 */
export function parseAssetDbId(id: string): number | null {
  const match = /^[kr]-(\d+)$/.exec(String(id));

  return match ? Number(match[1]) : null;
}

export function sanitizeAssetImage(
  img?: string,
  category: "mobil" | "motor" | "ruang" = "mobil"
): string {
  if (!img || typeof img !== "string" || img.trim() === "") {
    return category === "ruang"
      ? "/images/aula.png"
      : category === "motor"
        ? "/images/nmax.png"
        : "/images/porsche.png";
  }

  let cleaned = img.trim();

  // If already base64 data URL or external URL, return as is
  if (
    cleaned.startsWith("data:") ||
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  // Ensure single leading slash and no duplicate slashes
  cleaned = "/" + cleaned.replace(/^\/+/, "");

  return cleaned;
}

const STORAGE_KEY = "bina_marga_dynamic_assets";

export function getStoredAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a: Asset) => ({
          ...a,
          image: sanitizeAssetImage(a.image, a.category),
        }));
      }
    }
  } catch {
    // Fallback on storage read error
  }
  return ASSETS_DATA.map((a) => ({
    ...a,
    image: sanitizeAssetImage(a.image, a.category),
  }));
}

export function saveStoredAssets(assets: Asset[]): void {
  try {
    const sanitized = assets.map((a) => ({
      ...a,
      image: sanitizeAssetImage(a.image, a.category),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Fallback on storage write error
  }
}

export function addStoredAsset(asset: Asset): Asset[] {
  const current = getStoredAssets();
  const sanitizedAsset: Asset = {
    ...asset,
    image: sanitizeAssetImage(asset.image, asset.category),
  };
  const updated = [sanitizedAsset, ...current];
  saveStoredAssets(updated);
  return updated;
}

export function updateStoredAsset(asset: Asset): Asset[] {
  const current = getStoredAssets();
  const sanitizedAsset: Asset = {
    ...asset,
    image: sanitizeAssetImage(asset.image, asset.category),
  };
  const updated = current.map((a) =>
    a.id === asset.id ? { ...a, ...sanitizedAsset } : a
  );
  saveStoredAssets(updated);
  return updated;
}

export function deleteStoredAsset(assetId: string): Asset[] {
  const current = getStoredAssets();
  const updated = current.filter((a) => a.id !== assetId);
  saveStoredAssets(updated);
  return updated;
}

/**
 * Data aset selalu diambil dari server supaya status Tersedia/Dipinjam
 * mengikuti persetujuan admin terbaru. Salinan di localStorage hanya
 * dipakai saat server tidak dapat dihubungi.
 */
export async function fetchDynamicAssets(): Promise<Asset[]> {
  try {
    const data = await fetchAssets();
    const list: Asset[] = [];

    if (Array.isArray(data.kendaraan)) {
      data.kendaraan.forEach((k: any) => {
        const cat = String(k.kategori).toLowerCase();
        if (cat === "mobil" || cat === "motor") {
          const rawStatus = String(k.status || "Tersedia").toLowerCase();
          const status =
            rawStatus === "dipinjam"
              ? "dipinjam"
              : rawStatus === "maintenance"
                ? "maintenance"
                : "tersedia";

          list.push({
            id: `k-${k.id_kendaraan}`,
            name: k.nama,
            category: cat as "mobil" | "motor",
            image: sanitizeAssetImage(k.gambar, cat as "mobil" | "motor"),
            code: k.plat || "-",
            capacity: k.kapasitas || "2 Orang",
            status: status as any,
            tipe: k.tipe || "Kendaraan Dinas",
            tahun: k.tahun || "2024",
            bahanBakar: k.bahan_bakar || "Bensin / Pertamax",
          });
        }
      });
    }

    if (Array.isArray(data.ruangan)) {
      data.ruangan.forEach((r: any) => {
        const rawStatus = String(r.status || "Tersedia").toLowerCase();
        const status =
          rawStatus === "dipinjam"
            ? "dipinjam"
            : rawStatus === "maintenance"
              ? "maintenance"
              : "tersedia";

        list.push({
          id: `r-${r.id || r.id_ruangan}`,
          name: r.nama,
          category: "ruang",
          image: sanitizeAssetImage(r.gambar, "ruang"),
          code: r.kode || `R-${r.id}`,
          capacity: `${r.kapasitas || 20} Orang`,
          status: status as any,
          lantai: r.lantai || "Gedung Utama",
          fasilitas: r.fasilitas || "AC, Proyektor, Meja & Kursi",
        });
      });
    }

    saveStoredAssets(list);
    return list;
  } catch {
    return getStoredAssets();
  }
}

export const ASSETS_DATA: Asset[] = [
  // Data Master: Mobil Dinas
  {
    id: "mob-1",
    name: "PORSCHE",
    category: "mobil",
    image: "/images/porsche.png",
    code: "L 333 NT0",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "PORSCHE 911 GT3 RS",
    tahun: "2024",
  },
  {
    id: "mob-2",
    name: "CAMRY",
    category: "mobil",
    image: "/images/camry.png",
    code: "L 333 NYE",
    capacity: "2 Orang",
    status: "maintenance",
    tipe: "TOYOTA CAMRY 2.5 V",
    tahun: "2023",
  },
  {
    id: "mob-3",
    name: "ZENIX",
    category: "mobil",
    image: "/images/zenix.png",
    code: "L 333 SBI",
    capacity: "2 Orang",
    status: "dipinjam",
    tipe: "TOYOTA INNOVA ZENIX HYBRID",
    tahun: "2024",
  },
  {
    id: "mob-4",
    name: "REBORN",
    category: "mobil",
    image: "/images/reborn.png",
    code: "L 000 GJY",
    capacity: "5 Orang",
    status: "dipinjam",
    tipe: "INNOVA REBORN VENTURER",
    tahun: "2024",
    warna: "Silver",
    mesin: "2500 cc",
  },
  {
    id: "mob-5",
    name: "G CLASS",
    category: "mobil",
    image: "/images/gclass.png",
    code: "L 123 YRH",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "MERCEDES-BENZ G CLASS G 63",
    tahun: "2024",
  },
  {
    id: "mob-6",
    name: "AUDI",
    category: "mobil",
    image: "/images/audi.png",
    code: "L 444 RYY",
    capacity: "2 Orang",
    status: "maintenance",
    tipe: "AUDI R8 V10 PERFORMANCE",
    tahun: "2023",
  },
  {
    id: "mob-7",
    name: "DENZA D9",
    category: "mobil",
    image: "/images/denza.png",
    code: "L 188 BUD",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "BYD DENZA D9 EV VIP",
    tahun: "2024",
  },
  {
    id: "mob-8",
    name: "IONIC 5",
    category: "mobil",
    image: "/images/ionic.png",
    code: "L 111 NTH",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "HYUNDAI IONIQ 5 SIGNATURE",
    tahun: "2024",
  },
  {
    id: "mob-9",
    name: "S CLASS",
    category: "mobil",
    image: "/images/sclass.png",
    code: "L 333 KNG",
    capacity: "2 Orang",
    status: "dipinjam",
    tipe: "MERCEDES-BENZ S CLASS S 450",
    tahun: "2023",
  },

  // Data Master: Motor Dinas
  {
    id: "mot-1",
    name: "SUPRA 125",
    category: "motor",
    image: "/images/supra.png",
    code: "L 276 TYN",
    capacity: "2 Orang",
    status: "dipinjam",
    tipe: "HONDA SUPRA X 125 HELM IN",
    tahun: "2021",
  },
  {
    id: "mot-2",
    name: "VARIO 120",
    category: "motor",
    image: "/images/vario.png",
    code: "L 736 NDU",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "HONDA VARIO 125 CBS-ISS",
    tahun: "2023",
  },
  {
    id: "mot-3",
    name: "NMAX",
    category: "motor",
    image: "/images/nmax.png",
    code: "L 5821 BM",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "YAMAHA NMAX 155 CONNECTED",
    tahun: "2023",
  },
  {
    id: "mot-4",
    name: "PCX 160",
    category: "motor",
    image: "/images/pcx.png",
    code: "L 837 NHD",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "HONDA PCX 160 ABS",
    tahun: "2023",
  },
  {
    id: "mot-5",
    name: "BEAT EsP",
    category: "motor",
    image: "/images/beat.png",
    code: "L 837 KSD",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "HONDA BEAT DELUXE ESP",
    tahun: "2023",
  },
  {
    id: "mot-6",
    name: "SCOOPY",
    category: "motor",
    image: "/images/scoopy.png",
    code: "L 326 KSJ",
    capacity: "2 Orang",
    status: "maintenance",
    tipe: "HONDA SCOOPY PRESTIGE",
    tahun: "2022",
  },
  {
    id: "mot-7",
    name: "VERZA",
    category: "motor",
    image: "/images/verza.png",
    code: "L 539 YDB",
    capacity: "2 Orang",
    status: "dipinjam",
    tipe: "HONDA CB150 VERZA",
    tahun: "2022",
  },
  {
    id: "mot-8",
    name: "CB 150 R",
    category: "motor",
    image: "/images/cb150r.png",
    code: "L 736 NXU",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "HONDA CB150R STREETFIRE",
    tahun: "2023",
  },
  {
    id: "mot-9",
    name: "VIXION",
    category: "motor",
    image: "/images/vixion.png",
    code: "L 983 NMJ",
    capacity: "2 Orang",
    status: "tersedia",
    tipe: "YAMAHA ALL NEW VIXION R",
    tahun: "2022",
  },

  // Data Master: Ruangan
  {
    id: "rng-1",
    name: "R. RAPAT B",
    category: "ruang",
    image: "/images/rapatb.png",
    code: "B.2.130.115",
    capacity: "40 Orang",
    status: "tersedia",
    lantai: "Lantai 2",
    fasilitas: "AC, Proyektor, Sound System",
  },
  {
    id: "rng-2",
    name: "R. RAPAT K",
    category: "ruang",
    image: "/images/rapatk.png",
    code: "A.2.350.225",
    capacity: "15 Orang",
    status: "dipinjam",
    lantai: "Lantai 2",
    fasilitas: "Meja Konferensi, TV Display, AC",
  },
  {
    id: "rng-3",
    name: "R. DISKUSI",
    category: "ruang",
    image: "/images/diskusi.png",
    code: "B.3.131.116",
    capacity: "10 Orang",
    status: "dipinjam",
    lantai: "Lantai 3",
    fasilitas: "Smart Board, AC, Kursi Ergonomis",
  },
  {
    id: "rng-4",
    name: "R. AVI",
    category: "ruang",
    image: "/images/avi.png",
    code: "C.1.339.467",
    capacity: "100 Orang",
    status: "tersedia",
    lantai: "Lantai 1",
    fasilitas: "Panggung, Mic Wireless, Proyektor Ganda",
  },
  {
    id: "rng-5",
    name: "R. WEB",
    category: "ruang",
    image: "/images/web.png",
    code: "C.2.755.911",
    capacity: "50 Orang",
    status: "tersedia",
    lantai: "Lantai 2",
    fasilitas: "Koneksi LAN, Meja Komputer, AC",
  },
  {
    id: "rng-6",
    name: "PANDHAWA",
    category: "ruang",
    image: "/images/pandhawa.png",
    code: "A.3.550.458",
    capacity: "350 Orang",
    status: "dipinjam",
    lantai: "Lantai 3",
    fasilitas: "Auditorium Utama, Lighting, Tata Suara Profesional",
  },
  {
    id: "rng-7",
    name: "LAP.TENNIS",
    category: "ruang",
    image: "/images/tennis.png",
    code: "B.1.120.111",
    capacity: "4 Orang",
    status: "dipinjam",
    lantai: "Outdoor Gedung Utama",
    fasilitas: "Net Lapangan, Penerangan Malam",
  },
  {
    id: "rng-8",
    name: "LAB",
    category: "ruang",
    image: "/images/lab.png",
    code: "A.1.250.222",
    capacity: "10 Orang",
    status: "tersedia",
    lantai: "Lantai 1",
    fasilitas: "Komputer Desain, Server Lokal, AC",
  },
  {
    id: "rng-9",
    name: "AULA",
    category: "ruang",
    image: "/images/aula.png",
    code: "C.3.321.756",
    capacity: "300 Orang",
    status: "maintenance",
    lantai: "Lantai 3",
    fasilitas: "Aula Serbaguna, Proyektor, Panggung Utama",
  },
];
