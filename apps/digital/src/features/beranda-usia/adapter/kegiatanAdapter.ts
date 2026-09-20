import {
  ACTIVITIES, EDU_TOOLS, DOWNLOADABLES, DOMAIN_META,
} from '../../../data/learningStrategies';
import type { DomainKey } from '../../../data/learningStrategies';
import type { ItemBekal, SubTahapId } from '../bekal';
import { DAFTAR_BEKAL } from '../bekalRegistry';
import {
  KODE, blokir, peringatan, POLA_KATA_TERLARANG,
} from './laporan';
import type { Temuan } from './laporan';
import { TAG_NILAI_LS } from '../../../data/tagNilaiLS.generated';

export interface ItemDenganTahap {
  subTahapId: SubTahapId;
  item: ItemBekal;
}

export interface HasilKegiatan {
  items: ItemDenganTahap[];
  temuan: Temuan[];
}

// ─── Semua sub-tahap yang tersedia dari registry ──────────────────────────────

const SEMUA_SUBTAHAP = DAFTAR_BEKAL.flatMap(b => b.subTahap);

// EduTool dan Downloadable memakai minBulan/maxBulan, bukan sub-tahap id.
// Satu item boleh masuk ke banyak sub-tahap bila range-nya mencakup lebih dari satu.
// Overlap didefinisikan: item.minBulan < st.usiaBulanSelesai && item.maxBulan > st.usiaBulanMulai

