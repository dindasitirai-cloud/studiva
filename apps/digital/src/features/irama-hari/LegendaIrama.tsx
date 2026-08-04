import React from 'react';
import { LATAR_DOMAIN } from './domainWarnaIrama';
import { LABEL_DOMAIN } from './contentMingguan';
import type { DomainKeyIrama } from './mingguanAdapter';

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

/**
 * Legenda domain untuk grid Irama Hari Mingguan.
 * Warna adalah satu-satunya pembeda domain — legenda diperlukan
 * untuk keterbacaan termasuk pengguna buta warna.
 */
export default function LegendaIrama() {
  return (
    <section
      aria-label="Legenda Irama Hari Mingguan"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 18,
        paddingTop: 16,
        borderTop: '1px solid rgba(110,59,87,.09)',
      }}
    >
      {DOMAIN_URUTAN.map(dk => (
        <div
          key={dk}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            backgroundColor: LATAR_LEMBUT[dk],
            padding: '6px 12px',
            borderRadius: 999,
          }}
        >
          <span
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
              fontWeight: 700,
              color: '#6E3B57',
            }}
          >
            {LABEL_DOMAIN[dk]}
          </span>
        </div>
      ))}
    </section>
  );
}
