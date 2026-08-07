# Migrasi Rekah: Express → Supabase (jalur kritis orang tua)

Memindahkan lima context inti Rekah dari backend Express + SQLite ke Supabase.
Setelah ini, Bekal / Irama Hari / Akar Keluarga / Jurnal / Penutup Musim tidak
lagi butuh server Express untuk berjalan.

---

## Ringkasan perubahan

| Berkas | Status |
|---|---|
| `supabase/migrations/011_rekah_musim_jurnal.sql` | baru — 5 tabel, RLS, trigger |
| `supabase/migrations/012_centang_kebiasaan.sql` | baru — kolom `pilihan_harian.centang` |
| `supabase/migrations/013_ruang_teduh.sql` | baru — `catatan_harian_ibu`, `centang_persiapan` |
| `apps/digital/src/features/ruang-teduh/penyimpanan/supabase.ts` | baru — implementasi kontrak |
| `apps/digital/src/lib/supabase/database.types.ts` | + 5 tabel, + 2 kolom `anak` |
| `apps/digital/src/lib/supabase/rekahMusim.ts` | baru — lapisan akses data |
| `apps/digital/src/context/RekahProfileContext.tsx` | ditulis ulang |
| `apps/digital/src/context/RekahPlanContext.tsx` | ditulis ulang |
| `apps/digital/src/context/RekahRefleksiContext.tsx` | ditulis ulang |
| `apps/digital/src/context/JurnalRekahContext.tsx` | ditulis ulang |
| `apps/digital/src/features/rekah-musim/PenutupMusimFlow.tsx` | tutup musim |
| `apps/digital/src/features/rekah-plan/CeritaHariIni.tsx` | id entri dilepas |
| `apps/digital/src/features/beranda/komponen/DeteksiDiniRingkas.tsx` | id entri dilepas |
| `apps/digital/src/pages/DashboardPages/Tier2/PengaturanPage.tsx` | hapus data musim |
| `apps/digital/src/pages/DashboardPages/Tier2/JejakMekarPage.tsx` | tombol mati dijujurkan |

**Verifikasi:** `tsc --noEmit` exit 0 untuk `apps/digital` dan `packages/shared`.
Migrasi SQL lolos parser Postgres asli (libpg_query, 24 statement). Nol sisa
panggilan `api.*` ke endpoint `/rekah/*` yang dimigrasi.

---

## Perubahan model: per-user → per-anak

Enam tabel SQLite di `backend/src/routes/rekah.ts` semuanya di-key ke `user_id`.
`database/schema.sql` baris 520 sudah menandainya sebagai utang:

> `-- TODO: multi-anak pasca-MVP — tambah child_id FK.`

Rekah mendukung banyak anak, jadi memindahkan model itu apa adanya akan membuat
dua anak berbagi satu musim, satu jurnal, satu set langkah. Migrasi ini menutup
utang tersebut, bukan memindahkannya.

| Lama (SQLite, per user) | Baru (Postgres, per anak) |
|---|---|
| `rekah_profiles.profile_json.anak` | kolom di `anak` (sudah ada + `temperamen`, `tantangan_utama`) |
| `rekah_profiles.profile_json.caregiver` | `anak.pendamping` (sudah ada, migrasi 010) |
| `rekah_profiles.profile_json.akar` | `rekah_musim.nilai_fokus`, `.mulai` |
| `rekah_profiles.current_week/musim_ke` | `rekah_musim.minggu_ke/musim_ke` |
| `rekah_seasons` | `rekah_musim` (baris dengan `selesai` terisi) |
| `rekah_completions` | `rekah_langkah_selesai` |
| `rekah_reflections` | `rekah_refleksi` |
| `rekah_journal_entries` | `rekah_jurnal` |
| `rekah_week_plans` | `rekah_rencana_pekan` |

Tidak ada migrasi data: tabel SQLite tidak pernah terisi di produksi karena
backend Express belum pernah dideploy.

---

## Tiga bug yang ditemukan saat uji manual (di luar migrasi)

