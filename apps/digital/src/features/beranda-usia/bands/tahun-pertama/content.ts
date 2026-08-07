// ============================================================================
// REVIEW: Seluruh copy di file ini menunggu persetujuan Psikolog Fitri Effendy
// sebelum rilis. Jangan menayangkan tanpa approval.
// Sumber rujukan: WHO, CDC, AAP, IDAI, Kemenkes RI.
// ============================================================================

import type { FiturId } from '../../../../config/fiturRekah';

export type Domain = { label: string; detail: string };

/**
 * Jembatan dari cerita tahap ke fitur Rekah. Inilah yang membuat pendamping
 * paham alur ekosistem: cerita dulu, baru "lanjutkan di mana".
 * Maksimal 3 per tahap. Urutan = prioritas.
 * MENUNGGU REVIEW PSIKOLOG FITRI
 */
export type Jembatan = {
  fitur: FiturId;
  judul: string;   // maks 32 karakter, boleh pakai {anak}/{Anak}
  badan: string;   // 1 kalimat, maks 110 karakter, boleh pakai **tebal**
};

export type Stage = {
  id: string;
  ageLabel: string;
  petalFilled: number;
  title: string;
  story: string;
  captionText: string;
  illustration: "tummyTime" | "sitReach" | "crawl" | "stand";
  domains: Domain[];
  jembatan: Jembatan[];
};

export const HERO = {
  eyebrow: "Panduan Tumbuh Kembang · Tahun Pertama",
  headline: "Dua belas bulan pertama {anak}, satu cerita yang utuh",
  lead:
    "Dari tangisan pertama sampai langkah pertama, inilah peta perjalanan setahun: apa yang akan terjadi, apa yang bisa Ayah Bunda amati, dan bagaimana merayakan setiap kelopak yang mekar.",
  tagline: "Mekar pada waktunya.",
  note:
    "Setiap anak mekar dengan iramanya sendiri. Rekah membandingkan perkembangan si kecil hanya dengan dirinya sendiri, bukan dengan anak lain.",
};

