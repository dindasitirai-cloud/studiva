export interface BandResult {
  band: number;
  diLuarRentang: boolean;
}

// usia bulan → band index (0–9)
// 0–2   → 0   (0–3 bl)
// 3–5   → 1   (3–6 bl)
// 6–8   → 2   (6–9 bl)
// 9–11  → 3   (9–12 bl)
// 12–17 → 4   (12–18 bl)
// 18–23 → 5   (18–24 bl)
// 24–35 → 6   (2–3 th)
// 36–47 → 7   (3–4 th)
// 48–59 → 8   (4–5 th)
// 60–72 → 9   (5–6 th)
// >72   → 9 + diLuarRentang
export function hitungBand(tanggalLahir: Date, sekarang: Date = new Date()): BandResult {
  const bulan =
    (sekarang.getFullYear() - tanggalLahir.getFullYear()) * 12 +
    (sekarang.getMonth() - tanggalLahir.getMonth());

  const usiaBulan = Math.max(0, bulan);

  if (usiaBulan > 72) return { band: 9, diLuarRentang: true };
  if (usiaBulan >= 60) return { band: 9, diLuarRentang: false };
  if (usiaBulan >= 48) return { band: 8, diLuarRentang: false };
  if (usiaBulan >= 36) return { band: 7, diLuarRentang: false };
  if (usiaBulan >= 24) return { band: 6, diLuarRentang: false };
  if (usiaBulan >= 18) return { band: 5, diLuarRentang: false };
  if (usiaBulan >= 12) return { band: 4, diLuarRentang: false };
  if (usiaBulan >= 9)  return { band: 3, diLuarRentang: false };
  if (usiaBulan >= 6)  return { band: 2, diLuarRentang: false };
  if (usiaBulan >= 3)  return { band: 1, diLuarRentang: false };
  return { band: 0, diLuarRentang: false };
}
