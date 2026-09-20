/**
 * Konten KartuSetelahBadai — dua varian: bayi (pita 0) dan anak (pita 1–5).
 *
 * Teks diambil PERSIS dari naskah desain Ruang Teduh.
 * JANGAN mengubah teks tanpa review Psikolog Fitri Effendy.
 *
 * STATUS: DRAFT — menunggu persetujuan Fitri.
 *
 * Sumber utama: AAP, Zero to Three, Cleveland Clinic, Tronick.
 * Penanda sumber hijau/oranye dan kotak batas hanya tampil di mode admin.
 */

import type { ButirBadai } from '../types';

// ─── Varian Bayi (pita 0: 0–1 tahun) ─────────────────────────────────────────

export const BADAI_BAYI_PENCEGAHAN: ButirBadai[] = [
  {
    teks: 'Cek dulu yang dasar: lapar, mengantuk, kepanasan atau kedinginan, popok.',
    sumber: 'AAP',
    tag: 'pedoman',
    inti: true,
  },
  {
    teks: 'Letakkan bayi di tempat aman — boks atau kasur tanpa selimut, bantal, dan boneka.',
    sumber: 'AAP',
    tag: 'pedoman',
    inti: true,
  },
  {
    teks: 'Tinggalkan ruangan 10–15 menit. Tarik napas dalam, hitung sampai sepuluh.',
    sumber: 'AAP',
    tag: 'pedoman',
    inti: true,
  },
  {
    teks: 'Bayi sehat yang dirawat dan disayangi pun bisa menangis 1–2 jam sehari, sebagian lebih lama. Itu bukan tanda Ibu atau Ayah buruk.',
    sumber: 'AAP',
    tag: 'pedoman',
  },
  {
    teks: 'Selama bayi aman, lakukan sesuatu yang menenangkan diri: dengarkan musik, telepon seseorang, atau kerjakan hal ringan di rumah.',
    sumber: 'AAP',
    tag: 'pedoman',
  },
  {
    teks: 'Kalau setelah 10–15 menit belum tenang, tengok bayi — tapi jangan diangkat sampai Ibu atau Ayah benar-benar tenang.',
    sumber: 'AAP',
    tag: 'pedoman',
  },
  {
    teks: 'Kalau tangis terus berlanjut, hubungi dokter atau Puskesmas. Bisa ada sebab medis di baliknya.',
    sumber: 'AAP',
    tag: 'pedoman',
  },
];

export const BADAI_BAYI_KALIMAT_TEGAS =
  'Tidak pernah aman mengguncang, melempar, memukul, membanting, atau menyentak anak — berapa pun usianya.';
export const BADAI_BAYI_KALIMAT_TEGAS_SUMBER = 'AAP';

export const BADAI_BAYI_PEMULIHAN: ButirBadai[] = [
  {
    teks: 'Setelah tenang, kembali dan gendong bayi, lalu coba lagi cara menenangkan.',
    sumber: 'AAP',
    tag: 'pedoman',
  },
  {
    teks: 'Dekap kulit ke kulit di dada — kontak ini membantu menyelaraskan detak jantung, napas, dan suhu tubuh.',
    sumber: 'Zero to Three',
    tag: 'pedoman',
  },
  {
    teks: 'Bersenandung pelan sambil menggendong, dengan tatapan mata.',
    sumber: 'Zero to Three',
    tag: 'pedoman',
  },
  {
    teks: 'Tirukan lembut ekspresi dan suara bayi supaya ia merasa terlihat dan terhubung kembali.',
    sumber: 'Zero to Three',
    tag: 'pedoman',
  },
  {
    teks: 'Bicara pelan boleh. Yang menenangkan bayi adalah nada suaranya, bukan kata-katanya.',
    sumber: '',
    tag: 'praktik',
  },
];

export const BADAI_BAYI_PERLU_DIKETAHUI: ButirBadai[] = [
  {
    teks: 'Bahkan pada pasangan pengasuh–bayi dengan kelekatan yang sehat, keduanya sering tidak selaras — lalu kembali terhubung. Yang berdampak bukan keretakan singkat yang dipulihkan, melainkan yang tidak pernah dipulihkan.',
    sumber: 'Tronick',
    tag: 'pedoman',
  },
];

export const BADAI_BAYI_KOTAK_BATAS =
  'Anjuran ini direkomendasikan badan profesional. Tinjauan sistematis belum menemukan bukti kuat bahwa program edukasi semacam ini menurunkan angka cedera kepala akibat kekerasan — jadi ini anjuran, bukan jaminan.';

// ─── Varian Anak (pita 1–5: 1–6 tahun) ───────────────────────────────────────

export const BADAI_ANAK_PENCEGAHAN: ButirBadai[] = [
  {
    teks: 'Reaksi besar dari orang tua justru membuat anak makin sulit tenang. Menenangkan diri lebih dulu adalah yang membuat Ibu atau Ayah bisa jadi pegangan anak.',
    sumber: 'Zero to Three',
    tag: 'pedoman',
    inti: true,
  },
  {
    teks: 'Kalau terasa akan meledak, katakan: "Bunda perlu tenang sebentar." Pastikan anak di tempat aman, lalu ambil jarak.',
    sumber: '',
    tag: 'praktik',
    inti: true,
  },
  {
    teks: 'Tarik napas sampai badan turun dulu — sebelum bicara apa pun.',
    sumber: '',
    tag: 'praktik',
    inti: true,
  },
];

export const BADAI_ANAK_KALIMAT_TEGAS =
  'Tidak pernah aman memukul, membanting, atau menyentak anak — berapa pun usianya.';
export const BADAI_ANAK_KALIMAT_TEGAS_SUMBER = 'AAP';

export const BADAI_ANAK_PEMULIHAN: ButirBadai[] = [
  {
    teks: 'Kalau sudah kehilangan kendali, minta maaf. Biarkan anak melihat orang tuanya menerima konsekuensi perbuatannya dan mencari cara agar tidak terulang.',
    sumber: 'Cleveland Clinic',
    tag: 'pedoman',
  },
  {
    teks: 'Datangi anak setelah keduanya reda, bukan saat masih panas.',
    sumber: '',
    tag: 'praktik',
  },
  {
    teks: 'Sebut apa yang terjadi tanpa membela diri: "Tadi Ayah membentak. Itu bukan salahmu."',
    sumber: '',
    tag: 'praktik',
  },
  {
    teks: 'Aturan boleh tetap berlaku. Yang diperbaiki adalah cara menyampaikannya, bukan batasannya.',
    sumber: '',
    tag: 'praktik',
  },
  {
    teks: 'Kembali ke kegiatan biasa bersama — kehadiran lebih terasa daripada penjelasan panjang.',
    sumber: '',
    tag: 'praktik',
  },
];

export const BADAI_ANAK_PERLU_DIKETAHUI: ButirBadai[] = [
  {
    teks: 'Yang berdampak pada anak bukan keretakan singkat yang diperbaiki, melainkan keretakan yang tidak pernah dipulihkan. Anak tidak butuh orang tua yang tidak pernah marah — anak butuh orang tua yang kembali.',
    sumber: 'Tronick',
    tag: 'pedoman',
  },
];

export const BADAI_ANAK_KOTAK_BATAS =
  'Tidak ada pedoman resmi yang memberi naskah pemulihan setelah membentak anak. Butir bertanda praktik adalah kearifan praktik, bukan rekomendasi badan profesional — perlu keputusan Psikolog Fitri.';
