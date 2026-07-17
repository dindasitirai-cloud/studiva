// KONTEN: wajib review Psikolog Fitri sebelum rilis

import type { NilaiId } from '@studiva/shared';

export const COPY = {
  // ── Langkah 1 — Sambutan ─────────────────────────────────────────────
  step1: {
    heading: 'Kenalan dulu, yuk 🌸',
    body: 'Lima langkah singkat supaya Rekah bisa menemanimu dengan cara yang paling pas untuk keluargamu.',
    cta: 'Mulai',
  },

  // ── Langkah 2 — Profil anak ──────────────────────────────────────────
  step2: {
    heading: 'Siapa yang akan kita temani?',
    labelNama: 'Siapa nama panggilan si kecil?',
    placeholderNama: 'mis. Kaka, Adek, Bumi…',
    labelTanggal: 'Kapan ia lahir?',
    konfirmasiUsia: (nama: string, bulan: number) =>
      `${nama}, ${bulan} bulan 🌱`,
    usiaLunak: (nama: string) =>
      `Saat ini Rekah menemani usia 0–36 bulan. Kami sedang menyiapkan musim untuk usia selanjutnya 🌸`,
    // TODO: keputusan Raisha — batas keras atau lunak untuk usia 37–48 bln? (default: lunak)
    tanggalMasaDepan: 'Tanggal lahir tidak bisa di masa depan ya.',
    cta: 'Lanjut',
  },

  // ── Langkah 3 — Tentang si kecil (opsional) ──────────────────────────
  step3: {
    heading: 'Cerita sedikit tentang si kecil',
    subheading: 'Semua pertanyaan di langkah ini opsional — lewati kapan saja.',
    labelTemperamen: 'Bagaimana si kecil biasanya?',
    temperamen: {
      tenang: { label: 'Tenang', emoji: '🍃', deskripsi: 'Mudah beradaptasi, suka ritme yang perlahan' },
      aktif: { label: 'Aktif', emoji: '⚡', deskripsi: 'Penuh energi, selalu ingin bergerak' },
      sensitif: { label: 'Sensitif', emoji: '🌸', deskripsi: 'Peka terhadap lingkungan dan perasaan' },
      campuran: { label: 'Campuran', emoji: '🌈', deskripsi: 'Tergantung situasi dan waktu' },
    } as Record<string, { label: string; emoji: string; deskripsi: string }>,
    labelTantangan: 'Yang lagi menantang akhir-akhir ini…',
    placeholderTantangan: 'Yang lagi menantang akhir-akhir ini… (opsional)',
    ctaLewati: 'Lewati dulu',
    cta: 'Lanjut',
  },

  // ── Langkah 4 — Tentang kamu ─────────────────────────────────────────
  step4: {
    heading: 'Dan tentang kamu?',
    labelNama: 'Apa nama panggilanmu?',
    placeholderNama: 'mis. Mama, Bunda, Ayah, Oma…',
    labelPeran: 'Peranmu di sini',
    peran: {
      ibu: 'Ibu',
      ayah: 'Ayah',
      'nenek-kakek': 'Nenek/Kakek',
      pengasuh: 'Pengasuh',
      lainnya: 'Lainnya',
    } as Record<string, string>,
    labelEnergi: 'Bagaimana energimu akhir-akhir ini?',
    energiNote: 'Jawaban ini membantu kami menakar rencana — bukan menilai kamu.',
    energi: {
      penuh: { label: 'Penuh', emoji: '🔋', deskripsi: 'Siap dan semangat' },
      cukup: { label: 'Cukup', emoji: '🙂', deskripsi: 'Bisa, walau perlu diatur' },
      menipis: { label: 'Menipis', emoji: '🕯️', deskripsi: 'Butuh langkah-langkah yang lebih ringan' },
    } as Record<string, { label: string; emoji: string; deskripsi: string }>,
    cta: 'Lanjut',
  },

  // ── Langkah 5 — Akar Keluarga ────────────────────────────────────────
  step5: {
    heading: 'Anak seperti apa yang ingin kamu bantu tumbuh?',
    subheading: 'Pilih 2 nilai untuk Musim pertamamu — 4 minggu ke depan. Nanti bisa ganti di Musim berikutnya.',
    warningDua: 'Pilih dua dulu ya — fokus itu kekuatan 🌸',
    cta: 'Tanam Akar Keluargaku',
  },

  // ── Layar perayaan ───────────────────────────────────────────────────
  celebration: {
    heading: 'Akarnya tertanam!',
    subheading: (nilai1: string, nilai2: string) =>
      `Musim ${nilai1} & ${nilai2} dimulai hari ini 🌱`,
    cta: 'Lihat berandaku',
  },

  // ── Beranda (pasca onboarding) ───────────────────────────────────────
  beranda: {
    musimHeader: (nilai1: string, nilai2: string) =>
      `Musim ini: menanam ${nilai1} & ${nilai2}`,
    usiaAnak: (nama: string, bulan: number) => `${nama}, ${bulan} bulan`,
    langkahKecilJudul: 'Langkah Kecil hari ini',
    langkahKecilIsi: 'Sedang disiapkan untuk Musimmu 🌱',
    jejakMekarLabel: 'Jejak Mekar',
    jejakMekarSoon: 'segera',
    belumAdaProfil: 'Kenalan ulang sebentar ya 🌸',
    belumAdaProfilCta: 'Mulai kenalan',
  },

  // ── Navigasi umum ────────────────────────────────────────────────────
  nav: {
    back: 'Kembali',
    skip: 'Lewati dulu',
  },
};

// Deskripsi singkat nilai untuk kartu Langkah 5
export const NILAI_COPY: Record<NilaiId, { emoji: string; deskripsiSingkat: string }> = {
  mandiri: { emoji: '🌿', deskripsiSingkat: 'Percaya bahwa ia bisa sendiri' },
  empatik: { emoji: '💗', deskripsiSingkat: 'Peduli pada perasaan orang lain' },
  'percaya-diri': { emoji: '✨', deskripsiSingkat: 'Berani mencoba hal baru' },
  'regulasi-emosi': { emoji: '🌊', deskripsiSingkat: 'Mengenal dan mengelola perasaan' },
  komunikatif: { emoji: '🗣️', deskripsiSingkat: 'Mengungkapkan dirinya dengan jelas' },
  sosial: { emoji: '🤝', deskripsiSingkat: 'Senang bermain dan berbagi' },
};
