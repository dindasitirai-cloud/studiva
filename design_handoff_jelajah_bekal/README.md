# Handoff: Jelajah Bekal — Halaman Bekal (Rekah)

## Overview
Halaman **Jelajah Bekal** dari aplikasi parenting **Rekah**. Menampilkan bekal pengasuhan untuk seorang anak (contoh: "Rakha · Bekal 0–1 tahun") dalam tiga kategori yang dipilih lewat tab: **Kebiasaan Baik**, **Ajak Main**, dan **Wawasan Tumbuh**. Isi tiap kategori adalah kumpulan kartu nilai/kegiatan yang disusun sebagai kolase kartu putih yang saling tumpang-tindih di atas papan bergrid halus, dengan gerak (motion) lembut. Setiap kartu menampilkan sebuah **bunga generatif** (satu bunga unik per nilai), nama, deskripsi singkat, dan sebuah pill keterangan.

## About the Design Files
File dalam bundel ini adalah **referensi desain yang dibuat dalam HTML** — prototipe yang menunjukkan tampilan dan perilaku yang diinginkan, **bukan** kode produksi untuk disalin langsung. Tugasnya adalah **membuat ulang desain ini di dalam codebase website Anda** memakai pola dan library yang sudah ada di sana (mis. React + Tailwind/CSS Modules/styled-components, dsb). Jika belum ada environment, pilih framework yang paling sesuai lalu implementasikan di sana.

`Canvas-3.dc.html` adalah file `.dc.html` (Design Component). Sintaks `{{ }}`, `<sc-for>`, `<dc-import>`, `renderVals()` adalah runtime prototipe kami — **jangan** ditiru; pahami maksudnya lalu tulis ulang sebagai komponen di framework Anda. Logikanya dijelaskan lengkap di README ini sehingga bisa diimplementasikan tanpa membaca runtime tersebut.

## Fidelity
**High-fidelity (hifi).** Warna, tipografi, jarak, radius, bayangan, dan interaksi sudah final. Buat ulang UI sepersis mungkin memakai library styling yang sudah ada di codebase Anda.

## Layout Halaman (lebar desain 1440px)

Kontainer terluar: `width:1440px; background:#FBEFDF; border-radius:34px; box-shadow:0 30px 60px -44px rgba(90,50,70,.6); overflow:hidden; padding-bottom:54px`. Bagian dalam (di bawah top bar) memakai padding `30px 56px 0`. Desain ini fixed-width; untuk web produksi jadikan responsif (kartu kolase absolut → grid/flex responsif di layar sempit — lihat catatan Responsif).

### 1. Top Bar
`display:flex; justify-content:space-between; align-items:center; background:#fff; padding:18px 40px; border-bottom:1px solid #F3E7D6`.
- **Kiri**: grup logo + nav, `gap:44px`.
  - Logo: bunga kecil 38×38 (komponen Flower, `budFlower` config di bawah) yang bergoyang (animasi `sway`), lalu wordmark "rekah" — Fredoka 700, 27px, `#F06BA8`, `letter-spacing:-.5px`.
  - Nav (`display:flex; gap:10px`): item Nunito 700, 16px, `padding:9px 18px; border-radius:999px`. Item aktif: teks `#F06BA8`, bg `#FCE3EE`. Non-aktif: teks `#6E3B57`, bg transparan. Urutan: Irama Hari · Akar Keluarga · **Bekal** (aktif) · Jurnal dan Galeri · Panen.
- **Kanan**: avatar 46×46, `border-radius:50%; background:#F06BA8`, inisial "B" (Fredoka 700, 19px, putih), rata tengah.

### 2. Hero (rata tengah, berdekorasi)
Wrapper `position:relative; text-align:center; padding:10px 40px 6px`.
- **4 dekorasi botani** (komponen Botanical) diposisikan absolut mengapit judul, tiap-tiap bergoyang bergantian (`sway` / `sway2`):
  - kiri: `left:44px; top:22px; 78×126` (deco1) dan `left:150px; top:104px; 52×88` (deco3)
  - kanan: `right:44px; top:14px; 84×134` (deco2) dan `right:158px; top:106px; 50×84` (deco4)
