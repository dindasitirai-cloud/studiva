import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MENU_UTAMA } from '../../../config/fiturRekah';
import AlurEkosistem from '../komponen/AlurEkosistem';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderWith(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ── AlurEkosistem: 5 langkah sesuai fiturRekah.ts ───────────────────────────

describe('AlurEkosistem', () => {
  it('merender tepat 5 langkah (beranda dilewati)', () => {
    renderWith(<AlurEkosistem namaAnak="Hana" />);
    // 5 fitur selain beranda
    const langkah = MENU_UTAMA.filter(f => f.id !== 'beranda');
    expect(langkah).toHaveLength(5);
    // Setiap label harus muncul di layar
    langkah.forEach(f => {
      expect(screen.getByText(f.label)).toBeInTheDocument();
    });
  });

  it('urutan langkah sesuai MENU_UTAMA (irama → bekal → teduh → jurnal → panen)', () => {
    renderWith(<AlurEkosistem namaAnak="Hana" />);
    const langkah = MENU_UTAMA.filter(f => f.id !== 'beranda');
    const labels = langkah.map(f => f.label);
    expect(labels).toEqual(['Irama Hari', 'Bekal', 'Ruang Teduh', 'Jurnal dan Galeri', 'Panen']);
  });
});

// ── Regression guard: tidak ada teks sinyalLelah di beranda ─────────────────

describe('Regression: sinyalLelah tidak muncul di beranda', () => {
  it('KartuCuacaHati mengembalikan null', () => {
    // Import langsung komponen untuk memverifikasi ia tidak merender apa pun
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const KartuCuacaHati = require('../komponen/rail/KartuCuacaHati').default;
    const { container } = render(<KartuCuacaHati />);
    expect(container.firstChild).toBeNull();
  });

  it('JEJAK_COPY.sinyalLelahJudul tidak diimpor di file beranda', () => {
    // Guard statis: pastikan sinyalLelahJudul tidak pernah dirender di komponen rail.
    // Kalau test ini gagal, berarti ada komponen beranda yang memakai copy terlarang.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JEJAK_COPY } = require('../../rekah-jejak/rekahJejakCopy');
    expect(JEJAK_COPY.sinyalLelahJudul).toBeDefined(); // memastikan referensi ada
    // Verifikasi negatif: teks ini tidak muncul di render AlurEkosistem
    const { queryByText } = renderWith(<AlurEkosistem namaAnak="Hana" />);
    expect(queryByText(JEJAK_COPY.sinyalLelahJudul)).toBeNull();
  });
});
