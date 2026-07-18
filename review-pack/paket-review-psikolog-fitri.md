# Paket Review — Psikolog Fitri Effendy

**Dihasilkan:** 18 Juli 2026
**Status semua modul:** draft (belum rilis)
**Kata terlarang yang harus TIDAK MUNCUL:** normal · seharusnya · tertinggal · terlambat · rata-rata · streak · skor · peringkat · target · milestone (sebagai rapor)

> Dokumen ini dihasilkan otomatis dari source code — setiap perubahan di copy files akan tercermin saat skrip dijalankan ulang.

---

## Petunjuk Review

Untuk setiap teks di bawah, periksa:
1. **Tidak ada bahasa perbandingan** — tidak ada kata terlarang di atas
2. **Nada aman secara psikologis** — tidak menghakimi, tidak menimbulkan rasa bersalah
3. **Sesuai konteks budaya Indonesia** — bahasa dekat, tidak formal berlebihan
4. **Akurasi konten perkembangan** — kenapaIni, avoid, amati mencerminkan literatur yang tepat
5. **Nada sinyal lelah (⚠️ di bawah)** — area paling sensitif, review terlebih dahulu

Tandai setiap item: ✅ OK · ✏️ Perlu revisi (tulis catatan) · ❌ Ganti

---

## ⚠️ PRIORITAS TERTINGGI — Sinyal Caregiver Lelah (Jejak Mekar)

> Area caregiver well-being — paling sensitif. Review ini sebelum bagian lain.
>
> **Konteks:** Kartu ini muncul di halaman Jejak Mekar jika `moodCaregiver === 'lelah'` mendominasi (>50% dari ≥5 entri refleksi).
>
> **DILARANG:** insight yang membandingkan keluarga lain, norma usia, atau "minggu terbaik/terburuk".

| Field | Teks |
|-------|------|
| `sinyalLelahJudul` | Kamu banyak menemani dalam keadaan lelah |
| `sinyalLelahBody` | Terima kasih sudah hadir 💗 Rencana pekan depan bisa kita ringankan. |
| `sinyalLelahCTA` | Ringankan pekan depan |
| `sinyalLelahToggleNote` | Rencana akan menyesuaikan energimu. |

**Catatan Review Fitri:** ___________________________________________

---

## Bagian A: Copy & Bahasa


### A1. Landing Page (`rekahLandingCopy.ts`)

#### A1.1 Hero
| Field | Teks |
|-------|------|
| `hero.h1` | Setiap anak mekar / pada waktunya. |
| `hero.body` | Rekah tidak akan pernah memberi tahu kamu anakmu tertinggal — karena tidak ada yang perlu dikejar. Kami membantumu menanam nilai yang kamu pilih, lewat satu langkah kecil setiap hari. |
| `hero.cta` | Mulai Merekah |
| `hero.trust` | Dikurasi Psikolog & Apoteker ✓ |

#### A1.2 Masalah
| # | Teks |
|---|------|
| 1 | Kebanjiran konten parenting yang saling bertentangan — tak tahu mana yang harus dipercaya. |
| 2 | Checklist milestone yang terasa seperti rapor — bukan panduan, malah tekanan. |
| 3 | Teori banyak, tapi bingung "harus ngomong apa sekarang" ke si kecil. |

#### A1.3 Cara (Langkah)
- **Akar Keluarga:** Pilih 2 nilai yang ingin kamu tanam: mandiri, empatik, percaya diri, regulasi emosi, komunikatif, atau sosial.
- **Rencana Pekan Ini:** Terima rencana mingguan yang dipersonalisasi lewat WhatsApp — disusun dari nilai pilihanmu dan usia si kecil.
- **Langkah Kecil:** Setiap hari: satu insight, satu aktivitas 5–10 menit, dan satu kalimat siap pakai.
- **Cerita Hari Ini:** Refleksi 30 detik. Setiap momen dirayakan — tidak ada yang dikejar.
- **Penutup:** Tidak ada dua keluarga dengan rencana yang sama.

#### A1.4 Kepercayaan
- **Isi:** Prinsip Rekah lahir dari Sekolah Studiva di Bukittinggi — sekolah untuk anak berkebutuhan khusus di bawah pengawasan psikolog klinis — tempat "setiap anak berkembang di jalurnya sendiri" dipraktikkan setiap hari, bukan sekadar slogan. Prinsip itu kini dibawa untuk semua keluarga Indonesia.
- **Nama kurator:** Psikolog Fitri Effendy
- **Peran kurator:** Penjaga kurasi seluruh konten Rekah — memastikan setiap panduan aman, berbasis riset, dan sesuai budaya Indonesia.

#### A1.5 FAQ
**Q1:** Apakah Rekah aplikasi untuk anak berkebutuhan khusus?
**A1:** Bukan — Rekah untuk semua orang tua. Justru prinsip inklusif yang menjadi fondasi Rekah membuat pengalamannya lebih tenang dan tanpa tekanan untuk setiap keluarga.

**Q2:** Berapa biayanya?
**A2:** Program awal (concierge) gratis untuk peserta terbatas.

**Q3:** Bagaimana rencana dikirim?
**A3:** Via WhatsApp, setiap awal pekan.

**Q4:** Apakah ini pengganti dokter atau psikolog?
**A4:** Tidak — Rekah adalah pendamping harian. Untuk kekhawatiran perkembangan, kami selalu mengarahkan kamu berkonsultasi dengan profesional.



### A2. Onboarding (`rekahOnboardingCopy.ts`)

#### A2.1 Step 1 — Sambutan
| Field | Teks |
|-------|------|
| heading | Kenalan dulu, yuk 🌸 |
| body | Lima langkah singkat supaya Rekah bisa menemanimu dengan cara yang paling pas untuk keluargamu. |
| cta | Mulai |

#### A2.2 Step 2 — Profil Anak
| Field | Teks |
|-------|------|
| heading | Siapa yang akan kita temani? |
| labelNama | Siapa nama panggilan si kecil? |
| placeholderNama | mis. Kaka, Adek, Bumi… |
| labelTanggal | Kapan ia lahir? |
| konfirmasiUsia | _(fn)_ → [nama], [bulan] bulan 🌱 |
| usiaLunak | _(fn)_ → Saat ini Rekah menemani usia 0–36 bulan. Kami sedang menyiapkan musim untuk usia selanjutnya 🌸 |
| tanggalMasaDepan | Tanggal lahir tidak bisa di masa depan ya. |

#### A2.3 Step 3 — Tentang Si Kecil
| Field | Nilai |
|-------|-------|
| heading | Cerita sedikit tentang si kecil |
| subheading | Semua pertanyaan di langkah ini opsional — lewati kapan saja. |
| labelTemperamen | Bagaimana si kecil biasanya? |

**Temperamen options:**
- **tenang** 🍃: Tenang — Mudah beradaptasi, suka ritme yang perlahan
- **aktif** ⚡: Aktif — Penuh energi, selalu ingin bergerak
- **sensitif** 🌸: Sensitif — Peka terhadap lingkungan dan perasaan
- **campuran** 🌈: Campuran — Tergantung situasi dan waktu

| Field | Teks |
|-------|------|
| labelTantangan | Yang lagi menantang akhir-akhir ini… |
| placeholderTantangan | Yang lagi menantang akhir-akhir ini… (opsional) |

#### A2.4 Step 4 — Tentang Caregiver
| Field | Teks |
|-------|------|
| heading | Dan tentang kamu? |
| labelNama | Apa nama panggilanmu? |
| placeholderNama | mis. Mama, Bunda, Ayah, Oma… |
| labelEnergi | Bagaimana energimu akhir-akhir ini? |
| energiNote | Jawaban ini membantu kami menakar rencana — bukan menilai kamu. |

**Energi options:**
- **penuh** 🔋: Penuh — Siap dan semangat
- **cukup** 🙂: Cukup — Bisa, walau perlu diatur
- **menipis** 🕯️: Menipis — Butuh langkah-langkah yang lebih ringan

#### A2.5 Step 5 — Akar Keluarga
| Field | Teks |
|-------|------|
| heading | Anak seperti apa yang ingin kamu bantu tumbuh? |
| subheading | Pilih 2 nilai untuk Musim pertamamu — 4 minggu ke depan. Nanti bisa ganti di Musim berikutnya. |
| warningDua | Pilih dua dulu ya — fokus itu kekuatan 🌸 |
| cta | Tanam Akar Keluargaku |

#### A2.6 Perayaan & Beranda
| Field | Teks |
|-------|------|
| celebration.heading | Akarnya tertanam! |
| celebration.subheading | _(fn)_ → Musim [nilai1] & [nilai2] dimulai hari ini 🌱 |
| celebration.cta | Lihat berandaku |
| beranda.musimHeader | _(fn)_ → Musim ini: menanam [nilai1] & [nilai2] |
| beranda.langkahKecilJudul | Langkah Kecil hari ini |
| beranda.langkahKecilIsi | Sedang disiapkan untuk Musimmu 🌱 |


### A3. Deskripsi Singkat Nilai (`NILAI_COPY`)

| ID | Emoji | Deskripsi Singkat |
|----|-------|------------------|
| mandiri | 🌿 | Percaya bahwa ia bisa sendiri |
| empatik | 💗 | Peduli pada perasaan orang lain |
| percaya-diri | ✨ | Berani mencoba hal baru |
| regulasi-emosi | 🌊 | Mengenal dan mengelola perasaan |
| komunikatif | 🗣️ | Mengungkapkan dirinya dengan jelas |
| sosial | 🤝 | Senang bermain dan berbagi |


### A4. Rencana Pekan (`rekahPlanCopy.ts`)

