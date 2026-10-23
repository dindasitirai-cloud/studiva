// =============================================================
// profil-anak-copy — SEMUA teks Profil Anak v2 (Phase 33).
// STATUS: DRAFT → tinjauan Psikolog Fitri Effendy.
// Bagian bertanda [APOTEKER] juga ditinjau apoteker sebelum tayang.
// Aturan: tanpa bahasa defisit/diagnostik, tanpa angka progres, tanpa
// perbandingan antar-anak, tanpa emoji. Jalankan pemindai kata
// (lib/pemindaiKata) setiap kali teks di sini diubah.
// =============================================================

export const COPY_PROFIL = {
  eyebrow: 'Profil anak',
  judul: (nama: string) => `Mengenal ${nama}`,
  sub: 'Semua isi Rekah menyesuaikan dengan yang tertulis di sini.',

  pemilih: {
    label: 'Pilih anak',
    tambah: 'Tambah anak',
  },

  potret: {
    gantiFoto: (nama: string) => `Ganti foto ${nama}`,
    lahir: (tgl: string) => `Lahir ${tgl}`,
    labelAi: 'Rangkuman AI',
    ajakan: (nama: string) => `Ceritakan sedikit tentang ${nama} supaya saran Rekah terasa lebih pas.`,
    perbarui: (nama: string) => `Perbarui tentang ${nama}`,
    bagikan: 'Bagikan ke pengasuh',
    ubahData: 'Ubah data diri',
    tahap: (judul: string) => `Tahap ${judul}`,
    bahasa: (v: string) => `Bahasa: ${v}`,
  },

  akar: {
    judul: 'Yang kami tanam',
    sub: (nama: string) => `Nilai keluarga untuk ${nama}`,
    tautan: 'Lihat di Perjalanan',
    fokus: 'Fokus pekan ini',
    kosongJudul: 'Tanahnya sedang disiapkan',
    kosong: 'Nilai keluarga ditanam dari Bekal dan Perjalanan. Begitu ada, akarnya tumbuh di sini.',
  },

  tentang: {
    judul: (nama: string) => `${nama} akhir-akhir ini`,
    sub: 'Dari jawabanmu di Peta keluarga. Ketuk kartu untuk memperbarui.',
    tautan: 'Buka Peta keluarga',
    belum: 'Belum diceritakan',
    ketukIsi: 'Ketuk untuk mengisi',
    privat: 'privat',
    berubahJudul: 'Sedang berubah',
    berubahTautan: 'Kelola di Kehidupan Keluarga',
  },

  laci: {
    judul: (nama: string) => `Tentang ${nama} sekarang`,
    sub: (tahap: string) => `Pertanyaan untuk tahap ${tahap}. Pilih yang paling mendekati, boleh dilewati.`,
    tutup: 'Tutup',
    catatan: 'Jawaban langsung tersimpan dan juga tampil di Peta keluarga di Kelola.',
    selesai: 'Selesai',
    tersimpan: 'Tersimpan.',
  },

  terlihat: {
    judul: 'Yang terlihat 3 minggu ini',
    sub: 'Dari Jurnal. Yang kamu catat membantu Rekah memilih kegiatan.',
    tautan: 'Catat di Jurnal',
    domainKosong: 'Belum ada catatan di 3 minggu ini',
    kosong: (nama: string) => `Saat menulis Jurnal, tandai hal yang terlihat dari ${nama}. Semuanya akan berkumpul di sini.`,
  },

  kartu: {
    judul: (nama: string) => `Kartu untuk yang menjaga ${nama}`,
    sub: 'Kirim ke nenek, pengasuh, atau daycare sebelum menitipkan.',
    pilihJudul: 'Pilih yang dibagikan',
    bagian: {
      alergi: 'Alergi dan pantangan',
      rewel: 'Saat rewel',
      makan: 'Makan dan kebiasaan',
      cara: 'Cara kita mengasuh',
      khusus: 'Catatan khusus',
      darurat: 'Kontak darurat',
    },
    privat: 'privat',
    isiDulu: 'isi dulu',
    kirimWa: 'Kirim lewat WhatsApp',
    simpanGambar: 'Simpan sebagai gambar',
    salin: 'Salin teks',
    disalin: 'Teks kartu disalin.',
    tidakBisaSalin: 'Teks tidak bisa disalin otomatis. Pilih teksnya lalu salin manual.',
    gambarTersimpan: 'Gambar kartu disimpan.',
    gambarTidakBisa: 'Gambar belum bisa dibuat di perangkat ini. Coba Salin teks.',
    catatanPrivasi: (nama: string) => `Kartu ini berisi data ${nama}. Kirim hanya ke orang yang menjaganya.`,
    pratinjauKepala: 'Yang menjaga hari ini',
    tidakAdaAlergi: 'Tidak ada alergi yang diketahui',
    // [APOTEKER] baris tanda bahaya alergi — DRAFT
    tandaAlergi: 'Bila setelah makan muncul ruam, bengkak di bibir atau wajah, atau sulit bernapas, segera hubungi kontak darurat dan bawa ke fasilitas kesehatan terdekat.',
    kaki: (tgl: string) => `Disusun ${tgl} dari Rekah`,
    judulTeks: (nama: string, usia: string) => `Kartu pengasuh ${nama} (${usia})`,
    faskes: 'Faskes terdekat',
  },

  kontak: {
    ubah: 'Ubah kontak darurat',
    tutup: 'Selesai',
    nama: 'Nama',
    hubungan: 'Hubungan',
    nomor: 'Nomor',
    tambah: 'Tambah kontak',
    hapus: (n: string) => `Hapus ${n || 'kontak'}`,
    maks: 'Maksimal tiga kontak.',
    faskes: 'Puskesmas atau klinik terdekat (opsional)',
    phNama: 'Bunda',
    phHubungan: 'Ibu',
    phNomor: '0812 3456 7890',
    phFaskes: 'Puskesmas Mandiangin',
    nomorTidakValid: 'Nomor perlu minimal 8 angka.',
    catatanKhusus: (nama: string) => `Catatan khusus untuk pengasuh ${nama} (opsional, privat)`,
    phCatatanKhusus: 'Hal yang perlu diketahui pengasuh, misalnya kebutuhan khusus atau obat rutin dari dokter.',
  },

  orang: {
    judul: (nama: string) => `Orang di sekitar ${nama}`,
    kosong: 'Belum ada pendamping. Tambahkan lewat Ubah data diri.',
    ubah: 'Ubah',
  },

  mendatang: {
    judul: 'Yang akan datang',
    sub: 'Dari jadwal Buku KIA dan peristiwa keluarga',
    tautan: 'Lihat semua',
    imunisasi: (label: string) => `Imunisasi ${label}`,
    ketImunisasi: 'Sesuai Buku KIA. Pastikan jadwalnya di posyandu atau faskes.',
    kosong: 'Belum ada yang dijadwalkan.',
  },

  kenangan: {
    judul: 'Momen yang kami rayakan',
    sub: 'Dari foto dan cerita di Jurnal',
    tautan: 'Buka Jurnal',
    kosong: 'Foto yang kamu simpan di Jurnal akan tampil di sini.',
  },

  hapus: {
    tombol: (nama: string) => `Hapus profil ${nama}`,
    judul: (nama: string) => `Hapus profil ${nama}?`,
    isi: 'Nilai yang ditanam, catatan Irama Hari, dan riwayat kebun untuk profil ini ikut terhapus dan tidak bisa dikembalikan.',
    batal: 'Batal',
    ya: 'Ya, hapus',
  },

  footer: (nama: string) =>
    `Profil ini hanya membandingkan ${nama} dengan dirinya sendiri. Semua bisa diubah, dijeda, atau dihapus. Untuk hal kesehatan, bicarakan dengan tenaga kesehatan.`,
} as const;

