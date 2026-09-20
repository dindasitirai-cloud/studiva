// =============================================================
// LoopPerjalanan — indikator siklus Family Journey Map.
// Menunjukkan bahwa Rekah adalah perjalanan yang BERPUTAR, bukan daftar linear:
// Amati → Fokus → Siapkan → Jalani → Refleksi → Tinjau → (kembali ke Amati).
// Tiap tahap menaut ke halamannya. Opsi `aktif` menyorot tahap sekarang.
// Additive; dipakai di Beranda. STATUS: DRAFT copy — review Psikolog Fitri.
// =============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Package, Sun, Heart, Sprout, ChevronRight, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tahap {
  key: string;
  label: string;
  sub: string;
  to: string;
  icon: LucideIcon;
  warna: string;
}

const TAHAP: readonly Tahap[] = [
  { key: 'amati',    label: 'Amati',    sub: 'Kompas',      to: '/dashboard/tier2/kompas-keluarga', icon: Compass,  warna: '#4E9C6E' },
  { key: 'fokus',    label: 'Fokus',    sub: 'minggu ini',  to: '/dashboard/tier2/irama-hari',      icon: Sparkles, warna: '#F06BA8' },
  { key: 'siapkan',  label: 'Siapkan',  sub: 'Bekal',       to: '/dashboard/tier2/bekal',           icon: Package,  warna: '#8FB8F7' },
  { key: 'jalani',   label: 'Jalani',   sub: 'Irama Hari',  to: '/dashboard/tier2/irama-hari',      icon: Sun,      warna: '#E0A21F' },
  { key: 'refleksi', label: 'Refleksi', sub: '& sesuaikan', to: '/dashboard/tier2/irama-hari',      icon: Heart,    warna: '#D04595' },
  { key: 'tinjau',   label: 'Tinjau',   sub: 'Panen',       to: '/dashboard/tier2/jejak-mekar',     icon: Sprout,   warna: '#7BA05B' },
];

export default function LoopPerjalanan({ aktif }: { aktif?: string }) {
  return (
    <section
      aria-label="Perjalanan keluarga Rekah"
      className="mt-6 rounded-[22px] border border-rekah/12 bg-white/70 px-4 py-4 sm:px-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw aria-hidden className="h-4 w-4 text-rekah" />
        <p className="font-shantell text-[15px] text-rekah">perjalanan yang berputar</p>
      </div>

      <ol className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
        {TAHAP.map((t, i) => {
          const Icon = t.icon;
          const on = aktif === t.key;
          return (
            <React.Fragment key={t.key}>
              <li className="flex-shrink-0">
                <Link
                  to={t.to}
                  aria-label={`${t.label} — ${t.sub}`}
                  className={
                    'flex min-w-[86px] flex-col items-center gap-1.5 rounded-[14px] border px-3 py-2.5 text-center no-underline transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ' +
                    (on ? 'border-rekah/40 bg-fajar' : 'border-rekah/10 bg-white hover:border-rekah/25')
                  }
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-[11px] text-white"
                    style={{ background: t.warna, boxShadow: on ? `0 0 0 4px ${t.warna}22` : undefined }}
                  >
                    <Icon aria-hidden className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-nunito text-[13px] font-extrabold leading-none text-pekat">{t.label}</span>
                  <span className="font-nunito text-[10.5px] font-semibold leading-none text-pekat/45">{t.sub}</span>
                </Link>
              </li>
              {i < TAHAP.length - 1 && (
                <li aria-hidden className="flex flex-shrink-0 items-center">
                  <ChevronRight className="h-4 w-4 text-pekat/25" />
                </li>
              )}
            </React.Fragment>
          );
        })}
        {/* Sambungan kembali ke awal */}
        <li aria-hidden className="flex flex-shrink-0 items-center pl-0.5">
          <RefreshCw className="h-4 w-4 text-rekah/50" />
        </li>
      </ol>

      <p className="mt-2 font-nunito text-[11.5px] text-pekat/45">
        Tiap pekan berputar kembali ke Amati — Rekah tumbuh bersama keluarga.
      </p>
    </section>
  );
}
