import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import { api } from '../../../api/client';
import {
  CARDS, AgeKey, DomainCode, KnowledgeCard,
} from './knowledgeCardData';
import BookGrid from './BookGrid';
import BookCarousel from './BookCarousel';
import BookReader from './BookReader';

const ALL_DOMAIN = '__all__' as const;
type ViewTab = 'semua' | 'dibaca' | 'disimpan';
type View = 'grid' | 'carousel' | 'reader';

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

// ── Main component ───────────────────────────────────────────────────────────

export default function KnowledgeGallery() {
  const { setSegments } = useAudioPlayer();
  const { isBookmarked } = useKnowledgeLibrary();

  // View state machine
  const [view, setView]                   = useState<View>('grid');
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [viewTab, setViewTab]             = useState<ViewTab>('semua');
  const [selectedAge, setSelectedAge]     = useState<AgeKey>('0-3m');
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | typeof ALL_DOMAIN>(ALL_DOMAIN);

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

  const allCards = useMemo<KnowledgeCard[]>(() => {
    if (!apiCards) return CARDS;
    const apiSlugs = new Set(apiCards.map(c => c.id));
    return [...apiCards, ...CARDS.filter(c => !apiSlugs.has(c.id))];
  }, [apiCards]);

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
    // Optimistic update
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
      // Revert on error
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
    return (
      <BookReader
        card={selectedCard}
        isRead={isRead(selectedCard.id)}
        onToggleRead={() => toggleRead(selectedCard.id)}
        onClose={handleBackToCarousel}
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

  return (
    <BookGrid
      cards={filteredCards}
      selectedAge={selectedAge}
      setSelectedAge={setSelectedAge}
      selectedDomain={selectedDomain}
      setSelectedDomain={setSelectedDomain}
      viewTab={viewTab}
      setViewTab={setViewTab}
      isRead={isRead}
      isBookmarked={isBookmarked}
      onBookClick={handleBookClick}
    />
  );
}
