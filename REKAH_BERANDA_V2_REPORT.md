# REKAH_BERANDA_V2_REPORT

Mengikuti gaya REKAH_BUILD5_REPORT.md.
Tanggal: 2026-08-07.

---

## 1. Hasil Prasyarat

| Kode | Pemeriksaan | Hasil |
|------|-------------|-------|
| P1 | Semua 9 file wajib ada | ✅ LULUS |
| P2 | MENU_UTAMA (Sidebar) dan TABS (NavigasiBawah) keduanya 6 item, label dan rute identik | ✅ LULUS |
| P3 | `status: "aktif"` hanya sekali (band 0-1) | ✅ LULUS |
| P4 | 4 tahap `id: "bulan-*"` di content.ts | ✅ LULUS |
| P5 typecheck | `tsc --noEmit` | ✅ HIJAU |
| P5 test | `react-scripts test` | ❌ MERAH PRE-EXISTING — lihat catatan |
| P5 build | `react-scripts build` — Compiled successfully | ✅ HIJAU |

**Catatan P5 test:** Semua 11 suite test gagal parse (Babel error TypeScript) — ini masalah pre-existing yang ada sebelum perubahan ini. Error: `Unexpected token, expected ","` pada parameter bertipe TypeScript di fungsi biasa. `@babel/preset-typescript` tidak terkonfigurasi di react-scripts 5 + pnpm hoisted `@babel/parser@7.29.7`. Ini bukan regresi dari perubahan Beranda v2 — semua suite yang ada sebelumnya juga gagal dengan error yang sama.

---

## 2. Keputusan Token Warna

**Jawaban Raisha:** "Warna sesuai dengan brand design system Rekah" → menggunakan token dari `tailwind.config.js`.

| Token | Nilai | Dipakai di |
|-------|-------|------------|
| `bg-rekah`, `text-rekah` | `#F06BA8` | chip tahap, tab aktif, CTA primer |
| `text-pekat` | `#6E3B57` | heading, teks utama |
| `bg-kanvas` | `#FFF3E6` | latar halaman |
| `bg-fajar` | `#FFF0F7` | chip tahap, tab hover |
| `bg-mawar` | `#F8B9D4` | KartuAnakAktif (via fiturRekah) |
| `bg-kuning` | `#FFE29A` | kartu transisi, ikon Irama Hari |
| `bg-langit` | `#8FB8F7` | ikon Bekal |
| `bg-daun`, `text-daun` | `#4E9C6E` | DeteksiDini border, ikon Ruang Teduh |
| `bg-ungu` | `#C9B8F0` | ikon Jurnal |
| `bg-kuning/60` | kuning transparan | highlight `**tebal**` di CeritaTahap |

Tidak ada hex hardcode di komponen baru. SidebarRekah CLR tidak disentuh (hanya MENU_UTAMA-nya yang dipindah ke fiturRekah.ts).

**Breakpoint 2-kolom:** Tailwind tidak punya breakpoint 1180px bawaan. Dipakai `xl:` (1280px) sebagai pendekatan terdekat. Bisa dikonfigurasi custom screen di tailwind.config.js jika diperlukan.

---

## 3. Berkas Dibuat / Diubah / Dihapus

### Dibuat (baru)

