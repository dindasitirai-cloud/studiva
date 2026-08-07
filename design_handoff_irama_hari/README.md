# Handoff: Irama Hari — layar harian Rekah (design system "Langit Peony")

## Overview
"Irama Hari" adalah layar harian utama aplikasi parenting **Rekah**. Layar ini menampilkan
kegiatan anak hari ini, rutinitas/latihan untuk orang tua, susunan hari (4 blok tanpa jam),
catatan jurnal, dan ajakan belajar untuk Bunda/Ayah. Nadanya hangat, ceria, ilmiah-tapi-ramah.

## About the Design Files
File di dalam bundel ini adalah **referensi desain yang dibuat dengan HTML** (Design Components /
`.dc.html`) — prototipe yang menunjukkan tampilan & perilaku yang diinginkan, **bukan kode
produksi untuk disalin langsung**. Tugasnya adalah **membuat ulang desain ini di lingkungan
codebase Anda** (React, Vue, Svelte, dsb.) memakai pola & pustaka yang sudah ada di sana. Jika
belum ada environment, pilih framework paling sesuai (mis. React + CSS-in-JS atau Tailwind) lalu
implementasikan.

Catatan teknis: `.dc.html` memakai runtime internal (`support.js`, tag `<x-dc>`, `<dc-import>`,
`<sc-for>`, `<sc-if>`). Itu **bukan** bagian dari target — abaikan runtime-nya, ambil struktur,
gaya, dan data modelnya. Semua styling di prototipe ini **inline** sehingga mudah dibaca.

## Fidelity
**High-fidelity (hifi).** Warna, tipografi, spacing, radius, dan shadow sudah final. Recreate
pixel-perfect memakai pustaka codebase Anda. Ilustrasi bunga dihasilkan secara parametrik (SVG)
— lihat bagian Assets.

## Screens / Views

### Irama Hari (satu layar, lebar desain 1440px)
- **Purpose**: orang tua membuka aplikasi dan melihat "apa untuk hari ini" untuk anak (Aisyah, 16 bulan) + satu latihan kecil untuk dirinya.
- **Layout keseluruhan** (top → bottom), semua di dalam kartu cream `#FFF3E6`, radius 34px, padding 26px 30px 46px:
  1. **Top bar** — kartu putih radius 26px, padding 14px 26px, `justify-content:space-between`. Kiri: mark bunga (38px) + wordmark "rekah". Kanan: nav horizontal (gap 26px) + avatar bulat 44px.
  2. **Hero header** — panel pink `#FCE3EE`, radius 30px, padding 38px 44px, `overflow:hidden`. Berisi tanggal (label), judul "Irama Hari", tagline tulisan-tangan, dan pill navigasi hari ("‹ Hari ini ›"). 3 ilustrasi botanical bergoyang di kanan (absolute).
  3. **Rutinitas hari ini** — banner lebar (varian "pink", lihat komponen) tepat DI ATAS Kegiatan.
  4. **Dua kolom 50:50** (`display:flex; gap:30px; align-items:flex-start`; tiap kolom `flex:1 1 0`):
     - **Kiri**: "Kegiatan hari ini" (grid 2 kolom × 3 baris) → di bawahnya kartu "Untuk Bunda/Ayah".
     - **Kanan**: "Susunan hari" (4 blok) → di bawahnya "Catatan hari ini" (jurnal).
  5. **Footer botanical** — 2 ilustrasi kecil + teks tulisan-tangan "mekar pada waktunya", `justify-content:center`.

#### Komponen: Top bar nav
- Item nav: `Irama Hari` (aktif, warna `#F06BA8`, opacity 1), lalu `Akar Keluarga`, `Bekal`, `Jurnal dan Galeri`, `Panen` (warna `#6E3B57`, opacity .75). Font Nunito 700, 15px.
- Avatar: lingkaran 44px, bg `#FCE3EE`, inisial "A" Fredoka 700 18px `#F06BA8`.

#### Komponen: Hero header
- Tanggal: Nunito 800, 13px, letter-spacing 1px, `#F06BA8`, uppercase — "SELASA, 4 AGUSTUS · AISYAH 16 BULAN".
- Judul: Fredoka 700, 56px, line-height .95, letter-spacing -1px, `#6E3B57`.
- Tagline: Shantell Sans 600, 22px, `#F06BA8` — "Mekar pada waktunya."
- Pill hari: kartu putih radius 999px, padding 5px; teks "Hari ini" Nunito 800 14px `#6E3B57`; panah `#B98FAD`.

