import { nilaiDirawatHariIni } from '../nilaiDirawat';

// ─── Tes ──────────────────────────────────────────────────────────────────────

describe('nilaiDirawatHariIni', () => {
  test('semua argumen kosong menghasilkan array kosong', () => {
    expect(nilaiDirawatHariIni([], [])).toEqual([]);
  });

  test('hanya sikap berisi', () => {
    expect(nilaiDirawatHariIni(['Syukur', 'Empati'], [])).toEqual(['Syukur', 'Empati']);
  });

  test('hanya kegiatan berisi', () => {
    expect(nilaiDirawatHariIni([], ['Kasih Sayang', 'Kejujuran'])).toEqual(['Kasih Sayang', 'Kejujuran']);
  });

  test('nilai dari keduanya digabung', () => {
    const hasil = nilaiDirawatHariIni(['Sabar'], ['Empati']);
    expect(hasil).toContain('Sabar');
    expect(hasil).toContain('Empati');
    expect(hasil).toHaveLength(2);
  });

  test('deduplikasi: nilai yang ada di sikap DAN kegiatan hanya muncul sekali', () => {
    const hasil = nilaiDirawatHariIni(['Kejujuran'], ['Kejujuran', 'Syukur']);
    expect(hasil.filter(n => n === 'Kejujuran')).toHaveLength(1);
    expect(hasil).toContain('Syukur');
    expect(hasil).toHaveLength(2);
  });

  test('urutan: sikap lebih dulu, kemudian kegiatan baru', () => {
    const hasil = nilaiDirawatHariIni(['Syukur'], ['Keberanian']);
    expect(hasil[0]).toBe('Syukur');
    expect(hasil[1]).toBe('Keberanian');
  });

  test('nilai di luar keduanya tidak muncul di hasil', () => {
    const hasil = nilaiDirawatHariIni(['Kejujuran'], ['Syukur']);
    expect(hasil).not.toContain('Empati');
    expect(hasil).not.toContain('Sabar');
  });
});
