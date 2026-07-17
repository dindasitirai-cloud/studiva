# REKAH_LANDING_REPORT — Fase 0 Concierge MVP

Tanggal: 2026-07-17

---

## Files Created

| File | Keterangan |
|------|-----------|
| `apps/digital/src/features/rekah/rekahLandingCopy.ts` | Semua copy + konstanta REKAH_WA_NUMBER |
| `apps/digital/src/features/rekah/Kelopak.tsx` | Shape komponen (border-radius 70% 70% 70% 4px) |
| `apps/digital/src/features/rekah/LogoRekah.tsx` | SVG bunga 3 kelopak terbuka + 2 kuncup + wordmark |
| `apps/digital/src/features/rekah/RekahLandingPage.tsx` | Halaman utama — 7 seksi + formulir + animasi |

## Files Modified

| File | Perubahan |
|------|-----------|
| `apps/digital/tailwind.config.js` | +9 warna Rekah, +3 font, +1 keyframe, +1 animasi, safelist |
| `apps/digital/src/App.tsx` | Import + route `/rekah` + Layout guard (sembunyikan Navbar/Footer Studiva) |

---

## TODOs — Wajib Ditindaklanjuti Sebelum Go-Live

| # | File | TODO |
|---|------|------|
| 1 | ~~`rekahLandingCopy.ts`~~ | ~~Isi nomor WhatsApp bisnis Rekah~~ — **DONE** `6281211470407` |
| 2 | `rekahLandingCopy.ts:85` | Ganti WhatsApp deep link dengan endpoint backend/form service saat tersedia |
| 3 | `rekahLandingCopy.ts:93` | Foto & bio final Psikolog Fitri dari Raisha |
| 4 | `rekahLandingCopy.ts:102` | Konfirmasi copy harga oleh Raisha (sekarang: "gratis untuk peserta terbatas") |
| 5 | `rekahLandingCopy.ts:119` | Isi URL domain sekolah di footer |
| 6 | `LogoRekah.tsx:1` | Ganti dengan logo final |
| 7 | `RekahLandingPage.tsx` (noindex meta) | Hapus `robots: noindex` saat go-live publik |
| 8 | `App.tsx:118` | Keputusan Raisha — jadikan `/rekah` sebagai homepage saat go-live |

> Copy disetujui Psikolog Fitri — 2026-07-17.

---

## Verification Checklist

- [x] `pnpm typecheck` — 0 error (shared, sekolah, digital)
- [x] `pnpm build` — 0 error, Compiled successfully (sekolah + digital)
- [ ] Manual: buka `/rekah` di browser, cek mobile ~380px
- [ ] Manual: klik "Mulai Merekah" → scroll ke `#akar-keluarga`
- [ ] Manual: submit formulir kosong → validasi muncul semua
- [ ] Manual: pilih 3 nilai → pesan batas 2 muncul
- [ ] Manual: isi semua field → submit → WhatsApp terbuka, cek teks pesan
- [ ] Manual: state sukses tampil setelah WhatsApp dibuka
- [ ] Manual: FAQ accordion buka/tutup
- [ ] Manual: homepage `/`, login, dashboard Tier 2 tidak berubah
- [ ] Manual: animasi bloom-in muncul saat scroll (cek prefers-reduced-motion di DevTools)

---

## Design System Tokens (Rekah)

| Token | HEX | Penggunaan |
|-------|-----|-----------|
| `rekah` | `#E0526B` | CTA, aksen utama, border aktif |
| `rekah-tua` | `#B93A52` | Hover, error, teks kutipan |
| `mawar` | `#F7C9CE` | Background kartu nilai aktif |
| `fajar` | `#FBEDEA` | Background seksi Masalah + FAQ |
| `kanvas` | `#FDF8F5` | Background utama |
| `daun` | `#4E9C6E` | Trust line, border input |
| `pucuk` | `#E3F1E4` | Background formulir |
| `madu` | `#F6B860` | Pusat bunga logo |
| `pekat` | `#43272E` | Teks utama, footer background |

---

## Batasan Fase 0

- Tidak ada backend baru — submit via WhatsApp deep link
- Tidak ada perubahan pada homepage, auth, dashboard, atau apps/sekolah
- Tidak ada dependensi baru (hanya lucide-react yang sudah ada)
- Tidak ada klaim klinis/outcome; tidak ada bahasa perbandingan
