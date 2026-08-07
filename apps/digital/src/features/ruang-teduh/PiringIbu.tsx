import React from 'react';
import type { SubTahapRuangTeduh } from './types';
import {
  KELOMPOK_GIZI,
  SUPLEMEN_HARIAN,
  TARGET_AIR_PER_SUBTAHAP,
  judulPiring,
} from './content';
import { usePenyimpanan, useCatatanHari } from './penyimpanan/PenyimpananProvider';

interface PropsPiringIbu {
  subTahap: SubTahapRuangTeduh;
  hariIni: string;
}

// ─── Penanda porsi berbentuk petal ───────────────────────────────────────────

function PenandaPorsi({
  aktif,
  onKlik,
  ariaLabel,
}: {
  aktif: boolean;
  onKlik: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-label={ariaLabel}
      aria-pressed={aktif}
      style={{
        width: 18,
        height: 18,
        borderRadius: '70% 70% 70% 4px',
        background: aktif ? '#E0526B' : '#EDE0E8',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 140ms ease',
      }}
    />
  );
}

// ─── Kartu kelompok gizi ──────────────────────────────────────────────────────

function KartuKelompokGizi({
  kelompok,
  terisi,
  onUbah,
}: {
  kelompok: (typeof KELOMPOK_GIZI)[number];
  terisi: number;
  onUbah: (n: number) => void;
}) {
  function handleKlik(indeks: number) {
    // Klik ke-n → isi 1..n. Klik yang sudah aktif → isi sampai n-1 (kurangi dari posisi itu)
    if (indeks + 1 <= terisi && indeks + 1 === terisi) {
      onUbah(indeks);
    } else {
      onUbah(indeks + 1);
    }
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '14px 14px 12px',
        border: '1px solid rgba(224,82,107,.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#3A2530',
          margin: 0,
        }}
      >
        {kelompok.nama}
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#A98DA0',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {kelompok.padananRumahTangga}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          marginTop: 2,
        }}
      >
        {Array.from({ length: kelompok.porsiHarian }, (_, i) => (
          <PenandaPorsi
            key={i}
            aktif={i < terisi}
            onKlik={() => handleKlik(i)}
            ariaLabel={`${kelompok.nama} porsi ${i + 1}`}
          />
        ))}
      </div>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: 0,
        }}
      >
        KIA hal. {kelompok.sumberHalamanKIA}
      </p>
    </div>
  );
}

// ─── Baris gelas air ─────────────────────────────────────────────────────────

function BarisAir({
  target,
  terisi,
  onUbah,
}: {
  target: number;
  terisi: number;
  onUbah: (n: number) => void;
}) {
  function handleKlik(indeks: number) {
    if (indeks + 1 <= terisi && indeks + 1 === terisi) {
      onUbah(indeks);
    } else {
      onUbah(indeks + 1);
    }
  }

  return (
    <div
      style={{
        background: '#EEF6FB',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5B9DC8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M12 2C8.5 8 6 12.5 6 16a6 6 0 0 0 12 0c0-3.5-2.5-8-6-14z" />
      </svg>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#3A5878',
            margin: '0 0 6px',
          }}
        >
          Air putih
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {Array.from({ length: target }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleKlik(i)}
              aria-label={`Gelas air ${i + 1}`}
              aria-pressed={i < terisi}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: i < terisi ? '#5B9DC8' : '#C5DDED',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                transition: 'background 140ms ease',
              }}
            />
          ))}
        </div>
      </div>

      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          color: '#5B9DC8',
          flexShrink: 0,
        }}
      >
        {terisi}/{target} gelas
      </span>
    </div>
  );
}

// ─── PiringIbu ────────────────────────────────────────────────────────────────

export default function PiringIbu({ subTahap, hariIni }: PropsPiringIbu) {
  const { caregiverId } = usePenyimpanan();
  const { catatan, simpan } = useCatatanHari(caregiverId, hariIni);

  const porsiTerisi  = catatan?.porsi    ?? {};
  const gelasTerisi  = catatan?.gelasAir ?? 0;
  const suplemenAktif = catatan?.suplemen ?? {};

  const targetAir = TARGET_AIR_PER_SUBTAHAP[subTahap];

  const totalPorsi  = KELOMPOK_GIZI.reduce((s, k) => s + k.porsiHarian, 0);
  const terisiTotal = Object.values(porsiTerisi).reduce((s, v) => s + v, 0);
  const persen      = totalPorsi > 0 ? Math.round((terisiTotal / totalPorsi) * 100) : 0;

  function ubahPorsi(id: string, n: number) {
    // Sertakan seluruh porsi lama agar field kelompok lain tidak hilang
    simpan({ porsi: { ...porsiTerisi, [id]: n } });
  }

  function setGelasTerisi(n: number) {
    simpan({ gelasAir: n });
  }

  function toggleSuplemen(id: string) {
    const aktifSaat = suplemenAktif[id] ?? false;
    simpan({ suplemen: { ...suplemenAktif, [id]: !aktifSaat } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Judul dinamis */}
      <div>
        <h2
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 4px',
          }}
        >
          {judulPiring(persen)}
        </h2>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: '#EDE0E8',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${persen}%`,
              borderRadius: 999,
              background: '#E0526B',
              transition: 'width 200ms ease',
            }}
            aria-hidden="true"
          />
        </div>
        <p
          aria-live="polite"
          aria-label={`${persen} persen piring terisi`}
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 0,
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
          }}
        >
          {persen} persen piring terisi
        </p>
      </div>

      {/* Grid kelompok gizi: 4 kolom lebar, 2 kolom sempit */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {KELOMPOK_GIZI.map(k => (
          <KartuKelompokGizi
            key={k.id}
            kelompok={k}
            terisi={porsiTerisi[k.id] ?? 0}
            onUbah={n => ubahPorsi(k.id, n)}
          />
        ))}
      </div>

      {/* Baris air */}
      <BarisAir
        target={targetAir}
        terisi={gelasTerisi}
        onUbah={n => setGelasTerisi(n)}
      />

      {/* Suplemen */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '16px 16px 14px',
          border: '1px solid rgba(224,82,107,.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#3A2530',
            margin: 0,
          }}
        >
          Suplemen hari ini
        </p>

        {SUPLEMEN_HARIAN.map(s => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <button
              type="button"
              role="switch"
              aria-checked={suplemenAktif[s.id] ?? false}
              aria-label={s.nama}
              onClick={() => toggleSuplemen(s.id)}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                background: suplemenAktif[s.id] ? '#E0526B' : '#EDE0E8',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
                transition: 'background 160ms ease',
                marginTop: 2,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: suplemenAktif[s.id] ? 19 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 160ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }}
              />
            </button>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#3A2530',
                  margin: '0 0 2px',
                }}
              >
                {s.nama}
              </p>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 12,
                  color: '#8A7A80',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {s.keterangan}
              </p>
              {s.sumberHalamanKIA && (
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 11,
                    color: '#C0A6B7',
                    margin: '2px 0 0',
                  }}
                >
                  KIA hal. {s.sumberHalamanKIA}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
