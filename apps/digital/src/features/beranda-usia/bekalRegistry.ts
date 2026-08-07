import type { Bekal, BekalId, SubTahap, SubTahapId } from './bekal';

// Sub-tahap IDs memakai id asli dari AGE_RANGES di learningStrategies.ts.
// Jangan ganti id-id ini — Irama Hari dan Learning Strategies bergantung padanya.

const ST_B03: SubTahap = {
  id: 'b03',
  label: '0–3 bln',
  usiaBulanMulai: 0,
  usiaBulanSelesai: 3,
  maksItemPerHari: 2,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_B36: SubTahap = {
  id: 'b36',
  label: '3–6 bln',
  usiaBulanMulai: 3,
  usiaBulanSelesai: 6,
  maksItemPerHari: 2,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_B69: SubTahap = {
  id: 'b69',
  label: '6–9 bln',
  usiaBulanMulai: 6,
  usiaBulanSelesai: 9,
  maksItemPerHari: 2,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_B912: SubTahap = {
  id: 'b912',
  label: '9–12 bln',
  usiaBulanMulai: 9,
  usiaBulanSelesai: 12,
  maksItemPerHari: 3,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_T1218: SubTahap = {
  id: 't1218',
  label: '12–18 bln',
  usiaBulanMulai: 12,
  usiaBulanSelesai: 18,
  maksItemPerHari: 3,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_T1824: SubTahap = {
  id: 't1824',
  label: '18–24 bln',
  usiaBulanMulai: 18,
  usiaBulanSelesai: 24,
  maksItemPerHari: 3,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_U23: SubTahap = {
  id: 'u23',
  label: '2–3 thn',
  usiaBulanMulai: 24,
  usiaBulanSelesai: 36,
  maksItemPerHari: 4,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_U34: SubTahap = {
  id: 'u34',
  label: '3–4 thn',
  usiaBulanMulai: 36,
  usiaBulanSelesai: 48,
  maksItemPerHari: 4,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_U45: SubTahap = {
  id: 'u45',
  label: '4–5 thn',
  usiaBulanMulai: 48,
  usiaBulanSelesai: 60,
  maksItemPerHari: 5,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

const ST_U56: SubTahap = {
  id: 'u56',
  label: '5–6 thn',
  usiaBulanMulai: 60,
  usiaBulanSelesai: 72,
  maksItemPerHari: 5,
  // TODO: sambungkan ke dataset Learning Strategies
  kegiatan: [],
  // TODO: sambungkan ke dataset Learning Strategies
  panduan: [],
};

export const DAFTAR_BEKAL: readonly Bekal[] = [
  {
    id: '0-1',
    label: 'Bekal 0–1 tahun',
    usiaBulanMulai: 0,
    usiaBulanSelesai: 12,
    subTahap: [ST_B03, ST_B36, ST_B69, ST_B912],
    aktif: true,  // TahunPertama component sudah ada di codebase
  },
  {
    id: '1-2',
    label: 'Bekal 1–2 tahun',
    usiaBulanMulai: 12,
    usiaBulanSelesai: 24,
    subTahap: [ST_T1218, ST_T1824],
    aktif: false,
  },
  {
    id: '2-3',
    label: 'Bekal 2–3 tahun',
    usiaBulanMulai: 24,
    usiaBulanSelesai: 36,
    subTahap: [ST_U23],
    aktif: false,
  },
  {
    id: '3-4',
    label: 'Bekal 3–4 tahun',
    usiaBulanMulai: 36,
    usiaBulanSelesai: 48,
    subTahap: [ST_U34],
    aktif: false,
  },
  {
    id: '4-5',
    label: 'Bekal 4–5 tahun',
    usiaBulanMulai: 48,
    usiaBulanSelesai: 60,
    subTahap: [ST_U45],
    aktif: false,
  },
  {
    id: '5-6',
    label: 'Bekal 5–6 tahun',
    usiaBulanMulai: 60,
    usiaBulanSelesai: 72,
    subTahap: [ST_U56],
    aktif: false,
  },
];

export function cariBekal(id: BekalId): Bekal | undefined {
  return DAFTAR_BEKAL.find(b => b.id === id);
}

export function cariSubTahap(id: SubTahapId): { bekal: Bekal; subTahap: SubTahap } | undefined {
  for (const bekal of DAFTAR_BEKAL) {
    const subTahap = bekal.subTahap.find(st => st.id === id);
    if (subTahap !== undefined) return { bekal, subTahap };
  }
  return undefined;
}
