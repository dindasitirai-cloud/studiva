// TODO: rotasi mingguan kegiatan (seed dari nomor pekan) setelah backend siap
import { MATERI, type MateriItem } from '../akar-keluarga/content';

export function pilihKegiatanPekan(
  band: number,
  nilai: string[],
  fokus: string[],
): MateriItem[] {
  const semua = MATERI[band] ?? MATERI[9];

  // Filter: item yang tag nilai-nya beririsan dengan nilai terpilih
  let kandidat = semua.filter(m => m.nilai.some(n => nilai.includes(n)));

  // Fallback: jika tidak ada irisan, tampilkan semua
  if (kandidat.length === 0) kandidat = semua;

  // Urutkan: fokus di atas (item yang menyentuh salah satu fokus)
  const sorted = [...kandidat].sort((a, b) => {
    const aF = a.nilai.some(n => fokus.includes(n));
    const bF = b.nilai.some(n => fokus.includes(n));
    if (aF && !bF) return -1;
    if (!aF && bF) return 1;
    return 0;
  });

  return sorted.slice(0, 3);
}
