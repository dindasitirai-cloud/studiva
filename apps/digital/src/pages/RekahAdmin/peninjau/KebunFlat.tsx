// Ilustrasi kebun flat Rekah untuk Ruang Tinjauan (akun peninjau klinis).
// Komposisi mengikuti HeroGarden beranda: langit dengan gumpalan lembut, matahari, pagar tanah
// bergelombang, dan deretan tanaman botani (BotanicalStem) yang bergoyang pelan.
// Dekoratif (aria-hidden); animasi dimatikan oleh prefers-reduced-motion di rekahAdminTema.css.
import React from 'react';
import { plant, Tanaman } from '../../../features/beranda/komponen/plant';
import type { TanamanCfg } from '../../../features/beranda/komponen/plant';

export type SuasanaKebun = 'pagi' | 'siang' | 'senja';

const LANGIT: Record<SuasanaKebun, { langit: string; gumpal1: string; gumpal2: string; matahari: string; tanah: string; tanahGaris: string; tanahBawah: string }> = {
  pagi:  { langit: '#FDEAF3', gumpal1: '#F8D0E3', gumpal2: '#EEE6FB', matahari: '#FFE29A', tanah: '#FFF6FB', tanahGaris: '#E7CFDD', tanahBawah: '#F8D8E6' },
  siang: { langit: '#E8F0FF', gumpal1: '#D6E4FD', gumpal2: '#FFF3E6', matahari: '#FFD36B', tanah: '#F6FBF1', tanahGaris: '#CFE3C4', tanahBawah: '#E1F2E6' },
  senja: { langit: '#6E3B57', gumpal1: '#8A5A74', gumpal2: '#B4477F', matahari: '#F6B860', tanah: '#F8D8E6', tanahGaris: '#6E3B57', tanahBawah: '#F8B9D4' },
};

const TANAMAN: TanamanCfg[] = [
  { w: '54px',  h: '84px',  dur: '10s',   op: .85, cfg: plant('foliage', {}) },
  { w: '84px',  h: '128px', dur: '12s',   op: 1,   cfg: plant('sprig', { b: '#FFE29A', b2: '#FFF3E6' }) },
  { w: '104px', h: '158px', dur: '11s',   op: 1,   cfg: plant('tulip', { b: '#F0479B', b2: '#F890BE' }) },
  { w: '50px',  h: '76px',  dur: '9s',    op: .75, cfg: plant('leaf', {}) },
  { w: '124px', h: '190px', dur: '13s',   op: 1,   cfg: plant('daisy', { b: '#FFE29A', b2: '#FFF3E6', c: '#F0479B' }) },
  { w: '92px',  h: '140px', dur: '10.5s', op: 1,   cfg: plant('bell', { b: '#7FA6FF', b2: '#DCEAFD' }) },
  { w: '96px',  h: '146px', dur: '14s',   op: 1,   cfg: plant('fivepetal', { b: '#FF5FA2', b2: '#FFF1F7', c: '#FFE29A' }) },
  { w: '52px',  h: '80px',  dur: '9.5s',  op: .8,  cfg: plant('foliage', {}) },
  { w: '80px',  h: '122px', dur: '12.5s', op: 1,   cfg: plant('tulip', { b: '#9C7BF0', b2: '#C9B8F0' }) },
  { w: '70px',  h: '108px', dur: '11.5s', op: .9,  cfg: plant('sprig', { b: '#F8B9D4', b2: '#FFF3E6' }) },
];

/** Papan catatan kecil bergaya flat — simbol tinjauan (dekoratif). */
function PapanCatatan() {
  return (
    <svg viewBox="0 0 64 80" width="58" height="72" aria-hidden>
      <rect x="6" y="10" width="52" height="66" rx="9" fill="#FFFFFF" stroke="#6E3B57" strokeWidth="3" />
      <rect x="20" y="4" width="24" height="12" rx="5" fill="#C9B8F0" stroke="#6E3B57" strokeWidth="3" />
      <path d="M17 34l5 5 9-10" fill="none" stroke="#4E9C6E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="35" y="31" width="14" height="5" rx="2.5" fill="#F8B9D4" />
      <path d="M17 52l5 5 9-10" fill="none" stroke="#4E9C6E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="35" y="49" width="14" height="5" rx="2.5" fill="#FFE29A" />
    </svg>
  );
}

