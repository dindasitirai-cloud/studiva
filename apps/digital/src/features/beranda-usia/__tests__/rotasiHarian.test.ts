import { benihDariTeks, pembangkitAcak, kocok } from '../adapter/acakDeterministik';
import { pilihKegiatanHarian } from '../rotasiHarian';
import type { KonteksRotasi } from '../rotasiHarian';
import type { ItemBekal } from '../bekal';
import type { NilaiAkar } from '../../akar-keluarga/content';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buatItem(
  id: string,
  domain: ItemBekal['domain'] = 'mk',
  nilai: NilaiAkar[] = [],
  pemilik: ItemBekal['pemilik'] = 'anak',
): ItemBekal {
  return { id, judul: `Kegiatan ${id}`, tipe: 'aktivitas', domain, nilai, pemilik, sumberId: id };
}

function konteks(overrides: Partial<KonteksRotasi> & Pick<KonteksRotasi, 'tanggal'>): KonteksRotasi {
  return {
    idAnak: 'anak-test',
    kolam: [],
    nilaiFokus: [],
    maksItem: 4,
    ...overrides,
  };
}

// Kolam standar: 24 item anak, domain seragam 'mk', tanpa nilai
const KOLAM_24 = Array.from({ length: 24 }, (_, i) => buatItem(`item-${i}`));
// Patokan: 1 Januari 2020 (indeksHari = 0)
const TGL_0 = new Date(2020, 0, 1);

function tglHari(d: number): Date {
  return new Date(2020, 0, 1 + d);
}

// ─── benihDariTeks ────────────────────────────────────────────────────────────

describe('benihDariTeks', () => {
  it('teks sama → benih sama', () => {
    expect(benihDariTeks('halo')).toBe(benihDariTeks('halo'));
  });

  it('teks berbeda → benih (sangat mungkin) berbeda', () => {
    expect(benihDariTeks('abc')).not.toBe(benihDariTeks('xyz'));
  });

  it('teks kosong menghasilkan angka (bukan NaN atau undefined)', () => {
    const b = benihDariTeks('');
    expect(typeof b).toBe('number');
    expect(Number.isNaN(b)).toBe(false);
  });

  it('hasil selalu dalam rentang uint32 [0, 2^32 - 1]', () => {
    const kasus = ['a', 'ab', 'abc', 'anak-01', 'anak-01:0', 'anak-01:99'];
    for (const t of kasus) {
      const b = benihDariTeks(t);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(4294967295);
    }
  });

  it('suffix angka menghasilkan benih berbeda', () => {
    const b0 = benihDariTeks('anak:0');
    const b1 = benihDariTeks('anak:1');
    expect(b0).not.toBe(b1);
  });
});

// ─── pembangkitAcak ───────────────────────────────────────────────────────────

