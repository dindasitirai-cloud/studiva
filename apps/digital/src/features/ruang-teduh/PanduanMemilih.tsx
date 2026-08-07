import React from 'react';
import { ShoppingBag, Check, X } from 'lucide-react';
import type { KriteriaPilih } from './types';

interface PropsPanduanMemilih {
  kriteria: KriteriaPilih[];
  sapaan: { low: string; cap: string };
  rujukan?: string;
  tautan?: string;
  alasanTanpaTautan?: string;
}

export default function PanduanMemilih({
  kriteria,
  sapaan,
  rujukan,
  tautan,
  alasanTanpaTautan,
}: PropsPanduanMemilih) {
  function terapkanToken(teks: string): string {
    return teks
      .replace(/\{anak\}/g, sapaan.low)
      .replace(/\{Anak\}/g, sapaan.cap);
  }

  const cari    = kriteria.filter(k => k.jenis === 'cari');
  const hindari = kriteria.filter(k => k.jenis === 'hindari');

  return (
    <div
      style={{
        background: '#FDF8F5',
        border: '1px solid rgba(224,82,107,.12)',
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginTop: 6,
      }}
    >
      {cari.length > 0 && (
        <div style={{ marginBottom: hindari.length > 0 ? 10 : 0 }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cari.map((k, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  color: '#3A2530',
                  lineHeight: 1.45,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#D4F0DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                  aria-hidden="true"
                >
                  <Check style={{ width: 11, height: 11, color: '#2E7D4F', strokeWidth: 2.5 }} />
                </span>
                {terapkanToken(k.teks)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hindari.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hindari.map((k, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 13,
                color: '#3A2530',
                lineHeight: 1.45,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#F7C9D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
                aria-hidden="true"
              >
                <X style={{ width: 11, height: 11, color: '#9B3A52', strokeWidth: 2.5 }} />
              </span>
              {terapkanToken(k.teks)}
            </li>
          ))}
        </ul>
      )}

      {rujukan && (
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 11,
            color: '#A98DA0',
            marginTop: 10,
            marginBottom: 0,
          }}
        >
          Sumber: {rujukan}
        </p>
      )}

      {/* Tombol belanja — hanya dirender dari PanduanMemilih, tidak pernah berdiri sendiri */}
      {tautan ? (
        <a
          href={tautan}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 999,
            border: '1.5px solid rgba(234,88,12,.3)',
            background: '#FFF7ED',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#C05621',
            textDecoration: 'none',
          }}
        >
          <ShoppingBag style={{ width: 15, height: 15 }} />
          Beli via Shopee
        </a>
      ) : alasanTanpaTautan ? (
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            color: '#8A7A80',
            fontStyle: 'italic',
            marginTop: 10,
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          {alasanTanpaTautan}
        </p>
      ) : null}
    </div>
  );
}
