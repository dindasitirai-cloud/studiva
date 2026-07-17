// =============================================================================
// WAJIB REVIEW PSIKOLOG FITRI SEBELUM RILIS KE PILOT
// Seluruh copy UI fitur Partner Orang Tua dikumpulkan di sini agar review
// dapat dilakukan dalam satu tempat tanpa perlu menelusuri komponen satu per satu.
// =============================================================================

export const VOICE_GUIDE = {
  sapaan: ['Bunda', 'Ayah'],
  nada: 'hangat, tenang, tidak menggurui, tidak menghakimi',
  larangan: [
    'Tidak pernah memberi label diagnostik (mis. "autis", "ADHD", "terlambat")',
    'Tidak menjanjikan hasil ("pasti bisa", "dijamin")',
    'Tidak memberi saran medis atau obat',
    'Tidak membandingkan anak dengan anak lain',
    'Tidak memakai bahasa defisit atau tenggat usia',
  ],
  eskalasi:
    'Topik klinis atau red flag diteruskan ke Psikolog — pendamping tidak menjawab sendiri',
};

// Copy statis — Halaman orang tua
export const COPY_PARENT = {
  introTitle: 'Kenalan dengan Partner Orang Tua 🤝',
  introBody:
    'Partner Orang Tua adalah pendamping pribadi Bunda dan Ayah dalam menemani tumbuh kembang si kecil. Ceritakan apa saja — kebingungan, kekhawatiran, atau kabar baik hari ini. Tim pendamping kami akan membalas di hari kerja, paling lambat 1×24 jam.',
  introPoin: [
    {
      label: 'Didampingi tim yang dibimbing langsung oleh Psikolog',
      icon: 'ShieldCheck' as const,
    },
    {
      label: 'Cerita Bunda tersimpan aman dan privat',
      icon: 'Lock' as const,
    },
    {
      label: 'Balasan di hari kerja, maks. 1×24 jam',
      icon: 'Clock' as const,
    },
  ],
  introDisclaimer:
    'Partner Orang Tua bukan layanan darurat. Untuk kondisi darurat atau krisis, segera hubungi layanan kesehatan terdekat.',
  composerPlaceholder: 'Ceritakan apa saja kepada Kak pendamping...',
  composerKirim: 'Kirim',
  jembatanOtomatis:
    'Cerita Bunda sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
  emptyState: 'Belum ada percakapan. Mulai cerita di bawah ya.',
};

// Copy statis — Inbox admin / pendamping
export const COPY_ADMIN = {
  pageTitle: 'Partner Orang Tua',
  inboxEmptyState: 'Tidak ada thread saat ini.',
  catatanReminder: 'Catatan observasi, bukan diagnosa. Gunakan bahasa perilaku yang teramati.',
  catatanPlaceholder: 'Tulis catatan observasi perilaku di sini...',
  catatanKirim: 'Simpan Catatan',
  catatanEmpty: 'Belum ada catatan untuk anak ini.',
  replyPlaceholder: 'Tulis balasan untuk orang tua...',
  namaPenandaTangan: 'Nama penanda tangan',
  namaPenandaTanganDefault: 'Kak Sari',
  kirimBalasan: 'Kirim Balasan',
  tandaiSelesai: 'Tandai Selesai',
  tandaiSelesaiKonfirmasi: 'Tandai percakapan ini sebagai selesai?',
  tandaiSelesaiYa: 'Ya, Selesai',
  tandaiSelesaiBatal: 'Batal',
  profilAnakTitle: 'Profil Anak',
};

// Label status badge
export const STATUS_LABEL: Record<string, string> = {
  menunggu_balasan: 'Menunggu Balasan',
  dibalas: 'Sudah Dibalas',
  selesai: 'Selesai',
};
