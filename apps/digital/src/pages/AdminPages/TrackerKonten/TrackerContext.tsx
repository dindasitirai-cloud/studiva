// Shared context for the Tracker Konten page.
// All state lives in the top-level page component (index.tsx); this context
// distributes it to child components without prop-drilling.

import { createContext, useContext } from 'react';
import { KnowledgeCard, DomainCode } from '@studiva/shared';
import { KnowledgeModule } from '@studiva/shared';
import { Source } from '@studiva/shared';
import { UsageMap } from '../../../lib/buildUsageMap';
import { Freshness } from '../../../lib/contentFreshness';
import {
  CardOverride,
  ModuleOverride,
  SourceSt,
  InspectionLogEntry,
  ContentFlag,
} from './trackerTypes';

export interface TrackerContextValue {
  // Data (static derivations)
  cards: KnowledgeCard[];
  cardIndex: Record<string, KnowledgeCard>;
  modules: Record<string, KnowledgeModule>;
  sources: Record<string, Source>;
  usageMap: UsageMap;
  now: Date;

  // State
  cardOverrides: Record<string, CardOverride>;
  moduleOverrides: Record<string, ModuleOverride>;
  sourceState: Record<string, SourceSt>;
  inspectionLog: InspectionLogEntry[];

  // Navigation
  activeTab: 'matriks' | 'modul' | 'sumber';
  setActiveTab: (tab: 'matriks' | 'modul' | 'sumber') => void;
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  highlightModuleId: string | null;
  setHighlightModuleId: (id: string | null) => void;

  // Derived freshness helpers
  computeModuleFreshness: (moduleId: string, domain?: DomainCode) => Freshness;
  computeCellFreshness: (card: KnowledgeCard) => Freshness | null;
  getActiveFlags: (cardId: string) => ContentFlag[];

  // Actions
  markCardValid: (cardId: string) => void;
  flagCard: (cardId: string, reason: string) => void;
  markModuleValid: (moduleId: string) => void;
  flagModule: (moduleId: string, reason: string) => void;
  recordSourceNoChange: (sourceId: string, note?: string) => void;
  recordSourceChanged: (sourceId: string, note: string, url?: string) => void;
}

export const TrackerContext = createContext<TrackerContextValue>(null!);
export const useTracker = () => useContext(TrackerContext);
