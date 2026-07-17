// Tracker Konten — admin page for monitoring content freshness across all
// 60 knowledge cards (10 age bands × 6 domains). Three tabs:
//   Matriks: 6×10 grid with per-cell freshness + drawer
//   Modul:   table of 18 knowledge modules with freshness and flag actions
//   Sumber:  source watch-list with quarterly inspection workflow
//
// All state lives in useState (never localStorage).
// TODO: replace initXxxState() helpers with API fetches (GET /admin/content-state).

import React, { useMemo, useState, useCallback } from 'react';
import { LayoutGrid, BookOpen, Library, Flag, CalendarCheck } from 'lucide-react';

import { CARDS, DomainCode, KnowledgeCard } from '@studiva/shared';
import { DOMAIN_CONFIG_MAP } from '@studiva/shared';
import { MODULES } from '@studiva/shared';
import { SOURCES } from '@studiva/shared';
import { buildUsageMap } from '../../../lib/buildUsageMap';
import {
  hitungFreshness,
  worstFreshness,
  Freshness,
  fmtYM,
} from '../../../lib/contentFreshness';

import {
  initSourceState,
  initModuleOverrides,
  initCardOverrides,
  initInspectionLog,
  currentYM,
  currentDate,
  ContentFlag,
  CardOverride,
  ModuleOverride,
  SourceSt,
} from './trackerTypes';
import { TrackerContext } from './TrackerContext';
import { MatrixGrid } from './MatrixGrid';
import { CellDrawer } from './CellDrawer';
import { ModuleTable } from './ModuleTable';
import { SourceTable } from './SourceTable';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isCardFilled(card: KnowledgeCard): boolean {
  return Array.isArray(card.scientific.sections) && card.scientific.sections.length > 0;
}

