/**
 * Beranda Ruang Teduh — mendukung 6 pita usia (0–6 tahun).
 *
 * Menggantikan BerandaRuangTeduh.tsx untuk semua pita usia.
 * Untuk pita 0, modul nifas (LembarNifas, PiringIbu, MenyambutSiKecil) tetap tersedia.
 *
 * STATUS: DRAFT — wajib review Psikolog Fitri sebelum produksi.
 */

import React, { useRef } from 'react';
import type { PitaUsia, Peran, RingkasNifas } from './types';
import { FASE } from './data/fase';
import {
  CP_SAPAAN_JUDUL,
  CP_SAPAAN_JUDUL_AYAH,
  CP_CATATAN_KAKI,
  CP_MODUL_LEMBAR_NIFAS_JUDUL,
  CP_MODUL_LEMBAR_NIFAS_SUBJUDUL,
  CP_MODUL_PIRING_IBU_JUDUL,
  CP_MODUL_PIRING_IBU_SUBJUDUL,
  CP_MODUL_MENYAMBUT_JUDUL,
  CP_MODUL_MENYAMBUT_SUBJUDUL,
  CP_MODUL_AYAH_JUDUL,
  CP_MODUL_AYAH_KONTEN,
  CP_MODUL_INIWAJAR_JUDUL,
  CP_MODUL_INIWAJAR_SUBJUDUL,
  CP_BACAAN_JUDUL_IBU,
  CP_BACAAN_JUDUL_AYAH,
} from './copy';
import { BACAAN } from './data/bacaan';
import LangitHariIni from './components/LangitHariIni';
import KartuSedia from './components/KartuSedia';
import KartuSetelahBadai from './components/KartuSetelahBadai';
import KartuModul from './components/KartuModul';

// TODO: ambil dari CaregiverProfile.peran saat tersedia di backend
// Sementara default ke 'ibu'; pengguna dengan peran ayah belum dibedakan
const ADMIN_MODE = false; // set true untuk tampilan review klinis

interface PropsBerandaRuangTeduhBaru {
  pitaUsia: PitaUsia;
  peran: Peran;
  sapaan: { low: string; cap: string };
  hariIni: string;
  ringkasNifas: RingkasNifas | null;
  /** Navigasi ke sub-halaman yang sudah ada */
  onNavigasi: (tujuan: 'piring-ibu' | 'lembar-nifas' | 'menyambut') => void;
}