export const STAGES: Stage[] = [
  {
    id: "bulan-0-3",
    ageLabel: "0 SAMPAI 3 BULAN",
    petalFilled: 1,
    title: "Dunia yang baru, indra yang menyala",
    story:
      "Di awal kehidupannya, {anak} sibuk melakukan pekerjaan besar yang tak terlihat: **mengenali dunia lewat indranya**. Ia belajar membedakan suara Ayah Bunda dari suara lain, mengikuti wajahmu dengan matanya, lalu menenangkan diri dalam dekapanmu. Suatu pagi, biasanya di sekitar minggu keenam sampai kedelapan, datang hadiah pertama: **senyum sosial** yang memang ditujukan untukmu. Saat tengkurap, lehernya yang dulu lunglai mulai kuat mengangkat kepala. Tangisannya pun mulai punya \"bahasa\": lapar, lelah, dan ingin dipeluk terdengar berbeda.",
    captionText: "Tummy time, kepala mungil itu mulai terangkat!",
    illustration: "tummyTime",
    domains: [
      { label: "Motorik kasar", detail: "Mengangkat kepala saat tengkurap; gerakan tangan dan kaki makin aktif serta simetris." },
      { label: "Motorik halus", detail: "Refleks menggenggam jari; mulai membuka kepalan tangan." },
      { label: "Bahasa dan komunikasi", detail: "Suara \"aah ooh\" (cooing); menoleh ke arah suara; tangisan berbeda untuk kebutuhan berbeda." },
      { label: "Sosial emosional", detail: "Senyum sosial; tenang saat digendong; menatap wajah dengan lekat." },
      { label: "Kognitif", detail: "Mengikuti benda bergerak dengan mata; mengenali suara dan aroma orang tua." },
    ],
    // MENUNGGU REVIEW PSIKOLOG FITRI
    jembatan: [
      { fitur: 'teduh',  judul: 'Rawat dirimu dulu',       badan: 'Lembar nifas, porsi gizi harian, dan checklist pemulihan. Bayi menenang lewat tubuh yang tenang.' },
      { fitur: 'irama',  judul: 'Ritme yang longgar',      badan: 'Susun pagi sampai jelang tidur tanpa jam kaku. Blok kosong tetap sah di babak ini.' },
      { fitur: 'jurnal', judul: 'Abadikan senyum pertama', badan: 'Foto dan stiker untuk momen yang tidak akan terulang.' },
    ],
  },
  {
    id: "bulan-4-6",
    ageLabel: "4 SAMPAI 6 BULAN",
    petalFilled: 2,
    title: "Tubuh mungil yang menemukan kekuatannya",
    story:
      "Inilah musim gerakan pertama. Suatu hari {anak} **berguling**, dan sejak itu tak ada permukaan yang aman dari eksplorasinya! Ia mulai **duduk dengan bantuan bantal**, meraih apa pun dalam jangkauan, lalu memindahkan mainan dari satu tangan ke tangan lain. Semua benda ia cicipi, dan itu bukan kenakalan melainkan cara ia mempelajari tekstur dunia. Telinganya kini menangkap namanya sendiri, dan ocehannya berubah jadi rangkaian suku kata seperti **\"baba\" dan \"mama\"**. Belum bermakna, tapi itu latihan orkestra sebelum kata pertama. Di penghujung babak ini, sekitar usia 6 bulan, satu petualangan besar dimulai: **suapan pertama MPASI**.",
    captionText: "Duduk, meraih, dan mengoceh \"baba baba\"",
    illustration: "sitReach",
    domains: [
      { label: "Motorik kasar", detail: "Berguling dua arah; duduk dengan sandaran; menumpu kaki saat dipegangi berdiri." },
      { label: "Motorik halus", detail: "Meraih dan menggenggam benda; memindahkan benda antar tangan." },
      { label: "Bahasa dan komunikasi", detail: "Babbling berantai; tertawa lepas; menoleh saat dipanggil namanya." },
      { label: "Sosial emosional", detail: "Menikmati permainan wajah; mengenali orang terdekat dan orang asing." },
      { label: "Kognitif dan kemandirian", detail: "Mengeksplorasi benda dengan mulut; menunjukkan rasa ingin tahu; mulai belajar makan (MPASI sekitar 6 bulan)." },
    ],
    // MENUNGGU REVIEW PSIKOLOG FITRI
    jembatan: [
      { fitur: 'bekal',  judul: 'Kegiatan meraih dan berguling', badan: 'Kolam kegiatan tahap 4 sampai 6 bulan: cermin, kain bertekstur, mainan berbunyi.' },
      { fitur: 'teduh',  judul: 'Bersiap ke MPASI',              badan: 'Panduan memilih perlengkapan dan kesiapan keluarga, dirujuk ke Buku KIA Kemenkes.' },
      { fitur: 'irama',  judul: 'Sisipkan tummy time',           badan: 'Taruh satu kegiatan motorik di blok pagi supaya tidak menumpuk di sore.' },
    ],
  },
  {
    id: "bulan-7-9",
    ageLabel: "7 SAMPAI 9 BULAN",
    petalFilled: 3,
    title: "Penjelajah kecil dan penemuan besar",
    story:
      "Kini {anak} **duduk tegak tanpa bantuan**, dan dari posisi baru itu dunia terlihat berbeda. Banyak bayi mulai **merangkak** di babak ini, meski sebagian memilih ngesot, berguling, atau bahkan melewatkannya sama sekali. **Semuanya sama sehat.** Jarinya makin terampil: ia mulai menjumput benda kecil dengan ibu jari dan telunjuk. Ada juga penemuan besar: **benda yang disembunyikan ternyata tidak hilang!** Ia akan mencari mainan di balik selimut. Bila ia mendadak menangis saat digendong orang baru, itu bukan kemunduran. Itu tandanya ia sudah tahu persis siapa \"rumahnya\".",
    captionText: "Merangkak, dunia mendadak jadi luas sekali",
    illustration: "crawl",
    domains: [
      { label: "Motorik kasar", detail: "Duduk mandiri; merangkak atau cara berpindah lain; mulai menarik badan untuk berdiri." },
      { label: "Motorik halus", detail: "Menjumput dengan ibu jari dan telunjuk (pincer grasp); membenturkan dua benda." },
      { label: "Bahasa dan komunikasi", detail: "Babbling makin variatif; memahami \"tidak\"; merespons namanya secara konsisten." },
      { label: "Sosial emosional", detail: "Cemas pada orang asing; punya orang favorit; ikut permainan cilukba." },
      { label: "Kognitif", detail: "Mencari benda yang disembunyikan (object permanence); mengamati benda jatuh." },
    ],
    // MENUNGGU REVIEW PSIKOLOG FITRI
    jembatan: [
      { fitur: 'bekal',  judul: 'Main cilukba dan sembunyi',  badan: 'Kegiatan yang pas untuk penemuan bahwa benda tidak benar-benar hilang.' },
      { fitur: 'jurnal', judul: 'Catat cara berpindahnya',    badan: 'Merangkak, ngesot, atau berguling — semuanya layak diabadikan apa adanya.' },
      { fitur: 'panen',  judul: 'Lihat pola yang muncul',     badan: 'Setelah beberapa catatan, Panen menunjukkan kegiatan mana yang paling ia nikmati.' },
    ],
  },
  {
    id: "bulan-10-12",
    ageLabel: "10 SAMPAI 12 BULAN",
    petalFilled: 4,
    title: "Berdiri, melambai, dan kata pertama",
    story:
      "Babak penutup tahun pertama penuh momen yang ingin kau abadikan. {Anak} **menarik badannya berdiri**, merambat menyusuri sofa, lalu mungkin melepaskan pegangan untuk **langkah pertama**. Kalau belum, tenang saja: rentang normal berjalan sangat lebar, yaitu 9 sampai 18 bulan. Ia kini melambai \"dadah\", menunjuk benda yang ia inginkan, dan meniru gerakanmu. Suatu hari, di antara ocehannya, muncul sebuah kata yang sungguh ditujukan padamu: \"mama\" atau \"papa\" yang bermakna. Ingat juga bahwa menunjuk, melambai, dan tatapan mata **sama berharganya dengan kata**. Semua itu adalah bahasa.",
    captionText: "Langkah pertama menuju pelukanmu",
    illustration: "stand",
    domains: [
      { label: "Motorik kasar", detail: "Berdiri berpegangan; merambat; sebagian anak mulai melangkah mandiri." },
      { label: "Motorik halus", detail: "Memasukkan benda ke wadah; memegang finger food dan makan sendiri; mencoba minum dari cangkir." },
      { label: "Bahasa dan komunikasi", detail: "Satu sampai dua kata bermakna; menunjuk untuk meminta; memahami perintah sederhana." },
      { label: "Sosial emosional", detail: "Melambai dadah; cemas berpisah dari pengasuh utama; menunjukkan kesukaan yang jelas." },
      { label: "Kognitif", detail: "Meniru gerakan; menggunakan benda sesuai fungsinya seperti sisir, sendok, dan telepon mainan." },
    ],
    // MENUNGGU REVIEW PSIKOLOG FITRI
    jembatan: [
      { fitur: 'jurnal', judul: 'Langkah pertama, tersimpan', badan: 'Video dan foto masuk ke Galeri, lengkap dengan tanggalnya.' },
      { fitur: 'panen',  judul: 'Panen setahun pertama',      badan: 'Kumpulan momen sepanjang tahun, dibandingkan hanya dengan {anak} di awal tahun.' },
      { fitur: 'bekal',  judul: 'Semua bentuk bahasa',        badan: 'Kegiatan yang memperlakukan menunjuk dan melambai setara dengan kata.' },
    ],
  },
];

