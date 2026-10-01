# Pembayaran Rekah — Midtrans & Xendit (mode uji coba)

Alur: orang tua pilih paket → `buat-pembayaran` (Supabase Edge Function) membuat tagihan
di Midtrans/Xendit → orang tua bayar (QRIS / VA / e-wallet) → penyedia mengirim notifikasi ke
`notifikasi-pembayaran` → `lunasi_pembayaran()` mengaktifkan langganan → halaman
`/pembayaran/selesai` menampilkan "Pembayaran diterima".

Harga ditentukan di server (`supabase/functions/_shared/bayar.ts`), bukan di browser.
Kunci rahasia hanya disimpan di Secrets Supabase — **jangan pernah ditempel di kode, chat, atau Vercel**.

---

## 1. Daftar akun (gratis)

### Midtrans
1. Daftar di https://dashboard.midtrans.com
2. Pindah ke lingkungan **Sandbox** (pojok kiri atas).
3. **Settings → Access Keys**: salin **Server Key** (`SB-Mid-server-…`).
4. **Settings → Payment → Notification URL** (Payment Notification URL), isi:
   `https://bjqlvhbjbrnlpuadxaah.supabase.co/functions/v1/notifikasi-pembayaran?penyedia=midtrans`

### Xendit
1. Daftar di https://dashboard.xendit.co — pastikan berada di **Test Mode**.
2. **Settings → API Keys → Generate secret key**, beri izin **Write** untuk *Money-in*.
   Salin kuncinya (`xnd_development_…`).
3. **Settings → Webhooks**: pada **Invoices paid**, isi
   `https://bjqlvhbjbrnlpuadxaah.supabase.co/functions/v1/notifikasi-pembayaran?penyedia=xendit`
   lalu salin **Verification token** (Callback token) di halaman yang sama.

## 2. Supabase

1. **SQL Editor** → jalankan `supabase/migrations/031_pembayaran.sql` (aman dijalankan ulang).
2. **Project Settings → Edge Functions → Secrets** (atau Edge Functions → Secrets), tambahkan:

   | Nama | Isi |
   |---|---|
   | `MIDTRANS_SERVER_KEY` | Server Key sandbox Midtrans |
   | `MIDTRANS_IS_PRODUCTION` | `false` |
   | `XENDIT_SECRET_KEY` | Secret key test Xendit |
   | `XENDIT_CALLBACK_TOKEN` | Verification token Xendit |
   | `SITUS_URL` | `https://rekah.vercel.app` |
   | `PENYEDIA_BAWAAN` | (opsional) `midtrans` atau `xendit` |

   Cukup isi kunci penyedia yang sudah ada; penyedia tanpa kunci otomatis tidak dipakai.

3. Pasang kedua fungsi dari Terminal (sekali saja, ulangi bila kodenya berubah):
   ```
   cd "/Users/dindasitiraisha/Downloads/Studiva Website Project/studiva-website"
   npx supabase login
   npx supabase functions deploy buat-pembayaran --project-ref bjqlvhbjbrnlpuadxaah
   npx supabase functions deploy notifikasi-pembayaran --project-ref bjqlvhbjbrnlpuadxaah --no-verify-jwt
   ```
   `--no-verify-jwt` wajib untuk fungsi notifikasi karena yang memanggilnya Midtrans/Xendit,
   bukan pengguna yang login. Keasliannya dicek lewat tanda tangan Midtrans / token Xendit.

## 3. Vercel (opsional)

`REACT_APP_PENYEDIA_BAYAR` mengatur tombol di jendela konfirmasi:
- kosong / `midtrans,xendit` → dua tombol ("Bayar lewat Midtrans" dan "Bayar lewat Xendit") — untuk uji coba
- `midtrans` atau `xendit` → satu tombol "Lanjut ke pembayaran" — setelah memilih

## 4. Mencoba (tanpa uang sungguhan)

1. Masuk sebagai akun orang tua uji → `/pricing` → pilih paket → pilih penyedia.
2. Di halaman bayar mode uji:
   - **Midtrans**: pilih QRIS/VA, lalu selesaikan lewat simulator sandbox
     (https://simulator.sandbox.midtrans.com) memakai kode/nomor VA yang ditampilkan.
   - **Xendit**: pilih metode, lalu gunakan tombol simulasi pembayaran yang tersedia di mode uji.
3. Kembali ke Rekah: halaman `/pembayaran/selesai` berubah menjadi "Pembayaran diterima" dan
   dashboard terbuka.
4. Cek di Supabase: tabel `pembayaran` berstatus `lunas`, tabel `langganan` berstatus `aktif`
   dengan `akhir_periode` sesuai paket.

## 5. Pindah ke pembayaran sungguhan

Setelah verifikasi usaha disetujui penyedia: ganti Secrets dengan kunci produksi,
set `MIDTRANS_IS_PRODUCTION=true` (untuk Midtrans), dan daftarkan ulang URL notifikasi di
lingkungan produksi dashboard penyedia.
