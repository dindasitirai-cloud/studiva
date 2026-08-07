/**
 * Pembangkit angka acak deterministik — tanpa state global, murni dari input.
 * Implementasi: FNV-1a hash (benih) + mulberry32 PRNG + kocokan Fisher-Yates.
 * Tidak ada Math.random(), Date.now(), atau new Date() tanpa argumen.
 */

/** Hash teks menjadi bilangan bulat uint32 via FNV-1a 32-bit. */
export function benihDariTeks(teks: string): number {
  let h = 2166136261; // FNV offset basis
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = (Math.imul(h, 16777619) >>> 0); // FNV prime, paksa uint32
  }
  return h >>> 0;
}

/**
 * Kembalikan fungsi penghasil bilangan [0, 1) via mulberry32 PRNG.
 * Setiap pemanggilan menghasilkan urutan yang sama untuk benih yang sama.
 */
export function pembangkitAcak(benih: number): () => number {
  let state = benih >>> 0;
  return function (): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Kocokan Fisher-Yates deterministik. Tidak mengubah array asal;
 * mengembalikan array baru yang merupakan permutasi dari `daftar`.
 */
export function kocok<T>(daftar: readonly T[], benih: number): T[] {
  const hasil = daftar.slice();
  const acak = pembangkitAcak(benih);
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    const tmp = hasil[i];
    hasil[i] = hasil[j];
    hasil[j] = tmp;
  }
  return hasil;
}
