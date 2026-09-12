// Temani — seed data perjalanan (Phase 14B). DUMMY/preview untuk mengatur tampilan.
// DRAFT: kenapaSumber null → layer "sumber" TIDAK ditampilkan sampai diisi & disetujui
// Psikolog Fitri Effendy (invariant kejujuran). Rentang usia sengaja dilebarkan sementara
// agar selalu tampil saat menata UI; kelak dipersempit sesuai kurasi.
import type { NilaiAkar, MateriItem } from '../akar-keluarga/content';
import { MATERI } from '../akar-keluarga/content';

export type TemaniStatus = 'draft' | 'menunggu_review' | 'disetujui';

export interface TemaniHari {
  hari: number;
  fokus: string;
  script?: string;
  kenapaSederhana?: string;
  kenapaEvidence?: string;
  kenapaSumber?: string | null; // null → jangan tampilkan layer sumber
  yangDiamati?: string;
  /** 'target' = menuju satu Kebiasaan Baik (butuh kebiasaanId) · 'perancah' = langkah menemani, tak menulis kebiasaan menetap. */
  jenis?: 'target' | 'perancah';
  /** Untuk hari 'target': ID Kebiasaan Baik (MATERI) yang dituju — satu sumber kebenaran, bukan menyalin. */
  kebiasaanId?: string;
}

export interface TemaniJourney {
  slug: string;
  judul: string;
  deskripsi: string;
  nilaiTerkait: NilaiAkar[];
  usiaMinBulan: number;
  usiaMaxBulan: number;
  durasiHari: number;
  status: TemaniStatus;
  /** Kebiasaan Baik utama yang diadopsi saat kelulusan → kunci dedupe di Kelola. */
  kebiasaanUtama?: string;
  hari: TemaniHari[];
}

const KEMANDIRIAN: TemaniHari[] = [
  { hari: 1, fokus: 'Beri jeda sebelum membantu — tunggu beberapa detik saat anak mencoba.', script: 'Coba dulu ya, Ibu di sini menemani.', kenapaSederhana: 'Anak butuh sedikit waktu untuk mencoba sebelum berhasil.', kenapaEvidence: 'Memberi jeda memberi ruang anak melatih kemampuan baru; bantuan yang terlalu cepat bisa memperkecil kesempatan berlatih.', kenapaSumber: null, yangDiamati: 'Apakah anak mencoba lebih lama saat diberi jeda?', jenis: 'perancah' },
  { hari: 2, fokus: 'Perhatikan satu hal yang sudah bisa anak lakukan sendiri.', script: 'Catatan untuk diri sendiri: hari ini si kecil bisa ... sendiri.', kenapaSederhana: 'Mengenali yang sudah bisa membantu kita tahu langkah kecil berikutnya.', kenapaEvidence: 'Kemandirian tumbuh bertahap; mengamati titik anak sekarang membuat dukungan lebih pas.', kenapaSumber: null, yangDiamati: 'Satu kemampuan mandiri yang muncul hari ini.', jenis: 'perancah' },
  { hari: 3, fokus: 'Tawarkan dua pilihan kecil yang keduanya sama-sama oke.', script: 'Mau pakai kaus merah atau biru?', kenapaSederhana: 'Pilihan kecil memberi anak rasa punya kendali tanpa membuat kewalahan.', kenapaEvidence: 'Rasa memiliki kendali mendukung kerja sama dan menurunkan penolakan pada batita.', kenapaSumber: null, yangDiamati: 'Apakah anak lebih tenang saat merasa bisa memilih?', jenis: 'target', kebiasaanId: 'kb-030' },
  { hari: 4, fokus: 'Libatkan anak dalam satu tugas kecil yang nyata.', script: 'Boleh tolong taruh sepatumu di rak?', kenapaSederhana: 'Tugas kecil yang nyata membuat anak merasa berperan.', kenapaEvidence: 'Terlibat dalam kegiatan sehari-hari melatih kemampuan sekaligus rasa mampu.', kenapaSumber: null, yangDiamati: 'Apakah anak antusias diberi peran?', jenis: 'target', kebiasaanId: 'kb-018' },
  { hari: 5, fokus: 'Hargai usaha anak, bukan hasilnya.', script: 'Kamu berusaha memakai kaus kaki sendiri — itu hebat.', kenapaSederhana: 'Menghargai usaha membuat anak berani mencoba lagi.', kenapaEvidence: 'Fokus pada proses/usaha mendukung ketekunan dibanding fokus hanya pada hasil.', kenapaSumber: null, yangDiamati: 'Apakah anak mau mencoba lagi setelah usahanya diakui?', jenis: 'perancah' },
  { hari: 6, fokus: 'Temani saat frustrasi — dampingi emosinya sebelum membantu.', script: 'Susah ya. Ibu di sini. Mau coba bareng?', kenapaSederhana: 'Anak belajar lebih baik saat merasa ditemani, bukan diambil alih.', kenapaEvidence: 'Pendampingan emosi (co-regulation) membantu anak menenangkan diri dan kembali mencoba.', kenapaSumber: null, yangDiamati: 'Apakah anak lebih cepat tenang saat ditemani?', jenis: 'perancah' },
  { hari: 7, fokus: 'Refleksi seminggu & pilih satu kebiasaan untuk dilanjutkan.', script: 'Mulai sekarang, kita beri si kecil memilih bajunya tiap pagi.', kenapaSederhana: 'Kebiasaan kecil yang konsisten lebih bertahan daripada banyak hal sekaligus.', kenapaEvidence: 'Pengulangan dalam rutinitas mengokohkan kemampuan.', kenapaSumber: null, yangDiamati: 'Pilih satu langkah paling cocok untuk dijadikan kebiasaan.', jenis: 'perancah' },
];