export default function BerandaRuangTeduhBaru({
  pitaUsia,
  peran,
  sapaan,
  hariIni,
  ringkasNifas,
  onNavigasi,
}: PropsBerandaRuangTeduhBaru) {
  const refSetelahBadai = useRef<HTMLDivElement>(null);

  const fase = FASE[pitaUsia];
  const sapaanJudul = peran === 'ayah' ? CP_SAPAAN_JUDUL_AYAH : CP_SAPAAN_JUDUL;

  function gulirKeSetelahBadai() {
    refSetelahBadai.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Modul kolom kanan yang tampil berdasarkan peran dan pitaUsia
  const tampilLembarNifas = peran === 'ibu' && pitaUsia === 0 && !!ringkasNifas?.dalamMasaNifas;
  const tampilPiringIbu = peran === 'ibu' && pitaUsia === 0;
  const tampilMenyambut = pitaUsia === 0;

  const bacaan = BACAAN[pitaUsia].filter(b => !b.peran || b.peran === peran);
  const judul_bacaan = peran === 'ayah' ? CP_BACAAN_JUDUL_AYAH : CP_BACAAN_JUDUL_IBU;

  const kontenAyah = CP_MODUL_AYAH_KONTEN[pitaUsia];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Eyebrow + sapaan */}
      <div>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: '#A98DA0',
            margin: '0 0 4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {fase.eyebrow}
        </p>
        <h1
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 24,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 6px',
          }}
        >
          {sapaanJudul}
        </h1>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            color: '#6E3B57',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {fase.pengakuan[peran]}
        </p>
      </div>

      {/* Tata letak dua kolom — mobile: 1 kolom dengan urutan khusus */}
      <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
        {/* Kolom kiri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 1. Langit Hari Ini */}
          <LangitHariIni
            peran={peran}
            hariIni={hariIni}
            onBukaSetelahBadai={gulirKeSetelahBadai}
          />

          {/* 2. Setelah Badai — posisi ke-2 di mobile (paling dekat darurat) */}
          <div ref={refSetelahBadai}>
            <KartuSetelahBadai
              pitaUsia={pitaUsia}
              adminMode={ADMIN_MODE}
            />
          </div>

          {/* 3. Sedia */}
          <KartuSedia
            pitaUsia={pitaUsia}
            adminMode={ADMIN_MODE}
          />
        </div>

        {/* Kolom kanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Lembar Nifas — hanya ibu + pita 0 + masih dalam 42 hari */}
          {tampilLembarNifas && ringkasNifas && (
            <KartuModul
              judul={CP_MODUL_LEMBAR_NIFAS_JUDUL}
              subjudul={CP_MODUL_LEMBAR_NIFAS_SUBJUDUL(ringkasNifas.hariKe)}
              warna="#F06BA8"
              ikonPath="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
              onClick={() => onNavigasi('lembar-nifas')}
            />
          )}

          {/* Piring Ibu — hanya ibu + pita 0 */}
          {tampilPiringIbu && (
            <KartuModul
              judul={CP_MODUL_PIRING_IBU_JUDUL}
              subjudul={CP_MODUL_PIRING_IBU_SUBJUDUL}
              warna="#F06BA8"
              ikonPath="M12 8v4M12 16h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"
              onClick={() => onNavigasi('piring-ibu')}
            />
          )}

          {/* Menyambut Si Kecil — kedua peran, pita 0 */}
          {tampilMenyambut && (
            <KartuModul
              judul={CP_MODUL_MENYAMBUT_JUDUL}
              subjudul={CP_MODUL_MENYAMBUT_SUBJUDUL}
              warna="#F6B860"
              ikonPath="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              onClick={() => onNavigasi('menyambut')}
            />
          )}

          {/* Ruang Ayah — hanya peran ayah */}
          {peran === 'ayah' && (
            <div
              style={{
                background: '#F0F4FF',
                border: '1px solid #C5D4F5',
                borderRadius: 20,
                padding: '16px 18px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#3A2530',
                  margin: '0 0 8px',
                }}
              >
                {CP_MODUL_AYAH_JUDUL}
              </p>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  color: '#3A4A70',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {kontenAyah.isi}
              </p>
              {kontenAyah.sumber && (
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 11,
                    color: '#8A9EC4',
                    margin: '6px 0 0',
                  }}
                >
                  {kontenAyah.sumber}
                </p>
              )}
            </div>
          )}

          {/* Ini wajar / dicek? — semua peran dan pita */}
          <KartuModul
            judul={CP_MODUL_INIWAJAR_JUDUL}
            subjudul={CP_MODUL_INIWAJAR_SUBJUDUL}
            warna="#C9B6E4"
          />

          {/* Rak bacaan */}
          {bacaan.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '16px 18px',
                border: '1px solid rgba(201,182,228,.2)',
              }}
            >
              <p
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#3A2530',
                  margin: '0 0 12px',
                }}
              >
                {judul_bacaan}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bacaan.map(kartu => (
                  <div
                    key={kartu.id}
                    style={{
                      padding: '10px 12px',
                      background: '#FAF7FE',
                      borderRadius: 12,
                      border: '1px solid rgba(201,182,228,.2)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Nunito, system-ui, sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#3A2530',
                        margin: '0 0 2px',
                      }}
                    >
                      {kartu.judul}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Nunito, system-ui, sans-serif',
                        fontSize: 12,
                        color: '#8A7A80',
                        margin: 0,
                      }}
                    >
                      {kartu.subjudul}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catatan kaki */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#C0A6B7',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {CP_CATATAN_KAKI}
      </p>
    </div>
  );
}