describe('pembangkitAcak', () => {
  it('menghasilkan nilai [0, 1)', () => {
    const acak = pembangkitAcak(42);
    for (let i = 0; i < 100; i++) {
      const v = acak();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('urutan dapat direproduksi dengan benih yang sama', () => {
    const a1 = pembangkitAcak(12345);
    const a2 = pembangkitAcak(12345);
    const urutan1 = Array.from({ length: 10 }, () => a1());
    const urutan2 = Array.from({ length: 10 }, () => a2());
    expect(urutan1).toEqual(urutan2);
  });

  it('benih berbeda menghasilkan urutan berbeda', () => {
    const urutan1 = Array.from({ length: 5 }, pembangkitAcak(1));
    const urutan2 = Array.from({ length: 5 }, pembangkitAcak(2));
    expect(urutan1).not.toEqual(urutan2);
  });
});

// ─── kocok ────────────────────────────────────────────────────────────────────

describe('kocok', () => {
  const DAFTAR = [1, 2, 3, 4, 5, 6, 7, 8];

  it('hasil adalah permutasi dari input (semua elemen ada, tidak ada duplikat)', () => {
    const hasil = kocok(DAFTAR, benihDariTeks('uji'));
    expect(hasil.sort((a, b) => a - b)).toEqual([...DAFTAR].sort((a, b) => a - b));
  });

  it('benih sama → urutan sama', () => {
    const b = benihDariTeks('sama');
    expect(kocok(DAFTAR, b)).toEqual(kocok(DAFTAR, b));
  });

  it('benih berbeda → urutan berbeda', () => {
    const h1 = kocok(DAFTAR, benihDariTeks('A'));
    const h2 = kocok(DAFTAR, benihDariTeks('B'));
    expect(h1).not.toEqual(h2);
  });

  it('tidak mengubah array asal', () => {
    const asli = [10, 20, 30, 40];
    kocok(asli, 99);
    expect(asli).toEqual([10, 20, 30, 40]);
  });

  it('array kosong menghasilkan array kosong', () => {
    expect(kocok([], 42)).toEqual([]);
  });

  it('array satu elemen dikembalikan apa adanya', () => {
    expect(kocok(['x'], 1)).toEqual(['x']);
  });
});

// ─── pilihKegiatanHarian — keadaan tepi ───────────────────────────────────────

describe('pilihKegiatanHarian — keadaan tepi', () => {
  it('kolam kosong → pilihan kosong, catatan KOLAM_KOSONG', () => {
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: [] }));
    expect(hasil.pilihan).toHaveLength(0);
    expect(hasil.catatan[0].kode).toBe('KOLAM_KOSONG');
  });

  it('semua item pemilik orangtua → pilihan kosong, catatan KOLAM_KOSONG', () => {
    const kolamOrangTua = KOLAM_24.map(i => buatItem(i.id, 'mk', [], 'orangtua'));
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: kolamOrangTua }));
    expect(hasil.pilihan).toHaveLength(0);
    expect(hasil.catatan[0].kode).toBe('KOLAM_KOSONG');
  });

  it('maksItem = 0 → pilihan kosong, catatan KOLAM_LEBIH_KECIL_DARI_PLAFON', () => {
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: KOLAM_24, maksItem: 0 }));
    expect(hasil.pilihan).toHaveLength(0);
    expect(hasil.catatan[0].kode).toBe('KOLAM_LEBIH_KECIL_DARI_PLAFON');
  });

  it('jumlah item == maksItem → seluruh kolam, catatan KOLAM_LEBIH_KECIL_DARI_PLAFON', () => {
    const kolam4 = KOLAM_24.slice(0, 4);
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: kolam4, maksItem: 4 }));
    expect(hasil.pilihan).toHaveLength(4);
    expect(hasil.catatan.some(c => c.kode === 'KOLAM_LEBIH_KECIL_DARI_PLAFON')).toBe(true);
  });

  it('jumlah item < maksItem → seluruh kolam, catatan KOLAM_LEBIH_KECIL_DARI_PLAFON', () => {
    const kolam3 = KOLAM_24.slice(0, 3);
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: kolam3, maksItem: 4 }));
    expect(hasil.pilihan).toHaveLength(3);
    expect(hasil.catatan.some(c => c.kode === 'KOLAM_LEBIH_KECIL_DARI_PLAFON')).toBe(true);
  });

  it('tidak pernah melempar exception, termasuk tanggal sebelum patokan', () => {
    const tglLama = new Date(2015, 3, 7);
    expect(() => pilihKegiatanHarian(konteks({ tanggal: tglLama, kolam: KOLAM_24 }))).not.toThrow();
  });

  it('tidak pernah melempar exception pada input minimal', () => {
    expect(() => pilihKegiatanHarian(konteks({ tanggal: new Date(2020, 0, 1), kolam: [], maksItem: 0 }))).not.toThrow();
  });
});

// ─── pilihKegiatanHarian — pemilik ────────────────────────────────────────────

describe('pilihKegiatanHarian — pemilik', () => {
  it('item pemilik orangtua tidak pernah muncul dalam pilihan', () => {
    const campuran = [
      ...KOLAM_24.slice(0, 12),
      ...KOLAM_24.slice(12).map(i => buatItem(i.id + '-ot', 'mk', [], 'orangtua')),
    ];
    for (let d = 0; d < 6; d++) {
      const hasil = pilihKegiatanHarian(konteks({ tanggal: tglHari(d), kolam: campuran }));
      const adaOrangTua = hasil.pilihan.some(i => i.pemilik === 'orangtua');
      expect(adaOrangTua).toBe(false);
    }
  });
});

// ─── pilihKegiatanHarian — siklus penuh ──────────────────────────────────────

