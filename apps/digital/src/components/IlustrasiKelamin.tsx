// ============================================================================
// IlustrasiKelamin — ilustrasi anak perempuan dan laki-laki.
//
// CARA MENAMBAHKAN ILUSTRASI:
//   Taruh dua berkas di apps/digital/public/images/ dengan nama persis:
//
//     ilustrasi-anak-perempuan.png
//     ilustrasi-anak-laki-laki.png
//
//   Saran: PNG transparan atau SVG, bujur sangkar, minimal 240 x 240 px
//   supaya tajam di layar retina. Kalau memakai SVG, ubah BERKAS di bawah.
//
//   Tidak perlu mengubah kode lain. Selama berkasnya belum ada, komponen
//   ini menampilkan bentuk kelopak khas Rekah sebagai cadangan.
//
// Kenapa bukan emoji: emoji bunga dan tunas untuk membedakan perempuan dan
// laki-laki mengaitkan sifat dengan gender, dan itu bertentangan dengan
// posisi Rekah bahwa isi pengasuhan sama untuk semua anak.
// ============================================================================

import React, { useState } from 'react';
import type { JenisKelamin } from '../types/anak';

const BERKAS: Record<JenisKelamin, string> = {
  'perempuan': '/images/ilustrasi-anak-perempuan.png',
  'laki-laki': '/images/ilustrasi-anak-laki-laki.png',
};

// Warna cadangan diambil dari palet Langit Peony. Keduanya sengaja
// dibedakan hanya oleh rona, bukan oleh bentuk, supaya tidak ada
// bentuk yang terbaca lebih "kuat" atau lebih "lembut".
const WARNA_CADANGAN: Record<JenisKelamin, string> = {
  'perempuan': '#E0526B',
  'laki-laki': '#7FA9D9',
};

export interface IlustrasiKelaminProps {
  jenisKelamin: JenisKelamin;
  ukuran?: number;
  className?: string;
}

export default function IlustrasiKelamin({
  jenisKelamin,
  ukuran = 40,
  className = '',
}: IlustrasiKelaminProps) {
  // Berkas ilustrasi mungkin belum diunggah. onError memindahkan komponen
  // ke bentuk cadangan tanpa menampilkan ikon gambar rusak.
  const [gagalMuat, setGagalMuat] = useState(false);

  if (gagalMuat) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          display: 'inline-block',
          width: ukuran * 0.62,
          height: ukuran,
          borderRadius: '70% 70% 70% 4px',
          backgroundColor: WARNA_CADANGAN[jenisKelamin],
          opacity: 0.85,
        }}
      />
    );
  }

  return (
    <img
      src={BERKAS[jenisKelamin]}
      alt=""
      aria-hidden
      onError={() => setGagalMuat(true)}
      className={`object-contain ${className}`}
      style={{ width: ukuran, height: ukuran }}
    />
  );
}