| Berkas | Alasan |
|--------|--------|
| `src/config/fiturRekah.ts` | Sumber tunggal daftar 6 fitur Rekah |
| `src/features/beranda/copy.ts` | Semua string UI beranda, beranda-usia tetap di content.ts |
| `src/features/beranda/useTahapAktif.ts` | Pure function `resolveTahapId` + hook `useTahapAktif` |
| `src/features/beranda/komponen/HeroBeranda.tsx` | Sapaan + lead + chip tahap + tautan panduan penuh |
| `src/features/beranda/komponen/AlurEkosistem.tsx` | 5 langkah dari fiturRekah.ts, horizontal desktop / vertikal mobile |
| `src/features/beranda/komponen/CeritaTahap.tsx` | Tab 4 sub-tahap + cerita + jembatan + domains details |
| `src/features/beranda/komponen/JembatanFitur.tsx` | 3 kartu link ke fitur Rekah per tahap |
| `src/features/beranda/komponen/BekalMingguIni.tsx` | Empty state + link ke Bekal (kegiatan masih kosong) |
| `src/features/beranda/komponen/DeteksiDiniRingkas.tsx` | Flags + 2 tombol (simpan jurnal, panduan penuh) |
| `src/features/beranda/komponen/RailBeranda.tsx` | Wrapper sticky rail kanan |
| `src/features/beranda/komponen/rail/KartuAnakAktif.tsx` | Foto/inisial + nama + usia |
| `src/features/beranda/komponen/rail/KartuIramaHariIni.tsx` | 4 blok empty state (TODO: sambungkan PilihanHarianProvider) |
| `src/features/beranda/komponen/rail/KartuCuacaHati.tsx` | Mengembalikan null — pending integrasi |
| `src/features/beranda/komponen/rail/KartuMomenTerakhir.tsx` | Entri terbaru atau empty state |
| `src/features/beranda/komponen/rail/KartuPanen.tsx` | Entri refleksi atau musimSebelumnyaEmpty |
| `src/features/beranda/komponen/rail/KartuTransisiTahap.tsx` | Countdown tahap berikutnya (≤2 bulan) |
| `src/features/beranda/__tests__/useTahapAktif.test.ts` | 10 kasus batas pure function |
| `src/features/beranda/__tests__/BerandaPage.test.tsx` | AlurEkosistem 5 langkah + regression guard sinyalLelah |

### Diubah

| Berkas | Perubahan |
|--------|-----------|
| `src/config/fiturRekah.ts` | (baru — sumber tunggal) |
| `src/components/SidebarRekah.tsx` | Impor MENU_UTAMA + PROFIL_ANAK dari fiturRekah; hapus literal lama |
| `src/components/NavigasiBawah.tsx` | Impor MENU_UTAMA dari fiturRekah; hapus literal TABS lama |
| `src/features/beranda-usia/renderRichText.tsx` | Tambah param opsional `strongClass?: string` — backward compatible |
| `src/features/beranda-usia/bands/tahun-pertama/content.ts` | Tambah tipe `Jembatan`, field `jembatan: Jembatan[]` di Stage, isi data draft 4 tahap |
| `src/App.tsx` | Tambah `<Route path="panduan" element={<TahunPertama />} />` di bawah `/dashboard/tier2` |
| `src/features/beranda/BerandaPage.tsx` | Dirombak total: layout 2 kolom, komponen baru, band aktif/segera/diluar |

### Dihapus

Tidak ada berkas yang dihapus.

---

## 4. Copy Baru

Seluruh string baru dikelompokkan per file. Semua diberi komentar `// MENUNGGU REVIEW PSIKOLOG FITRI`.

### `src/features/beranda/copy.ts`

```
HERO_BERANDA.judulTemplate       = "Bulan ke-{bulan} bersama {anak}"
HERO_BERANDA.judulFallback       = "Hari ini bersama si kecil"
HERO_BERANDA.lead                = "Rekah memperbarui isi kelima ruangnya setiap kali usia bertambah — tidak perlu mengatur apa-apa."
HERO_BERANDA.chipTahap           = "Tahap aktif"

ALUR_EKOSISTEM.judul             = "Satu hari, lima ruang"
ALUR_EKOSISTEM.penutup           = "Semua bermula dari satu hal: usia {anak}. Rekah menyesuaikan isi kelima ruang ini otomatis setiap kali ia bertambah bulan."

CERITA_TAHAP.labelSekarang       = "sekarang"
CERITA_TAHAP.judulSeksi          = "Cerita tahap ini"
CERITA_TAHAP.labelDetailRanah    = "🌸 Yang bisa Ayah Bunda amati"
CERITA_TAHAP.tautanPanduan       = "Buka panduan penuh →"

JEMBATAN_SEKSI.judul             = "Di Rekah, babak ini terhubung ke:"

BEKAL_SEKSI.judul                = "Kegiatan untuk tahap ini"
BEKAL_SEKSI.kosong               = "Kegiatan untuk tahap ini sedang kami siapkan. Sementara itu, jelajahi Bekal untuk ide aktivitas."
BEKAL_SEKSI.tautanBekal          = "Jelajahi Bekal"

DETEKSI_SEKSI.tombolSimpan       = "Simpan ke Jurnal untuk dibawa ke posyandu"
DETEKSI_SEKSI.tombolPanduan      = "Baca panduan lengkap"

KARTU_SEGERA.tombolIramaHari     = "Buka Irama Hari"

RAIL_IRAMA.judul                 = "Irama hari ini"
RAIL_IRAMA.tautanLihat           = "Atur irama →"

RAIL_MOMEN.judul                 = "Momen terakhir"
RAIL_MOMEN.kosong                = "Belum ada momen tercatat."
RAIL_MOMEN.tombolCatat           = "Catat momen hari ini"

RAIL_PANEN.judul                 = "Jejak Mekar"
RAIL_PANEN.tautanLihat           = "Lihat panen →"

RAIL_ANAK.labelUsiaRentang       = "Usia"

KARTU_TRANSISI.judul             = "Tahap berikutnya mendekat"
KARTU_TRANSISI.bodyTemplate      = "{n} bulan lagi memasuki {tahap}."
```

