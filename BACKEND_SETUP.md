# Panduan Setup Backend Rekah + Supabase

## Langkah 1 — Buat proyek Supabase

1. Masuk ke [dashboard.supabase.com](https://supabase.com/dashboard) dan klik **New project**.
2. Pilih region terdekat (Singapore sudah cukup untuk Indonesia).
3. Catat **Project URL**, **anon key**, **JWT secret**, dan **service_role key** dari menu **Settings → API**.

## Langkah 2 — Jalankan migrasi database

Di folder `supabase/migrations/`, ada file SQL yang harus dijalankan berurutan melalui **SQL Editor** di Supabase dashboard (atau via Supabase CLI):

```
001_rekah_schema.sql   — 8 tabel utama
002_rls_policies.sql   — RLS di semua tabel
003_admin_helpers.sql  — Fungsi admin SECURITY DEFINER
004_langganan.sql      — Tabel langganan + RLS + has_langganan_aktif()
006_konten_pipeline.sql — Pipeline tinjauan: konten_draf, riwayat_tinjauan, sikap + RLS
```

Urutan penting: `001` → `002` → `003` → `004` → `006`.

### Menyiapkan akun staf Rekah

Staf Rekah (admin konten, peninjau klinis) login lewat Supabase Auth dengan `app_metadata.role` khusus.
Set via Supabase Dashboard → Authentication → Users → pilih user → Edit:

```json
{ "app_metadata": { "role": "admin" } }
```

atau untuk Fitri:

```json
{ "app_metadata": { "role": "peninjau_klinis" } }
```

Setelah login, staf diarahkan otomatis ke `/rekah-admin`.
`admin` + `peninjau_klinis` bypass `SubscriptionGuard` (tidak perlu langganan).

### Migration 005 — Paywall RLS (jalankan setelah Stripe live)

```
005_rls_paywall.sql   — Penegakan sisi server: hanya pengguna berlangganan aktif
                        yang bisa baca pilihan_harian, nilai_ditanam, kebun_riwayat, jejak
```

⚠️ **Jangan jalankan 005 sebelum** Stripe webhook aktif dan ada data langganan di tabel `langganan`.  
Bila dijalankan sebelum ada baris `status='aktif'`, seluruh data dashboard akan mengembalikan 0 baris.

### Memasukkan langganan tes secara manual

Untuk testing sebelum Stripe aktif, tambah baris langsung di Supabase Dashboard → Table Editor → `langganan`:

```sql
INSERT INTO langganan (id_orang_tua, status, akhir_periode)
VALUES ('<UUID orang tua>', 'aktif', '2027-12-31 00:00:00+00');
```

UUID orang tua bisa dilihat di `auth.users` atau tabel `orang_tua`.

## Langkah 3 — Isi variabel lingkungan

### `apps/digital/.env` (frontend)

```
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### `backend/.env` (Express backend)

```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

**Jangan pernah commit file `.env` ke git.** File ini sudah ada di `.gitignore`.

## Langkah 4 — Verifikasi RLS

Jalankan `supabase/tests/rls_test.sql` di SQL Editor untuk memastikan RLS benar:
- Orang Tua A tidak bisa membaca data Orang Tua B.
- Semua tabel memiliki policy yang aktif.

## Langkah 5 — Langkah manusia yang tersisa

Berikut hal-hal yang **tidak bisa diselesaikan oleh kode** dan membutuhkan keputusan tim:

| # | Tugas | Penanggung jawab |
|---|-------|-----------------|
| 1 | Teks lengkap Kebijakan Privasi dan Syarat & Ketentuan | Legal / Manajemen |
| 2 | Tinjauan bahasa consent di formulir pendaftaran | Psikolog Fitri |
| 3 | Konfirmasi residensi data (apakah region Singapore memenuhi kebijakan internal?) | Legal |
| 4 | Persetujuan teks konten yang ditandai MENUNGGU REVIEW PSIKOLOG FITRI | Psikolog Fitri |
| 5 | Setup Supabase Auth email templates (bahasa Indonesia) | Developer/Admin |
| 6 | Rate limiting pada endpoint koreksi tanggal lahir | Developer |
| 7 | Prosedur hapus `auth.users` saat `admin_hapus_orang_tua` dipanggil | Admin via Supabase Dashboard |
| 8 | Stripe webhook update tabel `langganan` (bukan hanya SQLite lama) | Developer |
| 9 | Masa tenggang (grace period) setelah kedaluwarsa: berapa hari? (default 0) | Manajemen |
| 10 | Apakah pengguna boleh mengisi wizard profil anak sebelum berlangganan? (default: gerbang dulu) | Manajemen |
| 11 | Jalankan `005_rls_paywall.sql` setelah Stripe live dan data langganan tersedia | Developer |
| 12 | Halaman pricing Rekah sendiri + checkout Stripe (pekerjaan terpisah setelah build ini) | Developer |
| 13 | Set `app_metadata.role = 'admin'` untuk admin konten Rekah di Supabase Auth | Developer/Admin |
| 14 | Set `app_metadata.role = 'peninjau_klinis'` untuk Psikolog Fitri di Supabase Auth | Developer/Admin |
| 15 | Integrasikan `terapkan_sikap()` ke workflow: setelah Fitri setujui, admin klik "Terapkan" di `/rekah-admin/semua` | Admin |
| 16 | Keputusan: apakah `terapkan-konten` bisa diotomasikan via Supabase webhook setelah approval? (default: manual oleh admin) | Manajemen |

## Catatan arsitektur

- **Tidak ada auth custom.** Semua auth lewat Supabase Auth (platform terkelola).
- **Tanggal lahir imutabel dari sisi pengguna.** Perubahan hanya lewat permohonan koreksi → disetujui admin via `/api/rekah-admin/koreksi-tanggal-lahir`.
- **PII minimal di localStorage.** Hanya `studiva_token` (JWT Express, untuk backward compat selama migrasi). `studiva_user` sudah dihapus.
- **RLS aktif di semua 8 tabel Rekah.** Data pengguna terisolasi di level database.
- **Express backend tetap untuk:** Stripe, subscription, admin dashboard, knowledge cards, school enrollment. Auth middleware-nya memverifikasi token Supabase *dan* token Express lama (periode migrasi).
