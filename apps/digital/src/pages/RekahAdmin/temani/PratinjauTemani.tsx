// Pratinjau satu hari perjalanan Temani seperti yang dilihat orang tua (admin & peninjau).
import React from 'react';
import type { IsiTemani } from '../../../lib/supabase/temani';
import { kebiasaanById } from '../../../features/temani/temaniSeed';

export default function PratinjauTemani({
  isi, indeks, onPilih, tayang = false,
}: { isi: IsiTemani; indeks: number; onPilih?: (i: number) => void; tayang?: boolean }) {
  const i = Math.min(Math.max(indeks, 0), Math.max(isi.hari.length - 1, 0));
  const h = isi.hari[i];
  const kb = h?.jenis === 'target' ? kebiasaanById(h.kebiasaan_id) : undefined;

  return (
    <div className="rounded-[28px] border-[7px] border-pekat bg-kanvas p-4">
      <p className="truncate text-[11px] font-semibold text-pekat/50">Temani · {isi.judul || 'Tanpa judul'}</p>
      {!tayang && (
        <span className="mt-2 inline-block rounded-md bg-kuning px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pekat">
          Draf · belum ditinjau
        </span>
      )}
      {!h ? (
        <p className="py-10 text-center text-[13px] text-pekat/40">Belum ada hari.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {isi.hari.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  aria-label={`Lihat hari ${k + 1}`}
                  onClick={() => onPilih?.(k)}
                  className={`h-2.5 w-2.5 rounded-full ${k <= i ? 'bg-rekah' : 'bg-pekat/15'}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-pekat/50">Hari {h.hari} dari {isi.hari.length}</span>
          </div>
          <p className="font-fredoka text-[17px] font-semibold leading-snug text-pekat">{h.fokus_hari || '…'}</p>
          {h.script && (
            <p className="rounded-[18px_18px_18px_4px] bg-white px-3 py-2.5 font-fraunces text-[14px] italic text-pekat">
              “{h.script}”
            </p>
          )}
          <div className="rounded-xl bg-white p-3 text-[13px] text-pekat/80">
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-pekat">Kenapa?</p>
            <p>{h.kenapa_sederhana || '…'}</p>
            {h.kenapa_evidence && <p className="mt-1.5 text-pekat/55">{h.kenapa_evidence}</p>}
            {h.kenapa_sumber && (
              <p className="mt-1.5 text-[12px]">
                <span className="mr-1 rounded bg-langit/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase">sumber</span>
                {h.kenapa_sumber}
              </p>
            )}
          </div>
          {h.yang_diamati && (
            <p className="text-[13px] text-pekat/80"><b className="text-pekat">Yang bisa diamati:</b> {h.yang_diamati}</p>
          )}
          {h.jenis === 'target' && (
            <p className="text-[12px] font-semibold text-daun">
              {kb ? `Terhubung ke Kebiasaan Baik: ${kb.judul}` : `kebiasaan_id ${h.kebiasaan_id || '(kosong)'} belum dikenali`}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <span className="flex-1 rounded-xl bg-rekah py-2 text-center text-[13px] font-bold text-white">Saya akan coba</span>
            <span className="flex-1 rounded-xl bg-white py-2 text-center text-[13px] font-bold text-pekat/50">Nanti saja</span>
          </div>
        </div>
      )}
    </div>
  );
}
