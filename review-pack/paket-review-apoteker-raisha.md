# Paket Review — Apoteker Raisha
**Dihasilkan:** 18 Juli 2026
**Tujuan:** Memastikan tidak ada konten kesehatan/medis yang keliru atau menyesatkan di modul Rekah sebelum rilis.

---

## Konteks

Dari komentar di `activityModules.ts`:

> "Modul dengan topik kesehatan/medis (SIDS, MPASI, imunisasi, dll.) **DILEWATI** — jalur review Apoteker/Dokter sebelum dimasukkan ke Rekah."

Dokumen ini memenuhi dua tujuan:
1. **Scan pasif** — memastikan 36 modul yang sudah ada tidak mengandung klaim medis yang tidak tepat
2. **Roadmap** — mendokumentasi topik kesehatan yang dilewati dan langkah agar bisa masuk ke Rekah

---

## 1. Scan Kata Kunci Kesehatan

Kata kunci yang dipindai: `obat` · `vitamin` · `suplemen` · `dosis` · `alergi` · `demam` · `MPASI` · `ASI` · `imunisasi` · `dokter`


### Hasil: 1 modul mengandung kata kunci


#### [`am-005`] Bermain Pura-Pura

**Kata kunci ditemukan:** `dokter`

**Status:** `published` | **Usia:** 19-24, 25-36 | **Nilai:** sosial

**Konteks kemunculan:**
```
"Masak-masakan" atau "dokter-dokteran" membantu anak memproses pengalaman nyata dan berlatih kehidupan sosial.
Beri karakter emosi yang nyata: "Dokternya baik sekali, pasiennya jadi tidak takut."
Mainan dokter atau dapur (opsional)
```

**Rekomendasi Raisha:** ___________________________________________


---

## 2. Topik Kesehatan yang DILEWATI (Daftar Eksklusi)

Topik-topik ini secara eksplisit diidentifikasi sebagai memerlukan review Apoteker/Dokter.
Belum ada satu pun yang masuk ke modul Rekah saat ini.

| Topik | Risiko Utama | Status |
|-------|-------------|--------|
| Tidur aman (SIDS) | Saran posisi tidur yang salah dapat membahayakan bayi | ⏳ Menunggu review |
| ASI & menyusui | Misinformasi suplementasi, durasi, atau pemberhentian | ⏳ Menunggu review |
| MPASI (6+ bulan) | Tekstur, alergen, jadwal yang salah | ⏳ Menunggu review |
| Gigi & kebersihan mulut | Timing, teknik, pasta gigi fluor | ⏳ Menunggu review |
| Pertumbuhan & berat badan | Interpretasi grafik, underfeeding/overfeeding | ⏳ Menunggu review |
| Imunisasi | Jadwal, efek samping, mitos | ⏳ Menunggu review |
| Deteksi dini (Skrining perkembangan) | Penggunaan alat KPSP/M-CHAT yang tidak tepat | ⏳ Menunggu review |

---

## 3. Panduan Memasukkan Topik Kesehatan ke Rekah

Untuk setiap topik di atas, sebelum masuk ke Rekah:

1. **Draft konten** dibuat oleh tim Rekah berdasarkan panduan Kemenkes/AAP/WHO
2. **Review Apoteker Raisha** — periksa akurasi, kontraindikasi, bahasa aman
3. **Review Psikolog Fitri** — periksa framing psikologis dan bahasa tanpa tekanan
4. **Tandai** `status: 'review'` → setelah kedua review selesai → `status: 'published'`
5. Tambahkan `sumberIds` yang relevan (contoh: `kemenkes-kia-kpsp`, `who-growth`, `aap-healthychildren`)

---

## 4. Sumber Referensi yang Sudah Terdaftar di Modul

Sumber yang sudah muncul di `sumberIds` modul-modul aktif:

| ID Sumber | Muncul di (jumlah modul) |
|-----------|--------------------------|
| `aap-healthychildren` | 8 modul |
| `kemenkes-kia-kpsp` | 5 modul |
| `harvard-serve-return` | 4 modul |
| `asha` | 4 modul |
| `cdc-act-early` | 3 modul |
| `harvard-brain` | 2 modul |
| `aap-aasm-sleep` | 1 modul |
| `aap-media` | 1 modul |

_Modul tanpa sumber: 16 dari 36_

---

## 5. Checklist Sebelum Rilis

- [ ] Scan kata kunci di atas sudah diperiksa — semua konteks aman
- [ ] Tidak ada saran dosis, waktu pemberian obat, atau prosedur medis di modul
- [ ] Modul dengan `avoid` yang menyebut praktik medis sudah dikonfirmasi akurat
- [ ] Roadmap topik kesehatan (bagian 2) sudah dikomunikasikan ke Raisha dan Fitri
- [ ] Disclaimer yang tepat sudah ada di halaman yang relevan (FAQ landing: "Rekah bukan pengganti dokter atau psikolog")

_Paket ini dihasilkan dari 36 modul · scan: 10 kata kunci · 1 hit_
