// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState, useMemo } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import { renderRichText } from '../beranda-usia/renderRichText';
import {
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
  PILL_DIRAWAT: (done: number, total: number) => `${done} dari ${total} dirawat`, // TODO: review Fitri
  LABEL_ISTIRAHAT: 'Istirahat', // TODO: review Fitri
  LABEL_SEDANG_MEKAR: 'Sedang mekar', // TODO: review Fitri
  LABEL_MEKAR_PENUH: 'Mekar penuh', // TODO: review Fitri
  LABEL_SEDANG_DISIAPKAN: 'Sedang disiapkan', // TODO: review Fitri
};

const AMBANG_LIPAT_OTOMATIS = 4;

// TODO: review Fitri — token warna per nilai, dari desain Langit Peony
const TOKEN_NILAI: Record<string, { soft: string; ink: string; accent: string }> = {
  'syukur':       { soft: '#FFF6DC', ink: '#B98900', accent: '#E0A21F' },
  'kemandirian':  { soft: '#FDEEDD', ink: '#C1741B', accent: '#E0872B' },
  'keberanian':   { soft: '#FCE3EE', ink: '#E0428A', accent: '#F06BA8' },
  'kejujuran':    { soft: '#E7EEFC', ink: '#4A6BD6', accent: '#5F84E6' },
  'kasih-sayang': { soft: '#F1ECFB', ink: '#8A6DC7', accent: '#A98CDD' },
};
const TOKEN_DEFAULT = { soft: '#F3EDFC', ink: '#8A6DC7', accent: '#A98CDD' };

// ─── Bunga SVG parametrik ─────────────────────────────────────────────────────
// Diturunkan dari Bunga.dc.html dalam design handoff Kebiasaan Baik Hari Ini

const _K = 0.2; // karakter kelopak (STRENGTH)

function _pBulat(w: number, l: number): string {
  const W = w * (1 + 0.12 * _K);
  return `M0 0 C ${-W} ${-0.15*l} ${-W} ${-0.85*l} 0 ${-l} C ${W} ${-0.85*l} ${W} ${-0.15*l} 0 0 Z`;
}
function _pLancip(w: number, l: number): string {
  const W = w * (0.96 + 0.06 * _K);
  const tip = 0.70 - 0.10 * _K;
  return `M0 0 C ${-W} ${-0.34*l} ${-W*tip} ${-0.94*l} 0 ${-l} C ${W*tip} ${-0.94*l} ${W} ${-0.34*l} 0 0 Z`;
}
function _pHati(w: number, l: number): string {
  const W = w * (1.06 + 0.12 * _K);
  const notch = (0.24 + 0.18 * _K) * l;
  const dip = -(l - notch);
  return (
    `M0 0 C ${-W} ${-0.26*l} ${-W*1.04} ${-0.88*l} ${-W*0.52} ${-l} ` +
    `C ${-W*0.32} ${-l-3} ${-W*0.06} ${dip} 0 ${dip} ` +
    `C ${W*0.06} ${dip} ${W*0.32} ${-l-3} ${W*0.52} ${-l} ` +
    `C ${W*1.04} ${-0.88*l} ${W} ${-0.26*l} 0 0 Z`
  );
}
function _pPita(w: number, l: number): string {
  const W = w * (0.56 - 0.12 * _K);
  return `M0 0 C ${-W} ${-0.08*l} ${-W} ${-0.9*l} 0 ${-l} C ${W} ${-0.9*l} ${W} ${-0.08*l} 0 0 Z`;
}

type _Bentuk = 'bulat' | 'lancip' | 'hati' | 'pita';
const _BASE: Record<_Bentuk, [number, number]> = {
  bulat:  [26, 46],
  lancip: [15, 55],
  hati:   [24, 45],
  pita:   [19, 57],
};

interface _BungaSpec { ch: _Bentuk; n: number; color: string; center: string; hi: string; }

