import React, { createContext, useCallback, useContext, useState } from 'react';

interface KnowledgeLibraryContextValue {
  readCardIds: Set<string>;
  bookmarkedCardIds: Set<string>;
  toggleRead: (id: string) => void;
  toggleBookmark: (id: string) => void;
  isRead: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  totalRead: number;
  totalBookmarked: number;
}

const KnowledgeLibraryContext = createContext<KnowledgeLibraryContextValue | null>(null);

export function KnowledgeLibraryProvider({ children }: { children: React.ReactNode }) {
  const [readCardIds, setReadCardIds]           = useState<Set<string>>(new Set());
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

  return (
    <KnowledgeLibraryContext.Provider value={{
      readCardIds, bookmarkedCardIds,
      toggleRead, toggleBookmark,
      isRead, isBookmarked,
      totalRead: readCardIds.size,
      totalBookmarked: bookmarkedCardIds.size,
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
