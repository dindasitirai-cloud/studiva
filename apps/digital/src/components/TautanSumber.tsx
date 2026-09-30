// Tampilkan teks sumber sebagai tautan yang bisa diklik (tab baru). Lihat lib/tautanSumber.ts.
import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { pecahSumber } from '../lib/tautanSumber';

interface Props {
  /** Satu teks sumber (boleh berisi beberapa sumber dipisah ";"), atau daftar sumber. */
  sumber: string | readonly string[] | null | undefined;
  /** Pemisah antar sumber saat ditampilkan sebaris. */
  pemisah?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function TautanSumber({ sumber, pemisah = ' · ', className, style }: Props) {
  const daftar = (Array.isArray(sumber) ? sumber : [sumber as string | null | undefined]).flatMap(s => pecahSumber(s));
  if (!daftar.length) return null;
  return (
    <span className={className} style={style}>
      {daftar.map((b, i) => (
        <React.Fragment key={`${b.url}-${i}`}>
          {i > 0 && pemisah}
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={b.jenis === 'cari' ? `Cari "${b.teks}" di Google Scholar` : b.url}
            className="underline decoration-dotted decoration-1 underline-offset-2 transition hover:decoration-solid"
            style={{ color: 'inherit' }}
          >
            {b.teks}
            {b.jenis === 'cari'
              ? <Search aria-hidden className="ml-0.5 inline h-[0.85em] w-[0.85em] align-[-0.05em] opacity-70" strokeWidth={2.2} />
              : <ExternalLink aria-hidden className="ml-0.5 inline h-[0.85em] w-[0.85em] align-[-0.05em] opacity-70" strokeWidth={2.2} />}
            <span className="sr-only"> (buka di tab baru)</span>
          </a>
        </React.Fragment>
      ))}
    </span>
  );
}
