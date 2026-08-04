import React from 'react';
import type { MingguIrama } from '@studiva/shared';
import { BLOK_URUTAN } from '@studiva/shared';
import type { DomainKeyIrama } from './mingguanAdapter';
import { LATAR_DOMAIN } from './domainWarnaIrama';
import {
  JUDUL_RINGKASAN,
  RINGKASAN_DOMINAN,
  RINGKASAN_BERAGAM,
  RINGKASAN_BACAAN,
  RINGKASAN_KOSONG_JUDUL,
  RINGKASAN_KOSONG_ISI,
  RINGKASAN_KOSONG_TOMBOL,
  TILE_AJAK_MAIN_LABEL,
  TILE_AJAK_MAIN_SATUAN,
  TILE_WAWASAN_LABEL,
  TILE_WAWASAN_SATUAN,
  TILE_WAKTU_LABEL,
  LABEL_BLOK,
  NAMA_DOMAIN_RAMAH,
  LABEL_DOMAIN,
} from './contentMingguan';

const DOMAIN_URUTAN: DomainKeyIrama[] = ['mk', 'mh', 'bhs', 'kog', 'sos', 'sen', 'fe'];

interface PropsRingkasanMinggu {
  minggu: MingguIrama;
  onBekalPress?: () => void;
}

function hitungRingkasan(minggu: MingguIrama) {
  let jumlahAjakMain = 0;
  let jumlahWawasan = 0;
  const jumlahPerBlok: Record<string, number> = {
    pagi: 0, siang: 0, sore: 0, jelangTidur: 0,
  };
  const domainTersentuh = new Set<DomainKeyIrama>();
  const hitungPerDomain: Record<string, number> = {};

  for (const hari of minggu.hari) {
    for (const blok of BLOK_URUTAN) {
      for (const item of hari.slot[blok]) {
        if (item.jenis === 'ajakMain') {
          jumlahAjakMain++;
          jumlahPerBlok[blok]++;
          if (item.domainKey) {
            domainTersentuh.add(item.domainKey);
            hitungPerDomain[item.domainKey] = (hitungPerDomain[item.domainKey] ?? 0) + 1;
          }
        } else {
          jumlahWawasan++;
          jumlahPerBlok[blok]++;
        }
      }
    }
  }

  const total = jumlahAjakMain + jumlahWawasan;

  const blokTeratas = BLOK_URUTAN.reduce<string | null>((best, blok) => {
    if (best === null) return blok;
    return jumlahPerBlok[blok] > jumlahPerBlok[best] ? blok : best;
  }, null);

  const waktuHidup = total > 0 && blokTeratas && jumlahPerBlok[blokTeratas] > 0
    ? LABEL_BLOK[blokTeratas as keyof typeof LABEL_BLOK]
    : null;

  let judulKartu: string;
  if (total === 0) {
    judulKartu = RINGKASAN_KOSONG_JUDUL;
  } else if (jumlahAjakMain === 0 && jumlahWawasan > 0) {
    judulKartu = RINGKASAN_BACAAN;
  } else {
    const entri = Object.entries(hitungPerDomain).sort((a, b) => b[1] - a[1]);
    const [topDomain, topJumlah] = entri[0] ?? [null, 0];
    const [, keduaJumlah] = entri[1] ?? [null, 0];
    const dominan = topDomain && topJumlah > keduaJumlah;
    judulKartu = dominan
      ? RINGKASAN_DOMINAN(NAMA_DOMAIN_RAMAH[topDomain as DomainKeyIrama])
      : RINGKASAN_BERAGAM;
  }

  return {
    jumlahAjakMain,
    jumlahWawasan,
    waktuHidup,
    domainTersentuh,
    judulKartu,
    kosong: total === 0,
  };
}

export default function RingkasanMinggu({ minggu, onBekalPress }: PropsRingkasanMinggu) {
  const r = hitungRingkasan(minggu);

  return (
    <section
      aria-labelledby="ringkasan-minggu-judul"
      style={{
        background: 'linear-gradient(135deg,#FCE3EE,#F6ECFB)',
        borderRadius: 28,
        padding: '24px 24px 22px',
        boxShadow: '0 14px 34px -26px rgba(90,50,70,.55)',
        overflow: 'hidden',
      }}
    >
      <h3
        id="ringkasan-minggu-judul"
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 24,
          fontWeight: 700,
          color: '#6E3B57',
          margin: '0 0 2px',
        }}
      >
        {JUDUL_RINGKASAN}
      </h3>

      <p
        style={{
          fontFamily: "'Shantell Sans', cursive, system-ui",
          fontSize: 20,
          fontWeight: 600,
          color: '#F06BA8',
          margin: '0 0 16px',
        }}
      >
        {r.judulKartu}
      </p>

      {r.kosong ? (
        <>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#A98DA0',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {RINGKASAN_KOSONG_ISI}
          </p>
          <button
            type="button"
            onClick={onBekalPress}
            style={{
              backgroundColor: '#F06BA8',
              color: '#FFF3E6',
              border: 'none',
              borderRadius: 99,
              padding: '8px 20px',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {RINGKASAN_KOSONG_TOMBOL}
          </button>
        </>
      ) : (
        <>
          {/* Tiga tile horizontal: label kiri, angka kanan */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <TileAngka
              label={TILE_AJAK_MAIN_LABEL}
              angka={r.jumlahAjakMain}
              satuan={TILE_AJAK_MAIN_SATUAN}
            />
            <TileAngka
              label={TILE_WAWASAN_LABEL}
              angka={r.jumlahWawasan}
              satuan={TILE_WAWASAN_SATUAN}
            />
            <TileWaktu
              label={TILE_WAKTU_LABEL}
              waktu={r.waktuHidup}
            />
          </div>

          {/* Chip domain yang tersentuh */}
          {r.domainTersentuh.size > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DOMAIN_URUTAN.filter(dk => r.domainTersentuh.has(dk)).map(dk => (
                <div
                  key={dk}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: 'rgba(255,255,255,.6)',
                    borderRadius: 99,
                    padding: '3px 10px',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: LATAR_DOMAIN[dk],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Nunito, system-ui, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#6E3B57',
                    }}
                  >
                    {LABEL_DOMAIN[dk]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TileAngka({ label, angka, satuan }: { label: string; angka: number; satuan: string }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,.75)',
        borderRadius: 18,
        padding: '16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          color: '#A98DA0',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          flexShrink: 1,
        }}
      >
        {label}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#6E3B57',
            lineHeight: 1,
          }}
        >
          {angka}
        </span>
        <span
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: '#A98DA0',
          }}
        >
          {satuan}
        </span>
      </span>
    </div>
  );
}

function TileWaktu({ label, waktu }: { label: string; waktu: string | null }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,.75)',
        borderRadius: 18,
        padding: '16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          color: '#A98DA0',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          flexShrink: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: waktu ? 17 : 28,
          fontWeight: 700,
          color: '#6E3B57',
          lineHeight: 1,
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        {waktu ?? '0'}
      </span>
    </div>
  );
}