- **Badge DRAF**: inline-flex, `background:#FCEFC2; border-radius:999px; padding:9px 20px`, Nunito 700, 15px, `#A9791C`. Teks: `DRAF · menunggu review Psikolog Fitri Effendy sebelum rilis`.
- **H1**: "Jelajah Bekal" — Fredoka 700, 56px, `#6E3B57`, `letter-spacing:-1px; margin-top:22px`.
- **Sub**: "untuk Rakha · Bekal 0–1 tahun" — Nunito 700, 19px, `#B79FAF; margin-top:8px`.
- **Paragraf**: `max-width:860px; margin:22px auto 0`, Nunito 600, 19px, `line-height:1.62`, `#8A6F86`. Teks:
  > Bekal mengajak Ayah Bunda memilih dari tiga hal: kebiasaan sehari-hari yang merawat nilai keluarga, kegiatan bersama anak, dan bacaan pendamping sebagai wawasan tumbuh. Tidak ada yang harus diselesaikan semuanya — pilih yang terasa pas, dan yang sedikit tapi rutin lebih berarti daripada banyak sekaligus.

### 3. Tabs
`display:flex; justify-content:center; gap:38px; margin-top:34px; border-bottom:2px solid #F0E3D2`.
- Tiap tab: Fredoka 600, 20px, `padding-bottom:14px; margin-bottom:-2px; cursor:pointer`.
- Aktif: teks `#F06BA8`, `border-bottom:3px solid #F06BA8`. Non-aktif: teks `#B79FAF`, border transparan.
- Tab: **Kebiasaan Baik** · **Ajak Main** · **Wawasan Tumbuh**. Default aktif: Kebiasaan Baik.

### 4. Section Head
- Eyebrow: "BEKAL" — Nunito 800, 15px, `letter-spacing:1.5px`, `#F06BA8; margin-top:40px`.
- H2 (judul kategori aktif): Fredoka 700, 60px, `#6E3B57`, `letter-spacing:-1.2px; margin-top:8px`.
- Sub kategori: `max-width:1100px`, Shantell Sans 600, 23px, `line-height:1.5`, `#F06BA8; margin-top:14px`.

### 5. Board Kolase Kartu Nilai
Kontainer papan: `position:relative; margin-top:30px; height:{boardH}px; border-radius:30px; border:2px dashed rgba(110,59,87,.09)`.
Background papan (grid halus):
```
background:
  linear-gradient(rgba(110,59,87,.055) 1px, transparent 1px) 0 0 / 48px 48px,
  linear-gradient(90deg, rgba(110,59,87,.055) 1px, transparent 1px) 0 0 / 48px 48px,
  #FFFBF4;
```
Kartu ditempatkan **absolut** dalam kolase 2 baris × 6 kolom yang saling tumpang-tindih & miring ringan (lihat "Perhitungan Layout Kartu").

**Struktur satu kartu** (lebar 230px, rata tengah teks):
- Wrapper posisi: `position:absolute; left; top; z-index; width:230px` + animasi masuk `cardIn`. Saat hover, wrapper naik ke `z-index:60`.
- Lapisan gerak: `animation: floatBob …` (mengambang) + `filter` drop-shadow (hanya kartu bertepi perangko).
- Body kartu: `background:#fff; width:230px; padding:24px 22px 22px; text-align:center; cursor:pointer`. `border-radius` 22px (kartu biasa) atau 10px (kartu perangko). `transition: transform .42s cubic-bezier(.2,.8,.25,1), box-shadow .42s ease`. Rest state: `transform: rotate(<rot>deg)`.
  - **Disc bunga**: 72×72 (di kolase 64×64), `border-radius:50%`, bg = warna *soft* nilai (lihat token), rata tengah, berisi komponen **Bunga** ukuran ~46–50px. `transition: transform .5s`. Hover disc: `transform: rotate(28deg) scale(1.07)`.
  - **Nama**: Fredoka 700, 20px, `#6E3B57`, `letter-spacing:-.3px; margin-top:15px`.
  - **Deskripsi**: Nunito 600, 13.5px, `line-height:1.42`, `#93798C; margin-top:6px; min-height:38px`.
  - **Pill**: inline-flex, `margin-top:14px; padding:6px 14px; border-radius:999px`, Nunito 800, 12px. Warna teks = *ink* nilai, bg = *soft* nilai. Untuk nilai yang sudah tertanam ("planted"), pill hijau: teks `#2E8B57`, bg `#E4F3E8`, teks "Di taman keluarga".
