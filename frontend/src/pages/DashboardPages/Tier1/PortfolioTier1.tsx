import React, { useMemo, useState } from 'react';
import { Filter, X, Image as ImageIcon, Video, PlayCircle, FolderOpen, CalendarDays } from 'lucide-react';
import { useDashboardTier1, PortfolioCategory, PortfolioItemTier1 } from './DashboardTier1Context';
import { PORTFOLIO_CATEGORY_META } from './portfolioCategoryMeta';

const ALL_CATEGORIES = Object.keys(PORTFOLIO_CATEGORY_META) as PortfolioCategory[];

function Lightbox({ item, onClose }: { item: PortfolioItemTier1; onClose: () => void }) {
  const meta = PORTFOLIO_CATEGORY_META[item.category];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/50 px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(16,58,107,.25)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex h-56 items-center justify-center" style={{ backgroundColor: `${item.thumbnailColor}33` }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stv-navy hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
          {item.mediaType === 'video' ? (
            <PlayCircle className="h-16 w-16" style={{ color: item.thumbnailColor }} strokeWidth={1.5} />
          ) : (
            <ImageIcon className="h-16 w-16" style={{ color: item.thumbnailColor }} strokeWidth={1.5} />
          )}
        </div>
        <div className="p-5">
          <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.bg} ${meta.text}`}>{meta.label}</span>
          <h3 className="mt-2 font-baloo text-[17px] font-bold text-stv-navy">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-stv-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-3 text-[14px] leading-[1.65] text-stv-body">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioTier1() {
  const { portfolioItems } = useDashboardTier1();
  const [activeCategories, setActiveCategories] = useState<PortfolioCategory[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItemTier1 | null>(null);

  function toggleCategory(cat: PortfolioCategory) {
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  const filteredItems = useMemo(() => {
    if (activeCategories.length === 0) return portfolioItems;
    return portfolioItems.filter(item => activeCategories.includes(item.category));
  }, [portfolioItems, activeCategories]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Portfolio</h2>
        <p className="text-[14px] text-stv-muted">Galeri foto & video hasil karya anak Anda di sekolah.</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-stv-navy">
          <Filter className="h-4 w-4" />
          Kategori:
        </span>
        {ALL_CATEGORIES.map(cat => {
          const meta = PORTFOLIO_CATEGORY_META[cat];
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
        {activeCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveCategories([])}
            className="flex items-center gap-1 text-[12px] font-semibold text-stv-muted hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Gallery */}
      {portfolioItems.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-purple-200 py-14 text-center">
          <FolderOpen className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada karya yang diunggah</p>
          <p className="mt-1 text-[13px] text-stv-muted">Karya anak Anda akan muncul di sini begitu guru menambahkannya.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-purple-200 py-14 text-center">
          <Filter className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada karya pada kategori ini</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const meta = PORTFOLIO_CATEGORY_META[item.category];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="animate-fade-in-up overflow-hidden rounded-2xl bg-white text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className="relative flex h-36 items-center justify-center" style={{ backgroundColor: `${item.thumbnailColor}33` }}>
                  {item.mediaType === 'video' ? (
                    <Video className="h-9 w-9" style={{ color: item.thumbnailColor }} />
                  ) : (
                    <ImageIcon className="h-9 w-9" style={{ color: item.thumbnailColor }} />
                  )}
                </div>
                <div className="p-4">
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text}`}>{meta.label}</span>
                  <p className="mt-2 truncate font-baloo text-[14px] font-bold text-stv-navy">{item.title}</p>
                  <p className="mt-0.5 text-[12px] text-stv-muted">
                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedItem && <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