| Field | Teks |
|-------|------|
| judulHalaman | Rencana Pekan Ini |
| pekanLabel | _(fn)_ → Pekan undefined |
| langkahCount | _(fn)_ → undefined langkah kecil untuk pekan ini |
| kenapaIniLabel | Kenapa ini penting? |
| sumberLabel | Sumber |
| langkahSectionLabel | Langkah-langkahnya |
| scriptLabel | Kalimat yang bisa kamu pakai |
| avoidLabel | Yang sebaiknya dihindari |
| amatiLabel | Amati |
| selesaiCTA | Tandai selesai |
| selesaiCelebration | Merekah! 🌸 |
| belumPasLabel | Belum pas hari ini |
| poolTipisNote | Kami sedang menambahkan lebih banyak aktivitas untuk usia ini. Rencana pekan ini dari yang tersedia. |
| semuaSelesaiJudul | Pekan ini penuh mekar! |
| semuaSelesaiSub | Rencana barumu terbit hari Senin. |
| shareText | _(fn)_ → 🌸 *[judul]*  [langkahSingk]  _"[script]"_  — dari Rekah, panduan tumbuh kembang anak |


### A5. Refleksi & Cerita Hari Ini (`rekahRefleksiCopy.ts`)

| Field | Teks |
|-------|------|
| judulCerita | Cerita Hari Ini |
| sub | _(fn)_ → Bagaimana undefined hari ini? |
| responsLabel | _(fn)_ → Bagaimana respons undefined? |

**responsOptions:**
- **seru** 🎉: Seru & terlibat
- **menantang** 💪: Menantang, tapi jadi
- **belum-tertarik** 🌱: Belum tertarik

| Field | Teks |
|-------|------|
| **responsPengantar** | Ketiganya sama-sama berarti — semua respons adalah informasi, bukan nilai. |
| **belumTertarikNote** | Kadang memang belum waktunya, dan itu juga bagian dari tumbuh 🌱 |
| moodLabel | Dan kamu sendiri? |
| moodSub | Opsional — hanya untuk dirimu sendiri. |

**moodOptions:**
- **lega** 🙂: Lega
- **biasa** 😌: Biasa
- **lelah** 🕯️: Lelah

| Field | Teks |
|-------|------|
| catatanLabel | Ada momen kecil yang mau disimpan? |
| catatanPlaceholder | Tulis sesukamu… |
| simpanKeJurnalLabel | Simpan juga ke Jurnal 📖 |
| simpanCTA | Simpan cerita |


### A6. Jejak Mekar — Copy Umum (`rekahJejakCopy.ts`)

_(Sinyal caregiver lelah sudah dibahas di ⚠️ PRIORITAS TERTINGGI di atas.)_

| Field | Teks |
|-------|------|
| judulHalaman | Jejak Mekar |
| sub | Pola milik keluargamu — bukan rapor. |
| bungaCaption | Setiap kelopak adalah satu momen yang kalian tanam. |
| bungaLabel | _(fn)_ → Nilai undefined |
| momenJudul | Momen Tersimpan |
| momenEmpty | Momen-momen kecil kalian akan terkumpul di sini 🌸 |
| statusMusim | _(fn)_ → Musim [nilai1] & [nilai2] — pekan ke-[pekan] dari 4 |
| polaBelumCukup | Pola akan muncul setelah kamu mencatat beberapa cerita. |
| polaResponDominan | _(fn)_ → Bulan ini, [namaAnak] paling sering terlihat seru saat aktivitas [domain]. |
| musimSebelumnyaLabel | Musim Sebelumnya |
| musimSebelumnyaEmpty | Musimmu yang pertama sedang berjalan 🌱 |


### A7. Penutup Musim (`rekahMusimCopy.ts`)

| Field | Teks |
|-------|------|
| triggerJudul | Musim pertamamu selesai 🌸 |
| triggerSub | Empat minggu sudah kamu tanam. Sekarang saatnya merayakan. |
| triggerCTA | Lihat Rangkuman Musim |
| rangkumanJudul | _(fn)_ → Empat minggu menanam [nilai1] & [nilai2]. |
| rangkumanLangkahLabel | _(fn)_ → undefined langkah selesai |
| rangkumanMomenLabel | Momen yang tersimpan |
| rangkumanMomenEmpty | Belum ada momen yang dicatat. |
| rangkumanCTA | Lanjut |
| refleksiJudul | Satu momen yang paling kamu syukuri |
| refleksiSub | Opsional — hanya untuk dirimu sendiri. |
| refleksiPlaceholder | Ceritakan sesukamu… |
| abadikanJurnalLabel | Abadikan Musim ini di Jurnal 📖 |
| refleksiCTA | Simpan & Lanjut |
| refleksiLewati | Lewati |
| pilihanJudul | Musim selanjutnya |
| lanjutkanSama | Lanjutkan nilai yang sama 🌱 |
| lanjutkanSamaSub | Nilai yang sama, cerita baru. |
| tanamanBaru | Tanam nilai baru ✨ |
| tanamanBaruSub | Pilih dua nilai baru untuk musim berikutnya. |
| konfirmasiGantiNilai | Ganti sekarang juga boleh — Musim-mu ikut dimulai ulang ya 🌱 |
| musimBaruMulai | Musim baru dimulai! 🌸 |


### A8. Data & Privasi (`rekahPrivacyCopy.ts`)

| Field | Teks |
|-------|------|
| judulSeksi | Data & Privasi |
| apaYangDisimpan | Kami menyimpan profil anak dan caregiver yang kamu isi, langkah-langkah yang selesai dikerjakan, catatan refleksi singkat setelah setiap langkah, dan entri jurnal yang kamu tulis sendiri. |
| untukApa | Data ini hanya digunakan untuk menampilkan rencana dan jejak perkembanganmu. Catatan dan jurnal tidak dianalisis, tidak dibagi ke pihak lain, dan tidak digunakan untuk iklan. |
| hak | Kamu bisa menghapus semua data Rekah-mu kapan saja. |
| tombolHapus | Hapus semua data Rekah-ku |
| konfirmasiJudul | Yakin menghapus semua data? |
| konfirmasiBody | _(fn)_ → Langkah, refleksi, dan jurnal undefined akan dihapus permanen. Ketik nama undefined untuk konfirmasi. |
| konfirmasiPlaceholder | _(fn)_ → Ketik "undefined" |
| konfirmasiTombol | Ya, hapus semua |
| batalTombol | Batal |
| pesanBerhasil | Semua data Rekah sudah dihapus. Sampai jumpa lagi 🌱 |
| pesanGagal | Gagal menghapus data. Coba lagi ya. |

---

## Bagian B: Nilai Fokus (6 nilai)


### B — 🌿 Mandiri (`mandiri`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak mampu melakukan hal-hal sederhana sendiri sesuai usianya — bukan karena dipaksa, tapi karena dipercaya. |
| Deskripsi singkat (NILAI_COPY) | Percaya bahwa ia bisa sendiri |
| Warna | `#4E9C6E` |

**Catatan Review:** ___________________________________________


### B — 💗 Empatik (`empatik`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak belajar merasakan dan memahami perasaan orang lain — benih dari hubungan yang bermakna seumur hidup. |
| Deskripsi singkat (NILAI_COPY) | Peduli pada perasaan orang lain |
| Warna | `#E0526B` |

**Catatan Review:** ___________________________________________


### B — ✨ Percaya Diri (`percaya-diri`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak tumbuh dengan keyakinan bahwa dirinya cukup dan mampu — bukan dari pujian, tapi dari pengalaman berhasil mencoba. |
| Deskripsi singkat (NILAI_COPY) | Berani mencoba hal baru |
| Warna | `#F6B860` |

**Catatan Review:** ___________________________________________


### B — 🌊 Regulasi Emosi (`regulasi-emosi`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak belajar mengenali, mengungkapkan, dan mengelola perasaannya — dasar dari kesehatan mental jangka panjang. |
| Deskripsi singkat (NILAI_COPY) | Mengenal dan mengelola perasaan |
| Warna | `#5DADE2` |

**Catatan Review:** ___________________________________________


### B — 🗣️ Komunikatif (`komunikatif`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak dapat mengungkapkan kebutuhan, pikiran, dan perasaannya dengan cara yang jelas dan sesuai usianya. |
| Deskripsi singkat (NILAI_COPY) | Mengungkapkan dirinya dengan jelas |
| Warna | `#A78BFA` |

**Catatan Review:** ___________________________________________


### B — 🤝 Sosial (`sosial`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | Anak mampu bermain, berbagi, dan bekerja sama dengan orang lain — modal utama kehidupan di komunitas. |
| Deskripsi singkat (NILAI_COPY) | Senang bermain dan berbagi |
| Warna | `#34D399` |

**Catatan Review:** ___________________________________________


---

## Bagian C: Modul Aktivitas (36 modul)

> 📌 = tidak ada `sumberIds` — perlu konfirmasi sumber atau penambahan referensi sebelum rilis.


### C — 🌿 Mandiri (9 modul)


#### 📌 [`am-001`] Waktu Bebas di Lantai

| Meta | Nilai |
|------|-------|
| Status | `published` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 15 menit |
| Nilai utama | mandiri |
| Nilai pendukung | percaya-diri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Beri bayi ruang aman untuk menjelajahi dan bergerak tanpa diarahkan.

**Kenapa ini?** Ketika bayi diberi ruang bebas, ia melatih kemampuan memilih, fokus, dan mencoba tanpa diminta. Kepercayaan bahwa ia bisa sendiri tumbuh dari pengalaman kecil ini.

**Bahan:** Matras bersih, Satu atau dua mainan kontras