- **Hover body kartu**: `transform: translateY(-15px) scale(1.04) rotate(0deg)` (miring diluruskan) + `box-shadow:0 34px 46px -26px rgba(90,50,70,.5)`.

**Kartu bertepi perangko (postage-stamp)** — diterapkan pada kartu ganjil (index 1,3,5,…). Tepi bergerigi dibuat via CSS mask di keempat sisi; ganti `box-shadow` dengan `filter: drop-shadow(...)` agar bayangan mengikuti bentuk gerigi:
```css
--r: 7px;
-webkit-mask:
  radial-gradient(var(--r) at 50% 0, #0000 98%, #000) 0 0 / calc(4*var(--r)) 100%,
  radial-gradient(var(--r) at 50% 100%, #0000 98%, #000) 0 0 / calc(4*var(--r)) 100%,
  radial-gradient(var(--r) at 0 50%, #0000 98%, #000) 0 0 / 100% calc(4*var(--r)),
  radial-gradient(var(--r) at 100% 50%, #0000 98%, #000) 0 0 / 100% calc(4*var(--r));
-webkit-mask-composite: source-in;   /* standar: mask-composite: intersect; */
filter: drop-shadow(0 18px 20px rgba(90,50,70,.20));
```
Kartu genap (0,2,4,…): tanpa mask, `border-radius:22px`, `box-shadow:0 20px 34px -22px rgba(90,50,70,.42)`.

### 6. Footer note
`text-align:center; margin-top:46px`, Shantell Sans 600, 18px, `#C7A9BE`. Teks: "arahkan kursor ke bunga — pilih yang terasa dekat, lalu tanam di taman keluarga".

## Perhitungan Layout Kartu (kolase)
Untuk N kartu, 6 kolom, 2 baris:
```
COLS = 6; cardW = 230; innerW = 1332; step = 196;
offsetX = (innerW - ((COLS-1)*step + cardW)) / 2;   // ≈ 8
rowBase = [0, 340];                                  // top dasar per baris
topsP   = [22, 68, 6, 74, 28, 58];                   // offset top per kolom (efek zig-zag)
rotsP   = [-4, 3, -3, 4, -2, 3];                     // rotasi rest per kolom (derajat)
durP    = [6.4, 5.6, 7.2, 6, 6.8, 5.9];              // durasi floatBob per kolom (detik)

Untuk kartu index i:
  row = floor(i / 6); col = i % 6;
  left = round(offsetX + col*step);
  top  = rowBase[row] + topsP[col];
  z    = i + 2;
  isStamp = (i % 2 === 1);
  floatDelay = i * 0.22 s;   inDelay = i * 0.05 s;
boardH = rowBase[rowsUsed-1] + max(topsP) + 262;      // untuk 12 kartu ≈ 340+74+262 = 676
```
Kartu saling tumpang-tindih karena `step (196) < cardW (230)`; itu disengaja.

## Interactions & Behavior
- **Ganti tab**: klik tab → set `tab` aktif → papan me-render ulang set kartu kategori itu, kartu masuk lagi dengan animasi `cardIn` bertahap.
- **Hover kartu**: kartu terangkat & lurus (`translateY(-15px) scale(1.04) rotate(0)`), bayangan membesar, dinaikkan ke depan (`z-index:60`), dan bunga di disc berputar `rotate(28deg) scale(1.07)`.
- **(Belum diimplementasikan, niatnya)** klik kartu → membuka detail nilai / aksi "tanam di taman keluarga". Footer note mengisyaratkan alur ini.