/** Kaleng penyiram kecil — merawat konten sebelum mekar untuk keluarga (dekoratif). */
function Penyiram() {
  return (
    <svg viewBox="0 0 90 60" width="78" height="52" aria-hidden>
      <path d="M22 18h34a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z" fill="#8FB8F7" stroke="#355EB8" strokeWidth="3" />
      <path d="M62 30l20-14" stroke="#355EB8" strokeWidth="5" strokeLinecap="round" />
      <circle cx="84" cy="14" r="5" fill="#8FB8F7" stroke="#355EB8" strokeWidth="3" />
      <path d="M26 18c0-10 26-10 26 0" fill="none" stroke="#355EB8" strokeWidth="4" />
      <circle cx="39" cy="37" r="6" fill="#FFE29A" />
    </svg>
  );
}

export default function KebunFlat({ tinggi = 240, suasana = 'pagi', aksesori = true, jumlah = TANAMAN.length }: {
  tinggi?: number; suasana?: SuasanaKebun; aksesori?: boolean; jumlah?: number;
}) {
  const w = LANGIT[suasana];
  // Tanaman dirancang untuk kebun setinggi ±240px; kebun lebih pendek mengecilkan tanaman agar tidak terpotong.
  const skala = Math.min(1, Math.max(0.45, (tinggi - 30) / 210));
  return (
    <div aria-hidden className="relative w-full overflow-hidden" style={{ height: tinggi, background: w.langit }}>
      <div className="absolute" style={{ left: -60, top: -20, width: 240, height: 200, borderRadius: '50% 50% 46% 54%/56% 44% 50% 50%', background: w.gumpal1, opacity: .7 }} />
      <div className="absolute" style={{ right: -40, top: -10, width: 200, height: 180, borderRadius: '52% 48% 44% 56%/48% 52% 50% 50%', background: w.gumpal2, opacity: .65 }} />
      <div className="absolute" style={{ right: '18%', top: 22, width: 54, height: 54, borderRadius: '50%', background: w.matahari, boxShadow: `0 0 0 10px ${w.matahari}33` }} />
      <div className="absolute" style={{ left: '22%', top: 30, width: 70, height: 22, borderRadius: 999, background: '#FFFFFF', opacity: suasana === 'senja' ? .18 : .85 }} />
      <div className="absolute" style={{ left: '26%', top: 20, width: 36, height: 24, borderRadius: 999, background: '#FFFFFF', opacity: suasana === 'senja' ? .18 : .85 }} />
      {/* Tanah bergelombang */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 40, background: w.tanah, backgroundImage: `radial-gradient(circle at 50% -1px, ${w.langit} 15px, transparent 15.4px)`, backgroundSize: 'calc(100% / 30) 30px', backgroundRepeat: 'repeat-x' }} />
      <div className="absolute inset-x-0" style={{ bottom: 39, height: 3, background: w.tanahGaris }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: 14, background: w.tanahBawah }} />
      {/* Deretan tanaman */}
      <div className="pointer-events-none absolute inset-x-6 flex items-end justify-center gap-1.5" style={{ bottom: 12 }}>
        {TANAMAN.slice(0, jumlah).map((k, i) => (
          <Tanaman key={i} {...k} w={`${Math.round(parseFloat(k.w) * skala)}px`} h={`${Math.round(parseFloat(k.h) * skala)}px`} />
        ))}
      </div>
      {aksesori && (
        <>
          <div className="absolute hidden sm:block" style={{ left: 22, bottom: 14 }}><PapanCatatan /></div>
          <div className="absolute hidden sm:block" style={{ right: 20, bottom: 12 }}><Penyiram /></div>
        </>
      )}
    </div>
  );
}