**Langkah-langkah:**
1. Pastikan area bermain aman dan bersih.
2. Letakkan bayi telungkup atau telentang di matras.
3. Taruh satu mainan dalam jangkauan tapi tidak langsung di tangannya.
4. Duduk di dekat — hadir tapi tidak mengarahkan.
5. Komentari dengan hangat apa yang ia lakukan: "Kamu meraih mainannya!"

**Script:** "Yuk eksplorasi dulu ya. Bunda/Ayah ada di sini."

**Hindari:** Terus-menerus mengarahkan atau membantu sebelum bayi mencoba sendiri.

**Amati:** Apa yang menarik perhatian bayi? Ke mana ia meraih atau bergerak?

**Tip Ayah/Bunda:** Tahan dorongan untuk membantu segera — jedah kecil memberi bayi waktu membangun rasa mampu.


**Catatan Review Fitri:** ___________________________________________


#### [`am-tummy-time`] Tummy Time: Angkat Kepala Sendiri

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan |
| Durasi | 5 menit |
| Nilai utama | mandiri |
| Nilai pendukung | percaya-diri |
| Sumber | cdc-act-early, kemenkes-kia-kpsp |

**Deskripsi:** Latihan telungkup yang memperkuat otot leher dan bahu — fondasi gerak mandiri bayi.

**Kenapa ini?** Setiap usaha mengangkat kepala adalah latihan pertama kemandirian fisik bayi. Otot yang kuat di sini menjadi fondasi untuk duduk, merangkak, dan akhirnya berjalan.



**Langkah-langkah:**
1. Pilih saat bayi dalam kondisi segar, bukan setelah makan.
2. Letakkan bayi telungkup di permukaan keras dan datar yang bersih.
3. Berlutut atau berbaring di depannya setinggi wajahnya.
4. Ajak bicara dengan nada hangat atau tunjukkan mainan warna cerah.
5. Mulai dari 3–5 menit; tingkatkan secara bertahap sesuai toleransi bayi.

**Script:** "Wah, kamu bisa angkat kepala! Hebat ya!"

**Hindari:** Meninggalkan bayi tanpa pengawasan saat telungkup. Memaksakan terlalu lama jika bayi sudah menangis atau gelisah.

**Amati:** Berapa lama ia menahan kepala? Apakah ia menoleh ke kiri dan kanan?



**Catatan Review Fitri:** ___________________________________________


#### [`am-motorik`] Bebas Menjelajah Ruang Aman

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 7–12 Bulan, 13–18 Bulan |
| Durasi | 15 menit |
| Nilai utama | mandiri |
| Nilai pendukung | percaya-diri |
| Sumber | kemenkes-kia-kpsp, cdc-act-early |

**Deskripsi:** Biarkan anak merangkak, memanjat, dan bergerak di lingkungan yang sudah dipastikan aman.

**Kenapa ini?** Gerak adalah cara berpikir bagi anak kecil. Setiap eksplorasi fisik membangun kepercayaan diri bahwa tubuhnya bisa melakukan hal-hal baru.



**Langkah-langkah:**
1. Pastikan area bebas dari benda berbahaya (sudut tajam, benda kecil, kabel).
2. Biarkan anak bergerak bebas tanpa diarahkan.
3. Ikuti dari dekat untuk keamanan tapi tanpa terus-menerus mencegah.
4. Bantu hanya jika ada risiko nyata, bukan sekadar kegagalan kecil.

**Script:** "Kamu bisa! Coba dulu ya."

**Hindari:** Terus-menerus berkata "hati-hati" atau "jangan" untuk hal yang sebetulnya aman. Ini bisa menghambat rasa berani mencoba.

**Amati:** Gerakan baru apa yang ia coba hari ini? Apa yang membuatnya bertahan mencoba?



**Catatan Review Fitri:** ___________________________________________


#### [`am-object-perm`] Petak Umpet Benda

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 7–12 Bulan, 13–18 Bulan |
| Durasi | 10 menit |
| Nilai utama | mandiri |
| Nilai pendukung | komunikatif |
| Sumber | kemenkes-kia-kpsp |

**Deskripsi:** Sembunyikan mainan di bawah kain dan biarkan anak mencarinya sendiri.

**Kenapa ini?** Memahami bahwa benda tetap ada meskipun tak terlihat adalah tonggak kognitif besar. Ini juga melatih ketekunan — fondasi kemandirian berpikir.

**Bahan:** Kain kecil atau handuk, Mainan favorit anak


**Langkah-langkah:**
1. Tunjukkan mainan ke anak, biarkan ia melihatnya jelas.
2. Tutup mainan dengan kain di depan matanya.
3. Tanya dengan nada penasaran: "Mana perginya ya?"
4. Beri jeda — biarkan ia mencari sendiri sebelum membantunya.
5. Saat ia menemukannya, rayakan bersama!

**Script:** "Mana perginya ya? Ayo cari!"

**Hindari:** Langsung membuka kain jika anak kelihatan bingung — beri waktu dulu.

**Amati:** Apakah ia langsung mencari, atau diam dulu? Ekspresinya saat menemukan?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-kemandirian-praktis`] Mencoba Hal Kecil Sendiri

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | mandiri |
| Nilai pendukung | percaya-diri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Biarkan anak mencoba keterampilan sehari-hari — memakai baju, makan sendiri, atau membereskan mainan.

**Kenapa ini?** Keterampilan hidup sederhana adalah latihan kemandirian yang paling nyata. Biarkan prosesnya tidak sempurna — itulah tempat pembelajaran terjadi.



**Langkah-langkah:**
1. Pilih satu keterampilan kecil yang sesuai usia: pakai sepatu, makan dengan sendok, atau masukkan mainan ke wadah.
2. Tunjukkan caranya sekali, dengan lambat.
3. Beri anak giliran mencoba sendiri — tanpa bantuan kecuali diminta.
4. Puji prosesnya apapun hasilnya: "Kamu sudah coba sendiri!"

**Script:** "Coba sendiri dulu ya. Kamu bisa!"

**Hindari:** Mengambil alih karena "lebih cepat". Kecepatan bukan tujuannya — prosesnya yang penting.

**Amati:** Bagian mana yang ia kuasai? Bagian mana yang ia minta bantuan?



**Catatan Review Fitri:** ___________________________________________


#### [`am-makan-seru`] Waktu Makan Tanpa Pertempuran

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 20 menit |
| Nilai utama | mandiri |
| Nilai pendukung | regulasi-emosi |
| Sumber | aap-healthychildren |

**Deskripsi:** Jadikan waktu makan momen menyenangkan dengan membagi peran: kamu sediakan pilihan sehat, anak tentukan berapa banyak.

**Kenapa ini?** Anak yang bisa mendengar sinyal lapar dan kenyang tubuhnya tumbuh dengan hubungan yang sehat dengan makanan. Waktu makan yang tenang membangun otonomi — bukan pertarungan kuasa.



**Langkah-langkah:**
1. Siapkan makanan dari pilihan yang kamu sediakan — tanpa negosiasi menu.
2. Matikan layar dan duduk bersama.
3. Beri pilihan kecil yang aman: "Mau nasi atau mi duluan?"
4. Biarkan anak menentukan berapa banyak yang ia makan.
5. Akhiri dengan kalimat positif apapun yang terjadi: "Tadi kita makan bersama, senang ya."

**Script:** "Mau mulai mana dulu? Kamu yang pilih."

**Hindari:** Memaksa suapan terakhir atau menjanjikan dessert sebagai hadiah habis makan.

**Amati:** Bagaimana ia menunjukkan kenyang? Apakah ia mencoba makanan baru sendiri?

**Tip Ayah/Bunda:** Tanggungjawabmu: menyediakan pilihan sehat. Tanggungjawab anak: berapa banyak yang dimakan.


**Catatan Review Fitri:** ___________________________________________


#### [`am-toilet`] Mengenal Isyarat Tubuh

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | mandiri |
| Nilai pendukung | — |
| Sumber | aap-healthychildren, kemenkes-kia-kpsp |

**Deskripsi:** Ajarkan anak mengenali isyarat ingin ke kamar mandi — tanpa tekanan dan timeline.

**Kenapa ini?** Toilet training yang berhasil berakar dari anak yang mengenal tubuhnya sendiri, bukan dari jadwal yang dipaksakan dari luar.



**Langkah-langkah:**
1. Perhatikan tanda-tanda anak siap: bisa menahan beberapa menit, menunjukkan kesadaran basah/kotor, tertarik ke kamar mandi.
2. Gunakan bahasa netral untuk tubuh: "Kamu mau pipis?"
3. Jangan tunjukkan kekecewaan saat kecelakaan — normalisasi: "Gak apa-apa, kita ganti ya."
4. Rayakan keberhasilan dengan hangat, bukan berlebihan.

**Script:** "Kamu mau ke kamar mandi? Yuk kita coba."

**Hindari:** Menghukum kecelakaan atau membandingkan dengan anak lain.

**Amati:** Tanda apa yang ia tunjukkan saat ingin ke kamar mandi? Semakin kamu mengenalnya, semakin mudah prosesnya.



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-fungsi-eksekutif`] Bermain Simon Berkata

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | mandiri |
| Nilai pendukung | regulasi-emosi |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Permainan instruksi sederhana yang melatih kemampuan mendengar, menunggu, dan mengontrol diri.

**Kenapa ini?** Kemampuan mengontrol impuls dan mengikuti aturan adalah komponen fungsi eksekutif yang berkembang pesat di usia 2–3 tahun. Permainan ini melatihnya dengan cara yang menyenangkan.



**Langkah-langkah:**
1. Mulai dengan instruksi sederhana: "Simon berkata... tepuk tangan!"
2. Bergantian jadi pemimpin — beri anak giliran memberi instruksi.
3. Tingkatkan kompleksitas secara bertahap.
4. Fokus pada kesenangan bermain, bukan pada "menang" atau "kalah".

