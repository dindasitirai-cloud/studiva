import { faseDariUsiaBulan, resolveSikap, adaptSikap } from '../adapter/sikapAdapter';
import type { ItemSikap } from '../adapter/sikapAdapter';
import { adaptKegiatan } from '../adapter/kegiatanAdapter';
import { adaptPanduan } from '../adapter/panduanAdapter';
import { rakitBekal } from '../adapter/rakitBekal';
import { hitungWaktuBaca } from '../adapter/waktuBaca';

// ─── faseDariUsiaBulan ────────────────────────────────────────────────────────

describe('faseDariUsiaBulan', () => {
  it('fase 1 pada batas bawah (0)', () => expect(faseDariUsiaBulan(0)).toBe(1));
  it('fase 1 pada batas atas (11)', () => expect(faseDariUsiaBulan(11)).toBe(1));
  it('fase 2 pada batas bawah (12)', () => expect(faseDariUsiaBulan(12)).toBe(2));
  it('fase 2 pada batas atas (23)', () => expect(faseDariUsiaBulan(23)).toBe(2));
  it('fase 3 pada batas bawah (24)', () => expect(faseDariUsiaBulan(24)).toBe(3));
  it('fase 3 pada batas atas (35)', () => expect(faseDariUsiaBulan(35)).toBe(3));
  it('fase 4 pada batas bawah (36)', () => expect(faseDariUsiaBulan(36)).toBe(4));
  it('fase 4 pada batas atas (47)', () => expect(faseDariUsiaBulan(47)).toBe(4));
  it('fase 5 pada batas bawah (48)', () => expect(faseDariUsiaBulan(48)).toBe(5));
  it('fase 5 pada batas atas (71)', () => expect(faseDariUsiaBulan(71)).toBe(5));
  it('null di luar rentang atas (72)', () => expect(faseDariUsiaBulan(72)).toBeNull());
  it('null di luar rentang bawah (-1)', () => expect(faseDariUsiaBulan(-1)).toBeNull());
});

// ─── resolveSikap ─────────────────────────────────────────────────────────────

describe('resolveSikap', () => {
  const contohKatalog: ItemSikap[] = [
    { id: 'sk-01', judul: 'Sikap A', nilai: ['Kasih Sayang', 'Sabar'], faseMulai: 1, faseSelesai: 2, sumberId: 'src-1' },
    { id: 'sk-02', judul: 'Sikap B', nilai: ['Empati'], faseMulai: 3, faseSelesai: 4, sumberId: 'src-2' },
    { id: 'sk-03', judul: 'Sikap C', nilai: ['Kemandirian'], faseMulai: 2, faseSelesai: 5, sumberId: 'src-3' },
  ];

  it('mengembalikan sikap yang relevan untuk usia 6 bulan (fase 1)', () => {
    const hasil = resolveSikap(6, ['Kasih Sayang'], contohKatalog);
    expect(hasil.map(s => s.id)).toContain('sk-01');
    expect(hasil.map(s => s.id)).not.toContain('sk-02');
  });

  it('mengembalikan array kosong tanpa melempar bila tidak ada kecocokan', () => {
    expect(() => resolveSikap(6, ['Kejujuran'], [])).not.toThrow();
    expect(resolveSikap(6, ['Kejujuran'], [])).toEqual([]);
  });

  it('mengembalikan array kosong bila usia di luar semua fase', () => {
    expect(resolveSikap(80, ['Kasih Sayang'], contohKatalog)).toEqual([]);
  });

  it('mencakup sikap yang span beberapa fase sesuai usia', () => {
    const hasil = resolveSikap(12, ['Kemandirian'], contohKatalog);
    expect(hasil.map(s => s.id)).toContain('sk-03');
  });
});

// ─── adaptSikap ───────────────────────────────────────────────────────────────

