// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState, useMemo } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import { renderRichText } from '../beranda-usia/renderRichText';
import {
  disiramPada,
  derivedRiwayatSiram,
  tingkatMekar,
  TINGKAT_MAKS,
} from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';

// TODO: review Fitri
const COPY = {
  JUDUL: 'Kebiasaan baik hari ini',
  SUBJUDUL: 'Bunganya mekar tiap kebiasaan dirawat.', // TODO: review Fitri
  AJAKAN_KOSONG: 'Belum ada nilai yang ditanam. Pilih satu di Bekal.',
  CTA_KOSONG: 'Buka Bekal',
  BELUM_SIAP: (nilai: string) => `Kebiasaan untuk ${nilai} di usia ini sedang disiapkan.`,
  DILAKUKAN: (n: number) => `${n} dilakukan`,
  LABEL_ISTIRAHAT: 'Istirahat', // TODO: review Fitri
  LABEL_SEDANG_MEKAR: 'Sedang mekar', // TODO: review Fitri
  LABEL_MEKAR_PENUH: 'Mekar penuh', // TODO: review Fitri
  LABEL_SEDANG_DISIAPKAN: 'Sedang disiapkan', // TODO: review Fitri
};

/**
 * Kalau nilaiFokus <= ini, semua grup default terbuka.
 * Kalau lebih, semua default terlipat.
 */
const AMBANG_LIPAT_OTOMATIS = 4;

const RADIUS_KELOPAK = '70% 70% 70% 4px';

// TODO: review Fitri — token warna per nilai, dari desain Langit Peony
const TOKEN_NILAI: Record<string, { soft: string; ink: string; accent: string }> = {
  'syukur':       { soft: '#FFF6DC', ink: '#B98900', accent: '#E0A21F' },
  'kemandirian':  { soft: '#FDEEDD', ink: '#C1741B', accent: '#E0872B' },
  'keberanian':   { soft: '#FCE3EE', ink: '#E0428A', accent: '#F06BA8' },
  'kejujuran':    { soft: '#E7EEFC', ink: '#4A6BD6', accent: '#5F84E6' },
  'kasih-sayang': { soft: '#F1ECFB', ink: '#8A6DC7', accent: '#A98CDD' },
};
const TOKEN_DEFAULT = { soft: '#F3EDFC', ink: '#8A6DC7', accent: '#A98CDD' };

// ─── Ikon bunga mini di header grup ──────────────────────────────────────────

function BungaMini({ warna, mekar }: { warna: string; mekar: number }) {
  const fraksi = mekar / TINGKAT_MAKS;
  const ukuran = Math.round(10 + fraksi * 16); // 10px–26px
  const opacity = mekar === 0 ? 0.14 : 0.32 + fraksi * 0.68;
  return (
    <div
      style={{
        width: 26,
        height: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: ukuran,
          height: ukuran,
          borderRadius: RADIUS_KELOPAK,
          backgroundColor: warna,
          opacity,
        }}
      />
    </div>
  );
}

// ─── Satu butir sikap ─────────────────────────────────────────────────────────

interface PropsButir {
  butir: ItemSikap;
  nilai: NilaiAkar;
  accent: string;
  disiram: boolean;
  onToggle: () => void;
  sapaan: SapaanSet;
}

