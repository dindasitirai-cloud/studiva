// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BekalId } from '../beranda-usia/bekal';
import type { NilaiAkar } from '../akar-keluarga/content';
import { NILAI, PENJELASAN_NILAI } from '../akar-keluarga/content';
import type { ProfilAnak } from '../beranda-usia/resolveTahap';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { renderRichText } from '../beranda-usia/renderRichText';
import { resolveTahapAktif } from '../beranda-usia/resolveTahap';
import { rakitBekal } from '../beranda-usia/adapter/rakitBekal';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import KnowledgeGallery from '../../pages/DashboardPages/Tier2/KnowledgeGallery';
import type { KnowledgeCard } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import FilterSubUsia, { resolveSubUsia, OPSI_SUB_USIA } from '../../components/FilterSubUsia';
import type { IdSubUsia } from '../../components/FilterSubUsia';
import JadwalKeKelola from '../irama-hari/JadwalKeKelola';
import type { JadwalItem } from '../../components/PopupPilihHari';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { useAnakAktif } from '../../context/AnakContext';
import { tambahKustomKeTanggal } from '../../lib/supabase/rekah';
import { journeyUntukKebiasaan } from '../temani/temaniSeed';
import {
  ActivityCard, ActivityModal,
  ToolCard, ToolModal,
  DownloadCard, DownloadModal,
} from '../../pages/DashboardPages/Tier2/LearningStrategiesTier2';
import type { Activity, EduTool, Downloadable } from '../../data/learningStrategies';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import {
  DRAF_BANNER,
  JUDUL_BEKAL,
  LAYAR_BELUM_LAHIR,
  LAYAR_DATA_BELUM_DIISI,
  LAYAR_KONTEN_BELUM_SIAP,
  LAYAR_MELEWATI_RENTANG,
  LABEL_TAB,
  HEADER_BEKAL,
  KEBIASAAN_BAIK,
  BEKAL_HEAD,
  BEKAL_FOOTER_TAB,
} from './content';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabId = 'kebiasaan-baik' | 'ajak-main' | 'wawasan-tumbuh';

interface PropsBekal {
  bekalId?: BekalId;
  nilaiFokus?: readonly NilaiAkar[];
  onTanamNilai?: (nilai: NilaiAkar) => void;
  onCabutNilai?: (nilai: NilaiAkar) => void;
  tabAwal?: TabId;
  // Nama dan tanggal lahir tidak lagi dioper lewat props.
  // Diambil dari AnakContext lewat useChildProfile.
}

// ─── Nilai palette — nilai-specific UI colors (data object, established exception) ─

const PAL: Record<NilaiAkar, { soft: string; ink: string }> = {
  'Kejujuran':          { soft: '#E6ECFC', ink: '#4A6BD6' },
  'Syukur':             { soft: '#FFF3D0', ink: '#B98900' },
  'Kasih Sayang':       { soft: '#F1ECFB', ink: '#8A6DC7' },
  'Empati':             { soft: '#FCE7F0', ink: '#D9639A' },
  'Kemandirian':        { soft: '#FFF3D0', ink: '#B98900' },
  'Tanggung Jawab':     { soft: '#F1ECFB', ink: '#8A6DC7' },
  'Kesederhanaan':      { soft: '#FCE3EE', ink: '#E0428A' },
  'Cinta Ilmu':         { soft: '#E4EFFD', ink: '#4A72D6' },
  'Sabar':              { soft: '#E4EFFD', ink: '#4A72D6' },
  'Berbagi':            { soft: '#E6ECFC', ink: '#4A6BD6' },
  'Keberanian':         { soft: '#FCE3EE', ink: '#E0428A' },
  'Hormat pada Sesama': { soft: '#FFF3D0', ink: '#B98900' },
};

const GREEN = { soft: '#E4F3E8', ink: '#2E8B57' };

// ─── Postage-stamp scallop mask ───────────────────────────────────────────────

const STAMP_MASK = [
  'radial-gradient(7px at 50% 0,#0000 98%,#000) 0 0/28px 100%',
  'radial-gradient(7px at 50% 100%,#0000 98%,#000) 0 0/28px 100%',
  'radial-gradient(7px at 0 50%,#0000 98%,#000) 0 0/100% 28px',
  'radial-gradient(7px at 100% 50%,#0000 98%,#000) 0 0/100% 28px',
].join(',');

// ─── Scattered board layout constants ─────────────────────────────────────────

const COLS    = 6;
const CARD_W  = 252;
const STEP    = 161;
const INNER_W = 1080;
const OFFSET_X = Math.round((INNER_W - ((COLS - 1) * STEP + CARD_W)) / 2);
const ROW_BASE = [0, 340] as const;
const TOPS_P  = [22, 68, 6, 74, 28, 58] as const;
const ROTS_P  = [-4, 3, -3, 4, -2, 3] as const;
const DUR_P   = [6.4, 5.6, 7.2, 6, 6.8, 5.9] as const;
const BOARD_BG = [
  'radial-gradient(520px 320px at 12% 0%, rgba(248,185,212,.30), transparent 70%)',
  'radial-gradient(520px 320px at 88% 100%, rgba(143,184,247,.28), transparent 70%)',
  'radial-gradient(420px 260px at 55% 40%, rgba(255,226,154,.26), transparent 70%)',
  'linear-gradient(rgba(110,59,87,.055) 1px,transparent 1px) 0 0/48px 48px',
  'linear-gradient(90deg,rgba(110,59,87,.055) 1px,transparent 1px) 0 0/48px 48px',
  '#FFFBF4',
].join(',');