**Script:** "Simon berkata, sekarang giliran kamu yang berkata!"

**Hindari:** Membuat aturan terlalu kompleks terlalu cepat atau menekankan pada kalah.

**Amati:** Berapa instruksi yang bisa ia ikuti sekaligus? Bagaimana reaksinya saat "kesalahan"?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-pilih-sendiri`] Kamu yang Pilih

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 25–36 Bulan |
| Durasi | 5 menit |
| Nilai utama | mandiri |
| Nilai pendukung | percaya-diri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Beri anak kesempatan membuat pilihan kecil dalam aktivitas sehari-hari — pakaian, urutan kegiatan, atau mainan.

**Kenapa ini?** Membuat pilihan — bahkan yang kecil — membangun rasa otonomi dan kepercayaan diri anak. Ini juga mengembangkan kemampuan pengambilan keputusan sejak dini.



**Langkah-langkah:**
1. Siapkan 2–3 pilihan yang semuanya bisa kamu terima.
2. Tawarkan dengan nada netral: "Mau baju ini atau itu?"
3. Hormati pilihannya — jangan ubah setelah ia memilih kecuali ada alasan keamanan.
4. Komentari positif: "Kamu sudah pilih sendiri!"

**Script:** "Kamu mau yang mana? Kamu yang pilih."

**Hindari:** Memberikan terlalu banyak pilihan atau menarik kembali pilihannya. Ini bisa membuat anak frustrasi dan kehilangan kepercayaan pada prosesnya.

**Amati:** Apakah ia bisa memilih dengan yakin? Atau butuh waktu lama? Keduanya wajar untuk usianya.



**Catatan Review Fitri:** ___________________________________________


### C — 💗 Empatik (7 modul)


#### 📌 [`am-003`] Permainan Imitasi Wajah

| Meta | Nilai |
|------|-------|
| Status | `published` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 5 menit |
| Nilai utama | empatik |
| Nilai pendukung | sosial |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Bayi belajar membaca emosi melalui wajah pengasuh — dasar dari empati dan koneksi sosial.

**Kenapa ini?** Bayi hadir ke dunia dengan kemampuan menirukan ekspresi wajah. Setiap kali kamu membuat ekspresi dan bayi merespons, kalian sedang membangun fondasi empati bersama.



**Langkah-langkah:**
1. Duduk atau berbaring menghadap bayi, berjarak sekitar 30 cm.
2. Buat ekspresi wajah yang jelas — senyum lebar, mulut bulat terkejut, dahi berkerut heran.
3. Tunggu dan perhatikan respons bayi.
4. Ulangi ekspresi yang tampaknya menarik minatnya.
5. Akhiri dengan senyum dan kontak mata yang hangat.

**Script:** "Hei! Lihat Bunda/Ayah. (buat ekspresi terkejut) Wah!"

**Hindari:** Memaksa kontak mata jika bayi mengalihkan pandangan — itu bisa berarti ia butuh istirahat dari stimulasi.

**Amati:** Ekspresi mana yang paling ia respons? Apakah ia mencoba menirukan?

**Tip Ayah/Bunda:** Tidak ada target yang harus dicapai. Momen koneksi itulah pelajarannya.


**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-senyum-balas`] Dunia Pertama: Wajahmu

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan |
| Durasi | 5 menit |
| Nilai utama | empatik |
| Nilai pendukung | regulasi-emosi |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Hadirkan dirimu sepenuhnya — wajah, suara, dan ekspresi — sebagai koneksi pertama bayi ke dunia.

**Kenapa ini?** Wajah pengasuh adalah "jendela dunia" pertama bayi. Bayi belajar bahwa dunia aman dan penuh kehangatan dari ekspresi yang menanggapinya.



**Langkah-langkah:**
1. Pilih saat bayi dalam keadaan terjaga dan tenang.
2. Dekatkan wajahmu ke jarak pandang bayi (~30cm).
3. Senyum perlahan sambil memanggil namanya dengan lembut.
4. Tunggu responsnya — tatapan, senyum, atau gerakan tangan.
5. Balas dengan antusias tapi tidak berlebihan.

**Script:** "Hei kamu! Bunda senang sekali lihat kamu."

**Hindari:** Scrolling layar sambil bersama bayi — bayi membutuhkan kehadiran penuh, bukan kehadiran fisik saja.

**Amati:** Kapan pertama kali ia tersenyum sebagai respons terhadap senyummu?



**Catatan Review Fitri:** ___________________________________________


#### [`am-kelekatan`] Selalu Ada Saat Dibutuhkan

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 10 menit |
| Nilai utama | empatik |
| Nilai pendukung | regulasi-emosi |
| Sumber | harvard-serve-return |

**Deskripsi:** Tanggapi tangisan dan kebutuhan bayi dengan konsisten — ini membangun rasa aman yang menjadi fondasi semua perkembangan sosial-emosional.

**Kenapa ini?** Bayi yang kebutuhannya direspons secara konsisten belajar bahwa dunia bisa dipercaya. Kelekatan yang aman ini menjadi fondasi kepercayaan pada orang lain sepanjang hidup.



**Langkah-langkah:**
1. Saat bayi menangis, datang dengan tenang dan cepat.
2. Identifikasi kebutuhannya: lapar, popok, butuh pelukan, atau kelelahan.
3. Tanggapi dengan hangat dan konsisten.
4. Saat menggendong, berbicara lembut: "Bunda di sini. Tenang ya."

**Script:** "Bunda di sini. Tenang ya, Bunda dengar kamu."

**Hindari:** Membiarkan bayi menangis terlalu lama dengan harapan ia akan "belajar mandiri". Di usia ini, respons konsisten adalah yang membangun kemandirian sebenarnya.

**Amati:** Bagaimana bayi menenangkan diri saat kamu hadir? Apa yang paling membuatnya tenang?



**Catatan Review Fitri:** ___________________________________________


#### [`am-joint-attention`] Melihat Bersama

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 7–12 Bulan, 13–18 Bulan |
| Durasi | 10 menit |
| Nilai utama | empatik |
| Nilai pendukung | komunikatif |
| Sumber | harvard-serve-return, asha |

**Deskripsi:** Ikuti arah pandang atau jari anak — perhatian bersama adalah dasar komunikasi dan empati.

**Kenapa ini?** Ketika anak menunjuk sesuatu dan kamu melihat ke arah yang sama, kalian sedang berbagi dunia. Ini adalah fondasi komunikasi, bahasa, dan kemampuan memahami perspektif orang lain.



**Langkah-langkah:**
1. Perhatikan ke mana anak melihat atau menunjuk.
2. Ikuti arah matanya dan komentari apa yang ia lihat: "Oh, burung! Kamu lihat burung!"
3. Gantian — tunjukkan sesuatu yang menarik padanya dan perhatikan responsnya.
4. Beri nama benda yang ia perhatikan.

**Script:** "Kamu lihat apa di sana? Oh, itu (nama benda)!"

**Hindari:** Mengalihkan perhatiannya ke hal yang menurutmu lebih menarik — ikuti minatnya dulu.

**Amati:** Apakah ia memastikan kamu melihat hal yang sama dengannya? Ini adalah tanda perkembangan sosial penting.



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-temperamen`] Belajar Membaca Si Kecil

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan, 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | empatik |
| Nilai pendukung | regulasi-emosi |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Amati dan kenali cara unik anak merespons dunia — temperamennya adalah petunjuk, bukan label.

**Kenapa ini?** Setiap anak hadir dengan cara uniknya merespons dunia. Mengenali temperamennya membantu kamu menyesuaikan cara pendampingan agar lebih efektif dan minim gesekan.



**Langkah-langkah:**
1. Amati: bagaimana ia merespons orang baru? Situasi baru? Perubahan rutinitas?
2. Catatan mental (atau tulis): apa yang membuatnya nyaman? Apa yang membuatnya stres?
3. Sesuaikan pendekatan: anak yang sensitif butuh transisi lebih lambat; anak aktif butuh lebih banyak gerak.
4. Ingat: tidak ada temperamen yang "lebih baik" — semuanya punya kekuatan.

**Script:** "Aku perhatikan kamu suka waktu (isi observasimu). Aku mau sesuaikan ya."

**Hindari:** Membandingkan temperamen anak dengan anak lain atau berusaha "mengubah" sifat dasarnya.

**Amati:** Pola apa yang kamu lihat dalam seminggu terakhir? Apa yang paling membuatnya berkembang?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-keterampilan-sosial`] Belajar Merasakan Perasaan Orang Lain

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | empatik |
| Nilai pendukung | sosial |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Bantu anak mengenali bahwa orang lain juga punya perasaan — melalui cerita, permainan peran, atau momen nyata.

**Kenapa ini?** Empati bukan sifat yang dimiliki atau tidak dimiliki — ia dipelajari. Anak yang sering diajak memikirkan perasaan orang lain berkembang menjadi orang yang lebih peduli.



**Langkah-langkah:**
1. Manfaatkan momen nyata: saat anak melihat temannya menangis, tanya "Menurutmu temannya kenapa menangis?"
2. Saat membaca buku, tanya "Menurutmu perasaan (karakter ini) sekarang apa?"
3. Bantu anak merespons dengan cara yang tepat: "Kita bisa (tawari bantuan/hibur) ya."
4. Apresiasi ketika ia menunjukkan kepedulian, sekecil apapun.

**Script:** "Menurutmu temannya sedang merasa apa ya? Apa yang bisa kita lakukan?"

**Hindari:** Memaksa anak untuk berbagi atau bersikap empati sebelum ia siap — empati yang dipaksakan tidak tumbuh dari dalam.

