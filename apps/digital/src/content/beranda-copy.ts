/**
 * ⚠️ SELURUH ISI FILE INI WAJIB DIREVIEW DAN DISETUJUI
 *    PSIKOLOG FITRI EFFENDY SEBELUM MASUK PRODUKSI.
 *
 * Copy di sini adalah PLACEHOLDER yang ditulis untuk keperluan
 * pengembangan UI. Belum melewati alur review konten Rekah
 * (penulis ≠ penyetuju).
 *
 * Jangan deploy ke production dengan isi file ini apa adanya.
 */

export type Waktu = 'pagi' | 'sore' | 'malam';
export type PeranSingkat = 'ibu' | 'ayah';

export const SAPAAN: Record<PeranSingkat, Record<Waktu, { baris1: string; baris2: string }>> = {
  ibu: {
    pagi: {
      baris1: 'Selamat pagi, Bunda.',
      baris2: 'Hari baru, tidak perlu sempurna.',
    },
    sore: {
      baris1: 'Selamat sore, Bunda.',
      baris2: 'Sore ini adalah milik Bunda dan si kecil.',
    },
    malam: {
      baris1: 'Selamat malam, Bunda.',
      baris2: 'Hari yang dijalani adalah hadiah.',
    },
  },
  ayah: {
    pagi: {
      baris1: 'Selamat pagi, Ayah.',
      baris2: 'Hari baru, tidak perlu sempurna.',
    },
    sore: {
      baris1: 'Selamat sore, Ayah.',
      baris2: 'Sore ini adalah milik Ayah dan si kecil.',
    },
    malam: {
      baris1: 'Selamat malam, Ayah.',
      baris2: 'Hari yang dijalani adalah hadiah.',
    },
  },
};

export const LABEL_PERAN: Record<PeranSingkat, string> = {
  ibu: 'Bunda',
  ayah: 'Ayah',
};

export const LABEL_PERAN_PASANGAN: Record<PeranSingkat, string> = {
  ibu: 'Ayah',
  ayah: 'Bunda',
};

export const LANGIT_HATI = {
  judul: 'Langit Hati',
  labelSaya: (peran: PeranSingkat) =>
    peran === 'ibu' ? 'Langit Bunda hari ini' : 'Langit Ayah hari ini',
  judulPasangan: (labelPasangan: string) => `Langit ${labelPasangan} hari ini`,
  sudahTercatat: 'Sudah tercatat.',
  lihatRiwayat: 'Lihat riwayat langit ›',
  belumMencatat: (labelPasangan: string) => `${labelPasangan} belum mencatat hari ini.`,
  cuacaLabel: {
    cerah: 'Cerah',
    berawan: 'Berawan',
    mendung: 'Mendung',
    hujan: 'Hujan',
    badai: 'Badai',
  } as const,
  cuacaEmoji: {
    cerah: '☀️',
    berawan: '⛅',
    mendung: '☁️',
    hujan: '🌧️',
    badai: '⛈️',
  } as const,
};

export const SARAN_CAROUSEL = {
  labelAjakMain: 'Ajak Main',
  labelWawasanTumbuh: 'Wawasan Tumbuh',
  jadwalkanHariIni: 'Jadwalkan hari ini',
  jadwalkanNanti: 'Jadwalkan nanti',
  bacaSekarang: 'Baca sekarang',
  simpanUntukNanti: 'Simpan untuk nanti',
  saranLain: 'Saran lain',
  ariaSlide: (i: number, total: number) => `Slide ${i + 1} dari ${total}`,
  ariaSebelumnya: 'Saran sebelumnya',
  ariaBerikutnya: 'Saran berikutnya',
  ariaAcakUlang: 'Acak saran baru',
  ariaGoToSlide: (i: number) => `Pergi ke slide ${i + 1}`,
};

export const KEBIASAAN_BAIK_CARD = {
  eyebrow: 'Kebiasaan baik · setiap hari',
  penjelasan:
    'Kebiasaan tidak dipilih — semuanya berjalan tiap hari. Centang yang sudah sempat dilakukan.',
  hitungTercatat: (tercatat: number, total: number) => `${tercatat} dari ${total} tercatat`,
  tombolIramaHari: 'Lihat detail kebiasaan baik untuk semua nilai di Irama Hari',
  emptyState:
    'Belum ada yang tercatat hari ini. Tidak apa-apa — hari yang dijalani tetap terhitung, meski tidak dicatat.',
  ariaToggle: (judul: string, tercatat: boolean) =>
    `${judul} — ${tercatat ? 'sudah tercatat, ketuk untuk batal' : 'belum tercatat, ketuk untuk catat'}`,
};

export const WAJAR_ATAU_CEK = {
  eyebrow: 'Ini wajar atau perlu dicek',
  labelWajar: 'Yang umumnya terjadi',
  labelKapan: 'Kapan enaknya dibicarakan',
  lihatSelengkapnya: 'Baca selengkapnya di Ruang Teduh ›',
};

