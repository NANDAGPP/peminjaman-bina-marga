import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeAssetImage,
  getStoredAssets,
  addStoredAsset,
  updateStoredAsset,
  deleteStoredAsset,
  Asset,
} from "../components/Peminjaman/assetData";

describe("assetData - sanitizeAssetImage", () => {
  it("harus mengembalikan fallback mobil jika image kosong/undefined", () => {
    expect(sanitizeAssetImage(undefined, "mobil")).toBe("/images/porsche.png");
    expect(sanitizeAssetImage("", "mobil")).toBe("/images/porsche.png");
    expect(sanitizeAssetImage("   ", "mobil")).toBe("/images/porsche.png");
  });

  it("harus mengembalikan fallback motor dan ruang jika image kosong", () => {
    expect(sanitizeAssetImage("", "motor")).toBe("/images/nmax.png");
    expect(sanitizeAssetImage("", "ruang")).toBe("/images/aula.png");
  });

  it("harus mempertahankan URL absolut http, https, dan data base64", () => {
    expect(sanitizeAssetImage("https://example.com/mobil.png", "mobil")).toBe(
      "https://example.com/mobil.png"
    );
    expect(sanitizeAssetImage("http://localhost/img.png", "motor")).toBe(
      "http://localhost/img.png"
    );
    expect(
      sanitizeAssetImage("data:image/png;base64,iVBORw0KGgo...", "ruang")
    ).toBe("data:image/png;base64,iVBORw0KGgo...");
  });

  it("harus menambahkan leading slash dan membersihkan double slash", () => {
    expect(sanitizeAssetImage("uploads/123_test.png", "mobil")).toBe(
      "/uploads/123_test.png"
    );
    expect(sanitizeAssetImage("images/camry.png", "mobil")).toBe(
      "/images/camry.png"
    );
    expect(sanitizeAssetImage("///uploads/123_test.png", "mobil")).toBe(
      "/uploads/123_test.png"
    );
  });
});

describe("assetData - Local Storage CRUD Operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("harus mengembalikan ASSETS_DATA tersanitasi saat storage kosong", () => {
    const assets = getStoredAssets();
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0].image.startsWith("/")).toBe(true);
  });

  it("harus bisa menambah aset baru ke storage dan berada di urutan pertama", () => {
    const newAsset: Asset = {
      id: "test-mob-1",
      name: "TEST MOBIL",
      category: "mobil",
      image: "uploads/test.png",
      code: "L 9999 ZZ",
      capacity: "4 Orang",
      status: "tersedia",
    };

    const updated = addStoredAsset(newAsset);
    expect(updated[0].id).toBe("test-mob-1");
    expect(updated[0].image).toBe("/uploads/test.png");

    const reloaded = getStoredAssets();
    expect(reloaded[0].id).toBe("test-mob-1");
  });

  it("harus bisa memperbarui aset yang ada", () => {
    const sample = getStoredAssets()[0];
    const updated = updateStoredAsset({
      ...sample,
      name: "MOBIL TERUPDATE",
      status: "dipinjam",
    });

    const found = updated.find((a) => a.id === sample.id);
    expect(found?.name).toBe("MOBIL TERUPDATE");
    expect(found?.status).toBe("dipinjam");
  });

  it("harus bisa menghapus aset dari storage", () => {
    const initial = getStoredAssets();
    const targetId = initial[0].id;
    const updated = deleteStoredAsset(targetId);

    expect(updated.find((a) => a.id === targetId)).toBeUndefined();
    expect(getStoredAssets().find((a) => a.id === targetId)).toBeUndefined();
  });
});
