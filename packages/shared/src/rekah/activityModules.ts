// KONTEN: seluruh modul berstatus 'draft' — wajib review Psikolog Fitri sebelum rilis.
// Modul yang berasal dari Learning Strategies telah diadaptasi; original sumber
// tetap dicatat di sumberIds untuk keterlacakan.
// Modul dengan topik kesehatan/medis (SIDS, MPASI, imunisasi, dll.) DILEWATI —
// jalur review Apoteker/Dokter sebelum dimasukkan ke Rekah.

import type { NilaiId } from './values';
import type { AgeBandId } from './ageBands';

export type ActivityModuleId = string;

export type DurasiMenit = 5 | 10 | 15 | 20 | 30;

export interface ActivityModule {
  id: ActivityModuleId;
  judul: string;
  deskripsi: string;
  kenapaIni?: string;
  ageBands: AgeBandId[];
  nilaiUtama: NilaiId;
  nilaiPendukung?: NilaiId[];
  durasiMenit: DurasiMenit;
  bahan?: string[];
  langkah: string[];
  script?: string;
  avoid?: string;
  amati?: string;
  tipAyahBunda?: string;
  sumberIds?: string[];
  status: 'draft' | 'review' | 'published';
}

// ── Mandiri ───────────────────────────────────────────────────────────

