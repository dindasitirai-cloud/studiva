// =============================================================
// KONTEN FITUR AKAR KELUARGA
// STATUS: DRAFT — wajib review & persetujuan Psikolog Fitri Effendy
// sebelum rilis produksi. Jangan ubah copy tanpa melalui review.
// =============================================================

export const NILAI = ["Kejujuran","Syukur","Kasih Sayang","Empati","Kemandirian","Tanggung Jawab","Kesederhanaan","Cinta Ilmu","Sabar","Berbagi","Keberanian","Hormat pada Sesama"] as const;

/** Union type dari 12 nilai Akar Keluarga. Ejaan harus cocok persis. */
export type NilaiAkar = typeof NILAI[number];

export const TANAH = ["Makan bersama","Membacakan buku","Waktu tanpa layar","Silaturahmi rutin","Bermain di alam","Cerita sebelum tidur","Berbagi pada sesama","Olahraga keluarga"] as const;

export const CONTOH_VISI = [
  "Rumah yang hangat, tempat anak tumbuh tanpa takut mencoba.",
  "Keluarga pembelajar yang jujur dan saling menguatkan."
];

export interface BandInfo { usia: string; judul: string; nilaiInti: string; sains: string; }
export interface MateriItem { judul: string; deskripsi: string; nilai: string[]; }

export const BANDS: BandInfo[] = [
  { usia: "0–3 bl",  judul: "Rasa Aman Pertama",      nilaiInti: "Kelekatan sebagai fondasi seluruh nilai",
    sains: "Bayi mengenali suara orang tua sejak dalam kandungan; respons konsisten terhadap tangisan membangun kelekatan aman — fondasi empati dan nilai di masa depan." },
  { usia: "3–6 bl",  judul: "Irama Rumah",            nilaiInti: "Rutinitas yang menenangkan",
    sains: "Bayi mulai membedakan nada emosi; ritme harian yang stabil menurunkan stres dan melatih regulasi diri sejak dini." },
  { usia: "6–9 bl",  judul: "Mata yang Mengamati",    nilaiInti: "Teladan sebelum kata",
    sains: "Bayi mengamati dan mengingat rutinitas orang di sekitarnya; kebiasaan yang dilihat berulang terekam sebagai 'normal'-nya dunia." },
  { usia: "9–12 bl", judul: "Perhatian Bersama",      nilaiInti: "Menunjuk hal yang bermakna",
    sains: "Joint attention berkembang pesat di 9–12 bulan — bayi mengikuti arah pandang orang tua dan belajar apa yang penting bagi keluarganya." },
  { usia: "12–18 bl",judul: "Peniru Kecil",           nilaiInti: "Belajar lewat meniru",
    sains: "Imitasi responsif balita memprediksi tumbuhnya hati nurani di usia prasekolah; empati primitif sudah muncul sejak 14 bulan." },
  { usia: "18–24 bl",judul: "Kata-Kata Baik Pertama", nilaiInti: "Terima kasih, maaf, tolong",
    sains: "Ledakan bahasa dimulai — frasa sosial pendek yang diulang setiap hari mudah diserap dan melekat lama." },
  { usia: "2–3 th",  judul: "Dunia yang Baik",        nilaiInti: "Rasa aman + kejujuran sederhana",
    sains: "Kehangatan pengasuh membentuk cara anak memandang dunia; cerita moral positif efektif menanamkan kejujuran sejak usia 3 tahun." },
  { usia: "3–4 th",  judul: "Kisah dan Kagum",        nilaiInti: "Karakter lewat cerita + syukur",
    sains: "Metode kisah membekas kuat dalam ingatan anak, dan praktik syukur sejak dini meningkatkan resiliensi emosional." },
  { usia: "4–5 th",  judul: "Bermain Bersama Nilai",  nilaiInti: "Kerja sama + aturan main",
    sains: "Permainan kelompok melatih empati, menunggu giliran, dan kompromi; identitas moral awal mulai terbentuk." },
  { usia: "5–6 th",  judul: "Menuju Mandiri",         nilaiInti: "Tanggung jawab + identitas baik",
    sains: "Identitas moral menguat di usia 5–6 tahun; konsekuensi logis dan apresiasi terhadap usaha jauh lebih efektif daripada hukuman." }
];

