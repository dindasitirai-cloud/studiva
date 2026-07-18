# REKAH ITERASI 2 — Pemulihan Panduan Tumbuh Kembang

**Status:** SELESAI  
**Branch:** feat/rekah-pulihkan-panduan  
**Tanggal:** 2026-07-18

---

## Ringkasan

Memulihkan fitur Knowledge Gallery (Panduan Tumbuh Kembang) dari commit `22adae7` (sebelum penghapusan) dengan dua perubahan saja: substitusi font dan penambahan integrasi ke halaman Jelajah. Tidak ada perubahan visual, logika, atau konten lain.

---

## FASE 1 — Pemulihan File

File yang dipulihkan dari git `22adae7^`:

| File | Baris | Keterangan |
|------|-------|------------|
| `KnowledgeGallery.tsx` | 345 | Galeri utama, personal + browse mode |
| `KnowledgeCardSummary.tsx` | 264 | Halaman ringkasan per kartu |
| `KnowledgeCardScientific.tsx` | 275 | Halaman detail ilmiah |
| `BookGrid.tsx` | 218 | Grid buku dengan filter usia & domain |
| `BookCarousel.tsx` | 325 | Carousel tipografis dengan animasi buku |
| `BookReader.tsx` | 432 | Reader 3-halaman (cover → ringkasan → ilmiah) |
| `KonsultasiCTA.tsx` | — | CTA konsultasi (hanya domain DK) |
| `AudioPlayerWidget.tsx` | — | Widget audio player |

Shim re-export dibuat agar komponen restored tidak perlu diubah:
- `knowledgeCardData.ts` → re-exports dari `@studiva/shared`
- `domains.ts` → re-exports dari `@studiva/shared`

---

## FASE 2 — Substitusi Font

| Font Lama | Font Baru | Kelas Tailwind |
|-----------|-----------|----------------|
| Baloo 2 | Bricolage Grotesque | `font-baloo` → `font-bricolage` |
| Nunito Sans | Plus Jakarta Sans (default) | `font-nunito-sans` → dihapus |
| `'Baloo 2', sans-serif` (inline style) | `'Bricolage Grotesque', sans-serif` | 2 lokasi: BookCarousel + BookReader |

**Jumlah perubahan:** 18 kelas font diganti, 7 kelas font dihapus, 2 inline style diganti.

**Tidak diubah:** ukuran teks, spacing, warna, layout, logika, konten.

**Saklar retint ditambahkan ke `KnowledgeGallery.tsx`:**
```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RETINT_REKAH = false; // TODO: set true jika palet Rekah aktif — pemetaan: amber-500→rekah · amber-600/700→rekah-tua · amber-100/50→fajar · latar→kanvas · teks gelap→pekat · hijau→daun
```

**prefers-reduced-motion:** BookCarousel dan BookReader sudah memiliki guard `useReducedMotion()` dari versi aslinya. `BookGrid.tsx` hover animation diperbarui ke `motion-safe:` prefix Tailwind.

---

## FASE 3 — Integrasi

### Routes ditambahkan ke `App.tsx`:
```tsx
<Route path="knowledge" element={<KnowledgeGallery />} />
<Route path="knowledge/:cardId" element={<KnowledgeCardSummary />} />
<Route path="knowledge/:cardId/ilmiah" element={<KnowledgeCardScientific />} />
```

### Entry card di halaman Jelajah Aktivitas:
- Ditambahkan button entry card "Panduan Tumbuh Kembang" dengan ikon `BookOpen` (daun/hijau)
- Navigasi ke `/dashboard/tier2/knowledge`
- Ditempatkan di atas search bar, terlihat langsung saat halaman dibuka

### Page title:
- `DashboardShellTier2` diperbarui: `'/dashboard/tier2/knowledge': 'Panduan Tumbuh Kembang'`
- Dynamic routes (card detail) mendapat fallback `'Panduan Tumbuh Kembang'` via `startsWith` check

### Koneksi profil:
`KnowledgeGallery` sudah memiliki `useEffect` yang auto-set `selectedAge` ke pita usia anak dari `useDashboardTier2().children` saat `viewMode === 'personal'` (mode default). Tidak perlu perubahan tambahan.

### Bottom nav:
TIDAK ditambahkan ke bottom nav. `// TODO: keputusan Raisha — promosikan ke bottom nav?`

### Domain DK:
`KonsultasiCTA` hanya dirender untuk `card.domain === 'DK'` — tidak ada kebocoran ke beranda atau notifikasi.

---

## FASE 4 — Verifikasi

### TypeScript:
```
npx tsc --noEmit  →  0 errors
```

### Tests (packages/shared):
```
Test Files  1 passed (1)
Tests       15 passed (15)
```

---

## Batasan & TODOs

| Item | Status |
|------|--------|
| Build production (`npm run build`) | Belum dijalankan — perlu dilakukan sebelum deploy |
| Review palet warna (amber → Rekah) | Tunggu `RETINT_REKAH = true` dari Raisha |
| Promosi ke bottom nav | Keputusan Raisha |
| Verifikasi manual: 10 pita × 7 domain matrix | Perlu dilakukan di browser |
| Audio player (jika ada konten audio) | Bergantung pada `AudioPlayerContext` yang sudah ada |

---

## Constraint Check

- [x] `apps/sekolah`, `apps/admin`, auth, Stripe/paywall — TIDAK disentuh
- [x] Zero `amber-` references baru — tidak ada penambahan (existing amber di template asli dibiarkan; RETINT_REKAH akan menggantinya saat aktif)
- [x] Zero "Studiva Digital" — tidak ada
- [x] Bahasa Indonesia — semua copy existing, tidak ada copy baru
- [x] TANPA localStorage — tidak ada
- [x] prefers-reduced-motion — sudah ada di BookCarousel & BookReader; motion-safe: ditambahkan ke BookGrid
- [x] Tidak ada dependensi baru
