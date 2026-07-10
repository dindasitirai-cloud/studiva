import React, { createContext, useCallback, useContext, useState } from 'react';
import { CARDS, KnowledgeCard } from '../pages/DashboardPages/Tier2/knowledgeCardData';

// TODO: sync all admin content changes to backend API when endpoints are ready

interface KnowledgeLibraryContextValue {
  // ── User interaction state ──────────────────────────────────────────────
  readCardIds: Set<string>;
  bookmarkedCardIds: Set<string>;
  toggleRead: (id: string) => void;
  toggleBookmark: (id: string) => void;
  isRead: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  totalRead: number;
  totalBookmarked: number;

  // ── Managed content (admin-editable, initialized from static CARDS) ─────
  // TODO: load from and persist to /api/knowledge-cards backend
  managedCards: KnowledgeCard[];
  publishedCards: KnowledgeCard[]; // managedCards where adminStatus !== 'draft'
  adminAddCard: (card: Omit<KnowledgeCard, 'id'> & { id: string }) => void;
  adminUpdateCard: (id: string, patch: Partial<KnowledgeCard>) => void;
  adminDeleteCard: (id: string) => void;
  adminSetCardStatus: (id: string, status: 'draft' | 'published') => void;
}

const KnowledgeLibraryContext = createContext<KnowledgeLibraryContextValue | null>(null);

export function KnowledgeLibraryProvider({ children }: { children: React.ReactNode }) {
  // ── User state ────────────────────────────────────────────────────────────
  const [readCardIds, setReadCardIds]             = useState<Set<string>>(new Set());
  const [bookmarkedCardIds, setBookmarkedCardIds] = useState<Set<string>>(new Set());

  const toggleRead = useCallback((id: string) => {
    setReadCardIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedCardIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isRead       = useCallback((id: string) => readCardIds.has(id),       [readCardIds]);
  const isBookmarked = useCallback((id: string) => bookmarkedCardIds.has(id), [bookmarkedCardIds]);

  // ── Managed content ───────────────────────────────────────────────────────
  const [managedCards, setManagedCards] = useState<KnowledgeCard[]>(() => CARDS);

  const adminAddCard = useCallback((card: Omit<KnowledgeCard, 'id'> & { id: string }) => {
    setManagedCards(prev => {
      // Replace if id already exists, otherwise append
      const exists = prev.some(c => c.id === card.id);
      return exists ? prev.map(c => c.id === card.id ? card : c) : [...prev, card];
    });
    // TODO: POST /api/knowledge-cards/admin
  }, []);

  const adminUpdateCard = useCallback((id: string, patch: Partial<KnowledgeCard>) => {
    setManagedCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    // TODO: PUT /api/knowledge-cards/admin/:id
  }, []);

  const adminDeleteCard = useCallback((id: string) => {
    setManagedCards(prev => prev.filter(c => c.id !== id));
    // TODO: DELETE /api/knowledge-cards/admin/:id
  }, []);

  const adminSetCardStatus = useCallback((id: string, status: 'draft' | 'published') => {
    setManagedCards(prev => prev.map(c => c.id === id ? { ...c, adminStatus: status } : c));
    // TODO: PATCH /api/knowledge-cards/admin/:id/status
  }, []);

  const publishedCards = managedCards.filter(c => c.adminStatus !== 'draft');

  return (
    <KnowledgeLibraryContext.Provider value={{
      readCardIds, bookmarkedCardIds,
      toggleRead, toggleBookmark,
      isRead, isBookmarked,
      totalRead: readCardIds.size,
      totalBookmarked: bookmarkedCardIds.size,
      managedCards, publishedCards,
      adminAddCard, adminUpdateCard, adminDeleteCard, adminSetCardStatus,
    }}>
      {children}
    </KnowledgeLibraryContext.Provider>
  );
}

export function useKnowledgeLibrary() {
  const ctx = useContext(KnowledgeLibraryContext);
  if (!ctx) throw new Error('useKnowledgeLibrary must be inside KnowledgeLibraryProvider');
  return ctx;
}