**Amati:** Kapan anak menunjukkan kepedulian spontan? Situasi apa yang memunculkan empatinya?



**Catatan Review Fitri:** ___________________________________________


#### [`am-disiplin-empati`] Batas yang Ditetapkan dengan Kasih

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | empatik |
| Nilai pendukung | regulasi-emosi |
| Sumber | aap-healthychildren |

**Deskripsi:** Berikan aturan yang jelas dan konsisten — tapi dengan nada yang menghormati anak sebagai manusia yang sedang belajar.

**Kenapa ini?** Anak membutuhkan batas yang jelas untuk merasa aman — tapi cara batas itu disampaikan menentukan apakah mereka belajar dari empati atau dari rasa takut.



**Langkah-langkah:**
1. Saat perlu menetapkan batas, berlutut ke level anak dan kontak mata.
2. Sebutkan perilaku yang tidak bisa dilanjutkan dan alasannya: "Melempar mainan bisa melukai. Kita simpan dulu."
3. Tawarkan alternatif: "Kalau mau lempar, kita bisa lempar bola ke sini."
4. Konsisten — batas yang sama berlaku setiap kali.

**Script:** "Aku mengerti kamu mau (keinginan anak). Dan ini tidak bisa dilanjutkan karena (alasan singkat). Kita bisa (alternatif) ya."

**Hindari:** Berteriak, mengancam, atau memberi label ("Kamu nakal"). Perilaku yang bisa diperbaiki ≠ anak yang buruk.

**Amati:** Bagaimana anak merespons batas yang disampaikan dengan tenang? Apakah ada cara penyampaian yang lebih ia terima?



**Catatan Review Fitri:** ___________________________________________


### C — ✨ Percaya Diri (5 modul)


#### [`am-genggam`] Genggam dan Eksplorasi

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan |
| Durasi | 10 menit |
| Nilai utama | percaya-diri |
| Nilai pendukung | mandiri |
| Sumber | kemenkes-kia-kpsp |

**Deskripsi:** Letakkan benda-benda aman dengan tekstur berbeda dan biarkan bayi mengeksplorasi dengan tangannya.

**Kenapa ini?** Ketika bayi berhasil menggenggam dan memegang sesuatu, ia merasakan rasa mampu pertamanya. Sensasi kecil ini adalah benih kepercayaan diri.

**Bahan:** Benda aman dengan tekstur berbeda: kain lembut, cincin plastik, mainan kayu halus


**Langkah-langkah:**
1. Siapkan benda aman yang mudah digenggam oleh tangan kecil.
2. Letakkan di telapak tangannya atau dekat jangkauannya.
3. Beri waktu ia mengeksplorasi — rasa, pegang, angkat, goyangkan.
4. Komentari dengan hangat apa yang ia lakukan.

**Script:** "Kamu berhasil pegang! Coba yang ini juga."

**Hindari:** Meletakkan terlalu banyak benda sekaligus — satu atau dua cukup untuk fokus.

**Amati:** Berapa lama ia bisa memegang? Apa yang paling menarik perhatiannya?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-pilihan-kecil`] Dua Pilihan Kecil

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 7–12 Bulan, 13–18 Bulan |
| Durasi | 5 menit |
| Nilai utama | percaya-diri |
| Nilai pendukung | mandiri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Berikan dua pilihan yang keduanya bisa kamu terima — biarkan anak memutuskan.

**Kenapa ini?** Pilihan kecil adalah latihan besar. Anak yang keputusannya dihargai sejak dini tumbuh dengan keyakinan bahwa pendapatnya penting.



**Langkah-langkah:**
1. Pilih momen yang tepat: saat berpakaian, memilih camilan, atau mainan.
2. Tunjukkan dua pilihan dengan jelas: "Mau yang ini atau yang ini?"
3. Tunggu jawabannya — dengan isyarat tangan, tatapan, atau kata.
4. Hormati pilihannya dan lanjutkan.

**Script:** "Mau yang ini atau yang itu? Kamu yang pilih ya."

**Hindari:** Memberikan lebih dari dua pilihan — terlalu banyak opsi membuat anak kewalahan.

**Amati:** Bagaimana caranya menunjukkan pilihan? Tatapan, jangkauan tangan, atau kata-kata?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-coba-lagi`] Boleh Coba Lagi

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 7–12 Bulan, 13–18 Bulan |
| Durasi | 10 menit |
| Nilai utama | percaya-diri |
| Nilai pendukung | mandiri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Saat anak gagal atau frustasi, dukung proses mencoba lagi tanpa mengambil alih.

**Kenapa ini?** Anak yang pernah didukung saat gagal akan lebih berani mencoba lagi. Ketangguhan tumbuh dari kegagalan kecil yang aman untuk dilalui.



**Langkah-langkah:**
1. Saat anak terlihat frustasi karena suatu tugas, hadir tapi jangan langsung mengambil alih.
2. Akui perasaannya: "Susah ya. Kamu frustrasi karena ini."
3. Beri semangat untuk mencoba lagi: "Mau coba sekali lagi?"
4. Bantu hanya jika ia minta atau jika sudah terlalu lama frustasi.

**Script:** "Jatuh tidak apa-apa. Coba lagi ya, Bunda/Ayah di sini."

**Hindari:** Langsung menyelesaikan tugas untuk anak atau berkata "Udah deh, nanti aja".

**Amati:** Berapa kali ia mau mencoba sebelum menyerah? Bagaimana reaksinya saat akhirnya berhasil?



**Catatan Review Fitri:** ___________________________________________


#### [`am-pujian-proses`] Puji Prosesnya, Bukan Hasilnya

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 5 menit |
| Nilai utama | percaya-diri |
| Nilai pendukung | mandiri |
| Sumber | aap-healthychildren |

**Deskripsi:** Alihkan pujian dari hasil ke usaha — "Kamu sudah berusaha keras" daripada "Pintar!"

**Kenapa ini?** Pujian yang berfokus pada usaha mengajarkan anak bahwa kemampuan bisa tumbuh melalui latihan. Ini membangun ketangguhan yang bertahan jauh lebih lama dari pujian hasil.



**Langkah-langkah:**
1. Perhatikan momen di mana anak berusaha — meski hasilnya tidak sempurna.
2. Beri pujian spesifik pada prosesnya: "Kamu tadi fokus sekali waktu mencoba itu."
3. Hindari pujian umum seperti "Pintar!" atau "Hebat!" — gantikan dengan yang lebih konkret.
4. Saat hasil memang bagus, sambungkan ke usaha: "Hasilnya bagus karena kamu sudah latihan."

**Script:** "Aku lihat kamu tadi berusaha keras. Itu yang paling penting!"

**Hindari:** Memuji kecerdasan atau bakat bawaan — "Kamu memang pinter" membuat anak takut tampak bodoh saat gagal.