describe('pilihKegiatanHarian — siklus penuh', () => {
  it('kolam 24 item, maksItem 4: setiap item muncul tepat sekali dalam 6 hari', () => {
    const hitungan = new Map<string, number>();
    for (let d = 0; d < 6; d++) {
      const hasil = pilihKegiatanHarian(konteks({ tanggal: tglHari(d), kolam: KOLAM_24, idAnak: 'siklus-penuh' }));
      expect(hasil.pilihan).toHaveLength(4);
      for (const item of hasil.pilihan) {
        hitungan.set(item.id, (hitungan.get(item.id) ?? 0) + 1);
      }
    }
    expect(hitungan.size).toBe(24);
    for (const [, c] of hitungan) expect(c).toBe(1);
  });

  it('kolam 11 item, maksItem 2: siklus 6 hari, setiap item tepat sekali, hari terakhir 1 item', () => {
    const kolam11 = Array.from({ length: 11 }, (_, i) => buatItem(`j${i}`));
    const hitungan = new Map<string, number>();
    for (let d = 0; d < 6; d++) {
      const hasil = pilihKegiatanHarian(konteks({ tanggal: tglHari(d), kolam: kolam11, idAnak: 'siklus-11', maksItem: 2 }));
      for (const item of hasil.pilihan) {
        hitungan.set(item.id, (hitungan.get(item.id) ?? 0) + 1);
      }
    }
    expect(hitungan.size).toBe(11);
    for (const [, c] of hitungan) expect(c).toBe(1);

    // Hari terakhir siklus (indeks 5 = posisi 5 % 6) → ceil(11/2)=6, hari ke-5 = sisa 1 item
    const hariKeenam = pilihKegiatanHarian(konteks({ tanggal: tglHari(5), kolam: kolam11, idAnak: 'siklus-11', maksItem: 2 }));
    expect(hariKeenam.pilihan).toHaveLength(1);
  });

  it('metadata: panjangSiklus dan posisiDalamSiklus konsisten', () => {
    for (let d = 0; d < 6; d++) {
      const hasil = pilihKegiatanHarian(konteks({ tanggal: tglHari(d), kolam: KOLAM_24, idAnak: 'meta' }));
      expect(hasil.panjangSiklus).toBe(6);
      expect(hasil.posisiDalamSiklus).toBe(d); // hari d = posisi d dalam siklus 0
      expect(hasil.siklusKe).toBe(0);
    }
  });
});

// ─── pilihKegiatanHarian — determinisme ──────────────────────────────────────

describe('pilihKegiatanHarian — determinisme', () => {
  it('panggilan berulang dengan input sama menghasilkan pilihan sama', () => {
    const k = konteks({ tanggal: new Date(2024, 5, 15), kolam: KOLAM_24, idAnak: 'deterministik' });
    const ids1 = pilihKegiatanHarian(k).pilihan.map(i => i.id);
    const ids2 = pilihKegiatanHarian(k).pilihan.map(i => i.id);
    const ids3 = pilihKegiatanHarian(k).pilihan.map(i => i.id);
    expect(ids1).toEqual(ids2);
    expect(ids1).toEqual(ids3);
  });

  it('jam berbeda pada tanggal yang sama → pilihan sama', () => {
    const idAnak = 'stabil-hari';
    const kolam = KOLAM_24;
    const t1 = new Date(2024, 8, 10, 0, 1);
    const t2 = new Date(2024, 8, 10, 12, 0);
    const t3 = new Date(2024, 8, 10, 23, 59);
    const ids1 = pilihKegiatanHarian(konteks({ tanggal: t1, kolam, idAnak })).pilihan.map(i => i.id);
    const ids2 = pilihKegiatanHarian(konteks({ tanggal: t2, kolam, idAnak })).pilihan.map(i => i.id);
    const ids3 = pilihKegiatanHarian(konteks({ tanggal: t3, kolam, idAnak })).pilihan.map(i => i.id);
    expect(ids1).toEqual(ids2);
    expect(ids1).toEqual(ids3);
  });

  it('hari berbeda → pilihan berbeda (tidak ada irisan dalam siklus yang sama)', () => {
    const hari1 = pilihKegiatanHarian(konteks({ tanggal: tglHari(0), kolam: KOLAM_24, idAnak: 'ganti-hari' }));
    const hari2 = pilihKegiatanHarian(konteks({ tanggal: tglHari(1), kolam: KOLAM_24, idAnak: 'ganti-hari' }));
    const ids1 = new Set(hari1.pilihan.map(i => i.id));
    expect(hari2.pilihan.every(i => !ids1.has(i.id))).toBe(true);
  });

  it('anak berbeda, tanggal sama → pilihan berbeda', () => {
    const tgl = new Date(2024, 3, 22);
    const kolam = KOLAM_24;
    const idsA = pilihKegiatanHarian(konteks({ tanggal: tgl, kolam, idAnak: 'anak-Alpha' })).pilihan.map(i => i.id);
    const idsB = pilihKegiatanHarian(konteks({ tanggal: tgl, kolam, idAnak: 'anak-Beta' })).pilihan.map(i => i.id);
    expect(idsA).not.toEqual(idsB);
  });
});