// ---------------------------------------------------------------------------
// Summary stats card
// ---------------------------------------------------------------------------
interface KpiProps { value: string | number; label: string; accent?: string }
function Kpi({ value, label, accent = 'text-stv-navy' }: KpiProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <p className={`font-baloo text-3xl font-extrabold ${accent}`}>{value}</p>
      <p className="mt-1 text-[13px] text-stv-muted">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function TrackerKontenAdmin() {
  // ---- Static derivations -------------------------------------------------
  const cards = CARDS;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cardIndex = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usageMap = useMemo(() => buildUsageMap(cards, MODULES), []);
  const now = useMemo(() => new Date(), []);

  // ---- State --------------------------------------------------------------
  const [cardOverrides, setCardOverrides] = useState<Record<string, CardOverride>>(
    initCardOverrides
  );
  const [moduleOverrides, setModuleOverrides] = useState<Record<string, ModuleOverride>>(
    initModuleOverrides
  );
  const [sourceState, setSourceState] = useState<Record<string, SourceSt>>(initSourceState);
  const [inspectionLog, setInspectionLog] = useState(initInspectionLog);
  const [activeTab, setActiveTab] = useState<'matriks' | 'modul' | 'sumber'>('matriks');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [highlightModuleId, setHighlightModuleId] = useState<string | null>(null);

  // ---- Derived freshness --------------------------------------------------

  const computeModuleFreshness = useCallback(
    (moduleId: string, domain: DomainCode = 'BH'): Freshness => {
      const mod = MODULES[moduleId];
      if (!mod) return 'segar';
      const override = moduleOverrides[moduleId];
      const acknowledgedAt = override?.acknowledgedAt;
      const lastReviewed = override?.lastReviewed ?? mod.lastReviewed;
      const modFlags = (override?.flags ?? []).filter(
        (f) => !acknowledgedAt || f.createdAt > acknowledgedAt
      );
      const srcCascade = mod.sourceIds.some((srcId) =>
        (sourceState[srcId]?.flags ?? []).some(
          (f) => !acknowledgedAt || f.createdAt > acknowledgedAt
        )
      );
      const adaFlag = modFlags.length > 0 || srcCascade;
      return hitungFreshness(lastReviewed, DOMAIN_CONFIG_MAP[domain]?.strictFreshness ?? false, adaFlag, now);
    },
    [moduleOverrides, sourceState, now]
  );

  const computeCellFreshness = useCallback(
    (card: KnowledgeCard): Freshness | null => {
      const override = cardOverrides[card.id];
      const reviewedDate =
        override?.reviewedDate ?? card.scientific.reviewedBy?.date;

      if (!reviewedDate) return null;

      const acknowledgedAt = override?.acknowledgedAt;
      const cardFlags = (override?.flags ?? []).filter(
        (f) => !acknowledgedAt || f.createdAt > acknowledgedAt
      );
      const cardAdaFlag = cardFlags.length > 0;

      const values: Freshness[] = [
        hitungFreshness(reviewedDate, DOMAIN_CONFIG_MAP[card.domain]?.strictFreshness ?? false, cardAdaFlag, now),
      ];

      for (const modId of usageMap.cardToModules[card.id] ?? []) {
        values.push(computeModuleFreshness(modId, card.domain as DomainCode));
      }

      return worstFreshness(values);
    },
    [cardOverrides, computeModuleFreshness, now, usageMap]
  );

  const getActiveFlags = useCallback(
    (cardId: string): ContentFlag[] => {
      const card = cardIndex[cardId];
      if (!card) return [];
      const override = cardOverrides[cardId];
      const acknowledgedAt = override?.acknowledgedAt;
      const cardFlags = (override?.flags ?? []).filter(
        (f) => !acknowledgedAt || f.createdAt > acknowledgedAt
      );
      const cascadeFlags: ContentFlag[] = [];
      for (const modId of usageMap.cardToModules[cardId] ?? []) {
        const mod = MODULES[modId];
        if (!mod) continue;
        const modOverride = moduleOverrides[modId];
        const modAck = modOverride?.acknowledgedAt;
        const modFlags = (modOverride?.flags ?? []).filter(
          (f) => !acknowledgedAt || f.createdAt > acknowledgedAt
        );
        for (const f of modFlags) cascadeFlags.push(f);
        for (const srcId of mod.sourceIds) {
          for (const f of sourceState[srcId]?.flags ?? []) {
            if ((!acknowledgedAt || f.createdAt > acknowledgedAt) &&
                (!modAck || f.createdAt > modAck)) {
              cascadeFlags.push({ ...f, reason: `[Sumber: ${srcId}] ${f.reason}` });
            }
          }
        }
      }
      return [...cardFlags, ...cascadeFlags];
    },
    [cardIndex, cardOverrides, moduleOverrides, sourceState, usageMap]
  );

  // ---- Summary stats ------------------------------------------------------
  const totalFilled = cards.filter(isCardFilled).length;
  const freshnessDistribution = useMemo(() => {
    let segar = 0, menua = 0, perluTinjau = 0;
    for (const card of cards) {
      if (!isCardFilled(card)) continue;
      const f = computeCellFreshness(card);
      if (f === 'segar') segar++;
      else if (f === 'menua') menua++;
      else if (f === 'perlu-tinjau') perluTinjau++;
    }
    return { segar, menua, perluTinjau };
  }, [cards, computeCellFreshness]);

  const totalActiveFlags = useMemo(
    () => cards.reduce((n, c) => n + getActiveFlags(c.id).length, 0),
    [cards, getActiveFlags]
  );

  const oldestSourceChecked = useMemo(() => {
    const dates = Object.entries(sourceState)
      .filter(([id]) => SOURCES[id]?.type !== 'karya-klasik')
      .map(([, s]) => s.lastChecked)
      .filter(Boolean);
    return dates.sort()[0] ?? null;
  }, [sourceState]);

  // ---- Actions ------------------------------------------------------------
  const markCardValid = useCallback((cardId: string) => {
    const ym = currentYM();
    const today = currentDate();
    setCardOverrides((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        reviewedDate: ym,
        acknowledgedAt: today,
        flags: (prev[cardId]?.flags ?? []).filter((f) => f.type !== 'manual'),
      },
    }));
    // TODO: persist ke backend
  }, []);

  const flagCard = useCallback((cardId: string, reason: string) => {
    const flag: ContentFlag = {
      id: `flag-card-${Date.now()}`,
      type: 'manual',
      reason,
      createdAt: currentDate(),
    };
    setCardOverrides((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        flags: [...(prev[cardId]?.flags ?? []), flag],
      },
    }));
    // TODO: persist ke backend
  }, []);

  const markModuleValid = useCallback((moduleId: string) => {
    const today = currentDate();
    setModuleOverrides((prev) => ({
      ...prev,
      [moduleId]: {
        lastReviewed: currentYM(),
        flags: [],
        acknowledgedAt: today,
      },
    }));
    // TODO: persist ke backend
  }, []);

  const flagModule = useCallback((moduleId: string, reason: string) => {
    const flag: ContentFlag = {
      id: `flag-mod-${Date.now()}`,
      type: 'manual',
      reason,
      createdAt: currentDate(),
    };
    setModuleOverrides((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        flags: [...(prev[moduleId]?.flags ?? []), flag],
      },
    }));
    // TODO: persist ke backend
  }, []);

  const recordSourceNoChange = useCallback((sourceId: string, note?: string) => {
    const today = currentDate();
    setSourceState((prev) => ({
      ...prev,
      [sourceId]: { ...prev[sourceId], lastChecked: currentYM() },
    }));
    setInspectionLog((prev) => [
      { id: `log-${Date.now()}`, date: today, sourceId, result: 'no-change', note },
      ...prev,
    ]);
    // TODO: persist ke backend
  }, []);

  const recordSourceChanged = useCallback(
    (sourceId: string, note: string, url?: string) => {
      const today = currentDate();
      const flag: ContentFlag = {
        id: `flag-src-${Date.now()}`,
        type: 'source-change',
        reason: note,
        createdAt: today,
        sourceId,
        url,
      };
      setSourceState((prev) => ({
        ...prev,
        [sourceId]: {
          lastChecked: currentYM(),
          flags: [...(prev[sourceId]?.flags ?? []), flag],
        },
      }));
      setInspectionLog((prev) => [
        { id: `log-${Date.now()}`, date: today, sourceId, result: 'changed', note, url },
        ...prev,
      ]);
      // TODO: persist ke backend (flag akan dikaskadet secara dinamis dari sourceState — tidak perlu tulis ke modul)
    },
    []
  );

  // ---- Tab config ---------------------------------------------------------
  const TABS: { id: 'matriks' | 'modul' | 'sumber'; label: string; icon: React.ElementType }[] =
    [
      { id: 'matriks', label: 'Matriks',  icon: LayoutGrid },
      { id: 'modul',   label: 'Modul',    icon: BookOpen   },
      { id: 'sumber',  label: 'Sumber',   icon: Library    },
    ];

  // ---- Context value ------------------------------------------------------
  const contextValue = useMemo(
    () => ({
      cards,
      cardIndex,
      modules: MODULES,
      sources: SOURCES,
      usageMap,
      now,
      cardOverrides,
      moduleOverrides,
      sourceState,
      inspectionLog,
      activeTab,
      setActiveTab,
      selectedCardId,
      setSelectedCardId,
      highlightModuleId,
      setHighlightModuleId,
      computeModuleFreshness,
      computeCellFreshness,
      getActiveFlags,
      markCardValid,
      flagCard,
      markModuleValid,
      flagModule,
      recordSourceNoChange,
      recordSourceChanged,
    }),
    [
      cards, cardIndex, usageMap, now,
      cardOverrides, moduleOverrides, sourceState, inspectionLog,
      activeTab, selectedCardId, highlightModuleId,
      computeModuleFreshness, computeCellFreshness, getActiveFlags,
      markCardValid, flagCard, markModuleValid, flagModule,
      recordSourceNoChange, recordSourceChanged,
    ]
  );

  return (
    <TrackerContext.Provider value={contextValue}>
      <div className="flex flex-col gap-6">
        {/* Page heading */}
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">
            Tracker Konten
          </h2>
          <p className="mt-1 text-[14px] text-stv-muted">
            Pantau kesegaran konten, tinjau sumber, dan kelola flag secara terpusat.
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi value={`${totalFilled}/${cards.length}`} label="Detail ilmiah terisi" />
          <Kpi
            value={freshnessDistribution.segar}
            label="Sel segar"
            accent="text-emerald-600"
          />
          <Kpi
            value={freshnessDistribution.menua}
            label="Sel menua"
            accent="text-rekah"
          />
          <Kpi
            value={freshnessDistribution.perluTinjau}
            label="Perlu tinjau"
            accent="text-red-600"
          />
        </div>

        {/* Secondary meta */}
        <div className="flex flex-wrap items-center gap-4 text-[13px] text-stv-muted">
          {totalActiveFlags > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <Flag className="h-4 w-4" />
              {totalActiveFlags} flag aktif
            </span>
          )}
          {oldestSourceChecked && (
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4" />
              Sumber tertua diperiksa: {fmtYM(oldestSourceChecked)}
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSelectedCardId(null); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white text-stv-navy shadow-sm'
                  : 'text-stv-muted hover:text-stv-body'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'matriks' && (
          <>
            <MatrixGrid />
            {selectedCardId && <CellDrawer />}
          </>
        )}
        {activeTab === 'modul' && <ModuleTable />}
        {activeTab === 'sumber' && <SourceTable />}
      </div>
    </TrackerContext.Provider>
  );
}
