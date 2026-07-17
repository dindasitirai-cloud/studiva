// Shared types and initial mock state for the Tracker Konten admin page.
// All runtime state lives in useState (never localStorage).
// TODO: replace initXxxState() with API fetches (GET /admin/content-state).

import { SOURCES } from '@studiva/shared';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface ContentFlag {
  id: string;
  type: 'source-change' | 'forum-report' | 'manual';
  reason: string;
  createdAt: string; // "YYYY-MM-DD"
  sourceId?: string;
  note?: string;
  url?: string;
}

export interface InspectionLogEntry {
  id: string;
  date: string;     // "YYYY-MM-DD"
  sourceId: string;
  result: 'no-change' | 'changed';
  note?: string;
  url?: string;
}

/** Local overrides + flags for a single card. */
export interface CardOverride {
  /** Overrides card.scientific.reviewedBy?.date when present. */
  reviewedDate?: string;    // "YYYY-MM"
  flags: ContentFlag[];
  /** Set by "Masih valid"; suppresses cascade flags created before this date. */
  acknowledgedAt?: string;  // "YYYY-MM-DD"
}

/** Local overrides + flags for a single module. */
export interface ModuleOverride {
  /** Overrides module.lastReviewed when present. */
  lastReviewed?: string;    // "YYYY-MM"
  flags: ContentFlag[];
  /** Set by "Masih valid"; suppresses source cascade flags created before this date. */
  acknowledgedAt?: string;  // "YYYY-MM-DD"
}

export interface SourceSt {
  lastChecked: string;  // "YYYY-MM"
  flags: ContentFlag[];
}

// ---------------------------------------------------------------------------
// Mock initial state
// ---------------------------------------------------------------------------

// Two older sources so the quarterly banner and visual variety show on first load.
const OLD_CHECKED_SOURCES = new Set(["aap-media", "cdc-sids"]);

export function initSourceState(): Record<string, SourceSt> {
  const result: Record<string, SourceSt> = {};
  for (const id of Object.keys(SOURCES)) {
    result[id] = {
      lastChecked: OLD_CHECKED_SOURCES.has(id) ? "2026-03" : "2026-07",
      flags: [],
    };
  }
  // Mock flag: simulates a quarterly check that found changes — cascades to screen-time → PS cards.
  result["aap-media"] = {
    lastChecked: "2026-03",
    flags: [
      {
        id: "mock-aap-media-flag-1",
        type: "source-change",
        reason: "Pembaruan rekomendasi batas waktu layar anak (contoh/mock)",
        createdAt: "2026-03-15",
        sourceId: "aap-media",
        note: "AAP memperbarui pedoman screen time — pastikan modul screen-time dan kartu PS yang memakai sumber ini masih akurat. (contoh/mock)",
      },
    ],
  };
  return result;
}

export function initModuleOverrides(): Record<string, ModuleOverride> {
  // No overrides at startup; cascades from sourceState are computed dynamically.
  return {};
}

export function initCardOverrides(): Record<string, CardOverride> {
  return {};
}

export function initInspectionLog(): InspectionLogEntry[] {
  return [
    {
      id: "log-mock-1",
      date: "2026-03-15",
      sourceId: "aap-media",
      result: "changed",
      note: "Pembaruan panduan screen time AAP — perlu tinjau modul screen-time dan kartu PS terkait. (contoh/mock)",
    },
    {
      id: "log-mock-2",
      date: "2026-07-01",
      sourceId: "harvard-brain",
      result: "no-change",
    },
  ];
}

// ---------------------------------------------------------------------------
// Helper: current year-month string "YYYY-MM"
// ---------------------------------------------------------------------------
export function currentYM(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function currentDate(): string {
  return new Date().toISOString().split("T")[0];
}
