// Utilitas kontras WCAG 2.1 — murni, tidak ada dependensi React/DOM.

/** Linearisasi sRGB sesuai WCAG 2.1 §1.4.3. */
function linearisasiKanal(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** Parse hex 6-digit ke komponen [r, g, b] (0–255). */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Luminansi relatif WCAG 2.1. Input: hex 6-digit seperti '#FFF3F6'. */
export function luminansiRelatif(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (
    0.2126 * linearisasiKanal(r) +
    0.7152 * linearisasiKanal(g) +
    0.0722 * linearisasiKanal(b)
  );
}

/** Rasio kontras WCAG 2.1 antara dua warna hex. */
export function rasioKontras(a: string, b: string): number {
  const la = luminansiRelatif(a);
  const lb = luminansiRelatif(b);
  const terang = Math.max(la, lb);
  const gelap = Math.min(la, lb);
  return (terang + 0.05) / (gelap + 0.05);
}

/**
 * Gelapkan warna hex dengan mengalikan setiap kanal RGB dengan faktor.
 * Default faktor 0.62 sesuai spec (stroke Wawasan Tumbuh).
 */
export function gelapkan(hex: string, faktor = 0.62): string {
  const [r, g, b] = parseHex(hex);
  const toHex = (n: number) => Math.round(Math.min(255, n * faktor)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
