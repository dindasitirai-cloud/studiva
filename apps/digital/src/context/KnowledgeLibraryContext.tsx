import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CARDS, KnowledgeCard } from '@studiva/shared';
import { api } from '../api/client';
import { supabase } from '../lib/supabase/client';
import { muatKatalogPanduan, aturStatusPanduan } from '../lib/supabase/panduan';

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
  /** Slug kartu yang tayang dari Supabase (tabel panduan_tumbuh, migrasi 027). */
  slugSupabase: Set<string>;
  muatUlangPanduan: () => Promise<void>;
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
  const [kartuDasar, setManagedCards] = useState<KnowledgeCard[]>(() => CARDS);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Kartu yang tayang lewat pipeline Rekah (Supabase, migrasi 027). Sumber utama untuk
  // website online — backend Express hanya berjalan di lokal. Prioritas: Supabase > backend > statis.
  const [kartuSupabase, setKartuSupabase] = useState<KnowledgeCard[]>([]);
  const muatUlangPanduan = useCallback(async () => {
    const rows = await muatKatalogPanduan();
    const baru = rows ? rows.map(r => r.kartu).filter(k => k.id && k.ageKey && k.domain) : [];
    // Hanya ganti state bila isinya berubah (onAuthStateChange juga terpicu saat token diperbarui).
    setKartuSupabase(prev => (JSON.stringify(prev) === JSON.stringify(baru) ? prev : baru));
  }, []);
  useEffect(() => {
    void muatUlangPanduan();
    const { data } = supabase.auth.onAuthStateChange(() => { void muatUlangPanduan(); });
    return () => data.subscription.unsubscribe();
  }, [muatUlangPanduan]);
  const slugSupabase = useMemo(() => new Set(kartuSupabase.map(k => k.id)), [kartuSupabase]);
  const managedCards = useMemo(
    () => [...kartuSupabase, ...kartuDasar.filter(c => !slugSupabase.has(c.id))],
    [kartuSupabase, kartuDasar, slugSupabase],
  );

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
          if (Array.isArray(data.cards)) {
            // API cards take priority; static CARDS fill in what the API doesn't have yet
            const apiIds = new Set<string>(data.cards.map((c: KnowledgeCard) => c.id));
            const merged = [...data.cards, ...CARDS.filter(c => !apiIds.has(c.id))];
            setManagedCards(merged);
            setApiLoaded(true);
            return;
          }
        }
        // Fall back to public endpoint (published only)
        const pubRes = await fetch(`${API}/api/kc-managed`, { headers }).catch(() => null);
        if (!cancelled && pubRes && pubRes.ok) {
          const data = await pubRes.json();
          if (Array.isArray(data.cards)) {
            const apiIds = new Set<string>(data.cards.map((c: KnowledgeCard) => c.id));
            const merged = [...data.cards, ...CARDS.filter(c => !apiIds.has(c.id))];
            setManagedCards(merged);
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
    if (slugSupabase.has(id)) {
      // Kartu tayang dari pipeline: arsipkan (riwayat tetap ada), bukan hapus permanen.
      setKartuSupabase(prev => prev.filter(c => c.id !== id));
      aturStatusPanduan(id, 'diarsipkan').catch(e => { console.warn('[wawasan] gagal mengarsipkan:', e); void muatUlangPanduan(); });
      return;
    }
    setManagedCards(prev => prev.filter(c => c.id !== id));
    api.delete(`/kc-managed/admin/${id}`).catch(() => {});
  }, [slugSupabase, muatUlangPanduan]);

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
      slugSupabase, muatUlangPanduan,
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
