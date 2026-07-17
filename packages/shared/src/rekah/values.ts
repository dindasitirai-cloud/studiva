export type NilaiId = 'mandiri' | 'empatik' | 'percaya-diri' | 'regulasi-emosi' | 'komunikatif' | 'sosial';

export interface Nilai {
  id: NilaiId;
  label: string;
  deskripsi: string;
  warna: string;
}

export const NILAI_REKAH: Nilai[] = [
  {
    id: 'mandiri',
    label: 'Mandiri',
    deskripsi: 'Anak mampu melakukan hal-hal sederhana sendiri sesuai usianya — bukan karena dipaksa, tapi karena dipercaya.',
    warna: '#4E9C6E',
  },
  {
    id: 'empatik',
    label: 'Empatik',
    deskripsi: 'Anak belajar merasakan dan memahami perasaan orang lain — benih dari hubungan yang bermakna seumur hidup.',
    warna: '#E0526B',
  },
  {
    id: 'percaya-diri',
    label: 'Percaya Diri',
    deskripsi: 'Anak tumbuh dengan keyakinan bahwa dirinya cukup dan mampu — bukan dari pujian, tapi dari pengalaman berhasil mencoba.',
    warna: '#F6B860',
  },
  {
    id: 'regulasi-emosi',
    label: 'Regulasi Emosi',
    deskripsi: 'Anak belajar mengenali, mengungkapkan, dan mengelola perasaannya — dasar dari kesehatan mental jangka panjang.',
    warna: '#5DADE2',
  },
  {
    id: 'komunikatif',
    label: 'Komunikatif',
    deskripsi: 'Anak dapat mengungkapkan kebutuhan, pikiran, dan perasaannya dengan cara yang jelas dan sesuai usianya.',
    warna: '#A78BFA',
  },
  {
    id: 'sosial',
    label: 'Sosial',
    deskripsi: 'Anak mampu bermain, berbagi, dan bekerja sama dengan orang lain — modal utama kehidupan di komunitas.',
    warna: '#34D399',
  },
];
