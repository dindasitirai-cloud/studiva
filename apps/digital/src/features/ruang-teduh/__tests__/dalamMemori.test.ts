import { CatatanHarianDalamMemori } from '../penyimpanan/dalamMemori';

// Tanggal tetap — jangan pakai new Date() di dalam test
const TGL_A = '2026-07-01';
const TGL_B = '2026-07-02';
const TGL_C = '2026-07-15';
const ID_A  = 'caregiver-alpha';
const ID_B  = 'caregiver-beta';

function buatRepo() {
  return new CatatanHarianDalamMemori();
}

// ─── simpanDiff: penggabungan ─────────────────────────────────────────────────

describe('simpanDiff: dua kali pada tanggal sama menggabungkan, bukan menimpa', () => {
  it('field yang tidak ada di diff kedua dipertahankan dari diff pertama', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, gelasAir: 5 });

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].cuacaHati).toBe('cerah');   // dipertahankan
    expect(hasil[0].gelasAir).toBe(5);           // ditambahkan
  });

  it('field yang ada di diff kedua menimpa nilai lama', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'mendung' });
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil[0].cuacaHati).toBe('cerah');
  });
});

describe('simpanDiff: field undefined tidak menghapus nilai lama', () => {
  it('simpan dengan cuacaHati undefined tidak menghapus cuacaHati sebelumnya', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'hujan' });

    // Kirim diff tanpa cuacaHati (undefined secara implisit)
    const diffTanpaCuaca: { tanggal: string; gelasAir: number } = {
      tanggal: TGL_A,
      gelasAir: 3,
    };
    await repo.simpanDiff(ID_A, diffTanpaCuaca as Parameters<typeof repo.simpanDiff>[1]);

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil[0].cuacaHati).toBe('hujan'); // tidak hilang
    expect(hasil[0].gelasAir).toBe(3);
  });

  it('simpan kondisiNifas undefined tidak menghapus kondisiNifas sebelumnya', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, kondisiNifas: ['demam', 'kejang'] });
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, gelasAir: 7 });

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil[0].kondisiNifas).toEqual(['demam', 'kejang']);
    expect(hasil[0].gelasAir).toBe(7);
  });
});

describe('simpanDiff: array kosong benar benar mengosongkan kondisiNifas', () => {
  it('kondisiNifas: [] menimpa isi sebelumnya dengan array kosong', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, kondisiNifas: ['demam', 'kejang'] });
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, kondisiNifas: [] });

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil[0].kondisiNifas).toEqual([]);
  });
});

// ─── ambilRentang ─────────────────────────────────────────────────────────────

describe('ambilRentang: urutan naik dan tidak ada entri kosong', () => {
  it('mengembalikan hasil terurut naik menurut tanggal', async () => {
    const repo = buatRepo();
    // Simpan dalam urutan terbalik
    await repo.simpanDiff(ID_A, { tanggal: TGL_C, cuacaHati: 'badai' });
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });
    await repo.simpanDiff(ID_A, { tanggal: TGL_B, cuacaHati: 'berawan' });

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_C);
    expect(hasil.map(c => c.tanggal)).toEqual([TGL_A, TGL_B, TGL_C]);
  });

  it('tidak memuat entri kosong untuk hari tanpa catatan dalam rentang', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });
    await repo.simpanDiff(ID_A, { tanggal: TGL_C, cuacaHati: 'badai' });

    // Rentang mencakup TGL_A sampai TGL_C; TGL_B ada di antaranya tapi tidak ada catatannya
    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_C);
    expect(hasil).toHaveLength(2);
    expect(hasil.some(c => c.tanggal === TGL_B)).toBe(false);
  });

  it('mengembalikan array kosong jika tidak ada catatan sama sekali', async () => {
    const repo = buatRepo();
    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_C);
    expect(hasil).toEqual([]);
  });
});

// ─── hapusSemua ───────────────────────────────────────────────────────────────

describe('hapusSemua', () => {
  it('mengosongkan data satu caregiver', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });
    await repo.hapusSemua(ID_A);

    const hasil = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    expect(hasil).toEqual([]);
  });

  it('tidak menyentuh data caregiver lain', async () => {
    const repo = buatRepo();
    await repo.simpanDiff(ID_A, { tanggal: TGL_A, cuacaHati: 'cerah' });
    await repo.simpanDiff(ID_B, { tanggal: TGL_A, cuacaHati: 'hujan' });

    await repo.hapusSemua(ID_A);

    const hasilA = await repo.ambilRentang(ID_A, TGL_A, TGL_A);
    const hasilB = await repo.ambilRentang(ID_B, TGL_A, TGL_A);
    expect(hasilA).toEqual([]);
    expect(hasilB).toHaveLength(1);
    expect(hasilB[0].cuacaHati).toBe('hujan');
  });

  it('hapusSemua pada caregiver tanpa data tidak melempar error', async () => {
    const repo = buatRepo();
    await expect(repo.hapusSemua(ID_A)).resolves.toBeUndefined();
  });
});
