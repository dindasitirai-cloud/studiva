// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { DomainCode, DomainConfig } from '@studiva/shared';
import { DOMAIN_CONFIG_MAP } from '@studiva/shared';
import { PANDUAN_BEKAL } from './content';

interface PropsPanduanBekal {
  panduan: readonly ItemBekal[];
}

export default function PanduanBekal({ panduan }: PropsPanduanBekal) {
  const itemOrangTua = panduan.filter(i => i.pemilik === 'orangtua');

  if (itemOrangTua.length === 0) {
    return (
      <section aria-labelledby="panduan-bekal-judul">
        <h2
          id="panduan-bekal-judul"
          className="mb-2 font-bricolage text-[15px] font-semibold text-pekat"
        >
          {PANDUAN_BEKAL.judul}
        </h2>
        <p className="text-[14px] text-pekat/50">{PANDUAN_BEKAL.kosong}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="panduan-bekal-judul">
      <h2
        id="panduan-bekal-judul"
        className="mb-5 font-bricolage text-[15px] font-semibold text-pekat"
      >
        {PANDUAN_BEKAL.judul}
      </h2>

      <ul className="flex flex-col gap-3">
        {itemOrangTua.map(item => (
          <BukuPanduan key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

// ─── Kartu buku panduan — desain book-card ────────────────────────────────────

interface PropsBukuPanduan {
  item: ItemBekal;
}

function BukuPanduan({ item }: PropsBukuPanduan) {
  const [terbuka, setTerbuka] = useState(false);

  const cfg: DomainConfig | undefined =
    DOMAIN_CONFIG_MAP[item.domain as DomainCode];

  const bg  = cfg?.bg  ?? '#FFF0F7';
  const fg  = cfg?.fg  ?? '#6E3B57';
  const label = cfg?.label ?? item.domain;

  return (
    <li className="overflow-hidden rounded-[20px] shadow-[0_2px_10px_rgba(110,59,87,0.07)]">
      {/* "Sampul" buku — bagian atas berwarna domain */}
      <button
        type="button"
        onClick={() => setTerbuka(v => !v)}
        aria-expanded={terbuka}
        aria-label={
          terbuka
            ? PANDUAN_BEKAL.tutupAriaLabel(item.judul)
            : PANDUAN_BEKAL.bukaAriaLabel(item.judul)
        }
        className="flex w-full items-stretch text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
      >
        {/* Punggung buku — strip kiri */}
        <div
          className="w-[8px] flex-none"
          style={{ background: fg }}
          aria-hidden
        />

        {/* Konten sampul */}
        <div
          className="flex flex-1 items-start justify-between gap-3 px-4 py-4"
          style={{ background: bg }}
        >
          <div className="flex-1">
            {/* Domain label kecil */}
            <p
              className="mb-1.5 font-nunito text-[10px] font-[800] uppercase tracking-widest"
              style={{ color: fg }}
            >
              {label}
            </p>

            {/* Judul buku */}
            <p className="font-bricolage text-[15px] font-bold leading-snug text-pekat">
              {item.judul}
            </p>
          </div>

          <span className="mt-0.5 flex-none" style={{ color: fg }} aria-hidden>
            {terbuka ? (
              <ChevronUp className="h-5 w-5" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-5 w-5" strokeWidth={2} />
            )}
          </span>
        </div>
      </button>

      {/* Halaman dalam buku — muncul saat dibuka */}
      {terbuka && (
        <div className="border-t bg-white px-5 pb-5 pt-4" style={{ borderColor: bg }}>
          {/* Domain + nilai chips */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className="rounded-full px-2.5 py-1 font-nunito text-[11px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {label}
            </span>
            {!item.tanpaTemaNilai &&
              item.nilai.map(n => (
                <span
                  key={n}
                  className="rounded-full bg-kanvas px-2.5 py-1 font-nunito text-[11px] text-pekat/65"
                >
                  {n}
                </span>
              ))}
          </div>

          {/* Placeholder isi bacaan */}
          <p className="mt-3 font-nunito text-[12px] italic text-pekat/40">
            {PANDUAN_BEKAL.isiBacaanSegera}
          </p>
        </div>
      )}
    </li>
  );
}
