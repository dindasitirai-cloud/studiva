import { hitungMekar, TAHAP_MAKS } from '../mekar';
import type { StatusHari } from '../mekar';

// ─── hitungMekar ─────────────────────────────────────────────────────────────

describe('hitungMekar', () => {
  it('1. array kosong → 0', () => {
    expect(hitungMekar([])).toBe(0);
  });

  it('2. semua tanpa-kegiatan → tetap 0', () => {
    const r: StatusHari[] = Array(7).fill('tanpa-kegiatan');
    expect(hitungMekar(r)).toBe(0);
  });

  it('3. semua ada-kegiatan → dikap di TAHAP_MAKS', () => {
    const r: StatusHari[] = Array(14).fill('ada-kegiatan');
    expect(hitungMekar(r)).toBe(TAHAP_MAKS);
  });

  it('4. semua belum-lewat → 0 (tidak dihitung)', () => {
    const r: StatusHari[] = Array(7).fill('belum-lewat');
    expect(hitungMekar(r)).toBe(0);
  });

  it('5. satu ada-kegiatan → 1', () => {
    expect(hitungMekar(['ada-kegiatan'])).toBe(1);
  });

  it('6. satu tanpa-kegiatan setelah level 0 → tetap 0 (tidak negatif)', () => {
    expect(hitungMekar(['tanpa-kegiatan', 'tanpa-kegiatan'])).toBe(0);
  });

  it('7. ada-kegiatan naik, tanpa-kegiatan turun 0.5', () => {
    const r: StatusHari[] = ['ada-kegiatan', 'ada-kegiatan', 'tanpa-kegiatan'];
    // 0→1→2→1.5
    expect(hitungMekar(r)).toBe(1.5);
  });

  it('8. belum-lewat di tengah tidak mengubah level', () => {
    const r: StatusHari[] = ['ada-kegiatan', 'belum-lewat', 'ada-kegiatan'];
    // 0→1 (belum-lewat dilewati) →2
    expect(hitungMekar(r)).toBe(2);
  });

  it('9. level tidak pernah turun di bawah 0 meski banyak tanpa-kegiatan berurutan', () => {
    const r: StatusHari[] = ['ada-kegiatan', ...Array(10).fill('tanpa-kegiatan') as StatusHari[]];
    expect(hitungMekar(r)).toBe(0);
  });

  it('10. level tidak pernah melebihi TAHAP_MAKS setelah banyak ada-kegiatan', () => {
    const r: StatusHari[] = Array(20).fill('ada-kegiatan');
    expect(hitungMekar(r)).toBe(TAHAP_MAKS);
  });

  it('11. pola selang-seling ada/tanpa — nilai benar', () => {
    const r: StatusHari[] = ['ada-kegiatan', 'tanpa-kegiatan', 'ada-kegiatan', 'tanpa-kegiatan'];
    // 0→1→0.5→1.5→1
    expect(hitungMekar(r)).toBe(1);
  });

  it('12. 7 ada-kegiatan lalu 2 tanpa-kegiatan → 7 - 0.5 - 0.5 = 6', () => {
    const r: StatusHari[] = [
      ...Array(7).fill('ada-kegiatan') as StatusHari[],
      'tanpa-kegiatan',
      'tanpa-kegiatan',
    ];
    expect(hitungMekar(r)).toBe(6);
  });

  it('13. campuran belum-lewat dengan ada-kegiatan tidak mengubah level dari belum-lewat', () => {
    const r: StatusHari[] = ['ada-kegiatan', 'belum-lewat', 'belum-lewat'];
    expect(hitungMekar(r)).toBe(1);
  });
});

describe('TAHAP_MAKS', () => {
  it('bernilai 7', () => {
    expect(TAHAP_MAKS).toBe(7);
  });
});
