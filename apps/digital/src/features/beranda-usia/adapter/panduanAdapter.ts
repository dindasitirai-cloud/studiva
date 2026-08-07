import { CARDS } from '@studiva/shared';
import type { DomainCode } from '@studiva/shared';
import type { ItemBekal, SubTahapId } from '../bekal';
import {
  KODE, blokir, peringatan, POLA_KATA_TERLARANG,
} from './laporan';
import type { Temuan } from './laporan';
import { hitungWaktuBaca } from './waktuBaca';

export interface ItemDenganTahap {
  subTahapId: SubTahapId;
  item: ItemBekal;
}

export interface HasilPanduan {
  items: ItemDenganTahap[];
  panduanTersaringDeteksiDini: number;
  temuan: Temuan[];
}

// ─── Pemetaan AgeKey → sub-tahap id ─────────────────────────────────────────
// knowledgeCardData.ts pakai AgeKey ("0-3m", "3-6m", …, "5-6y").
// Ini pemetaan 1:1 dengan 10 sub-tahap Bekal.

const AGE_KEY_TO_SUBTAHAP: Record<string, SubTahapId> = {
  '0-3m':   'b03',
  '3-6m':   'b36',
  '6-9m':   'b69',
  '9-12m':  'b912',
  '12-18m': 't1218',
  '18-24m': 't1824',
  '2-3y':   'u23',
  '3-4y':   'u34',
  '4-5y':   'u45',
  '5-6y':   'u56',
};

// Domain "DK" = Deteksi Dini & Kebutuhan Khusus — tidak boleh dijadwalkan.
const DOMAIN_DETEKSI_DINI: DomainCode = 'DK';

// Domain resmi selain DK
const DOMAIN_PANDUAN_RESMI = new Set<string>(['FM', 'KG', 'BH', 'SE', 'KS', 'PS', 'DK']);

// ─── Adapter ─────────────────────────────────────────────────────────────────

export function adaptPanduan(): HasilPanduan {
  const items: ItemDenganTahap[] = [];
  const temuan: Temuan[] = [];
  const idSet = new Set<string>();
  let tersaringDeteksiDini = 0;

  for (const card of CARDS) {
    const lokasi = card.id;

    // Saring domain Deteksi Dini — disengaja, bukan error
    if (card.domain === DOMAIN_DETEKSI_DINI) {
      tersaringDeteksiDini++;
      continue;
    }

    // Domain tidak dikenal
    if (!DOMAIN_PANDUAN_RESMI.has(card.domain)) {
      temuan.push(blokir(KODE.DOMAIN_TIDAK_DIKENAL,
        `Kartu "${card.id}" punya domain tidak dikenal: "${card.domain}".`,
        { lokasi },
      ));
      continue;
    }

    // Judul kosong
    if (!card.title || !card.title.trim()) {
      temuan.push(blokir(KODE.JUDUL_KOSONG, `Judul kartu ${card.id} kosong.`, { lokasi }));
      continue;
    }

    // Kata terlarang
    if (POLA_KATA_TERLARANG.test(card.title)) {
      temuan.push(blokir(KODE.KATA_TERLARANG,
        `Kata terlarang di judul kartu: "${card.title}"`, { lokasi }));
    }

    // Pemetaan ageKey → sub-tahap
    const subTahapId = AGE_KEY_TO_SUBTAHAP[card.ageKey];
    if (!subTahapId) {
      temuan.push(blokir(KODE.DOMAIN_TIDAK_DIKENAL,
        `Kartu "${card.id}" punya ageKey tidak dikenal: "${card.ageKey}".`,
        { lokasi, saran: 'Periksa AGE_KEY_TO_SUBTAHAP di panduanAdapter.ts.' },
      ));
      continue;
    }

    // Panduan terikat domain, bukan nilai Akar Keluarga — LS_TANPA_NILAI tidak dipicu di sini.

    // Hitung durasi baca dari teks yang tersedia di kartu
    const teksSummary = card.summary
      ? [
          card.title,
          card.summary.terjadi,
          card.summary.penting,
          ...card.summary.lakukan,
          card.summary.perhatian,
        ].join(' ')
      : card.title;
    const durasiMenit = hitungWaktuBaca(teksSummary);

    // ID duplikat
    const id = `kc-${card.id}`;
    if (idSet.has(id)) {
      temuan.push(blokir(KODE.ID_DUPLIKAT, `Id panduan duplikat: ${id}`, { lokasi }));
      continue;
    }
    idSet.add(id);

    const item: ItemBekal = {
      id,
      judul: card.title,
      tipe: 'panduan',
      domain: card.domain as DomainCode,
      nilai: [],
      perkiraanDurasiMenit: durasiMenit,
      pemilik: 'orangtua',
      sumberId: card.id,
    };
    items.push({ subTahapId, item });
  }

  // Laporkan ringkasan penyaringan DK — peringatan informatif, bukan blokir
  if (tersaringDeteksiDini > 0) {
    temuan.push(peringatan(
      KODE.PANDUAN_DETEKSI_DINI_DISARING,
      `${tersaringDeteksiDini} kartu domain "Deteksi Dini & Kebutuhan Khusus" sengaja tidak dijadwalkan.`,
      { saran: 'Kartu ini tetap dapat diakses lewat Panduan Tumbuh Kembang kapan pun.' },
    ));
  }

  return { items, panduanTersaringDeteksiDini: tersaringDeteksiDini, temuan };
}