export const MATERI: MateriItem[][] = [
  [ // 0–3 bl
    { judul: "Kontak mata & sapaan lembut", deskripsi: "Menyapa bayi dengan wajah dekat setiap kali terbangun.", nilai: ["Kasih Sayang"] },
    { judul: "Merespons tangisan dengan tenang", deskripsi: "Hadir konsisten — bayi belajar dunia bisa dipercaya.", nilai: ["Kasih Sayang","Sabar"] },
    { judul: "Sentuhan & pijat bayi", deskripsi: "Pijat ringan sambil mengajak bicara pelan.", nilai: ["Kasih Sayang"] },
    { judul: "Bergumam & bernyanyi bersama", deskripsi: "Membalas suara bayi seperti percakapan.", nilai: ["Cinta Ilmu","Empati"] },
    { judul: "Mengenalkan wajah keluarga", deskripsi: "Menyebut nama anggota keluarga saat menggendong.", nilai: ["Hormat pada Sesama"] }
  ],
  [ // 3–6 bl
    { judul: "Ritual tidur yang sama", deskripsi: "Lagu atau cerita pendek yang berulang tiap malam.", nilai: ["Sabar","Kesederhanaan"] },
    { judul: "Membacakan buku kontras", deskripsi: "Buku kain sederhana, dibaca dengan suara ekspresif.", nilai: ["Cinta Ilmu"] },
    { judul: "Cilukba & permainan wajah", deskripsi: "Melatih antisipasi dan kegembiraan bersama.", nilai: ["Cinta Ilmu","Keberanian"] },
    { judul: "Membalas ocehan bayi", deskripsi: "Setiap suara dibalas — dasar percakapan dan empati.", nilai: ["Empati","Kasih Sayang"] },
    { judul: "Tummy time didampingi", deskripsi: "Memberi ruang berusaha sambil ditemani.", nilai: ["Kemandirian","Keberanian"] }
  ],
  [ // 6–9 bl
    { judul: "Melihat kebiasaan baik keluarga", deskripsi: "Bayi mengamati orang tua berterima kasih & menolong.", nilai: ["Hormat pada Sesama","Berbagi"] },
    { judul: "Ikut duduk di meja makan", deskripsi: "Merasakan kebersamaan makan keluarga.", nilai: ["Syukur","Kesederhanaan"] },
    { judul: "Bermain sebab-akibat", deskripsi: "Menjatuhkan, menekan, membunyikan — rasa ingin tahu.", nilai: ["Cinta Ilmu"] },
    { judul: "Memberi & menerima mainan", deskripsi: "Latihan pertama memberi dengan gembira.", nilai: ["Berbagi"] },
    { judul: "Eksplorasi merangkak aman", deskripsi: "Rumah disiapkan agar bayi bebas menjelajah.", nilai: ["Kemandirian","Keberanian"] }
  ],
  [ // 9–12 bl
    { judul: "Menunjuk & menamai bersama", deskripsi: "Mengikuti arah minat bayi lalu menamainya.", nilai: ["Cinta Ilmu"] },
    { judul: "\"Terima kasih\" untuk si kecil", deskripsi: "Setiap bayi memberi benda, sambut dengan terima kasih.", nilai: ["Hormat pada Sesama","Berbagi"] },
    { judul: "Tugas mini pertama", deskripsi: "Memegang sendok sendiri, memasukkan mainan ke keranjang.", nilai: ["Kemandirian","Tanggung Jawab"] },
    { judul: "Mengamati alam", deskripsi: "Daun, hujan, kucing — dinikmati dan disyukuri bersama.", nilai: ["Syukur","Cinta Ilmu"] },
    { judul: "Permainan giliran sederhana", deskripsi: "Menggelindingkan bola bergantian.", nilai: ["Sabar","Berbagi"] },
    { judul: "Ritual salam & pamit", deskripsi: "Melambai dan salam setiap ada yang datang/pergi.", nilai: ["Hormat pada Sesama"] }
  ],
  [ // 12–18 bl
    { judul: "Meniru pekerjaan rumah ringan", deskripsi: "Mengelap, menyapu mini — sambutan untuk niat membantunya.", nilai: ["Tanggung Jawab","Kemandirian"] },
    { judul: "Menarasikan perilaku baik", deskripsi: "\"Wah, Adik bantu Bunda!\" tepat saat terjadi.", nilai: ["Empati"] },
    { judul: "Buku cerita keluarga & hewan", deskripsi: "Membaca berulang dengan menunjuk gambar.", nilai: ["Cinta Ilmu","Kasih Sayang"] },
    { judul: "Berbagi camilan", deskripsi: "Menawarkan camilan ke anggota keluarga satu per satu.", nilai: ["Berbagi"] },
    { judul: "Menyapa orang di sekitar", deskripsi: "Melambai pada tetangga dan pengasuh.", nilai: ["Hormat pada Sesama","Keberanian"] },
    { judul: "Latihan menunggu sebentar", deskripsi: "\"Sabar ya... satu, dua...\" dengan hitungan pendek.", nilai: ["Sabar"] }
  ],
  [ // 18–24 bl
    { judul: "Tiga kata ajaib", deskripsi: "Tolong, terima kasih, maaf — dicontohkan di tiap interaksi.", nilai: ["Hormat pada Sesama","Kejujuran"] },
    { judul: "Beres-beres mainan bersama", deskripsi: "Merapikan jadi bagian akhir dari bermain.", nilai: ["Tanggung Jawab"] },
    { judul: "Memilih dari dua pilihan", deskripsi: "\"Baju merah atau biru?\" — latihan memutuskan.", nilai: ["Kemandirian"] },
    { judul: "Cerita & syukur sebelum tidur", deskripsi: "Satu cerita, satu hal menyenangkan hari ini.", nilai: ["Syukur"] },
    { judul: "Merawat tanaman/hewan", deskripsi: "Menyiram atau memberi makan dengan didampingi.", nilai: ["Kasih Sayang","Tanggung Jawab"] },
    { judul: "Main peran menolong boneka", deskripsi: "Boneka \"sedih\" lalu dihibur bersama.", nilai: ["Empati"] }
  ],
  [ // 2–3 th
    { judul: "\"Aku bisa sendiri\"", deskripsi: "Pakai sepatu, cuci tangan, makan sendiri — dengan waktu ekstra.", nilai: ["Kemandirian"] },
    { judul: "Jujur tanpa takut", deskripsi: "Pengakuan disambut tenang sebelum kesalahan dibahas.", nilai: ["Kejujuran"] },
    { judul: "Menamai emosi", deskripsi: "\"Kamu kesal ya?\" — kosakata perasaan diri & orang lain.", nilai: ["Empati"] },
    { judul: "Syukur sebelum makan", deskripsi: "Ucapan syukur singkat jadi kebiasaan meja makan.", nilai: ["Syukur"] },
    { judul: "Bergiliran di taman bermain", deskripsi: "Menunggu giliran ayunan dengan didampingi.", nilai: ["Sabar","Berbagi"] },
    { judul: "Tugas rumah mini", deskripsi: "Menaruh piring plastik, memasukkan baju ke keranjang.", nilai: ["Tanggung Jawab"] }
  ],
  [ // 3–4 th
    { judul: "Satu kisah, satu sifat baik", deskripsi: "Cerita tokoh baik dibacakan berulang sepekan.", nilai: ["Cinta Ilmu","Kejujuran"] },
    { judul: "Ritual syukur sebelum tidur", deskripsi: "\"Hari ini kamu senang karena apa?\"", nilai: ["Syukur"] },
    { judul: "Kotak berbagi", deskripsi: "Menyisihkan mainan atau uang jajan untuk diberikan.", nilai: ["Berbagi","Kesederhanaan"] },
    { judul: "Proyek menanam", deskripsi: "Merawat satu tanaman dari biji — menyiram tiap hari.", nilai: ["Tanggung Jawab","Sabar"] },
    { judul: "Main peran penolong", deskripsi: "Jadi dokter, pemadam, penolong — merasakan membantu.", nilai: ["Empati","Keberanian"] },
    { judul: "\"Bagaimana perasaanmu?\"", deskripsi: "Percakapan emosi jadi rutinitas santai.", nilai: ["Empati"] }
  ],
  [ // 4–5 th
    { judul: "Permainan kelompok beraturan", deskripsi: "Ular naga, lompat tali — belajar aturan main bersama.", nilai: ["Sabar","Hormat pada Sesama"] },
    { judul: "Main peran adab", deskripsi: "Bertamu, meminta maaf, berterima kasih lewat drama kecil.", nilai: ["Hormat pada Sesama","Kejujuran"] },
    { judul: "Lagu & sajak nilai", deskripsi: "Menghafal lewat irama dan gerakan.", nilai: ["Cinta Ilmu"] },
    { judul: "Misi kebaikan mingguan", deskripsi: "Satu misi kecil: membantu adik, menyapa satpam.", nilai: ["Berbagi","Empati"] },
    { judul: "Menuntaskan tugas", deskripsi: "Puzzle atau prakarya diselesaikan sampai akhir.", nilai: ["Tanggung Jawab","Kemandirian"] },
    { judul: "Mencoba hal baru", deskripsi: "Naik panjatan lebih tinggi, kenalan dengan teman baru.", nilai: ["Keberanian"] }
  ],
  [ // 5–6 th
    { judul: "Tanggung jawab miliknya", deskripsi: "Satu tugas rumah yang benar-benar jadi miliknya.", nilai: ["Tanggung Jawab"] },
    { judul: "Menabung: butuh vs ingin", deskripsi: "Celengan pertama dan percakapan sederhana soal uang.", nilai: ["Kesederhanaan"] },
    { judul: "Proyek berbagi ke sesama", deskripsi: "Menyiapkan paket kecil untuk yang membutuhkan.", nilai: ["Berbagi","Empati"] },
    { judul: "Refleksi jujur harian", deskripsi: "Cerita jujur tentang harinya — termasuk yang tidak enak.", nilai: ["Kejujuran"] },
    { judul: "Persiapan sekolah mandiri", deskripsi: "Menyiapkan tas dan seragam sendiri malam sebelumnya.", nilai: ["Kemandirian"] },
    { judul: "Presentasi kecil keluarga", deskripsi: "Bercerita di depan keluarga tentang hal yang disukainya.", nilai: ["Keberanian","Cinta Ilmu"] }
  ]
];

