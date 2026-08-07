# Rekah Build 4/4 — Laporan Selesai

**Tanggal:** 2026-07-17  
**Branch:** feat/rekah-refleksi-jejak-musim  
**Status:** ✅ Typecheck clean · 11/11 vitest pass · 0 kata terlarang

---

## Ringkasan Build 4

Build ini menyelesaikan fitur inti Rekah Digital MVP:
- **Cerita Hari Ini** — bottom-sheet refleksi setelah "Merekah!" di LangkahKecilCard
- **Jejak Mekar** — dashboard sinyal tumbuh kembang + sinyal caregiver lelah + BungaMusim SVG
- **Penutup Musim** — ritual 4 layar saat hariMusim ≥ 28 (atau `?dev=penutup-musim`)
- **Jurnal** — list + tulis entri (simplified, 3D mechanic TODO)
- **Navigasi final** — Beranda · Rencana Pekan Ini · Jejak Mekar · Jurnal + Pengaturan di dropdown
- **PengaturanPage** — edit nama anak/caregiver + ganti nilai fokus dengan konfirmasi

---

## File Baru (Build 4)

### packages/shared
| File | Keterangan |
|------|-----------|
| `src/rekah/reflections.ts` | `RefleksiEntry`, `RefleksiMusim` types |

### apps/digital — Context
| File | Keterangan |
|------|-----------|
| `src/context/RekahRefleksiContext.tsx` | State refleksi + refleksi musim |
| `src/context/JurnalRekahContext.tsx` | State entri jurnal rekah |

### apps/digital — Features
| File | Keterangan |
|------|-----------|
| `src/features/rekah-plan/CeritaHariIni.tsx` | Bottom-sheet refleksi post-Merekah! |
| `src/features/rekah-plan/rekahRefleksiCopy.ts` | Copy refleksi (review Psikolog Fitri) |
| `src/features/rekah-jejak/rekahJejakCopy.ts` | Copy Jejak Mekar (review Psikolog Fitri) |
| `src/features/rekah-musim/PenutupMusimFlow.tsx` | 4-layar ritual penutup musim |
| `src/features/rekah-musim/rekahMusimCopy.ts` | Copy musim (review Psikolog Fitri) |

### apps/digital — Pages
| File | Keterangan |
|------|-----------|
| `src/pages/DashboardPages/Tier2/JejakMekarPage.tsx` | Dashboard sinyal tumbuh kembang |
| `src/pages/DashboardPages/Tier2/JurnalPage.tsx` | Jurnal list + tulis (simplified MVP) |
| `src/pages/DashboardPages/Tier2/PengaturanPage.tsx` | Edit profil + ganti nilai fokus |

### apps/digital — File Dimodifikasi
| File | Perubahan |
|------|-----------|
| `src/features/rekah-plan/LangkahKecilCard.tsx` | Tambah CeritaHariIni trigger post-Merekah! |
| `src/pages/DashboardPages/Tier2/BerandaRekah.tsx` | Tambah Penutup Musim trigger + Jejak Mekar card aktif |
| `src/pages/DashboardPages/Tier2/SidebarTier2.tsx` | Nav: Jejak Mekar, Jurnal + Pengaturan di dropdown |
| `src/pages/DashboardPages/Tier2/DashboardShellTier2.tsx` | PAGE_TITLES untuk halaman baru |
| `src/App.tsx` | Provider: RekahRefleksiProvider, JurnalRekahProvider · Routes baru |

---

## TODO Backend — Consolidated API List

Semua integrasi backend ditandai `// TODO:` di kode. Tidak ada localStorage.

### RekahProfile
```
GET  /api/me/rekah-profile                    → load profil saat mount BerandaRekah
POST /api/me/rekah-profile                    → simpan profil baru dari OnboardingFlow
PATCH /api/me/rekah-profile                   → update dari PengaturanPage / PenutupMusimFlow / sinyal lelah
```

### Completions (Langkah Kecil)
```
POST  /api/me/rekah-completions               → tandai selesai (RekahPlanContext.markComplete)
GET   /api/me/rekah-completions?week={n}      → load completions per pekan
```

### Refleksi
```
POST /api/me/rekah-refleksi                   → simpan RefleksiEntry (CeritaHariIni.tsx)
GET  /api/me/rekah-refleksi?musim={id}        → load entries untuk JejakMekarPage
POST /api/me/rekah-refleksi-musim             → simpan RefleksiMusim (PenutupMusimFlow)
```

### Jurnal
```
POST /api/me/jurnal-rekah/entri               → simpan EntriJurnalRekah
GET  /api/me/jurnal-rekah/entri               → load semua entri (JurnalPage)
     (scoping per anak di backend — lihat komentar di JurnalRekahContext.tsx)
```

---

## File Awaiting Psikolog Fitri Review

Semua ditandai `// KONTEN: wajib review Psikolog Fitri sebelum rilis`

- `packages/shared/src/rekah/activityModules.ts` — 31 modul aktivitas, script, kenapaIni, amati
- `packages/shared/src/rekah/weeklyPlanTemplates.ts` — 8 template rencana pekan
- `apps/digital/src/features/rekah-plan/rekahPlanCopy.ts`
- `apps/digital/src/features/rekah-plan/rekahRefleksiCopy.ts`
- `apps/digital/src/features/rekah-jejak/rekahJejakCopy.ts` ← **PRIORITAS TERTINGGI: kartu sinyal caregiver lelah**
- `apps/digital/src/features/rekah-musim/rekahMusimCopy.ts`
- `apps/digital/src/features/rekah-plan/CeritaHariIni.tsx` — note untuk 'belum-tertarik'
- `apps/digital/src/features/rekah-musim/PenutupMusimFlow.tsx`

---

## Checklist Rilis

### Sebelum Rilis Publik
- [ ] `SHOW_DRAFT_CONTENT = false` di `packages/shared/src/rekah/planComposer.ts`
- [ ] Hapus `?dev=penutup-musim` trigger di `BerandaRekah.tsx` (tandai `// DEV ONLY: hapus sebelum rilis`)
- [ ] Backend terpasang + semua TODO API terhubung
- [ ] Review Psikolog Fitri selesai untuk semua file copy

### TODO Fitur (Post-MVP)
- [ ] Pulihkan mekanik buku 3D dari `apps/digital/src/_parked/jurnal/` (lihat `JurnalPage.tsx` baris 2)
- [ ] Layar "Tanam nilai baru" di PenutupMusimFlow harus buka kembali step Akar Keluarga onboarding (saat ini fallback ke nilai sama)
- [ ] Paywall Rekah — titik natural di PenutupMusimFlow layar pilihan (ada TODO di sana)
- [ ] Arsip musim sebelumnya di JejakMekarPage (komponen sudah ada, data dari backend)

---

## Rekah Build Series — Semua Build Selesai

| Build | Fitur | Status |
|-------|-------|--------|
| Build 1 | Onboarding + Beranda Musim | ✅ |
| Build 2 | LangkahKecilCard + KelopakProgress + aktivitas | ✅ |
| Build 3 | Rencana Pekan Ini + planComposer + 8 template | ✅ |
| Build 4 | Refleksi + Jejak Mekar + Penutup Musim + Jurnal + Nav | ✅ |
