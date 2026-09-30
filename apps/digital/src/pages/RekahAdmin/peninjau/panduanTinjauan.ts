// Pegangan tinjauan klinis per jenis konten — daftar periksa & catatan cepat untuk Psikolog Fitri.
// Daftar periksa bersifat pengingat (tidak mengunci tombol), catatan cepat hanya menyisipkan teks.
import type { JenisKonten } from '../../../lib/supabase/pipeline';

export const PERIKSA_UMUM = [
  'Bahasa hangat dan mengajak — tidak menilai atau menyalahkan anak maupun orang tua',
  'Tanpa bahasa defisit, label, skor, atau perbandingan antar anak',
  'Sesuai tahap usia yang dituju',
];

export const PERIKSA_JENIS: Record<JenisKonten, string[]> = {
  kegiatan_ajak_main: ['Langkah aman dan bisa dilakukan di rumah dengan bahan sederhana', 'Durasi dan tujuan realistis untuk usia ini', 'Klaim manfaat didukung sumber, bila ada'],
  panduan_tumbuh: ['Isi ringkasan akurat secara klinis', 'Bagian "perlu perhatian" menyarankan tenaga profesional tanpa menakut-nakuti', 'Sumber ilmiah tercantum dan relevan'],
  sikap: ['Sikap konkret dan bisa diamati sehari-hari', 'Rentang fase usia masuk akal'],
  temani_journey: ['Urutan hari bertahap dan tidak membebani', 'Contoh kalimat terdengar alami untuk orang tua Indonesia', 'Penjelasan "kenapa" tidak berlebihan'],
  bantu_situasi: ['Langkah bisa dijalankan saat genting (2–4 langkah)', 'Pilihan jawaban yang menyangkut keselamatan membuka layar keselamatan', 'Tidak ada saran yang memakai rasa sakit atau ketidaknyamanan fisik'],
  kebiasaan_baik: ['Kebiasaan kecil dan bisa dilakukan dalam kegiatan harian', 'Kategori (rutin/situasional) dan kegiatan tempelannya tepat'],
};

export const CATATAN_CEPAT = [
  'Mohon hangatkan bahasanya agar tidak terdengar menggurui.',
  'Mohon sesuaikan dengan tahap usia yang dituju.',
  'Mohon tambahkan sumber untuk klaim ilmiahnya.',
  'Mohon hindari kata yang bernada menilai anak.',
  'Mohon perjelas langkahnya agar mudah dijalankan orang tua.',
  'Perlu pengecekan keselamatan lebih lanjut.',
];

export const LABEL_TINDAKAN: Record<string, string> = {
  diajukan: 'Diajukan', disetujui: 'Disetujui', ditolak: 'Ditolak', revisi_diminta: 'Revisi diminta', tayang: 'Tayang',
};

/** "hari ini", "kemarin", "3 hari" dari tanggal ISO. */
export function lamaMenunggu(iso: string): { teks: string; hari: number } {
  const hari = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  return { hari, teks: hari === 0 ? 'hari ini' : hari === 1 ? 'kemarin' : `${hari} hari` };
}

export function sapaanWaktu(d = new Date()): string {
  const j = d.getHours();
  return j < 11 ? 'Selamat pagi' : j < 15 ? 'Selamat siang' : j < 18 ? 'Selamat sore' : 'Selamat malam';
}
