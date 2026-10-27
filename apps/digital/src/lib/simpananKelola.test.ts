// Uji alur simpanan Kelola dengan Supabase tiruan (tabel di memori).
type Baris = { id_anak: string; kunci: string; isi: string; diperbarui_pada: string };
const tabel: Baris[] = [];

jest.mock('./supabase/client', () => {
  const buat = () => {
    let filter: Record<string, string> = {};
    const q: Record<string, unknown> = {
      select: () => q,
      eq: (k: string, v: string) => { filter = { ...filter, [k]: v }; return q; },
      then: (ok: (r: unknown) => void) => ok({ data: tabel.filter(b => Object.entries(filter).every(([k, v]) => (b as Record<string, string>)[k] === v)), error: null }),
      upsert: (rows: Baris | Baris[]) => {
        for (const r of Array.isArray(rows) ? rows : [rows]) {
          const i = tabel.findIndex(b => b.id_anak === r.id_anak && b.kunci === r.kunci);
          if (i >= 0) tabel[i] = r; else tabel.push(r);
        }
        return Promise.resolve({ error: null });
      },
      delete: () => {
        const d: Record<string, unknown> = {};
        let f: Record<string, string> = {};
        d.eq = (k: string, v: string) => { f = { ...f, [k]: v }; return d; };
        d.then = (ok: (r: unknown) => void) => {
          for (let i = tabel.length - 1; i >= 0; i -= 1) if (Object.entries(f).every(([k, v]) => (tabel[i] as Record<string, string>)[k] === v)) tabel.splice(i, 1);
          ok({ error: null });
        };
        return d;
      },
    };
    return q;
  };
  return { supabase: { from: () => buat() } };
});

// eslint-disable-next-line import/first
import { pasangSinkronKelola, pulihkanSimpananKelola } from './simpananKelola';

const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';
const tunggu = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('simpananKelola', () => {
  beforeAll(() => { localStorage.clear(); pasangSinkronKelola(); });

  test('perubahan di perangkat terunggah ke akun', async () => {
    localStorage.setItem(`rekah_rencana_v3_${A}_2026-10-26`, '[{"id":"r1"}]');
    await tunggu(900); // unggahan berjeda
    expect(tabel.find(b => b.kunci === `rekah_rencana_v3_${A}_2026-10-26`)?.isi).toBe('[{"id":"r1"}]');
  });

  test('kunci bukan Kelola tidak diunggah', async () => {
    localStorage.setItem('rekah_lain', 'x');
    localStorage.setItem(`rekah_rencana_v3_anon_2026-10-26`, '[]');
    await tunggu(900);
    expect(tabel.some(b => b.kunci === 'rekah_lain' || b.kunci.includes('anon'))).toBe(false);
  });

  test('perangkat baru memulihkan data dari akun', async () => {
    tabel.push({ id_anak: B, kunci: `rekah_hariini_v3_${B}_2026-10-27`, isi: '{"extra":{}}', diperbarui_pada: '2026-10-27T09:00:00.000Z' });
    await pulihkanSimpananKelola(B);
    expect(localStorage.getItem(`rekah_hariini_v3_${B}_2026-10-27`)).toBe('{"extra":{}}');
  });

  test('menghapus kunci di aplikasi menghapus baris di akun', async () => {
    localStorage.removeItem(`rekah_rencana_v3_${A}_2026-10-26`);
    await tunggu(900);
    expect(tabel.some(b => b.kunci === `rekah_rencana_v3_${A}_2026-10-26`)).toBe(false);
  });
});