## Motion / Animasi (keyframes)
```css
@keyframes sway     { 0%,100%{ transform: rotate(-3deg) } 50%{ transform: rotate(3deg) } }   /* 8s ease-in-out infinite */
@keyframes sway2    { 0%,100%{ transform: rotate(3deg) }  50%{ transform: rotate(-3deg) } }   /* 9s (arah berlawanan) */
@keyframes floatBob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-11px) } }/* per-kartu, durasi durP[col], delay i*0.22s */
@keyframes cardIn   { 0%{ opacity:0; transform: translateY(30px) scale(.94) } 100%{ opacity:1; transform: translateY(0) scale(1) } }/* .55s cubic-bezier(.2,.8,.25,1), delay i*0.05s, fill both */
```
Ada **flag `motion` (boolean, default true)**. Jika mati: `sway`/`sway2`/`floatBob`/`cardIn` semuanya `none` (hormati `prefers-reduced-motion` juga).

## State Management
- `tab: 'kebiasaan' | 'main' | 'wawasan'` — kategori aktif. Default `'kebiasaan'`.
- `motion: boolean` — prop tampilan (default true).
- Data konten (per tab) statis di komponen (lihat "Data Konten"). Di produksi, ambil dari API/CMS anak yang dipilih.

## Data Konten

### Palet per-nilai (ink = warna teks pill, soft = warna disc & bg pill)
| nilai | soft | ink |
|---|---|---|
| kejujuran | `#E6ECFC` | `#4A6BD6` |
| syukur | `#FFF3D0` | `#B98900` |
| kasih-sayang | `#F1ECFB` | `#8A6DC7` |
| empati | `#FCE7F0` | `#D9639A` |
| kemandirian | `#FFF3D0` | `#B98900` |
| tanggung-jawab | `#F1ECFB` | `#8A6DC7` |
| kesederhanaan | `#FCE3EE` | `#E0428A` |
| cinta-ilmu | `#E4EFFD` | `#4A72D6` |
| sabar | `#E4EFFD` | `#4A72D6` |
| berbagi | `#E6ECFC` | `#4A6BD6` |
| keberanian | `#FCE3EE` | `#E0428A` |
| hormat-sesama | `#FFF3D0` | `#B98900` |
| *(planted / hijau)* | `#E4F3E8` | `#2E8B57` |

### Tab "Kebiasaan Baik"
- Judul: "Kebiasaan Baik"
- Sub: "Ini bukan daftar yang harus dituntaskan. Pilih satu-dua nilai yang paling dekat dengan jiwa keluarga, lalu latih kebiasaannya pelan-pelan."
- Kartu (12) — `{nilai, nama, deskripsi, jumlah kebiasaan (n), planted?}`:
  1. kejujuran · "Kejujuran" · "Bicara apa adanya, tanpa takut" · n=2 · **planted** *(faded — lihat catatan)*
  2. syukur · "Syukur" · "Melihat yang baik, menghargai yang ada" · n=2 · **planted**
  3. kasih-sayang · "Kasih Sayang" · "Hadir dengan hangat dan tulus" · n=4
  4. empati · "Empati" · "Merasakan apa yang dirasakan orang lain" · n=2
  5. kemandirian · "Kemandirian" · "Mencoba sendiri, bangkit, mencoba lagi" · n=3
  6. tanggung-jawab · "Tanggung Jawab" · "Milikku, aku yang jaga" · n=1
  7. kesederhanaan · "Kesederhanaan" · "Cukup adalah hadiah" · n=2
  8. cinta-ilmu · "Cinta Ilmu" · "Bertanya adalah petualangan" · n=6
  9. sabar · "Sabar" · "Menunggu adalah bagian dari tumbuh" · n=3
  10. berbagi · "Berbagi" · "Ada lebih banyak kebahagiaan saat dibagi" · n=4
  11. keberanian · "Keberanian" · "Takut boleh, tapi tetap maju" · n=3
  12. hormat-sesama · "Hormat pada Sesama" · "Setiap orang layak diperlakukan baik" · n=4