// ─── KartuItem ────────────────────────────────────────────────────────────────

interface KartuItem {
  nilai: NilaiAkar;
  name: string;
  desc: string;
  pill: { text: string; ink: string; soft: string };
  disc: string;
}

// ─── BungaMini — SVG flower from REGISTRY_BUNGA ──────────────────────────────

function BungaMini({
  warnaPetal, d, kelopak, r1, r2, c1, c2, ukuran = 52, pucat = false,
}: {
  warnaPetal: string; d: string; kelopak: number;
  r1: number; r2: number; c1: string; c2: string;
  ukuran?: number; pucat?: boolean;
}) {
  const step = 360 / kelopak;
  return (
    <svg viewBox="-74 -74 148 148" width={ukuran} height={ukuran} aria-hidden>
      {Array.from({ length: kelopak }, (_, i) => (
        <path
          key={i}
          d={d}
          fill={warnaPetal}
          opacity={pucat ? 0.25 : 0.9}
          transform={`rotate(${(i * step).toFixed(2)})`}
        />
      ))}
      <circle cx="0" cy="0" r={r1} fill={c1} opacity={pucat ? 0.4 : 1} />
      <circle cx="0" cy="0" r={r2} fill={c2} opacity={pucat ? 0.4 : 1} />
    </svg>
  );
}

// ─── BotanicalDeco — SVG botanical decoration ─────────────────────────────────

function BotanicalDeco({
  type,
  bloom = '#F06BA8',
  bloom2 = '#F8B9D4',
  center = '#6E3B57',
}: {
  type: 'tulip' | 'daisy' | 'bell' | 'fivepetal';
  bloom?: string;
  bloom2?: string;
  center?: string;
}) {
  const stemClr = '#6F9E3F';
  const leafClr = '#A7C63E';
  const leaf2Clr = '#8FB84A';

  return (
    <svg
      viewBox="0 0 100 150"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      {type === 'tulip' && (
        <>
          <path d="M50 149 C49 118 50 98 50 82" fill="none" stroke={stemClr} strokeWidth={7} strokeLinecap="round" />
          <path d="M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z" fill={leafClr} />
          <path d="M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z" fill={leaf2Clr} />
          <path d="M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z" fill={bloom} />
          <path d="M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z" fill={bloom2} />
          <path d="M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z" fill={bloom} />
        </>
      )}
      {type === 'daisy' && (
        <>
          <path d="M50 149 C49 120 50 100 50 86" fill="none" stroke={stemClr} strokeWidth={7} strokeLinecap="round" />
          <path d="M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z" fill={leafClr} />
          <path d="M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z" fill={leaf2Clr} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 8;
            return (
              <circle
                key={i}
                cx={+(50 + 16 * Math.cos(a)).toFixed(1)}
                cy={+(56 + 16 * Math.sin(a)).toFixed(1)}
                r={8.5}
                fill={bloom}
              />
            );
          })}
          <circle cx={50} cy={56} r={10} fill={center} />
          <circle cx={50} cy={56} r={5} fill={bloom2} />
        </>
      )}
      {type === 'bell' && (
        <>
          <path d="M22 149 C40 140 52 122 44 100" fill="none" stroke={stemClr} strokeWidth={7} strokeLinecap="round" />
          <path d="M30 138 C16 134 10 120 14 108 C26 116 30 128 30 138 Z" fill={leafClr} />
          <path d="M40 118 C55 116 64 104 61 92 C49 100 44 110 40 118 Z" fill={leaf2Clr} />
          <path d="M44 92 C33 92 30 106 34 116 C37 123 51 123 54 116 C58 106 55 92 44 92 Z" fill={bloom} />
          <circle cx={44} cy={96} r={5} fill={bloom2} />
        </>
      )}
      {type === 'fivepetal' && (
        <>
          <path d="M64 149 C60 126 48 116 42 104" fill="none" stroke={stemClr} strokeWidth={7} strokeLinecap="round" />
          <path d="M58 132 C43 132 34 118 38 106 C50 114 55 123 58 132 Z" fill={leafClr} />
          {Array.from({ length: 5 }, (_, i) => {
            const a = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
            return (
              <circle
                key={i}
                cx={+(42 + 12 * Math.cos(a)).toFixed(1)}
                cy={+(96 + 12 * Math.sin(a)).toFixed(1)}
                r={9}
                fill={bloom}
              />
            );
          })}
          <circle cx={42} cy={96} r={5.5} fill={center} />
        </>
      )}
    </svg>
  );
}

// ─── SectionHead — eyebrow pill + H2 + sub (desain v2) ────────────────────────

function SectionHead({ judul, sub }: { judul: string; sub: string }) {
  return (
    <div>
      <span
        className="inline-block font-nunito font-[800] uppercase"
        style={{
          fontSize: 12.5, letterSpacing: '1.4px', color: '#C6407F',
          background: '#FCE3EE', padding: '6px 14px', borderRadius: 999,
        }}
      >
        BEKAL
      </span>
      <h2
        className="font-fredoka font-bold text-pekat"
        style={{ fontSize: 46, margin: '10px 0 0', letterSpacing: '-1px', lineHeight: 1.1 }}
      >
        {judul}
      </h2>
      <p
        className="mt-2.5 font-fredoka"
        style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, maxWidth: 1000, color: '#F06BA8' }}
      >
        {sub}
      </p>
    </div>
  );
}

// ─── FooterNote — catatan tulisan tangan per tab (desain v2) ──────────────────

function FooterNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-12 text-center font-shantell font-semibold"
      style={{ fontSize: 18, color: '#C7A9BE' }}
    >
      {children}
    </p>
  );
}