function subTahapYangOverlap(minBulan: number, maxBulan: number): SubTahapId[] {
  return SEMUA_SUBTAHAP
    .filter(st => minBulan < st.usiaBulanSelesai && maxBulan > st.usiaBulanMulai)
    .map(st => st.id);
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export function adaptKegiatan(): HasilKegiatan {
  const items: ItemDenganTahap[] = [];
  const temuan: Temuan[] = [];
  const idSet = new Set<string>();

  // ── Activity (ageId langsung = sub-tahap id) ───────────────────────────────
  for (const act of ACTIVITIES) {
    const lokasi = `aktivitas:${act.id}`;

    if (!act.judul || !act.judul.trim()) {
      temuan.push(blokir(KODE.JUDUL_KOSONG, `Judul aktivitas id ${act.id} kosong.`, { lokasi }));
      continue;
    }
    if (POLA_KATA_TERLARANG.test(act.judul)) {
      temuan.push(blokir(KODE.KATA_TERLARANG,
        `Kata terlarang di judul aktivitas: "${act.judul}"`, { lokasi }));
    }

    const tag = TAG_NILAI_LS[lokasi];
    const nilai = tag?.nilai ?? [];
    const tanpaTemaNilai = tag?.tanpaTemaNilai === true || act.tanpaTemaNilai === true;

    if (nilai.length > 0 && tanpaTemaNilai) {
      temuan.push(blokir(KODE.NILAI_DAN_TANPA_TEMA_BERSAMAAN,
        `Aktivitas "${act.judul}" punya nilai terisi dan tanpaTemaNilai — keduanya saling meniadakan.`,
        { lokasi },
      ));
    }

    if (nilai.length === 0 && !tanpaTemaNilai) {
      temuan.push(peringatan(KODE.LS_TANPA_NILAI,
        `Aktivitas "${act.judul}" belum punya tag nilai Akar Keluarga.`,
        { lokasi, saran: 'Tambahkan field nilai di Learning Strategies atau lewat xlsx review.' },
      ));
    }

    // Durasi aktivitas ada — tidak perlu peringatan
    // Domain: pakai elemen pertama (Activity.domain adalah array)
    const domain = act.domain[0] as DomainKey;

    const id = `ls-act-${act.id}`;
    if (idSet.has(id)) {
      temuan.push(blokir(KODE.ID_DUPLIKAT, `Id kegiatan duplikat: ${id}`, { lokasi }));
      continue;
    }
    idSet.add(id);

    const item: ItemBekal = {
      id,
      judul: act.judul,
      tipe: 'aktivitas',
      domain,
      domainSemua: act.domain,
      nilai,
      tanpaTemaNilai: tanpaTemaNilai || undefined,
      perkiraanDurasiMenit: act.durasiMenit,
      pemilik: 'anak',
      sumberId: String(act.id),
    };
    items.push({ subTahapId: act.ageId, item });
  }

  // ── EduTool (minBulan/maxBulan → kemungkinan banyak sub-tahap) ───────────
  for (const edu of EDU_TOOLS) {
    const lokasi = `alatEdukasi:${edu.id}`;

    if (!edu.nama || !edu.nama.trim()) {
      temuan.push(blokir(KODE.JUDUL_KOSONG, `Nama alat edukasi id ${edu.id} kosong.`, { lokasi }));
      continue;
    }
    if (POLA_KATA_TERLARANG.test(edu.nama)) {
      temuan.push(blokir(KODE.KATA_TERLARANG,
        `Kata terlarang di nama alat edukasi: "${edu.nama}"`, { lokasi }));
    }

    const tag = TAG_NILAI_LS[lokasi];
    const nilai = tag?.nilai ?? [];
    const tanpaTemaNilai = tag?.tanpaTemaNilai === true || edu.tanpaTemaNilai === true;

    if (nilai.length > 0 && tanpaTemaNilai) {
      temuan.push(blokir(KODE.NILAI_DAN_TANPA_TEMA_BERSAMAAN,
        `Alat edukasi "${edu.nama}" punya nilai terisi dan tanpaTemaNilai — keduanya saling meniadakan.`,
        { lokasi },
      ));
    }

    if (nilai.length === 0 && !tanpaTemaNilai) {
      temuan.push(peringatan(KODE.LS_TANPA_NILAI,
        `Alat edukasi "${edu.nama}" belum punya tag nilai Akar Keluarga.`,
        { lokasi },
      ));
    }

    // Durasi tidak berlaku untuk benda — tidak picu DURASI_KOSONG

    const tahapList = subTahapYangOverlap(edu.minBulan, edu.maxBulan);
    if (tahapList.length === 0) {
      temuan.push(peringatan(KODE.SUBTAHAP_KOSONG,
        `Alat edukasi "${edu.nama}" (${edu.minBulan}–${edu.maxBulan} bln) tidak overlap dengan sub-tahap mana pun.`,
        { lokasi },
      ));
      continue;
    }

    for (const subTahapId of tahapList) {
      const id = `ls-edu-${edu.id}-${subTahapId}`;
      if (idSet.has(id)) {
        temuan.push(blokir(KODE.ID_DUPLIKAT, `Id kegiatan duplikat: ${id}`, { lokasi }));
        continue;
      }
      idSet.add(id);

      const item: ItemBekal = {
        id,
        judul: edu.nama,
        tipe: 'alatEdukasi',
        domain: edu.domain,
        nilai,
        tanpaTemaNilai: tanpaTemaNilai || undefined,
        perkiraanDurasiMenit: undefined,
        pemilik: 'anak',
        sumberId: String(edu.id),
      };
      items.push({ subTahapId, item });
    }
  }

  // ── Downloadable (minBulan/maxBulan → kemungkinan banyak sub-tahap) ────────
  for (const dl of DOWNLOADABLES) {
    const lokasi = `unduhan:${dl.id}`;

    if (!dl.nama || !dl.nama.trim()) {
      temuan.push(blokir(KODE.JUDUL_KOSONG, `Nama unduhan id ${dl.id} kosong.`, { lokasi }));
      continue;
    }
    if (POLA_KATA_TERLARANG.test(dl.nama)) {
      temuan.push(blokir(KODE.KATA_TERLARANG,
        `Kata terlarang di nama unduhan: "${dl.nama}"`, { lokasi }));
    }

    const tag = TAG_NILAI_LS[lokasi];
    const nilai = tag?.nilai ?? [];
    const tanpaTemaNilai = tag?.tanpaTemaNilai === true || dl.tanpaTemaNilai === true;

    if (nilai.length > 0 && tanpaTemaNilai) {
      temuan.push(blokir(KODE.NILAI_DAN_TANPA_TEMA_BERSAMAAN,
        `Unduhan "${dl.nama}" punya nilai terisi dan tanpaTemaNilai — keduanya saling meniadakan.`,
        { lokasi },
      ));
    }

    if (nilai.length === 0 && !tanpaTemaNilai) {
      temuan.push(peringatan(KODE.LS_TANPA_NILAI,
        `Unduhan "${dl.nama}" belum punya tag nilai Akar Keluarga.`,
        { lokasi },
      ));
    }

    // Durasi tidak berlaku untuk berkas — tidak picu DURASI_KOSONG

    // Pemilik: baca dari sumber; bila tidak disediakan, gunakan 'anak' dan laporkan
    const pemilik = dl.pemilik ?? 'anak';
    if (dl.pemilik === undefined) {
      temuan.push(peringatan(KODE.PEMILIK_DIKERASKAN,
        `Unduhan "${dl.nama}" tidak punya field pemilik — diasumsikan 'anak'.`,
        { lokasi, saran: 'Tambahkan field pemilik ke item ini di learningStrategies.ts.' },
      ));
    }

    // Item yang perlu ditinjau manusia
    if (dl.perluTinjauan) {
      temuan.push(peringatan(KODE.PERLU_TINJAUAN_MANUSIA,
        `Unduhan "${dl.nama}" perlu ditinjau manusia sebelum ditampilkan: ${dl.perluTinjauan}`,
        { lokasi },
      ));
    }

    const tahapList = subTahapYangOverlap(dl.minBulan, dl.maxBulan);
    if (tahapList.length === 0) {
      temuan.push(peringatan(KODE.SUBTAHAP_KOSONG,
        `Unduhan "${dl.nama}" (${dl.minBulan}–${dl.maxBulan} bln) tidak overlap dengan sub-tahap mana pun.`,
        { lokasi },
      ));
      continue;
    }

    for (const subTahapId of tahapList) {
      const id = `ls-dl-${dl.id}-${subTahapId}`;
      if (idSet.has(id)) {
        temuan.push(blokir(KODE.ID_DUPLIKAT, `Id kegiatan duplikat: ${id}`, { lokasi }));
        continue;
      }
      idSet.add(id);

      const item: ItemBekal = {
        id,
        judul: dl.nama,
        tipe: 'unduhan',
        domain: dl.domain,
        nilai,
        tanpaTemaNilai: tanpaTemaNilai || undefined,
        perkiraanDurasiMenit: undefined,
        pemilik,
        sumberId: String(dl.id),
      };
      items.push({ subTahapId, item });
    }
  }

  // ── Domain coverage check ─────────────────────────────────────────────────────
  const domainDipakai = new Set(items.map(({ item }) => item.domain as DomainKey));
  for (const dk of Object.keys(DOMAIN_META) as DomainKey[]) {
    if (!domainDipakai.has(dk)) {
      temuan.push(peringatan(KODE.DOMAIN_TANPA_KEGIATAN,
        `Domain "${DOMAIN_META[dk].label}" belum punya kegiatan apa pun dalam pool.`,
        { saran: 'Tambahkan kegiatan yang ditag domain ini ke learningStrategies.ts.' },
      ));
    }
  }

  return { items, temuan };
}