// ─── Teks Peta Rekah dua mode ───────────────────────────────────────────────
// Seluruh teks berikut MENUNGGU REVIEW PSIKOLOG FITRI sebelum rilis.

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PITA_AKAR = {
  eyebrow: 'Peta Rekah',
  /** aria-label tombol pita compact yang dapat diketuk. */
  ketukAriaLabel: (namaAnak: string): string => `Lihat Peta Rekah ${namaAnak || 'keluarga'}`,
  /** Teks undangan saat wizard Akar Keluarga belum diisi. */
  undangan: (namaAnak: string): string =>
    namaAnak ? `Tanam akar keluarga ${namaAnak} →` : 'Tanam akar keluarga →',
  undanganAriaLabel: (namaAnak: string): string =>
    namaAnak ? `Mulai Akar Keluarga untuk ${namaAnak}` : 'Mulai Akar Keluarga',
  /** Label mini di atas chip nilai fokus di pita compact. */
  labelFokus: 'Fokus saat ini',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PETA_PENUH = {
  /** Deskripsi SVG aksesibel — merayakan, bukan menghitung kekurangan. */
  titleSvg: (namaAnak: string, mekar: number): string =>
    mekar === 0
      ? `Peta Rekah ${namaAnak || 'keluarga'} — kuncup pertama sedang tumbuh`
      : `Peta Rekah ${namaAnak || 'keluarga'} — ${mekar} babak telah dilalui`,
  /** Penanda siklus di mode full. Hanya di sini — pita compact tetap ringan. */
  labelSiklus: (usia: string): string => `Tahap ${usia}`,
  /** Panel kelopak — yang sudah dilewati. */
  kelopakSudahMekar: 'Babak ini telah dilalui',
  /** Panel kelopak — yang sedang berlangsung. */
  kelopakSedangMekar: 'Babak ini sedang berlangsung',
  /** Panel kelopak — yang belum tiba. Bukan "belum tercapai". */
  kelopakMenunggu: 'Menunggu waktunya',
  /** Teks perayaan satu kali saat kelopak baru mekar (Tugas D). */
  perayaan: 'Sebuah babak baru mekar!',
  /** Sub-teks perayaan. */
  perayaanSub: 'Tandai momen ini bersama.',
  /** TODO: panel kenangan. */
  kenangan: 'Kenangan tahap ini belum tersimpan.',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const TAMAN_AKAR = {
  eyebrow: 'TAMAN AKAR KELUARGA',
  judul: 'Taman Nilai Keluarga',
  sub: 'Setiap bunga mewakili satu nilai. Bunga mekar saat nilai dirawat melalui kegiatan dan sikap sehari-hari.',
  labelDipilih: 'Nilai yang ditanam',
  labelHariIni: 'Dirawat hari ini',
  labelRingkas: (n: number): string => `${n} nilai ditanam`,
  ctaLihat: 'Lihat taman selengkapnya',

  // Taman kosong — MENUNGGU REVIEW PSIKOLOG FITRI
  emptyState: 'Taman ini menunggu nilai pertama yang Ayah dan Bunda pilih.',
  ctaTanam: '+ Tanam nilai',

  // Pemilih nilai — MENUNGGU REVIEW PSIKOLOG FITRI
  pemilihJudul: 'Pilih nilai untuk ditanam',
  pemilihSub: 'Nilai yang sudah ditanam ditampilkan redup. Pilih nilai baru untuk menambahkannya ke taman.',

  // Detail bunga — MENUNGGU REVIEW PSIKOLOG FITRI
  labelAlasan: 'Kenapa nilai ini penting bagi keluarga?',
  placeholderAlasan: 'Opsional — boleh dikosongkan. Ayah Bunda bisa menulisnya kapan saja.',
  ctaCabut: 'Cabut dari taman',
  konfirmasiCabut: 'Mencabut nilai menghentikan kontribusinya untuk sementara. Nilai bisa ditanam kembali kapan saja.',
  ctaCabutKonfirmasi: 'Ya, cabut',
  ctaCabutBatal: 'Biarkan tetap tumbuh',

  // Visi — MENUNGGU REVIEW PSIKOLOG FITRI
  visiDefault: 'Apa gambaran besar keluarga kita?',
  visiPlaceholder: 'Kami ingin membangun keluarga yang...',
  ctaEditVisi: 'Tulis gambaran keluarga',
  ctaSimpanVisi: 'Simpan',
} as const;

// MENUNGGU REVIEW PSIKOLOG FITRI
export interface PenjelasanNilai { tagline: string; deskripsi: string; caraRawat: string; }

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PENJELASAN_NILAI: Record<NilaiAkar, PenjelasanNilai> = {
  'Kejujuran': {
    tagline: 'Bicara apa adanya, tanpa takut',
    deskripsi: 'Kejujuran tumbuh bukan dari perintah, melainkan dari rasa aman. Anak yang tahu pengakuannya disambut dengan tenang akan lebih mudah berkata jujur — bahkan ketika mereka melakukan kesalahan.',
    caraRawat: 'Sambut pengakuan dengan tenang sebelum membahas kesalahan. Contohkan jujur dalam hal-hal kecil sehari-hari, seperti mengakui saat orang tua salah.',
  },
  'Syukur': {
    tagline: 'Melihat yang baik, menghargai yang ada',
    deskripsi: 'Syukur bukan sekadar berterima kasih — ia adalah cara memandang dunia. Anak yang terbiasa mengenali hal baik di sekitarnya tumbuh dengan rasa cukup dan ketahanan emosional yang lebih kuat.',
    caraRawat: 'Ajak anak menyebutkan satu hal menyenangkan sebelum tidur. Jadikan syukur sebagai ritual, bukan kewajiban.',
  },
  'Kasih Sayang': {
    tagline: 'Hadir dengan hangat dan tulus',
    deskripsi: 'Kasih sayang yang konsisten dari orang tua adalah fondasi kelekatan aman. Pelukan, sapaan lembut, dan merespons kebutuhan anak dengan tenang membangun kepercayaan dasar pada dunia.',
    caraRawat: 'Hadir penuh saat bermain bersama. Sentuhan fisik yang menenangkan — pelukan, usapan kepala — menjadi bahasa kasih sayang yang paling mudah dipahami anak.',
  },
  'Empati': {
    tagline: 'Merasakan apa yang dirasakan orang lain',
    deskripsi: 'Empati berkembang saat anak melihat orang tua merespons perasaan orang lain dengan kepedulian. Menamai emosi — baik milik anak maupun orang lain — membangun kosakata batin yang kaya.',
    caraRawat: 'Narasikan perasaan saat sedang terjadi: "Adik nangis, mungkin dia sedih karena mainannya diambil." Ajak anak ikut memikirkan cara membantu.',
  },
  'Kemandirian': {
    tagline: 'Mencoba sendiri, bangkit, mencoba lagi', // MENUNGGU REVIEW PSIKOLOG FITRI
    deskripsi: 'Kemandirian tumbuh dari ruang untuk mencoba — bukan dari tekanan untuk berhasil. Anak yang diberi waktu ekstra untuk menyelesaikan tugas kecilnya sendiri membangun rasa mampu yang bertahan lama.',
    caraRawat: 'Tahan dorongan untuk langsung membantu. Dukung dengan kata-kata: "Coba dulu, Bunda di sini." Rayakan proses, bukan hanya hasil.',
  },
  'Tanggung Jawab': {
    tagline: 'Milikku, aku yang jaga',
    deskripsi: 'Tanggung jawab dimulai dari tugas kecil yang benar-benar milik anak — bukan sekadar membantu. Ketika anak punya "tugas rumahnya sendiri," ia belajar bahwa kontribusinya nyata dan dibutuhkan.',
    caraRawat: 'Berikan satu tugas yang konsisten dan sesuai usia. Akui kontribusinya: "Terima kasih sudah menaruh piring — meja makan jadi rapi karenamu."',
  },
  'Kesederhanaan': {
    tagline: 'Cukup adalah hadiah',
    deskripsi: 'Kesederhanaan bukan kekurangan — ia adalah pilihan sadar untuk tidak terjebak dalam "lebih." Anak yang tumbuh dengan nilai ini lebih mudah mensyukuri apa yang ada dan tidak mudah terpengaruh tekanan konsumsi.',
    caraRawat: 'Pilih kualitas atas kuantitas dalam mainan dan pengalaman. Ajak anak memilih mainan yang akan didonasikan saat mendapat yang baru.',
  },
  'Cinta Ilmu': {
    tagline: 'Bertanya adalah petualangan',
    deskripsi: 'Rasa ingin tahu adalah bahan bakar belajar seumur hidup. Anak yang pertanyaannya disambut dengan antusias — bukan diremehkan — tumbuh menjadi pelajar yang berani dan tekun.',
    caraRawat: 'Jawab "mengapa" dengan eksplorasi bersama, bukan sekadar jawaban. Kunjungi tempat baru, baca buku bersama, dan jadikan belajar sebagai petualangan keluarga.',
  },
  'Sabar': {
    tagline: 'Menunggu adalah bagian dari tumbuh',
    deskripsi: 'Kesabaran bukan tentang diam tanpa protes — melainkan kemampuan mengelola keinginan yang belum terpenuhi. Ini adalah salah satu keterampilan pengaturan diri paling berharga.',
    caraRawat: 'Beri anak waktu untuk menunggu dengan strategi kecil: hitungan bersama, aktivitas pengalih singkat. Hindari memberikan sesuatu segera hanya untuk menghentikan protes.',
  },
  'Berbagi': {
    tagline: 'Ada lebih banyak kebahagiaan saat dibagi',
    deskripsi: 'Berbagi yang tulus berakar dari rasa cukup — bukan dari ketakutan atau kewajiban. Anak yang merasakan kegembiraan berbagi (bukan dipaksa) akan lebih mudah mengembangkan sikap dermawan sepanjang hidupnya.',
    caraRawat: 'Jadikan berbagi momen yang menyenangkan, bukan pengorbanan. Contohkan dengan berbagi makanan, waktu, dan perhatian — bukan hanya barang.',
  },
  'Keberanian': {
    tagline: 'Takut boleh, tapi tetap maju',
    deskripsi: 'Keberanian bukan ketiadaan takut — melainkan memilih untuk mencoba meski merasa takut. Anak yang didukung menghadapi ketidaknyamanan kecil membangun ketahanan untuk tantangan yang lebih besar.',
    caraRawat: 'Normalisasi perasaan takut: "Bunda juga deg-degan tadi." Dukung mencoba hal baru dengan hadir — bukan memaksa. Rayakan keberanian proses, bukan hanya keberhasilan.',
  },
  'Hormat pada Sesama': {
    tagline: 'Setiap orang layak diperlakukan baik',
    deskripsi: 'Rasa hormat tumbuh dari contoh nyata sehari-hari — bagaimana orang tua berbicara tentang dan kepada orang lain. Anak mengamati sebelum meniru: cara menyapa, mendengarkan, dan menghargai perbedaan.',
    caraRawat: 'Contohkan sopan santun konsisten kepada semua orang — dari anggota keluarga hingga penjaga keamanan. Ajak anak menyapa dan berterima kasih secara langsung.',
  },
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const GARIS_TRANSISI = {
  atas: 'Nilai yang ditanam di Taman Akar menjadi bahan bakar tumbuh di semua area berikut.', // MENUNGGU REVIEW PSIKOLOG FITRI
  bawah: 'Kedua cermin ini saling melengkapi — nilai menghidupkan cara belajar, cara belajar memperkuat nilai.',
} as const;

export const UI_COPY = {
  hero: {
    eyebrow: "Fitur Baru · Akar Keluarga",
    judul: "Sebelum anak mekar, keluarga menanam akar.",
    judulKata: "mekar",
    lead: "Setiap keluarga membawa nilai — disadari atau tidak. Akar Keluarga membantu Ayah dan Bunda menamai nilai itu, menuliskan arah keluarga, lalu melihat gambaran besar nilai-nilai yang tumbuh dalam Taman Akar.",
    cta: "Tanam Akar Keluargaku",
  },
  kartuEdukasi: [
    { judul: "Anak meniru, bukan mendengar", isi: "Riset perkembangan menunjukkan nilai terbentuk lewat teladan dan kebiasaan rumah — bukan nasihat. Akar yang jelas membuat teladan jadi konsisten." },
    { judul: "Tanpa arah, pengasuhan jadi reaktif", isi: "Keluarga yang tahu tujuannya tidak mudah goyah oleh tren pengasuhan. Satu kalimat visi menjadi kompas saat hari-hari terasa berat." },
    { judul: "Setiap anak mekar pada waktunya", isi: "Peta Rekah membandingkan anak hanya dengan dirinya sendiri kemarin — setiap kelopak yang terisi adalah perayaan, bukan penilaian." },
  ],
  langkah1: {
    judul: "Nilai apa saja yang dipegang keluarga ini?",
    sub: "Pilih sebanyak yang Ayah dan Bunda yakini — tidak ada batasan. Semua nilai yang dipilih akan menjadi akar keluarga.", // MENUNGGU REVIEW PSIKOLOG FITRI
  },
  langkah2: {
    judul: "Dari semua itu, mana 3 yang ingin disiram lebih dulu?",
    sub: "Semua nilai yang dipilih tetap menjadi akar keluarga. Tapi seperti menyiram tanaman, perhatian bekerja paling baik saat terarah — pilih 3 nilai fokus untuk 6 bulan ke depan.",
    kotak: "🌿 Tenang — nilai yang lain tidak hilang. Semuanya tampil sebagai akar di Peta Rekah, dan fokus bisa dirotasi setiap 6 bulan saat tinjauan keluarga.",
  },
  langkah3: {
    judul: "Apa yang penting bagi keluarga ini?",
    sub: "Nilai tumbuh lewat kebiasaan. Pilih hal-hal yang ingin dijaga keluarga — inilah tanah tempat akar mendapat nutrisi.",
  },
  langkah4: {
    judul: "Tuliskan gambaran besar keluarga Ayah & Bunda",
    sub: "Satu kalimat, dengan bahasa sendiri. Kalimat ini akan menjadi arah tumbuh pada Peta Rekah — dan pengingat di hari-hari yang melelahkan.",
    placeholder: "Kami ingin membangun keluarga yang...",
    ctaSelesai: "Lihat Taman Akar", // MENUNGGU REVIEW PSIKOLOG FITRI
    ctaLewati: "Lewati, langsung lihat taman", // MENUNGGU REVIEW PSIKOLOG FITRI
  },
  peta: {
    eyebrow: "Peta Rekah",
    judul: "Gambaran besar keluarga kami",
    judulKata: "keluarga kami",
    sub: "Sepuluh kelopak untuk sepuluh musim tumbuh dari 0–6 tahun. Sentuh kelopak untuk melihat Rencana Rekah pada usia itu.",
    labelVisi: "Arah tumbuh keluarga",
    captionTanah: "Tanah: kebiasaan yang menutrisi akar",
    legendTunjang: "Akar tunjang — fokus musim ini",
    legendSerabut: "Akar serabut — nilai keluarga lainnya",
  },
  panel: {
    headerMateri: "Materi & kegiatan di usia ini",
    catatanFilter: "— disaring sesuai nilai keluarga, ★ fokus musim ini",
    ctaRencana: "Jadikan Rencana Rekah-ku",
    ctaPoster: "Simpan sebagai poster keluarga",
  },
  footer: {
    kalimat: "Mekar pada waktunya.",
    sub: "Taman ini adalah milik keluarga — nilai yang dipilih bisa berkembang seiring waktu, akar tetap tumbuh.", // MENUNGGU REVIEW PSIKOLOG FITRI
  },
} as const;
