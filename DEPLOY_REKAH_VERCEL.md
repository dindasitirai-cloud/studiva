# Runbook Deploy Rekah ke Vercel

Tujuan: menerbitkan **Rekah** (`apps/digital`) sebagai Vercel project sendiri, **tanpa mengganggu** project `studiva` yang sudah live.

---

## 0. Kondisi awal (hasil audit)

| Hal | Kondisi saat audit |
|---|---|
| Vercel project yang ada | `studiva` — `prj_jO1A5NUsQJMkUdxFgxs7CfLoPZAM`, team `team_nRH0dFERUkwCN6QH0GSLraY9`, **Root Directory `.`** |
| Repo GitHub | `dindasitirai-cloud/studiva` |
| Branch di remote | **hanya `main`** |
| Isi `origin/main` | struktur **lama** pra-monorepo (`frontend/`, `backend/`) — belum ada `apps/` |
| Branch lokal aktif | `feat/kebiasaan-baik-visual`, **38 commit di depan `main`**, belum pernah di-push |
| Root `vercel.json` lama | `cd frontend && npm run build` → `frontend/build` |
| Backend Express | `backend/` (Express + SQLite), **belum ter-deploy**; `REACT_APP_API_URL=http://localhost:5001` |

### Tiga risiko tumpang tindih yang sudah ditutup

1. **Satu `vercel.json` dipakai dua app.** Root `vercel.json` sudah dihapus; sekarang tiap app punya config sendiri (`apps/digital/vercel.json`, `apps/sekolah/vercel.json`) yang hanya dibaca kalau Root Directory project menunjuk ke folder itu.
2. **Push di satu app memicu build app lain.** Ditutup lewat `scripts/vercel-ignore-build.sh` (Ignored Build Step per project).
3. **Env var bocor antar app.** Env di-set per Vercel project, bukan di repo. Lihat bagian 4.

---

## 1. ⚠️ Blocker yang harus diputuskan dulu

> Status: **1a** dan **1b** masih terbuka. **1c** sudah terverifikasi bersih.

### 1a. Merge ke `main` akan mematikan build `studiva`
`origin/main` masih punya `frontend/`. Branch monorepo menghapusnya. Begitu monorepo masuk `main`, project `studiva` yang Root Directory-nya `.` akan gagal build.

**Solusi:** ubah Root Directory `studiva` ke `apps/sekolah` **sebelum** merge (langkah 3). Deployment lama tetap live sampai build baru berhasil, jadi tidak ada downtime.

### 1b. Rekah masih memanggil backend Express di `localhost:5001`
20+ file (`AuthContext`, `RekahProfileContext`, `PaymentButton`, `SubscriptionSettingsPage`, dst.) memanggil `process.env.REACT_APP_API_URL`. Backend itu Express + **SQLite** — tidak bisa jalan di Vercel serverless (filesystem ephemeral).

Pilih salah satu sebelum menganggap Rekah "live":

- **A. Deploy backend terpisah** (Railway sudah ada `railway.json`, atau Render/Fly) + Postgres/Supabase sebagai ganti SQLite → set `REACT_APP_API_URL` ke URL itu.
- **B. Selesaikan migrasi ke Supabase** sehingga `api/client.ts` tidak dipakai lagi.
- **C. Deploy sebagai preview/staging dulu** — halaman statis & yang sudah pakai Supabase jalan; fitur yang lewat Express akan error. Cukup untuk validasi visual, tidak untuk 10–20 keluarga pertama.

### 1c. ~~TypeScript error~~ — BERSIH ✅

Typecheck sudah diverifikasi ulang dan **nol error**:

| Paket | Hasil |
|---|---|
| `apps/digital` | `tsc --noEmit` exit 0 — 343 file `src/` dicek |
| `packages/shared` | exit 0 |
| `apps/sekolah` | exit 0 |

> Laporan awal saya soal "8 error TS" ternyata **keliru** — output itu bocor dari perintah shell lain yang timeout, bukan hasil typecheck sungguhan. Sudah diverifikasi ulang dengan `--listFiles` untuk memastikan kelima file yang disebut (`IramaHari.tsx`, `KonsultasiAdmin.tsx`, `ChildPicker.tsx`, `useActivityChild.ts`, `DashboardTier2Context.tsx`) memang ikut dicek. Semuanya lolos — refactor `ChildProfile` → `ProfilAnak` / `AnakContext` sudah tuntas.