/** Redesign Profil Anak (design_handoff_profil_anak, 2026-10-22). DRAFT → Fitri. */
export const COPY_REDESIGN = {
  eyebrow: 'PROFIL ANAK',
  tambahAnak: 'Tambah',
  subUsia: (usia: string, tgl: string) => `${usia} · lahir ${tgl}`,
  labelRangkuman: 'RANGKUMAN REKAH',
  bacaLengkap: 'Baca lengkap',
  ringkas: 'Ringkas',
  kartuPengasuh: 'Kartu untuk pengasuh',
  alergiLabel: 'ALERGI / PANTANGAN',
  petaKeluarga: 'Peta keluarga',
  ubahJawaban: (label: string) => `Ubah ${label.toLowerCase()}`,
  lihatSemua: (label: string) => `Tampilkan semua ${label.toLowerCase()}`,
  belumDiceritakan: (n: number) => `${n} hal belum diceritakan`,
  ceritakan: 'Ceritakan',
  sedangBerubah: 'SEDANG BERUBAH',
  kelola: 'Kelola',
  terlihatSub: (n: number, total: number) => `${n} dari ${total} area tercatat di Jurnal`,
  catat: 'Catat',
  lainnya: (n: number) => `+${n} lainnya`,
  bannerJudul: (nama: string) => `Kartu untuk yang menjaga ${nama}`,
  bannerSub: 'Alergi, saat rewel, makan & kontak darurat dalam satu kartu',
  bannerTombol: 'Buat & kirim',
  mendatangCatatan: 'Jadwal Buku KIA · pastikan di posyandu/faskes',
  usiaBulan: (bln: number) => (bln === 0 ? 'Saat lahir' : `Usia ${bln} bulan`),
  orangJudul: 'Orang di sekitar',
  orangTambah: 'Kakak, nenek…',
  tanamJudul: 'Yang kami tanam',
  tanamTautan: 'Perjalanan',
  tanamKosong: 'Belum ada nilai. Tanam dari Bekal & Perjalanan.',
  fokusPekanIni: 'fokus pekan ini',
  tambahMomen: 'Tambah momen',
  modalSub: 'Untuk nenek, pengasuh, atau daycare',
  modalDibagikan: 'YANG DIBAGIKAN',
  modalIsiDulu: '· isi dulu',
  modalTutup: 'Tutup',
  modalPrivasi: (nama: string) => `Kirim hanya ke orang yang menjaga ${nama}`,
  opsi: { alergi: 'Alergi', rewel: 'Saat rewel', makan: 'Makan', cara: 'Cara mengasuh', khusus: 'Catatan khusus', darurat: 'Kontak darurat' },
  pratinjauLabel: {
    alergi: 'ALERGI DAN PANTANGAN', rewel: 'SAAT REWEL', makan: 'MAKAN', cara: 'CARA KITA MENGASUH', khusus: 'CATATAN KHUSUS', darurat: 'KONTAK DARURAT',
  },
  ubahData: 'Ubah data diri',
} as const;

/** Kata kerja lembut untuk jawaban "cara menenangkan" saat dipakai dalam kalimat. */
export const TENANG_DALAM_KALIMAT: Record<string, string> = {
  'Digendong': 'digendong',
  'Disusui': 'disusui',
  'Dinyanyikan': 'dinyanyikan',
  'Diajak bicara': 'diajak bicara',
  'Waktu tenang': 'diberi waktu tenang',
};
