/**
 * Kontrak KartuKebiasaanBaik.
 *
 * Tes ini membekukan:
 *   1. Pola aria-label tiap butir — formula "${nilai}, ${butir.judul}"
 *   2. Nilai aria-checked sesuai centangKebiasaan
 *   3. Perilaku disiramPada sebelum dan sesudah satu butir dicentang
 *
 * JANGAN perbarui snapshot untuk membuat tes lulus.
 * Kalau gagal, artinya kamu mengubah perilaku yang sudah dibekukan.
 */

import { describe, it, expect } from 'vitest';
import { disiramPada, toggleCentang } from './centang';
import type { CentangKebiasaan } from './centang';

// ─── Fixture tetap ────────────────────────────────────────────────────────────

const TANGGAL = '2026-08-04';

const FIXTURE_BUTIR = [
  { id: 'kb-001', judul: 'Kontak mata dan sapaan lembut', nilai: 'kasih-sayang' as const },
  { id: 'kb-002', judul: 'Merespons tangisan dengan tenang', nilai: 'kasih-sayang' as const },
  { id: 'kj-001', judul: 'Cerita jujur tentang kejadian tadi', nilai: 'kejujuran' as const },
];

/** Pola aria-label persis seperti di ButirSikap: `${nilai}, ${butir.judul}` */
function ariaLabel(nilai: string, judul: string) {
  return `${nilai}, ${judul}`;
}

/** aria-checked persis seperti di ButirSikap */
function ariaChecked(
  centang: CentangKebiasaan,
  tanggal: string,
  nilai: string,
  butirId: string,
): boolean {
  return (centang[tanggal]?.[nilai] ?? []).includes(butirId);
}

// ─── Kontrak aria-label ───────────────────────────────────────────────────────

describe('Kontrak: aria-label KartuKebiasaanBaik', () => {
  it('pola aria-label seluruh butir, terurut', () => {
    const labels = FIXTURE_BUTIR.map(b => ariaLabel(b.nilai, b.judul)).sort();
    expect(labels).toMatchInlineSnapshot(`
      [
        "kasih-sayang, Kontak mata dan sapaan lembut",
        "kasih-sayang, Merespons tangisan dengan tenang",
        "kejujuran, Cerita jujur tentang kejadian tadi",
      ]
    `);
  });
});

// ─── Kontrak aria-checked ─────────────────────────────────────────────────────

describe('Kontrak: aria-checked KartuKebiasaanBaik', () => {
  it('semua false saat centangKebiasaan kosong', () => {
    const centang: CentangKebiasaan = {};
    const hasil = FIXTURE_BUTIR.map(b => ({
      label: ariaLabel(b.nilai, b.judul),
      checked: ariaChecked(centang, TANGGAL, b.nilai, b.id),
    }));
    expect(hasil.every(h => h.checked === false)).toBe(true);
  });

  it('hanya butir yang dicentang menjadi true', () => {
    const centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    const hasil = FIXTURE_BUTIR.map(b => ({
      label: ariaLabel(b.nilai, b.judul),
      checked: ariaChecked(centang, TANGGAL, b.nilai, b.id),
    }));
    expect(hasil).toMatchInlineSnapshot(`
      [
        {
          "checked": true,
          "label": "kasih-sayang, Kontak mata dan sapaan lembut",
        },
        {
          "checked": false,
          "label": "kasih-sayang, Merespons tangisan dengan tenang",
        },
        {
          "checked": false,
          "label": "kejujuran, Cerita jujur tentang kejadian tadi",
        },
      ]
    `);
  });

  it('membatalkan centang mengembalikan ke false', () => {
    let centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    centang = toggleCentang(centang, 'kasih-sayang', 'kb-001', TANGGAL);
    const hasil = FIXTURE_BUTIR.map(b => ({
      label: ariaLabel(b.nilai, b.judul),
      checked: ariaChecked(centang, TANGGAL, b.nilai, b.id),
    }));
    expect(hasil.every(h => h.checked === false)).toBe(true);
  });
});

// ─── Kontrak disiramPada ──────────────────────────────────────────────────────

describe('Kontrak: disiramPada', () => {
  it('false sebelum ada butir dicentang', () => {
    const centang: CentangKebiasaan = {};
    expect(disiramPada(centang, 'kasih-sayang', TANGGAL)).toBe(false);
    expect(disiramPada(centang, 'kejujuran', TANGGAL)).toBe(false);
  });

  it('true setelah satu butir dicentang — satu butir cukup', () => {
    const centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    expect(disiramPada(centang, 'kasih-sayang', TANGGAL)).toBe(true);
  });

  it('nilai lain tidak ikut terdampak', () => {
    const centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    expect(disiramPada(centang, 'kejujuran', TANGGAL)).toBe(false);
  });

  it('false kembali setelah butir terakhir dibatalkan', () => {
    let centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    centang = toggleCentang(centang, 'kasih-sayang', 'kb-001', TANGGAL);
    expect(disiramPada(centang, 'kasih-sayang', TANGGAL)).toBe(false);
  });

  it('kondisi mixed: dua nilai berbeda, keduanya disiram', () => {
    let centang = toggleCentang({}, 'kasih-sayang', 'kb-001', TANGGAL);
    centang = toggleCentang(centang, 'kasih-sayang', 'kb-002', TANGGAL);
    centang = toggleCentang(centang, 'kejujuran', 'kj-001', TANGGAL);
    expect(disiramPada(centang, 'kasih-sayang', TANGGAL)).toBe(true);
    expect(disiramPada(centang, 'kejujuran', TANGGAL)).toBe(true);
  });
});
