import React, { useMemo, useState } from 'react';
import { Filter, Info, Star, Smile, Meh, Frown, TrendingUp, X } from 'lucide-react';
import { useDashboardTier1, UpdateCategory, UpdateMood } from './DashboardTier1Context';
import { CATEGORY_META } from './updateCategoryMeta';

const MOOD_ICON: Record<UpdateMood, typeof Star> = { great: Star, good: Smile, ok: Meh, challenging: Frown };
const MOOD_COLOR: Record<UpdateMood, string> = {
  great: 'text-stv-green', good: 'text-stv-sky-stroke', ok: 'text-orange-500', challenging: 'text-red-500',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as UpdateCategory[];

export default function PerkembanganHarianTier1() {
  const { dailyUpdates } = useDashboardTier1();
  const [activeCategories, setActiveCategories] = useState<UpdateCategory[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function toggleCategory(cat: UpdateCategory) {
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function resetFilters() {
    setActiveCategories([]);
    setDateFrom('');
    setDateTo('');
  }

  const hasActiveFilter = activeCategories.length > 0 || dateFrom !== '' || dateTo !== '';

  const filteredUpdates = useMemo(() => {
    return dailyUpdates.filter(u => {
      if (activeCategories.length > 0 && !activeCategories.includes(u.category)) return false;
      const updateDate = u.date.slice(0, 10);
      if (dateFrom && updateDate < dateFrom) return false;
      if (dateTo && updateDate > dateTo) return false;
      return true;
    });
  }, [dailyUpdates, activeCategories, dateFrom, dateTo]);

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Perkembangan Harian</h2>
        <p className="text-[14px] text-stv-muted">Catatan harian dari guru tentang perkembangan anak Anda di sekolah.</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-stv-sky-tint px-4 py-3 text-[13px] text-stv-body">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-stv-sky-stroke" />
        Catatan ini diinput langsung oleh guru melalui panel guru dan bersifat hanya-baca bagi orang tua.
        {/* TODO: input guru lewat panel guru terpisah - integrasikan dengan backend DailyUpdate saat tersedia. */}
      </p>

      {/* Filter */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-stv-navy">
            <Filter className="h-4 w-4" />
            Filter
          </p>
          {hasActiveFilter && (
            <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-[12px] font-semibold text-stv-muted hover:text-red-500">
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const active = activeCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={active}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  active ? meta.chipActive : `${meta.bg} ${meta.text} hover:opacity-80`
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-stv-sky-tint px-3.5 py-2 text-[14px] focus:border-stv-sky-stroke focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-stv-sky-tint px-3.5 py-2 text-[14px] focus:border-stv-sky-stroke focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {dailyUpdates.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-orange-200 py-14 text-center">
          <TrendingUp className="h-10 w-10 text-orange-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada catatan dari guru</p>
          <p className="mt-1 text-[13px] text-stv-muted">Catatan perkembangan akan muncul di sini begitu guru menambahkannya.</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-orange-200 py-14 text-center">
          <Filter className="h-10 w-10 text-orange-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada catatan yang cocok</p>
          <p className="mt-1 text-[13px] text-stv-muted">Coba ubah atau hapus filter yang aktif.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredUpdates.map(update => {
            const meta = CATEGORY_META[update.category];
            const MoodIcon = update.mood ? MOOD_ICON[update.mood] : null;
            return (
              <div key={update.id} className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.bg} ${meta.text}`}>
                    {meta.label}
                  </span>
                  <span className="text-[12px] text-stv-muted">
                    {new Date(update.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.7] text-stv-body">{update.note}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[12px] text-stv-muted">,  {update.teacherName}</p>
                  {MoodIcon && <MoodIcon className={`h-4 w-4 ${MOOD_COLOR[update.mood!]}`} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
