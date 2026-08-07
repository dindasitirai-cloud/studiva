/**
 * Sumber tunggal data bunga untuk 12 nilai Akar Keluarga.
 * Diekstrak dari svg-bunga/ — viewBox -74 -74 148 148, pusat di (0,0).
 * Semua kelopak satu bunga berbagi path `d` yang sama, hanya transform rotate berbeda.
 */

import type { NilaiAkar } from './content';

export interface DataBunga {
  /** Kebab-case ID — cocok dengan prefix nama file di svg-bunga/. */
  id: string;
  nama: NilaiAkar;
  kelopak: number;
  warnaPetal: string;
  /** SVG path d — diulang per kelopak dengan rotate berbeda. */
  d: string;
  r1: number;
  r2: number;
  c1: string;
  c2: string;
}

export const REGISTRY_BUNGA: readonly DataBunga[] = [
  {
    id: 'kejujuran',
    nama: 'Kejujuran',
    kelopak: 4,
    warnaPetal: '#5F84E6',
    d: 'M0 0 C -12.497142857142856 -18.700000000000003 -8.498057142857142 -51.699999999999996 0 -55 C 8.498057142857142 -51.699999999999996 12.497142857142856 -18.700000000000003 0 0 Z',
    r1: 12.4, r2: 6.1, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'syukur',
    nama: 'Syukur',
    kelopak: 6,
    warnaPetal: '#FFE29A',
    d: 'M0 0 C -17.344 -11.700000000000001 -18.037760000000002 -39.6 -9.018880000000001 -45 C -5.55008 -48 -1.04064 -32.58 0 -32.58 C 1.04064 -32.58 5.55008 -48 9.018880000000001 -45 C 18.037760000000002 -39.6 17.344 -11.700000000000001 0 0 Z',
    r1: 14.0, r2: 6.9, c1: '#F06BA8', c2: '#FFF3E6',
  },
  {
    id: 'kasih-sayang',
    nama: 'Kasih Sayang',
    kelopak: 5,
    warnaPetal: '#C9B8F0',
    d: 'M0 0 C -19.512 -11.700000000000001 -20.29248 -39.6 -10.14624 -45 C -6.2438400000000005 -48 -1.17072 -32.58 0 -32.58 C 1.17072 -32.58 6.2438400000000005 -48 10.14624 -45 C 20.29248 -39.6 19.512 -11.700000000000001 0 0 Z',
    r1: 15.0, r2: 7.5, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'empati',
    nama: 'Empati',
    kelopak: 7,
    warnaPetal: '#F8B9D4',
    d: 'M0 0 C -15.6096 -11.700000000000001 -16.233984 -39.6 -8.116992 -45 C -4.995072 -48 -0.936576 -32.58 0 -32.58 C 0.936576 -32.58 4.995072 -48 8.116992 -45 C 16.233984 -39.6 15.6096 -11.700000000000001 0 0 Z',
    r1: 13.2, r2: 6.5, c1: '#5F84E6', c2: '#FFF3E6',
  },
  {
    id: 'kemandirian',
    nama: 'Kemandirian',
    kelopak: 6,
    warnaPetal: '#FFE29A',
    d: 'M0 0 C -9.719999999999999 -18.700000000000003 -6.609599999999999 -51.699999999999996 0 -55 C 6.609599999999999 -51.699999999999996 9.719999999999999 -18.700000000000003 0 0 Z',
    r1: 11.0, r2: 5.3, c1: '#F06BA8', c2: '#FFF3E6',
  },
  {
    id: 'tanggung-jawab',
    nama: 'Tanggung Jawab',
    kelopak: 8,
    warnaPetal: '#C9B8F0',
    d: 'M0 0 C -14.522181818181817 -6.8999999999999995 -14.522181818181817 -39.1 0 -46 C 14.522181818181817 -39.1 14.522181818181817 -6.8999999999999995 0 0 Z',
    r1: 13.1, r2: 6.4, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'kesederhanaan',
    nama: 'Kesederhanaan',
    kelopak: 3,
    warnaPetal: '#F06BA8',
    d: 'M0 0 C -26.624000000000002 -6.8999999999999995 -26.624000000000002 -39.1 0 -46 C 26.624000000000002 -39.1 26.624000000000002 -6.8999999999999995 0 0 Z',
    r1: 19.0, r2: 9.6, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'cinta-ilmu',
    nama: 'Cinta Ilmu',
    kelopak: 12,
    warnaPetal: '#8FB8F7',
    d: 'M0 0 C -10.649600000000001 -6.8999999999999995 -10.649600000000001 -39.1 0 -46 C 10.649600000000001 -39.1 10.649600000000001 -6.8999999999999995 0 0 Z',
    r1: 11.2, r2: 5.4, c1: '#F06BA8', c2: '#FFF3E6',
  },
  {
    id: 'sabar',
    nama: 'Sabar',
    kelopak: 5,
    warnaPetal: '#8FB8F7',
    d: 'M0 0 C -19.968 -6.8999999999999995 -19.968 -39.1 0 -46 C 19.968 -39.1 19.968 -6.8999999999999995 0 0 Z',
    r1: 15.8, r2: 7.9, c1: '#F06BA8', c2: '#FFF3E6',
  },
  {
    id: 'berbagi',
    nama: 'Berbagi',
    kelopak: 6,
    warnaPetal: '#5F84E6',
    d: 'M0 0 C -6.789333333333333 -4.5600000000000005 -6.789333333333333 -51.300000000000004 0 -57 C 6.789333333333333 -51.300000000000004 6.789333333333333 -4.5600000000000005 0 0 Z',
    r1: 12.3, r2: 6.0, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'keberanian',
    nama: 'Keberanian',
    kelopak: 9,
    warnaPetal: '#F06BA8',
    d: 'M0 0 C -13.008000000000001 -11.700000000000001 -13.52832 -39.6 -6.76416 -45 C -4.16256 -48 -0.7804800000000001 -32.58 0 -32.58 C 0.7804800000000001 -32.58 4.16256 -48 6.76416 -45 C 13.52832 -39.6 13.008000000000001 -11.700000000000001 0 0 Z',
    r1: 12.0, r2: 5.8, c1: '#FFE29A', c2: '#FFF3E6',
  },
  {
    id: 'hormat-sesama',
    nama: 'Hormat pada Sesama',
    kelopak: 11,
    warnaPetal: '#FFE29A',
    d: 'M0 0 C -4.364571428571429 -4.5600000000000005 -4.364571428571429 -51.300000000000004 0 -57 C 4.364571428571429 -51.300000000000004 4.364571428571429 -4.5600000000000005 0 0 Z',
    r1: 10.1, r2: 4.8, c1: '#F06BA8', c2: '#FFF3E6',
  },
];

/** O(1) lookup by NilaiAkar name. */
export const BUNGA_DARI_NAMA = new Map<NilaiAkar, DataBunga>(
  REGISTRY_BUNGA.map(b => [b.nama, b]),
);
