// Temani — kartu entry kontekstual (Model C). Dipakai di Beranda & Kelola.
// Menampilkan "Lanjutkan perjalananmu" + progres dots (seperti halaman Temani)
// bila ada perjalanan aktif. Additive; membaca progres dari localStorage.
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAnakAktif } from '../../context/AnakContext';
import { TEMANI_JOURNEYS } from './temaniSeed';

interface ProgresRingkas { slug: string; hari: number; status: string; }
function bacaProgres(idAnak: string): ProgresRingkas | null {
  try {
    const raw = window.localStorage.getItem(`rekah_temani_${idAnak}`);
    return raw ? (JSON.parse(raw) as ProgresRingkas) : null;
  } catch { return null; }
}

export default function TemaniEntryCard({ className = '' }: { className?: string }) {
  const { anak } = useAnakAktif();
  const p = bacaProgres(anak.id);
  const j = p ? TEMANI_JOURNEYS.find(x => x.slug === p.slug) : null;
  const aktif = !!(p && j && p.status === 'aktif');
  const total = j?.durasiHari ?? 0;
  const hari = p?.hari ?? 0;

  return (
    <Link
      to="/dashboard/tier2/temani"
      className={`relative flex items-center justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-fajar via-white to-white p-5 shadow-[0_10px_30px_-22px_rgba(90,50,70,0.5)] ${className}`}
    >
      <span className="min-w-0">
        <span className="block font-shantell text-lg text-rekah">temani</span>
        <span className="mt-0.5 block font-fredoka text-[16px] font-semibold text-pekat">
          {aktif ? 'Lanjutkan perjalananmu' : 'Mau ditemani menjalani sesuatu?'}
        </span>
        {aktif && j ? (
          <>
            <span className="mt-0.5 block truncate font-nunito text-[13px] text-pekat/70">{j.judul}</span>
            <span className="mt-2 flex items-center gap-1.5" aria-label={`Hari ${hari} dari ${total}`}>
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} aria-hidden className={`h-2 w-2 rounded-full ${i < hari ? 'bg-rekah' : 'bg-rose-soft'}`} />
              ))}
              <span className="ml-1.5 font-nunito text-[12px] font-bold text-pekat/60">Hari {hari} dari {total}</span>
            </span>
          </>
        ) : (
          <span className="mt-0.5 block truncate font-nunito text-[13px] text-pekat/70">Perjalanan lembut, langkah demi langkah</span>
        )}
      </span>
      <span className="ml-3 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-rekah text-white">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </span>
    </Link>
  );
}
