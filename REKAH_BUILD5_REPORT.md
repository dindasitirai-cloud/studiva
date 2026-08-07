# Rekah Build 5 — Laporan Selesai

**Tanggal:** 2026-07-18  
**Status:** ✅ Backend typecheck clean · Frontend typecheck clean · 11/11 vitest pass

---

## Jalur Terpilih: JALUR A — Database Sudah Ada

**Alasan:** Monorepo sudah punya Express + SQLite + JWT custom auth yang berjalan di Railway.
Tidak ada alasan untuk menambah layanan baru (Supabase, Neon, Vercel Postgres).
Tinggal memperluas skema dan menambah route baru.

---

## Skema Final (5 tabel baru di `database/schema.sql`)

| Tabel | Isi | Kunci unik |
|-------|-----|-----------|
| `rekah_profiles` | Profil Rekah per user (JSON), `current_week`, `musim_ke` | `user_id` UNIQUE |
| `rekah_completions` | Langkah selesai per pekan | `(user_id, module_id, minggu_ke, musim_ke)` |
| `rekah_reflections` | CeritaHariIni per langkah | `id` (client-generated) |
| `rekah_seasons` | Arsip musim selesai | autoincrement |
| `rekah_journal_entries` | Jurnal privat | `id` (client-generated) |

Semua tabel: `WHERE user_id = ?` dari `req.user!.id` (JWT). Tidak ada kolom skor/analitik isi.

---

## Endpoint Backend (`backend/src/routes/rekah.ts`)

Semua endpoint di bawah `router.use(authenticate)` — 401 jika tidak ada token.

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/rekah/profile` | Ambil profil + currentWeek + musimKe |
| PUT | `/api/rekah/profile` | Upsert profil (jika nilaiFokus berubah: arsipkan musim lama otomatis) |
| PATCH | `/api/rekah/profile/state` | Update hanya currentWeek / musimKe |
| POST | `/api/rekah/completions` | Tandai langkah selesai (UNIQUE constraint → idempoten) |
| GET | `/api/rekah/completions` | Ambil completions (filter: mingguKe, musimKe) |
| POST | `/api/rekah/reflections` | Simpan RefleksiEntry (INSERT OR IGNORE → idempoten) |
| GET | `/api/rekah/reflections` | Ambil refleksi (filter: musimKe) |
| POST | `/api/rekah/seasons/close` | Arsipkan musim + increment musimKe di profil |
| GET | `/api/rekah/journal` | Ambil semua entri jurnal user |
| POST | `/api/rekah/journal` | Simpan entri jurnal (INSERT OR IGNORE → idempoten) |
| DELETE | `/api/rekah/journal/:id` | Hapus entri (hanya milik user ini) |
| DELETE | `/api/rekah/account-data` | Hapus SEMUA data Rekah user (5 tabel, loop delete) |

---

## Marker TODO yang Digantikan (dari REKAH_BUILD4_REPORT.md)

| Marker lama | File | Status |
|-------------|------|--------|
| `// TODO: muat profil dari backend (GET /api/me/rekah-profile)` | RekahProfileContext | ✅ diganti |
| `// TODO: PATCH /api/me/rekah-profile` | RekahProfileContext, PenutupMusimFlow, PengaturanPage | ✅ diganti |
| `// TODO: POST /api/me/rekah-completions` | RekahPlanContext | ✅ diganti |
| `// TODO: POST /api/me/rekah-refleksi` | RekahRefleksiContext | ✅ diganti |
| `// TODO: POST /api/me/rekah-refleksi-musim` | RekahRefleksiContext | ✅ diganti (via seasons/close) |
| `// TODO: POST /api/me/jurnal-rekah/entri` | JurnalRekahContext | ✅ diganti |
| `// TODO: hilang setelah profil dimuat dari backend` | BerandaRekah | ✅ diganti (skeleton loading) |

### Marker yang TETAP ADA (by design):
- `// TODO: multi-anak pasca-MVP` — arsitektur belum diputuskan
- `// TODO: set SHOW_DRAFT_CONTENT = false sebelum rilis` — flag konten
- `// DEV ONLY: hapus sebelum rilis` — dev trigger penutup musim
- `// TODO: pulihkan mekanik buku 3D` — fitur JurnalPage parked
- `// TODO: dokumen kebijakan privasi lengkap` — konten dari Raisha

