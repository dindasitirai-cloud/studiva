// Rekah Journey — React hook + shared-service provider (Phase 10D real-data wiring + loop closure).
// ONE service (local-first store) + ONE session scratch are created per journey session via
// JourneyProvider and shared across all screens through context, so journey state AND the engine's
// chosen focus carry across navigation. The UI's only path to the journey; contains NO decision logic:
// it feeds REAL Rekah signals (Direction, multi-child thread, focus targets) into the frozen Application
// Service and threads the engine's OWN chosen focus targets forward (pure plumbing, not a decision).
import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAnakAktif } from '../../context/AnakContext';
import { createJourneyService } from './journeyService';
import { makeJourneyService } from './journeyDurableStaging'; // 10P/10Q: env-gated durable wiring (OFF unless REACT_APP_JOURNEY_DURABLE=1)
import { useJourneyData } from './useJourneyData';
import { toJourneyView } from '@studiva/shared/journey';
import type { JourneyView, StepRequest, JourneyStepResult, FamilyValue, FocusTargets, ParentActionType, EffectiveObservation } from '@studiva/shared/journey';

export type UIPhase = 'READY' | 'AUTH_REQUIRED' | 'OFFLINE';
export type Advance = Omit<StepRequest, 'familyJourneyId' | 'familyId' | 'threadId' | 'asOf' | 'idempotencyKey' | 'actor'>
  & { actor?: StepRequest['actor']; idempotencySuffix?: string; focusLabel?: string | null };

type Service = ReturnType<typeof createJourneyService>;
/** Session scratch — carries the engine's chosen focus (targets+id) and the last view across screen
 *  navigations. Plumbing only: targets/id are copied from the engine's OWN decision, never chosen here. */
interface Scratch { focusTargets: FocusTargets | null; focusId: string | null; lastView: JourneyView | null; observations: EffectiveObservation[]; }
interface Ctx { service: Service; scratch: React.MutableRefObject<Scratch>; }
const JourneyCtx = createContext<Ctx | null>(null);

/** Provides ONE journey service + scratch to the whole journey route subtree. */
export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const { supabaseUser } = useAuth();
  const service = useRef<Service>();
  const wiredUserId = useRef<string | null>(null);
  // (Re)create the service when it doesn't exist yet, OR when the authenticated user id becomes
  // available after an initial anonymous render — so the durable path can attach once login resolves.
  if (!service.current || (wiredUserId.current == null && !!supabaseUser?.id)) {
    service.current = makeJourneyService(supabaseUser?.id);
    wiredUserId.current = supabaseUser?.id ?? null;
  }
  const scratch = useRef<Scratch>({ focusTargets: null, focusId: null, lastView: null, observations: [] });
  const value = useRef<Ctx>({ service: service.current, scratch });
  value.current.service = service.current; // keep in sync if the service was just (re)created
  return <JourneyCtx.Provider value={value.current}>{children}</JourneyCtx.Provider>;
}