**Amati:** Bagaimana anak merespons pujian proses dibanding pujian hasil? Apakah ia terlihat lebih berani mencoba hal baru?



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-bebas-mencoba`] Ruang untuk Mencoba (dan Gagal)

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 19–24 Bulan, 25–36 Bulan |
| Durasi | 15 menit |
| Nilai utama | percaya-diri |
| Nilai pendukung | mandiri |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Sediakan aktivitas atau situasi di mana anak bisa mencoba hal baru dengan risiko kecil — tidak apa-apa kalau hasilnya tidak sempurna.

**Kenapa ini?** Anak yang punya ruang aman untuk gagal belajar bahwa kegagalan bukan akhir — itu bagian dari proses. Inilah fondasi kepercayaan diri jangka panjang.

**Bahan:** Pilih aktivitas dengan "risiko aman": menggambar, membangun balok, memasak sederhana


**Langkah-langkah:**
1. Pilih aktivitas yang memungkinkan berbagai cara benar.
2. Sampaikan di awal: "Tidak ada cara yang salah di sini."
3. Biarkan anak menentukan caranya sendiri.
4. Jika ia tidak puas dengan hasilnya, validasi: "Kamu ingin lebih baik — boleh coba lagi."

**Script:** "Coba saja dulu. Tidak ada salah atau benar di sini."

**Hindari:** Mengoreksi cara anak mengerjakan sesuatu selama hasilnya tidak berbahaya.

**Amati:** Seberapa lama ia mau mencoba sesuatu yang baru? Apakah ia semakin berani dari waktu ke waktu?



**Catatan Review Fitri:** ___________________________________________


### C — 🌊 Regulasi Emosi (5 modul)


#### [`am-rutinitas`] Ritme Hari yang Konsisten

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 10 menit |
| Nilai utama | regulasi-emosi |
| Nilai pendukung | mandiri |
| Sumber | aap-healthychildren |

**Deskripsi:** Bangun rutinitas harian yang bisa diprediksi — bukan jadwal kaku, tapi alur yang anak kenal.

**Kenapa ini?** Rutinitas yang bisa diprediksi memberi sinyal aman pada sistem saraf bayi dan anak kecil. Ketika anak tahu apa yang akan terjadi, energinya bisa lebih terfokus pada eksplorasi dan belajar.



**Langkah-langkah:**
1. Tetapkan alur sederhana: makan → bermain → tidur siang → bermain → mandi → tidur malam.
2. Umumkan transisi dengan kata-kata: "Sebentar lagi waktu tidur ya."
3. Pertahankan alur yang sama — fleksibel dalam waktu spesifik, konsisten dalam urutannya.
4. Gunakan isyarat visual atau lagu pendek sebagai penanda transisi.

**Script:** "Sebentar lagi kita (aktivitas berikutnya) ya. Sekarang kita selesaikan ini dulu."

**Hindari:** Perubahan rutinitas mendadak tanpa pemberitahuan — anak kecil butuh waktu untuk transisi.

**Amati:** Kapan anak paling tenang? Kapan ia paling rewel? Apakah ada pola yang berkaitan dengan rutinitas?



**Catatan Review Fitri:** ___________________________________________


#### [`am-ko-regulasi`] Duduk Bersamanya yang Tenang

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan, 13–18 Bulan |
| Durasi | 10 menit |
| Nilai utama | regulasi-emosi |
| Nilai pendukung | empatik |
| Sumber | harvard-serve-return |

**Deskripsi:** Saat anak kewalahan, hadir dengan tenang — ketenangan kamu menular ke sistem saraf anak.

**Kenapa ini?** Anak belum bisa menenangkan diri sendiri — ia belajar caranya dari pengasuh yang hadir dan tenang. Ketenangan kamu bukan sesuatu yang bisa diperintahkan ke anak; itu harus ditularkan.



**Langkah-langkah:**
1. Saat anak kewalahan, hadir secara fisik — dekat, tapi tidak memaksa.
2. Atur napas sendiri dulu sebelum bereaksi.
3. Gunakan nada suara yang pelan dan stabil.
4. Kontak fisik jika anak mau: pelukan atau tepukan lembut.
5. Tidak perlu banyak kata — kehadiran yang tenang sudah cukup.

**Script:** "Aku di sini. Pelan-pelan ya. Kita tenang bersama."

**Hindari:** Bereaksi dengan panik atau frustrasi saat anak menangis keras — respons emosional kamu akan menambah intensitas.

**Amati:** Apa yang paling membantu anak menenangkan diri? Kontak fisik, suara, atau jarak?



**Catatan Review Fitri:** ___________________________________________


#### [`am-tantrum`] Saat Perasaan Membesar

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | regulasi-emosi |
| Nilai pendukung | empatik |
| Sumber | aap-healthychildren |

**Deskripsi:** Hadapi tantrum dengan ketenangan — bukan sebagai perang, tapi sebagai momen anak belajar mengelola emosi besar.

**Kenapa ini?** Tantrum bukan manipulasi — ini cara otak yang sedang berkembang menunjukkan bahwa sistem regulasinya terbebani. Respons hangat mengajarkan lebih banyak daripada reaksi keras.



**Langkah-langkah:**
1. Pastikan keamanan fisik anak terlebih dahulu.
2. Tetap tenang — tarik napas dalam jika perlu.
3. Hadir secara fisik, dekat tapi tidak terlalu memaksa.
4. Tidak perlu banyak bicara saat puncak tantrum — tunggu reda.
5. Setelah tenang, akui perasaannya: "Kamu tadi sedih ya karena tidak bisa (hal itu)."

**Script:** "Kamu sedang sedih ya. Wajar sedih. Bunda di sini."

**Hindari:** Memberikan apa yang diminta saat tantrum (akan menguatkan perilaku), atau menghukum/mengisolasi anak saat emosional.

**Amati:** Apa yang biasanya memicu tantrum? Apakah ada pola — waktu tertentu atau kebutuhan tertentu (lapar, ngantuk, frustrasi)?

**Tip Ayah/Bunda:** Ini melelahkan. Boleh meminta waktu sendiri sejenak kalau kamu butuh.


**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-nama-perasaan`] Kenalkan Nama Perasaan

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | regulasi-emosi |
| Nilai pendukung | komunikatif |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Bantu anak menamai apa yang ia rasakan — bahasa emosi adalah kunci regulasi diri.

**Kenapa ini?** "Bisa menyebut = bisa mengelola." Anak yang punya kosa kata emosi lebih mampu mengelola perasaannya — bukan karena ia tidak merasakan, tapi karena ia tahu caranya mengungkapkan.



**Langkah-langkah:**
1. Perhatikan ekspresi dan perilaku anak sepanjang hari.
2. Beri nama perasaan saat muncul: "Kamu kelihatan senang sekali!"
3. Saat emosi negatif muncul, namakan tanpa menghakimi: "Kamu kelihatan kesal ya?"
4. Gunakan buku bergambar atau kartu emosi untuk mengenalkan kosakata baru.

**Script:** "Kamu kelihatan (nama perasaan) ya. Wajar ngerasa begitu."

**Hindari:** Berkata "Jangan nangis" atau "Tidak ada yang perlu ditakutkan" — ini melarang perasaan, bukan membantunya.

**Amati:** Kosakata emosi apa yang mulai ia gunakan sendiri? Itu petunjuk bagian mana yang sudah ia kuasai.



**Catatan Review Fitri:** ___________________________________________


#### [`am-tidur-sehat`] Ritual Tidur yang Menenangkan

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan, 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 15 menit |
| Nilai utama | regulasi-emosi |
| Nilai pendukung | — |
| Sumber | aap-aasm-sleep, aap-healthychildren |

**Deskripsi:** Bangun urutan kegiatan yang konsisten sebelum tidur — ini sinyal kuat untuk otak anak bahwa waktunya istirahat.

**Kenapa ini?** Ritual tidur yang konsisten mengajarkan otak untuk bersiap istirahat. Tidur yang cukup adalah fondasi regulasi emosi di siang hari.



**Langkah-langkah:**
1. Tetapkan urutan yang sama setiap malam: mandi → ganti baju → buku/nyanyian → tidur.
2. Matikan layar setidaknya 30 menit sebelum tidur.
3. Gunakan cahaya redup dan suara yang tenang.
4. Umumkan tahapan dengan kata-kata: "Sekarang waktunya buku, lalu tidur."

**Script:** "Sekarang saatnya istirahat. Besok kita main lagi ya."

**Hindari:** Layar sebagai penenang sebelum tidur — cahaya biru mengganggu sinyal tidur otak.

**Amati:** Berapa menit dari ritual dimulai sampai anak tertidur? Bagian ritual mana yang paling menenangkannya?



**Catatan Review Fitri:** ___________________________________________


### C — 🗣️ Komunikatif (5 modul)


#### [`am-serve-return`] Balas-Balasan

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 5 menit |
| Nilai utama | komunikatif |
| Nilai pendukung | empatik |
| Sumber | harvard-serve-return, harvard-brain, asha |

**Deskripsi:** Respons ocehan, gerakan, atau tatapan bayi — setiap balasan mengajarkan dasar komunikasi.

**Kenapa ini?** Percakapan adalah dua arah. Setiap kali kamu menanggapi ocehan atau tatapan bayi, kamu mengajarinya prinsip dasar ini. Interaksi bolak-balik membangun jutaan koneksi saraf di otak bayi.



**Langkah-langkah:**
1. Perhatikan sinyal bayi: ocehan, tatapan, gerakan tangan, ekspresi.
2. Balas dengan nada hangat — tirukan suaranya atau tambahkan kata-kata.
3. Beri jeda setelah merespons — tunggu gilirannya lagi.
4. Ulangi selama ia masih responsif.

**Script:** "Oh ya? Cerita dong lebih! (sambil menirukan suara atau ekspresinya)"

**Hindari:** Berbicara terus-menerus tanpa memberi jeda untuk responsnya — jeda adalah bagian terpenting dari komunikasi.

