// =============================================================
// LaciTentangAnak — laci samping untuk memperbarui bidang Anak di Peta
// langsung dari Profil Anak (Phase 33). Memakai komponen pertanyaan yang
// SAMA dengan Kelola (PetaChips) dan instance store yang SAMA dengan halaman
// (dikirim lewat props). Caregiver & Rumah sengaja tidak ada di sini.
// =============================================================
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PetaChips, konfirmasiPeta } from '../irama-hari/KehidupanKeluarga';
import { BIDANG } from '../irama-hari/kehidupanData';
import type { PetaPertanyaan, PetaStore } from '../irama-hari/kehidupanData';
import { COPY_PROFIL } from './profil-anak-copy';

export function LaciTentangAnak({ nama, tahap, pertanyaan, peta, sorot, onTutup }: {
  nama: string;
  tahap: string;
  pertanyaan: PetaPertanyaan[];
  peta: PetaStore;
  sorot: string | null;
  onTutup: () => void;
}) {
  const C = COPY_PROFIL.laci;
  const tutupRef = useRef<HTMLButtonElement>(null);
  const isiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tutupRef.current?.focus();
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onTutup(); };
    window.addEventListener('keydown', h);
    const lama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = lama; };
  }, [onTutup]);

  useEffect(() => {
    if (!sorot) { isiRef.current?.scrollTo({ top: 0 }); return; }
    document.getElementById(`laci-q-${sorot}`)?.scrollIntoView({ block: 'start' });
  }, [sorot]);

  // Pertanyaan sensitif (kebutuhan khusus) selalu terakhir.
  const urut = [...pertanyaan].sort((a, b) => Number(!!a.sensitif) - Number(!!b.sensitif));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-pekat/30" onClick={onTutup} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="laci-tentang-judul"
        className="relative flex h-full w-full max-w-[460px] flex-col bg-kanvas shadow-[-12px_0_40px_rgba(110,59,87,.18)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-mawar/50 bg-white px-5 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <div>
            <h2 id="laci-tentang-judul" className="font-fredoka text-[19px] font-semibold text-pekat">{C.judul(nama)}</h2>
            <p className="mt-0.5 font-nunito text-[13px] text-ink-soft">{C.sub(tahap)}</p>
          </div>
          <button
            ref={tutupRef}
            type="button"
            onClick={onTutup}
            aria-label={C.tutup}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fajar text-pekat/60 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div ref={isiRef} className="flex-1 overflow-y-auto px-5 pb-4">
          {urut.map(q => (
            <div
              key={q.id}
              id={`laci-q-${q.id}`}
              className={`scroll-mt-3 rounded-2xl px-2 transition ${sorot === q.id ? 'bg-white ring-2 ring-rekah/60' : ''}`}
            >
              <PetaChips
                q={q}
                sel={peta.jawaban[q.id] ?? []}
                warna={BIDANG.anak.ink}
                onPilih={v => peta.pilih(q, v)}
                pesan={konfirmasiPeta(q.id, peta.jawaban[q.id] ?? [])}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mawar/50 bg-white px-5 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
          <p className="max-w-[26ch] font-nunito text-[12px] leading-snug text-ink-soft">{C.catatan}</p>
          <button
            type="button"
            onClick={onTutup}
            className="rounded-full bg-rekah px-5 py-2.5 font-nunito text-[14px] font-extrabold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
          >
            {C.selesai}
          </button>
        </div>
      </aside>
    </div>
  );
}