// TODO: review Fitri — spesifikasi bunga per-nilai, dari Bunga.dc.html
// Warna kelopak dihitung dari tabel combos di Bunga.dc.html (C = palet Langit Peony).
const BUNGA_SPEC: Record<string, _BungaSpec> = {
  'syukur':       { ch:'hati',   n:6, color:'#FFE29A', center:'#F06BA8', hi:'#FFF3E6' },
  'kemandirian':  { ch:'lancip', n:6, color:'#FFE29A', center:'#F06BA8', hi:'#FFF3E6' },
  'keberanian':   { ch:'hati',   n:9, color:'#F06BA8', center:'#FFE29A', hi:'#FFF3E6' },
  'kejujuran':    { ch:'lancip', n:4, color:'#5F84E6', center:'#FFE29A', hi:'#FFF3E6' },
  'kasih-sayang': { ch:'hati',   n:5, color:'#C9B8F0', center:'#FFE29A', hi:'#FFF3E6' },
};
const BUNGA_SPEC_DEFAULT = BUNGA_SPEC['kasih-sayang'];

function BungaSVG({ nilai, mekar, ukuran }: { nilai: string; mekar: number; ukuran: number }) {
  const spec = BUNGA_SPEC[nilai] ?? BUNGA_SPEC_DEFAULT;
  const n = spec.n;
  // mekar < 0 = penuh; else clamp 0..n
  const lit = mekar < 0 ? n : Math.max(0, Math.min(n, Math.round(mekar)));
  const anyLit = lit > 0;

  const [baseW, baseL] = _BASE[spec.ch];
  const wS = baseW * (6 / (n + 3));

  const petalD =
    spec.ch === 'bulat'  ? _pBulat(wS, baseL)  :
    spec.ch === 'lancip' ? _pLancip(wS, baseL) :
    spec.ch === 'hati'   ? _pHati(wS, baseL)   :
    _pPita(wS, baseL);

  const rOuter = wS * 0.5 + 6;
  const rInner = wS * 0.27 + 2.6;

  return (
    <svg
      viewBox="-74 -74 148 148"
      width={ukuran}
      height={ukuran}
      role="img"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={petalD}
          fill={spec.color}
          opacity={i < lit ? 1 : 0.5}
          transform={`rotate(${((i * 360) / n).toFixed(2)})`}
        />
      ))}
      <circle cx={0} cy={0} r={rOuter} fill={spec.center} opacity={anyLit ? 1 : 0.62} />
      <circle cx={0} cy={0} r={rInner} fill={spec.hi} opacity={anyLit ? 1 : 0.62} />
    </svg>
  );
}

// ─── Bunga dalam lingkaran putih (badge 46px di header grup) ─────────────────