**Amati:** Bayi mencoba meniru suaramu? Ini tanda kesiapan berbicara yang luar biasa!



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-002`] Membaca Buku Bersama

| Meta | Nilai |
|------|-------|
| Status | `published` |
| Usia | 7–12 Bulan, 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | komunikatif |
| Nilai pendukung | empatik |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Duduk bersama dan ceritakan gambar-gambar sederhana untuk membangun kosakata dan koneksi.

**Kenapa ini?** Membaca bersama bukan tentang isi ceritanya — tapi tentang momen berbagi perhatian, mendengar suaramu, dan belajar bahwa gambar mewakili sesuatu yang nyata.

**Bahan:** Buku bergambar dengan ilustrasi sederhana


**Langkah-langkah:**
1. Pilih waktu tenang — setelah makan atau sebelum tidur.
2. Duduk bersama anak di pangkuan atau berdampingan.
3. Tunjuk gambar dan namakan: "Ini anjing. Anjing bilang guk-guk."
4. Beri jeda dan ikuti ke mana anak melihat atau menunjuk.
5. Tidak apa-apa tidak mengikuti urutan halaman — ikuti minatnya.

**Script:** "Ini apa ya? Oh, (nama benda)! Kamu lihat juga?"

**Hindari:** Memaksa anak duduk diam dan mendengarkan dari awal sampai akhir — biarkan ia aktif selama prosesnya.

**Amati:** Halaman atau gambar mana yang paling ia sukai? Di situ tempatnya belajar paling banyak.

**Tip Ayah/Bunda:** Lima menit yang terfokus lebih berharga dari dua puluh menit yang terburu-buru.


**Catatan Review Fitri:** ___________________________________________


#### [`am-tonggak-bahasa`] Bicara Sepanjang Hari

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan, 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | komunikatif |
| Nilai pendukung | — |
| Sumber | asha, harvard-brain |

**Deskripsi:** Jadikan aktivitas sehari-hari momen belajar bahasa — narasi apa yang sedang kamu lakukan bersama anak.

**Kenapa ini?** Otak bayi sedang membangun "peta bahasa" dari semua yang ia dengar. Berbicara sambil melakukan aktivitas nyata adalah cara paling alami dan efektif untuk memperkayanya.



**Langkah-langkah:**
1. Narasikan aktivitas yang kamu lakukan bersama anak: "Sekarang kita mandi. Ini air hangatnya…"
2. Gunakan bahasa yang sederhana dan kalimat pendek.
3. Ulangi kata-kata kunci beberapa kali dalam konteks yang berbeda.
4. Variasikan: bernyanyi, bercerita, menyebut nama benda di sekitar.

**Script:** "Sekarang kita (aktivitas). Ini (nama benda)nya — (deskripsi singkat)."

**Hindari:** Berbicara dalam nada datar atau monoton — variasi nada membantu bayi memperhatikan lebih lama.

**Amati:** Kata apa yang pertama kali ia coba ucapkan? Biasanya kata yang paling sering ia dengar dalam konteks yang bermakna.



**Catatan Review Fitri:** ___________________________________________


#### [`am-pra-literasi`] Bermain dengan Bunyi dan Kata

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 10 menit |
| Nilai utama | komunikatif |
| Nilai pendukung | mandiri |
| Sumber | asha |

**Deskripsi:** Ajak anak bermain rima, sajak, dan tebak-tebakan bunyi — fondasi kemampuan membaca.

**Kenapa ini?** Kemampuan membaca dibangun jauh sebelum anak mengenal huruf. Bermain dengan bunyi dan rima mengajarkan bahwa bahasa punya pola — fondasi terpenting literasi.



**Langkah-langkah:**
1. Nyanyikan lagu dengan bunyi berulang atau rima sederhana.
2. Buat permainan sederhana: "Cari benda yang bunyinya sama dengan BOLA!"
3. Baca buku dengan rima keras-keras dan ekspresif.
4. Bertepuk tangan mengikuti suku kata nama anak.

**Script:** "Bola! Bola! Apa yang satu bunyi dengan bola? (Cola? Kola? Bisa apa saja — yang penting bersenang-senang!)"

**Hindari:** Mengoreksi jika anak membuat kata-kata "tidak ada" — kreativitas bahasa adalah tanda otak yang aktif.

**Amati:** Apakah anak mulai membuat rima sendiri? Ini tanda perkembangan literasi yang baik.



**Catatan Review Fitri:** ___________________________________________


#### [`am-koneksi-nyata`] Matikan Layar, Nyalakan Koneksi

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan, 13–18 Bulan, 19–24 Bulan, 25–36 Bulan |
| Durasi | 15 menit |
| Nilai utama | komunikatif |
| Nilai pendukung | — |
| Sumber | aap-media |

**Deskripsi:** Gantikan waktu layar dengan interaksi langsung — percakapan, nyanyian, atau eksplorasi bersama.

**Kenapa ini?** Bayi dan anak kecil belajar bahasa, emosi, dan sosial dari interaksi manusia — bukan dari layar. Satu menit percakapan langsung nilainya lebih dari sepuluh menit video edukasi.



**Langkah-langkah:**
1. Pilih satu waktu sehari untuk benar-benar bebas dari layar — misal saat makan atau sebelum tidur.
2. Isi waktu itu dengan interaksi langsung: cerita, nyanyian, eksplorasi benda sekitar.
3. Jika sulit, mulai kecil: 15 menit tanpa layar sudah bermakna.

**Script:** "Yuk, mainan dulu ya. HP Bunda/Ayah simpan dulu."

**Hindari:** Memberikan layar sebagai penenang setiap kali anak bosan atau rewel — ini mengurangi kesempatan belajar regulasi emosi dari pengalaman nyata.

**Amati:** Apa yang anak lakukan saat tidak ada layar? Seringkali kreativitas dan eksplorasi muncul di sana.



**Catatan Review Fitri:** ___________________________________________


### C — 🤝 Sosial (5 modul)


#### 📌 [`am-bercerita-bersama`] Bernyanyi dan Bercerita Bersama

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 0–6 Bulan, 7–12 Bulan |
| Durasi | 10 menit |
| Nilai utama | sosial |
| Nilai pendukung | komunikatif |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Nyanyikan lagu sederhana atau ceritakan kisah kecil sambil menatap mata bayi.

**Kenapa ini?** Nyanyian dan cerita adalah cara pertama anak belajar bahwa berbagi pengalaman menyenangkan. Ritme dan nada membantu membangun koneksi sosial-emosional yang dalam.



**Langkah-langkah:**
1. Pilih lagu sederhana yang kamu suka — tidak perlu khusus lagu anak.
2. Nyanyikan dengan nada yang hangat sambil menatap matanya.
3. Tambahkan gerakan tangan atau tepukan yang bisa ia ikuti.
4. Perhatikan responsnya — apakah ia bergerak, tersenyum, atau mencoba bersuara?

**Script:** "(Nyanyikan lagu favorit keluarga dengan penuh kehangatan)"

**Hindari:** Berhenti karena merasa suaramu tidak bagus — bayi tidak peduli dengan kualitas suara, hanya dengan kehangatan yang menyertainya.

**Amati:** Bagaimana tubuh bayi bergerak saat mendengar musik? Ritme tubuhnya adalah ekspresi sosial pertamanya.



**Catatan Review Fitri:** ___________________________________________


#### [`am-bermain-paralel`] Bermain Berdampingan

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan |
| Durasi | 15 menit |
| Nilai utama | sosial |
| Nilai pendukung | empatik |
| Sumber | aap-healthychildren |

**Deskripsi:** Biarkan batita bermain di dekat anak lain tanpa memaksa interaksi langsung — ini adalah tonggak sosial yang sehat untuk usianya.

**Kenapa ini?** Sebelum bermain bersama, batita perlu dulu belajar nyaman bermain di samping orang lain. Ini disebut bermain paralel — tahap sosial yang tepat untuk usia ini, bukan tanda kurang pergaulan.



**Langkah-langkah:**
1. Atur situasi di mana ada anak lain di ruangan yang sama — taman, rumah saudara, atau kumpul keluarga.
2. Sediakan mainan serupa untuk masing-masing anak agar tidak berebut.
3. Biarkan mereka bermain masing-masing tanpa dipaksa berinteraksi.
4. Komentari dengan hangat jika ada momen natural: "Kamu dan teman kamu pakai balok yang sama!"
5. Jangan paksa berbagi — biarkan momen berbagi datang sendiri.

**Script:** "Main di sini ya, ada teman juga. Seru!"

**Hindari:** Memaksa anak berinteraksi atau berbagi sebelum ia siap — ini membuat bermain sosial terasa seperti tekanan, bukan kesenangan.

**Amati:** Apakah ia sesekali melirik anak lain? Meniru apa yang dilakukan temannya? Ini tanda kesiapan bermain bersama yang akan datang.



**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-005`] Bermain Pura-Pura

| Meta | Nilai |
|------|-------|
| Status | `published` |
| Usia | 19–24 Bulan, 25–36 Bulan |
| Durasi | 20 menit |
| Nilai utama | sosial |
| Nilai pendukung | komunikatif, empatik |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** "Masak-masakan" atau "dokter-dokteran" membantu anak memproses pengalaman nyata dan berlatih kehidupan sosial.

**Kenapa ini?** Dalam bermain pura-pura, anak sedang berlatih menjadi bagian dari dunia sosial — mengambil peran, bernegosiasi, dan memahami bahwa orang lain punya perspektif yang berbeda.

**Bahan:** Peralatan rumah tangga aman, Mainan dokter atau dapur (opsional), Imajinasi!


**Langkah-langkah:**
1. Ikuti lead anak — tanya "Kita main apa hari ini?"
2. Ambil peran yang anak berikan, jangan merebut kendali cerita.
3. Perluas narasi: "Oh bonekanya sakit ya? Sakit apa?"
4. Beri karakter emosi yang nyata: "Dokternya baik sekali, pasiennya jadi tidak takut."
5. Biarkan permainan berakhir secara alami.

**Script:** "Aku jadi (peran yang ia berikan) ya. Apa yang harus aku lakukan?"

**Hindari:** Merebut kendali cerita atau selalu menjadi "yang memimpin" permainan.

**Amati:** Tema apa yang sering muncul dalam permainannya? Seringkali ia sedang memproses pengalaman nyata di hidupnya.

**Tip Ayah/Bunda:** Bermain peran adalah cara anak memproses dunia. Jika ia bermain "marah-marahan", ikuti dan dukung — bukan dihentikan.


**Catatan Review Fitri:** ___________________________________________


#### 📌 [`am-giliran`] Kamu Dulu, Baru Aku

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 13–18 Bulan, 19–24 Bulan |
| Durasi | 10 menit |
| Nilai utama | sosial |
| Nilai pendukung | regulasi-emosi |
| Sumber | 📌 _(belum ada)_ |

**Deskripsi:** Latih giliran dalam permainan sederhana — membangun kesadaran bahwa orang lain punya kebutuhan juga.

**Kenapa ini?** Belajar menunggu giliran adalah salah satu keterampilan sosial pertama yang dikuasai anak. Ini membutuhkan pengendalian impuls dan pemahaman perspektif orang lain.



**Langkah-langkah:**
1. Mulai dengan permainan giliran yang sangat jelas: lempar-tangkap bola, giliran mewarnai, atau giliran berbicara.
2. Beri nama dengan eksplisit: "Sekarang giliran kamu. Sekarang giliran Bunda."
3. Beri waktu tunggu yang pendek dulu — tingkatkan bertahap.
4. Puji saat ia berhasil menunggu: "Kamu tadi menunggu giliran dengan baik!"

**Script:** "Sekarang giliran kamu. Nanti giliran Bunda ya."

**Hindari:** Selalu memenangkan anak dalam permainan atau langsung memberi jika ia tidak sabar.

**Amati:** Berapa lama ia bisa menunggu? Apa yang membantunya bertahan menunggu?



**Catatan Review Fitri:** ___________________________________________


#### [`am-kesiapan-sosial`] Berkenalan dengan Dunia Bersama

| Meta | Nilai |
|------|-------|
| Status | `draft` |
| Usia | 25–36 Bulan |
| Durasi | 20 menit |
| Nilai utama | sosial |
| Nilai pendukung | empatik |
| Sumber | cdc-act-early |

**Deskripsi:** Bawa anak ke situasi sosial kecil — taman, rumah saudara, atau kelompok bermain — dan dampingi prosesnya.