export const ACTIVITY_MODULES: ActivityModule[] = [
  {
    id: 'am-001',
    judul: 'Waktu Bebas di Lantai',
    deskripsi: 'Beri bayi ruang aman untuk menjelajahi dan bergerak tanpa diarahkan.',
    kenapaIni: 'Ketika bayi diberi ruang bebas, ia melatih kemampuan memilih, fokus, dan mencoba tanpa diminta. Kepercayaan bahwa ia bisa sendiri tumbuh dari pengalaman kecil ini.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['percaya-diri'],
    durasiMenit: 15,
    bahan: ['Matras bersih', 'Satu atau dua mainan kontras'],
    langkah: [
      'Pastikan area bermain aman dan bersih.',
      'Letakkan bayi telungkup atau telentang di matras.',
      'Taruh satu mainan dalam jangkauan tapi tidak langsung di tangannya.',
      'Duduk di dekat — hadir tapi tidak mengarahkan.',
      'Komentari dengan hangat apa yang ia lakukan: "Kamu meraih mainannya!"',
    ],
    script: 'Yuk eksplorasi dulu ya. Bunda/Ayah ada di sini.',
    avoid: 'Terus-menerus mengarahkan atau membantu sebelum bayi mencoba sendiri.',
    amati: 'Apa yang menarik perhatian bayi? Ke mana ia meraih atau bergerak?',
    tipAyahBunda: 'Tahan dorongan untuk membantu segera — jedah kecil memberi bayi waktu membangun rasa mampu.',
    status: 'published',
  },

  {
    id: 'am-tummy-time',
    judul: 'Tummy Time: Angkat Kepala Sendiri',
    deskripsi: 'Latihan telungkup yang memperkuat otot leher dan bahu — fondasi gerak mandiri bayi.',
    kenapaIni: 'Setiap usaha mengangkat kepala adalah latihan pertama kemandirian fisik bayi. Otot yang kuat di sini menjadi fondasi untuk duduk, merangkak, dan akhirnya berjalan.',
    ageBands: ['0-6'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['percaya-diri'],
    durasiMenit: 5,
    langkah: [
      'Pilih saat bayi dalam kondisi segar, bukan setelah makan.',
      'Letakkan bayi telungkup di permukaan keras dan datar yang bersih.',
      'Berlutut atau berbaring di depannya setinggi wajahnya.',
      'Ajak bicara dengan nada hangat atau tunjukkan mainan warna cerah.',
      'Mulai dari 3–5 menit; tingkatkan secara bertahap sesuai toleransi bayi.',
    ],
    script: 'Wah, kamu bisa angkat kepala! Hebat ya!',
    avoid: 'Meninggalkan bayi tanpa pengawasan saat telungkup. Memaksakan terlalu lama jika bayi sudah menangis atau gelisah.',
    amati: 'Berapa lama ia menahan kepala? Apakah ia menoleh ke kiri dan kanan?',
    sumberIds: ['cdc-act-early', 'kemenkes-kia-kpsp'],
    status: 'draft',
  },

  {
    id: 'am-motorik',
    judul: 'Bebas Menjelajah Ruang Aman',
    deskripsi: 'Biarkan anak merangkak, memanjat, dan bergerak di lingkungan yang sudah dipastikan aman.',
    kenapaIni: 'Gerak adalah cara berpikir bagi anak kecil. Setiap eksplorasi fisik membangun kepercayaan diri bahwa tubuhnya bisa melakukan hal-hal baru.',
    ageBands: ['7-12', '13-18'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['percaya-diri'],
    durasiMenit: 15,
    langkah: [
      'Pastikan area bebas dari benda berbahaya (sudut tajam, benda kecil, kabel).',
      'Biarkan anak bergerak bebas tanpa diarahkan.',
      'Ikuti dari dekat untuk keamanan tapi tanpa terus-menerus mencegah.',
      'Bantu hanya jika ada risiko nyata, bukan sekadar kegagalan kecil.',
    ],
    script: 'Kamu bisa! Coba dulu ya.',
    avoid: 'Terus-menerus berkata "hati-hati" atau "jangan" untuk hal yang sebetulnya aman. Ini bisa menghambat rasa berani mencoba.',
    amati: 'Gerakan baru apa yang ia coba hari ini? Apa yang membuatnya bertahan mencoba?',
    sumberIds: ['kemenkes-kia-kpsp', 'cdc-act-early'],
    status: 'draft',
  },

  {
    id: 'am-object-perm',
    judul: 'Petak Umpet Benda',
    deskripsi: 'Sembunyikan mainan di bawah kain dan biarkan anak mencarinya sendiri.',
    kenapaIni: 'Memahami bahwa benda tetap ada meskipun tak terlihat adalah tonggak kognitif besar. Ini juga melatih ketekunan — fondasi kemandirian berpikir.',
    ageBands: ['7-12', '13-18'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['komunikatif'],
    durasiMenit: 10,
    bahan: ['Kain kecil atau handuk', 'Mainan favorit anak'],
    langkah: [
      'Tunjukkan mainan ke anak, biarkan ia melihatnya jelas.',
      'Tutup mainan dengan kain di depan matanya.',
      'Tanya dengan nada penasaran: "Mana perginya ya?"',
      'Beri jeda — biarkan ia mencari sendiri sebelum membantunya.',
      'Saat ia menemukannya, rayakan bersama!',
    ],
    script: 'Mana perginya ya? Ayo cari!',
    avoid: 'Langsung membuka kain jika anak kelihatan bingung — beri waktu dulu.',
    amati: 'Apakah ia langsung mencari, atau diam dulu? Ekspresinya saat menemukan?',
    sumberIds: ['kemenkes-kia-kpsp'],
    status: 'draft',
  },

  {
    id: 'am-kemandirian-praktis',
    judul: 'Mencoba Hal Kecil Sendiri',
    deskripsi: 'Biarkan anak mencoba keterampilan sehari-hari — memakai baju, makan sendiri, atau membereskan mainan.',
    kenapaIni: 'Keterampilan hidup sederhana adalah latihan kemandirian yang paling nyata. Biarkan prosesnya tidak sempurna — itulah tempat pembelajaran terjadi.',
    ageBands: ['13-18', '19-24'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['percaya-diri'],
    durasiMenit: 10,
    langkah: [
      'Pilih satu keterampilan kecil yang sesuai usia: pakai sepatu, makan dengan sendok, atau masukkan mainan ke wadah.',
      'Tunjukkan caranya sekali, dengan lambat.',
      'Beri anak giliran mencoba sendiri — tanpa bantuan kecuali diminta.',
      'Puji prosesnya apapun hasilnya: "Kamu sudah coba sendiri!"',
    ],
    script: 'Coba sendiri dulu ya. Kamu bisa!',
    avoid: 'Mengambil alih karena "lebih cepat". Kecepatan bukan tujuannya — prosesnya yang penting.',
    amati: 'Bagian mana yang ia kuasai? Bagian mana yang ia minta bantuan?',
    status: 'draft',
  },

  {
    id: 'am-makan-seru',
    judul: 'Waktu Makan Tanpa Pertempuran',
    deskripsi: 'Jadikan waktu makan momen menyenangkan dengan membagi peran: kamu sediakan pilihan sehat, anak tentukan berapa banyak.',
    kenapaIni: 'Anak yang bisa mendengar sinyal lapar dan kenyang tubuhnya tumbuh dengan hubungan yang sehat dengan makanan. Waktu makan yang tenang membangun otonomi — bukan pertarungan kuasa.',
    ageBands: ['13-18', '19-24', '25-36'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 20,
    langkah: [
      'Siapkan makanan dari pilihan yang kamu sediakan — tanpa negosiasi menu.',
      'Matikan layar dan duduk bersama.',
      'Beri pilihan kecil yang aman: "Mau nasi atau mi duluan?"',
      'Biarkan anak menentukan berapa banyak yang ia makan.',
      'Akhiri dengan kalimat positif apapun yang terjadi: "Tadi kita makan bersama, senang ya."',
    ],
    script: 'Mau mulai mana dulu? Kamu yang pilih.',
    avoid: 'Memaksa suapan terakhir atau menjanjikan dessert sebagai hadiah habis makan.',
    amati: 'Bagaimana ia menunjukkan kenyang? Apakah ia mencoba makanan baru sendiri?',
    tipAyahBunda: 'Tanggungjawabmu: menyediakan pilihan sehat. Tanggungjawab anak: berapa banyak yang dimakan.',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  {
    id: 'am-toilet',
    judul: 'Mengenal Isyarat Tubuh',
    deskripsi: 'Ajarkan anak mengenali isyarat ingin ke kamar mandi — tanpa tekanan dan timeline.',
    kenapaIni: 'Toilet training yang berhasil berakar dari anak yang mengenal tubuhnya sendiri, bukan dari jadwal yang dipaksakan dari luar.',
    ageBands: ['19-24', '25-36'],
    nilaiUtama: 'mandiri',
    durasiMenit: 10,
    langkah: [
      'Perhatikan tanda-tanda anak siap: bisa menahan beberapa menit, menunjukkan kesadaran basah/kotor, tertarik ke kamar mandi.',
      'Gunakan bahasa netral untuk tubuh: "Kamu mau pipis?"',
      'Jangan tunjukkan kekecewaan saat kecelakaan — normalisasi: "Gak apa-apa, kita ganti ya."',
      'Rayakan keberhasilan dengan hangat, bukan berlebihan.',
    ],
    script: 'Kamu mau ke kamar mandi? Yuk kita coba.',
    avoid: 'Menghukum kecelakaan atau membandingkan dengan anak lain.',
    amati: 'Tanda apa yang ia tunjukkan saat ingin ke kamar mandi? Semakin kamu mengenalnya, semakin mudah prosesnya.',
    sumberIds: ['aap-healthychildren', 'kemenkes-kia-kpsp'],
    status: 'draft',
  },

  {
    id: 'am-fungsi-eksekutif',
    judul: 'Bermain Simon Berkata',
    deskripsi: 'Permainan instruksi sederhana yang melatih kemampuan mendengar, menunggu, dan mengontrol diri.',
    kenapaIni: 'Kemampuan mengontrol impuls dan mengikuti aturan adalah komponen fungsi eksekutif yang berkembang pesat di usia 2–3 tahun. Permainan ini melatihnya dengan cara yang menyenangkan.',
    ageBands: ['19-24', '25-36'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 10,
    langkah: [
      'Mulai dengan instruksi sederhana: "Simon berkata... tepuk tangan!"',
      'Bergantian jadi pemimpin — beri anak giliran memberi instruksi.',
      'Tingkatkan kompleksitas secara bertahap.',
      'Fokus pada kesenangan bermain, bukan pada "menang" atau "kalah".',
    ],
    script: 'Simon berkata, sekarang giliran kamu yang berkata!',
    avoid: 'Membuat aturan terlalu kompleks terlalu cepat atau menekankan pada kalah.',
    amati: 'Berapa instruksi yang bisa ia ikuti sekaligus? Bagaimana reaksinya saat "kesalahan"?',
    status: 'draft',
  },

  {
    id: 'am-pilih-sendiri',
    judul: 'Kamu yang Pilih',
    deskripsi: 'Beri anak kesempatan membuat pilihan kecil dalam aktivitas sehari-hari — pakaian, urutan kegiatan, atau mainan.',
    kenapaIni: 'Membuat pilihan — bahkan yang kecil — membangun rasa otonomi dan kepercayaan diri anak. Ini juga mengembangkan kemampuan pengambilan keputusan sejak dini.',
    ageBands: ['25-36'],
    nilaiUtama: 'mandiri',
    nilaiPendukung: ['percaya-diri'],
    durasiMenit: 5,
    langkah: [
      'Siapkan 2–3 pilihan yang semuanya bisa kamu terima.',
      'Tawarkan dengan nada netral: "Mau baju ini atau itu?"',
      'Hormati pilihannya — jangan ubah setelah ia memilih kecuali ada alasan keamanan.',
      'Komentari positif: "Kamu sudah pilih sendiri!"',
    ],
    script: 'Kamu mau yang mana? Kamu yang pilih.',
    avoid: 'Memberikan terlalu banyak pilihan atau menarik kembali pilihannya. Ini bisa membuat anak frustrasi dan kehilangan kepercayaan pada prosesnya.',
    amati: 'Apakah ia bisa memilih dengan yakin? Atau butuh waktu lama? Keduanya wajar untuk usianya.',
    status: 'draft',
  },

  // ── Empatik ───────────────────────────────────────────────────────────

  {
    id: 'am-003',
    judul: 'Permainan Imitasi Wajah',
    deskripsi: 'Bayi belajar membaca emosi melalui wajah pengasuh — dasar dari empati dan koneksi sosial.',
    kenapaIni: 'Bayi hadir ke dunia dengan kemampuan menirukan ekspresi wajah. Setiap kali kamu membuat ekspresi dan bayi merespons, kalian sedang membangun fondasi empati bersama.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['sosial'],
    durasiMenit: 5,
    langkah: [
      'Duduk atau berbaring menghadap bayi, berjarak sekitar 30 cm.',
      'Buat ekspresi wajah yang jelas — senyum lebar, mulut bulat terkejut, dahi berkerut heran.',
      'Tunggu dan perhatikan respons bayi.',
      'Ulangi ekspresi yang tampaknya menarik minatnya.',
      'Akhiri dengan senyum dan kontak mata yang hangat.',
    ],
    script: 'Hei! Lihat Bunda/Ayah. (buat ekspresi terkejut) Wah!',
    avoid: 'Memaksa kontak mata jika bayi mengalihkan pandangan — itu bisa berarti ia butuh istirahat dari stimulasi.',
    amati: 'Ekspresi mana yang paling ia respons? Apakah ia mencoba menirukan?',
    tipAyahBunda: 'Tidak ada target yang harus dicapai. Momen koneksi itulah pelajarannya.',
    status: 'published',
  },

  {
    id: 'am-senyum-balas',
    judul: 'Dunia Pertama: Wajahmu',
    deskripsi: 'Hadirkan dirimu sepenuhnya — wajah, suara, dan ekspresi — sebagai koneksi pertama bayi ke dunia.',
    kenapaIni: 'Wajah pengasuh adalah "jendela dunia" pertama bayi. Bayi belajar bahwa dunia aman dan penuh kehangatan dari ekspresi yang menanggapinya.',
    ageBands: ['0-6'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 5,
    langkah: [
      'Pilih saat bayi dalam keadaan terjaga dan tenang.',
      'Dekatkan wajahmu ke jarak pandang bayi (~30cm).',
      'Senyum perlahan sambil memanggil namanya dengan lembut.',
      'Tunggu responsnya — tatapan, senyum, atau gerakan tangan.',
      'Balas dengan antusias tapi tidak berlebihan.',
    ],
    script: 'Hei kamu! Bunda senang sekali lihat kamu.',
    avoid: 'Scrolling layar sambil bersama bayi — bayi membutuhkan kehadiran penuh, bukan kehadiran fisik saja.',
    amati: 'Kapan pertama kali ia tersenyum sebagai respons terhadap senyummu?',
    status: 'draft',
  },

  {
    id: 'am-kelekatan',
    judul: 'Selalu Ada Saat Dibutuhkan',
    deskripsi: 'Tanggapi tangisan dan kebutuhan bayi dengan konsisten — ini membangun rasa aman yang menjadi fondasi semua perkembangan sosial-emosional.',
    kenapaIni: 'Bayi yang kebutuhannya direspons secara konsisten belajar bahwa dunia bisa dipercaya. Kelekatan yang aman ini menjadi fondasi kepercayaan pada orang lain sepanjang hidup.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 10,
    langkah: [
      'Saat bayi menangis, datang dengan tenang dan cepat.',
      'Identifikasi kebutuhannya: lapar, popok, butuh pelukan, atau kelelahan.',
      'Tanggapi dengan hangat dan konsisten.',
      'Saat menggendong, berbicara lembut: "Bunda di sini. Tenang ya."',
    ],
    script: 'Bunda di sini. Tenang ya, Bunda dengar kamu.',
    avoid: 'Membiarkan bayi menangis terlalu lama dengan harapan ia akan "belajar mandiri". Di usia ini, respons konsisten adalah yang membangun kemandirian sebenarnya.',
    amati: 'Bagaimana bayi menenangkan diri saat kamu hadir? Apa yang paling membuatnya tenang?',
    sumberIds: ['harvard-serve-return'],
    status: 'draft',
  },

  {
    id: 'am-joint-attention',
    judul: 'Melihat Bersama',
    deskripsi: 'Ikuti arah pandang atau jari anak — perhatian bersama adalah dasar komunikasi dan empati.',
    kenapaIni: 'Ketika anak menunjuk sesuatu dan kamu melihat ke arah yang sama, kalian sedang berbagi dunia. Ini adalah fondasi komunikasi, bahasa, dan kemampuan memahami perspektif orang lain.',
    ageBands: ['7-12', '13-18'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['komunikatif'],
    durasiMenit: 10,
    langkah: [
      'Perhatikan ke mana anak melihat atau menunjuk.',
      'Ikuti arah matanya dan komentari apa yang ia lihat: "Oh, burung! Kamu lihat burung!"',
      'Gantian — tunjukkan sesuatu yang menarik padanya dan perhatikan responsnya.',
      'Beri nama benda yang ia perhatikan.',
    ],
    script: 'Kamu lihat apa di sana? Oh, itu (nama benda)!',
    avoid: 'Mengalihkan perhatiannya ke hal yang menurutmu lebih menarik — ikuti minatnya dulu.',
    amati: 'Apakah ia memastikan kamu melihat hal yang sama dengannya? Ini adalah tanda perkembangan sosial penting.',
    sumberIds: ['harvard-serve-return', 'asha'],
    status: 'draft',
  },

  {
    id: 'am-temperamen',
    judul: 'Belajar Membaca Si Kecil',
    deskripsi: 'Amati dan kenali cara unik anak merespons dunia — temperamennya adalah petunjuk, bukan label.',
    kenapaIni: 'Setiap anak hadir dengan cara uniknya merespons dunia. Mengenali temperamennya membantu kamu menyesuaikan cara pendampingan agar lebih efektif dan minim gesekan.',
    ageBands: ['0-6', '7-12', '13-18', '19-24', '25-36'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 10,
    langkah: [
      'Amati: bagaimana ia merespons orang baru? Situasi baru? Perubahan rutinitas?',
      'Catatan mental (atau tulis): apa yang membuatnya nyaman? Apa yang membuatnya stres?',
      'Sesuaikan pendekatan: anak yang sensitif butuh transisi lebih lambat; anak aktif butuh lebih banyak gerak.',
      'Ingat: tidak ada temperamen yang "lebih baik" — semuanya punya kekuatan.',
    ],
    script: 'Aku perhatikan kamu suka waktu (isi observasimu). Aku mau sesuaikan ya.',
    avoid: 'Membandingkan temperamen anak dengan anak lain atau berusaha "mengubah" sifat dasarnya.',
    amati: 'Pola apa yang kamu lihat dalam seminggu terakhir? Apa yang paling membuatnya berkembang?',
    status: 'draft',
  },

  {
    id: 'am-keterampilan-sosial',
    judul: 'Belajar Merasakan Perasaan Orang Lain',
    deskripsi: 'Bantu anak mengenali bahwa orang lain juga punya perasaan — melalui cerita, permainan peran, atau momen nyata.',
    kenapaIni: 'Empati bukan sifat yang dimiliki atau tidak dimiliki — ia dipelajari. Anak yang sering diajak memikirkan perasaan orang lain berkembang menjadi orang yang lebih peduli.',
    ageBands: ['19-24', '25-36'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['sosial'],
    durasiMenit: 10,
    langkah: [
      'Manfaatkan momen nyata: saat anak melihat temannya menangis, tanya "Menurutmu temannya kenapa menangis?"',
      'Saat membaca buku, tanya "Menurutmu perasaan (karakter ini) sekarang apa?"',
      'Bantu anak merespons dengan cara yang tepat: "Kita bisa (tawari bantuan/hibur) ya."',
      'Apresiasi ketika ia menunjukkan kepedulian, sekecil apapun.',
    ],
    script: 'Menurutmu temannya sedang merasa apa ya? Apa yang bisa kita lakukan?',
    avoid: 'Memaksa anak untuk berbagi atau bersikap empati sebelum ia siap — empati yang dipaksakan tidak tumbuh dari dalam.',
    amati: 'Kapan anak menunjukkan kepedulian spontan? Situasi apa yang memunculkan empatinya?',
    status: 'draft',
  },

  {
    id: 'am-disiplin-empati',
    judul: 'Batas yang Ditetapkan dengan Kasih',
    deskripsi: 'Berikan aturan yang jelas dan konsisten — tapi dengan nada yang menghormati anak sebagai manusia yang sedang belajar.',
    kenapaIni: 'Anak membutuhkan batas yang jelas untuk merasa aman — tapi cara batas itu disampaikan menentukan apakah mereka belajar dari empati atau dari rasa takut.',
    ageBands: ['13-18', '19-24'],
    nilaiUtama: 'empatik',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 10,
    langkah: [
      'Saat perlu menetapkan batas, berlutut ke level anak dan kontak mata.',
      'Sebutkan perilaku yang tidak bisa dilanjutkan dan alasannya: "Melempar mainan bisa melukai. Kita simpan dulu."',
      'Tawarkan alternatif: "Kalau mau lempar, kita bisa lempar bola ke sini."',
      'Konsisten — batas yang sama berlaku setiap kali.',
    ],
    script: 'Aku mengerti kamu mau (keinginan anak). Dan ini tidak bisa dilanjutkan karena (alasan singkat). Kita bisa (alternatif) ya.',
    avoid: 'Berteriak, mengancam, atau memberi label ("Kamu nakal"). Perilaku yang bisa diperbaiki ≠ anak yang buruk.',
    amati: 'Bagaimana anak merespons batas yang disampaikan dengan tenang? Apakah ada cara penyampaian yang lebih ia terima?',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  // ── Percaya Diri ──────────────────────────────────────────────────────

  {
    id: 'am-genggam',
    judul: 'Genggam dan Eksplorasi',
    deskripsi: 'Letakkan benda-benda aman dengan tekstur berbeda dan biarkan bayi mengeksplorasi dengan tangannya.',
    kenapaIni: 'Ketika bayi berhasil menggenggam dan memegang sesuatu, ia merasakan rasa mampu pertamanya. Sensasi kecil ini adalah benih kepercayaan diri.',
    ageBands: ['0-6'],
    nilaiUtama: 'percaya-diri',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 10,
    bahan: ['Benda aman dengan tekstur berbeda: kain lembut, cincin plastik, mainan kayu halus'],
    langkah: [
      'Siapkan benda aman yang mudah digenggam oleh tangan kecil.',
      'Letakkan di telapak tangannya atau dekat jangkauannya.',
      'Beri waktu ia mengeksplorasi — rasa, pegang, angkat, goyangkan.',
      'Komentari dengan hangat apa yang ia lakukan.',
    ],
    script: 'Kamu berhasil pegang! Coba yang ini juga.',
    avoid: 'Meletakkan terlalu banyak benda sekaligus — satu atau dua cukup untuk fokus.',
    amati: 'Berapa lama ia bisa memegang? Apa yang paling menarik perhatiannya?',
    sumberIds: ['kemenkes-kia-kpsp'],
    status: 'draft',
  },

  {
    id: 'am-pilihan-kecil',
    judul: 'Dua Pilihan Kecil',
    deskripsi: 'Berikan dua pilihan yang keduanya bisa kamu terima — biarkan anak memutuskan.',
    kenapaIni: 'Pilihan kecil adalah latihan besar. Anak yang keputusannya dihargai sejak dini tumbuh dengan keyakinan bahwa pendapatnya penting.',
    ageBands: ['7-12', '13-18'],
    nilaiUtama: 'percaya-diri',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 5,
    langkah: [
      'Pilih momen yang tepat: saat berpakaian, memilih camilan, atau mainan.',
      'Tunjukkan dua pilihan dengan jelas: "Mau yang ini atau yang ini?"',
      'Tunggu jawabannya — dengan isyarat tangan, tatapan, atau kata.',
      'Hormati pilihannya dan lanjutkan.',
    ],
    script: 'Mau yang ini atau yang itu? Kamu yang pilih ya.',
    avoid: 'Memberikan lebih dari dua pilihan — terlalu banyak opsi membuat anak kewalahan.',
    amati: 'Bagaimana caranya menunjukkan pilihan? Tatapan, jangkauan tangan, atau kata-kata?',
    status: 'draft',
  },

  {
    id: 'am-coba-lagi',
    judul: 'Boleh Coba Lagi',
    deskripsi: 'Saat anak gagal atau frustasi, dukung proses mencoba lagi tanpa mengambil alih.',
    kenapaIni: 'Anak yang pernah didukung saat gagal akan lebih berani mencoba lagi. Ketangguhan tumbuh dari kegagalan kecil yang aman untuk dilalui.',
    ageBands: ['7-12', '13-18'],
    nilaiUtama: 'percaya-diri',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 10,
    langkah: [
      'Saat anak terlihat frustasi karena suatu tugas, hadir tapi jangan langsung mengambil alih.',
      'Akui perasaannya: "Susah ya. Kamu frustrasi karena ini."',
      'Beri semangat untuk mencoba lagi: "Mau coba sekali lagi?"',
      'Bantu hanya jika ia minta atau jika sudah terlalu lama frustasi.',
    ],
    script: 'Jatuh tidak apa-apa. Coba lagi ya, Bunda/Ayah di sini.',
    avoid: 'Langsung menyelesaikan tugas untuk anak atau berkata "Udah deh, nanti aja".',
    amati: 'Berapa kali ia mau mencoba sebelum menyerah? Bagaimana reaksinya saat akhirnya berhasil?',
    status: 'draft',
  },

  {
    id: 'am-pujian-proses',
    judul: 'Puji Prosesnya, Bukan Hasilnya',
    deskripsi: 'Alihkan pujian dari hasil ke usaha — "Kamu sudah berusaha keras" daripada "Pintar!"',
    kenapaIni: 'Pujian yang berfokus pada usaha mengajarkan anak bahwa kemampuan bisa tumbuh melalui latihan. Ini membangun ketangguhan yang bertahan jauh lebih lama dari pujian hasil.',
    ageBands: ['13-18', '19-24', '25-36'],
    nilaiUtama: 'percaya-diri',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 5,
    langkah: [
      'Perhatikan momen di mana anak berusaha — meski hasilnya tidak sempurna.',
      'Beri pujian spesifik pada prosesnya: "Kamu tadi fokus sekali waktu mencoba itu."',
      'Hindari pujian umum seperti "Pintar!" atau "Hebat!" — gantikan dengan yang lebih konkret.',
      'Saat hasil memang bagus, sambungkan ke usaha: "Hasilnya bagus karena kamu sudah latihan."',
    ],
    script: 'Aku lihat kamu tadi berusaha keras. Itu yang paling penting!',
    avoid: 'Memuji kecerdasan atau bakat bawaan — "Kamu memang pinter" membuat anak takut tampak bodoh saat gagal.',
    amati: 'Bagaimana anak merespons pujian proses dibanding pujian hasil? Apakah ia terlihat lebih berani mencoba hal baru?',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  {
    id: 'am-bebas-mencoba',
    judul: 'Ruang untuk Mencoba (dan Gagal)',
    deskripsi: 'Sediakan aktivitas atau situasi di mana anak bisa mencoba hal baru dengan risiko kecil — tidak apa-apa kalau hasilnya tidak sempurna.',
    kenapaIni: 'Anak yang punya ruang aman untuk gagal belajar bahwa kegagalan bukan akhir — itu bagian dari proses. Inilah fondasi kepercayaan diri jangka panjang.',
    ageBands: ['19-24', '25-36'],
    nilaiUtama: 'percaya-diri',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 15,
    bahan: ['Pilih aktivitas dengan "risiko aman": menggambar, membangun balok, memasak sederhana'],
    langkah: [
      'Pilih aktivitas yang memungkinkan berbagai cara benar.',
      'Sampaikan di awal: "Tidak ada cara yang salah di sini."',
      'Biarkan anak menentukan caranya sendiri.',
      'Jika ia tidak puas dengan hasilnya, validasi: "Kamu ingin lebih baik — boleh coba lagi."',
    ],
    script: 'Coba saja dulu. Tidak ada salah atau benar di sini.',
    avoid: 'Mengoreksi cara anak mengerjakan sesuatu selama hasilnya tidak berbahaya.',
    amati: 'Seberapa lama ia mau mencoba sesuatu yang baru? Apakah ia semakin berani dari waktu ke waktu?',
    status: 'draft',
  },

  // ── Regulasi Emosi ────────────────────────────────────────────────────

  {
    id: 'am-rutinitas',
    judul: 'Ritme Hari yang Konsisten',
    deskripsi: 'Bangun rutinitas harian yang bisa diprediksi — bukan jadwal kaku, tapi alur yang anak kenal.',
    kenapaIni: 'Rutinitas yang bisa diprediksi memberi sinyal aman pada sistem saraf bayi dan anak kecil. Ketika anak tahu apa yang akan terjadi, energinya bisa lebih terfokus pada eksplorasi dan belajar.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'regulasi-emosi',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 10,
    langkah: [
      'Tetapkan alur sederhana: makan → bermain → tidur siang → bermain → mandi → tidur malam.',
      'Umumkan transisi dengan kata-kata: "Sebentar lagi waktu tidur ya."',
      'Pertahankan alur yang sama — fleksibel dalam waktu spesifik, konsisten dalam urutannya.',
      'Gunakan isyarat visual atau lagu pendek sebagai penanda transisi.',
    ],
    script: 'Sebentar lagi kita (aktivitas berikutnya) ya. Sekarang kita selesaikan ini dulu.',
    avoid: 'Perubahan rutinitas mendadak tanpa pemberitahuan — anak kecil butuh waktu untuk transisi.',
    amati: 'Kapan anak paling tenang? Kapan ia paling rewel? Apakah ada pola yang berkaitan dengan rutinitas?',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  {
    id: 'am-ko-regulasi',
    judul: 'Duduk Bersamanya yang Tenang',
    deskripsi: 'Saat anak kewalahan, hadir dengan tenang — ketenangan kamu menular ke sistem saraf anak.',
    kenapaIni: 'Anak belum bisa menenangkan diri sendiri — ia belajar caranya dari pengasuh yang hadir dan tenang. Ketenangan kamu bukan sesuatu yang bisa diperintahkan ke anak; itu harus ditularkan.',
    ageBands: ['0-6', '7-12', '13-18'],
    nilaiUtama: 'regulasi-emosi',
    nilaiPendukung: ['empatik'],
    durasiMenit: 10,
    langkah: [
      'Saat anak kewalahan, hadir secara fisik — dekat, tapi tidak memaksa.',
      'Atur napas sendiri dulu sebelum bereaksi.',
      'Gunakan nada suara yang pelan dan stabil.',
      'Kontak fisik jika anak mau: pelukan atau tepukan lembut.',
      'Tidak perlu banyak kata — kehadiran yang tenang sudah cukup.',
    ],
    script: 'Aku di sini. Pelan-pelan ya. Kita tenang bersama.',
    avoid: 'Bereaksi dengan panik atau frustrasi saat anak menangis keras — respons emosional kamu akan menambah intensitas.',
    amati: 'Apa yang paling membantu anak menenangkan diri? Kontak fisik, suara, atau jarak?',
    sumberIds: ['harvard-serve-return'],
    status: 'draft',
  },

  {
    id: 'am-tantrum',
    judul: 'Saat Perasaan Membesar',
    deskripsi: 'Hadapi tantrum dengan ketenangan — bukan sebagai perang, tapi sebagai momen anak belajar mengelola emosi besar.',
    kenapaIni: 'Tantrum bukan manipulasi — ini cara otak yang sedang berkembang menunjukkan bahwa sistem regulasinya terbebani. Respons hangat mengajarkan lebih banyak daripada reaksi keras.',
    ageBands: ['13-18', '19-24', '25-36'],
    nilaiUtama: 'regulasi-emosi',
    nilaiPendukung: ['empatik'],
    durasiMenit: 10,
    langkah: [
      'Pastikan keamanan fisik anak terlebih dahulu.',
      'Tetap tenang — tarik napas dalam jika perlu.',
      'Hadir secara fisik, dekat tapi tidak terlalu memaksa.',
      'Tidak perlu banyak bicara saat puncak tantrum — tunggu reda.',
      'Setelah tenang, akui perasaannya: "Kamu tadi sedih ya karena tidak bisa (hal itu)."',
    ],
    script: 'Kamu sedang sedih ya. Wajar sedih. Bunda di sini.',
    avoid: 'Memberikan apa yang diminta saat tantrum (akan menguatkan perilaku), atau menghukum/mengisolasi anak saat emosional.',
    amati: 'Apa yang biasanya memicu tantrum? Apakah ada pola — waktu tertentu atau kebutuhan tertentu (lapar, ngantuk, frustrasi)?',
    tipAyahBunda: 'Ini melelahkan. Boleh meminta waktu sendiri sejenak kalau kamu butuh.',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  {
    id: 'am-nama-perasaan',
    judul: 'Kenalkan Nama Perasaan',
    deskripsi: 'Bantu anak menamai apa yang ia rasakan — bahasa emosi adalah kunci regulasi diri.',
    kenapaIni: '"Bisa menyebut = bisa mengelola." Anak yang punya kosa kata emosi lebih mampu mengelola perasaannya — bukan karena ia tidak merasakan, tapi karena ia tahu caranya mengungkapkan.',
    ageBands: ['13-18', '19-24'],
    nilaiUtama: 'regulasi-emosi',
    nilaiPendukung: ['komunikatif'],
    durasiMenit: 10,
    langkah: [
      'Perhatikan ekspresi dan perilaku anak sepanjang hari.',
      'Beri nama perasaan saat muncul: "Kamu kelihatan senang sekali!"',
      'Saat emosi negatif muncul, namakan tanpa menghakimi: "Kamu kelihatan kesal ya?"',
      'Gunakan buku bergambar atau kartu emosi untuk mengenalkan kosakata baru.',
    ],
    script: 'Kamu kelihatan (nama perasaan) ya. Wajar ngerasa begitu.',
    avoid: 'Berkata "Jangan nangis" atau "Tidak ada yang perlu ditakutkan" — ini melarang perasaan, bukan membantunya.',
    amati: 'Kosakata emosi apa yang mulai ia gunakan sendiri? Itu petunjuk bagian mana yang sudah ia kuasai.',
    status: 'draft',
  },

  {
    id: 'am-tidur-sehat',
    judul: 'Ritual Tidur yang Menenangkan',
    deskripsi: 'Bangun urutan kegiatan yang konsisten sebelum tidur — ini sinyal kuat untuk otak anak bahwa waktunya istirahat.',
    kenapaIni: 'Ritual tidur yang konsisten mengajarkan otak untuk bersiap istirahat. Tidur yang cukup adalah fondasi regulasi emosi di siang hari.',
    ageBands: ['0-6', '7-12', '13-18', '19-24', '25-36'],
    nilaiUtama: 'regulasi-emosi',
    durasiMenit: 15,
    langkah: [
      'Tetapkan urutan yang sama setiap malam: mandi → ganti baju → buku/nyanyian → tidur.',
      'Matikan layar setidaknya 30 menit sebelum tidur.',
      'Gunakan cahaya redup dan suara yang tenang.',
      'Umumkan tahapan dengan kata-kata: "Sekarang waktunya buku, lalu tidur."',
    ],
    script: 'Sekarang saatnya istirahat. Besok kita main lagi ya.',
    avoid: 'Layar sebagai penenang sebelum tidur — cahaya biru mengganggu sinyal tidur otak.',
    amati: 'Berapa menit dari ritual dimulai sampai anak tertidur? Bagian ritual mana yang paling menenangkannya?',
    sumberIds: ['aap-aasm-sleep', 'aap-healthychildren'],
    status: 'draft',
  },

  // ── Komunikatif ───────────────────────────────────────────────────────

  {
    id: 'am-serve-return',
    judul: 'Balas-Balasan',
    deskripsi: 'Respons ocehan, gerakan, atau tatapan bayi — setiap balasan mengajarkan dasar komunikasi.',
    kenapaIni: 'Percakapan adalah dua arah. Setiap kali kamu menanggapi ocehan atau tatapan bayi, kamu mengajarinya prinsip dasar ini. Interaksi bolak-balik membangun jutaan koneksi saraf di otak bayi.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'komunikatif',
    nilaiPendukung: ['empatik'],
    durasiMenit: 5,
    langkah: [
      'Perhatikan sinyal bayi: ocehan, tatapan, gerakan tangan, ekspresi.',
      'Balas dengan nada hangat — tirukan suaranya atau tambahkan kata-kata.',
      'Beri jeda setelah merespons — tunggu gilirannya lagi.',
      'Ulangi selama ia masih responsif.',
    ],
    script: 'Oh ya? Cerita dong lebih! (sambil menirukan suara atau ekspresinya)',
    avoid: 'Berbicara terus-menerus tanpa memberi jeda untuk responsnya — jeda adalah bagian terpenting dari komunikasi.',
    amati: 'Bayi mencoba meniru suaramu? Ini tanda kesiapan berbicara yang luar biasa!',
    sumberIds: ['harvard-serve-return', 'harvard-brain', 'asha'],
    status: 'draft',
  },

  {
    id: 'am-002',
    judul: 'Membaca Buku Bersama',
    deskripsi: 'Duduk bersama dan ceritakan gambar-gambar sederhana untuk membangun kosakata dan koneksi.',
    kenapaIni: 'Membaca bersama bukan tentang isi ceritanya — tapi tentang momen berbagi perhatian, mendengar suaramu, dan belajar bahwa gambar mewakili sesuatu yang nyata.',
    ageBands: ['7-12', '13-18', '19-24'],
    nilaiUtama: 'komunikatif',
    nilaiPendukung: ['empatik'],
    durasiMenit: 10,
    bahan: ['Buku bergambar dengan ilustrasi sederhana'],
    langkah: [
      'Pilih waktu tenang — setelah makan atau sebelum tidur.',
      'Duduk bersama anak di pangkuan atau berdampingan.',
      'Tunjuk gambar dan namakan: "Ini anjing. Anjing bilang guk-guk."',
      'Beri jeda dan ikuti ke mana anak melihat atau menunjuk.',
      'Tidak apa-apa tidak mengikuti urutan halaman — ikuti minatnya.',
    ],
    script: 'Ini apa ya? Oh, (nama benda)! Kamu lihat juga?',
    avoid: 'Memaksa anak duduk diam dan mendengarkan dari awal sampai akhir — biarkan ia aktif selama prosesnya.',
    amati: 'Halaman atau gambar mana yang paling ia sukai? Di situ tempatnya belajar paling banyak.',
    tipAyahBunda: 'Lima menit yang terfokus lebih berharga dari dua puluh menit yang terburu-buru.',
    status: 'published',
  },

  {
    id: 'am-tonggak-bahasa',
    judul: 'Bicara Sepanjang Hari',
    deskripsi: 'Jadikan aktivitas sehari-hari momen belajar bahasa — narasi apa yang sedang kamu lakukan bersama anak.',
    kenapaIni: 'Otak bayi sedang membangun "peta bahasa" dari semua yang ia dengar. Berbicara sambil melakukan aktivitas nyata adalah cara paling alami dan efektif untuk memperkayanya.',
    ageBands: ['0-6', '7-12', '13-18', '19-24'],
    nilaiUtama: 'komunikatif',
    durasiMenit: 10,
    langkah: [
      'Narasikan aktivitas yang kamu lakukan bersama anak: "Sekarang kita mandi. Ini air hangatnya…"',
      'Gunakan bahasa yang sederhana dan kalimat pendek.',
      'Ulangi kata-kata kunci beberapa kali dalam konteks yang berbeda.',
      'Variasikan: bernyanyi, bercerita, menyebut nama benda di sekitar.',
    ],
    script: 'Sekarang kita (aktivitas). Ini (nama benda)nya — (deskripsi singkat).',
    avoid: 'Berbicara dalam nada datar atau monoton — variasi nada membantu bayi memperhatikan lebih lama.',
    amati: 'Kata apa yang pertama kali ia coba ucapkan? Biasanya kata yang paling sering ia dengar dalam konteks yang bermakna.',
    sumberIds: ['asha', 'harvard-brain'],
    status: 'draft',
  },

  {
    id: 'am-pra-literasi',
    judul: 'Bermain dengan Bunyi dan Kata',
    deskripsi: 'Ajak anak bermain rima, sajak, dan tebak-tebakan bunyi — fondasi kemampuan membaca.',
    kenapaIni: 'Kemampuan membaca dibangun jauh sebelum anak mengenal huruf. Bermain dengan bunyi dan rima mengajarkan bahwa bahasa punya pola — fondasi terpenting literasi.',
    ageBands: ['13-18', '19-24', '25-36'],
    nilaiUtama: 'komunikatif',
    nilaiPendukung: ['mandiri'],
    durasiMenit: 10,
    langkah: [
      'Nyanyikan lagu dengan bunyi berulang atau rima sederhana.',
      'Buat permainan sederhana: "Cari benda yang bunyinya sama dengan BOLA!"',
      'Baca buku dengan rima keras-keras dan ekspresif.',
      'Bertepuk tangan mengikuti suku kata nama anak.',
    ],
    script: 'Bola! Bola! Apa yang satu bunyi dengan bola? (Cola? Kola? Bisa apa saja — yang penting bersenang-senang!)',
    avoid: 'Mengoreksi jika anak membuat kata-kata "tidak ada" — kreativitas bahasa adalah tanda otak yang aktif.',
    amati: 'Apakah anak mulai membuat rima sendiri? Ini tanda perkembangan literasi yang baik.',
    sumberIds: ['asha'],
    status: 'draft',
  },

  {
    id: 'am-koneksi-nyata',
    judul: 'Matikan Layar, Nyalakan Koneksi',
    deskripsi: 'Gantikan waktu layar dengan interaksi langsung — percakapan, nyanyian, atau eksplorasi bersama.',
    kenapaIni: 'Bayi dan anak kecil belajar bahasa, emosi, dan sosial dari interaksi manusia — bukan dari layar. Satu menit percakapan langsung nilainya lebih dari sepuluh menit video edukasi.',
    ageBands: ['0-6', '7-12', '13-18', '19-24', '25-36'],
    nilaiUtama: 'komunikatif',
    durasiMenit: 15,
    langkah: [
      'Pilih satu waktu sehari untuk benar-benar bebas dari layar — misal saat makan atau sebelum tidur.',
      'Isi waktu itu dengan interaksi langsung: cerita, nyanyian, eksplorasi benda sekitar.',
      'Jika sulit, mulai kecil: 15 menit tanpa layar sudah bermakna.',
    ],
    script: 'Yuk, mainan dulu ya. HP Bunda/Ayah simpan dulu.',
    avoid: 'Memberikan layar sebagai penenang setiap kali anak bosan atau rewel — ini mengurangi kesempatan belajar regulasi emosi dari pengalaman nyata.',
    amati: 'Apa yang anak lakukan saat tidak ada layar? Seringkali kreativitas dan eksplorasi muncul di sana.',
    sumberIds: ['aap-media'],
    status: 'draft',
  },

  // ── Sosial ────────────────────────────────────────────────────────────

  {
    id: 'am-bercerita-bersama',
    judul: 'Bernyanyi dan Bercerita Bersama',
    deskripsi: 'Nyanyikan lagu sederhana atau ceritakan kisah kecil sambil menatap mata bayi.',
    kenapaIni: 'Nyanyian dan cerita adalah cara pertama anak belajar bahwa berbagi pengalaman menyenangkan. Ritme dan nada membantu membangun koneksi sosial-emosional yang dalam.',
    ageBands: ['0-6', '7-12'],
    nilaiUtama: 'sosial',
    nilaiPendukung: ['komunikatif'],
    durasiMenit: 10,
    langkah: [
      'Pilih lagu sederhana yang kamu suka — tidak perlu khusus lagu anak.',
      'Nyanyikan dengan nada yang hangat sambil menatap matanya.',
      'Tambahkan gerakan tangan atau tepukan yang bisa ia ikuti.',
      'Perhatikan responsnya — apakah ia bergerak, tersenyum, atau mencoba bersuara?',
    ],
    script: '(Nyanyikan lagu favorit keluarga dengan penuh kehangatan)',
    avoid: 'Berhenti karena merasa suaramu tidak bagus — bayi tidak peduli dengan kualitas suara, hanya dengan kehangatan yang menyertainya.',
    amati: 'Bagaimana tubuh bayi bergerak saat mendengar musik? Ritme tubuhnya adalah ekspresi sosial pertamanya.',
    status: 'draft',
  },

  {
    id: 'am-bermain-paralel',
    judul: 'Bermain Berdampingan',
    deskripsi: 'Biarkan batita bermain di dekat anak lain tanpa memaksa interaksi langsung — ini adalah tonggak sosial yang sehat untuk usianya.',
    kenapaIni: 'Sebelum bermain bersama, batita perlu dulu belajar nyaman bermain di samping orang lain. Ini disebut bermain paralel — tahap sosial yang tepat untuk usia ini, bukan tanda kurang pergaulan.',
    ageBands: ['13-18', '19-24'],
    nilaiUtama: 'sosial',
    nilaiPendukung: ['empatik'],
    durasiMenit: 15,
    langkah: [
      'Atur situasi di mana ada anak lain di ruangan yang sama — taman, rumah saudara, atau kumpul keluarga.',
      'Sediakan mainan serupa untuk masing-masing anak agar tidak berebut.',
      'Biarkan mereka bermain masing-masing tanpa dipaksa berinteraksi.',
      'Komentari dengan hangat jika ada momen natural: "Kamu dan teman kamu pakai balok yang sama!"',
      'Jangan paksa berbagi — biarkan momen berbagi datang sendiri.',
    ],
    script: 'Main di sini ya, ada teman juga. Seru!',
    avoid: 'Memaksa anak berinteraksi atau berbagi sebelum ia siap — ini membuat bermain sosial terasa seperti tekanan, bukan kesenangan.',
    amati: 'Apakah ia sesekali melirik anak lain? Meniru apa yang dilakukan temannya? Ini tanda kesiapan bermain bersama yang akan datang.',
    sumberIds: ['aap-healthychildren'],
    status: 'draft',
  },

  {
    id: 'am-005',
    judul: 'Bermain Pura-Pura',
    deskripsi: '"Masak-masakan" atau "dokter-dokteran" membantu anak memproses pengalaman nyata dan berlatih kehidupan sosial.',
    kenapaIni: 'Dalam bermain pura-pura, anak sedang berlatih menjadi bagian dari dunia sosial — mengambil peran, bernegosiasi, dan memahami bahwa orang lain punya perspektif yang berbeda.',
    ageBands: ['19-24', '25-36'],
    nilaiUtama: 'sosial',
    nilaiPendukung: ['komunikatif', 'empatik'],
    durasiMenit: 20,
    bahan: ['Peralatan rumah tangga aman', 'Mainan dokter atau dapur (opsional)', 'Imajinasi!'],
    langkah: [
      'Ikuti lead anak — tanya "Kita main apa hari ini?"',
      'Ambil peran yang anak berikan, jangan merebut kendali cerita.',
      'Perluas narasi: "Oh bonekanya sakit ya? Sakit apa?"',
      'Beri karakter emosi yang nyata: "Dokternya baik sekali, pasiennya jadi tidak takut."',
      'Biarkan permainan berakhir secara alami.',
    ],
    script: 'Aku jadi (peran yang ia berikan) ya. Apa yang harus aku lakukan?',
    avoid: 'Merebut kendali cerita atau selalu menjadi "yang memimpin" permainan.',
    amati: 'Tema apa yang sering muncul dalam permainannya? Seringkali ia sedang memproses pengalaman nyata di hidupnya.',
    tipAyahBunda: 'Bermain peran adalah cara anak memproses dunia. Jika ia bermain "marah-marahan", ikuti dan dukung — bukan dihentikan.',
    status: 'published',
  },

  {
    id: 'am-giliran',
    judul: 'Kamu Dulu, Baru Aku',
    deskripsi: 'Latih giliran dalam permainan sederhana — membangun kesadaran bahwa orang lain punya kebutuhan juga.',
    kenapaIni: 'Belajar menunggu giliran adalah salah satu keterampilan sosial pertama yang dikuasai anak. Ini membutuhkan pengendalian impuls dan pemahaman perspektif orang lain.',
    ageBands: ['13-18', '19-24'],
    nilaiUtama: 'sosial',
    nilaiPendukung: ['regulasi-emosi'],
    durasiMenit: 10,
    langkah: [
      'Mulai dengan permainan giliran yang sangat jelas: lempar-tangkap bola, giliran mewarnai, atau giliran berbicara.',
      'Beri nama dengan eksplisit: "Sekarang giliran kamu. Sekarang giliran Bunda."',
      'Beri waktu tunggu yang pendek dulu — tingkatkan bertahap.',
      'Puji saat ia berhasil menunggu: "Kamu tadi menunggu giliran dengan baik!"',
    ],
    script: 'Sekarang giliran kamu. Nanti giliran Bunda ya.',
    avoid: 'Selalu memenangkan anak dalam permainan atau langsung memberi jika ia tidak sabar.',
    amati: 'Berapa lama ia bisa menunggu? Apa yang membantunya bertahan menunggu?',
    status: 'draft',
  },

  {
    id: 'am-kesiapan-sosial',
    judul: 'Berkenalan dengan Dunia Bersama',
    deskripsi: 'Bawa anak ke situasi sosial kecil — taman, rumah saudara, atau kelompok bermain — dan dampingi prosesnya.',
    kenapaIni: 'Kemampuan bermain dan bekerja sama dengan orang lain dibangun dari banyak percobaan kecil. Setiap interaksi, bahkan yang canggung, adalah latihan berharga.',
    ageBands: ['25-36'],
    nilaiUtama: 'sosial',
    nilaiPendukung: ['empatik'],
    durasiMenit: 20,
    langkah: [
      'Pilih situasi sosial yang tidak terlalu ramai atau berisik untuk memulai.',
      'Dampingi tanpa mengambil alih interaksi anak dengan orang lain.',
      'Beri anak kata-kata yang bisa ia gunakan: "Kamu bisa bilang \'boleh ikut main?\'."',
      'Normalisasi jika ia butuh waktu untuk hangat — tidak perlu dipaksa.',
    ],
    script: 'Itu temannya. Kamu mau kenalan? Bisa bilang hai dulu.',
    avoid: 'Memaksa anak berinteraksi jika ia jelas tidak mau — beri waktu untuk mengamati dulu.',
    amati: 'Kapan anak mulai nyaman? Berapa lama ia biasanya butuh untuk "hangat" di lingkungan baru?',
    sumberIds: ['cdc-act-early'],
    status: 'draft',
  },
];

// ── Validation util ───────────────────────────────────────────────────

export type CoverageGap = { nilaiId: NilaiId; ageBandId: AgeBandId };

export function findCoverageGaps(modules: ActivityModule[]): CoverageGap[] {
  const NILAI_IDS: NilaiId[] = [
    'mandiri', 'empatik', 'percaya-diri', 'regulasi-emosi', 'komunikatif', 'sosial',
  ];
  const AGE_BAND_IDS: AgeBandId[] = ['0-6', '7-12', '13-18', '19-24', '25-36'];
  const gaps: CoverageGap[] = [];

  for (const nilaiId of NILAI_IDS) {
    for (const ageBandId of AGE_BAND_IDS) {
      const count = modules.filter(m => {
        const hasNilai =
          m.nilaiUtama === nilaiId || (m.nilaiPendukung?.includes(nilaiId) ?? false);
        const hasAge = m.ageBands.includes(ageBandId);
        return hasNilai && hasAge;
      }).length;

      if (count < 2) {
        gaps.push({ nilaiId, ageBandId });
      }
    }
  }
  return gaps;
}
