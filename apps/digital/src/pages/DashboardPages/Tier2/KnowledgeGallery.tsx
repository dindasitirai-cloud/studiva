import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { User, LayoutGrid } from 'lucide-react';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { api } from '../../../api/client';
import {
  AgeKey, DomainCode, KnowledgeCard, AGE_RANGES,
} from './knowledgeCardData';
import BookGrid from './BookGrid';
import BookCarousel from './BookCarousel';
import BookReader from './BookReader';
import { fmtAge, ageInMonths } from './ProfilAnakTier2';

const ALL_DOMAIN = '__all__' as const;
type ViewTab = 'semua' | 'dibaca' | 'disimpan';
type View = 'grid' | 'carousel' | 'reader';
type ViewMode = 'personal' | 'browse';

// ── API card shape (snake_case) ──────────────────────────────────────────────

interface ApiKnowledgeCard {
  id: number; slug: string; age_key: string; domain: string; title: string;
  photo_src: string | null; photo_alt: string | null; photo_credit: string | null;
  read_minutes: number; is_medical: boolean; terjadi: string; penting: string;
  lakukan: string[]; perhatian: string; sci_title: string | null;
  sci_read_minutes: number | null; sci_paragraphs: string[]; sources: string[];
}

function apiToLocal(c: ApiKnowledgeCard): KnowledgeCard {
  return {
    id: c.slug,
    ageKey: c.age_key as AgeKey,
    domain: c.domain as DomainCode,
    title: c.title,
    photo: { src: c.photo_src ?? `/images/rl/${c.slug}.jpg`, alt: c.photo_alt ?? c.title, credit: c.photo_credit ?? undefined },
    readMinutes: c.read_minutes,
    isMedical: c.is_medical,
    summary: { terjadi: c.terjadi, penting: c.penting, lakukan: c.lakukan, perhatian: c.perhatian },
    scientific: { title: c.sci_title ?? '', readMinutes: c.sci_read_minutes ?? 0, paragraphs: c.sci_paragraphs },
    sources: c.sources,
  };
}

// ── Child age → AgeKey mapping ───────────────────────────────────────────────

function childAgeToAgeKey(ageMonths: number): AgeKey {
  // child.age stored as total months
  if (ageMonths < 3)   return '0-3m';
  if (ageMonths < 6)   return '3-6m';
  if (ageMonths < 9)   return '6-9m';
  if (ageMonths < 12)  return '9-12m';
  if (ageMonths < 18)  return '12-18m';
  if (ageMonths < 24)  return '18-24m';
  if (ageMonths < 36)  return '2-3y';
  if (ageMonths < 48)  return '3-4y';
  if (ageMonths < 60)  return '4-5y';
  return '5-6y';
}

// ── Main component ───────────────────────────────────────────────────────────

