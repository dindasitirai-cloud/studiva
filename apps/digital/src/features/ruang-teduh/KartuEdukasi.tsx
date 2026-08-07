import React, { useState } from 'react';
import { KARTU_EDUKASI, type KartuEdukasiData } from './content';
import { X } from 'lucide-react';

function ModalKartu({
  kartu,
  onTutup,
}: {
  kartu: KartuEdukasiData;
  onTutup: () => void;
}) {
  const sumber =
    kartu.sumberHalamanKIA.length === 1
      ? `Buku KIA hal. ${kartu.sumberHalamanKIA[0]}`
      : `Buku KIA hal. ${kartu.sumberHalamanKIA.join(' dan ')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={kartu.judul}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(58,37,48,.35)',
        padding: 20,
      }}
      onClick={onTutup}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px 24px 24px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 24px 48px -12px rgba(58,37,48,.22)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8A7A80',
            padding: 4,
            borderRadius: 8,
          }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 8px',
            lineHeight: 1.25,
            paddingRight: 28,
          }}
        >
          {kartu.judul}
        </h2>

        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#A98DA0',
            margin: '0 0 20px',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {sumber}
        </p>

        <div
          style={{
            background: '#FDF8F5',
            borderRadius: 14,
            padding: '18px 16px',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            color: '#6E3B57',
          }}
        >
          Sedang disiapkan.
        </div>
      </div>
    </div>
  );
}

export default function KartuEdukasi() {
  const [terbuka, setTerbuka] = useState<KartuEdukasiData | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
        {KARTU_EDUKASI.map(kartu => {
          const sumber =
            kartu.sumberHalamanKIA.length === 1
              ? `KIA hal. ${kartu.sumberHalamanKIA[0]}`
              : `KIA hal. ${kartu.sumberHalamanKIA.join(' dan ')}`;

          return (
            <button
              key={kartu.id}
              type="button"
              onClick={() => setTerbuka(kartu)}
              style={{
                background: '#fff',
                border: '1.5px solid rgba(224,82,107,.15)',
                borderRadius: 16,
                padding: '16px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'box-shadow 150ms ease, border-color 150ms ease',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 16px -4px rgba(224,82,107,.2)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '70% 70% 70% 4px',
                  background: '#F7C9D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E0526B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3A2530',
                  margin: 0,
                  lineHeight: 1.4,
                  flex: 1,
                }}
              >
                {kartu.judul}
              </p>

              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#A98DA0',
                }}
              >
                {sumber}
              </span>
            </button>
          );
        })}
      </div>

      {terbuka && (
        <ModalKartu kartu={terbuka} onTutup={() => setTerbuka(null)} />
      )}
    </>
  );
}
