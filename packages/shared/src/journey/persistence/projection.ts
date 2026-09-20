// Rekah Journey — projection rebuild & 9A-specified derivations (Phase 9B-2)
// PURE data mechanics: replays recorded transitions and applies the documented observation
// decay rule. Contains NO decision logic (no focus selection, ranking, or "what transition next").
import type { StoredEvent } from './events';
import { deserializeEvent } from './events';
import type { Observation, EffectiveObservation, ThreadJourneyStateProjection, TransitionEvent } from '../types';
import type { DevelopmentThreadId, FamilyJourneyId, IsoTimestamp } from '../ids';
import type { ObservationLifecycle, SalienceLevel } from '../enums';

const daysBetween = (a: IsoTimestamp, b: IsoTimestamp): number =>
  Math.floor((Date.parse(b) - Date.parse(a)) / 86_400_000);

/**
 * Derive an observation's effective lifecycle/salience as of `now`, per Phase 8A §I / 9A §13:
 * HIGH->MED at 14d, MED->LOW at 28d, LOW->EXPIRED at 56d without re-observation. Retracted overrides.
 * This is a data-lifecycle derivation, NOT a decision about what to do with the observation.
 */
export const deriveObservationLifecycle = (
  obs: Observation, now: IsoTimestamp,
): { lifecycle: ObservationLifecycle; effectiveSalience: SalienceLevel | null } => {
  if (obs.retracted) return { lifecycle: 'RETRACTED', effectiveSalience: null };
  const age = daysBetween(obs.observedAt, now);
  if (age >= 56) return { lifecycle: 'EXPIRED', effectiveSalience: null };
  // step the qualitative salience down by elapsed thresholds (never below the initial level's floor)
  const order: SalienceLevel[] = ['HIGH', 'MED', 'LOW'];
  let idx = order.indexOf(obs.salienceInitial);
  if (age >= 14) idx = Math.min(order.length - 1, idx + 1);
  if (age >= 28) idx = Math.min(order.length - 1, idx + 1);
  const effectiveSalience = order[idx];
  const lifecycle: ObservationLifecycle = age >= 14 ? 'SOFT_DECAY' : 'ACTIVE';
  return { lifecycle, effectiveSalience };
};

export const toEffectiveObservation = (obs: Observation, now: IsoTimestamp): EffectiveObservation => {
  const { lifecycle, effectiveSalience } = deriveObservationLifecycle(obs, now);
  return { ...obs, effectiveLifecycle: lifecycle, effectiveSalience };
};

/**
 * Rebuild a thread's current FSM projection by replaying its recorded TRANSITION events.
 * Pure fold: currentState = last recorded toState. PAUSED is treated as a lifecycle marker;
 * resumeState is the canonical state paused from (Phase 9B-2 §11 decision).
 */
export const rebuildThreadJourneyState = (
  familyJourneyId: FamilyJourneyId,
  threadId: DevelopmentThreadId,
  events: readonly StoredEvent[],
): ThreadJourneyStateProjection | null => {
  // Order by the AUTHORITATIVE stream sequence (StoredEvent.sequence), not the payload field.
  const transitions = events
    .filter((e) => e.kind === 'TRANSITION')
    .map((e) => ({ storedSeq: e.sequence, occurredAt: e.occurredAt, t: deserializeEvent(e).event as TransitionEvent }))
    .filter((x) => x.t.threadId === threadId)
    .sort((a, b) => a.storedSeq - b.storedSeq);
  if (transitions.length === 0) return null;

  const last = transitions[transitions.length - 1];
  let resumeState: ThreadJourneyStateProjection['resumeState'] = null;
  if (last.t.toState === 'PAUSED') {
    for (let i = transitions.length - 1; i >= 0; i--) {
      if (transitions[i].t.toState !== 'PAUSED') { resumeState = transitions[i].t.toState; break; }
    }
  }
  return {
    threadId,
    familyJourneyId,
    activeFocusId: null,               // focus linkage is projected by the focus/journey repos, not here
    currentState: last.t.toState,
    currentStageActionId: null,
    resumeState,
    pauseReason: last.t.toState === 'PAUSED' ? (last.t.reasonText || null) : null,
    stateEnteredAt: last.occurredAt,
    stateUpdatedAt: last.occurredAt,
    seq: last.storedSeq,
    lastTransitionId: last.t.transitionId,
  };
};