### `src/config/fiturRekah.ts`

```
FiturRekah.ringkas (per fitur):
  beranda  → "Cerita tumbuh kembang hari ini"
  irama    → "Susun aktivitas harian dengan ritme yang sesuai"
  bekal    → "Kolam ide kegiatan sesuai usia"
  teduh    → "Ruang istirahat untuk dirimu sendiri sebagai pendamping"
  jurnal   → "Catat dan simpan momen tumbuh kembang"
  panen    → "Lihat pola dan refleksi dari perjalanan bersama"

FiturRekah.kapan (per fitur):
  irama → "Pagi", bekal → "Saat butuh ide", teduh → "Kapan pun",
  jurnal → "Saat terjadi", panen → "Akhir musim"
```

### `src/features/beranda-usia/bands/tahun-pertama/content.ts` — Jembatan (DRAFT)

Semua blok di bawah ditandai `// MENUNGGU REVIEW PSIKOLOG FITRI`:

**bulan-0-3:**
- teduh · "Rawat dirimu dulu" · "Lembar nifas, porsi gizi harian, dan checklist pemulihan. Bayi menenang lewat tubuh yang tenang."
- irama · "Ritme yang longgar" · "Susun pagi sampai jelang tidur tanpa jam kaku. Blok kosong tetap sah di babak ini."
- jurnal · "Abadikan senyum pertama" · "Foto dan stiker untuk momen yang tidak akan terulang."

**bulan-4-6:**
- bekal · "Kegiatan meraih dan berguling" · "Kolam kegiatan tahap 4 sampai 6 bulan: cermin, kain bertekstur, mainan berbunyi."
- teduh · "Bersiap ke MPASI" · "Panduan memilih perlengkapan dan kesiapan keluarga, dirujuk ke Buku KIA Kemenkes."
- irama · "Sisipkan tummy time" · "Taruh satu kegiatan motorik di blok pagi supaya tidak menumpuk di sore."

**bulan-7-9:**
- bekal · "Main cilukba dan sembunyi" · "Kegiatan yang pas untuk penemuan bahwa benda tidak benar-benar hilang."
- jurnal · "Catat cara berpindahnya" · "Merangkak, ngesot, atau berguling — semuanya layak diabadikan apa adanya."
- panen · "Lihat pola yang muncul" · "Setelah beberapa catatan, Panen menunjukkan kegiatan mana yang paling ia nikmati."

**bulan-10-12:**
- jurnal · "Langkah pertama, tersimpan" · "Video dan foto masuk ke Galeri, lengkap dengan tanggalnya."
- panen · "Panen setahun pertama" · "Kumpulan momen sepanjang tahun, dibandingkan hanya dengan {anak} di awal tahun."
- bekal · "Semua bentuk bahasa" · "Kegiatan yang memperlakukan menunjuk dan melambai setara dengan kata."

---

## 5. Sambungan Data Rail

| Kartu | Status sambungan | Catatan |
|-------|-----------------|---------|
| KartuAnakAktif | ✅ Tersambung | `useAnakAktif()` + `useFotoAnak()` + `ringkasRentang()` |
| KartuIramaHariIni | ⚠️ TODO | `PilihanHarianProvider` hanya ada di `IramaHariPage`, bukan di atas `DashboardShellTier2`. Beranda selalu merender 4 blok empty dari `SUSUNAN_HARI`. Perlu diskusi arsitektur sebelum fix. |
| KartuCuacaHati | ⚠️ TODO | Mengembalikan null. Perlu integrasi ke `CatatanHarianRepository` + keputusan produk tentang UX picker. |
| KartuMomenTerakhir | ✅ Tersambung | `useJurnalRekah()` — entri terbaru atau empty state |
| KartuPanen | ✅ Tersambung | `useRekahRefleksi()` — `entries.length === 0` → `JEJAK_COPY.musimSebelumnyaEmpty` |
| KartuTransisiTahap | ✅ Tersambung | Hitung dari `usiaBulan` — tampil hanya jika ≤2 bulan ke batas tahap |