---

## File Baru (Build 5)

### Backend
- `backend/src/routes/rekah.ts` — semua endpoint Rekah

### Frontend (apps/digital)
- `src/utils/rekahApiError.ts` — `dispatchRekahError()` (CustomEvent)
- `src/components/RekahErrorBanner.tsx` — banner error bergaya Rekah (bottom fixed)
- `src/components/RekahLoadingSkeleton.tsx` — skeleton kelopak saat profil loading
- `src/features/rekah-privacy/rekahPrivacyCopy.ts` — copy seksi Data & Privasi *(review Psikolog Fitri)*

### Database
- `database/schema.sql` — 5 tabel baru ditambahkan di akhir

## File Dimodifikasi (Build 5)

| File | Perubahan |
|------|-----------|
| `backend/src/server.ts` | Register `/api/rekah` router |
| `context/RekahProfileContext.tsx` | Load dari backend + optimistic setProfile + profileLoading |
| `context/RekahPlanContext.tsx` | Sync currentWeek dari server; markComplete → POST; load completions |
| `context/RekahRefleksiContext.tsx` | Load entries; addEntry → POST optimistic |
| `context/JurnalRekahContext.tsx` | Load journal; addEntri → POST optimistic |
| `features/rekah-musim/PenutupMusimFlow.tsx` | mulaiMusimBaru → POST seasons/close + await setProfile |
| `pages/.../BerandaRekah.tsx` | Skeleton saat profileLoading; onboarding hanya jika !profile |
| `pages/.../PengaturanPage.tsx` | simpanProfil async; tambah seksi Data & Privasi + modal hapus data |
| `pages/.../DashboardShellTier2.tsx` | Tambah `<RekahErrorBanner />` |

---

## Pola Persistensi (Ringkasan)

- **Profil**: optimistic update + rollback ke state sebelumnya jika API gagal
- **Completions**: fire-and-forget optimistic (tidak rollback UI — pengalaman tetap lancar)
- **Refleksi**: optimistic + pesan error via RekahErrorBanner
- **Jurnal**: optimistic + pesan error via RekahErrorBanner
- **Error message**: "Koneksi terputus — [konteks]. Coba lagi ya." — tanpa nada menyalahkan

---

## Langkah Manual Raisha (Deploy)

### 1. Migrasi Database (Railway)
Schema baru sudah ditambahkan ke `database/schema.sql` dengan `CREATE TABLE IF NOT EXISTS`.
SQLite membaca seluruh schema saat `initDatabase()` dipanggil di startup backend.
**Tidak perlu menjalankan perintah migrasi tambahan** — deploy ulang backend sudah cukup.

### 2. Verifikasi Railway Deploy
Setelah push ke branch production:
```
railway logs | grep "rekah_profiles"
```
Jika tidak ada error → schema berhasil dibuat.

### 3. Environment Variables
Tidak ada env var baru yang diperlukan — semua Rekah routes menggunakan `JWT_SECRET` dan `DATABASE_URL` yang sudah ada.

### 4. Checklist Go-Live (menambah dari Build 4)
- [ ] `SHOW_DRAFT_CONTENT = false` di planComposer.ts
- [ ] Hapus `?dev=penutup-musim` trigger di BerandaRekah.tsx
- [ ] Review Psikolog Fitri: rekahPrivacyCopy.ts (baru), + semua copy files dari Build 4
- [ ] Dokumen kebijakan privasi lengkap (konten dari Raisha — item 6.2)
- [ ] Test akun scoping: 2 akun berbeda tidak bisa saling melihat data (filter `user_id` di semua endpoint)
- [ ] Test hapus akun end-to-end: data bersih + redirect ke onboarding

---

## Catatan Arsitektur

- **SQLite di Railway**: cocok untuk MVP. Jika traffic tumbuh → migrate ke Postgres (Neon/Railway Postgres) dengan query yang sama karena tidak ada ORM-specific syntax.
- **Multi-anak pasca-MVP**: tambah kolom `child_id FK → children(id)` ke 5 tabel + scoping di endpoint. Tidak ada perubahan frontend yang breaking.
- **Data anak**: tidak pernah dikirim ke layanan pihak ketiga. Catatan dan jurnal disimpan verbatim tanpa analisis/indexing.