**Kenapa ini?** Kemampuan bermain dan bekerja sama dengan orang lain dibangun dari banyak percobaan kecil. Setiap interaksi, bahkan yang canggung, adalah latihan berharga.



**Langkah-langkah:**
1. Pilih situasi sosial yang tidak terlalu ramai atau berisik untuk memulai.
2. Dampingi tanpa mengambil alih interaksi anak dengan orang lain.
3. Beri anak kata-kata yang bisa ia gunakan: "Kamu bisa bilang 'boleh ikut main?'."
4. Normalisasi jika ia butuh waktu untuk hangat — tidak perlu dipaksa.

**Script:** "Itu temannya. Kamu mau kenalan? Bisa bilang hai dulu."

**Hindari:** Memaksa anak berinteraksi jika ia jelas tidak mau — beri waktu untuk mengamati dulu.

**Amati:** Kapan anak mulai nyaman? Berapa lama ia biasanya butuh untuk "hangat" di lingkungan baru?



**Catatan Review Fitri:** ___________________________________________


---

## Bagian D: Template Pekan (8 template)


### [`wpt-001`] Pekan Pertama: Bergerak Sendiri

**Tema:** 🌿 Mandiri × 0–6 Bulan

**Deskripsi:** Tiga sesi pendek untuk memperkenalkan gerak mandiri bayi — tummy time, lantai bebas, dan percakapan pertama.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Tummy Time: Angkat Kepala Sendiri | Pagi, saat bayi segar setelah bangun tidur | Mulai 3 menit saja — tingkatkan bertahap setiap hari. |
| rabu | Balas-Balasan | Kapan saja bayi terjaga dan waspada | Balas setiap ocehan atau tatapan — tidak perlu alat apapun. |
| sabtu | Waktu Bebas di Lantai | Pagi, setelah menyusui | Matras bersih sudah cukup. Duduk di dekat — hadir tapi tidak mengarahkan. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-002`] Pekan Kedekatan & Kepekaan

**Tema:** 💗 Empatik × 0–6 Bulan

**Deskripsi:** Empat momen singkat yang membangun kelekatan dan kepekaan sejak bulan pertama — sentuhan, tatapan, dan respons konsisten.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Dunia Pertama: Wajahmu | Pagi, saat bayi baru bangun dan segar | Duduk dekat, tatap matanya, dan tunggu — biarkan ia yang memulai. |
| selasa | Selalu Ada Saat Dibutuhkan | Sore, saat bayi gelisah atau ingin digendong | Menggendong dan merespons tangis bukan memanjakan — ini membangun rasa aman. |
| kamis | Permainan Imitasi Wajah | Kapan saja bayi dalam kondisi tenang dan terjaga | Tatapan dan senyum cukup — tidak perlu mainan. |
| sabtu | Belajar Membaca Si Kecil | Sore, saat kamu punya waktu tenang untuk refleksi | Baca modul ini seperti membaca kamus bayi — kenali polanya pekan ini. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-003`] Eksplorasi Aktif

**Tema:** 🌿 Mandiri × 7–12 Bulan

**Deskripsi:** Tiga sesi yang memberi bayi ruang untuk bergerak, merangkak, dan memecahkan "teka-teki" kecil — inisiatif tumbuh dari kebebasan terarah.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Waktu Bebas di Lantai | Pagi, setelah sarapan | Zona bebas di lantai — biarkan ia menentukan ke mana pergi. |
| rabu | Bebas Menjelajah Ruang Aman | Sore, setelah tidur siang | Ikuti dari dekat tapi jangan mencegah hal yang sebetulnya aman. |
| jumat | Petak Umpet Benda | Pagi, saat bayi segar | Beri jeda setelah menyembunyikan benda — rasa ingin tahu-nya yang memimpin. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-004`] Belajar Bicara Bersama

**Tema:** 🗣️ Komunikatif × 7–12 Bulan

**Deskripsi:** Empat aktivitas yang membangun fondasi bahasa melalui balasan, buku, narasi sehari-hari, dan koneksi langsung — tanpa gadget.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Balas-Balasan | Pagi, saat bayi aktif dan responsif | Jeda adalah bagian terpenting — tunggu gilirannya. |
| rabu | Membaca Buku Bersama | Sore, setelah mandi | Ikuti ke mana ia melihat — tidak perlu mengikuti urutan halaman. |
| jumat | Bicara Sepanjang Hari | Sepanjang hari — saat makan, mandi, ganti baju | Narasi apa yang kamu lakukan: "Sekarang kita cuci tangan, air-nya dingin ya." |
| minggu | Matikan Layar, Nyalakan Koneksi | Sore, waktu santai keluarga | Satu jam tanpa layar — cerita, nyanyian, atau sekadar menemani. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-005`] Tenang di Tengah Badai Kecil

**Tema:** 🌊 Regulasi Emosi × 13–18 Bulan

**Deskripsi:** Empat langkah mingguan untuk membangun ruang emosi yang aman — ko-regulasi, bahasa perasaan, ritual tidur, dan panduan ketika tantrum datang.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Duduk Bersamanya yang Tenang | Kapan pun anak menunjukkan emosi kuat | Tenangkan dirimu dulu sebelum menenangkan anak — mereka merasakan energimu. |
| rabu | Kenalkan Nama Perasaan | Sore, saat aktivitas sehari-hari | Beri nama perasaan saat muncul: "Kamu kelihatan frustrasi ya?" |
| jumat | Ritual Tidur yang Menenangkan | Malam, mulai 30 menit sebelum jam tidur | Urutan yang sama setiap malam — mandi, baju, buku, tidur. |
| minggu | Saat Perasaan Membesar | Baca di waktu tenang; terapkan saat dibutuhkan | Panduan ini paling berguna dibaca sebelum tantrum terjadi, bukan di tengah-tengahnya. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-006`] Berani Mencoba Sendiri

**Tema:** ✨ Percaya Diri × 13–18 Bulan

**Deskripsi:** Tiga aktivitas untuk membangun kepercayaan diri dari dalam — bukan dari pujian berlebihan, tapi dari pengalaman berhasil mencoba sendiri.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Dua Pilihan Kecil | Pagi, saat rutinitas berpakaian atau sarapan | Dua pilihan sudah cukup — terlalu banyak opsi membuat anak kewalahan. |
| rabu | Boleh Coba Lagi | Sore, saat bermain bebas | Tahan dorongan menyelesaikan — beri ia waktu untuk berjuang sedikit. |
| sabtu | Puji Prosesnya, Bukan Hasilnya | Sepanjang hari — puji saat kamu melihat usaha | Fokus pada proses: "Kamu sudah coba berkali-kali!" bukan "Kamu pintar." |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-007`] Mengenal Perasaan Besar

**Tema:** 🌊 Regulasi Emosi × 19–24 Bulan

**Deskripsi:** Empat momen mingguan untuk mendampingi ledakan emosi di usia dua tahun — menamai, menerima, dan perlahan mengajarkan cara keluar dari badai.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Kenalkan Nama Perasaan | Sore, saat aktivitas rutin atau membaca buku | Gunakan buku bergambar untuk mengenalkan kosakata emosi baru. |
| rabu | Saat Perasaan Membesar | Baca di waktu tenang; terapkan saat dibutuhkan | Di usia ini tantrum adalah bagian dari tumbuh kembang — panduan ini tentang respons, bukan pencegahan. |
| jumat | Ruang untuk Mencoba (dan Gagal) | Pagi atau sore, waktu bermain bebas | Anak yang merasa bebas mencoba lebih jarang frustrasi dengan ketidakberdayaan. |
| minggu | Ritual Tidur yang Menenangkan | Malam, mulai 30 menit sebelum jam tidur | Tidur cukup adalah perlindungan terbesar dari ledakan emosi di siang hari. |

**Catatan Review Fitri:** ___________________________________________


### [`wpt-008`] Belajar Bersama Dunia

**Tema:** 🤝 Sosial × 25–36 Bulan

**Deskripsi:** Empat aktivitas untuk mempersiapkan anak masuk ke dunia sosial yang lebih luas — bermain peran, giliran, membaca bersama, dan kesiapan berteman.

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
| senin | Bermain Pura-Pura | Sore, waktu bermain bebas | Ikuti skenario bermainnya — biarkan ia yang memimpin cerita. |
| rabu | Berkenalan dengan Dunia Bersama | Sebelum pergi ke tempat ramai atau bertemu teman baru | Ceritakan apa yang akan terjadi — anak yang siap lebih mudah beradaptasi. |
| jumat | Belajar Merasakan Perasaan Orang Lain | Saat bermain bersama anak lain atau saudara | Empati tidak dipaksakan — fasilitasi situasinya dan biarkan ia merasakannya sendiri. |
| minggu | Bermain dengan Bunyi dan Kata | Pagi, saat suasana tenang | Buku dan cerita adalah jembatan pertama ke dunia imajinasi bersama orang lain. |

**Catatan Review Fitri:** ___________________________________________


---

## Checklist Sebelum Rilis

- [ ] Semua teks di Bagian A ditandai ✅
- [ ] Sinyal caregiver lelah (⚠️) sudah disetujui — teks dan logika
- [ ] Semua modul di Bagian C ditandai ✅ (atau catatan revisi diserahkan ke Raisha)
- [ ] Modul 📌 tanpa sumber sudah diisi atau didiskusikan
- [ ] Tidak ada kata terlarang: normal · seharusnya · tertinggal · terlambat · rata-rata · streak · skor · peringkat
- [ ] `SHOW_DRAFT_CONTENT` di `planComposer.ts` di-set ke `false`

_Paket ini dihasilkan dari 36 modul · 8 template · 6 nilai_