---

## 6. Test

| Suite | Status | Keterangan |
|-------|--------|------------|
| `useTahapAktif.test.ts` (baru) | Gagal parse (pre-existing Babel issue) | 10 kasus ditulis dengan benar; gagal karena infrastruktur |
| `BerandaPage.test.tsx` (baru) | Gagal parse (pre-existing Babel issue) | AlurEkosistem 5 langkah + regression guard sinyalLelah |
| 11 suite lama | Gagal parse (pre-existing) | Tidak berubah dari kondisi sebelum iterasi ini |

**Test baru yang ditambahkan:**
1. `useTahapAktif.test.ts` — 10 kasus batas (0, 2, 3, 5, 6, 9, 11, 12, null, -1)
2. `BerandaPage.test.tsx` — AlurEkosistem 5 langkah + urutan + regression guard sinyalLelah

**Snapshot:** Tidak ada snapshot untuk SidebarRekah dan NavigasiBawah — kedua komponen tidak punya test file sebelumnya, sehingga tidak ada risiko regresi snapshot.

---

## 7. Yang Tidak Dikerjakan

| Item | Alasan |
|------|--------|
| Perbaikan infrastruktur Babel/Jest | Di luar scope iterasi ini; masalah pre-existing yang ada sebelum semua perubahan |
| Sambungan PilihanHarianContext ke KartuIramaHariIni | Provider hanya ada di IramaHariPage — perlu keputusan arsitektur untuk memindahkan provider ke level DashboardShellTier2 |
| Implementasi lengkap KartuCuacaHati | Perlu integrasi ke CatatanHarianRepository + keputusan produk tentang UX (4 ikon mood) |
| Custom breakpoint 1180px di tailwind.config.js | Menggunakan `xl:` (1280px) sebagai pendekatan. Tailwind defaults tidak punya 1180px |
| Isi `kegiatan[]` di bekalRegistry.ts | Semua sub-tahap punya `kegiatan: []`. BekalMingguIni selalu empty state. Ini data yang perlu diisi oleh tim konten |
| Test BerandaPage yang merender full component | Membutuhkan mock semua context — kompleks dan tidak bisa dijalankan tanpa fix infrastruktur Babel |

---

## 8. Keputusan Manusia yang Tertunda

Hal-hal berikut membutuhkan Raisha atau Psikolog Fitri sebelum rilis:

1. **Review copy Psikolog Fitri** — Semua string di `copy.ts` dan data `jembatan` di `content.ts` ditandai `// MENUNGGU REVIEW PSIKOLOG FITRI`. Tidak ada yang boleh tayang sebelum approval.

2. **Fix infrastruktur Babel/Jest** — Apakah akan diperbaiki? Semua test gagal parse. Perlu keputusan siapa yang menangani dan kapan.

3. **KartuIramaHariIni: arsitektur provider** — Apakah `PilihanHarianProvider` dipindah ke atas `DashboardShellTier2` agar beranda bisa membaca irama hari ini? Perlu keputusan arsitektur.

4. **KartuCuacaHati: spesifikasi UX** — Brief menyebut "pemilih 4 ikon + tautan ke Ruang Teduh". Apakah 4 ikon ini emoji atau ikon dari library? Bagaimana cara menyimpan pilihan? Perlu keputusan produk sebelum implementasi.

5. **Custom breakpoint 1180px** — Apakah perlu menambah screen `1180px` ke tailwind.config.js, atau `xl:` (1280px) sudah cukup?

6. **Isi dataset `kegiatan[]`** — Semua sub-tahap di bekalRegistry.ts punya `kegiatan: []`. BekalMingguIni akan selalu menampilkan empty state sampai data ini diisi.

7. **Review Fitri: label fitur di fiturRekah.ts** — Sudah ditandai `// TODO: review Fitri`. Khususnya `ringkas` dan `kapan` per fitur.