describe('adaptSikap', () => {
  let hasil: ReturnType<typeof adaptSikap>;
  beforeAll(() => { hasil = adaptSikap(); });

  it('menghasilkan katalog dengan item', () => {
    expect(hasil.katalog.length).toBeGreaterThan(0);
  });

  it('setiap item punya id unik', () => {
    const ids = hasil.katalog.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('setiap item punya faseMulai <= faseSelesai dalam rentang 1-5', () => {
    for (const s of hasil.katalog) {
      expect(s.faseMulai).toBeGreaterThanOrEqual(1);
      expect(s.faseSelesai).toBeLessThanOrEqual(5);
      expect(s.faseMulai).toBeLessThanOrEqual(s.faseSelesai);
    }
  });

  it('tidak melempar bahkan bila sumber kosong', () => {
    expect(() => adaptSikap()).not.toThrow();
  });
});

// ─── adaptKegiatan ────────────────────────────────────────────────────────────

describe('adaptKegiatan', () => {
  let hasil: ReturnType<typeof adaptKegiatan>;
  beforeAll(() => { hasil = adaptKegiatan(); });

  it('menghasilkan item kegiatan dari Learning Strategies', () => {
    expect(hasil.items.length).toBeGreaterThan(0);
  });

  it('tidak melempar exception', () => {
    expect(() => adaptKegiatan()).not.toThrow();
  });

  it('semua item punya subTahapId yang tidak kosong', () => {
    for (const { subTahapId } of hasil.items) {
      expect(subTahapId.trim().length).toBeGreaterThan(0);
    }
  });

  it('menghasilkan laporan (temuan array) bahkan tanpa blokir kritis', () => {
    expect(Array.isArray(hasil.temuan)).toBe(true);
  });
});

// ─── adaptPanduan ─────────────────────────────────────────────────────────────

describe('adaptPanduan', () => {
  let hasil: ReturnType<typeof adaptPanduan>;
  beforeAll(() => { hasil = adaptPanduan(); });

  it('tidak melempar exception', () => {
    expect(() => adaptPanduan()).not.toThrow();
  });

  it('menyaring kartu domain DK', () => {
    expect(hasil.panduanTersaringDeteksiDini).toBeGreaterThan(0);
  });

  it('tidak ada item dengan domain DK dalam hasil', () => {
    for (const { item } of hasil.items) {
      expect(item.domain).not.toBe('DK');
    }
  });

  it('semua item punya tipe panduan dan pemilik orangtua', () => {
    for (const { item } of hasil.items) {
      expect(item.tipe).toBe('panduan');
      expect(item.pemilik).toBe('orangtua');
    }
  });
});

// ─── rakitBekal ───────────────────────────────────────────────────────────────

describe('rakitBekal', () => {
  let hasil: ReturnType<typeof rakitBekal>;
  beforeAll(() => { hasil = rakitBekal(); });

  it('tidak melempar exception', () => {
    expect(() => rakitBekal()).not.toThrow();
  });

  it('menghasilkan 6 Bekal', () => {
    expect(hasil.bekal.length).toBe(6);
  });

  it('setiap Bekal punya subTahap yang tidak kosong', () => {
    for (const b of hasil.bekal) {
      expect(b.subTahap.length).toBeGreaterThan(0);
    }
  });

  it('katalogSikap terpisah dari Bekal (tidak ada field sikap di Bekal)', () => {
    expect(Array.isArray(hasil.katalogSikap)).toBe(true);
    for (const b of hasil.bekal) {
      expect((b as Record<string, unknown>)['sikap']).toBeUndefined();
    }
  });

  it('laporan punya struktur ringkas yang valid', () => {
    const r = hasil.laporan.ringkas;
    expect(typeof r.totalSikap).toBe('number');
    expect(typeof r.totalKegiatan).toBe('number');
    expect(typeof r.totalPanduan).toBe('number');
    expect(r.selFaseNilaiTerisi + r.selFaseNilaiKosong).toBe(60);
    expect(r.selSubTahapNilaiTerisi + r.selSubTahapNilaiKosong).toBe(120);
    expect(typeof r.itemTanpaTemaNilai).toBe('number');
    expect(r.itemTanpaTemaNilai).toBeGreaterThan(0);
    expect(r.jumlahBlokir + r.jumlahPeringatan).toBe(hasil.laporan.temuan.length);
  });

  it('LS_TANPA_NILAI nol setelah penerapan tag nilai', () => {
    const lsTanpaNilai = hasil.laporan.temuan.filter(t => t.kode === 'LS_TANPA_NILAI');
    expect(lsTanpaNilai).toHaveLength(0);
  });

  it('seluruh temuan punya kode dan keparahan valid', () => {
    for (const t of hasil.laporan.temuan) {
      expect(['blokir', 'peringatan']).toContain(t.keparahan);
      expect(typeof t.kode).toBe('string');
      expect(t.kode.trim().length).toBeGreaterThan(0);
    }
  });

  it('tidak ada blokir DOMAIN_TIDAK_DIKENAL setelah domain diisi', () => {
    const blokirDomain = hasil.laporan.temuan.filter(
      t => t.kode === 'DOMAIN_TIDAK_DIKENAL' && t.keparahan === 'blokir',
    );
    expect(blokirDomain).toHaveLength(0);
  });

  it('unduhan pemilik orangtua tidak muncul sebagai PEMILIK_DIKERASKAN', () => {
    const dikeraskan = hasil.laporan.temuan.filter(t => t.kode === 'PEMILIK_DIKERASKAN');
    const pesanUntukOrangTua = dikeraskan.filter(t =>
      t.pesan.includes('Jadwal Stimulasi') ||
      t.pesan.includes('Bermain Bebas') ||
      t.pesan.includes('Rutinitas Tidur') ||
      t.pesan.includes('MPASI'),
    );
    expect(pesanUntukOrangTua).toHaveLength(0);
  });

  it('PERLU_TINJAUAN_MANUSIA tidak muncul (item Checklist dihapus)', () => {
    const tinjauan = hasil.laporan.temuan.filter(t => t.kode === 'PERLU_TINJAUAN_MANUSIA');
    expect(tinjauan).toHaveLength(0);
  });
});

// ─── hitungWaktuBaca ──────────────────────────────────────────────────────────

describe('hitungWaktuBaca', () => {
  it('teks kosong → 1 menit (minimum)', () => {
    expect(hitungWaktuBaca('')).toBe(1);
  });

  it('satu kata → 1 menit', () => {
    expect(hitungWaktuBaca('halo')).toBe(1);
  });

  it('tepat 200 kata → 1 menit', () => {
    const teks = Array(200).fill('kata').join(' ');
    expect(hitungWaktuBaca(teks)).toBe(1);
  });

  it('201 kata → 2 menit (bulatkan ke atas)', () => {
    const teks = Array(201).fill('kata').join(' ');
    expect(hitungWaktuBaca(teks)).toBe(2);
  });

  it('400 kata → 2 menit', () => {
    const teks = Array(400).fill('kata').join(' ');
    expect(hitungWaktuBaca(teks)).toBe(2);
  });

  it('401 kata → 3 menit', () => {
    const teks = Array(401).fill('kata').join(' ');
    expect(hitungWaktuBaca(teks)).toBe(3);
  });

  it('spasi berlebih tidak mempengaruhi hitungan', () => {
    expect(hitungWaktuBaca('  kata   lain  ')).toBe(1);
  });
});