Keduanya sudah ada sebelum migrasi dan bukan akibatnya. Ditemukan Raisha saat
menelusuri jalur orang tua di lokal.

**A. Centang Kebiasaan Baik tidak pernah disimpan.**
`IramaHariPage.tsx` menyimpannya sebagai `useState({})` dengan
`// TODO: simpan ke backend`. Hilang tiap refresh atau pindah halaman.
Kini masuk kolom baru `pilihan_harian.centang` (migrasi 012).

Kolom terpisah, **bukan** di dalam `diff`: `simpanPilihanHarian` menimpa `diff`
seutuhnya, jadi centang di dalamnya akan tersapu setiap interaksi lain di Irama
Hari — kehilangan data yang tidak memunculkan galat apa pun. Karena alasan yang
sama, `simpanCentangKebiasaan` sengaja **tidak** memakai `.upsert()`: upsert
Supabase menjalankan `ON CONFLICT DO UPDATE SET` untuk semua kolom di payload,
dan `diff` wajib disertakan saat INSERT karena NOT NULL. Polanya UPDATE dulu,
INSERT hanya bila nol baris tersentuh, plus penanganan `23505` untuk balapan
antar tab.

Centang dimuat 14 hari ke belakang, bukan hari ini saja — tab "Minggu Ini"
menurunkan riwayat siram dari data yang sama.

**C. Jadwal di "Minggu Ini" hilang setelah refresh — dua sebab sekaligus.**

`jadwalManual` di `IramaHariPage` adalah `useState({})` yang tidak pernah
disimpan. Dan `IramaMingguan` baris 97–109 berisi `setDataPerHari({})` dengan
fetch tujuh harinya masih berupa komentar — jadi seandainya penyimpanan saja
yang diperbaiki, datanya tersimpan tapi tetap tidak muncul kembali.

Perbaikan memakai skema yang sudah ada, tanpa kolom baru: item ditulis ke
`pilihan_harian` tanggal tujuan lewat `ditambah` (kegiatan) atau `wawasanIds`
(buku), lalu dibaca `getPilihanHarianRentang` dalam satu query untuk tujuh hari.

Efek samping yang disengaja: judul dan warna sampul **tidak** ikut disimpan.
Versi lama menyalinnya ke state lokal, yang berarti judul di grid mingguan bisa
berbeda dari konten sebenarnya setelah konten diperbarui. Kini `pilihanKeHari`
me-resolve-nya dari kolam anak — satu sumber kebenaran. State lokal
`jadwalManual` dan penggabungannya di `IramaMingguan` dihapus seluruhnya.

`jadwalkanKeTanggal` memakai baca-ubah-tulis, bukan menulis ulang `diff` dari
klien: `diff` memuat banyak hal sekaligus dan menimpanya akan menghapus apa pun
yang tidak ikut disertakan.

Sisa `IramaMingguan` yang masih bertanda TODO — riwayat siram lintas pekan,
arsip mingguan otomatis, bottom sheet detail item, navigasi ke hari tertentu —
adalah fitur yang belum dibangun, bukan kehilangan data.

**B. Dengan tepat satu anak, tidak ada jalan menambah anak kedua.**
`TombolGantiAnak` disembunyikan sampai ada 2 anak; kartu "Tambah anak" hanya ada
di layar `PilihAnak`; layar itu dilewati karena `AnakContext` otomatis memilih
ketika anaknya satu. Buntu total — satu-satunya pemanggil `tambahAnak()` adalah
`WizardAnak`, yang hanya bisa dicapai lewat kartu itu.

Perbaikan: `sedangTambahAnak` dipindah dari state lokal `DashboardShellTier2` ke
`AnakContext`, sehingga layar mana pun bisa memintanya. Ditambah tombol "Tambah
anak" di Profil Anak yang selalu tersedia, dan chip anak aktif kini muncul sejak
satu anak.

## Tiga bug yang ikut tertutup