// ─── EmptyBox — kartu kosong bergaris (desain v2) ─────────────────────────────

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-center font-fredoka"
      style={{
        border: '2px dashed #F5C9DE', borderRadius: 24, padding: 44,
        fontSize: 20, fontWeight: 500, color: '#C7A9BE',
      }}
    >
      {children}
    </div>
  );
}

// ─── PopupDetailNilai ─────────────────────────────────────────────────────────

function PopupDetailNilai({
  nilai,
  sikapList,
  sudahDitanam,
  onTanam,
  onCabut,
  onTutup,
  onTambahRutinitas,
  onTemani,
}: {
  nilai: NilaiAkar;
  sikapList: ItemSikap[];
  sudahDitanam: boolean;
  onTanam: () => void;
  onCabut?: () => void;
  onTutup: () => void;
  onTambahRutinitas?: (s: ItemSikap) => Promise<void>;
  onTemani?: (s: ItemSikap) => void;
}) {
  const [statusRutin, setStatusRutin] = useState<Record<string, 'ok' | 'err'>>({});
  const info = PENJELASAN_NILAI[nilai];
  const bunga = BUNGA_DARI_NAMA.get(nilai);
  const pal = PAL[nilai];
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onTutup(); }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onTutup]);

  useEffect(() => { elRef.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(110,59,87,0.42)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        ref={elRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail nilai ${nilai}`}
        tabIndex={-1}
        className="w-full max-h-[84vh] overflow-y-auto bg-white focus:outline-none"
        style={{
          maxWidth: 560,
          borderRadius: 30,
          boxShadow: '0 40px 80px -40px rgba(90,50,70,.75)',
        }}
      >
        {/* Header berwarna */}
        <div className="relative" style={{ background: pal.soft, padding: '26px 28px 22px' }}>
          <div className="flex items-center gap-4">
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-full bg-white"
              style={{ width: 74, height: 74 }}
            >
              {bunga && (
                <BungaMini
                  warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                  r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2} ukuran={52}
                />
              )}
            </div>
            <div className="min-w-0 pr-8">
              <p
                className="font-nunito font-[800] uppercase"
                style={{ fontSize: 12, letterSpacing: '1.4px', color: pal.ink }}
              >
                {nilai}
              </p>
              <p
                className="font-fredoka font-semibold text-pekat"
                style={{ fontSize: 26, lineHeight: 1.2, marginTop: 2 }}
              >
                {info.tagline}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={KEBIASAAN_BAIK.tutup}
            onClick={onTutup}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[18px] text-pekat/60 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            style={{ background: 'rgba(255,255,255,.75)' }}
          >
            ✕
          </button>
        </div>

        {/* Isi */}
        <div className="flex flex-col gap-4" style={{ padding: '24px 28px 28px' }}>
          <p className="font-nunito font-semibold" style={{ fontSize: 15.5, lineHeight: 1.6, color: '#7A5E71' }}>
            {info.deskripsi}
          </p>

          <div style={{ background: '#FFFBF4', border: '1.5px solid #F2E4D2', borderRadius: 20, padding: '18px 20px' }}>
            <p className="mb-1.5 font-nunito font-[800] uppercase" style={{ fontSize: 11.5, letterSpacing: '.6px', color: '#A98DA0' }}>
              {KEBIASAAN_BAIK.kebiasaanLabel}
            </p>
            <p className="font-nunito font-semibold" style={{ fontSize: 14.5, lineHeight: 1.6, color: '#7A5E71' }}>
              {info.caraRawat}
            </p>
          </div>

          {sikapList.length > 0 ? (
            <div style={{ background: pal.soft, borderRadius: 20, padding: '18px 20px' }}>
              <p className="mb-3 font-nunito font-[800] uppercase" style={{ fontSize: 11.5, letterSpacing: '.6px', color: pal.ink }}>
                {KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length)}
              </p>
              <ul className="space-y-2.5">
                {sikapList.map(s => {
                  const kbId = s.kebiasaanId ?? s.id;
                  const adaJourney = !!journeyUntukKebiasaan(kbId);
                  return (
                    <li key={s.id} className="rounded-[14px] bg-white" style={{ padding: '12px 14px' }}>
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1.5 flex-shrink-0 rounded-full" style={{ width: 9, height: 9, background: pal.ink }} />
                        <span className="font-nunito font-bold" style={{ fontSize: 14.5, lineHeight: 1.4, color: '#6E3B57' }}>{s.judul}</span>
                      </div>
                      {(onTambahRutinitas || (onTemani && adaJourney)) && (
                        <div className="mt-2 flex flex-wrap gap-2 pl-[19px]">
                          {onTambahRutinitas && (
                            <button
                              type="button"
                              onClick={() => { void onTambahRutinitas(s).then(() => setStatusRutin(p => ({ ...p, [kbId]: 'ok' }))).catch(() => setStatusRutin(p => ({ ...p, [kbId]: 'err' }))); }}
                              className="rounded-full bg-rekah/10 px-3 py-1 font-nunito text-[11.5px] font-bold text-rekah transition hover:bg-rekah/20"
                            >
                              {statusRutin[kbId] === 'ok' ? '✓ Di rutinitas' : statusRutin[kbId] === 'err' ? 'Coba lagi' : '+ Rutinitas'}
                            </button>
                          )}
                          {onTemani && adaJourney && (
                            <button
                              type="button"
                              onClick={() => onTemani(s)}
                              className="rounded-full border border-rekah/30 px-3 py-1 font-nunito text-[11.5px] font-bold text-rekah transition hover:bg-rekah/10"
                            >
                              Mau ditemani?
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="rounded-[20px] text-center" style={{ background: pal.soft, padding: '18px 20px' }}>
              <p className="font-nunito font-semibold" style={{ fontSize: 14, color: '#7A5E71' }}>{KEBIASAAN_BAIK.sikapSedangDilengkapi}</p>
              <p className="mt-1 font-nunito" style={{ fontSize: 12.5, color: '#A98DA0' }}>{KEBIASAAN_BAIK.tetapBisaDitanam}</p>
            </div>
          )}

          {/* Aksi tanam */}
          {sudahDitanam ? (
            <div className="rounded-[16px] px-4 py-3 text-center" style={{ background: GREEN.soft }}>
              <p className="font-nunito font-bold" style={{ fontSize: 14, color: GREEN.ink }}>
                {KEBIASAAN_BAIK.sudahDiTaman}
              </p>
              {onCabut && (
                <button
                  type="button"
                  onClick={onCabut}
                  className="mt-2 font-nunito text-[12.5px] text-pekat/40 transition hover:text-pekat/70"
                >
                  {KEBIASAAN_BAIK.tombolCabut}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onTanam}
                className="min-h-[48px] flex-1 rounded-[16px] bg-rekah px-6 font-nunito text-[15px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                {KEBIASAAN_BAIK.tombolTanam(nilai)}
              </button>
              <button
                type="button"
                onClick={onTutup}
                className="min-h-[48px] rounded-[16px] px-6 font-nunito text-[15px] font-bold transition"
                style={{ background: '#F6EDE2', color: '#9B7E92' }}
              >
                Nanti saja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KartuBekal — single scattered card ──────────────────────────────────────

function KartuBekal({
  item,
  index,
  isStamp,
  rot,
  dur,
  onClick,
}: {
  item: KartuItem;
  index: number;
  isStamp: boolean;
  rot: number;
  dur: number;
  onClick?: () => void;
}) {
  const bunga = BUNGA_DARI_NAMA.get(item.nilai);

  return (
    <div
      style={{ animation: `cardIn .55s cubic-bezier(.2,.8,.25,1) ${(index * 0.05).toFixed(2)}s both` }}
    >
      <div
        style={{
          animation: `floatBob ${dur}s ease-in-out ${(index * 0.22).toFixed(2)}s infinite`,
          filter: isStamp ? 'drop-shadow(0 18px 20px rgba(90,50,70,.20))' : 'none',
        }}
      >
        <div
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          aria-label={onClick ? `${item.name} — ${item.pill.text}` : undefined}
          onClick={onClick}
          onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
          style={{
            background: '#fff',
            width: 252,
            padding: '24px 22px 22px',
            borderRadius: isStamp ? 10 : 22,
            boxShadow: isStamp ? 'none' : '0 20px 34px -22px rgba(90,50,70,.42)',
            WebkitMask: isStamp ? STAMP_MASK : undefined,
            WebkitMaskComposite: isStamp ? ('source-in' as React.CSSProperties['WebkitMaskComposite']) : undefined,
            mask: isStamp ? STAMP_MASK : undefined,
            maskComposite: isStamp ? ('intersect' as React.CSSProperties['maskComposite']) : undefined,
            transform: `rotate(${rot}deg)`,
            transition: 'transform .42s cubic-bezier(.2,.8,.25,1), box-shadow .42s ease',
            cursor: onClick ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: item.disc,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {bunga && (
              <BungaMini
                warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2}
                ukuran={50}
              />
            )}
          </div>
          <p
            className="font-fredoka font-bold text-pekat"
            style={{ fontSize: 22, marginTop: 18, letterSpacing: '-0.3px' }}
          >
            {item.name}
          </p>
          <p
            className="font-nunito font-semibold"
            style={{ fontSize: 14.5, lineHeight: 1.45, color: '#93798C', marginTop: 7, minHeight: 42 }}
          >
            {item.desc}
          </p>
          <span
            className="font-nunito font-[800]"
            style={{
              display: 'inline-flex', alignItems: 'center',
              marginTop: 16, fontSize: 12.5,
              color: item.pill.ink, background: item.pill.soft,
              padding: '7px 14px', borderRadius: 999,
            }}
          >
            {item.pill.text}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── PapanKartu — scattered (sm+, auto-scaled) + grid fallback (xs) ──────────

const BOARD_W = INNER_W + 120; // total design width of the board canvas

function PapanKartu({
  items,
  onCardClick,
}: {
  items: KartuItem[];
  onCardClick?: (nilai: NilaiAkar) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.min(1, w / BOARD_W));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rowsUsed = Math.ceil(items.length / COLS);
  const boardH = ROW_BASE[Math.min(rowsUsed - 1, ROW_BASE.length - 1)] + Math.max(...TOPS_P) + 340;

  return (
    <>
      {/* Scaled scattered board — sm and above */}
      <div
        ref={containerRef}
        className="relative mt-8 hidden sm:block"
        style={{
          height: boardH * scale,
          background: BOARD_BG,
          backgroundSize: 'auto, auto, auto, 48px 48px, 48px 48px, auto',
          borderRadius: 30,
          border: '2px dashed #F5C9DE',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BOARD_W,
            height: boardH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {items.map((item, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const left = Math.round(OFFSET_X + col * STEP);
            const top = ROW_BASE[Math.min(row, ROW_BASE.length - 1)] + TOPS_P[col] + 34;
            return (
              <div
                key={`${item.nilai}-${i}`}
                style={{ position: 'absolute', left, top, zIndex: i + 2, width: 252 }}
              >
                <KartuBekal
                  item={item}
                  index={i}
                  isStamp={i % 2 === 1}
                  rot={ROTS_P[col]}
                  dur={DUR_P[col]}
                  onClick={onCardClick ? () => onCardClick(item.nilai) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid fallback — below sm (mobile) */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
        {items.map((item, i) => {
          const bunga = BUNGA_DARI_NAMA.get(item.nilai);
          return (
            <button
              key={`${item.nilai}-${i}`}
              type="button"
              onClick={onCardClick ? () => onCardClick(item.nilai) : undefined}
              className="flex flex-col overflow-hidden rounded-[20px] bg-white text-left shadow-[0_2px_10px_rgba(240,107,168,0.10)] hover:shadow-[0_6px_20px_rgba(240,107,168,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah transition"
            >
              <div className="flex items-center justify-center bg-fajar py-4">
                {bunga && (
                  <BungaMini
                    warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                    r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2}
                    ukuran={48}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 px-3 py-3">
                <p className="font-bricolage text-[13px] font-bold leading-snug text-pekat">{item.name}</p>
                <p className="font-nunito text-[11px] leading-snug text-pekat/55">{item.desc}</p>
                <span
                  className="mt-1 self-start rounded-full px-2.5 py-1 font-nunito text-[10px] font-[800]"
                  style={{ color: item.pill.ink, background: item.pill.soft }}
                >
                  {item.pill.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function Bekal({
  nilaiFokus = [],
  onTanamNilai,
  onCabutNilai,
  tabAwal = 'kebiasaan-baik',
}: PropsBekal) {
  const { profile, sapaan, usiaBulan } = useChildProfile();
  const isDev = process.env.NODE_ENV !== 'production';

  const { bekal: bekalRakit, katalogSikap } = useMemo(() => rakitBekal(), []);

  const profilAnak = useMemo<ProfilAnak | null>(() => {
    if (!profile.tanggalLahir) return null;
    const tgl = new Date(profile.tanggalLahir);
    if (isNaN(tgl.getTime())) return null;
    return { tanggalLahir: tgl };
  }, [profile.tanggalLahir]);

  const statusTahap = useMemo(
    () => (profilAnak ? resolveTahapAktif(profilAnak, new Date()) : null),
    [profilAnak],
  );

  // ─── Edge cases ─────────────────────────────────────────────────────────────

  if (profilAnak === null || statusTahap === null) {
    return (
      <LayarEdge isDev={isDev}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_DATA_BELUM_DIISI.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_DATA_BELUM_DIISI.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'belumLahir') {
    return (
      <LayarEdge isDev={isDev}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_BELUM_LAHIR.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_BELUM_LAHIR.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'melewatiRentang') {
    return (
      <LayarEdge isDev={isDev}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_MELEWATI_RENTANG.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_MELEWATI_RENTANG.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'kontenBelumSiap') {
    return (
      <LayarEdge isDev={isDev}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_KONTEN_BELUM_SIAP.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_KONTEN_BELUM_SIAP.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  // ─── Status 'ok' ────────────────────────────────────────────────────────────

  const { hasil } = statusTahap;
  const usiaBulanOk = usiaBulan ?? hasil.usiaBulan;

  const bekalAktifPopulated = bekalRakit.find(b => b.id === hasil.bekal.id);
  if (!bekalAktifPopulated) {
    return (
      <LayarEdge isDev={isDev}>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_KONTEN_BELUM_SIAP.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  return (
    <IsiBekal
      nilaiFokus={nilaiFokus}
      usiaBulan={usiaBulanOk}
      katalogSikap={katalogSikap}
      onTanamNilai={onTanamNilai}
      onCabutNilai={onCabutNilai}
      tabAwal={tabAwal}
      namaDisplay={sapaan.low ?? undefined}
      isDev={isDev}
      bekalLabel={bekalAktifPopulated.label}
    />
  );
}

// ─── resolveAgeBand ──────────────────────────────────────────────────────────

interface AgeBand { ageIds: string[]; minBulan: number; maxBulan: number; }

function resolveAgeBand(usiaBulan: number): AgeBand {
  if (usiaBulan < 12)  return { ageIds: ['b03', 'b36', 'b69', 'b912'], minBulan: 0,  maxBulan: 12 };
  if (usiaBulan < 24)  return { ageIds: ['t1218', 't1824'],            minBulan: 12, maxBulan: 24 };
  if (usiaBulan < 36)  return { ageIds: ['u23'],                       minBulan: 24, maxBulan: 36 };
  if (usiaBulan < 48)  return { ageIds: ['u34'],                       minBulan: 36, maxBulan: 48 };
  if (usiaBulan < 60)  return { ageIds: ['u45'],                       minBulan: 48, maxBulan: 60 };
  return                        { ageIds: ['u56'],                       minBulan: 60, maxBulan: 72 };
}

// ─── AjakMainPanel ────────────────────────────────────────────────────────────

function AjakMainPanel({ usiaBulan }: { usiaBulan: number }) {
  const { publishedActivities, publishedTools, publishedDownloads } = useLearningStrategies();
  const { anak } = useAnakAktif();
  const [tabGrid, setTabGrid] = useState<'aktivitas' | 'alat' | 'unduhan'>('aktivitas');
  const [openActivity, setOpenActivity] = useState<Activity | null>(null);
  const [openTool, setOpenTool] = useState<EduTool | null>(null);
  const [openDownload, setOpenDownload] = useState<Downloadable | null>(null);
  const [jadwalItem, setJadwalItem] = useState<JadwalItem | null>(null);
  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);

  const isYearOne = usiaBulan < 12;
  const [subUsia, setSubUsia] = useState<IdSubUsia>(
    () => resolveSubUsia(usiaBulan),
  );

  const band = useMemo(() => resolveAgeBand(usiaBulan), [usiaBulan]);
  const ageIdSet = useMemo(() => new Set(band.ageIds), [band]);

  // Rentang bulan untuk sub tahap aktif (dipakai filter tools/unduhan)
  const subUsiaBand = useMemo(
    () => OPSI_SUB_USIA.find(o => o.id === subUsia) ?? OPSI_SUB_USIA[0],
    [subUsia],
  );

  const activities = useMemo(
    () => {
      const base = publishedActivities.filter(a => ageIdSet.has(a.ageId));
      if (!isYearOne) return base;
      return base.filter(a => a.ageId === subUsia);
    },
    [publishedActivities, ageIdSet, isYearOne, subUsia],
  );
  const tools = useMemo(
    () => {
      if (!isYearOne) {
        return publishedTools.filter(t => t.minBulan < band.maxBulan && t.maxBulan > band.minBulan);
      }
      return publishedTools.filter(t => t.minBulan < subUsiaBand.maxBulan && t.maxBulan > subUsiaBand.minBulan);
    },
    [publishedTools, band, isYearOne, subUsiaBand],
  );
  const downloads = useMemo(
    () => {
      if (!isYearOne) {
        return publishedDownloads.filter(d => d.minBulan < band.maxBulan && d.maxBulan > band.minBulan);
      }
      return publishedDownloads.filter(d => d.minBulan < subUsiaBand.maxBulan && d.maxBulan > subUsiaBand.minBulan);
    },
    [publishedDownloads, band, isYearOne, subUsiaBand],
  );

  const handleBukaJadwal = useCallback((itemId: string, label: string) => {
    setJadwalItem({ id: itemId, judul: label, tipe: 'kegiatan' });
  }, []);

  const TABS = [
    { id: 'aktivitas' as const, label: 'Aktivitas',    count: activities.length },
    { id: 'alat'      as const, label: 'Alat Edukasi', count: tools.length },
    { id: 'unduhan'   as const, label: 'Unduhan',      count: downloads.length },
  ];

  return (
    <>
      {jadwalItem && (
        <JadwalKeKelola
          judul={jadwalItem.judul}
          tipe="main"
          idAnak={anak.id}
          tanggalHariIni={tanggalHariIni}
          onTutup={() => setJadwalItem(null)}
        />
      )}

      {isYearOne && (
        <FilterSubUsia nilai={subUsia} onPilih={setSubUsia} />
      )}

      <div className="mb-5 flex flex-wrap items-center" style={{ gap: 26, borderBottom: '2px solid #F3E2EC' }}>
        {TABS.map(t => {
          const aktif = tabGrid === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTabGrid(t.id)}
              className="flex shrink-0 items-center gap-1.5 pb-2.5 font-nunito font-bold transition-all"
              style={{
                fontSize: 14,
                color: aktif ? '#C6407F' : '#9B7E92',
                borderBottom: aktif ? '3px solid #F06BA8' : '3px solid transparent',
                marginBottom: -2,
              }}>
              {t.label}
              <span className="rounded-full px-1.5 py-0.5 text-[11.5px] font-bold"
                style={aktif ? { background: '#FCE3EE', color: '#C6407F' } : { background: '#F6EDE2', color: '#9B7E92' }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tabGrid === 'aktivitas' && (
        activities.length === 0
          ? <EmptyBox>Belum ada isi untuk usia ini.</EmptyBox>
          : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map(a => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  onOpen={() => setOpenActivity(a)}
                  onJadwalkan={() => handleBukaJadwal(`ls-act-${a.id}`, a.judul)}
                />
              ))}
            </div>
      )}
      {tabGrid === 'alat' && (
        tools.length === 0
          ? <EmptyBox>Belum ada isi untuk usia ini.</EmptyBox>
          : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map(t => (
                <ToolCard
                  key={t.id}
                  tool={t}
                  onOpen={() => setOpenTool(t)}
                  onJadwalkan={() => handleBukaJadwal(`ls-tool-${t.id}`, t.nama)}
                />
              ))}
            </div>
      )}
      {tabGrid === 'unduhan' && (
        downloads.length === 0
          ? <EmptyBox>Belum ada isi untuk usia ini.</EmptyBox>
          : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {downloads.map(d => (
                <DownloadCard
                  key={d.id}
                  item={d}
                  onOpen={() => setOpenDownload(d)}
                  onJadwalkan={() => handleBukaJadwal(`ls-dl-${d.id}`, d.nama)}
                />
              ))}
            </div>
      )}

      {openActivity && (
        <ActivityModal
          activity={openActivity}
          onClose={() => setOpenActivity(null)}
          onJadwalkan={() => {
            handleBukaJadwal(`ls-act-${openActivity.id}`, openActivity.judul);
            setOpenActivity(null);
          }}
        />
      )}
      {openTool     && <ToolModal     tool={openTool}         onClose={() => setOpenTool(null)}     />}
      {openDownload && <DownloadModal item={openDownload}     onClose={() => setOpenDownload(null)} />}
    </>
  );
}

// ─── IsiBekal ─────────────────────────────────────────────────────────────────

interface PropsIsiBekal {
  nilaiFokus:    readonly NilaiAkar[];
  usiaBulan:     number;
  katalogSikap:  readonly ItemSikap[];
  onTanamNilai?: (nilai: NilaiAkar) => void;
  onCabutNilai?: (nilai: NilaiAkar) => void;
  tabAwal:       TabId;
  namaDisplay?:  string;
  isDev:         boolean;
  bekalLabel?:   string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'kebiasaan-baik', label: LABEL_TAB.kebiasaanBaik },
  { id: 'ajak-main',      label: LABEL_TAB.ajakMain },
  { id: 'wawasan-tumbuh', label: LABEL_TAB.wawasanTumbuh },
];

function IsiBekal({
  nilaiFokus,
  usiaBulan,
  katalogSikap,
  onTanamNilai,
  onCabutNilai,
  tabAwal,
  namaDisplay,
  isDev,
  bekalLabel,
}: PropsIsiBekal) {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState<TabId>(tabAwal);
  const [nilaiDibuka, setNilaiDibuka] = useState<NilaiAkar | null>(null);
  const [jadwalkanBuku, setJadwalkanBuku] = useState<KnowledgeCard | null>(null);
  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);
  const { anak } = useAnakAktif();
  const handleTambahRutinitas = useCallback(async (s: ItemSikap) => {
    const kbId = s.kebiasaanId ?? s.id;
    await tambahKustomKeTanggal(anak.id, tanggalHariIni, {
      id: `kebiasaan-${kbId}`, judul: s.judul, tipe: 'aktivitas', domain: 'sos',
      nilai: s.nilai, pemilik: 'anak', sumberId: `kebiasaan-${kbId}`, kustom: true,
      kategoriKustom: 'rencana', kebiasaanId: kbId, keteranganKapan: 'Dari Kebiasaan Baik',
    });
  }, [anak.id, tanggalHariIni]);
  const handleTemaniKb = useCallback((s: ItemSikap) => {
    const kbId = s.kebiasaanId ?? s.id;
    const j = journeyUntukKebiasaan(kbId);
    navigate(j ? `/dashboard/tier2/temani?journey=${j.slug}` : '/dashboard/tier2/temani');
  }, [navigate]);


  const nilaiFokusSet = useMemo(() => new Set<string>(nilaiFokus), [nilaiFokus]);

  // Build Kebiasaan Baik items from live data
  const itemsKebiasaan = useMemo<KartuItem[]>(() => {
    return (NILAI as readonly NilaiAkar[]).map(nama => {
      const sikapList = resolveSikap(usiaBulan, [nama], katalogSikap);
      const adaSikap = sikapList.length > 0;
      const sudahDitanam = nilaiFokusSet.has(nama);
      const pal = PAL[nama];
      const pill = sudahDitanam
        ? { text: KEBIASAAN_BAIK.sudahDiTaman, ink: GREEN.ink, soft: GREEN.soft }
        : adaSikap
          ? { text: KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length), ink: pal.ink, soft: pal.soft }
          : { text: KEBIASAAN_BAIK.sikapSedangDilengkapi, ink: pal.ink, soft: pal.soft };
      return { nilai: nama, name: nama, desc: PENJELASAN_NILAI[nama].tagline, pill, disc: pal.soft };
    });
  }, [usiaBulan, katalogSikap, nilaiFokusSet]);

  const sikapDibuka = useMemo(
    () => (nilaiDibuka ? resolveSikap(usiaBulan, [nilaiDibuka], katalogSikap) : []),
    [nilaiDibuka, usiaBulan, katalogSikap],
  );

  function handleTabKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') {
      const next = TABS[(idx + 1) % TABS.length];
      setTabAktif(next.id);
      (e.currentTarget.parentElement?.children[(idx + 1) % TABS.length] as HTMLElement | null)?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = TABS[(idx + TABS.length - 1) % TABS.length];
      setTabAktif(prev.id);
      (e.currentTarget.parentElement?.children[(idx + TABS.length - 1) % TABS.length] as HTMLElement | null)?.focus();
    }
  }

  return (
    <article className="pb-14 text-pekat">
      {/* Hero — panel gradien berbingkai (desain v2) */}
      <div className="px-4 pt-6 sm:px-8">
        <div
          className="relative overflow-hidden text-center"
          style={{
            borderRadius: 26,
            border: '2px solid #FBDDEC',
            background: 'linear-gradient(118deg,#FDE6F0 0%,#F4ECFC 46%,#E3EEFD 100%)',
          }}
        >
          {/* Ornamen botani — layar besar saja */}
          <div
            className="pointer-events-none absolute left-6 top-4 hidden h-[94px] w-[58px] lg:block"
            style={{ animation: 'sway 8s ease-in-out infinite' }}
            aria-hidden
          >
            <BotanicalDeco type="tulip" bloom="#F06BA8" bloom2="#F8B9D4" center="#6E3B57" />
          </div>
          <div
            className="pointer-events-none absolute left-24 top-[78px] hidden h-[66px] w-[40px] lg:block"
            style={{ animation: 'sway2 9s ease-in-out infinite' }}
            aria-hidden
          >
            <BotanicalDeco type="fivepetal" bloom="#F8B9D4" center="#F06BA8" />
          </div>
          <div
            className="pointer-events-none absolute right-6 top-3 hidden h-[98px] w-[62px] lg:block"
            style={{ animation: 'sway2 9s ease-in-out infinite' }}
            aria-hidden
          >
            <BotanicalDeco type="daisy" bloom="#5F84E6" bloom2="#8FB8F7" center="#FFE29A" />
          </div>
          <div
            className="pointer-events-none absolute right-24 top-[80px] hidden h-[64px] w-[38px] lg:block"
            style={{ animation: 'sway 8s ease-in-out infinite' }}
            aria-hidden
          >
            <BotanicalDeco type="bell" bloom="#8FB8F7" bloom2="#5F84E6" />
          </div>

          <div className="relative px-5 py-6 sm:px-16 md:px-24 lg:px-40">
            {/* Badge DRAF */}
            {isDev && (
              <div
                className="inline-flex items-center gap-2 rounded-full font-nunito font-[800]"
                style={{ background: '#FFE29A', color: '#8A5510', padding: '7px 16px', fontSize: 13 }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E0A63A' }} />
                {DRAF_BANNER}
              </div>
            )}

            {/* Judul */}
            <h1
              className="font-fredoka font-bold text-pekat"
              style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: '-0.8px', marginTop: isDev ? 12 : 0 }}
            >
              {JUDUL_BEKAL}
            </h1>

            {/* Pill anak */}
            {namaDisplay && (
              <span
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white font-nunito font-[800]"
                style={{ padding: '6px 14px', fontSize: 13.5, color: '#C6407F' }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F06BA8' }} />
                untuk {namaDisplay}
                {bekalLabel && <span> · {bekalLabel}</span>}
              </span>
            )}

            {/* Paragraf penjelasan */}
            <p
              className="mx-auto mt-3 font-nunito font-semibold"
              style={{ maxWidth: 780, fontSize: 15.5, lineHeight: 1.6, color: '#8A6F86' }}
            >
              {HEADER_BEKAL.penjelasan}
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar — pill (desain v2) */}
      <div
        role="tablist"
        aria-label="Bagian Bekal"
        className="mt-5 flex flex-wrap items-center justify-center px-4 sm:px-8"
        style={{ gap: 10 }}
      >
        {TABS.map((tab, idx) => {
          const aktif = tabAktif === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={aktif}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setTabAktif(tab.id)}
              onKeyDown={e => handleTabKey(e, idx)}
              className="font-fredoka font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              style={{
                fontSize: 17,
                padding: '9px 22px',
                borderRadius: 999,
                border: '2px solid',
                background: aktif ? '#F06BA8' : '#fff',
                color: aktif ? '#fff' : '#9B7E92',
                borderColor: aktif ? '#F06BA8' : '#F3E2EC',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel: Kebiasaan Baik — scattered collage design */}
      <div
        role="tabpanel"
        id="panel-kebiasaan-baik"
        aria-labelledby="tab-kebiasaan-baik"
        className={tabAktif !== 'kebiasaan-baik' ? 'hidden' : 'px-6 pt-8 sm:px-10'}
      >
        <SectionHead judul={BEKAL_HEAD.kebiasaanBaik.judul} sub={BEKAL_HEAD.kebiasaanBaik.sub} />

        <PapanKartu items={itemsKebiasaan} onCardClick={setNilaiDibuka} />

        <FooterNote>{BEKAL_FOOTER_TAB.kebiasaanBaik}</FooterNote>
      </div>

      {/* Panel: Ajak Main — tampilan sama dengan halaman Learning Strategies */}
      <div
        role="tabpanel"
        id="panel-ajak-main"
        aria-labelledby="tab-ajak-main"
        className={tabAktif !== 'ajak-main' ? 'hidden' : 'px-6 pt-8 sm:px-10'}
      >
        <SectionHead judul={BEKAL_HEAD.ajakMain.judul} sub={BEKAL_HEAD.ajakMain.sub} />

        <div className="mt-6">
          <AjakMainPanel usiaBulan={usiaBulan} />
        </div>

        <FooterNote>{BEKAL_FOOTER_TAB.ajakMain}</FooterNote>
      </div>

      {/* Panel: Wawasan Tumbuh — hanya judul hero yang diubah; buku & detailnya tetap */}
      <div
        role="tabpanel"
        id="panel-wawasan-tumbuh"
        aria-labelledby="tab-wawasan-tumbuh"
        className={[
          'px-6 pt-8 sm:px-10',
          tabAktif !== 'wawasan-tumbuh' ? 'hidden' : '',
        ].join(' ')}
      >
        <SectionHead judul={BEKAL_HEAD.wawasanTumbuh.judul} sub={BEKAL_HEAD.wawasanTumbuh.sub} />

        <div className="mt-6">
          <KnowledgeGallery defaultAgeMonths={usiaBulan} onJadwalkanBuku={setJadwalkanBuku} tampilkanHero={false} />
        </div>
      </div>

      {/* Popup pilih hari untuk buku */}
      {jadwalkanBuku !== null && (
        <JadwalKeKelola
          judul={jadwalkanBuku.title}
          tipe="buku"
          idAnak={anak.id}
          tanggalHariIni={tanggalHariIni}
          onTutup={() => setJadwalkanBuku(null)}
        />
      )}

      {/* Popup detail nilai */}
      {nilaiDibuka !== null && (
        <PopupDetailNilai
          nilai={nilaiDibuka}
          sikapList={sikapDibuka}
          sudahDitanam={nilaiFokusSet.has(nilaiDibuka)}
          onTanam={() => { onTanamNilai?.(nilaiDibuka); }}
          onCabut={onCabutNilai ? () => { onCabutNilai(nilaiDibuka); setNilaiDibuka(null); } : undefined}
          onTambahRutinitas={handleTambahRutinitas}
          onTemani={handleTemaniKb}
          onTutup={() => setNilaiDibuka(null)}
        />
      )}
    </article>
  );
}

// ─── LayarEdge ────────────────────────────────────────────────────────────────

function LayarEdge({ isDev, children }: { isDev: boolean; children: React.ReactNode }) {
  return (
    <div className="min-h-[40vh] bg-kanvas px-6 py-10 text-pekat sm:px-10">
      {isDev && (
        <div className="mb-5">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
            {DRAF_BANNER}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
