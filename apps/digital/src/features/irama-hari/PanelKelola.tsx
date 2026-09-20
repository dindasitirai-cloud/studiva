// PanelKelola — panel kanan Kelola (Phase 15): Konteks Keluarga + Untuk Dikelola.
// Nyata: Anak (nama/usia) & Fokus (nilai). Caregiver/Perubahan & Inbox = placeholder
// sampai store Kehidupan Keluarga/Inbox dibangun (Tahap 3–4).
// Tanpa emoji (ilustrasi flat lucide). Copy DRAFT — review Fitri.
import React from 'react';
import { Baby, Sprout, Users2 } from 'lucide-react';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import type { NilaiAkar } from '../akar-keluarga/content';

export default function PanelKelola({ nilaiFokus = [], onKeInbox, onKeKeluarga }: {
  nilaiFokus?: readonly NilaiAkar[];
  onKeInbox?: () => void;
  onKeKeluarga?: () => void;
}) {
  const { profile, usiaBulan } = useChildProfile();
  const nama = profile.namaAnak || 'Anak';

  return (
    <aside className="flex flex-col gap-4">
      {/* Konteks Keluarga */}
      <div className="rounded-[18px] border border-pekat/10 bg-white px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-fredoka text-[15px] font-semibold text-pekat">Konteks Keluarga</h4>
          {onKeKeluarga && <button type="button" onClick={onKeKeluarga} className="font-nunito text-[11px] font-extrabold text-rekah-tua">Kelola</button>}
        </div>
        <div className="flex items-start gap-2.5 border-b border-dotted border-pekat/10 py-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-fajar text-rekah-tua"><Baby size={15} strokeWidth={2} /></span>
          <span><span className="block font-nunito text-[12.5px] font-extrabold text-pekat">{nama}{usiaBulan != null ? ` · ${usiaBulan} bln` : ''}</span><span className="font-nunito text-[11px] text-pekat/55">Tumbuh &amp; kembang</span></span>
        </div>
        {nilaiFokus.length > 0 && (
          <div className="flex items-start gap-2.5 border-b border-dotted border-pekat/10 py-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-fajar text-rekah-tua"><Sprout size={15} strokeWidth={2} /></span>
            <span><span className="block font-nunito text-[12.5px] font-extrabold text-pekat">Fokus</span><span className="font-nunito text-[11px] text-pekat/55">{nilaiFokus.join(' · ')}</span></span>
          </div>
        )}
        <button type="button" onClick={onKeKeluarga} className="flex w-full items-start gap-2.5 py-2 text-left">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-fajar text-rekah-tua"><Users2 size={15} strokeWidth={2} /></span>
          <span><span className="block font-nunito text-[12.5px] font-extrabold text-pekat">Caregiver &amp; Rumah</span><span className="font-nunito text-[11px] text-pekat/55">Lengkapi di Kehidupan Keluarga</span></span>
        </button>
      </div>

      {/* Untuk Dikelola */}
      <div className="rounded-[18px] border border-pekat/10 bg-white px-4 py-3.5">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="font-fredoka text-[15px] font-semibold text-pekat">Untuk Dikelola</h4>
          {onKeInbox && <button type="button" onClick={onKeInbox} className="font-nunito text-[11px] font-extrabold text-rekah-tua">Lihat semua</button>}
        </div>
        <p className="mb-2 font-nunito text-[10.5px] text-pekat/45">Contoh — akan terisi dari Inbox &amp; Kehidupan Keluarga.</p>
        {['Beli buku baru', 'Diskusikan bedtime dengan Ayah', 'Jadwalkan kontrol kesehatan'].map(t => (
          <div key={t} className="flex items-center gap-2.5 border-b border-dotted border-pekat/10 py-2 last:border-none">
            <span className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-rose-soft" />
            <span className="font-nunito text-[12.5px] font-bold text-pekat/80">{t}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
