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
import { AGE_RANGES } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import FilterSubUsia, { resolveSubUsia, OPSI_SUB_USIA } from '../../components/FilterSubUsia';
import type { IdSubUsia } from '../../components/FilterSubUsia';
import PopupPilihHari from '../../components/PopupPilihHari';
import type { JadwalItem } from '../../components/PopupPilihHari';
import { tanggalDariTimestampWIB } from '@studiva/shared';
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
  BEKAL_FOOTER,
} from './content';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabId = 'kebiasaan-baik' | 'ajak-main' | 'wawasan-tumbuh';

interface PropsBekal {
  bekalId?: BekalId;
  nilaiFokus?: readonly NilaiAkar[];
  onTanamNilai?: (nilai: NilaiAkar) => void;
  tabAwal?: TabId;
  namaAnak?: string;
  tanggalLahir?: string;
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
const CARD_W  = 230;
const STEP    = 196;
const INNER_W = 1332;
const OFFSET_X = Math.round((INNER_W - ((COLS - 1) * STEP + CARD_W)) / 2);
const ROW_BASE = [0, 340] as const;
const TOPS_P  = [22, 68, 6, 74, 28, 58] as const;
const ROTS_P  = [-4, 3, -3, 4, -2, 3] as const;
const DUR_P   = [6.4, 5.6, 7.2, 6, 6.8, 5.9] as const;
const BOARD_BG = [
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

// ─── PopupDetailNilai ─────────────────────────────────────────────────────────

function PopupDetailNilai({
  nilai,
  sikapList,
  sudahDitanam,
  onTanam,
  onTutup,
}: {
  nilai: NilaiAkar;
  sikapList: ItemSikap[];
  sudahDitanam: boolean;
  onTanam: () => void;
  onTutup: () => void;
}) {
  const info = PENJELASAN_NILAI[nilai];
  const bunga = BUNGA_DARI_NAMA.get(nilai);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onTutup(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onTutup]);

  useEffect(() => { elRef.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(110,59,87,0.25)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        ref={elRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail nilai ${nilai}`}
        tabIndex={-1}
        className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-[0_-8px_40px_rgba(110,59,87,0.18)] sm:rounded-[24px] sm:shadow-[0_8px_40px_rgba(110,59,87,0.18)] focus:outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {bunga && (
              <div className="flex-shrink-0">
                <BungaMini
                  warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                  r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2} ukuran={44}
                />
              </div>
            )}
            <div>
              <p className="font-nunito text-[10px] font-[800] uppercase tracking-widest text-rekah/60">
                {nilai}
              </p>
              <p className="font-fraunces text-[1.05rem] italic leading-snug text-pekat/80">
                {info.tagline}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={KEBIASAAN_BAIK.tutup}
            onClick={onTutup}
            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[18px] text-pekat/40 hover:bg-mawar/20 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            ×
          </button>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-pekat/70">{info.deskripsi}</p>

        <div className="mb-4 rounded-[16px] border border-mawar/20 bg-white px-4 py-3">
          <p className="mb-1 font-nunito text-[10px] font-[800] uppercase tracking-wider text-pekat/40">
            {KEBIASAAN_BAIK.kebiasaanLabel}
          </p>
          <p className="text-[12px] leading-relaxed text-pekat/65">{info.caraRawat}</p>
        </div>

        {sikapList.length > 0 && (
          <div className="mb-5 rounded-[16px] bg-fajar px-4 py-3">
            <p className="mb-2 font-nunito text-[10px] font-[800] uppercase tracking-wider text-rekah/60">
              {KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length)}
            </p>
            <ul className="space-y-2">
              {sikapList.map(s => (
                <li key={s.id} className="flex items-start gap-2 text-[12px] leading-snug text-pekat/70">
                  <span className="mt-0.5 flex-shrink-0 text-[8px] text-rekah/50">●</span>
                  {s.judul}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sikapList.length === 0 && (
          <div className="mb-5 rounded-[16px] bg-fajar/50 px-4 py-3 text-center">
            <p className="text-[12px] text-pekat/50">{KEBIASAAN_BAIK.sikapSedangDilengkapi}</p>
            <p className="mt-1 text-[11px] text-pekat/35">{KEBIASAAN_BAIK.tetapBisaDitanam}</p>
          </div>
        )}

        {sudahDitanam ? (
          <div className="rounded-[16px] bg-daun/10 px-4 py-3 text-center">
            <p className="font-nunito text-[13px] font-semibold text-daun">
              {KEBIASAAN_BAIK.sudahDiTaman}
            </p>
          </div>
        ) : (
          <div className="rounded-[16px] border border-mawar/30 bg-fajar/50 px-4 py-4">
            <p className="mb-3 text-center font-bricolage text-[14px] font-semibold text-pekat/80">
              {KEBIASAAN_BAIK.ajakanTanam(nilai)}
            </p>
            <button
              type="button"
              onClick={onTanam}
              style={{ borderRadius: '100px 100px 100px 8px' }}
              className="w-full min-h-[48px] bg-rekah px-6 text-[15px] font-bold text-white hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah transition"
            >
              {KEBIASAAN_BAIK.tombolTanam(nilai)}
            </button>
          </div>
        )}
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
  const boardH = ROW_BASE[Math.min(rowsUsed - 1, ROW_BASE.length - 1)] + Math.max(...TOPS_P) + 262;

  return (
    <>
      {/* Scaled scattered board — sm and above */}
      <div
        ref={containerRef}
        className="relative mt-8 hidden sm:block"
        style={{
          height: boardH * scale,
          background: BOARD_BG,
          backgroundSize: '48px 48px, 48px 48px, auto',
          borderRadius: 30,
          border: '2px dashed rgba(110,59,87,.09)',
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
            const top = ROW_BASE[Math.min(row, ROW_BASE.length - 1)] + TOPS_P[col];
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
  tabAwal = 'kebiasaan-baik',
  namaAnak,
  tanggalLahir,
}: PropsBekal) {
  const { profile, sapaan, usiaBulan } = useChildProfile({ namaAnak, tanggalLahir });
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
  const navigate = useNavigate();
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

  const handleKonfirmasiJadwal = useCallback((tanggal: string) => {
    if (!jadwalItem) return;
    setJadwalItem(null);
    navigate('/dashboard/tier2/irama-hari', {
      state: { jadwalkan: { id: jadwalItem.id, judul: jadwalItem.judul, tipe: 'kegiatan', tanggal } },
    });
  // TODO: simpan ke backend (jadwal kegiatan per tanggal)
  }, [navigate, jadwalItem]);

  const TABS = [
    { id: 'aktivitas' as const, label: 'Aktivitas',    count: activities.length },
    { id: 'alat'      as const, label: 'Alat Edukasi', count: tools.length },
    { id: 'unduhan'   as const, label: 'Unduhan',      count: downloads.length },
  ];

  return (
    <>
      {jadwalItem && (
        <PopupPilihHari
          item={jadwalItem}
          tanggalHariIni={tanggalHariIni}
          onPilih={handleKonfirmasiJadwal}
          onTutup={() => setJadwalItem(null)}
        />
      )}

      {isYearOne && (
        <FilterSubUsia nilai={subUsia} onPilih={setSubUsia} />
      )}

      <div className="mb-4 flex gap-1 border-b border-slate-100">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTabGrid(t.id)}
            className={[
              'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-semibold transition-all',
              tabGrid === t.id
                ? 'border-rekah text-rekah'
                : 'border-transparent text-stv-muted hover:text-stv-body',
            ].join(' ')}>
            {t.label}
            <span className={[
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              tabGrid === t.id ? 'bg-mawar text-rekah-tua' : 'bg-slate-100 text-slate-500',
            ].join(' ')}>{t.count}</span>
          </button>
        ))}
      </div>

      {tabGrid === 'aktivitas' && (
        activities.length === 0
          ? <p className="py-10 text-center text-[14px] text-stv-muted">Belum ada aktivitas untuk usia ini.</p>
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
          ? <p className="py-10 text-center text-[14px] text-stv-muted">Belum ada alat edukasi untuk usia ini.</p>
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
          ? <p className="py-10 text-center text-[14px] text-stv-muted">Belum ada unduhan untuk usia ini.</p>
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

      {openActivity && <ActivityModal activity={openActivity} onClose={() => setOpenActivity(null)} />}
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

  const handleKonfirmasiJadwalBuku = useCallback((tanggal: string) => {
    if (!jadwalkanBuku) return;
    const warnaCover = AGE_RANGES.find(r => r.key === jadwalkanBuku.ageKey)?.fill ?? '#EDE9F8';
    setJadwalkanBuku(null);
    navigate('/dashboard/tier2/irama-hari', {
      state: { jadwalkan: { id: jadwalkanBuku.id, judul: jadwalkanBuku.title, tipe: 'buku', tanggal, warnaCover } },
    });
    // TODO: simpan ke backend (jadwal buku per tanggal)
  }, [navigate, jadwalkanBuku]);

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
      {/* Hero */}
      <div className="relative px-6 pt-8 text-center sm:px-10">
        {/* Botanical decorations — large screens only */}
        <div
          className="pointer-events-none absolute left-11 top-6 hidden h-32 w-20 lg:block"
          style={{ animation: 'sway 8s ease-in-out infinite' }}
          aria-hidden
        >
          <BotanicalDeco type="tulip" bloom="#F06BA8" bloom2="#F8B9D4" center="#6E3B57" />
        </div>
        <div
          className="pointer-events-none absolute left-40 top-28 hidden h-24 w-14 lg:block"
          style={{ animation: 'sway2 9s ease-in-out infinite' }}
          aria-hidden
        >
          <BotanicalDeco type="fivepetal" bloom="#F8B9D4" center="#F06BA8" />
        </div>
        <div
          className="pointer-events-none absolute right-11 top-4 hidden h-36 w-20 lg:block"
          style={{ animation: 'sway2 9s ease-in-out infinite' }}
          aria-hidden
        >
          <BotanicalDeco type="daisy" bloom="#5F84E6" bloom2="#8FB8F7" center="#FFE29A" />
        </div>
        <div
          className="pointer-events-none absolute right-40 top-28 hidden h-24 w-14 lg:block"
          style={{ animation: 'sway 8s ease-in-out infinite' }}
          aria-hidden
        >
          <BotanicalDeco type="bell" bloom="#8FB8F7" bloom2="#5F84E6" />
        </div>

        {/* DRAF badge */}
        {isDev && (
          <div
            className="mb-5 inline-flex items-center rounded-full px-5 py-2 font-nunito text-[15px] font-bold"
            style={{ background: '#FCEFC2', color: '#A9791C' }}
          >
            {DRAF_BANNER}
          </div>
        )}

        {/* Title */}
        <h1
          className="font-fredoka font-bold text-pekat"
          style={{ fontSize: 56, lineHeight: 1.1, letterSpacing: '-1px' }}
        >
          {JUDUL_BEKAL}
        </h1>

        {/* Child name + bekal label */}
        {namaDisplay && (
          <p className="mt-2 font-nunito text-[19px] font-bold" style={{ color: '#B79FAF' }}>
            untuk {namaDisplay}
            {bekalLabel && <span> · {bekalLabel}</span>}
          </p>
        )}

        {/* Penjelasan paragraph */}
        <p
          className="mx-auto mt-5 font-nunito font-semibold"
          style={{ maxWidth: 860, fontSize: 19, lineHeight: 1.62, color: '#8A6F86' }}
        >
          {HEADER_BEKAL.penjelasan}
        </p>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Bagian Bekal"
        className="mt-8 flex items-center justify-center border-b-2 border-[#F0E3D2] px-6 sm:px-10"
        style={{ gap: 38 }}
      >
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tabAktif === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setTabAktif(tab.id)}
            onKeyDown={e => handleTabKey(e, idx)}
            className="relative pb-3.5 font-fredoka font-semibold transition focus-visible:outline-none"
            style={{
              fontSize: 20,
              color: tabAktif === tab.id ? '#F06BA8' : '#B79FAF',
              borderBottom: tabAktif === tab.id ? '3px solid #F06BA8' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel: Kebiasaan Baik — scattered collage design */}
      <div
        role="tabpanel"
        id="panel-kebiasaan-baik"
        aria-labelledby="tab-kebiasaan-baik"
        className={tabAktif !== 'kebiasaan-baik' ? 'hidden' : 'px-6 pt-10 sm:px-10'}
      >
        <p
          className="font-nunito font-[800] uppercase"
          style={{ fontSize: 15, letterSpacing: '1.5px', color: '#F06BA8' }}
        >
          BEKAL
        </p>
        <h2
          className="font-fredoka font-bold text-pekat"
          style={{ fontSize: 60, margin: '8px 0 0', letterSpacing: '-1.2px', lineHeight: 1.1 }}
        >
          {BEKAL_HEAD.kebiasaanBaik.judul}
        </h2>
        <p
          className="mt-3.5 font-shantell font-semibold"
          style={{ maxWidth: 1100, fontSize: 23, lineHeight: 1.5, color: '#F06BA8' }}
        >
          {BEKAL_HEAD.kebiasaanBaik.sub}
        </p>

        <PapanKartu items={itemsKebiasaan} onCardClick={setNilaiDibuka} />

        <p
          className="mt-12 text-center font-shantell font-semibold"
          style={{ fontSize: 18, color: '#C7A9BE' }}
        >
          {BEKAL_FOOTER}
        </p>
      </div>

      {/* Panel: Ajak Main — tampilan sama dengan halaman Learning Strategies */}
      <div
        role="tabpanel"
        id="panel-ajak-main"
        aria-labelledby="tab-ajak-main"
        className={tabAktif !== 'ajak-main' ? 'hidden' : 'pt-5'}
      >
        <AjakMainPanel usiaBulan={usiaBulan} />
      </div>

      {/* Panel: Wawasan Tumbuh — tampilan sama dengan halaman Knowledge Gallery */}
      <div
        role="tabpanel"
        id="panel-wawasan-tumbuh"
        aria-labelledby="tab-wawasan-tumbuh"
        className={[
          'px-6 pt-6 sm:px-10',
          tabAktif !== 'wawasan-tumbuh' ? 'hidden' : '',
        ].join(' ')}
      >
        <KnowledgeGallery defaultAgeMonths={usiaBulan} onJadwalkanBuku={setJadwalkanBuku} />
      </div>

      {/* Popup pilih hari untuk buku */}
      {jadwalkanBuku !== null && (
        <PopupPilihHari
          item={{ id: jadwalkanBuku.id, judul: jadwalkanBuku.title, tipe: 'buku' }}
          tanggalHariIni={tanggalHariIni}
          onPilih={handleKonfirmasiJadwalBuku}
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
