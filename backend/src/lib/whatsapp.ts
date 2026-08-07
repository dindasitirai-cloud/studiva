import { ConsultationType } from '../types';

export function generateWhatsAppLink(childName: string, consultationType: ConsultationType, notes?: string | null): string {
  // Tidak ada nomor cadangan yang di-hardcode.
  //
  // Dulu baris ini berbunyi `|| '6281211470407'`. Kalau env var lupa diisi di
  // server, tautan tetap terbentuk dan pesan orang tua diam-diam mengalir ke
  // nomor itu — kegagalan yang tidak terlihat sampai ada yang mengeluh.
  // Sekarang gagal keras di titik konfigurasinya, bukan diam-diam salah kirim.
  const number = process.env.PSIKOLOG_WHATSAPP_NUMBER;
  if (!number) {
    throw new Error(
      'PSIKOLOG_WHATSAPP_NUMBER belum diset. Isi di backend/.env atau environment variables server.',
    );
  }

  let message = `Saya ingin konsultasi terkait anak saya ${childName} secara ${consultationType}, kapan jadwal yang available?`;
  if (notes && notes.trim()) {
    message += ` Topik: ${notes.trim()}.`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