const TIDUR: TemaniHari[] = [
  { hari: 1, fokus: 'Beri peringatan sebelum bersiap tidur.', script: 'Lima menit lagi kita mulai bersiap tidur ya.', kenapaSederhana: 'Perubahan yang bisa diprediksi terasa lebih aman bagi anak.', kenapaSumber: null, yangDiamati: 'Apakah transisi lebih mulus dengan peringatan?' },
  { hari: 2, fokus: 'Buat urutan tetap: mandi → buku → lampu redup.', script: 'Sekarang waktunya buku, lalu kita matikan lampu.', kenapaSederhana: 'Urutan yang sama tiap malam membantu tubuh & pikiran anak bersiap.', kenapaSumber: null, yangDiamati: 'Apakah anak mulai hafal urutannya?' },
  { hari: 3, fokus: 'Jaga nada tenang walau anak menawar.', script: 'Aku dengar kamu masih mau main. Sekarang waktunya tidur, besok kita main lagi.', kenapaSederhana: 'Ketegasan yang lembut lebih menenangkan daripada negosiasi panjang.', kenapaSumber: null, yangDiamati: 'Apakah tawar-menawar berkurang?' },
  { hari: 4, fokus: 'Refleksi & pilih satu ritual untuk dipertahankan.', script: 'Kita simpan cerita sebelum tidur sebagai kebiasaan kita.', kenapaSederhana: 'Satu ritual yang konsisten lebih kuat daripada banyak aturan.', kenapaSumber: null, yangDiamati: 'Ritual mana yang paling menenangkan anak?' },
];

const MAKAN: TemaniHari[] = [
  { hari: 1, fokus: 'Sajikan porsi kecil + satu makanan yang ia suka.', script: 'Ini nasi sedikit, dan ada pisang kesukaanmu.', kenapaSederhana: 'Porsi kecil terasa tidak menakutkan bagi anak.', kenapaSumber: null, yangDiamati: 'Apakah anak lebih mau mulai makan?' },
  { hari: 2, fokus: 'Beri peran kecil: memilih atau memegang sendok.', script: 'Mau makan pakai sendok merah atau hijau?', kenapaSederhana: 'Sedikit kendali membuat anak lebih mau terlibat.', kenapaSumber: null, yangDiamati: 'Apakah suasana makan lebih santai?' },
  { hari: 3, fokus: 'Jaga meja tanpa tekanan; akhiri dengan tenang.', script: 'Kalau sudah kenyang, tidak apa-apa. Terima kasih sudah mencoba.', kenapaSederhana: 'Tanpa paksaan, makan tidak menjadi pertarungan.', kenapaSumber: null, yangDiamati: 'Apakah anak lebih rileks di meja makan?' },
];

export const TEMANI_JOURNEYS: TemaniJourney[] = [
  {
    slug: 'kemandirian-kecil-7-hari',
    judul: '7 Hari Membangun Kemandirian Kecil',
    deskripsi: 'Untuk keluarga yang ingin memberi anak lebih banyak kesempatan mencoba sendiri — pelan-pelan, satu langkah kecil tiap hari.',
    nilaiTerkait: ['Kemandirian'],
    usiaMinBulan: 6, usiaMaxBulan: 72, durasiHari: KEMANDIRIAN.length, status: 'menunggu_review', kebiasaanUtama: 'kb-030', hari: KEMANDIRIAN,
  },
  {
    slug: 'tidur-tenang',
    judul: 'Rutinitas Tidur yang Lebih Tenang',
    deskripsi: 'Untuk keluarga yang ingin malam terasa lebih tenang, dengan transisi yang bisa diprediksi anak.',
    nilaiTerkait: ['Sabar'],
    usiaMinBulan: 6, usiaMaxBulan: 72, durasiHari: TIDUR.length, status: 'menunggu_review', hari: TIDUR,
  },
  {
    slug: 'makan-santai',
    judul: 'Makan Lebih Santai',
    deskripsi: 'Untuk keluarga yang ingin suasana makan lebih santai, tanpa drama.',
    nilaiTerkait: ['Sabar'],
    usiaMinBulan: 6, usiaMaxBulan: 72, durasiHari: MAKAN.length, status: 'draft', hari: MAKAN,
  },
];

/** Perjalanan yang cocok untuk usia anak & (bila ada) nilai keluarga. */
export function journeysUntuk(usiaBulan: number | null, nilaiKeluarga: readonly NilaiAkar[]): TemaniJourney[] {
  return TEMANI_JOURNEYS.filter(j => {
    const cocokUsia = usiaBulan === null ? true : usiaBulan >= j.usiaMinBulan && usiaBulan <= j.usiaMaxBulan;
    const cocokNilai = nilaiKeluarga.length === 0 ? true : j.nilaiTerkait.some(n => nilaiKeluarga.includes(n));
    return cocokUsia && cocokNilai;
  });
}

/** Cari satu butir Kebiasaan Baik (MATERI) berdasarkan id — satu sumber kebenaran untuk Temani. */
export function kebiasaanById(id: string | undefined | null): MateriItem | undefined {
  if (!id) return undefined;
  for (const band of MATERI) {
    const found = band.find(m => m.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Journey Temani yang menuju satu Kebiasaan Baik (kb id) — untuk cross-link dari Bekal. */
export function journeyUntukKebiasaan(kbId: string | undefined | null): TemaniJourney | undefined {
  if (!kbId) return undefined;
  return TEMANI_JOURNEYS.find(
    j => j.kebiasaanUtama === kbId || j.hari.some(h => h.kebiasaanId === kbId),
  );
}
