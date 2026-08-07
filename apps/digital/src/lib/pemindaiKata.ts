export const POLA_KATA_TERLARANG =
  /terlambat|belum mencapai|di bawah|tertinggal|kurang|gagal|seharusnya sudah/i;

export interface TemuanKata {
  potongan: string;
  posisi: number;
}

/**
 * Memindai teks bebas dan mengembalikan daftar kecocokan kata terlarang.
 * Mengembalikan array kosong bila teks bersih.
 */
export function pindaiKata(teks: string): TemuanKata[] {
  const hasil: TemuanKata[] = [];
  const regex = new RegExp(POLA_KATA_TERLARANG.source, 'gi');
  let m: RegExpExecArray | null;
  while ((m = regex.exec(teks)) !== null) {
    hasil.push({
      potongan: teks.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).trim(),
      posisi: m.index,
    });
  }
  return hasil;
}

/**
 * Memindai beberapa field sekaligus dan mengembalikan map field → temuan.
 * Hanya menyertakan field yang ada temuannya.
 */
export function pindaiFields(
  fields: Record<string, string>,
): Record<string, TemuanKata[]> {
  const hasil: Record<string, TemuanKata[]> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue;
    const t = pindaiKata(v);
    if (t.length > 0) hasil[k] = t;
  }
  return hasil;
}
