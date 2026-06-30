// TODO: replace with API call to backend /resources endpoint once Tier-2
// content is served dynamically. Kept as static mock data for now.

export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number; // minutes
  summary: string;
  content: string[]; // paragraphs
  colorTheme: 'amber' | 'sky' | 'coral' | 'green';
}

export const CATEGORIES = ['Semua', 'Gaya Belajar', 'Komunikasi', 'Perilaku', 'Sensorik', 'Akademik', 'Terapi'];

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Mengenal Gaya Belajar Visual pada Anak',
    category: 'Gaya Belajar',
    readTime: 5,
    summary: 'Ciri-ciri anak dengan gaya belajar visual dan cara mendukungnya di rumah.',
    colorTheme: 'amber',
    content: [
      'Anak dengan gaya belajar visual cenderung lebih mudah memahami informasi melalui gambar, diagram, warna, dan simbol dibandingkan penjelasan lisan semata. Mereka sering terlihat memperhatikan detail visual di sekitarnya dan suka menggambar atau mewarnai.',
      'Beberapa ciri yang bisa Anda amati: anak senang melihat buku bergambar, mudah mengingat sesuatu yang pernah dilihat, dan cenderung kesulitan mengikuti instruksi yang hanya disampaikan secara lisan tanpa bantuan visual.',
      'Untuk mendukung anak dengan gaya belajar ini, gunakan kartu bergambar, diagram warna-warni, jadwal visual harian, dan video pembelajaran. Saat memberi instruksi, sertakan gestur atau gambar pendukung agar anak lebih mudah memahami.',
      'Yang terpenting, setiap anak unik — gaya belajar ini hanyalah salah satu cara untuk memahami bagaimana anak Anda menyerap informasi paling baik, bukan label yang membatasi.',
    ],
  },
  {
    id: 'a2',
    title: 'Strategi Komunikasi Positif dengan Anak Sensorik',
    category: 'Komunikasi',
    readTime: 7,
    summary: 'Pendekatan komunikasi yang lembut dan efektif untuk anak dengan sensitivitas sensorik.',
    colorTheme: 'coral',
    content: [
      'Anak dengan sensitivitas sensorik bisa merasa kewalahan oleh suara keras, cahaya terang, atau sentuhan yang tidak terduga. Komunikasi yang lembut dan dapat diprediksi membantu mereka merasa lebih aman.',
      'Mulailah dengan menurunkan volume suara Anda dan berbicara di level mata anak. Beri waktu beberapa detik setelah bertanya sebelum mengharapkan jawaban — anak mungkin membutuhkan waktu lebih untuk memproses informasi.',
      'Gunakan kalimat singkat dan jelas. Hindari memberikan terlalu banyak instruksi sekaligus. Sebagai gantinya, pecah menjadi langkah-langkah kecil yang mudah diikuti satu per satu.',
      'Validasi perasaan anak ketika mereka merasa kewalahan: "Ibu tahu suara ini berisik untukmu. Kita bisa pindah ke tempat yang lebih tenang." Pendekatan ini membangun kepercayaan dan rasa aman.',
    ],
  },
  {
    id: 'a3',
    title: 'Membangun Rutinitas Harian yang Konsisten',
    category: 'Perilaku',
    readTime: 6,
    summary: 'Mengapa rutinitas penting bagi anak berkebutuhan khusus dan cara membangunnya.',
    colorTheme: 'sky',
    content: [
      'Rutinitas yang konsisten memberikan rasa aman dan dapat diprediksi bagi anak, terutama anak dengan ASD atau kecemasan. Ketika anak tahu apa yang akan terjadi selanjutnya, tingkat stres mereka cenderung menurun.',
      'Mulailah dengan rutinitas pagi dan malam yang sederhana — bangun, sarapan, gosok gigi, berpakaian — dilakukan dengan urutan yang sama setiap hari. Gunakan jadwal visual jika anak Anda belajar secara visual.',
      'Saat ada perubahan rutinitas yang tidak terhindarkan (misalnya bepergian), beri tahu anak sejak jauh-jauh hari dan jelaskan apa yang akan berbeda. Persiapan ini membantu mengurangi kecemasan.',
      'Konsistensi bukan berarti kaku — tetap beri ruang fleksibilitas, tetapi pertahankan struktur dasar yang membuat anak merasa familiar dengan harinya.',
    ],
  },
  {
    id: 'a4',
    title: 'Aktivitas Sensorik Sederhana di Rumah',
    category: 'Sensorik',
    readTime: 4,
    summary: 'Ide aktivitas sensory play yang bisa dilakukan dengan bahan-bahan rumah tangga.',
    colorTheme: 'green',
    content: [
      'Aktivitas sensorik membantu anak mengeksplorasi tekstur, suara, dan gerakan dengan cara yang menyenangkan sekaligus terapeutik. Anda tidak perlu alat mahal — bahan rumah tangga sudah cukup.',
      'Coba sediakan baskom berisi beras atau pasta kering untuk anak menggali dan merasakan teksturnya. Tambahkan sendok dan cangkir kecil untuk variasi permainan.',
      'Playdough buatan sendiri (tepung, garam, air, minyak) adalah pilihan klasik yang melatih motorik halus sekaligus memberikan input sensorik melalui tekanan dan peremasan.',
      'Perhatikan respons anak selama aktivitas — jika mereka terlihat tidak nyaman, hentikan dan coba aktivitas lain. Tujuannya adalah eksplorasi yang menyenangkan, bukan paksaan.',
    ],
  },
  {
    id: 'a5',
    title: 'Mendukung Anak yang Kesulitan Membaca',
    category: 'Akademik',
    readTime: 8,
    summary: 'Tanda-tanda kesulitan membaca dan pendekatan praktis untuk membantu anak di rumah.',
    colorTheme: 'amber',
    content: [
      'Kesulitan membaca pada anak bisa muncul dalam berbagai bentuk: kesulitan mengenali huruf, kesulitan menggabungkan suara menjadi kata, atau kesulitan memahami apa yang sudah dibaca.',
      'Sebelum berasumsi ada masalah serius, ingat bahwa setiap anak punya kecepatan berkembang yang berbeda. Namun, jika kesulitan ini berlangsung lama dan signifikan, konsultasi dengan psikolog atau spesialis bisa membantu.',
      'Di rumah, Anda bisa membantu dengan membaca bersama setiap hari, menggunakan buku dengan gambar besar dan teks sederhana, serta memberi waktu anak menebak kata dari konteks sebelum membantunya.',
      'Rayakan kemajuan kecil. Membangun kepercayaan diri anak terhadap kemampuan membacanya sama pentingnya dengan kemampuan teknis membaca itu sendiri.',
    ],
  },
  {
    id: 'a6',
    title: 'Apa itu Terapi Okupasi dan Kapan Anak Membutuhkannya?',
    category: 'Terapi',
    readTime: 6,
    summary: 'Pengantar tentang terapi okupasi untuk orang tua yang baru mengenal istilah ini.',
    colorTheme: 'coral',
    content: [
      'Terapi okupasi (occupational therapy) membantu anak mengembangkan keterampilan yang dibutuhkan untuk aktivitas sehari-hari, seperti makan sendiri, berpakaian, menulis, dan bermain.',
      'Terapis okupasi akan menilai kemampuan motorik halus dan kasar anak, koordinasi, serta kemampuan sensorik untuk merancang program yang sesuai dengan kebutuhan spesifik anak Anda.',
      'Tanda anak mungkin membutuhkan terapi okupasi: kesulitan memegang pensil dengan benar, kesulitan menggunakan gunting, mudah frustrasi dengan tugas motorik halus, atau sangat sensitif/kurang sensitif terhadap sentuhan.',
      'Jika Anda mencurigai anak membutuhkan terapi okupasi, diskusikan dengan psikolog atau dokter anak untuk mendapatkan rujukan yang tepat.',
    ],
  },
  {
    id: 'a7',
    title: 'Mengelola Tantrum dengan Tenang dan Efektif',
    category: 'Perilaku',
    readTime: 7,
    summary: 'Langkah-langkah praktis menghadapi tantrum tanpa kehilangan kesabaran.',
    colorTheme: 'sky',
    content: [
      'Tantrum adalah cara anak mengekspresikan emosi yang belum mampu mereka kelola dengan kata-kata. Memahami ini membantu kita merespons dengan empati, bukan kemarahan.',
      'Saat tantrum terjadi, pastikan keselamatan anak terlebih dahulu. Bicara dengan suara tenang dan rendah. Hindari berdebat atau mencoba bernalar saat anak sedang dalam kondisi emosi tinggi.',
      'Setelah anak mulai tenang, validasi perasaannya: "Kamu marah karena harus berhenti bermain. Itu wajar." Baru kemudian bicarakan solusi atau konsekuensi jika diperlukan.',
      'Konsistensi dalam merespons tantrum — tanpa memberikan apa yang diinginkan anak hanya untuk menghentikan tantrum — penting agar anak belajar cara lain mengekspresikan kebutuhannya.',
    ],
  },
  {
    id: 'a8',
    title: 'Gaya Belajar Kinestetik: Anak yang Belajar Lewat Gerakan',
    category: 'Gaya Belajar',
    readTime: 5,
    summary: 'Mengenali dan mendukung anak yang paling baik belajar melalui aktivitas fisik.',
    colorTheme: 'green',
    content: [
      'Anak dengan gaya belajar kinestetik memahami konsep paling baik melalui gerakan dan pengalaman langsung, bukan hanya mendengar atau melihat. Mereka sering terlihat tidak bisa diam dan suka menyentuh segala sesuatu.',
      'Daripada memintanya duduk diam membaca, coba ajak anak belajar berhitung sambil melompat, atau mengenal huruf dengan membentuknya menggunakan tubuh atau playdough.',
      'Berikan jeda gerak (movement breaks) di antara sesi belajar. Lima menit melompat atau berputar bisa membantu anak kembali fokus setelahnya.',
      'Jangan anggap ketidakmampuan duduk diam sebagai kekurangan — ini adalah cara unik anak memproses dan menyerap informasi.',
    ],
  },
  {
    id: 'a9',
    title: 'Membaca Tanda Overload Sensorik pada Anak',
    category: 'Sensorik',
    readTime: 6,
    summary: 'Tanda-tanda awal anak mengalami sensory overload dan cara menanganinya.',
    colorTheme: 'coral',
    content: [
      'Sensory overload terjadi ketika otak menerima lebih banyak informasi sensorik (suara, cahaya, sentuhan, bau) daripada yang bisa diproses dengan nyaman. Ini bisa memicu stres yang besar pada anak.',
      'Tanda-tanda yang perlu diwaspadai: menutup telinga, menghindar dari kontak mata, gelisah berlebihan, atau justru "membeku" dan tidak merespons sama sekali.',
      'Jika Anda melihat tanda-tanda ini, segera bawa anak ke tempat yang lebih tenang dan minim stimulasi. Beri waktu untuk meregulasi diri sebelum kembali ke aktivitas.',
      'Mengenali pemicu spesifik anak Anda (misalnya keramaian, suara mesin, lampu neon) membantu Anda mengantisipasi dan mengurangi frekuensi overload di kemudian hari.',
    ],
  },
];

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find(a => a.id === id);
}