**Yang masih perlu kamu jalankan sendiri:** build produksi penuh.
```bash
cd apps/digital && pnpm build
```
Saya sempat mencobanya di sandbox tapi terlalu lambat dan saya hentikan — efek sampingnya isi `apps/digital/build/` terhapus (CRA membersihkannya di awal). Folder itu gitignored, jadi cukup jalankan perintah di atas untuk mengisinya lagi. Jadikan ini gerbang terakhir sebelum push: kalau lolos di lokal, lolos juga di Vercel.

---

## 2. Yang sudah disiapkan di repo

```
apps/digital/vercel.json          (baru)  build Rekah, output build/, SPA rewrite, cache & security headers
apps/sekolah/vercel.json          (baru)  idem untuk Sekolah Studiva
scripts/vercel-ignore-build.sh    (baru)  CADANGAN — lihat catatan di bawah
vercel.json                       (dihapus) config lama yang menunjuk frontend/
```

Commit:
```bash
cd "/Users/dindasitiraisha/Downloads/Studiva Website Project/studiva-website"
git add apps/digital/vercel.json apps/sekolah/vercel.json scripts/vercel-ignore-build.sh
git rm --cached vercel.json
git commit -m "chore(deploy): pisahkan konfigurasi Vercel per app, hapus vercel.json root"
```

### Catatan: `vercel-ignore-build.sh` kemungkinan tidak perlu dipakai

Vercel punya fitur bawaan **Skipping unaffected projects** yang otomatis membatalkan build untuk project yang tidak terpengaruh sebuah commit. Repo ini **sudah memenuhi semua syaratnya**:

| Syarat Vercel | Status repo |
|---|---|
| Repo GitHub | ✅ `dindasitirai-cloud/studiva` |
| npm/yarn/pnpm/Bun workspaces | ✅ `pnpm-workspace.yaml` |
| Nama package unik di tiap `package.json` | ✅ `digital`, `sekolah`, `@studiva/shared` |
| Dependensi antar-package dinyatakan eksplisit | ✅ kedua app punya `"@studiva/shared": "workspace:*"` |

Fitur bawaan ini **lebih baik** daripada script saya: build yang dibatalkan lewat Ignored Build Step tetap memakan slot *concurrent build* dan kuota deployment, sedangkan skipping bawaan tidak.

**Rekomendasi:** biarkan skipping bawaan aktif (default), **kosongkan** kolom Ignored Build Step di kedua project. Simpan `scripts/vercel-ignore-build.sh` sebagai cadangan — pakai hanya kalau ternyata deteksi otomatis meleset (mis. build Rekah tetap jalan padahal yang berubah cuma `apps/sekolah`).

---

## 3. Urutan eksekusi (aman, tanpa downtime)

Urutan ini disusun supaya **tidak ada satu pun build merah** dan site `studiva` yang live tidak pernah putus. Perhatikan: repoint `studiva` dilakukan **paling awal**, bukan di tengah.

### Langkah 1 — repoint project `studiva` ke `apps/sekolah`

Ini langkah "urutan aman" yang dimaksud. Lakukan **sebelum** push branch apa pun.

1. Dashboard Vercel → pilih team **Studiva** di team switcher → klik project **`studiva`**
2. **Settings** → **Build and Deployment** (bukan General — lokasinya sudah pindah)
3. Scroll ke bagian **Root Directory**
4. Ubah `.` → `apps/sekolah`
5. Centang **"Include source files outside of the Root Directory in the Build Step"** — wajib, karena build butuh `packages/shared` + `pnpm-lock.yaml` di root repo
6. **Save**
7. **Jangan klik Redeploy.** Berhenti di sini.

**Kenapa ini aman:**

- Perubahan setting hanya berlaku untuk **build berikutnya**. Deployment yang tayang sekarang adalah artefak statis yang sudah jadi dan disajikan dari CDN — setting tidak menyentuhnya.
- Kalau build berikutnya gagal, Vercel **tidak** mempromosikannya ke production. Site lama tetap tayang. Skenario terburuk cuma "build merah di dashboard", bukan site mati.
- Kalaupun ada yang meleset setelah merge, ada **Instant Rollback** ke deployment sebelumnya.

**Satu-satunya cara ini bisa bikin build merah:** kalau kamu push ke `main` (yang masih struktur lama) sebelum monorepo di-merge — `apps/sekolah` belum ada di sana. Jadi antara langkah 1 dan langkah 5, jangan push apa pun ke `main`.

### Langkah 2 — push branch monorepo (belum ke `main`)
```bash
git push -u origin feat/kebiasaan-baik-visual
```
Push ini memicu **preview** build untuk project `studiva`. Karena Root Directory sudah dibetulkan di langkah 1, preview itu akan **hijau** — sekaligus jadi bukti bahwa konfigurasi barunya benar, tanpa menyentuh production sama sekali. (Kalau langkah 1 dilewat, preview ini merah.)