export default function KnowledgeGallery() {
  const { setSegments } = useAudioPlayer();
  const { isBookmarked, toggleBookmark, publishedCards } = useKnowledgeLibrary();
  const { children } = useDashboardTier2();

  // View mode: personal (auto age from child profile) vs browse (manual age select)
  const [viewMode, setViewMode]           = useState<ViewMode>('personal');
  const [selectedChildId, setSelectedChildId] = useState<string>(() => children[0]?.id ?? '');

  // View state machine
  const [view, setView]                   = useState<View>('grid');
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [viewTab, setViewTab]             = useState<ViewTab>('semua');
  const [selectedAge, setSelectedAge]     = useState<AgeKey>('0-3m');
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | typeof ALL_DOMAIN>(ALL_DOMAIN);

  // Auto-set age when switching to personal mode or when child changes
  const activeChild = children.find(c => c.id === selectedChildId) ?? children[0] ?? null;
  useEffect(() => {
    if (viewMode === 'personal' && activeChild) {
      setSelectedAge(childAgeToAgeKey(ageInMonths(activeChild.birthdate)));
      setViewTab('semua');
    }
  }, [viewMode, activeChild]);

  // API cards (merge with static)
  const [apiCards, setApiCards] = useState<KnowledgeCard[] | null>(null);
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    fetch(`${API_URL}/api/knowledge-cards`)
      .then(r => r.json())
      .then((data: { cards?: ApiKnowledgeCard[] }) => {
        if (Array.isArray(data.cards) && data.cards.length > 0)
          setApiCards(data.cards.map(apiToLocal));
      })
      .catch(() => {});
  }, []);

  // Merge: API cards (from backend) take priority; fall back to published managed cards
  const allCards = useMemo<KnowledgeCard[]>(() => {
    if (!apiCards) return publishedCards;
    const apiSlugs = new Set(apiCards.map(c => c.id));
    return [...apiCards, ...publishedCards.filter(c => !apiSlugs.has(c.id))];
  }, [apiCards, publishedCards]);

  // API-backed "sudah dibaca" state
  const [apiReadIds, setApiReadIds] = useState<Set<string>>(new Set());
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/knowledge-cards/reads')
      .then(r => setApiReadIds(new Set((r.data as { cardIds: string[] }).cardIds)))
      .catch(() => {});
  }, []);

  const isRead = useCallback((id: string) => apiReadIds.has(id) || localReadIds.has(id), [apiReadIds, localReadIds]);

  const toggleRead = useCallback(async (cardId: string) => {
    const wasRead = isRead(cardId);
    setLocalReadIds(prev => {
      const s = new Set(prev);
      wasRead ? s.delete(cardId) : s.add(cardId);
      return s;
    });
    setApiReadIds(prev => {
      const s = new Set(prev);
      wasRead ? s.delete(cardId) : s.add(cardId);
      return s;
    });
    try {
      await api.post('/knowledge-cards/reads', { cardId });
    } catch {
      setLocalReadIds(prev => {
        const s = new Set(prev);
        wasRead ? s.add(cardId) : s.delete(cardId);
        return s;
      });
    }
  }, [isRead]);

  // Filtered cards for grid
  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      const domainMatch = selectedDomain === ALL_DOMAIN || c.domain === selectedDomain;
      if (viewTab === 'dibaca')   return isRead(c.id) && domainMatch;
      if (viewTab === 'disimpan') return isBookmarked(c.id) && domainMatch;
      return c.ageKey === selectedAge && domainMatch;
    });
  }, [allCards, selectedAge, selectedDomain, viewTab, isRead, isBookmarked]);

  // Update audio playlist
  useEffect(() => {
    const segs = filteredCards.flatMap(c => [
      { cardId: c.id, part: 'summary' as const },
      { cardId: c.id, part: 'scientific' as const },
    ]);
    setSegments(segs);
  }, [filteredCards, setSegments]);

  const selectedCard = allCards.find(c => c.id === selectedId) ?? null;

  // Navigation handlers
  function handleBookClick(card: KnowledgeCard) {
    setSelectedId(card.id);
    setView('carousel');
  }

  function handleOpenBook(card: KnowledgeCard) {
    setSelectedId(card.id);
    setView('reader');
  }

  function handleBackToGrid() {
    setView('grid');
    setSelectedId(null);
  }

  function handleBackToCarousel() {
    setView('carousel');
  }

  // ── Render ──

  if (view === 'reader' && selectedCard) {
    const carouselCards = filteredCards.length > 0 ? filteredCards : allCards.filter(c => c.ageKey === selectedAge);
    const idx = carouselCards.findIndex(c => c.id === selectedCard.id);
    const prevCard = idx > 0 ? carouselCards[idx - 1] : null;
    const nextCard = idx < carouselCards.length - 1 ? carouselCards[idx + 1] : null;
    return (
      <BookReader
        key={selectedCard.id}
        card={selectedCard}
        isRead={isRead(selectedCard.id)}
        onToggleRead={() => toggleRead(selectedCard.id)}
        onClose={handleBackToCarousel}
        prevCard={prevCard}
        nextCard={nextCard}
        onNavigate={(c) => { setSelectedId(c.id); setView('carousel'); }}
        onNavigateInReader={(c) => setSelectedId(c.id)}
      />
    );
  }

  if (view === 'carousel') {
    return (
      <BookCarousel
        cards={filteredCards.length > 0 ? filteredCards : allCards.filter(c => c.ageKey === selectedAge)}
        selectedId={selectedId ?? filteredCards[0]?.id ?? allCards[0]?.id ?? ''}
        onSelect={setSelectedId}
        onOpen={handleOpenBook}
        onBack={handleBackToGrid}
      />
    );
  }

  // ── Grid view — Personal & Browse ──
  const ageRange = AGE_RANGES.find(r => r.key === selectedAge);
  const readCount = allCards.filter(c => isRead(c.id)).length;
  const savedCount = allCards.filter(c => isBookmarked(c.id)).length;
  const totalForAge = allCards.filter(c => c.ageKey === selectedAge).length;

  return (
    <div className="flex flex-col gap-5">
      {/* View mode toggle — only in grid view */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Panduan Tumbuh Kembang</h2>
          <p className="text-[14px] text-stv-muted">
            Kartu pengetahuan tumbuh kembang anak usia 0–6 tahun, berbasis riset.
          </p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button type="button"
            onClick={() => setViewMode('personal')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition ${
              viewMode === 'personal' ? 'bg-stv-navy text-white' : 'text-stv-muted hover:bg-slate-50'
            }`}>
            <User className="h-3.5 w-3.5" />
            Personal
          </button>
          <button type="button"
            onClick={() => setViewMode('browse')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition ${
              viewMode === 'browse' ? 'bg-stv-navy text-white' : 'text-stv-muted hover:bg-slate-50'
            }`}>
            <LayoutGrid className="h-3.5 w-3.5" />
            Jelajahi
          </button>
        </div>
      </div>

      {/* ── Personal header ── */}
      {viewMode === 'personal' && (
        <div className="flex flex-col gap-3">
          {/* Child selector (shown only when 2+ children) */}
          {children.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {children.map(c => (
                <button key={c.id} type="button"
                  onClick={() => setSelectedChildId(c.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                    selectedChildId === c.id
                      ? 'border-stv-navy bg-stv-navy text-white'
                      : 'border-slate-200 bg-white text-stv-body hover:border-stv-navy/40'
                  }`}>
                  <User className="h-3.5 w-3.5" />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Child info card */}
          {activeChild ? (
            <div className="rounded-2xl border border-stv-border bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: ageRange?.fill ?? '#F3F4F6' }}>
                  {activeChild.photo
                    ? <img src={activeChild.photo} alt={activeChild.name} className="h-12 w-12 rounded-2xl object-cover" />
                    : '👶'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-baloo text-[16px] font-bold text-stv-navy">{activeChild.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-stv-muted">{fmtAge(ageInMonths(activeChild.birthdate))}</span>
                    {ageRange && (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{ background: ageRange.fill, color: ageRange.ink }}>
                        {ageRange.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                  <p className="font-baloo text-[20px] font-bold text-stv-navy">{totalForAge}</p>
                  <p className="text-[11px] leading-tight text-stv-muted">Buku tersedia</p>
                </div>
                <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                  <p className="font-baloo text-[20px] font-bold text-stv-green">{readCount}</p>
                  <p className="text-[11px] leading-tight text-stv-muted">Sudah dibaca</p>
                </div>
                <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                  <p className="font-baloo text-[20px] font-bold text-amber-500">{savedCount}</p>
                  <p className="text-[11px] leading-tight text-stv-muted">Disimpan</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-stv-border p-8 text-center text-stv-muted">
              <p className="font-semibold text-stv-navy">Belum ada profil anak</p>
              <p className="mt-1 text-[13px]">Tambahkan profil anak di menu Profil Anak untuk rekomendasi personal.</p>
            </div>
          )}
        </div>
      )}

      {/* ── BookGrid (design unchanged, always rendered the same way) ── */}
      <BookGrid
        cards={filteredCards}
        selectedAge={selectedAge}
        setSelectedAge={age => {
          setSelectedAge(age);
          // when user manually picks age in personal mode, keep the selection
        }}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        viewTab={viewTab}
        setViewTab={setViewTab}
        isRead={isRead}
        isBookmarked={isBookmarked}
        toggleBookmark={toggleBookmark}
        onBookClick={handleBookClick}
        hideHeader={true}          // header is now above with the toggle
        hideAgeFilter={viewMode === 'personal' && viewTab === 'semua'}  // age auto-set in personal mode
      />
    </div>
  );
}