let counter = 0;
export function useJourney() {
  const ctx = useContext(JourneyCtx);
  const { supabaseUser } = useAuth();
  const { anak, usiaBulan } = useAnakAktif();
  const real = useJourneyData();
  const [view, setView] = useState<JourneyView | null>(ctx?.scratch.current.lastView ?? null);
  const [phase, setPhase] = useState<UIPhase>('READY');
  const [focusLabel, setFocusLabel] = useState<string | null>(null);

  const advance = useCallback((partial: Advance): JourneyStepResult | null => {
    if (!ctx) return null;
    if (!supabaseUser) { setPhase('AUTH_REQUIRED'); return null; }
    const sc = ctx.scratch.current;
    const familyId = supabaseUser.id as unknown as StepRequest['familyId'];
    const req = {
      ...partial,
      actor: partial.actor ?? 'PARENT',
      childAgeMonths: partial.childAgeMonths ?? usiaBulan,
      // Phase 10D — REAL Rekah signals + threaded engine-chosen focus (never overriding an explicit value):
      directionValues: partial.directionValues ?? real.directionValues,
      observations: partial.observations ?? ((): EffectiveObservation[] | undefined => {
        const mine = sc.observations.filter((o) => (o.childId as unknown as string) === (anak.id as unknown as string));
        return mine.length ? mine : undefined; })(),
      activeThreadInput: partial.activeThreadInput ?? real.activeThreadInput ?? undefined,
      activeFocusTargets: partial.activeFocusTargets ?? sc.focusTargets ?? undefined,
      activeFocusId: (partial.activeFocusId ?? sc.focusId ?? undefined) as StepRequest['activeFocusId'],
      familyJourneyId: (supabaseUser.id as unknown as StepRequest['familyJourneyId']),
      familyId,
      threadId: (anak.id as unknown as StepRequest['threadId']),
      asOf: new Date().toISOString(),
      idempotencyKey: (`${anak.id}:${partial.trigger}:${counter++}${partial.idempotencySuffix ?? ''}` as unknown as StepRequest['idempotencyKey']),
    } as StepRequest;
    // Parent's explicit choice is highest authority — thread it forward for content selection (10E-2).
    if (partial.parentSelectedTargets) { sc.focusTargets = partial.parentSelectedTargets; sc.focusId = `foc-${anak.id}`; }
    const result = ctx.service.step(req);
    // Thread the engine's OWN chosen focus forward (pure copy of its decision — not a decision here):
    if (result.focus && result.focus.proposed && result.focus.proposed.targets) {
      sc.focusTargets = result.focus.proposed.targets;
      sc.focusId = `foc-${anak.id}`;
    }
    if (partial.focusLabel !== undefined) setFocusLabel(partial.focusLabel);
    const v = toJourneyView(result, { childName: anak.namaAnak, focusLabel: partial.focusLabel ?? focusLabel });
    sc.lastView = v;
    setView(v);
    return result;
  }, [ctx, supabaseUser, anak, usiaBulan, focusLabel, real.directionValues, real.activeThreadInput]);

  // ADDITIVE (10E-2): persist a first-class parent-agency event through the App Service boundary.
  const recordParentAction = useCallback((actionType: ParentActionType, detail?: string | null) => {
    if (!ctx || !supabaseUser) return;
    ctx.service.recordParentAction({
      familyJourneyId: (supabaseUser.id as unknown as StepRequest['familyJourneyId']),
      threadId: (anak.id as unknown as StepRequest['threadId']),
      focusId: (ctx.scratch.current.focusId as unknown as any) ?? null,
      actionType, detail: detail ?? null,
      asOf: new Date().toISOString(),
      idempotencyKey: (`${anak.id}:pa:${actionType}:${counter++}` as unknown as StepRequest['idempotencyKey']),
    });
  }, [ctx, supabaseUser, anak]);

  // ADDITIVE (10G Track A): capture a parent observation for THIS active child, held for the session
  // and fed to resolveFocus on the next OBSERVED step (→ SYSTEM_SUGGESTED focus). Child-scoped.
  const recordObservation = useCallback((obs: EffectiveObservation) => {
    if (!ctx) return;
    // isolate by active child: keep only observations for the current thread/child
    const sc = ctx.scratch.current;
    sc.observations = [...sc.observations.filter((o) => (o.childId as unknown as string) === (anak.id as unknown as string)), obs];
  }, [ctx, anak]);
  const clearObservations = useCallback(() => { if (ctx) ctx.scratch.current.observations = []; }, [ctx]);

  return {
    view, phase, advance, recordParentAction, recordObservation, clearObservations,
    observationCount: ctx?.scratch.current.observations.length ?? 0, childName: anak.namaAnak, ageMonths: usiaBulan,
    listEvents: () => (ctx && supabaseUser) ? ctx.service.listEvents((supabaseUser.id) as any) : [],
    dataReady: real.ready,
    focusChoices: real.focusChoices as readonly FamilyValue[],
  };
}

/** Run `advance` exactly once — after `ready` (default true) becomes true so the entry step uses loaded
 *  real data. Defeats React StrictMode's double-invoke (dev) and guards re-firing a stage trigger. */
export function useEnter(advance: (p: Advance) => JourneyStepResult | null, partial: Advance, ready: boolean = true) {
  const ran = useRef(false);
  React.useEffect(() => {
    if (ran.current || !ready) return;
    ran.current = true;
    advance(partial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advance, ready]);
}
