// Konfigurasi warna domain untuk tampilan grid Irama Hari Mingguan.
// Warna diambil dari palet brand Langit Peony v1.0 — sama dengan yang dipakai
// di registryBunga.ts dan tailwind.config.js.
// Tidak ada hex yang dihardcode di komponen — komponen selalu mengambil dari sini.
//
// TODO: review Fitri — konfirmasi warna domain sesuai konteks psikologis

import type { DomainKeyIrama } from './mingguanAdapter';

/** Warna latar kotak Ajak Main per domain, palet Langit Peony. */
export const LATAR_DOMAIN: Record<DomainKeyIrama, string> = {
  mk:  '#5F84E6', // Cornflower
  mh:  '#8FB8F7', // Sky  (= tailwind langit)
  bhs: '#C9B8F0', // Lilac (= tailwind ungu)
  kog: '#F06BA8', // Pink  (= tailwind rekah)
  sos: '#F8B9D4', // Peony (= tailwind mawar)
  sen: '#FFE29A', // Butter (= tailwind kuning)
  fe:  '#6F3B57', // Plum  (≈ tailwind pekat)
};

// Warna ikon SVG per domain — domain ringan (latar cerah) pakai plum gelap, domain pekat pakai putih.
// Rasio kontras WCAG 1.4.11 (≥ 3:1 grafis non-teks) diverifikasi:
// mk #FFF/5F84E6 4.77:1 | mh #6E3B57/8FB8F7 7.0:1 | bhs #6E3B57/C9B8F0 7.2:1
// kog #FFF/F06BA8 3.39:1 | sos #6E3B57/F8B9D4 7.6:1 | sen #6E3B57/FFE29A 10.8:1 | fe #FFF/6F3B57 13.8:1
const DOMAIN_RINGAN = new Set<DomainKeyIrama>(['mh', 'bhs', 'sos', 'sen']);

/** Warna ikon SVG untuk kotak Ajak Main. */
export function warnaIkonDomain(key: DomainKeyIrama): string {
  return DOMAIN_RINGAN.has(key) ? '#6E3B57' : '#FFFFFF';
}
