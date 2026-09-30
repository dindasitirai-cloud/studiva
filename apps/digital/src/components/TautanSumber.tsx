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
  /** Tampilkan label pendek (mis. "Yogman, M. dkk. (2018)" / "AAP HealthyChildren.org"), teks lengkap di tooltip. */
  ringkas?: boolean;
}

function labelPendek(teks: string): string {
  const tahun = /^(.+?\(\d{4}\))/.exec(teks);
  let l: string;
  if (tahun) l = tahun[1];
  else {
    const [lembaga, sisa] = teks.split(/\s+—\s+/);
    const judul = (sisa ?? '').split(/\.\s+https?:|\s+https?:/)[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
    l = judul ? `${lembaga} · ${judul}` : lembaga.split(/\.\s+https?:/)[0];
  }
  l = l.trim();
  return l.length > 48 ? `${l.slice(0, 46)}…` : l;
}

export default function TautanSumber({ sumber, pemisah = ' · ', className, style, ringkas = false }: Props) {
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
            title={b.jenis === 'cari' ? `Cari "${b.teks}" di Google Scholar` : ringkas ? b.teks : b.url}
            className="underline decoration-dotted decoration-1 underline-offset-2 transition hover:decoration-solid"
            style={{ color: 'inherit' }}
          >
            {ringkas ? labelPendek(b.teks) : b.teks}
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
