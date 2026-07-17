// KONTEN: wajib review Psikolog Fitri sebelum go-live publik
// TODO: isi nomor WhatsApp bisnis Rekah
export const REKAH_WA_NUMBER = '62XXXXXXXXXX';

export const REKAH_COPY = {
  hero: {
    h1: 'Setiap anak mekar\npada waktunya.',
    body: 'Rekah tidak akan pernah memberi tahu kamu anakmu tertinggal — karena tidak ada yang perlu dikejar. Kami membantumu menanam nilai yang kamu pilih, lewat satu langkah kecil setiap hari.',
    cta: 'Mulai Merekah',
    trust: 'Dikurasi Psikolog & Apoteker ✓',
  },

  masalah: {
    h2: 'Kebanyakan aplikasi membuatmu makin cemas.',
    kartu: [
      {
        icon: 'BookOpen' as const,
        teks: 'Kebanjiran konten parenting yang saling bertentangan — tak tahu mana yang harus dipercaya.',
      },
      {
        icon: 'ClipboardList' as const,
        teks: 'Checklist milestone yang terasa seperti rapor — bukan panduan, malah tekanan.',
      },
      {
        icon: 'HelpCircle' as const,
        teks: 'Teori banyak, tapi bingung "harus ngomong apa sekarang" ke si kecil.',
      },
    ],
  },

  cara: {
    h2: 'Akar yang kuat, mekar pada waktunya.',
    langkah: [
      {
        n: '1',
        judul: 'Akar Keluarga',
        isi: 'Pilih 2 nilai yang ingin kamu tanam: mandiri, empatik, percaya diri, regulasi emosi, komunikatif, atau sosial.',
      },
      {
        n: '2',
        judul: 'Rencana Pekan Ini',
        isi: 'Terima rencana mingguan yang dipersonalisasi lewat WhatsApp — disusun dari nilai pilihanmu dan usia si kecil.',
      },
      {
        n: '3',
        judul: 'Langkah Kecil',
        isi: 'Setiap hari: satu insight, satu aktivitas 5–10 menit, dan satu kalimat siap pakai.',
      },
      {
        n: '4',
        judul: 'Cerita Hari Ini',
        isi: 'Refleksi 30 detik. Setiap momen dirayakan — tidak ada yang dikejar.',
      },
    ],
    penutup: 'Tidak ada dua keluarga dengan rencana yang sama.',
  },

  formulir: {
    judul: 'Akar Keluarga',
    subjudul: 'Daftarkan dirimu — rencana pertamamu akan tiba di WhatsApp dalam 1–2 hari.',
    labelNama: 'Nama panggilanmu',
    placeholderNama: 'Mis. Bunda Sari',
    labelWa: 'Nomor WhatsApp',
    placeholderWa: '08xx atau 628xx',
    labelUsia: 'Usia si kecil',
    usiaOpsi: ['0–6 bln', '7–12 bln', '13–18 bln', '19–24 bln', '25–36 bln'],
    labelNilai: 'Pilih 2 nilai yang ingin kamu tanam',
    nilaiOpsi: [
      { label: 'Mandiri', emoji: '🌱' },
      { label: 'Empatik', emoji: '💗' },
      { label: 'Percaya diri', emoji: '✨' },
      { label: 'Regulasi emosi', emoji: '🌊' },
      { label: 'Komunikatif', emoji: '💬' },
      { label: 'Sosial', emoji: '🤝' },
    ],
    pesanNilaiPenuh: 'Pilih dua dulu ya — fokus itu kekuatan 🌸',
    labelTantangan: 'Tantangan terbesarmu saat ini',
    placeholderTantangan: 'Ceritakan sedikit… (opsional)',
    tombolKirim: 'Tanam Akar Keluargaku',
    validasiNama: 'Siapa nama panggilanmu, Ayah-Bunda? 🌿',
    validasiWa: 'Nomor WhatsApp belum lengkap — cek lagi ya 🌿',
    validasiUsia: 'Pilih usia si kecil dulu ya 🌿',
    validasiNilai: 'Pilih dua nilai yang ingin kamu tanam 🌿',
    suksesJudul: 'Selamat datang di Rekah 🌸',
    suksesIsi: 'Kami akan menyapamu di WhatsApp dalam 1–2 hari.',
    // TODO: ganti WhatsApp deep link dengan endpoint backend/form service saat tersedia.
  },

  kepercayaan: {
    h2: 'Lahir dari ruang kelas yang istimewa.',
    isi: 'Prinsip Rekah lahir dari Sekolah Studiva di Bukittinggi — sekolah untuk anak berkebutuhan khusus di bawah pengawasan psikolog klinis — tempat "setiap anak berkembang di jalurnya sendiri" dipraktikkan setiap hari, bukan sekadar slogan. Prinsip itu kini dibawa untuk semua keluarga Indonesia.',
    namaKurator: 'Psikolog Fitri Effendy',
    peranKurator: 'Penjaga kurasi seluruh konten Rekah — memastikan setiap panduan aman, berbasis riset, dan sesuai budaya Indonesia.',
    // TODO: foto & bio final dari Raisha
  },

  faq: [
    {
      q: 'Apakah Rekah aplikasi untuk anak berkebutuhan khusus?',
      a: 'Bukan — Rekah untuk semua orang tua. Justru prinsip inklusif yang menjadi fondasi Rekah membuat pengalamannya lebih tenang dan tanpa tekanan untuk setiap keluarga.',
    },
    {
      // TODO: konfirmasi copy harga oleh Raisha
      q: 'Berapa biayanya?',
      a: 'Program awal (concierge) gratis untuk peserta terbatas.',
    },
    {
      q: 'Bagaimana rencana dikirim?',
      a: 'Via WhatsApp, setiap awal pekan.',
    },
    {
      q: 'Apakah ini pengganti dokter atau psikolog?',
      a: 'Tidak — Rekah adalah pendamping harian. Untuk kekhawatiran perkembangan, kami selalu mengarahkan kamu berkonsultasi dengan profesional.',
    },
  ],

  footer: {
    tagline: 'Mekar pada waktunya.',
    atribusi: 'Rekah — oleh Psikolog Fitri Effendy. Satu keluarga dengan Sekolah Studiva, Bukittinggi.',
    // TODO: URL domain sekolah
    urlSekolah: '#',
    labelSekolah: 'Sekolah Studiva',
  },
};