**1. Perubahan rencana pekan tidak pernah tersimpan.**
`swapStep` dan `addStep` di `RekahPlanContext` punya `// TODO: persist week plan
to backend — PUT /api/rekah/week-plan`. Endpointnya sudah ada di `rekah.ts` baris
314, tapi tidak pernah dipanggil. Jadi setiap kali orang tua mengganti atau
menambah langkah, perubahannya hilang saat halaman dimuat ulang. Sekarang
tersimpan ke `rekah_rencana_pekan`.

**2. Menutup musim bisa menghapus musim tanpa jejak.**
Alur lama: `POST /rekah/seasons/close` **dengan kegagalannya diabaikan**
(`.catch(() => {})`), lalu `setProfile` menimpa `musim_ke`. Kalau arsip gagal
tapi profil berhasil, musim yang baru saja selesai hilang dan tidak ada yang
tahu. Sekarang `tutupMusim()` gagal dengan pesan dan tidak mengubah apa pun.

**3. Duplikat entri bergantung pada `Date.now()`.**
Refleksi dan jurnal memakai id buatan klien (`refleksi-${Date.now()}`,
`jurnal-refleksi-${Date.now()}`) dengan `INSERT OR IGNORE`. Dua entri pada
milidetik yang sama bertabrakan; dua tab bisa menggandakan. Idempotensi sekarang
dari `UNIQUE (id_anak, id_modul, tanggal)` di database, dan id dibuat Postgres.

---

## Ruang Teduh — data kesehatan, keputusan yang diambil sadar

Sebelumnya seluruh Ruang Teduh memakai `CatatanHarianDalamMemori`. Itu
**disengaja**, bukan kelalaian: `dalamMemori.ts` menulis "keputusan tempat
penyimpanan sungguhan belum diambil karena menyangkut data kesehatan", dan
`kontrak.ts` menutup dengan "jangan dilonggarkan tanpa keputusan tertulis
Raisha".

Raisha memutuskan melanjutkan (7 Agustus 2026). Isinya: suasana hati masa nifas
termasuk indikator krisis, tanda bahaya nifas, asupan, dan konsumsi suplemen —
data pribadi bersifat spesifik menurut UU 27/2022.

**Larangan pemakaian tetap berlaku dan kini tertulis di tiga tempat**
(`kontrak.ts`, kepala migrasi 013, dan `penyimpanan/supabase.ts`): data ini
hanya untuk ditampilkan kembali kepada ibu yang mencatatnya. Dilarang untuk
personalisasi rekomendasi barang, penentuan kapan tautan belanja muncul,
penargetan, profiling, atau analitik yang bisa ditelusuri ke individu.

Konsekuensi teknis yang sengaja dipilih:

- **Tidak ada policy untuk peran staf.** Admin dan Psikolog Fitri tidak bisa
  membaca `catatan_harian_ibu`. Kalau suatu saat perlu, itu keputusan tersendiri
  yang butuh dasar hukum dan persetujuan eksplisit ibu — bukan sekadar policy baru.
- **Tidak ada kolom turunan atau agregat.** Pola dihitung di klien dari baris mentah.
- **`caregiverId` diganti dari `idAnak` ke `auth.uid()` lebih dulu.** Catatan
  nifas milik ibu; menyimpannya per anak akan membelah riwayat ibu yang punya
  lebih dari satu anak, dan memperbaikinya belakangan berarti memigrasikan data
  kesehatan. Diperbaiki sebelum baris pertama tersimpan.
- **Checklist "Menyambut Si Kecil" ditaruh di tabel terpisah** (`centang_persiapan`)
  karena bukan data kesehatan dan bukan per-tanggal. Batasnya sengaja dibuat
  terlihat di skema, bukan hanya di komentar.

Komponen tidak berubah sama sekali — `PenyimpananProvider` sudah menerima prop
`repository`, persis seperti yang diantisipasi `dalamMemori.ts`.

### Yang belum diverifikasi

`__tests__/dalamMemori.test.ts` menguji implementasi **memori**, bukan
`CatatanHarianSupabase`. Semantik diff versi Supabase — undefined tidak
menghapus, larik kosong mengosongkan — baru dijamin oleh cara kodenya ditulis,
belum oleh uji. Membuatnya butuh database uji; layak dikerjakan sebelum data
kesehatan sungguhan masuk.