export const BACAAN = {
  judulIbu: 'Bacaan untuk Ibu',
  judulAyah: 'Bacaan untuk Ayah',
  bukaTeduh: 'Buka Ruang Teduh ›',
  dipilihKarena: (alasan: string) => `dipilih karena ${alasan}`,
};

export const KONSULTASI = {
  namaPsikolog: 'Fitri Effendy, M.Psi.',
  peranPsikolog: 'Psikolog · Pendiri Sekolah Studiva',
  pengantar:
    'Punya pertanyaan tentang tumbuh kembang si kecil? Fitri siap menemani Ayah dan Bunda mengobrol — tidak harus ada masalah untuk mulai bicara.',
  tombolWhatsapp: 'Mulai percakapan di WhatsApp',
  catatan:
    'Anda akan diarahkan ke WhatsApp. Konsultasi ini berbayar terpisah dan tidak termasuk langganan Rekah. Rekah tidak memberikan diagnosis, dan layanan ini bukan untuk keadaan darurat.',
};

export const SEDIA = {
  eyebrow: (hariLagi: number) => `Sedia · ${hariLagi} hari lagi`,
  chipBersama: 'Ibu & Ayah menerima ini',
};

export const LAPISAN_TAHUN_PERTAMA = {
  eyebrow: 'Tahun Pertama',
  tombolPiringIbu: 'Piring Ibu',
  tombolLembarNifas: 'Lembar Nifas',
  tombolMenyambut: 'Menyambut Si Kecil',
};

export const PANEN = {
  eyebrow: 'Panen',
  judulCatatan: (n: number) => `${n} catatan tersimpan`,
  ajakan: 'Waktunya meninjau perjalanan ini.',
  linkLihat: 'Lihat panen →',
};

// ─── Beranda desktop (Phase 16) — DRAFT, review Fitri ────────────────────────
export const REKOMENDASI_ARAH = {
  eyebrow: (anak: string) => `Untuk ${anak} hari ini`,
  sub: 'sesuai usia & nilai keluarga',
  arahNote: 'Disesuaikan dari Arah keluargamu — usia & nilai yang sedang ditumbuhkan',
  labelKebiasaan: 'Kebiasaan baik hari ini',
  provKebiasaan: 'Menumbuhkan nilai keluargamu',
  labelAjakMain: 'Ajak main',
  provAjakMain: 'Sebuah ide lembut · dari Bekal',
  labelWawasan: 'Wawasan tumbuh',
  provWawasan: 'Untuk dibaca · dari Bekal',
  jadwalkan: 'Jadwalkan kegiatan ini',
  baca: 'Baca',
  ganti: 'Ganti',
};

export const JADWAL_KEGIATAN = {
  judul: 'Jadwalkan kegiatan',
  kapan: 'Kapan?',
  hariIni: 'Hari ini',
  besok: 'Besok',
  pilihTanggal: 'Pilih tanggal…',
  waktu: 'Waktu',
  diKegiatan: 'Di kegiatan apa?',
  batal: 'Batal',
  simpan: 'Simpan jadwal',
  konfirmasi: (hari: string, waktu: string, keg: string) => `Dijadwalkan: ${hari} · ${waktu} · ${keg}`,
};

export const FORUM_SHORTCUT = {
  judul: 'Tanya jawab',
  sub: 'Dijawab sesama Bunda & Tim Studiva',
  buka: 'Buka forum',
  tulis: 'Tulis di forum',
  tanya: 'Tanya Psikolog',
  balasan: (n: number) => `${n} balasan`,
  dijawabPsikolog: 'Dijawab Psikolog',
  privat: 'Privat',
  kosong: 'Belum ada pertanyaan. Kamu bisa mulai yang pertama.',
};

export const KONSULTASI_CTA = {
  judul: 'Konsultasi online bersama psikolog',
  sub: 'Bicara langsung dengan Psikolog Fitri',
  pengantar: 'Ada hal yang ingin dibicarakan lebih dalam tentang tumbuh kembang si kecil? Buat janji sesi personal, di waktu yang kamu pilih.',
  tombol: 'Buat janji konsultasi',
  disclaimer: 'Layanan berbayar terpisah · bukan layanan darurat · tidak menggantikan pemeriksaan atau diagnosis medis.',
};

export const YANG_BARU = {
  judul: 'Yang baru di Rekah',
  lihatSemua: 'Lihat semua',
  sesuaiUsia: (anak: string) => `sesuai usia ${anak}`,
};

export const RENCANA_HARI_INI = {
  judul: 'Rencana hari ini',
  sub: 'dari Kelola',
  buka: 'Buka Kelola',
  pagi: 'Pagi',
  siang: 'Siang',
  malam: 'Malam',
  kosong: 'Belum ada rencana untuk bagian hari ini.',
};