function ButirSikap({ butir, nilai, accent, disiram, onToggle, sapaan }: PropsButir) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={disiram}
      aria-label={`${nilai}, ${butir.judul}`}
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        /* area sentuh minimal 44px — chip mungkin lebih pendek secara visual */
        minHeight: 44,
        padding: '7px 13px 7px 8px',
        borderRadius: 999,
        background: disiram ? accent + '22' : '#ffffff',
        border: `1.5px solid ${disiram ? accent : 'rgba(110,59,87,.12)'}`,
        cursor: 'pointer',
        transition: 'background .18s ease, border-color .18s ease',
        textAlign: 'left',
        userSelect: 'none',
      }}
    >
      {/* Lingkaran centang — bentuk berubah antara tercentang dan tidak */}
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: disiram ? accent : 'transparent',
          border: `1.5px solid ${disiram ? accent : 'rgba(110,59,87,.28)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {disiram && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {/* Teks #6E3B57 di kedua state — kontras aman pada bg putih maupun tinted */}
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.15,
          color: '#6E3B57',
        }}
      >
        {renderRichText(butir.judul, sapaan)}
      </span>
    </button>
  );
}

// ─── Satu grup nilai ──────────────────────────────────────────────────────────

interface PropsGrupNilai {
  nilai: NilaiAkar;
  butirList: ItemSikap[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  mekarLevel: number;
  defaultBuka: boolean;
  sapaan: SapaanSet;
  onToggleButir: (nilaiId: NilaiAkar, butirId: string) => void;
}

function GrupNilai({
  nilai,
  butirList,
  centangKebiasaan,
  tanggalHariIni,
  mekarLevel,
  defaultBuka,
  sapaan,
  onToggleButir,
}: PropsGrupNilai) {
  const [buka, setBuka] = useState(defaultBuka);

  const bunga = REGISTRY_BUNGA.find(b => b.nama === nilai);
  const warna = bunga?.warnaPetal ?? '#C9B8F0';
  const token = TOKEN_NILAI[nilai] ?? TOKEN_DEFAULT;

  const jumlahCentang = butirList.filter(b =>
    (centangKebiasaan[tanggalHariIni]?.[nilai] ?? []).includes(b.id),
  ).length;

  const idHeader = `grup-nilai-${nilai.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div style={{ borderTop: '1px solid rgba(110,59,87,.09)' }}>
      {/* Header grup */}
      <button
        type="button"
        aria-expanded={buka}
        aria-controls={idHeader + '-isi'}
        onClick={() => setBuka(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 0 10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <BungaMini warna={warna} mekar={mekarLevel} />
        <span
          style={{
            flex: 1,
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#6E3B57',
          }}
        >
          {nilai}
        </span>
        {jumlahCentang > 0 && (
          <span
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 11.5,
              fontWeight: 700,
              color: warna === '#FFE29A' ? '#8A5A14' : '#6E3B57',
              backgroundColor: warna + '28',
              borderRadius: 999,
              padding: '3px 10px',
              flexShrink: 0,
            }}
          >
            {COPY.DILAKUKAN(jumlahCentang)}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            transform: buka ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            color: '#B98FAD',
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Isi grup */}
      <div
        id={idHeader + '-isi'}
        role="group"
        aria-label={`Kebiasaan untuk nilai ${nilai}`}
        style={{ display: buka ? undefined : 'none', paddingBottom: 4 }}
      >
        {butirList.length === 0 ? (
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#A98DA0',
              padding: '4px 0 12px',
            }}
          >
            {COPY.BELUM_SIAP(nilai)}
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 4 }}>
            {butirList.map(butir => (
              <ButirSikap
                key={butir.id}
                butir={butir}
                nilai={nilai}
                accent={token.accent}
                disiram={(centangKebiasaan[tanggalHariIni]?.[nilai] ?? []).includes(butir.id)}
                onToggle={() => onToggleButir(nilai, butir.id)}
                sapaan={sapaan}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export interface PropsKartuKebiasaanBaik {
  nilaiFokus: readonly NilaiAkar[];
  usiaBulan: number;
  katalogSikap: readonly ItemSikap[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  sapaan: SapaanSet;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
}

export default function KartuKebiasaanBaik({
  nilaiFokus,
  usiaBulan,
  katalogSikap,
  centangKebiasaan,
  tanggalHariIni,
  sapaan,
  onCentangToggle,
  onBekal,
}: PropsKartuKebiasaanBaik) {
  const riwayatPerNilai = useMemo(() => {
    const derived = derivedRiwayatSiram(centangKebiasaan);
    const allDates = Object.keys(centangKebiasaan).sort();
    const result = new Map<NilaiAkar, number>();
    for (const nilai of nilaiFokus) {
      const riwayat = allDates.map(tgl => (derived[tgl] ?? []).includes(nilai));
      const levels = tingkatMekar(riwayat);
      result.set(nilai, levels[levels.length - 1] ?? 0);
    }
    return result;
  }, [centangKebiasaan, nilaiFokus]);

  const butirPerNilai = useMemo(() => {
    const map = new Map<NilaiAkar, ItemSikap[]>();
    for (const nilai of nilaiFokus) {
      map.set(nilai, resolveSikap(usiaBulan, [nilai], katalogSikap));
    }
    return map;
  }, [nilaiFokus, usiaBulan, katalogSikap]);

  const defaultBuka = nilaiFokus.length <= AMBANG_LIPAT_OTOMATIS;

  if (nilaiFokus.length === 0) {
    return (
      <section
        aria-labelledby="kartu-kebiasaan-baik-judul"
        style={{
          background: 'white',
          borderRadius: 26,
          padding: '22px 26px',
          boxShadow: '0 20px 40px -26px rgba(90,50,70,.55)',
        }}
      >
        <h3
          id="kartu-kebiasaan-baik-judul"
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#6E3B57',
            margin: '0 0 8px',
          }}
        >
          {COPY.JUDUL}
        </h3>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            color: '#8A7080',
            marginBottom: 14,
          }}
        >
          {COPY.AJAKAN_KOSONG}
        </p>
        <button
          type="button"
          onClick={onBekal}
          style={{
            background: '#F06BA8',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '8px 20px',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {COPY.CTA_KOSONG}
        </button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="kartu-kebiasaan-baik-judul"
      style={{
        background: 'white',
        borderRadius: 26,
        padding: '22px 26px 16px',
        boxShadow: '0 20px 40px -26px rgba(90,50,70,.55)',
      }}
    >
      <h3
        id="kartu-kebiasaan-baik-judul"
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          color: '#6E3B57',
          margin: '0 0 2px',
        }}
      >
        {COPY.JUDUL}
      </h3>

      {nilaiFokus.map(nilai => (
        <GrupNilai
          key={nilai}
          nilai={nilai}
          butirList={butirPerNilai.get(nilai) ?? []}
          centangKebiasaan={centangKebiasaan}
          tanggalHariIni={tanggalHariIni}
          mekarLevel={riwayatPerNilai.get(nilai) ?? 0}
          defaultBuka={defaultBuka}
          sapaan={sapaan}
          onToggleButir={onCentangToggle}
        />
      ))}
    </section>
  );
}
