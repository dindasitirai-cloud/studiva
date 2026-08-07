import { statusGerbang, Langganan } from '../supabase/langganan';

const SEKARANG = '2026-07-31T12:00:00Z';

function buat(overrides: Partial<Langganan> = {}): Langganan {
  return {
    id: 'test-id',
    id_orang_tua: 'orang-tua-id',
    status: 'aktif',
    akhir_periode: '2026-12-31T00:00:00Z',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    diperbarui_pada: SEKARANG,
    ...overrides,
  };
}

describe('statusGerbang', () => {
  it('returns belum_berlangganan bila langganan null', () => {
    expect(statusGerbang(null, SEKARANG)).toBe('belum_berlangganan');
  });

  it('returns belum_berlangganan bila status belum_pernah', () => {
    expect(statusGerbang(buat({ status: 'belum_pernah', akhir_periode: null }), SEKARANG))
      .toBe('belum_berlangganan');
  });

  it('returns aktif bila status aktif dan akhir_periode di masa depan', () => {
    expect(statusGerbang(buat({ akhir_periode: '2027-01-01T00:00:00Z' }), SEKARANG))
      .toBe('aktif');
  });

  it('returns kedaluwarsa bila status aktif tapi akhir_periode sudah lewat', () => {
    expect(statusGerbang(buat({ akhir_periode: '2026-07-30T00:00:00Z' }), SEKARANG))
      .toBe('kedaluwarsa');
  });

  it('returns kedaluwarsa tepat saat akhir_periode (bukan aktif)', () => {
    // waktuKini === akhir_periode → akhir > now GAGAL (tidak lebih besar)
    expect(statusGerbang(buat({ akhir_periode: SEKARANG }), SEKARANG))
      .toBe('kedaluwarsa');
  });

  it('returns aktif bila dalam masa tenggang (grasiHari=2, lewat 1 hari)', () => {
    const semalamlalu = '2026-07-30T12:00:00Z';
    expect(statusGerbang(buat({ akhir_periode: semalamlalu }), SEKARANG, { grasiHari: 2 }))
      .toBe('aktif');
  });

  it('returns kedaluwarsa bila lewat masa tenggang (grasiHari=1, lewat 2 hari)', () => {
    const duaHariLalu = '2026-07-29T12:00:00Z';
    expect(statusGerbang(buat({ akhir_periode: duaHariLalu }), SEKARANG, { grasiHari: 1 }))
      .toBe('kedaluwarsa');
  });

  it('returns kedaluwarsa bila status dibatalkan meskipun akhir_periode masih depan', () => {
    expect(statusGerbang(buat({ status: 'dibatalkan', akhir_periode: '2027-01-01T00:00:00Z' }), SEKARANG))
      .toBe('kedaluwarsa');
  });

  it('returns kedaluwarsa bila status tertunggak', () => {
    expect(statusGerbang(buat({ status: 'tertunggak', akhir_periode: '2027-01-01T00:00:00Z' }), SEKARANG))
      .toBe('kedaluwarsa');
  });

  it('returns kedaluwarsa bila akhir_periode null dan status aktif', () => {
    expect(statusGerbang(buat({ akhir_periode: null }), SEKARANG))
      .toBe('kedaluwarsa');
  });
});