### Masih TODO

`tanggalMelahirkan` masih diproksi dari tanggal lahir anak (`RuangTeduh.tsx`).
Tepat untuk kelahiran tunggal, dan itulah yang menghitung 42 hari Lembar Nifas.
`CaregiverProfile` penuh (peran, tanggal melahirkan sungguhan, `anakIds`) belum
ada sebagai entitas.

## Temuan lain saat uji manual: konten berhenti di 36 bulan

Ada dua sistem band usia yang tidak sejajar:

| Berkas | Cakupan |
|---|---|
| `apps/digital/src/lib/band.ts` | 10 band, 0–72 bulan |
| `packages/shared/src/rekah/ageBands.ts` | 5 band, **0–36 bulan** |

Seluruh 103 modul aktivitas memakai `AgeBandId`, yang berhenti di 36 bulan.
Anak berumur di atas 3 tahun mendapat band yang sah dari `hitungBand`, tapi nol
konten — Irama Hari, Bekal, dan Ruang Teduh semuanya kosong dengan pesan
"sedang disiapkan".

Memory proyek menyebut target 0–6 tahun. Artinya separuh rentang sasaran belum
punya isi, dan orang tua anak 4 tahun yang mendaftar hari ini akan melihat
aplikasi kosong tanpa tahu bahwa itu memang belum tersedia, bukan gangguan.
Keputusan produk, bukan teknis — tapi perlu diputuskan sebelum membuka
pendaftaran ke keluarga dengan anak di atas 3 tahun.

Sebaran modul: `7-12` (25), `13-18` (24), `19-24` (23), `0-6` (20), `25-36` (18).

## Keputusan yang perlu kamu ambil

### 1. `total_langkah` saat menutup musim menghitung yang salah

`PenutupMusimFlow` mengirim `totalLangkah: totalSelesai`, dan `totalSelesai =
entries.length` — jumlah **refleksi yang ditulis**, bukan jumlah **langkah yang
selesai**. Orang tua bisa menyelesaikan langkah tanpa menulis cerita, jadi angka
yang diarsipkan lebih kecil dari kenyataan.

Saya **tidak** mengubahnya, karena angka yang sama juga ditampilkan di layar
rangkuman — memperbaiki satu sisi saja akan membuat layar dan arsip berbeda.
Ada `hitungLangkahMusim()` di `rekahMusim.ts` yang siap dipakai kalau kamu mau
angka yang benar di kedua tempat. Arsip musim ditulis sekali dan permanen, jadi
ini lebih murah diputuskan sekarang.

### 2. Tombol "Ringankan" di Jejak Mekar tidak melakukan apa pun

Tombol itu menulis `caregiver.energiSaatIni = 'menipis'`, tapi **tidak ada satu
pun tempat di aplikasi yang membaca `energiSaatIni`**. Jadi tombolnya sudah lama
mati — yang ada hanya kesan tersimpan. Migrasi 011 juga sengaja tidak
mempersistensi energi pendamping karena itu keadaan "sekarang", bukan atribut.

Handler-nya sekarang kosong dengan komentar yang menjelaskan. Tombolnya belum
saya hapus karena "ringankan pekan ini" bisa berarti beberapa hal: memotong
jumlah langkah, menandai pekan sebagai pekan pemulihan, atau sekadar mengubah
nada sapaan. Itu keputusan produk.

### 3. Hapus data: per anak, tapi masih logout

Teks konfirmasi di Pengaturan meminta **nama anak**, jadi yang dihapus sekarang
adalah data musim anak itu saja (`hapusDataMusim`). Tapi alur lama tetap
`logout()` lalu ke `/`. Untuk akun dengan beberapa anak itu terasa salah — anak
lain tidak tersentuh. Perilaku lama dipertahankan agar migrasi ini tidak
menyeret keputusan UX yang belum diambil.

### 4. `nilai_fokus`: 2 atau 3?