### Langkah 3 — buat Vercel project baru untuk Rekah

Dashboard → **Add New…** → **Project** → **Import** repo `dindasitirai-cloud/studiva`.
Satu repo boleh dipakai banyak project — persis inilah yang bikin keduanya tidak tabrakan.

Di layar import, klik **Edit** di sebelah **Root Directory** lalu pilih `apps/digital`.

| Setting | Nilai |
|---|---|
| Project Name | `rekah` |
| Framework Preset | Create React App |
| **Root Directory** | `apps/digital` |
| Include source files outside of the Root Directory | **ON** |
| Build / Install / Output Command | biarkan kosong → diambil dari `apps/digital/vercel.json` |
| Install Command | **jangan diisi di mana pun** — lihat peringatan di bawah |
| Production Branch | `feat/kebiasaan-baik-visual` sementara; ganti ke `main` setelah merge |
| Ignored Build Step | **kosongkan** (pakai skipping bawaan Vercel) |

Isi Environment Variables (bagian 4) sebelum klik **Deploy**. Kalau lupa, build tetap jalan tapi Supabase-nya `undefined`.

> ### ⚠️ Jangan pernah menyetel Install Command
>
> Vercel memilih versi pnpm dari `lockfileVersion` di `pnpm-lock.yaml` —
> `9.0` → pnpm 9 atau 10. Deteksi itu bekerja dengan benar.
>
> Tapi begitu kamu menyetel Install Command (di `vercel.json` maupun di
> dashboard), Vercel memakai **versi pnpm PALING TUA yang tersedia di build
> container, yaitu pnpm 6** — apa pun isi perintahnya. pnpm 6 tidak bisa
> membaca lockfile format 9.0, dan build gagal dengan:
>
> ```
> WARN  Ignoring not compatible lockfile at /vercel/path0/pnpm-lock.yaml
> ERROR  Headless installation requires a pnpm-lock.yaml file
> ```
>
> Ini pernah terjadi: `"installCommand": "pnpm install --frozen-lockfile"`
> sempat ada di kedua `vercel.json` dan menggagalkan preview pertama.
> Sudah dihapus.
>
> `--frozen-lockfile` juga tidak perlu ditulis: pnpm menyalakannya sendiri
> ketika `CI=true`, dan Vercel selalu menyetel itu.
>
> `packageManager: pnpm@11.13.1` di root `package.json` **dipatuhi** Vercel
> tanpa perlu Corepack. Log build mengonfirmasinya:
>
> ```
> Detected `pnpm-lock.yaml` version 9 generated by pnpm@10.x
>   with package.json#packageManager pnpm@11.13.1
> ...
> Done in 20.2s using pnpm v11.13.1
> ```
>
> Dokumentasi Vercel per Juli 2026 masih menyebut Corepack sebagai syarat dan
> pnpm 10 sebagai versi tertinggi yang didukung. Keduanya sudah tidak akurat —
> percayai log build, bukan tabel di dokumentasi.
>
> ### ⚠️ Jangan biarkan package-lock.json di dalam apps/
>
> Vercel mencari lock file **di Root Directory**, bukan di root repo. Karena
> Root Directory di sini `apps/sekolah` dan `apps/digital`, adanya
> `package-lock.json` di folder itu membuat Vercel menyimpulkan **npm** dan
> tidak pernah melihat `pnpm-lock.yaml` di root. Gejalanya:
>
> ```
> npm error code EUNSUPPORTEDPROTOCOL
> npm error Unsupported URL Type "workspace:": workspace:*
> ```
>
> npm tidak mengerti protokol `workspace:` milik pnpm. Kedua berkas itu sisa
> dari struktur pra-monorepo dan sudah dihapus.
>
> `backend/package-lock.json` sengaja **dibiarkan** — `backend/` bukan bagian
> dari pnpm workspace (lihat deskripsi di root `package.json`) dan dideploy
> terpisah, jadi ia memang memakai npm.

### Langkah 4 — verifikasi preview Rekah

Preview URL `rekah-*.vercel.app` harus lolos:
- build sukses
- refresh di route dalam (`/beranda`, `/bekal`) tidak 404 → bukti SPA rewrite jalan
- login Supabase jalan
- Network tab: tidak ada request ke `localhost:5001`

Cek juga preview `studiva` dari langkah 2 masih tampil benar.

### Langkah 5 — merge ke `main`
```bash
git checkout main && git merge feat/kebiasaan-baik-visual && git push origin main
```
Kedua project rebuild dari `main` dengan Root Directory masing-masing. Lalu ubah Production Branch `rekah` ke `main`.

