// Kegiatan Sehari-hari (Phase 14E) — penggabungan Kebiasaan Baik + Momen Sehari-hari
// menjadi SATU daftar kegiatan, tiap item punya keterangan MOMEN + urutan, diurutkan
// mengikuti alur hari (yang tak jelas → "Tengah hari / kapan saja").
// Additive & app-layer: butir Kebiasaan tetap dari MATERI/sikap (frozen); modul ini hanya
// menambah pemetaan momen + 5 item unik dari Momen. STATUS: DRAFT — kurasi menunggu Fitri.
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import { MATERI } from '../akar-keluarga/content';

// Deskripsi per butir Kebiasaan (kb-###), diambil dari MATERI (frozen).
const DESKRIPSI_KB: Record<string, string> = {};
for (const band of MATERI) for (const it of band) if (it.id) DESKRIPSI_KB[it.id] = it.deskripsi;

export interface MomenSlot { key: string; label: string; urutan: number; ikon: string }
export const MOMEN_SLOTS: MomenSlot[] = [
  { key: 'bangun',  label: 'Saat bangun tidur',        urutan: 10, ikon: '🌅' },
  { key: 'pagi',    label: 'Saat pagi',                urutan: 20, ikon: '🌤️' },
  { key: 'mandi',   label: 'Saat mandi',               urutan: 30, ikon: '🛁' },
  { key: 'makan',   label: 'Saat makan',               urutan: 40, ikon: '🍽️' },
  { key: 'bermain', label: 'Saat bermain',             urutan: 50, ikon: '🧸' },
  { key: 'tengah',  label: 'Tengah hari / kapan saja', urutan: 55, ikon: '☀️' },
  { key: 'rewel',   label: 'Saat rewel',               urutan: 58, ikon: '🫂' },
  { key: 'tidur',   label: 'Saat mau tidur',           urutan: 90, ikon: '🌙' },
];
const SLOT_BY_KEY: Record<string, MomenSlot> = Object.fromEntries(MOMEN_SLOTS.map(s => [s.key, s]));

// Parameter "kapan" (Phase 15): tiap momen menempel di kegiatan default (bagian waktu) —
// KECUALI momen situasional yang muncul kapan saja (sticky note), tidak di kegiatan default.
export const MOMEN_SITUASIONAL: string[] = ['rewel'];
export const DAYPART_MOMEN: Record<string, 'pagi' | 'siang' | 'malam'> = {
  bangun: 'pagi', pagi: 'pagi', mandi: 'pagi',
  makan: 'siang', bermain: 'siang', tengah: 'siang',
  tidur: 'malam',
};

// Pemetaan butir Kebiasaan (kb-###) → momen. Kurasi awal (bisa diubah, review Fitri).
export const MOMEN_MAP: Record<string, string> = {
  'kb-001':'bangun','kb-002':'rewel','kb-003':'mandi','kb-004':'bermain','kb-005':'tengah',
  'kb-006':'tidur','kb-007':'tengah','kb-008':'bermain','kb-009':'tengah','kb-010':'bermain',
  'kb-011':'tengah','kb-012':'makan','kb-013':'bermain','kb-014':'bermain','kb-015':'bermain',
  'kb-016':'bermain','kb-017':'tengah','kb-018':'makan','kb-019':'tengah','kb-020':'bermain',
  'kb-021':'tengah','kb-022':'tengah','kb-023':'tengah','kb-024':'tidur','kb-025':'makan',
  'kb-026':'tengah','kb-027':'tengah','kb-028':'tengah','kb-029':'bermain','kb-030':'pagi',
  'kb-031':'tidur','kb-032':'tengah','kb-033':'bermain','kb-034':'pagi','kb-035':'tengah',
  'kb-036':'rewel','kb-037':'makan','kb-038':'bermain','kb-039':'tengah','kb-040':'tidur',
  'kb-041':'tidur','kb-042':'tengah','kb-043':'pagi','kb-044':'bermain','kb-045':'tengah',
  'kb-046':'bermain','kb-047':'bermain','kb-048':'bermain','kb-049':'tengah','kb-050':'tengah',
  'kb-051':'bermain','kb-052':'tengah','kb-053':'tengah','kb-054':'tengah','kb-055':'tidur',
  'kb-056':'tidur','kb-057':'tengah',
};

// 5 item unik dari Momen Sehari-hari (tak ada padanannya di Kebiasaan). Berlaku semua usia.
export interface KegiatanTambahan { id: string; judul: string; deskripsi: string; nilai: NilaiAkar; momen: string }
export const KEGIATAN_TAMBAHAN: KegiatanTambahan[] = [
  { id: 'msh-001', judul: 'Peluk & sapa hangat saat bangun', deskripsi: 'Sambut anak dengan hangat begitu ia bangun.', nilai: 'Kasih Sayang', momen: 'bangun' },
  { id: 'msh-002', judul: 'Tunjukkan perasaan orang lain', deskripsi: '"Lihat, temanmu sedih." — melatih membaca perasaan.', nilai: 'Empati', momen: 'bermain' },
  { id: 'msh-003', judul: 'Hargai saat ia bercerita apa adanya', deskripsi: 'Sambut cerita jujurnya dengan tenang.', nilai: 'Kejujuran', momen: 'tengah' },
  { id: 'msh-004', judul: 'Nikmati permainan sederhana bersama', deskripsi: 'Main dengan barang sederhana, tanpa perlu mainan mahal.', nilai: 'Kesederhanaan', momen: 'bermain' },
  { id: 'msh-005', judul: 'Ceritakan apa yang sedang kalian lakukan', deskripsi: 'Narasikan aktivitas sehari-hari sebagai percakapan.', nilai: 'Cinta Ilmu', momen: 'tengah' },
];

export interface KegiatanHari {
  id: string;
  judul: string;
  deskripsi: string;
  nilai: NilaiAkar[];
  nilaiUtama: NilaiAkar;   // dipakai untuk centang (pola KartuKebiasaanBaik: per nilai + butir)
  momenKey: string;
  momenLabel: string;
  ikon: string;
  urutan: number;
}

/** Daftar kegiatan sehari-hari untuk usia & nilai fokus keluarga, terurut per momen. */
export function kegiatanHariIni(
  usiaBulan: number,
  nilaiFokus: readonly NilaiAkar[],
  katalogSikap: readonly ItemSikap[],
): KegiatanHari[] {
  const out: KegiatanHari[] = [];
  const seen = new Set<string>();
  for (const nilai of nilaiFokus) {
    for (const b of resolveSikap(usiaBulan, [nilai], katalogSikap)) {
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      const slot = SLOT_BY_KEY[MOMEN_MAP[b.id] ?? 'tengah'] ?? SLOT_BY_KEY['tengah'];
      out.push({ id: b.id, judul: b.judul, deskripsi: DESKRIPSI_KB[b.id] ?? '', nilai: b.nilai, nilaiUtama: nilai, momenKey: slot.key, momenLabel: slot.label, ikon: slot.ikon, urutan: slot.urutan });
    }
  }
  for (const t of KEGIATAN_TAMBAHAN) {
    if (nilaiFokus.length > 0 && !nilaiFokus.includes(t.nilai)) continue;
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    const slot = SLOT_BY_KEY[t.momen] ?? SLOT_BY_KEY['tengah'];
    out.push({ id: t.id, judul: t.judul, deskripsi: t.deskripsi, nilai: [t.nilai], nilaiUtama: t.nilai, momenKey: slot.key, momenLabel: slot.label, ikon: slot.ikon, urutan: slot.urutan });
  }
  out.sort((a, b) => a.urutan - b.urutan);
  return out;
}
