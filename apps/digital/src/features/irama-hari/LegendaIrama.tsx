import React from 'react';
import type { MingguIrama } from '@studiva/shared';
import { BLOK_URUTAN } from '@studiva/shared';
import type { DomainCode } from '@studiva/shared';
import { DOMAIN_CONFIG_MAP } from '@studiva/shared';
import { LATAR_DOMAIN } from './domainWarnaIrama';
import { LABEL_DOMAIN } from './contentMingguan';
import type { DomainKeyIrama } from './mingguanAdapter';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';

const DOMAIN_URUTAN: DomainKeyIrama[] = ['mk', 'mh', 'bhs', 'kog', 'sos', 'sen', 'fe'];

// Latar lembut per domain (10% opacity dari warna domain, disesuaikan manual agar terbaca).
const LATAR_LEMBUT: Record<DomainKeyIrama, string> = {
  mk:  '#E4EAFB',
  mh:  '#E7F0FE',
  bhs: '#EFE9FA',
  kog: '#FCE3EE',
  sos: '#FDEAF2',
  sen: '#FFF6DE',
  fe:  '#EFE4EC',
};

// Wawasan Tumbuh — warna konsisten dengan KotakIrama dan Bekal
const WAWASAN_BG     = '#FFF3F6';
const WAWASAN_BORDER = '#F3E3E8';
const WAWASAN_DOT    = '#F06BA8';

// Lookup kartuId → DomainCode (build once, module-level)
const KARTU_DOMAIN = new Map<string, DomainCode>(
  CARDS.map(c => [c.id, c.domain] as [string, DomainCode]),
);

// Urutan domain wawasan yang digunakan untuk tampilan legenda
const WAWASAN_DOMAIN_URUTAN: DomainCode[] = ['FM', 'KG', 'BH', 'SE', 'KS', 'PS', 'DK'];

interface StatsMinggu {
  /** Per domain Ajak Main: { selesai, total } */
  ajakMain: Record<string, { selesai: number; total: number }>;
  /** Wawasan Tumbuh: total keseluruhan */
  wawasan: { selesai: number; total: number };
  /** Wawasan Tumbuh: per DomainCode */
  wawasanPerDomain: Record<string, { selesai: number; total: number }>;
}

function hitungStatsMinggu(minggu: MingguIrama): StatsMinggu {
  const ajakMain: Record<string, { selesai: number; total: number }> = {};
  let wSelesai = 0;
  let wTotal = 0;
  const wawasanPerDomain: Record<string, { selesai: number; total: number }> = {};

  for (const hari of minggu.hari) {
    for (const blok of BLOK_URUTAN) {
      for (const item of hari.slot[blok]) {
        if (item.jenis === 'ajakMain' && item.domainKey) {
          const dk = item.domainKey;
          if (!ajakMain[dk]) ajakMain[dk] = { selesai: 0, total: 0 };
          ajakMain[dk]!.total++;
          if (item.selesai) ajakMain[dk]!.selesai++;
        } else if (item.jenis === 'wawasanTumbuh') {
          wTotal++;
          if (item.selesai) wSelesai++;
          const domainCode = item.kartuId ? KARTU_DOMAIN.get(item.kartuId) : undefined;
          if (domainCode) {
            if (!wawasanPerDomain[domainCode]) wawasanPerDomain[domainCode] = { selesai: 0, total: 0 };
            wawasanPerDomain[domainCode]!.total++;
            if (item.selesai) wawasanPerDomain[domainCode]!.selesai++;
          }
        }
      }
    }
  }

  return { ajakMain, wawasan: { selesai: wSelesai, total: wTotal }, wawasanPerDomain };
}

interface PropsLegendaIrama {
  /** Data minggu yang sedang ditampilkan — opsional, beri stats jika ada. */
  minggu?: MingguIrama;
}

/**
 * Legenda domain untuk grid Irama Hari Mingguan.
 * Menampilkan Ajak Main (per domain) dan Wawasan Tumbuh,
 * masing-masing dengan statistik selesai/total minggu ini.
 */
export default function LegendaIrama({ minggu }: PropsLegendaIrama) {
  const stats = minggu ? hitungStatsMinggu(minggu) : null;

  // Domain yang punya setidaknya 1 item minggu ini (atau semua jika stats=null)
  const domainTampil = stats
    ? DOMAIN_URUTAN.filter(dk => (stats.ajakMain[dk]?.total ?? 0) > 0)
    : DOMAIN_URUTAN;

  const adaWawasan = stats ? stats.wawasan.total > 0 : false;

  // Domain wawasan yang punya setidaknya 1 item minggu ini
  const wawasanDomainTampil = stats
    ? WAWASAN_DOMAIN_URUTAN.filter(dc => (stats.wawasanPerDomain[dc]?.total ?? 0) > 0)
    : WAWASAN_DOMAIN_URUTAN;

  return (
    <section
      aria-label="Legenda Irama Hari Mingguan"
      style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: '1px solid rgba(110,59,87,.09)',
      }}
    >
      {/* ── Ajak Main ────────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#C0A6B7',
          marginBottom: 8,
        }}
      >
        Ajak Main
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: adaWawasan || (stats === null) ? 12 : 0,
        }}
      >
        {domainTampil.map(dk => {
          const s = stats?.ajakMain[dk];
          return (
            <div
              key={dk}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: LATAR_LEMBUT[dk],
                padding: '5px 10px',
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: LATAR_DOMAIN[dk],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#6E3B57',
                }}
              >
                {LABEL_DOMAIN[dk]}
              </span>
              {s !== undefined && (
                <span
                  style={{
                    fontFamily: 'Fredoka, system-ui, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#A98DA0',
                    marginLeft: 2,
                  }}
                >
                  {s.selesai}/{s.total}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Wawasan Tumbuh per domain ────────────────────────────────── */}
      {(adaWawasan || stats === null) && (
        <>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#C0A6B7',
              marginBottom: 8,
            }}
          >
            Wawasan Tumbuh
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {wawasanDomainTampil.map(dc => {
              const cfg = DOMAIN_CONFIG_MAP[dc];
              const s = stats?.wawasanPerDomain[dc];
              if (!cfg) return null;
              return (
                <div
                  key={dc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: cfg.bg,
                    padding: '5px 10px',
                    borderRadius: 999,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: cfg.fg,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Nunito, system-ui, sans-serif',
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#6E3B57',
                    }}
                  >
                    {cfg.shortLabel}
                  </span>
                  {s !== undefined && (
                    <span
                      style={{
                        fontFamily: 'Fredoka, system-ui, sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#A98DA0',
                        marginLeft: 2,
                      }}
                    >
                      {s.selesai}/{s.total}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