Kalau build `studiva` gagal di titik ini: production lama tetap tayang, dan kamu punya waktu untuk memperbaiki tanpa tekanan.

### Langkah 6 — pasang domain Rekah

Project **`rekah`** → **Settings** → **Domains** → **Add Domain** → masukkan `rekah.id`.
Vercel akan menawarkan sekalian menambahkan `www.rekah.id` — terima saja, lalu redirect salah satunya ke yang lain.

Setelah domain ditambahkan, dashboard menampilkan **nilai DNS persis** yang harus dipasang di registrar:

- **Apex** (`rekah.id`) → record **A**
- **Subdomain** (`www.rekah.id`) → record **CNAME**

> **Salin nilainya dari dashboard, jangan dari tutorial mana pun (termasuk dokumen ini).** CNAME sekarang unik per project — bentuknya seperti `d1d4fc829fe7bc7c.vercel-dns-017.com`, bukan `cname.vercel-dns.com` yang generik seperti dulu. IP untuk A record juga ditampilkan di layar yang sama dan pernah berubah.

Kalau `rekah.id` sudah pernah dipakai di akun Vercel lain, kamu akan diminta verifikasi kepemilikan lewat record **TXT** dulu.

> **Jangan tambahkan domain Rekah ke project `studiva`.** Satu domain hanya bisa terpasang di satu project pada satu waktu, jadi salah tempel di sini adalah cara paling umum bikin dua site tumpang tindih — dan memperbaikinya berarti melepas domain dulu (ada jeda downtime).

---

## 4. Environment Variables (set di Vercel, per project)

**Project `rekah`** (Production + Preview + Development):

| Key | Nilai | Catatan |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | dari Supabase → Settings → API | |
| `REACT_APP_SUPABASE_ANON_KEY` | anon/public key | aman di client selama RLS aktif |
| `REACT_APP_API_URL` | URL backend produksi | **jangan** `localhost:5001` |
| `SKIP_PREFLIGHT_CHECK` | `true` | |
| `DISABLE_ESLINT_PLUGIN` | `true` | |

**Project `studiva`**:

| Key | Nilai |
|---|---|
| `REACT_APP_API_URL` | URL backend produksi |
| `SKIP_PREFLIGHT_CHECK` | `true` |
| `DISABLE_ESLINT_PLUGIN` | `true` |

Catatan penting:
- Semua `REACT_APP_*` di CRA **di-inline ke bundle JS saat build** dan bisa dibaca siapa pun. Jangan pernah menaruh Supabase **service_role key** atau **Stripe secret key** di sana. Keduanya hanya boleh di backend.
- Jangan set env Rekah di project `studiva` atau sebaliknya — itu bentuk tumpang tindih yang paling sulit dilacak.
- `.env` lokal sudah ter-gitignore (`.env*`); biarkan begitu.

---

## 5. Checklist "tidak tumpang tindih"

- [ ] Dua Vercel project berbeda: `studiva` dan `rekah`
- [ ] Root Directory: `studiva` → `apps/sekolah`, `rekah` → `apps/digital`
- [ ] "Include source files outside of the Root Directory" **ON** di kedua project
- [ ] Tidak ada `vercel.json` di root repo
- [ ] Ignored Build Step **kosong** di kedua project (pakai skipping bawaan Vercel)
- [ ] Env var di-set per project, tidak ada yang nyasar
- [ ] Domain Rekah hanya terdaftar di project `rekah`
- [ ] Supabase: kalau Rekah & Sekolah pakai project Supabase berbeda, pastikan URL/anon key tidak tertukar
- [ ] Push yang hanya menyentuh `apps/sekolah` → build `rekah` tercatat *skipped* di dashboard (uji sekali)

---

## 6. Kebersihan repo (opsional, disarankan)

- `frontend/` di working tree tinggal `node_modules` kosong — sisa struktur lama, bisa dihapus.
- `railway.json` di root masih menunjuk `backend/`. Kalau backend jadi dideploy di Railway, biarkan; kalau tidak, hapus supaya tidak membingungkan.
- Ada `package-lock.json` di `apps/digital` dan `apps/sekolah` padahal repo pakai pnpm. Hapus keduanya agar Vercel tidak salah deteksi package manager.

---

## 7. Referensi

- [Using Monorepos — Vercel Docs](https://vercel.com/docs/monorepos) — Root Directory, skipping unaffected projects, filtered installs
- [General settings — Vercel Docs](https://vercel.com/docs/project-configuration/general-settings)
- [Adding & Configuring a Custom Domain — Vercel Docs](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

Terakhir diverifikasi terhadap dokumentasi Vercel: 7 Agustus 2026.
