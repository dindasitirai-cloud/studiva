/**
 * Kontrak aria-label Irama Mingguan.
 *
 * Ini bukan tes rendering — ini tes "bekukan string".
 * Setiap string yang terlihat oleh pembaca layar di fitur Irama Mingguan
 * tercatat di sini sebagai snapshot.
 *
 * JANGAN perbarui snapshot untuk membuat tes lulus.
 * Kalau gagal, artinya kamu tidak sengaja mengubah teks aksesibilitas.
 */

import {
  ARIA_MINGGU_SEBELUMNYA,
  ARIA_MINGGU_BERIKUTNYA,
  LABEL_BLOK,
  LABEL_DOMAIN,
  LEGENDA_AJAK_MAIN,
  LEGENDA_WAWASAN,
  JUDUL_LAYAR,
  JUDUL_RINGKASAN,
  JUDUL_PITA,
  RINGKASAN_DOMINAN,
  RINGKASAN_BERAGAM,
  RINGKASAN_BACAAN,
  RINGKASAN_KOSONG_JUDUL,
  KEBIASAAN_DISIRAM,
  KEBIASAAN_ISTIRAHAT,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
  NAMA_DOMAIN_RAMAH,
} from '../contentMingguan';

// ─── String tetap ─────────────────────────────────────────────────────────────

describe('Kontrak: string tetap contentMingguan', () => {
  it('judul layar', () => {
    expect(JUDUL_LAYAR).toMatchSnapshot();
  });
  it('navigasi minggu', () => {
    expect({ sebelumnya: ARIA_MINGGU_SEBELUMNYA, berikutnya: ARIA_MINGGU_BERIKUTNYA }).toMatchSnapshot();
  });
  it('label blok waktu', () => {
    expect(LABEL_BLOK).toMatchSnapshot();
  });
  it('label domain', () => {
    expect(LABEL_DOMAIN).toMatchSnapshot();
  });
  it('nama domain ramah', () => {
    expect(NAMA_DOMAIN_RAMAH).toMatchSnapshot();
  });
  it('legenda', () => {
    expect({ ajak: LEGENDA_AJAK_MAIN, wawasan: LEGENDA_WAWASAN }).toMatchSnapshot();
  });
  it('judul ringkasan + pita', () => {
    expect({ ringkasan: JUDUL_RINGKASAN, pita: JUDUL_PITA }).toMatchSnapshot();
  });
  it('ringkasan: state strings', () => {
    expect({
      dominan: RINGKASAN_DOMINAN('gerak besar'),
      beragam: RINGKASAN_BERAGAM,
      bacaan: RINGKASAN_BACAAN,
      kosong: RINGKASAN_KOSONG_JUDUL,
    }).toMatchSnapshot();
  });
  it('kebiasaan: state strings', () => {
    expect({
      disiram: KEBIASAAN_DISIRAM('Syukur', 5),
      istirahat: KEBIASAAN_ISTIRAHAT('Sabar'),
      lihatSemua: KEBIASAAN_LIHAT_SEMUA,
      kosong: KEBIASAAN_KOSONG,
    }).toMatchSnapshot();
  });
});

// ─── Pola aria-label yang dihasilkan KotakIrama ───────────────────────────────

const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function ariaAjakMain(indeksHari: number, blok: keyof typeof LABEL_BLOK, judul: string, domain: keyof typeof LABEL_DOMAIN, selesai: boolean) {
  const namaHari = NAMA_HARI[indeksHari] ?? '';
  const namaBlok = LABEL_BLOK[blok];
  const namaDomain = LABEL_DOMAIN[domain];
  const statusLabel = selesai ? 'Selesai' : 'Terjadwal';
  return `${namaHari} ${namaBlok}. Ajak Main: ${judul}. ${namaDomain}. ${statusLabel}.`;
}

function ariaWawasan(indeksHari: number, blok: keyof typeof LABEL_BLOK, judul: string, selesai: boolean) {
  const namaHari = NAMA_HARI[indeksHari] ?? '';
  const namaBlok = LABEL_BLOK[blok];
  const statusLabel = selesai ? 'Selesai' : 'Terjadwal';
  return `${namaHari} ${namaBlok}. Wawasan Tumbuh: ${judul}. ${statusLabel}.`;
}

describe('Kontrak: pola aria-label KotakIrama', () => {
  it('ajak main terjadwal', () => {
    expect(ariaAjakMain(0, 'pagi', 'Berlari bersama', 'mk', false)).toMatchSnapshot();
  });
  it('ajak main selesai', () => {
    expect(ariaAjakMain(2, 'siang', 'Membuat gelembung', 'sos', true)).toMatchSnapshot();
  });
  it('wawasan terjadwal', () => {
    expect(ariaWawasan(6, 'jelangTidur', 'Mengapa Langit Biru?', false)).toMatchSnapshot();
  });
  it('wawasan selesai', () => {
    expect(ariaWawasan(4, 'sore', 'Kisah Semut', true)).toMatchSnapshot();
  });
  it('semua blok × hari Senin', () => {
    const bloks: Array<keyof typeof LABEL_BLOK> = ['pagi', 'siang', 'sore', 'jelangTidur'];
    expect(bloks.map(b => ariaAjakMain(0, b, 'Bermain pasir', 'sen', false))).toMatchSnapshot();
  });
});

// ─── String tetap GridMingguan ────────────────────────────────────────────────

const NAMA_HARI_PENUH = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

describe('Kontrak: aria-label tetap GridMingguan', () => {
  it('grid container', () => {
    expect('Grid Irama Hari Mingguan').toMatchSnapshot();
  });
  it('tombol header hari', () => {
    expect(NAMA_HARI_PENUH.map(n => `${n}, buka Irama Hari harian`)).toMatchSnapshot();
  });
  it('sel grid: hari × blok', () => {
    const bloks: Array<keyof typeof LABEL_BLOK> = ['pagi', 'siang', 'sore', 'jelangTidur'];
    const labels = NAMA_HARI_PENUH.flatMap(h => bloks.map(b => `${h} ${LABEL_BLOK[b]}`));
    expect(labels).toMatchSnapshot();
  });
});

// ─── String tetap LegendaIrama ────────────────────────────────────────────────

describe('Kontrak: aria-label tetap LegendaIrama', () => {
  it('section label', () => {
    expect('Legenda Irama Hari Mingguan').toMatchSnapshot();
  });
});
