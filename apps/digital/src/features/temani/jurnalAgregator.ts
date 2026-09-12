// Jurnal — agregator log otomatis (Phase 14Q). Menurunkan entri harian dari
// data yang SUDAH ada (tidak menulis apa pun): pilihan_harian.selesai/kustom,
// centang kebiasaan, dan refleksi_kegiatan. Read-only, pure functions.

export type SumberJurnal = 'kelola' | 'kebiasaan' | 'temani' | 'bantu' | 'refleksi';

export interface EntriOtomatis {
  sumber: SumberJurnal;
  teks: string;
  tag: string;
}

interface KustomItem { id?: string; judul?: string; keteranganKapan?: string; sumberId?: string }
interface DiffHari { selesai?: string[]; kustom?: KustomItem[] }

const LABEL_HASIL: Record<string, string> = {
  menyenangkan: '🙂 Menyenangkan',
  terlalu_sulit: '😮‍💨 Terlalu sulit',
  kurang_cocok: '🤔 Kurang cocok',
};

function sumberDari(it: KustomItem): { sumber: SumberJurnal; tag: string } {
  const k = `${it.keteranganKapan ?? ''} ${it.sumberId ?? ''}`;
  if (/temani/i.test(k)) return { sumber: 'temani', tag: 'Temani' };
  if (/bantu/i.test(k)) return { sumber: 'bantu', tag: 'Bantu · situasional' };
  if (/kebiasaan/i.test(k)) return { sumber: 'kebiasaan', tag: 'Kebiasaan Baik' };
  return { sumber: 'kelola', tag: 'Kelola · selesai' };
}

const RANK: Record<SumberJurnal, number> = { kelola: 0, kebiasaan: 1, bantu: 2, temani: 3, refleksi: 4 };

export function bangunEntriHari(
  diffRaw: unknown,
  centangHari: Record<string, string[]> | undefined,
  refleksiHari: readonly { hasil: string }[],
): EntriOtomatis[] {
  const diff = (diffRaw ?? {}) as DiffHari;
  const selesai = Array.isArray(diff.selesai) ? diff.selesai : [];
  const kustom = Array.isArray(diff.kustom) ? diff.kustom : [];
  const byId = new Map<string, KustomItem>();
  for (const it of kustom) if (it.id) byId.set(it.id, it);

  const entri: EntriOtomatis[] = [];
  let lainnya = 0;
  for (const id of selesai) {
    const it = byId.get(id);
    if (it && it.judul) {
      const { sumber, tag } = sumberDari(it);
      entri.push({ sumber, teks: it.judul, tag });
    } else {
      lainnya += 1;
    }
  }
  if (lainnya > 0) {
    entri.push({ sumber: 'kelola', teks: `${lainnya} kegiatan harian lain diselesaikan`, tag: 'Kelola · selesai' });
  }

  if (centangHari) {
    for (const nilai of Object.keys(centangHari)) {
      const arr = centangHari[nilai];
      if (Array.isArray(arr) && arr.length > 0) {
        entri.push({ sumber: 'kebiasaan', teks: `Merawat kebiasaan baik · ${nilai}`, tag: 'Kebiasaan Baik' });
      }
    }
  }

  for (const r of refleksiHari) {
    entri.push({ sumber: 'refleksi', teks: `Refleksi: ${LABEL_HASIL[r.hasil] ?? r.hasil}`, tag: 'Temani' });
  }

  return entri.sort((a, b) => RANK[a.sumber] - RANK[b.sumber]);
}
