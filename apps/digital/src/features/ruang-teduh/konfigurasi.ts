import type { ItemChecklist } from './types';

/**
 * Validasi konsistensi data checklist saat modul dimuat.
 * Mengembalikan daftar pesan error. Dipanggil sekali di content.ts.
 */
export function validasiChecklist(items: ItemChecklist[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    // Aturan 6: id unik
    if (seenIds.has(item.id)) {
      errors.push(`[${item.id}] id duplikat`);
    }
    seenIds.add(item.id);

    const adaPanduan = item.panduanMemilih && item.panduanMemilih.length > 0;
    const adaTautan = item.tautanBelanja !== undefined && item.tautanBelanja !== '';
    const adaAlasan = item.alasanTanpaTautan !== undefined && item.alasanTanpaTautan !== '';

    // Aturan 1: item dengan panduan wajib punya tautan ATAU alasan, tidak boleh keduanya kosong
    if (adaPanduan && !adaTautan && !adaAlasan) {
      errors.push(`[${item.id}] punya panduanMemilih tapi tidak ada tautanBelanja maupun alasanTanpaTautan`);
    }

    // Aturan 2: tidak boleh punya tautan DAN alasan sekaligus
    if (adaPanduan && adaTautan && adaAlasan) {
      errors.push(`[${item.id}] punya tautanBelanja dan alasanTanpaTautan sekaligus — pilih salah satu`);
    }

    // Aturan 3: tier tidak-wajib tidak boleh punya panduan maupun tautan
    if (item.tier === 'tidak-wajib') {
      if (adaPanduan) {
        errors.push(`[${item.id}] tier tidak-wajib tidak boleh punya panduanMemilih`);
      }
      if (adaTautan) {
        errors.push(`[${item.id}] tier tidak-wajib tidak boleh punya tautanBelanja`);
      }
    }

    // Aturan 4: kategori kesiapan-keluarga wajib punya sumberHalamanKIA
    if (item.kategori === 'kesiapan-keluarga' && !item.sumberHalamanKIA) {
      errors.push(`[${item.id}] kategori kesiapan-keluarga wajib punya sumberHalamanKIA`);
    }

    // Aturan 5: item kategori menyusui yang labelnya mengandung botol/dot/empeng/formula
    // tidak boleh punya tautanBelanja — pagar permanen, jangan dihapus
    if (item.kategori === 'menyusui') {
      const labelLower = item.label.toLowerCase();
      const kataLarangan = ['botol', 'dot', 'empeng', 'formula'];
      const mengandungLarangan = kataLarangan.some(k => labelLower.includes(k));
      if (mengandungLarangan && adaTautan) {
        errors.push(`[${item.id}] kategori menyusui mengandung kata terlarang (botol/dot/empeng/formula) — tidak boleh punya tautanBelanja`);
      }
    }
  }

  return errors;
}
