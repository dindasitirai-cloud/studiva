// =============================================================
// DetailKegiatan — modal detail satu kegiatan Ajak Main.
// Memakai ulang ActivityModal (LearningStrategiesTier2) dengan mencari Activity
// lengkap lewat sumberId. Fallback ringkas untuk item tanpa detail aktivitas.
// Additive; dipakai PilihanHariIni & SusunanHari.
// =============================================================
import React from 'react';
import { X } from 'lucide-react';
import { ACTIVITIES } from '../../data/learningStrategies';
import { ActivityModal } from '../../pages/DashboardPages/Tier2/LearningStrategiesTier2';
import type { ItemBekal } from '../beranda-usia/bekal';

export default function DetailKegiatan({ item, onClose }: { item: ItemBekal | null; onClose: () => void }) {
  if (!item) return null;

  const activity =
    item.tipe === 'aktivitas'
      ? ACTIVITIES.find(a => String(a.id) === item.sumberId) ?? null
      : null;

  if (activity) {
    return <ActivityModal activity={activity} onClose={onClose} />;
  }

  // Fallback: item tanpa detail aktivitas (mis. unduhan/panduan).
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(58,37,48,.4)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.judul}
        className="relative w-full max-w-md rounded-[22px] bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-pekat/40 hover:bg-mawar/20 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="pr-8 font-fredoka text-[20px] font-semibold text-pekat">{item.judul}</p>
        <p className="mt-2 font-nunito text-[13px] text-pekat/60">
          Detail lengkap untuk item ini belum tersedia.
        </p>
      </div>
    </div>
  );
}
