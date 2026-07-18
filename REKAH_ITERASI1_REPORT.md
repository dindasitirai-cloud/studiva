# Rekah Iterasi 1 — Laporan Build

Tanggal: 2026-07-18  
Status: ✅ Semua fase selesai — build, typecheck, dan test hijau

---

## Ringkasan Perubahan

| Fase | Deskripsi | Status |
|------|-----------|--------|
| 1 | AlatEdukasi + 15 modul baru | ✅ |
| 2 | Halaman Jelajah Aktivitas | ✅ |
| 3 | Rencana Fleksibel (Ganti, Tambah, BelumPas) | ✅ |
| 4 | Verifikasi build, typecheck, test, grep | ✅ |

---

## FASE 1: AlatEdukasi & Modul Baru

### Interface Baru
```ts
export interface AlatEdukasi {
  nama: string;
  caraPakai?: string;
  alternatifRumah?: string; // wajib diisi bila alat perlu dibeli
}
// Ditambahkan ke ActivityModule:
alatEdukasi?: AlatEdukasi[];
```

### 15 Modul Baru (semua status: 'draft')

| ID | Judul | Nilai Utama | Age Bands | Durasi | Alat |
|----|-------|-------------|-----------|--------|------|
| am-kartu-kontras | Dunia Hitam-Putih Bayi | percaya-diri | 0-6 | 5 menit | Ya (alternatif: HVS) |
| am-lagu-ritmis | Menyanyi Bersama | empatik | 0-6 | 10 menit | Tidak |
| am-ciluk-ba | Ciluk Ba! | sosial | 0-6, 7-12 | 5 menit | Tidak |
| am-meraih-mainan | Raih yang Ada di Sana | percaya-diri | 0-6, 7-12 | 10 menit | Ya (alternatif: tali+kursi) |
| am-cermin-bayi | Hai, Siapa di Cermin? | percaya-diri | 0-6, 7-12 | 10 menit | Ya (alternatif: foil) |
| am-eksplorasi-tekstur | Rasa yang Berbeda di Jari Kecil | mandiri | 0-6, 7-12 | 10 menit | Tidak (kain rumahan) |
| am-sebab-akibat | Masuk... Jatuh! | mandiri | 7-12 | 10 menit | Tidak |
| am-musik-marakas | Kocok Bersama! | sosial | 7-12, 13-18 | 10 menit | Ya (alternatif: botol beras) |
| am-berdiri-merambat | Berdiri! Satu Langkah Kecil | mandiri | 7-12, 13-18 | 15 menit | Tidak |
| am-lukis-jari | Jejak Jari di Atas Kertas | percaya-diri | 7-12, 13-18 | 15 menit | Ya (alternatif: tepung+pewarna) |
| am-menara-balok | Susun dan Jatuhkan | percaya-diri | 13-18, 19-24 | 15 menit | Ya (alternatif: kotak susu) |
| am-coret-bebas | Coret Sesukamu | percaya-diri | 19-24, 25-36 | 15 menit | Ya (alternatif: pensil warna biasa) |
| am-puzzle-sederhana | Cocokkan dan Masukkan | mandiri | 19-24, 25-36 | 15 menit | Ya (alternatif: majalah dipotong) |
| am-messy-play | Bermain Tepung Bersama | regulasi-emosi | 19-24, 25-36 | 20 menit | Ya (alternatif: tepung terigu) |
| am-tendang-bola | Tendang ke Sana! | percaya-diri | 25-36 | 20 menit | Ya (alternatif: kaos kaki digulung) |

### Coverage Audit (nilai × pita usia)

Semua 30 kombinasi (6 nilai × 5 pita) punya ≥2 modul. Zero gaps.

| Nilai | 0-6 | 7-12 | 13-18 | 19-24 | 25-36 |
|-------|-----|------|-------|-------|-------|
| mandiri | 6 | 11 | 11 | 11 | 10 |
| empatik | 9 | 9 | 7 | 7 | 5 |
| percaya-diri | 7 | 10 | 8 | 6 | 6 |
| regulasi-emosi | 6 | 5 | 8 | 9 | 6 |
| komunikatif | 5 | 8 | 8 | 6 | 3 |
| sosial | 4 | 4 | 3 | 4 | 4 |

**Total modul: 51** (36 sebelumnya + 15 baru)  
**Dengan alatEdukasi: 12 modul**  
**Status draft: 47 — wajib review Psikolog Fitri sebelum rilis**

### Test Coverage
- Test baru: validasi `alternatifRumah` untuk semua alat yang mengindikasikan pembelian
- Total tests: **15 passed** (naik dari 8)

---

## FASE 2: Halaman Jelajah Aktivitas

### File Baru
- `apps/digital/src/features/rekah-plan/rekahJelajahCopy.ts` — semua copy halaman Jelajah
- `apps/digital/src/pages/DashboardPages/Tier2/JelajahAktivitasPage.tsx` — halaman utama