- Pill: jika `planted` → hijau "Di taman keluarga"; jika tidak → "`n` kebiasaan" dengan warna nilai.
- **Catatan**: pada iterasi terakhir kartu ini tampil penuh warna. (Varian "faded" untuk nilai yang sudah tertanam pernah dibuat: `opacity:.62`, kartu & disc bg `#F6EEDF`, nama `#B9A9B3`, deskripsi `#C4B6BE`, tanpa bayangan. Opsional untuk membedakan yang sudah tertanam.)

### Tab "Ajak Main"
- Judul: "Ajak Main"
- Sub: "Kegiatan kecil yang bisa dilakukan bersama—ringan, menyenangkan, dan diam-diam menumbuhkan."
- Kartu (5) — `{nilai, nama, deskripsi, pill}`:
  1. kasih-sayang · "Peluk Pagi" · "Mulai hari dengan pelukan dan tatapan hangat" · pill "5 menit"
  2. empati · "Tebak Rasa" · "Tebak perasaan tokoh dalam buku cerita" · pill "sambil membaca"
  3. kemandirian · "Pakai Baju Sendiri" · "Beri waktu, tahan diri untuk tak membantu" · pill "harian"
  4. syukur · "Satu Syukur Malam" · "Sebut satu hal baik sebelum tidur" · pill "malam"
  5. cinta-ilmu · "Satu Pertanyaan" · "Sambut rasa ingin tahunya dengan antusias" · pill "harian"

### Tab "Wawasan Tumbuh"
- Judul: "Wawasan Tumbuh"
- Sub: "Bacaan pendamping singkat untuk memahami apa yang sedang tumbuh di tahun pertama."
- Kartu (5) — `{nilai, nama, deskripsi, pill}`:
  1. cinta-ilmu · "Otak yang Dibangun" · "Kenapa tahun pertama begitu menentukan" · pill "5 mnt baca"
  2. kasih-sayang · "Ikatan Aman" · "Dasar rasa percaya anak pada dunia" · pill "4 mnt baca"
  3. sabar · "Ritme, Bukan Jadwal" · "Membaca isyarat bayi dengan tenang" · pill "6 mnt baca"
  4. empati · "Bahasa Perasaan" · "Menamai emosi anak sejak dini" · pill "5 mnt baca"
  5. keberanian · "Ruang Mencoba" · "Membiarkan anak jatuh kecil dengan aman" · pill "4 mnt baca"

## Komponen Bunga (kunci visual)
Setiap kartu memakai satu **bunga generatif** yang khas per `nilai`. Ada tiga komponen bunga dalam bundel:
- **`Bunga.dc.html`** — dipakai di kartu. Prop: `nilai` (id nilai di tabel atas), `ukuran` (px). Ia memetakan tiap `nilai` ke satu konfigurasi bunga (jumlah kelopak, bentuk kelopak, warna) dalam palet Rekah. **Gunakan ini sebagai spesifikasi bentuk bunga per nilai.**
- **`Flower.dc.html`** — renderer bunga low-level; menerima objek `cfg` (`shape`, `petalCount`, `budIndices`, `petalW`, `petalLen`, `centerR`, `petalColors`, `centerColors`, dst). Logo memakainya dengan config:
  `{ shape:'bud', petalCount:5, budIndices:[2,3], petalW:15, petalLen:34, centerR:15, jitter:0.05, spin:0, budColor:'#8FB8F7', petalColors:['#F06BA8','#8FB8F7','#F8B9D4','#5F84E6','#FFE29A'], centerColors:['#6E3B57','#F06BA8','#8FB8F7'] }`
- **`Botanical.dc.html`** — bunga bertangkai untuk dekorasi hero. Prop `cfg` dengan `type` (`'tulip'|'daisy'|'fivepetal'|'bell'`) + warna. Config yang dipakai:
  - deco1 `{ type:'tulip', bloom:'#F06BA8', bloom2:'#F8B9D4', center:'#6E3B57' }`
  - deco2 `{ type:'daisy', bloom:'#5F84E6', bloom2:'#8FB8F7', center:'#FFE29A' }`
  - deco3 `{ type:'fivepetal', bloom:'#F8B9D4', center:'#F06BA8' }`
  - deco4 `{ type:'bell', bloom:'#8FB8F7', bloom2:'#5F84E6' }`