#### Komponen: Kartu Kegiatan (activity card)
- Grid: `grid-template-columns:repeat(2,1fr); gap:20px`. 5 kartu kegiatan + 1 tombol "Tambah" = 2×3.
- Tiap kartu **dimiringkan bergantian** `rotate(±1.1deg)` (indeks genap +1.1, ganjil −1.1).
- Kartu: bg `#FCE3EE`, border 2px `#F8B9D4`, radius 22px, padding 18px 18px 16px, min-height 146px, shadow `0 16px 30px -20px rgba(90,50,70,.45)`.
- Tombol shuffle (kanan-atas): lingkaran 30px, bg putih, ikon panah-tukar `#F06BA8`, shadow `0 4px 10px -6px rgba(90,50,70,.6)`.
- Judul kegiatan: Fredoka 600, 18px, line-height 1.18, `#6E3B57`.
- Chip domain: pill radius 20px, Nunito 700 12px, dengan titik 8px. Warna per domain:
  - Motorik Halus → bg `#FCE3EE`, ink `#E0518F`
  - Motorik Kasar → bg `#E4EFFD`, ink `#5F84E6`
  - Kognitif → bg `#F1ECFB`, ink `#8A6DC7`
  - Bahasa → bg `#FFF3D9`, ink `#C79020`
  - Musik → bg `#FCE3EE`, ink `#E0518F`
- Baris nilai+durasi: Nunito 600 13.5px `#A98DA0`; jika ada "nilai karakter", tampil `#F06BA8` 800 lalu "· durasi". **Jika tidak ada nilai, bagian nilai tidak ditampilkan sama sekali** (bukan placeholder).
- Tombol "Tambah": border 2.5px dashed `#F8B9D4`, radius 22px, min-height 146px, teks `#F06BA8` Nunito 800 15px, ikon "+" 30px.
- Data kegiatan (judul · domain · nilai · durasi):
  1. Menara Gelas & Balok · Motorik Halus · Sabar · 10 mnt
  2. Mendorong Mainan · Motorik Kasar · Keberanian · 10 mnt
  3. Botol Sensorik · Kognitif · (tanpa nilai) · 8 mnt
  4. Buku Kain Bertekstur · Bahasa · (tanpa nilai) · 5 mnt
  5. Tepuk Irama · Musik · Kegembiraan · 6 mnt
- Header seksi: "Kegiatan hari ini" Fredoka 700 28px + link kanan "Lihat semua 9 →" Nunito 800 14px `#F06BA8`.

#### Komponen: Untuk Bunda/Ayah (kartu belajar orang tua)
- Kartu madu: bg `#FFF3D9`, border 2px `#FFE29A`, radius 24px, padding 26px 28px, `display:flex; align-items:center; gap:26px`, shadow `0 18px 32px -22px rgba(90,50,70,.5)`.
- Ikon buku terbuka dalam kotak putih 78px radius 22px (SVG stroke `#E0A21F`).
- Label "UNTUK BUNDA/AYAH" Nunito 800 11.5px letter-spacing 1px `#C79020` + badge "Belajar bareng" (bg `rgba(255,226,154,.9)`, ink `#8A5A14`).
- Judul: Fredoka 600 21px `#6E3B57` — "Kenapa menamai perasaan menenangkan lebih dulu".
- Deskripsi: Nunito 14px `#9A7F55` — "Kenali cara kerja emosi Aisyah — supaya Bunda & Ayah makin paham merespons dengan tenang."
- CTA pill: bg `#E0A21F`, teks putih Nunito 800 13.5px, radius 22px — "Pelajari · 2 menit →".
- Dekorasi: 1 sprig botanical bergoyang (absolute kanan-atas).

