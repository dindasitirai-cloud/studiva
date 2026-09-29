// Pratinjau satu situasi Bantu seperti yang dilihat orang tua: pertanyaan singkat lalu saran.
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { IsiBantu } from '../../../lib/supabase/bantu';
import { OPSI_MEMICU_B5 } from '../../../features/bantu/bantuSeed';

export default function PratinjauBantu({ isi, tayang = false }: { isi: IsiBantu; tayang?: boolean }) {
  return (
    <div className="rounded-[28px] border-[7px] border-pekat bg-kanvas p-4">
      <p className="truncate text-[11px] font-semibold text-pekat/50">Bantu · {isi.label || 'Tanpa label'}</p>
      {!tayang && (
        <span className="mt-2 inline-block rounded-md bg-kuning px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pekat">
          Draf · belum ditinjau
        </span>
      )}
      {isi.clarify.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {isi.clarify.map((c, i) => (
            <div key={i} className="rounded-2xl border border-ungu/60 bg-pucuk p-3">
              <p className="text-[12.5px] font-bold text-pekat">{c.pertanyaan || '…'}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.opsi.map(o => {
                  const b5 = c.opsi_keselamatan.includes(o) || OPSI_MEMICU_B5.includes(o);
                  return (
                    <span key={o} className={`inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-[11.5px] font-bold ${b5 ? 'border-rekah/50 text-rekah-tua' : 'border-rekah/15 text-pekat'}`}>
                      {b5 && <ShieldAlert className="h-3 w-3" aria-label="membuka layar keselamatan" />}{o}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-col gap-3">
        <p className="font-fraunces text-[14px] italic leading-snug text-pekat">{isi.validasi || '…'}</p>
        <ol className="flex flex-col gap-1.5">
          {isi.langkah.map((l, i) => (
            <li key={i} className="flex gap-2 rounded-xl bg-white px-3 py-2 text-[13px] text-pekat">
              <span className="font-fredoka font-semibold text-rekah">{i + 1}</span>{l || '…'}
            </li>
          ))}
        </ol>
        {isi.yang_diamati && <p className="text-[12.5px] text-pekat/80"><b className="text-pekat">Yang bisa diamati:</b> {isi.yang_diamati}</p>}
        <div className="rounded-xl bg-white p-3 text-[12.5px] text-pekat/80">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-pekat">Kenapa?</p>
          <p>{isi.kenapa_sederhana || '…'}</p>
          {isi.kenapa_sumber && (
            <p className="mt-1.5 text-[12px]"><span className="mr-1 rounded bg-langit/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase">sumber</span>{isi.kenapa_sumber}</p>
          )}
        </div>
        <span className="rounded-xl bg-ungu py-2 text-center text-[13px] font-bold text-pekat">Tambahkan ke Kelola</span>
      </div>
    </div>
  );
}
