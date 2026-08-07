import React, { createContext, useContext, useReducer } from 'react';
import {
  EntriJurnal, StickerData, MomenData,
  MOCK_ENTRIES, MOCK_MOMENTS, MOCK_ACHIEVEMENTS,
  ANAK_LIST,
} from '../data/mockJurnalData';

// ================================================================
//  State & Actions
// ================================================================

export interface AchievementEntry {
  date: string;
  note: string;
}

interface JurnalState {
  activeAnakId: string;
  isBookOpen: boolean;
  activeMonth: number; // 0-11
  // Per-anak → per-month → ordered entries (user-added, merged with mock)
  customEntries: Record<string, Record<number, EntriJurnal[]>>;
  // Per-anak → per-month → stickers
  stickers: Record<string, Record<number, StickerData[]>>;
  // Per-anak → per-day → moment
  moments: Record<string, Record<number, MomenData>>;
  calendarMonth: number;
  calendarYear: number;
  // Per-anak → milestoneId → achievement
  achievements: Record<string, Record<string, AchievementEntry>>;
  // Pre-fill title when navigating from milestone to journal
  prefillTitle: string | null;
}

type Action =
  | { type: 'SET_ANAK'; anakId: string }
  | { type: 'OPEN_BOOK' }
  | { type: 'CLOSE_BOOK' }
  | { type: 'SET_MONTH'; month: number }
  | { type: 'ADD_ENTRY'; anakId: string; month: number; entry: EntriJurnal }
  | { type: 'DELETE_ENTRY'; anakId: string; month: number; entryId: string }
  | { type: 'ADD_STICKER'; anakId: string; month: number; sticker: StickerData }
  | { type: 'MOVE_STICKER'; anakId: string; month: number; id: string; x: number; y: number }
  | { type: 'DELETE_STICKER'; anakId: string; month: number; id: string }
  | { type: 'ADD_MOMENT'; anakId: string; moment: MomenData }
  | { type: 'MARK_ACHIEVED'; anakId: string; milestoneId: string; date: string; note: string }
  | { type: 'SET_PREFILL'; title: string }
  | { type: 'CLEAR_PREFILL' }
  | { type: 'SET_CALENDAR_MONTH'; month: number; year: number };

// ================================================================
//  Helpers
// ================================================================
function setIn<T>(
  obj: Record<string, Record<number, T[]>>,
  anakId: string,
  month: number,
  value: T[],
): Record<string, Record<number, T[]>> {
  return {
    ...obj,
    [anakId]: { ...(obj[anakId] ?? {}), [month]: value },
  };
}

function patchSticker(
  stickers: Record<string, Record<number, StickerData[]>>,
  anakId: string,
  month: number,
  id: string,
  patch: Partial<StickerData>,
): Record<string, Record<number, StickerData[]>> {
  const list = stickers[anakId]?.[month] ?? [];
  const updated = list.map(s => s.id === id ? { ...s, ...patch } : s);
  return setIn(stickers, anakId, month, updated);
}

// ================================================================
//  Reducer
// ================================================================
function reducer(state: JurnalState, action: Action): JurnalState {
  switch (action.type) {
    case 'SET_ANAK':
      return { ...state, activeAnakId: action.anakId, isBookOpen: false };

    case 'OPEN_BOOK':
      return { ...state, isBookOpen: true };

    case 'CLOSE_BOOK':
      return { ...state, isBookOpen: false };

    case 'SET_MONTH':
      return { ...state, activeMonth: action.month, isBookOpen: true };

    case 'ADD_ENTRY': {
      const existing = state.customEntries[action.anakId]?.[action.month] ?? [];
      return {
        ...state,
        customEntries: setIn(state.customEntries, action.anakId, action.month, [...existing, action.entry]),
      };
    }

    case 'DELETE_ENTRY': {
      const existing = state.customEntries[action.anakId]?.[action.month] ?? [];
      return {
        ...state,
        customEntries: setIn(
          state.customEntries, action.anakId, action.month,
          existing.filter(e => e.id !== action.entryId),
        ),
      };
    }

    case 'ADD_STICKER': {
      const existing = state.stickers[action.anakId]?.[action.month] ?? [];
      return {
        ...state,
        stickers: setIn(state.stickers, action.anakId, action.month, [...existing, action.sticker]),
      };
    }

    case 'MOVE_STICKER':
      return {
        ...state,
        stickers: patchSticker(state.stickers, action.anakId, action.month, action.id, { x: action.x, y: action.y }),
      };

    case 'DELETE_STICKER': {
      const existing = state.stickers[action.anakId]?.[action.month] ?? [];
      return {
        ...state,
        stickers: setIn(state.stickers, action.anakId, action.month, existing.filter(s => s.id !== action.id)),
      };
    }

    case 'ADD_MOMENT':
      return {
        ...state,
        moments: {
          ...state.moments,
          [action.anakId]: {
            ...(state.moments[action.anakId] ?? {}),
            [action.moment.day]: action.moment,
          },
        },
      };

    case 'MARK_ACHIEVED':
      return {
        ...state,
        achievements: {
          ...state.achievements,
          [action.anakId]: {
            ...(state.achievements[action.anakId] ?? {}),
            [action.milestoneId]: { date: action.date, note: action.note },
          },
        },
      };

    case 'SET_PREFILL':
      return { ...state, prefillTitle: action.title };

    case 'CLEAR_PREFILL':
      return { ...state, prefillTitle: null };

    case 'SET_CALENDAR_MONTH':
      return { ...state, calendarMonth: action.month, calendarYear: action.year };

    default:
      return state;
  }
}

// ================================================================
//  Context
// ================================================================
interface JurnalContextValue {
  state: JurnalState;
  dispatch: React.Dispatch<Action>;
  // Derived helpers
  activeEntries: EntriJurnal[];
  activeMoments: Record<number, MomenData>;
  activeAchievements: Record<string, AchievementEntry>;
}

const JurnalContext = createContext<JurnalContextValue | null>(null);

function buildInitialState(): JurnalState {
  const now = new Date();
  return {
    activeAnakId: ANAK_LIST[0].id,
    isBookOpen: false,
    activeMonth: now.getMonth(),
    customEntries: {},
    stickers: {},
    moments: MOCK_MOMENTS as Record<string, Record<number, MomenData>>,
    calendarMonth: now.getMonth(),
    calendarYear: now.getFullYear(),
    achievements: MOCK_ACHIEVEMENTS as Record<string, Record<string, AchievementEntry>>,
    prefillTitle: null,
  };
}

export function JurnalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  const activeEntries: EntriJurnal[] = [
    ...(MOCK_ENTRIES[state.activeAnakId]?.[state.activeMonth] ?? []),
    ...(state.customEntries[state.activeAnakId]?.[state.activeMonth] ?? []),
  ];

  const activeMoments: Record<number, MomenData> =
    state.moments[state.activeAnakId] ?? {};

  const activeAchievements: Record<string, AchievementEntry> =
    state.achievements[state.activeAnakId] ?? {};

  return (
    <JurnalContext.Provider value={{ state, dispatch, activeEntries, activeMoments, activeAchievements }}>
      {children}
    </JurnalContext.Provider>
  );
}

export function useJurnal(): JurnalContextValue {
  const ctx = useContext(JurnalContext);
  if (!ctx) throw new Error('useJurnal must be used within JurnalProvider');
  return ctx;
}