### Fitur Diimplementasikan
- Filter nilai: chips multiselect (default 2 nilaiFokus dari profil)
- Filter pita usia: dropdown (default pita anak)
- Filter durasi: ≤5 / ≤10 / ≤15 / Semua
- Toggle alat: 🧸 Pakai alat / 🙌 Tanpa alat / Semua
- Pencarian teks client-side pada judul
- Grid card kompak (judul, nilai chip, durasi, ikon alat 🔧)
- Tap card → detail via LangkahKecilCard (mode='jelajah', TIDAK duplikasi)
- Aksi: "Jadikan langkah hari ini" + "Tambahkan ke pekan ini"
- Empty state: "Belum ada aktivitas untuk kombinasi ini — coba longgarkan filternya 🌱"
- Tidak ada infinite scroll, badge populer/terbanyak, atau social sorting

### Perubahan ke File yang Ada
- `LangkahKecilCard.tsx`: tambah props `mode`, `onJadikanHariIni`, `onTambahkanKePekan` + section AlatEdukasi di expanded view
- `SidebarTier2.tsx`: tambah Jelajah (Compass icon) antara Rencana dan Jejak Mekar
- `DashboardShellTier2.tsx`: tambah Jelajah ke PAGE_TITLES
- `App.tsx`: tambah route `/dashboard/tier2/jelajah`

### Route
`/dashboard/tier2/jelajah` → JelajahAktivitasPage

---

## FASE 3: Rencana Fleksibel

### RekahPlanContext — API Baru
```ts
swapStep(oldId: ActivityModuleId, newId: ActivityModuleId): void
addStep(moduleId: ActivityModuleId): 'ok' | 'penuh' | 'duplikat'
```

### RencanaPage — Fitur Baru
- **Ganti langkah**: tombol "Ganti" di atas setiap card → bottom-sheet dengan pool alternatif (filter usia+nilai, tidak dalam pekan, belum selesai)
- **Belum pas hari ini** (upgrade): sekarang membuka bottom-sheet dengan 3 langkah tercepat dari pekan ini + link "Jelajahi yang lain →"; tidak lagi blind rotation
- **Tambah langkah +**: tombol di bawah daftar (tampil jika <7 langkah) → arahkan ke /jelajah
- Pesan "penuh mekar" jika sudah 7 langkah

### rekahPlanCopy.ts — Copy Baru
- gantiLabel, gantiJudul, gantiSub, gantiTidakAda, gantiPilihAria, gantiTutupLabel
- tambahLangkahCTA, tambahLangkahAria, tambahLangkahPenuh
- belumPasJudul, belumPasSub, belumPasCobaLangkahIni, belumPasJelajahLink, belumPasTutupLabel

### Backend
- `database/schema.sql`: tambah tabel `rekah_week_plans` (id, user_id, musim_ke, minggu_ke, module_ids JSON, created_at, updated_at; UNIQUE per user+musim+minggu)
- `backend/src/routes/rekah.ts`: tambah `GET /api/rekah/week-plan` dan `PUT /api/rekah/week-plan`

### Unit Tests Baru (planComposer.test.ts)
- Simulasi swapStep: langkah lain tidak terpengaruh
- Completions terlindungi: langkah selesai tidak muncul di visibleSteps
- Batas 7 langkah: addStep tidak melebihi 7

---

## Status Backend & TODO

- Backend `/api/rekah/week-plan` sudah tersedia
- Frontend **belum** memanggil endpoint ini — semua perubahan plan masih di memori saja
- Setiap titik integrasi ditandai `// TODO: persist week plan to backend — PUT /api/rekah/week-plan`
- TANPA localStorage sesuai constraint

---

## Grep Forbidden Words

```
normal, seharusnya, tertinggal, terlambat, rata-rata, streak, skor, peringkat, populer, terbanyak
```
→ **0 hits** di semua file baru dan yang dimodifikasi

Zero `amber-` references. Zero "Studiva Digital".

---

## Modul Draft untuk Review Psikolog Fitri

Semua 15 modul baru perlu review sebelum `status: 'published'`. Prioritas review:

1. **am-lagu-ritmis** — klaim tentang ritme musik dan ritme bahasa (riset neurosains)
2. **am-messy-play** — klaim tentang regulasi emosi via input sensorik
3. **am-ciluk-ba** — klaim tentang permanence objek dan rasa aman
4. **am-sebab-akibat** — framing "bayi yang menjatuhkan benda bukan nakal"
5. **am-berdiri-merambat** — batasan milestone motorik (7-12 bulan)

---

## Build Status Final

| Check | Status |
|-------|--------|
| `@studiva/shared build` | ✅ Bersih |
| `@studiva/shared test` (15 tests) | ✅ Semua lulus |
| `digital typecheck` | ✅ Bersih |
| `digital build` | ✅ Compiled successfully |
| `backend tsc --noEmit` | ✅ Bersih |
| Grep forbidden words | ✅ 0 hits |