export const QUOTE =
  "Ia tidak sedang berlomba dengan siapa pun. Ia sedang mekar, pada waktunya.";

export const EVALUASI = {
  eyebrow: "Ulang Tahun Pertama",
  title: "Evaluasi akhir tahun: rayakan, catat, pahami",
  sub: "Evaluasi bukan rapor. Ini momen duduk bersama pasangan, membuka Jurnal Perkembangan, dan melihat sejauh apa {anak} telah tumbuh dibandingkan dengan dirinya sendiri di awal tahun, bukan dengan anak lain.",
  cards: [
    { icon: "flower", title: "Rayakan yang sudah mekar", body: "Tuliskan semua kemampuan baru tahun ini, dari senyum pertama sampai kata pertama. Daftar ini biasanya jauh lebih panjang dari yang Ayah Bunda kira." },
    { icon: "search", title: "Amati yang sedang tumbuh", body: "Kemampuan mana yang sedang \"setengah mekar\"? Misalnya sudah berdiri tapi belum melangkah. Itu bukan keterlambatan, itu kuncup yang sedang bersiap." },
    { icon: "message", title: "Diskusikan yang mengganjal", body: "Ada yang membuat hati bertanya? Catat lalu bawa ke jadwal kontrol dokter anak atau posyandu. Pertanyaan Ayah Bunda selalu valid." },
  ],
};

export const DETEKSI = {
  eyebrow: "Deteksi Dini",
  title: "Kapan sebaiknya berbincang dengan ahli?",
  sub: "Beberapa tanda di usia 12 bulan berikut bukan vonis apa pun, hanya **ajakan untuk berbincang lebih awal** dengan dokter anak. Semakin awal berbincang, semakin banyak dukungan yang bisa disiapkan.",
  flags: [
    "Belum bisa duduk tanpa bantuan",
    "Belum mengoceh (babbling) atau tampak tidak merespons suara",
    "Jarang melakukan kontak mata atau membalas senyum",
    "Tidak menoleh saat namanya dipanggil",
    "Tubuh terasa sangat kaku atau sangat lemas",
    "Kehilangan kemampuan yang sebelumnya sudah dikuasai",
  ],
  reassure:
    "Setiap anak punya irama sendiri, dan banyak variasi yang sepenuhnya sehat. Daftar ini bukan alat diagnosis, hanya kompas kapan waktu yang baik untuk bertanya. Bertanya lebih awal adalah bentuk cinta, bukan kecemasan berlebihan.",
};

export const FOOTER_NOTE =
  "Konten disusun merujuk pada panduan tumbuh kembang WHO, CDC, AAP, IDAI, dan Kemenkes RI. Rentang usia bersifat panduan umum, bukan patokan kaku. Halaman ini tidak menggantikan konsultasi dengan tenaga kesehatan.";