#### Komponen: Susunan hari
- Header: "Susunan hari" Fredoka 700 28px + subteks "Empat blok yang mengikuti irama Aisyah — bukan jam." (Nunito 15px `#A98DA0`).
- Kontainer putih radius 26px, padding 8px 28px 22px, shadow `0 14px 34px -26px rgba(90,50,70,.55)`.
- Tiap blok: grid `130px 1fr`, gap 18px, padding 20px 0, border-top 1px `rgba(110,59,87,.09)`. Kiri: titik 12px berwarna + nama blok Fredoka 600 17px.
- Blok & warna titik: Pagi `#F06BA8`, Siang `#5F84E6`, Sore `#C9B8F0`, Jelang tidur `#FFC94D`.
- Item terisi: chip bg lembut (Pagi `#FCE3EE`, Siang `#E4EFFD`) radius 14px, titik 9px, judul Nunito 800 15px + caption Nunito 12.5px `#A98DA0`.
- Blok kosong: teks tulisan-tangan Shantell Sans 16px `#C7A9BE`. **Blok kosong PERTAMA** berbunyi "Belum ada, dan itu tidak apa-apa" (memaafkan); kosong berikutnya cukup "Belum ada".
- Isi: Pagi = "Menara Gelas & Balok / Motorik Halus · 10 mnt"; Siang = "Mendorong Mainan / Motorik Kasar · 10 mnt"; Sore & Jelang tidur = kosong.

#### Komponen: Catatan hari ini (jurnal)
- Kartu bg `#FFFDF8`, radius 20px, padding 32px 26px 46px, shadow `0 20px 36px -24px rgba(90,50,70,.55)`.
- **Tepi bawah robek**: `clip-path` polygon bergerigi (lihat file untuk nilai persis).
- Label "CATATAN HARI INI" Nunito 800 12px letter-spacing 1px `#D6A24B`.
- Placeholder: Shantell Sans 24px `#B79CAE` — "Tulis satu hal kecil tentang hari ini…".
- Footer: "Tersimpan ke Jurnal Aisyah" Nunito 12.5px `#C7A9BE`.
- 2 potongan "selotip" washi di atas (pink & sky, absolute, rotate).

## Komponen: RutinitasBanner (3 varian, satu tema)
Banner lebar untuk "Rutinitas hari ini" (latihan kecil untuk orang tua, diulang sepanjang hari).
Konten sama untuk semua varian:
- Label "RUTINITAS HARI INI" + pill "Latihan Bunda".
- Kalimat: Fredoka 600 27px — "Namai perasaan Aisyah sebelum menenangkannya."
- Chip: "Akar", "Empati", "Sepanjang hari · tanpa target".
- Badge kiri: kotak 74px radius 22px berisi mark bunga 52px. Ilustrasi botanical bergoyang di kanan.

Struktur: kontainer radius 26px, padding 26px 30px, shadow `0 20px 40px -26px rgba(90,50,70,.55)`; 2 "blob" lingkaran lembut absolute sebagai dekorasi.

**Varian dipakai di layar: `pink`.**
- `pink`: bg `#F06BA8`; teks putih; label `rgba(255,255,255,.9)`; pill bg `#FFE29A` ink `#8A5A14`; chip bg `rgba(255,255,255,.2)` ink putih; badge `rgba(255,255,255,.22)`.
- `plum`: bg `#6E3B57`; judul `#FCE3EE`; label `#F8B9D4`; pill bg sky ink `#243A6E`; chip `rgba(255,255,255,.12)`.
- `sky`: bg `#E4EFFD`, border 2px `#C4DBFB`; judul `#3A4E86`; label `#5F84E6`; badge putih; + penghitung "3 hari berturut" di kanan (4 titik warna + angka Fredoka 700 30px `#5F84E6`).

## Interactions & Behavior
- **Nav hari** (‹ Hari ini ›): pindah tanggal — muat ulang kegiatan/susunan untuk tanggal itu.
- **Shuffle kegiatan** (tombol bulat di kartu): ganti kegiatan itu dengan rekomendasi lain di domain yang sama.
- **Tambah**: buka pemilih kegiatan → sisipkan ke grid.
- **Kartu kegiatan**: klik → detail kegiatan (langkah, bahan, tujuan perkembangan).
- **Untuk Bunda/Ayah CTA**: buka artikel ~2 menit.
- **Catatan**: klik → editor jurnal; simpan ke "Jurnal Aisyah".
- **Susunan hari**: item bisa dipindah antar blok (drag) pada implementasi penuh (opsional).
- **Animasi**: ilustrasi bunga "sway" — `@keyframes` rotate −3°↔3°, 8–9s ease-in-out infinite (ada 2 arah: `sway` & `sway2`). Sediakan toggle untuk mematikan (reduced-motion).