function BungaMini({ nilai, mekarLevel }: { nilai: string; mekarLevel: number }) {
  const spec = BUNGA_SPEC[nilai] ?? BUNGA_SPEC_DEFAULT;
  // Petakan tingkat streak (0-7) ke jumlah kelopak menyala secara proporsional
  const lit = mekarLevel === 0 ? 0 : Math.max(1, Math.round((mekarLevel / TINGKAT_MAKS) * spec.n));
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 7px 16px -11px rgba(90,50,70,.6)',
      }}
    >
      <BungaSVG nilai={nilai} mekar={lit} ukuran={34} />
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
        minHeight: 44,
        padding: '7px 13px 7px 8px',
        borderRadius: 999,
        background: disiram ? accent : '#ffffff',
        border: `1.5px solid ${disiram ? accent : 'rgba(110,59,87,.12)'}`,
        cursor: 'pointer',
        transition: 'background .18s ease, border-color .18s ease',
        textAlign: 'left',
        userSelect: 'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: disiram ? '#ffffff' : 'transparent',
          border: `1.5px solid ${disiram ? '#ffffff' : 'rgba(110,59,87,.28)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {disiram && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.15,
          color: disiram ? '#ffffff' : '#6E3B57',
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

  const token = TOKEN_NILAI[nilai] ?? TOKEN_DEFAULT;
  const total = butirList.length;
  const jumlahCentang = butirList.filter(b =>
    (centangKebiasaan[tanggalHariIni]?.[nilai] ?? []).includes(b.id),
  ).length;

  const idHeader = `grup-nilai-${nilai.replace(/\s+/g, '-').toLowerCase()}`;

  // Label mekar berdasarkan centang hari ini — murni tampilan // TODO: review Fitri
  const stateLabel =
    total === 0           ? COPY.LABEL_SEDANG_DISIAPKAN :
    jumlahCentang === 0   ? COPY.LABEL_ISTIRAHAT        :
    jumlahCentang === total ? COPY.LABEL_MEKAR_PENUH    :
    COPY.LABEL_SEDANG_MEKAR;

  return (
    <div
      style={{
        background: token.soft,
        borderRadius: 22,
        padding: '16px 16px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
      }}
    >
      {/* Header: toggle accordion */}
      <button
        type="button"
        aria-expanded={buka}
        aria-controls={idHeader + '-isi'}
        onClick={() => setBuka(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
        }}
      >
        <BungaMini nilai={nilai} mekarLevel={mekarLevel} />
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 17,
              color: '#6E3B57',
              lineHeight: 1.1,
            }}
          >
            {nilai}
          </div>
          <div
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              color: token.ink,
              marginTop: 1,
            }}
          >
            {stateLabel}
          </div>
        </div>
        {total > 0 && (
          <span
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12.5,
              fontWeight: 800,
              color: token.ink,
              background: '#fff',
              padding: '4px 11px',
              borderRadius: 999,
              flexShrink: 0,
            }}
          >
            {jumlahCentang}/{total}
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
            color: token.ink,
            opacity: 0.55,
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
        style={{ display: buka ? undefined : 'none' }}
      >
        {total === 0 ? (
          /* Kotak "sedang disiapkan" — white rounded box per desain */
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '11px 13px',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              lineHeight: 1.5,
              color: token.ink,
              opacity: 0.85,
            }}
          >
            {COPY.BELUM_SIAP(nilai)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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

  // Total centang hari ini untuk pill header
  const { totDone, totAll } = useMemo(() => {
    let totDone = 0, totAll = 0;
    for (const nilai of nilaiFokus) {
      const bl = butirPerNilai.get(nilai) ?? [];
      if (bl.length === 0) continue;
      totAll += bl.length;
      totDone += bl.filter(b =>
        (centangKebiasaan[tanggalHariIni]?.[nilai] ?? []).includes(b.id),
      ).length;
    }
    return { totDone, totAll };
  }, [nilaiFokus, butirPerNilai, centangKebiasaan, tanggalHariIni]);

  const defaultBuka = nilaiFokus.length <= AMBANG_LIPAT_OTOMATIS;

  const STYLE_KARTU_LUAR = {
    background: 'white',
    borderRadius: 30,
    padding: '26px 30px 28px',
    boxShadow: '0 18px 40px -30px rgba(90,50,70,.55)',
  } as const;

  // Header kartu: judul kiri + pill counter kanan
  const HEADER_NODE = (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <h3
          id="kartu-kebiasaan-baik-judul"
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: '#6E3B57',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {COPY.JUDUL}
        </h3>
        <div
          style={{
            fontFamily: "'Shantell Sans', cursive, system-ui",
            fontWeight: 600,
            fontSize: 16,
            color: '#F06BA8',
            marginTop: 3,
          }}
        >
          {COPY.SUBJUDUL}
        </div>
      </div>
      {/* Pill overall: hanya tampil saat ada nilai dengan item */}
      {totAll > 0 && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            background: '#FFF7EE',
            borderRadius: 999,
            padding: '8px 15px',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 30, height: 30, flexShrink: 0 }}>
            <BungaSVG nilai="kasih-sayang" mekar={-1} ukuran={30} />
          </div>
          <span
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              color: '#B98900',
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.PILL_DIRAWAT(totDone, totAll)}
          </span>
        </div>
      )}
    </div>
  );

  if (nilaiFokus.length === 0) {
    return (
      <section aria-labelledby="kartu-kebiasaan-baik-judul" style={STYLE_KARTU_LUAR}>
        {HEADER_NODE}
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            color: '#8A7080',
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {COPY.AJAKAN_KOSONG}
        </p>
        <button
          type="button"
          onClick={onBekal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            background: '#F06BA8',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '0 22px',
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
    <section aria-labelledby="kartu-kebiasaan-baik-judul" style={STYLE_KARTU_LUAR}>
      {HEADER_NODE}

      {/* Grid 3 kolom sesuai desain handoff — TODO: ganti ke 2 jika tampak sempit di mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
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
      </div>
    </section>
  );
}
