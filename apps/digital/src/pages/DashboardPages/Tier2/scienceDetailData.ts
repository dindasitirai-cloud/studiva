export interface SciStatCard { v: string; l: string; ref: number; }
export interface SciSection  { h: string; p: { t: string; refs?: number[] }[]; }
export interface SciFig {
  ae: string; al: string; asSub: string;
  big: string; small: string;
  be: string; bl: string; bsSub: string;
  num: number; title: string; cap: string;
}
export interface ScienceDetailData {
  reviewer: string;
  date: string;
  title: string;
  readMin: number;
  audioTotal: number;
  stats: SciStatCard[];
  sections: SciSection[];
  fig: SciFig;
  keypoint: string;
  refs: string[];
}

// Keyed by `${DomainCode}-${AgeKey}` e.g. 'FM-0-3m'
export const SCI_DATA: Record<string, ScienceDetailData> = {
  'FM-0-3m': {
    reviewer: 'dr. Sinta Wijaya, Sp.A', date: 'Juli 2026',
    title: 'Bagaimana bayi menegakkan kepala: otot, saraf, dan tummy time',
    readMin: 5, audioTotal: 12,
    stats: [
      { v: '3–4 bln', l: 'usia umum bayi menahan kepala stabil saat digendong tegak', ref: 1 },
      { v: '≈2×/hari', l: 'frekuensi tummy time yang dianjurkan sejak lahir', ref: 2 },
    ],
    sections: [
      { h: 'Kekuatan yang tumbuh dari bawah ke atas', p: [
        { t: 'Perkembangan motorik bayi mengikuti arah kepala-ke-kaki (cephalocaudal): kendali kepala dan leher matang lebih dulu sebelum duduk, merangkak, dan berjalan.', refs: [1] },
        { t: 'Setiap kali bayi mengangkat kepala saat tengkurap, ia melatih otot leher belakang, bahu, dan punggung atas — fondasi seluruh gerak besar berikutnya.' },
      ]},
      { h: 'Mengapa tummy time berpengaruh', p: [
        { t: 'Bayi yang rutin tengkurap saat terjaga mencapai tonggak motorik lebih cepat dan lebih jarang mengalami kepala peyang (positional plagiocephaly).', refs: [2, 3] },
      ]},
    ],
    fig: { ae: '🤸', al: 'Tengkurap', asSub: 'saat terjaga', big: 'latihan', small: 'otot leher & bahu',
           be: '💪', bl: 'Kepala tegak', bsSub: 'makin stabil',
           num: 1, title: 'Rantai kekuatan tummy time', cap: 'Menahan kepala saat tengkurap menguatkan otot yang dipakai untuk duduk dan merangkak.' },
    keypoint: 'Mulai singkat—1–2 menit beberapa kali sehari—dan tambah durasi seiring bayi makin kuat. Selalu dampingi.',
    refs: [
      'American Academy of Pediatrics. Back to Sleep, Tummy to Play. 2022.',
      'CDC. Learn the Signs. Act Early. — Milestones 2 bulan. 2024.',
      'Dudek-Shriber L, Zelazny S. The effects of prone positioning. Pediatr Phys Ther. 2007.',
    ],
  },

  'KG-0-3m': {
    reviewer: 'Psikolog Fitri Effendy, M.Psi', date: 'Juli 2026',
    title: 'Bagaimana bayi belajar lewat mata dan indra',
    readMin: 6, audioTotal: 14,
    stats: [
      { v: '20–30 cm', l: 'jarak fokus terbaik bayi baru lahir, persis jarak wajah pengasuh', ref: 1 },
      { v: '1 jt+', l: 'koneksi saraf baru terbentuk tiap detik di tahun-tahun awal', ref: 2 },
    ],
    sections: [
      { h: 'Penglihatan yang belum matang', p: [
        { t: 'Penglihatan adalah indra yang paling belum matang saat lahir. Bayi baru lahir hanya bisa memfokuskan pandangan pada jarak sekitar 20–30 cm — persis jarak wajah Anda saat menggendong atau menyusui.', refs: [1] },
        { t: 'Karena itulah bayi paling tertarik pada wajah manusia dan pola kontras tinggi seperti hitam-putih, jauh sebelum ia mengenali warna lembut.' },
      ]},
      { h: 'Setiap tatapan membangun otak', p: [
        { t: 'Pada tahap sensorimotor (Piaget), bayi menyusun pemahaman dunia lewat indra dan gerak. Interaksi tatap-muka yang hangat memicu pembentukan koneksi saraf dengan kecepatan luar biasa.', refs: [2, 3] },
      ]},
    ],
    fig: { ae: '🤱', al: 'Pengasuh', asSub: 'wajah Anda', big: '±20–30 cm', small: 'zona fokus terbaik',
           be: '👶', bl: 'Bayi', bsSub: 'mata baru',
           num: 1, title: 'Jarak fokus bayi baru lahir', cap: 'Bayi baru lahir paling jelas melihat pada jarak wajah Anda saat menggendong.' },
    keypoint: 'Dekatkan wajah pada jarak ±20–30 cm, gerakkan mainan perlahan kiri–kanan, dan tawarkan pola kontras tinggi.',
    refs: [
      'CDC. Learn the Signs. Act Early. — Milestones 2 bulan. 2024.',
      'Center on the Developing Child, Harvard University. Brain Architecture. 2020.',
      'Piaget J. The Origins of Intelligence in Children. 1952.',
    ],
  },

  'BH-0-3m': {
    reviewer: 'Terapis Wicara Rani Kusuma, S.Tr', date: 'Juli 2026',
    title: 'Cooing: fondasi bahasa sebelum kata pertama',
    readMin: 5, audioTotal: 11,
    stats: [
      { v: '6–8 mgg', l: 'usia bayi mulai mengeluarkan suara vokal (cooing)', ref: 1 },
      { v: '>2×', l: 'bayi yang sering diajak bicara punya kosakata lebih kaya kelak', ref: 2 },
    ],
    sections: [
      { h: 'Percakapan bergiliran sejak dini', p: [
        { t: 'Cooing adalah latihan pertama alat bicara. Saat Anda membalas suaranya dan memberi jeda, bayi belajar ritme percakapan bergiliran (serve and return) jauh sebelum ia bisa berkata.', refs: [1, 2] },
      ]},
      { h: 'Bahasa tumbuh dari respons', p: [
        { t: 'Semakin sering suara bayi ditanggapi dengan hangat, semakin kuat jalur bahasa di otaknya. Kualitas interaksi lebih penting daripada sekadar banyaknya kata.', refs: [3] },
      ]},
    ],
    fig: { ae: '🗣️', al: 'Anda', asSub: 'balas & beri jeda', big: 'giliran', small: 'serve & return',
           be: '👶', bl: 'Bayi', bsSub: 'coo & jeda',
           num: 1, title: 'Pola percakapan bergiliran', cap: 'Membalas suara bayi mengajarkannya ritme percakapan sejak awal.' },
    keypoint: 'Balas setiap suara bayi, beri jeda seolah menunggu jawaban, dan sebutkan nama benda dalam kegiatan harian.',
    refs: [
      'American Speech-Language-Hearing Association. Communication Milestones. 2023.',
      'Center on the Developing Child, Harvard. Serve and Return. 2019.',
      'Hart B, Risley T. Meaningful Differences. 1995.',
    ],
  },

  'SE-0-3m': {
    reviewer: 'Psikolog Fitri Effendy, M.Psi', date: 'Juli 2026',
    title: 'Senyum sosial: akar ikatan aman',
    readMin: 5, audioTotal: 10,
    stats: [
      { v: '6–8 mgg', l: 'usia munculnya senyum sosial pertama sebagai respons wajah', ref: 1 },
      { v: 'konsisten', l: 'respons yang stabil membangun rasa percaya pada dunia', ref: 2 },
    ],
    sections: [
      { h: 'Senyum yang punya makna', p: [
        { t: 'Berbeda dari senyum refleks saat tidur, senyum sosial muncul sebagai balasan pada wajah dan suara Anda. Ini tanda bayi mulai mengaitkan kehadiran Anda dengan rasa nyaman.', refs: [1] },
      ]},
      { h: 'Ikatan aman terbentuk dari respons', p: [
        { t: 'Menurut teori kelekatan (attachment), bayi yang tangisannya ditanggapi dengan konsisten belajar bahwa dunia bisa dipercaya — dasar regulasi emosi seumur hidup.', refs: [2, 3] },
      ]},
    ],
    fig: { ae: '😢', al: 'Tangis', asSub: 'butuh Anda', big: 'ditanggapi', small: 'hangat & konsisten',
           be: '💗', bl: 'Rasa aman', bsSub: 'ikatan kuat',
           num: 1, title: 'Siklus tanggap → rasa aman', cap: 'Respons yang konsisten mengubah tangisan menjadi rasa percaya.' },
    keypoint: 'Tanggapi tangisan dengan lembut dan konsisten, lakukan kontak mata, dan balas setiap senyum bayi.',
    refs: [
      'American Academy of Pediatrics. Emotional Development. 2022.',
      'Bowlby J. Attachment and Loss. 1969.',
      'Ainsworth M. Patterns of Attachment. 1978.',
    ],
  },

  'KS-0-3m': {
    reviewer: 'dr. Sinta Wijaya, Sp.A', date: 'Juli 2026',
    title: 'Tidur aman & ritme menyusu di bulan pertama',
    readMin: 6, audioTotal: 13,
    stats: [
      { v: '≈50%', l: 'penurunan risiko SIDS dengan posisi tidur telentang', ref: 1 },
      { v: '8–12×', l: 'perkiraan frekuensi menyusu sehari sesuai isyarat lapar', ref: 2 },
    ],
    sections: [
      { h: 'Lingkungan tidur yang aman', p: [
        { t: 'Menidurkan bayi telentang di kasur datar dan keras, tanpa bantal, selimut tebal, atau mainan, terbukti menurunkan risiko sindrom kematian bayi mendadak (SIDS) secara signifikan.', refs: [1] },
      ]},
      { h: 'Menyusu sesuai isyarat', p: [
        { t: 'Pada bulan pertama, menyusu mengikuti isyarat lapar bayi—bukan jadwal kaku—membantu produksi ASI dan memastikan asupan yang cukup untuk tumbuh kembang.', refs: [2] },
      ]},
    ],
    fig: { ae: '👶', al: 'Bayi', asSub: 'telentang', big: 'kasur datar', small: 'tanpa bantal/selimut',
           be: '😴', bl: 'Tidur aman', bsSub: 'risiko turun',
           num: 1, title: 'Kunci tidur aman', cap: 'Telentang, alas keras, dan ruang tidur bersih adalah dasar tidur aman.' },
    keypoint: 'Tidurkan telentang di alas keras, susui sesuai isyarat lapar, dan jaga ruang bebas asap rokok.',
    refs: [
      'AAP Task Force on SIDS. Safe Sleep Recommendations. 2022.',
      'WHO. Infant and Young Child Feeding. 2021.',
      'IDAI. Rekomendasi Pemberian ASI. 2023.',
    ],
  },

  'PS-0-3m': {
    reviewer: 'Psikolog Fitri Effendy, M.Psi', date: 'Juli 2026',
    title: 'Kontak kulit & suara menenangkan',
    readMin: 5, audioTotal: 12,
    stats: [
      { v: '≈2 jam', l: 'durasi skin-to-skin harian yang bermanfaat pada minggu awal', ref: 1 },
      { v: '↓ kortisol', l: 'kontak kulit menurunkan hormon stres bayi dan orang tua', ref: 2 },
    ],
    sections: [
      { h: 'Sentuhan yang menstabilkan tubuh', p: [
        { t: 'Kontak kulit-ke-kulit (kangaroo care) membantu menstabilkan suhu, detak jantung, dan pernapasan bayi, sekaligus menurunkan hormon stres pada bayi maupun pengasuh.', refs: [1, 2] },
      ]},
      { h: 'Suara sebagai jangkar rasa aman', p: [
        { t: 'Detak jantung, senandung, dan suara lembut Anda sudah dikenali bayi sejak dalam kandungan — menjadi sinyal aman yang menenangkannya dengan cepat.', refs: [3] },
      ]},
    ],
    fig: { ae: '🤍', al: 'Dada Anda', asSub: 'skin-to-skin', big: 'menenangkan', small: 'suhu & detak stabil',
           be: '👶', bl: 'Bayi', bsSub: 'tenang',
           num: 1, title: 'Efek kontak kulit', cap: 'Skin-to-skin menstabilkan tubuh bayi dan mempererat ikatan.' },
    keypoint: 'Lakukan skin-to-skin di dada saat bayi rewel, gunakan suara lembut, dan ayun perlahan atau bedong.',
    refs: [
      'WHO. Kangaroo Mother Care Guidelines. 2003.',
      'Feldman R et al. Skin-to-skin contact. Biol Psychiatry. 2014.',
      'AAP. Newborn Care. 2022.',
    ],
  },

  'DK-0-3m': {
    reviewer: 'dr. Sinta Wijaya, Sp.A', date: 'Juli 2026',
    title: 'Deteksi dini: membaca tanda dengan tenang',
    readMin: 6, audioTotal: 9,
    stats: [
      { v: '0–3 thn', l: 'jendela emas perkembangan otak yang paling responsif', ref: 1 },
      { v: 'lebih awal', l: 'intervensi dini memperbaiki hasil jangka panjang', ref: 2 },
    ],
    sections: [
      { h: 'Rentang normal itu lebar', p: [
        { t: 'Sebagian besar bayi berkembang dalam rentang waktu yang luas. Memantau tonggak (milestone) bertujuan mengenali pola, bukan membandingkan bayi Anda dengan bayi lain.', refs: [1] },
      ]},
      { h: 'Kapan perlu bertindak', p: [
        { t: 'Kehilangan keterampilan yang sudah dimiliki, tidak ada kontak mata, atau tubuh yang sangat kaku/lemas adalah tanda untuk segera berdiskusi dengan tenaga kesehatan — tanpa menunda.', refs: [2, 3] },
      ]},
    ],
    fig: { ae: '📋', al: 'Pantau', asSub: 'milestone bulanan', big: 'deteksi dini', small: 'bicarakan bila ragu',
           be: '🔎', bl: 'Tindakan', bsSub: 'intervensi tepat',
           num: 1, title: 'Alur deteksi dini', cap: 'Pantau tonggak tiap bulan dan diskusikan kekhawatiran lebih awal.' },
    keypoint: 'Catat milestone tiap bulan, bandingkan dengan panduan usia, dan jangan menunda konsultasi bila ada kekhawatiran.',
    refs: [
      'CDC. Learn the Signs. Act Early. — Developmental Monitoring. 2024.',
      'Guralnick MJ. Early Intervention. 2011.',
      'IDAI. Skrining Perkembangan Anak. 2023.',
    ],
  },

  'FM-3-6m': {
    reviewer: 'dr. Sinta Wijaya, Sp.A', date: 'Juli 2026',
    title: 'Berguling & meraih: koordinasi mulai terbentuk',
    readMin: 5, audioTotal: 12,
    stats: [
      { v: '4–6 bln', l: 'usia umum bayi mulai berguling dan meraih benda', ref: 1 },
      { v: 'mata↔tangan', l: 'meraih melatih koordinasi visual-motorik', ref: 2 },
    ],
    sections: [
      { h: 'Dari meraih ke bergerak', p: [
        { t: 'Saat bayi meraih benda dengan tangan terbuka, ia melatih koordinasi mata-tangan sekaligus kekuatan inti tubuh yang dibutuhkan untuk duduk dan, kelak, merangkak.', refs: [1, 2] },
      ]},
      { h: 'Ruang aman untuk bereksplorasi', p: [
        { t: 'Berguling sering muncul tiba-tiba. Beri ruang lantai yang aman dan letakkan mainan sedikit di luar jangkauan untuk memancing gerakan—sambil selalu mengawasi.', refs: [3] },
      ]},
    ],
    fig: { ae: '🧸', al: 'Mainan', asSub: 'sedikit di luar jangkauan', big: 'memancing', small: 'meraih & berguling',
           be: '👶', bl: 'Bayi', bsSub: 'koordinasi tumbuh',
           num: 1, title: 'Memancing gerak bayi', cap: 'Mainan di luar jangkauan mendorong meraih, berguling, dan kekuatan inti.' },
    keypoint: 'Sediakan ruang lantai aman, letakkan mainan sedikit di luar jangkauan, dan awasi karena bayi bisa berguling sewaktu-waktu.',
    refs: [
      'CDC. Learn the Signs. Act Early. — Milestones 6 bulan. 2024.',
      'WHO. Motor Development Study. 2006.',
      'AAP. Movement Milestones. 2022.',
    ],
  },
};
