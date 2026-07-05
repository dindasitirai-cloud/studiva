import React from 'react';
import { CheckCircle2, Bookmark } from 'lucide-react';
import { KnowledgeCard, AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode } from './knowledgeCardData';
import { CoverImage } from './BookCarousel';

const ALL_DOMAIN = '__all__' as const;
type ViewTab = 'semua' | 'dibaca' | 'disimpan';

interface BookGridProps {
  cards: KnowledgeCard[];
  selectedAge: AgeKey;
  setSelectedAge: (age: AgeKey) => void;
  selectedDomain: DomainCode | typeof ALL_DOMAIN;
  setSelectedDomain: (d: DomainCode | typeof ALL_DOMAIN) => void;
  viewTab: ViewTab;
  setViewTab: (t: ViewTab) => void;
  isRead: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  onBookClick: (card: KnowledgeCard) => void;
}

function BookCover({ card, isRead, isBookmarked, onToggleBookmark, onClick }: {
  card: KnowledgeCard;
  isRead: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  return (
    <div className="group relative w-full">
      <div
        className="relative w-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          paddingBottom: '133%',
          borderRadius: '5px 11px 11px 5px',
          boxShadow: '4px 4px 14px rgba(0,0,0,.18), inset -2px 0 4px rgba(0,0,0,.08)',
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        {/* Typographic illustrated cover (same as carousel) */}
        <CoverImage card={card} />

        {/* Read indicator (non-interactive badge, button is inside BookReader) */}
        {isRead && (
          <div className="absolute right-2 top-9 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-stv-green shadow">
            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Bookmark toggle button — top-right corner, outside the click-to-open area */}
      <button
        type="button"
        onClick={onToggleBookmark}
        aria-label={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
        className={`absolute right-1.5 top-1.5 z-40 flex h-7 w-7 items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,.18)] transition hover:scale-110 ${
          isBookmarked
            ? 'bg-amber-400 text-white'
            : 'bg-white/85 text-stv-muted hover:bg-white hover:text-amber-500'
        }`}
      >
        <Bookmark
          className="h-3.5 w-3.5"
          fill={isBookmarked ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

export default function BookGrid({
  cards, selectedAge, setSelectedAge, selectedDomain, setSelectedDomain,
  viewTab, setViewTab, isRead, isBookmarked, toggleBookmark, onBookClick,
}: BookGridProps) {

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Panduan Tumbuh Kembang</h2>
        <p className="text-[14px] text-stv-muted">
          Kartu pengetahuan tumbuh kembang anak usia 0–6 tahun, berbasis riset.
        </p>
      </div>

      {/* View tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'semua',    label: 'Semua Buku' },
          { id: 'dibaca',   label: 'Sudah Dibaca' },
          { id: 'disimpan', label: 'Disimpan' },
        ] as { id: ViewTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewTab(tab.id)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${
              viewTab === tab.id
                ? 'border-stv-navy bg-stv-navy text-white'
                : 'border-stv-border bg-white text-stv-body hover:border-stv-navy/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Age range pills */}
      {viewTab === 'semua' && (
        <div className="-mx-4 px-4 sm:-mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {AGE_RANGES.map(ar => {
              const isActive = selectedAge === ar.key;
              return (
                <button
                  key={ar.key}
                  type="button"
                  onClick={() => setSelectedAge(ar.key)}
                  className="shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-bold transition"
                  style={isActive
                    ? { background: ar.fill, color: ar.ink, borderColor: ar.ink }
                    : { background: 'white', color: '#888', borderColor: '#E5E7EB' }}
                >
                  {ar.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Domain filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedDomain(ALL_DOMAIN)}
          className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
            selectedDomain === ALL_DOMAIN
              ? 'border-stv-navy bg-stv-navy text-white'
              : 'border-stv-border bg-white text-stv-body hover:border-stv-navy/40'
          }`}
        >
          Semua
        </button>
        {(Object.entries(DOMAIN_MAP) as [DomainCode, typeof DOMAIN_MAP[DomainCode]][]).map(([code, info]) => {
          const isActive = selectedDomain === code;
          const Icon = info.icon;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedDomain(code)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition"
              style={isActive
                ? { background: info.bg, color: info.fg, borderColor: info.fg }
                : { background: 'white', color: '#888', borderColor: '#E5E7EB' }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Book grid */}
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stv-border bg-white py-16 text-center text-stv-muted">
          <p className="text-[15px] font-semibold">
            {viewTab === 'dibaca' ? 'Belum ada buku yang sudah dibaca.' :
             viewTab === 'disimpan' ? 'Belum ada buku yang disimpan.' :
             'Belum ada buku untuk filter ini.'}
          </p>
          <p className="mt-1 text-[13px]">
            {viewTab !== 'semua'
              ? 'Buka sebuah buku dan tandai sudah dibaca, atau simpan lewat ikon bookmark.'
              : 'Coba pilih rentang usia atau domain yang berbeda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map(card => (
            <BookCover
              key={card.id}
              card={card}
              isRead={isRead(card.id)}
              isBookmarked={isBookmarked(card.id)}
              onToggleBookmark={e => { e.stopPropagation(); toggleBookmark(card.id); }}
              onClick={() => onBookClick(card)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
