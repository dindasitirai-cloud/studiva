import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CARDS, KnowledgeCard } from '../pages/DashboardPages/Tier2/knowledgeCardData';
import { api } from '../api/client';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  // ── Managed content (admin-editable) ─────────────────────────────────────
  managedCards: KnowledgeCard[];
  publishedCards: KnowledgeCard[];
  apiLoaded: boolean;
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
  const [apiLoaded, setApiLoaded] = useState(false);

  // On mount: try to load from backend; fall back to static data if empty/unavailable
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem('studiva_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Try admin endpoint first (to include drafts for admin users), fall back to public
        const adminRes = await fetch(`${API}/api/kc-managed/admin/all`, { headers }).catch(() => null);
        if (!cancelled && adminRes && adminRes.ok) {
          const data = await adminRes.json();
          if (Array.isArray(data.cards) && data.cards.length > 0) {
            setManagedCards(data.cards);
            setApiLoaded(true);
            return;
          }
        }
        // Fall back to public endpoint (published only)
        const pubRes = await fetch(`${API}/api/kc-managed`, { headers }).catch(() => null);
        if (!cancelled && pubRes && pubRes.ok) {
          const data = await pubRes.json();
          if (Array.isArray(data.cards) && data.cards.length > 0) {
            setManagedCards(data.cards);
            setApiLoaded(true);
            return;
          }
        }
        // Backend empty or unreachable — keep static data
        if (!cancelled) setApiLoaded(false);
      } catch {
        if (!cancelled) setApiLoaded(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const adminAddCard = useCallback((card: Omit<KnowledgeCard, 'id'> & { id: string }) => {
    setManagedCards(prev => {
      const exists = prev.some(c => c.id === card.id);
      return exists ? prev.map(c => c.id === card.id ? card : c) : [...prev, card];
    });
    const status = card.adminStatus === 'draft' ? 'draft' : 'published';
    api.post('/kc-managed/admin', { ...card, adminStatus: status }).catch(() => {});
  }, []);

  const adminUpdateCard = useCallback((id: string, patch: Partial<KnowledgeCard>) => {
    setManagedCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    setManagedCards(prev => {
      const updated = prev.find(c => c.id === id);
      if (updated) api.put(`/kc-managed/admin/${id}`, updated).catch(() => {});
      return prev;
    });
  }, []);

  const adminDeleteCard = useCallback((id: string) => {
    setManagedCards(prev => prev.filter(c => c.id !== id));
    api.delete(`/kc-managed/admin/${id}`).catch(() => {});
  }, []);

  const adminSetCardStatus = useCallback((id: string, status: 'draft' | 'published') => {
    setManagedCards(prev => prev.map(c => c.id === id ? { ...c, adminStatus: status } : c));
    api.patch(`/kc-managed/admin/${id}/status`, { status }).catch(() => {});
  }, []);

  const publishedCards = managedCards.filter(c => c.adminStatus !== 'draft');

  return (
    <KnowledgeLibraryContext.Provider value={{
      readCardIds, bookmarkedCardIds,
      toggleRead, toggleBookmark,
      isRead, isBookmarked,
      totalRead: readCardIds.size,
      totalBookmarked: bookmarkedCardIds.size,
      managedCards, publishedCards, apiLoaded,
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