Semua bunga dirender sebagai **SVG**. Buka file-file itu untuk melihat geometri persisnya; port ke SVG/komponen di codebase Anda. Ekspor SVG statis juga tersedia di folder proyek `svg-bunga/` bila lebih mudah dipakai sebagai aset.

## Design Tokens

### Warna
- Krem latar luar: `#ECE3D4` · panel: `#FBEFDF` · board fill: `#FFFBF4`
- Plum (teks utama / heading): `#6E3B57`
- Pink brand: `#F06BA8` · pink soft bg: `#FCE3EE` / `#FCEFC2` (kuning DRAF)
- Biru: corn `#5F84E6`, sky `#8FB8F7`; lilac `#C9B8F0`; butter `#FFE29A`; peony `#F8B9D4`
- Teks sekunder: `#8A6F86` · muted: `#B79FAF` · deskripsi kartu: `#93798C` · footer: `#C7A9BE`
- Hijau "tertanam": ink `#2E8B57`, soft `#E4F3E8`
- Garis: border top-bar `#F3E7D6`, garis tab `#F0E3D2`
- Palet per-nilai: lihat tabel di atas.

### Tipografi (Google Fonts)
- **Fredoka** (400–700) — heading, nama, logo, tab.
- **Nunito** (400/600/700/800) — body, nav, deskripsi, pill.
- **Shantell Sans** (500–700) — teks aksen tulisan-tangan (sub kategori, footer).

### Radius
- Panel 34px · board 30px · kartu biasa 22px · kartu perangko 10px · disc/avatar 50% · pill/nav/badge 999px.

### Bayangan
- Panel: `0 30px 60px -44px rgba(90,50,70,.6)`
- Kartu biasa: `0 20px 34px -22px rgba(90,50,70,.42)` · hover: `0 34px 46px -26px rgba(90,50,70,.5)`
- Kartu perangko: `filter: drop-shadow(0 18px 20px rgba(90,50,70,.20))`

### Spacing kunci
Padding panel dalam `30px 56px`; gap nav 10px, grup logo-nav 44px; tab gap 38px; margin antar-blok 8–46px seperti dirinci di atas.

## Responsive behavior
Desain sumber fixed 1440px dengan kartu absolut. Saran untuk web:
- ≥1200px: pertahankan kolase absolut seperti spesifikasi.
- 768–1199px: alihkan ke grid rapi (mis. `repeat(3, 1fr)` atau `repeat(2, 1fr)`), buang `left/top/rotate/z` absolut, pertahankan gaya kartu + hover. Efek perangko boleh tetap.
- <768px: satu kolom, kartu penuh-lebar, tepi perangko boleh disederhanakan; nav jadi menu/scroll horizontal.
- Hormati `prefers-reduced-motion` → matikan `floatBob`/`sway`/`cardIn`.

## Assets
- Google Fonts: Fredoka, Nunito, Shantell Sans.
- Grafik bunga: komponen `Bunga` / `Flower` / `Botanical` (SVG generatif) — sertakan atau port. Ekspor statis di `svg-bunga/`.
- Tidak ada gambar raster; semua vektor/CSS.

## Files (dalam bundel ini)
- `Canvas-3.dc.html` — halaman Jelajah Bekal lengkap (referensi utama).
- `Bunga.dc.html` — pemetaan nilai → konfigurasi bunga (spek bentuk per nilai).
- `Flower.dc.html` — renderer bunga low-level (SVG).
- `Botanical.dc.html` — bunga dekoratif bertangkai (hero).
- `Flower`/`Bunga`/`Botanical` bergantung pada runtime `.dc.html`; baca sebagai spesifikasi, bukan untuk dipakai apa adanya.