// ─── pilihKegiatanHarian — batas siklus (Aturan 3) ──────────────────────────

describe('pilihKegiatanHarian — batas siklus (Aturan 3)', () => {
  it('hari pertama siklus baru tidak beririsan dengan hari terakhir siklus sebelumnya', () => {
    // kolam 20, maksItem 4 → panjangSiklus = 5 (hari 0-4, 5-9, 10-14, …)
    const kolam20 = Array.from({ length: 20 }, (_, i) => buatItem(`y${i}`));
    const idAnak = 'batas-siklus';

    for (let s = 0; s < 3; s++) {
      // Hari terakhir siklus s = indeks s*5 + 4
      const hariTerakhir = tglHari(s * 5 + 4);
      // Hari pertama siklus s+1 = indeks (s+1)*5
      const hariPertamaBaru = tglHari((s + 1) * 5);

      const hasilAkhir = pilihKegiatanHarian(konteks({ tanggal: hariTerakhir, kolam: kolam20, idAnak, maksItem: 4 }));
      const hasilMulai = pilihKegiatanHarian(konteks({ tanggal: hariPertamaBaru, kolam: kolam20, idAnak, maksItem: 4 }));

      const idsAkhir = new Set(hasilAkhir.pilihan.map(i => i.id));
      const irisan = hasilMulai.pilihan.filter(i => idsAkhir.has(i.id));
      expect(irisan).toHaveLength(0);
    }
  });

  it('siklus 0 (hari 0-5) tidak melalui Aturan 3 — tidak ada error', () => {
    for (let d = 0; d < 6; d++) {
      expect(() => pilihKegiatanHarian(konteks({ tanggal: tglHari(d), kolam: KOLAM_24 }))).not.toThrow();
    }
  });
});

// ─── pilihKegiatanHarian — Aturan 1 (nilai fokus) ───────────────────────────

describe('pilihKegiatanHarian — Aturan 1 (nilai fokus)', () => {
  it('nilaiFokus kosong → catatan TANPA_NILAI_DIPILIH', () => {
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: KOLAM_24, nilaiFokus: [] }));
    expect(hasil.catatan.some(c => c.kode === 'TANPA_NILAI_DIPILIH')).toBe(true);
  });

  it('nilaiFokus terisi tapi tidak ada item cocok → catatan TIDAK_ADA_YANG_COCOK_NILAI_FOKUS', () => {
    const hasilRotasi = pilihKegiatanHarian(konteks({
      tanggal: TGL_0,
      kolam: KOLAM_24, // semua nilai: []
      nilaiFokus: ['Kasih Sayang'],
    }));
    expect(hasilRotasi.catatan.some(c => c.kode === 'TIDAK_ADA_YANG_COCOK_NILAI_FOKUS')).toBe(true);
  });

  it('bila kolam memungkinkan: setiap hari punya minimal satu item dengan nilai fokus', () => {
    const nilaiFokus: NilaiAkar[] = ['Kasih Sayang'];
    // 12 item, 3 dengan nilai 'Kasih Sayang', 9 tanpa nilai → panjangSiklus = 3
    const kolamBernilai = [
      buatItem('v0', 'mk', ['Kasih Sayang']),
      buatItem('v1', 'mk', ['Kasih Sayang']),
      buatItem('v2', 'mk', ['Kasih Sayang']),
      ...Array.from({ length: 9 }, (_, i) => buatItem(`n${i}`, 'mk')),
    ];

    for (let d = 0; d < 3; d++) {
      const hasil = pilihKegiatanHarian(konteks({
        tanggal: tglHari(d),
        kolam: kolamBernilai,
        idAnak: 'aturan1-test',
        nilaiFokus,
        maksItem: 4,
      }));
      const adaCocok = hasil.pilihan.some(i => i.nilai.includes('Kasih Sayang'));
      expect(adaCocok).toBe(true);
    }
  });
});

