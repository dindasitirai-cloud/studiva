import React from 'react';

interface PropsKartuModul {
  judul: string;
  subjudul: string;
  /** Warna ikon dan border */
  warna?: string;
  /** Ikon — SVG path data (viewBox 0 0 24 24) */
  ikonPath?: string;
  onClick?: () => void;
  /** Kalau tidak ada onClick, tampilkan sebagai kartu info statis */
  children?: React.ReactNode;
}

export default function KartuModul({
  judul,
  subjudul,
  warna = '#F06BA8',
  ikonPath,
  onClick,
  children,
}: PropsKartuModul) {
  const bgIkon = warna + '22'; // alpha 13%

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          textAlign: 'left',
          width: '100%',
          background: '#fff',
          border: `1.5px solid ${warna}26`,
          borderRadius: 20,
          padding: '16px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          transition: 'box-shadow 150ms ease',
        }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow =
            `0 6px 20px -4px ${warna}30`)
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')
        }
      >
        {ikonPath && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '70% 70% 70% 4px',
              background: bgIkon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={warna}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ikonPath} />
            </svg>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 600,
              color: '#3A2530',
              margin: '0 0 2px',
            }}
          >
            {judul}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12,
              color: '#A98DA0',
              margin: 0,
            }}
          >
            {subjudul}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C0A6B7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }

  // Kartu statis (tanpa onClick)
  return (
    <div
      style={{
        background: '#F9F5FB',
        border: `1px solid ${warna}20`,
        borderRadius: 20,
        padding: '16px 18px',
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 6px',
        }}
      >
        {judul}
      </p>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#6E3B57',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {subjudul}
      </p>
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}