## State Management
- `selectedDate` → menentukan daftar `activities` dan `blocks`.
- `activities[]`: { title, domain, value|null, duration }.
- `blocks[]` (Pagi/Siang/Sore/Jelang tidur): { name, items[] }; item { title, caption }.
- `routine`: kalimat + chip (statis per hari di prototipe; nyatanya per-anak).
- `journalEntry` (teks), `motionEnabled` (boolean untuk animasi).
- Data-fetch: kegiatan & susunan per (anak, tanggal); artikel "Untuk Bunda/Ayah".

## Design Tokens (palet "Langit Peony")
- **Warna inti**: Pink `#F06BA8` (primer/aksi), Sky `#8FB8F7` (sekunder), Cornflower `#5F84E6` (tautan/sekunder tua), Peony `#F8B9D4`, Lilac `#C9B8F0`, Butter `#FFE29A`, Cream `#FFF3E6` (permukaan), Plum `#6E3B57` (teks/ink).
- **Tint lembut**: Pink 50 `#FCE3EE`, Sky 50 `#E4EFFD`, Lilac 50 `#F1ECFB`, Butter 50 `#FFF3D9`.
- **Aksen madu**: `#E0A21F` / `#C79020` / `#8A5A14` (dipakai di kartu belajar & label).
- **Teks sekunder**: `#A98DA0`, `#C7A9BE`, `#9A7F55`.
- **Spacing**: kelipatan 4 (4/8/12/16/24/32/48/64). Gap kolom 30, gap grid 20, gap stack 26–34.
- **Radius**: chip/pill 20–999px; input 14px; kartu kecil 18–20px; kartu 22px; panel 26px; hero 30px; kartu luar 34px.
- **Tipografi**: Fredoka (judul/heading, 500–700), Nunito (teks/UI, 400–800), Shantell Sans (aksen tulisan-tangan). Skala: display 56, H2 28, judul kartu 18–21, body 14–15, label 12–13 (letter-spacing ~1px, uppercase).
- **Shadow**: kartu `0 10px 30px -22px rgba(90,50,70,.5)`; terangkat `0 18–24px 34–50px -22–34px rgba(90,50,70,.5–.6)`; CTA glow `0 10px 20px -12px rgba(224,162,31,.9)`.

## Assets
- **Ilustrasi bunga** — dua komponen SVG parametrik (disertakan), semua memakai palet Langit Peony; hijau alami hanya untuk tangkai/daun:
  - `Flower.dc.html` — bunga geometris radial (mark & aksen bulat). Prop lewat objek `cfg` (shape, petalCount, petalColors, centerColors, budIndices, dll). Mark Rekah = `shape:'bud', petalCount:5, budIndices:[2,3]` (3 dari 5 kelopak mekar).
  - `Botanical.dc.html` — bunga bertangkai gaya potongan datar (tulip, daisy, bell, fivepetal, sprig, leaf, foliage, dll). Prop `cfg` = { type, bloom, bloom2, center, stem, leaf }.
  - Di target, port dua komponen ini sebagai komponen SVG (mis. React) atau ekspor jadi file `.svg`/sprite. Logikanya murni fungsi → path SVG; tidak perlu runtime `.dc.html`.
- **Ikon**: buku-terbuka, panah-tukar (shuffle), kronologi panah — semua inline SVG stroke (Lucide-style). Ganti dengan set ikon codebase Anda.
- **Font**: Google Fonts — Fredoka, Nunito, Shantell Sans.

## Files
- `Irama Hari.dc.html` — layar utama (struktur + data + gaya, semua inline).
- `RutinitasBanner.dc.html` — komponen banner rutinitas (3 varian: pink/plum/sky).
- `Flower.dc.html` — ilustrasi bunga geometris (SVG parametrik).
- `Botanical.dc.html` — ilustrasi bunga bertangkai (SVG parametrik).
- `support.js` — runtime prototipe (referensi saja; **jangan** dibawa ke produksi).