// ─── pilihKegiatanHarian — Aturan 2 (domain) ─────────────────────────────────

describe('pilihKegiatanHarian — Aturan 2 (keragaman domain)', () => {
  it('kolam satu domain → catatan DOMAIN_SERAGAM_TAK_TERHINDARKAN', () => {
    const hasil = pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: KOLAM_24 }));
    expect(hasil.catatan.some(c => c.kode === 'DOMAIN_SERAGAM_TAK_TERHINDARKAN')).toBe(true);
  });

  it('kolam multi-domain, maksItem >= 2: setiap hari punya lebih dari satu domain (siklus 0)', () => {
    // 12 item: 6 'mk' + 6 'bhs', panjangSiklus = 3
    const kolamMulti = [
      ...Array.from({ length: 6 }, (_, i) => buatItem(`mk${i}`, 'mk')),
      ...Array.from({ length: 6 }, (_, i) => buatItem(`bhs${i}`, 'bhs')),
    ];

    for (let d = 0; d < 3; d++) {
      const hasil = pilihKegiatanHarian(konteks({
        tanggal: tglHari(d),
        kolam: kolamMulti,
        idAnak: 'aturan2-test',
        maksItem: 4,
      }));
      const domains = new Set(hasil.pilihan.map(i => String(i.domain)));
      expect(domains.size).toBeGreaterThan(1);
    }
  });

  it('maksItem = 1 → domain keragaman tidak berlaku (tidak ada pasangan)', () => {
    const kolamMulti = [
      buatItem('a', 'mk'),
      buatItem('b', 'bhs'),
      buatItem('c', 'kog'),
    ];
    expect(() =>
      pilihKegiatanHarian(konteks({ tanggal: TGL_0, kolam: kolamMulti, maksItem: 1 }))
    ).not.toThrow();
  });
});

// ─── pilihKegiatanHarian — tahun kabisat & pergantian tahun ──────────────────

describe('pilihKegiatanHarian — kalender', () => {
  it('indeksHari konsisten di tahun kabisat 2024: Feb 28, Feb 29, Mar 1 berurutan', () => {
    const k = { kolam: KOLAM_24, idAnak: 'kabisat', nilaiFokus: [] as NilaiAkar[], maksItem: 4 };
    const feb28 = pilihKegiatanHarian({ ...k, tanggal: new Date(2024, 1, 28) });
    const feb29 = pilihKegiatanHarian({ ...k, tanggal: new Date(2024, 1, 29) });
    const mar1  = pilihKegiatanHarian({ ...k, tanggal: new Date(2024, 2, 1) });
    expect(feb29.indeksHari).toBe(feb28.indeksHari + 1);
    expect(mar1.indeksHari).toBe(feb29.indeksHari + 1);
  });

  it('indeksHari konsisten di pergantian tahun: Des 31 → Jan 1', () => {
    const k = { kolam: KOLAM_24, idAnak: 'tahunbaru', nilaiFokus: [] as NilaiAkar[], maksItem: 4 };
    const des31 = pilihKegiatanHarian({ ...k, tanggal: new Date(2023, 11, 31) });
    const jan1  = pilihKegiatanHarian({ ...k, tanggal: new Date(2024, 0, 1) });
    expect(jan1.indeksHari).toBe(des31.indeksHari + 1);
  });

  it('tanggal sebelum patokan menghasilkan indeksHari negatif yang valid', () => {
    const des31 = pilihKegiatanHarian(konteks({ tanggal: new Date(2019, 11, 31), kolam: KOLAM_24 }));
    expect(des31.indeksHari).toBe(-1);
  });
});