Express memaksa **tepat 2** nilai fokus. Brand guide (`memory`, Peta Rekah)
menyebut **3 akar jangkar dengan penanda bintang**. CHECK di database saya
longgarkan ke 1–3 supaya keputusan itu tidak terkunci di skema, tapi tipe
`AkarKeluarga.nilaiFokus` di `packages/shared` masih `[NilaiId, NilaiId]`.

### 5. `tutupMusim` belum transaksional

Dua tulisan berurutan (tutup lama, buka baru), bukan satu transaksi. Kalau yang
kedua gagal, musim lama sudah tertutup dan anak tidak punya musim berjalan —
`getMusimBerjalan` mengembalikan null, UI menganggap belum onboarding.
Partial unique index mencegah duplikat kalau pemanggil mengulang, jadi tidak ada
kerusakan data, tapi ada jendela sempit yang tampak seperti "profil hilang".

Perbaikannya: satu RPC Postgres (`SECURITY INVOKER`, supaya RLS tetap berlaku).
Saya belum membuatnya karena penanganan galat di UI perlu diputuskan dulu.

---

## Langkah selanjutnya

1. ~~Jalankan `011_rekah_musim_jurnal.sql`~~ ✅ sudah dijalankan.
2. Jalankan `supabase/tests/verifikasi_011.sql` — uji struktur: tabel ada, RLS aktif, policy terpasang, partial unique index bekerja, semua CHECK menolak data tidak sah.
3. Jalankan `supabase/tests/rls_test_musim.sql` dengan dua akun — uji baca, tulis, update, dan delete lintas akun.
4. Uji manual jalur orang tua: onboarding → Bekal → tandai langkah → Cerita Hari Ini → Jurnal → Penutup Musim, dengan **dua anak** untuk memastikan datanya tidak bocor antar anak.
5. `cd apps/digital && pnpm build` — gerbang terakhir sebelum push.

### ⚠️ Uji RLS yang sudah ada punya dua uji yang tidak bisa gagal

`supabase/tests/rls_test.sql` uji 3 dan 4 menyaring lewat subquery:

```sql
WHERE id_anak IN (SELECT id FROM anak WHERE id_orang_tua = id_orang_tua_b)
```

Subquery itu sendiri tunduk pada RLS. Saat login sebagai A ia selalu
mengembalikan 0 baris, jadi `id_anak IN (himpunan kosong)` selalu 0 baris —
**apa pun keadaan RLS pada `nilai_ditanam` dan `pilihan_harian`**. Kedua uji itu
akan lulus bahkan bila RLS di tabel tersebut dimatikan sepenuhnya.

Uji yang tidak bisa gagal lebih berbahaya daripada tidak ada uji, karena ia
memberi rasa aman. Uji 1 dan 2 sah — keduanya menyaring langsung pada kolom
tabelnya sendiri.

`rls_test_musim.sql` memakai pola yang benar: UUID anak langsung, ditambah uji
tulis/update/delete yang belum ada di file lama. Peringatan sudah ditambahkan di
kepala `rls_test.sql`; perbaikan uji 3 dan 4 belum saya lakukan karena itu
berkas ujimu — bilang saja kalau mau saya perbaiki sekalian.

Kedua berkas uji baru juga menyertakan *sanity check*: kalau sesi yang
menjalankannya tidak melihat anak mana pun (mis. lupa login sebagai A), uji akan
menolak jalan alih-alih lulus secara palsu.

## Yang masih lewat Express (belum dimigrasi)

25 berkas masih mengimpor `api/client`. Semuanya di luar jalur kritis orang tua:

- **Pembayaran** — `PaymentButton`, `PaymentSuccessPage`, `SubscriptionSettingsPage`, `SubscriptionTier2`. Stripe checkout & webhook memang butuh secret key sisi server; ini kandidat untuk tetap di server kecil atau pindah ke Supabase Edge Function.
- **Admin CMS & operasional** — 12+ halaman `Admin*`, `GuruAkunAdmin`, konsultasi, komunitas, enrollment.
- **Konten** — `KnowledgeLibraryContext`, `LearningStrategiesContext` (tabel `sikap` / `konten_draf` sudah ada di Supabase, jadi ini migrasi berikutnya yang paling mudah).
