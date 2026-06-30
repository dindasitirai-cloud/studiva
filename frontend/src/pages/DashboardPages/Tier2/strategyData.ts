// TODO: replace with API call to backend once Tier-2 strategy content is
// served dynamically. This array is now the SEED for DashboardTier2Context's
// `strategies` state (see that file) - admin CRUD mutates the context's
// copy, not this constant.

import { LearningStyle } from '../../../context/DashboardTier2Context';

export const ACTIVITY_TYPES = ['Semua', 'Motorik', 'Sensorik', 'Sosial', 'Akademik', 'Komunikasi'];
export const AGE_GROUPS = ['Semua usia', '3-5 tahun', '6-8 tahun', '9-12 tahun'];

export interface Strategy {
  id: string;
  title: string;
  activityType: 'Motorik' | 'Sensorik' | 'Sosial' | 'Akademik' | 'Komunikasi';
  ageGroup: string;
  learningStyles: LearningStyle[];
  summary: string;
  duration: string;
  materials: string[];
  steps: string[];
  tip: string;
  colorTheme: 'amber' | 'sky' | 'coral' | 'green';
  status: 'draft' | 'published';
  /** Admin-uploaded supporting media (data URL for now). TODO: real file storage backend. */
  thumbnailUrl?: string;
}

export const STRATEGIES: Strategy[] = [
  {
    id: 's1',
    title: 'Playdough Buatan Sendiri',
    activityType: 'Motorik',
    ageGroup: '3-5 tahun',
    learningStyles: ['Kinestetik', 'Visual'],
    summary: 'Melatih motorik halus dan memberi input sensorik melalui tekstur lembut playdough.',
    duration: '15-20 menit',
    materials: ['2 cangkir tepung terigu', '1 cangkir garam', '2 sdm minyak sayur', 'Air secukupnya', 'Pewarna makanan (opsional)'],
    steps: [
      'Campurkan tepung dan garam dalam mangkuk besar.',
      'Tambahkan minyak sayur, lalu air sedikit demi sedikit sambil diuleni.',
      'Uleni hingga teksturnya kalis dan tidak lengket di tangan.',
      'Bagi adonan dan tambahkan pewarna makanan jika ingin warna-warni.',
      'Biarkan anak meremas, membentuk, dan bereksplorasi dengan playdough.',
    ],
    tip: 'Simpan playdough dalam wadah kedap udara, bisa dipakai berulang kali selama 2-3 minggu.',
    colorTheme: 'amber',
    status: 'published',
  },
  {
    id: 's2',
    title: 'Botol Sensorik Tenang',
    activityType: 'Sensorik',
    ageGroup: '3-5 tahun',
    learningStyles: ['Visual', 'Kinestetik'],
    summary: 'Alat bantu menenangkan diri saat anak merasa kewalahan, dengan visual yang menenangkan.',
    duration: '10 menit membuat',
    materials: ['Botol plastik bening bertutup rapat', 'Air hangat', 'Lem glitter atau glitter biasa', 'Pewarna makanan (opsional)'],
    steps: [
      'Isi botol dengan air hangat hingga ¾ penuh.',
      'Tambahkan 2-3 sendok lem glitter, aduk hingga larut.',
      'Tambahkan pewarna makanan jika diinginkan.',
      'Tutup rapat botol, pastikan tidak bocor (bisa direkatkan lem tambahan di tutupnya).',
      'Kocok botol dan biarkan anak mengamati glitter yang melayang turun perlahan.',
    ],
    tip: 'Gunakan botol ini saat anak mulai menunjukkan tanda-tanda overload sensorik untuk membantu menenangkan diri.',
    colorTheme: 'sky',
    status: 'published',
  },
  {
    id: 's3',
    title: 'Permainan Giliran Sederhana',
    activityType: 'Sosial',
    ageGroup: '6-8 tahun',
    learningStyles: ['Auditori', 'Kinestetik'],
    summary: 'Melatih kemampuan menunggu giliran dan interaksi sosial melalui permainan singkat.',
    duration: '10-15 menit',
    materials: ['Bola kecil atau benda lain yang mudah dipegang', '1-2 teman bermain atau anggota keluarga'],
    steps: [
      'Duduk membentuk lingkaran kecil bersama anak dan pemain lain.',
      'Jelaskan aturan sederhana: bola hanya dipegang satu orang dalam satu waktu.',
      'Lempar/gulirkan bola ke satu pemain sambil menyebut namanya.',
      'Minta anak menunggu sampai bola digulirkan ke arahnya sebelum ikut bermain.',
      'Beri pujian spesifik setiap kali anak berhasil menunggu gilirannya.',
    ],
    tip: 'Mulai dengan sesi singkat (5 menit) dan perpanjang secara bertahap sesuai kenyamanan anak.',
    colorTheme: 'coral',
    status: 'published',
  },
  {
    id: 's4',
    title: 'Kartu Kosakata Bergambar',
    activityType: 'Akademik',
    ageGroup: '6-8 tahun',
    learningStyles: ['Visual', 'Membaca/Menulis'],
    summary: 'Membantu memperluas kosakata anak melalui asosiasi gambar dan kata.',
    duration: '15 menit',
    materials: ['Kartu kosong atau potongan kertas', 'Alat tulis/pensil warna', 'Gambar atau majalah bekas (opsional)'],
    steps: [
      'Pilih 5-10 kata baru yang ingin diperkenalkan kepada anak.',
      'Tulis satu kata di setiap kartu, lalu gambar atau tempelkan ilustrasi yang sesuai.',
      'Tunjukkan kartu satu per satu, ucapkan kata dengan jelas.',
      'Minta anak mengulang kata tersebut dan menjelaskan apa yang ia lihat di gambar.',
      'Ulangi sesi ini beberapa kali dalam seminggu untuk memperkuat ingatan.',
    ],
    tip: 'Gunakan kata-kata dari kehidupan sehari-hari anak agar lebih mudah diingat dan relevan.',
    colorTheme: 'green',
    status: 'published',
  },
  {
    id: 's5',
    title: 'Latihan Napas Balon',
    activityType: 'Sensorik',
    ageGroup: 'Semua usia',
    learningStyles: ['Kinestetik', 'Auditori'],
    summary: 'Teknik relaksasi sederhana untuk membantu anak menenangkan diri saat cemas atau marah.',
    duration: '5 menit',
    materials: ['Tidak ada alat khusus'],
    steps: [
      'Minta anak duduk nyaman dan letakkan tangan di perut.',
      'Ajak anak membayangkan perutnya seperti balon yang akan ditiup.',
      'Tarik napas dalam-dalam lewat hidung sambil "mengisi balon" (4 hitungan).',
      'Tahan sebentar (2 hitungan), lalu embuskan perlahan lewat mulut (4 hitungan).',
      'Ulangi 4-5 kali sambil tetap berbicara dengan suara tenang.',
    ],
    tip: 'Latih teknik ini saat anak tenang dulu, supaya ia familiar dan bisa menggunakannya sendiri saat dibutuhkan.',
    colorTheme: 'sky',
    status: 'published',
  },
  {
    id: 's6',
    title: 'Papan Cerita Bergambar (PECS Sederhana)',
    activityType: 'Komunikasi',
    ageGroup: '3-5 tahun',
    learningStyles: ['Visual'],
    summary: 'Membantu anak nonverbal atau dengan hambatan bicara mengekspresikan kebutuhan melalui gambar.',
    duration: '20 menit membuat',
    materials: ['Kertas karton', 'Gambar/ikon kebutuhan dasar (makan, minum, toilet, main)', 'Velcro atau perekat'],
    steps: [
      'Cetak atau gambar ikon untuk kebutuhan dasar anak sehari-hari.',
      'Tempelkan velcro di belakang setiap kartu ikon dan di papan utama.',
      'Ajarkan anak mengambil kartu yang sesuai dengan kebutuhannya dan menempelkannya di papan.',
      'Respon segera setiap kali anak menggunakan kartu untuk berkomunikasi.',
      'Tambahkan ikon baru secara bertahap sesuai kebutuhan anak.',
    ],
    tip: 'Konsistensi adalah kunci — gunakan papan ini di rumah dan minta sekolah/terapis melakukan hal yang sama.',
    colorTheme: 'amber',
    status: 'published',
  },
  {
    id: 's7',
    title: 'Jalan Garis Seimbang',
    activityType: 'Motorik',
    ageGroup: '6-8 tahun',
    learningStyles: ['Kinestetik'],
    summary: 'Melatih keseimbangan dan koordinasi motorik kasar dengan cara yang menyenangkan.',
    duration: '10 menit',
    materials: ['Selotip warna atau tali', 'Lantai yang luas dan aman'],
    steps: [
      'Buat garis lurus di lantai menggunakan selotip atau tali, panjang sekitar 2-3 meter.',
      'Tunjukkan cara berjalan di atas garis dengan menjaga keseimbangan.',
      'Minta anak mencoba berjalan dari ujung ke ujung garis.',
      'Tingkatkan kesulitan dengan meminta anak membawa benda ringan di tangan atau berjalan mundur.',
      'Beri semangat dan rayakan setiap usaha, bukan hanya keberhasilan sempurna.',
    ],
    tip: 'Lakukan di permukaan yang rata dan jauh dari benda tajam untuk keamanan.',
    colorTheme: 'coral',
    status: 'published',
  },
  {
    id: 's8',
    title: 'Kotak Cerita Berurutan',
    activityType: 'Akademik',
    ageGroup: '9-12 tahun',
    learningStyles: ['Visual', 'Membaca/Menulis'],
    summary: 'Melatih kemampuan memahami urutan kejadian dan bercerita secara terstruktur.',
    duration: '20-25 menit',
    materials: ['4-6 gambar yang menunjukkan urutan kejadian sederhana', 'Kotak atau kertas untuk menata gambar'],
    steps: [
      'Siapkan beberapa gambar yang menunjukkan satu cerita pendek dengan urutan jelas.',
      'Acak gambar-gambar tersebut, lalu minta anak mengurutkannya kembali.',
      'Setelah tersusun, minta anak menceritakan kembali urutan kejadian dengan kata-katanya sendiri.',
      'Bantu dengan pertanyaan pemandu seperti "Apa yang terjadi setelah itu?" jika anak kesulitan.',
      'Tulis cerita anak jika ia kesulitan menulis sendiri, lalu baca bersama.',
    ],
    tip: 'Gunakan foto kegiatan sehari-hari anak sendiri agar lebih personal dan mudah dipahami.',
    colorTheme: 'green',
    status: 'published',
  },
  {
    id: 's9',
    title: 'Kartu Emosi Sederhana',
    activityType: 'Sosial',
    ageGroup: '3-5 tahun',
    learningStyles: ['Visual'],
    summary: 'Draft - belum ditinjau. Membantu anak mengenali dan menyebutkan emosi dasar dengan kartu bergambar.',
    duration: '15 menit membuat',
    materials: ['Kertas karton', 'Alat gambar/print wajah ekspresi dasar'],
    steps: [
      'Siapkan 4-6 kartu dengan ekspresi wajah dasar (senang, sedih, marah, takut).',
      'Tunjukkan satu per satu sambil menyebutkan nama emosinya.',
    ],
    tip: 'Gunakan saat anak tenang untuk mengenalkan konsepnya, bukan saat emosi sedang tinggi.',
    colorTheme: 'amber',
    status: 'draft',
  },
];

export function getStrategyById(id: string): Strategy | undefined {
  return STRATEGIES.find(s => s.id === id);
}
