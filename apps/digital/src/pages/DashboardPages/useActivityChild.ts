import { useAnak } from '../../context/AnakContext';
import type { ProfilAnak } from '../../types/anak';

interface ActivityChildResolution {
  /** Exactly one child to silently attribute activity to, no picker needed. */
  singleChild: { id: string; name: string } | null;
  /** Only non-empty when the parent has 2+ child profiles and must pick. */
  pickerChildren: ProfilAnak[];
}

// Resolves "which child does this article/course/strategy activity belong to?"
// Data anak diambil dari AnakContext, sumber tunggal data anak.
// 1 anak → langsung diatribusikan, 2+ → tampilkan ChildPicker.
export function useActivityChild(): ActivityChildResolution {
  const { daftarAnak } = useAnak();

  if (daftarAnak.length === 1) {
    return {
      singleChild: { id: daftarAnak[0].id, name: daftarAnak[0].namaAnak },
      pickerChildren: [],
    };
  }
  return { singleChild: null, pickerChildren: daftarAnak };
}
