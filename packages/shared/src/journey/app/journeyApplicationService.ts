// Rekah Journey — Application Service (Phase 10C-2 Slice 1). ADDITIVE.
// THE SOLE application boundary that may invoke the frozen orchestrator `journeyEngineStep`.
// It LOADS aggregates, ASSEMBLES fully-formed module inputs (mechanically, from persisted state +
// caller intent), DELEGATES all routing/selection/ranking to the engine, then PERSISTS the
// resulting events + projection. It contains NO FSM/focus/content/adaptation/multi-child logic:
// it never ranks, never chooses a focus, never computes fallback, never infers adaptation.
import { journeyEngineStep } from '../orchestrator';
import type { JourneyEngineStepInput, JourneyStepResult } from '../orchestrator/types';
import type { CanonicalState } from '../engine/types';
import type { EventStore, JourneyRepository } from '../persistence/repositories';
import type { JourneyEvent } from '../persistence/events';
import type { StoredEvent } from '../persistence/events';
import type {
  Focus, EffectiveObservation, Reflection, TransitionEvent, ThreadJourneyStateProjection,
  ContentReference, Adaptation, FamilyValue, ContentExposure, ParentActionEvent,
} from '../types';
import type { FocusTargets } from '../focus/types';
import type { AdaptationOutcome, TransitionTrigger, Actor, ParentActionType } from '../enums';
import type { ActiveThreadInput } from '../multichild/types';
import {
  FamilyJourneyId, DevelopmentThreadId, FocusId, IdempotencyKey, TransitionId,
  ActionInstanceId, AdaptationId, ContentExposureId, FamilyId, IsoTimestamp, ParentActionEventId,
} from '../ids';
import { REKAH_VERSIONS } from '../config/versions';
import { buildAllDescriptors } from './descriptorAssembly';

/** Small app-layer store for a focus's semantic targets (frozen `Focus` carries none). Additive;
 *  backed in production by the additive rekah_journey_focus.targets column. NOT a domain change. */
export interface FocusTargetsStore {
  getFocusTargets(focusId: FocusId): FocusTargets | null;
  saveFocusTargets(focusId: FocusId, targets: FocusTargets): void;
}

/** The caller's intent for one journey step. The service adds persisted state; it decides nothing. */
export interface StepRequest {
  readonly familyJourneyId: FamilyJourneyId;
  readonly familyId: FamilyId;
  readonly threadId: DevelopmentThreadId;
  readonly trigger: TransitionTrigger;
  readonly actor: Actor;
  readonly asOf: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
  readonly overrideTarget?: 'FOCUS' | 'STEP';
  // Optional intent/context (used only if the engine's destination needs it):
  readonly childAgeMonths?: number | null;
  readonly activeFocusId?: FocusId | null;
  readonly activeFocusTargets?: FocusTargets | null;   // for content stages
  readonly currentFocus?: Focus | null;                // for focus lifecycle
  readonly parentSelectedTargets?: FocusTargets | null;
  readonly observations?: readonly EffectiveObservation[];
  readonly directionValues?: readonly FamilyValue[];
  readonly reflection?: Reflection | null;
  readonly parentChosenOutcome?: AdaptationOutcome | null;
  readonly activeThreadInput?: ActiveThreadInput;
}

export class JourneyApplicationService {
  constructor(
    private readonly events: EventStore,
    private readonly journeys: JourneyRepository,
    private readonly focusTargets: FocusTargetsStore,
  ) {}

  /** Current FSM position for the thread (GROUND if no projection yet). Pure read. */
  private loadState(threadId: DevelopmentThreadId): { currentState: CanonicalState; paused: boolean; resumeState: CanonicalState | null; seq: number } {
    const r = this.journeys.getCurrentThreadState(threadId);
    if (r.kind !== 'OK') return { currentState: 'GROUND', paused: false, resumeState: null, seq: 0 };
    const p = r.value;
    const paused = p.currentState === 'PAUSED';
    const cur = (paused ? (p.resumeState ?? 'GROUND') : p.currentState) as CanonicalState;
    return { currentState: cur, paused, resumeState: (p.resumeState as CanonicalState | null) ?? null, seq: p.seq };
  }

  /** Assemble the orchestrator input. MECHANICAL only — no routing/ranking decisions. */
  private assemble(req: StepRequest, st: { currentState: CanonicalState; paused: boolean; resumeState: CanonicalState | null }): JourneyEngineStepInput {
    const rv = REKAH_VERSIONS.ruleVersion;
    return {
      currentState: st.currentState, paused: st.paused, resumeState: st.resumeState,
      trigger: req.trigger, actor: req.actor, overrideTarget: req.overrideTarget,
      versions: REKAH_VERSIONS, idempotencyKey: req.idempotencyKey,
      activeThreadInput: req.activeThreadInput,
      // focusInput assembled whenever focus context is available; engine uses it only if destination = FOCUS.
      focusInput: {
        asOf: req.asOf, ruleVersion: rv, activeThreadId: req.threadId,
        currentFocus: req.currentFocus ?? null,
        parentSelectedTargets: req.parentSelectedTargets ?? null,
        observations: req.observations ?? [],
        directionValues: req.directionValues ?? [],
      },
      // contentInput assembled whenever age is known; engine uses it only if destination = PREPARE/DO.
      contentInput: (req.childAgeMonths !== undefined) ? {
        asOf: req.asOf, versions: REKAH_VERSIONS,
        currentState: st.currentState, // orchestrator overrides with the destination stage
        activeFocusTargets: req.activeFocusTargets
          ?? (req.activeFocusId ? this.focusTargets.getFocusTargets(req.activeFocusId) : null),
        childAgeMonths: req.childAgeMonths ?? null,
        descriptors: buildAllDescriptors(),
      } : undefined,
      // adaptationInput assembled when a focus id is present; engine uses it only if destination = ADAPT.
      adaptationInput: req.activeFocusId !== undefined ? {
        versions: REKAH_VERSIONS, focusId: req.activeFocusId ?? null, threadId: req.threadId,
        reflection: req.reflection ?? null, parentChosenOutcome: req.parentChosenOutcome ?? null,
      } : undefined,
    };
  }

  /** Persist the transition + projection (+ content/adaptation facts) atomically at the app layer. */
  private persist(req: StepRequest, result: JourneyStepResult, seq: number): void {
    const streamId = req.familyJourneyId;
    // Event-store stream sequence is monotonic across ALL event kinds — use the current stream tail
    // as the optimistic expectedSequence (NOT the projection's own seq, which tracks transitions only).
    const streamTail = this.events.lastSequence(streamId);
    const te: TransitionEvent = {
      transitionId: TransitionId(`${req.idempotencyKey}:tr`), familyJourneyId: streamId, threadId: req.threadId,
      fromState: result.transition.fromState, trigger: result.transition.trigger, toState: result.nextState,
      actor: req.actor, reasonCode: result.reasonCode, reasonText: 'app-service', ruleVersion: REKAH_VERSIONS.ruleVersion,
      sequence: streamTail + 1, occurredAt: req.asOf, idempotencyKey: req.idempotencyKey,
    };
    const appended = this.events.append(streamId, { kind: 'TRANSITION', event: te }, req.idempotencyKey, req.asOf, streamTail);
    if (appended.kind !== 'OK' && appended.kind !== 'IDEMPOTENT_REPLAY') {
      // CONFLICT / MISMATCH surface to the caller through the projection; do not fabricate success.
      return;
    }
    const storedSeq = appended.kind === 'OK' ? appended.value.sequence : streamTail + 1;
    const proj: ThreadJourneyStateProjection = {
      threadId: req.threadId, familyJourneyId: streamId, activeFocusId: req.activeFocusId ?? null,
      currentState: result.transition.lifecycle === 'PAUSED' ? 'PAUSED' : result.nextState,
      currentStageActionId: null,
      resumeState: result.transition.lifecycle === 'PAUSED' ? result.transition.resumeState : null,
      pauseReason: result.transition.lifecycle === 'PAUSED' ? 'parent-pause' : null,
      stateEnteredAt: req.asOf, stateUpdatedAt: req.asOf, seq: storedSeq,
      lastTransitionId: te.transitionId,
    };
    this.journeys.saveThreadState(proj, seq);

    // Side facts (immutable REFERENCES only — never content bodies/titles/taxonomy):
    if (result.content && result.content.selected && result.content.selected.mappingId && result.content.stage && result.content.role) {
      const ref: ContentReference = result.content.selected;
      const mappingId = ref.mappingId!;
      const exposure: ContentExposure = {
        exposureId: ContentExposureId(`${req.idempotencyKey}:exp`), familyId: req.familyId, threadId: req.threadId,
        familyJourneyId: streamId, contentId: ref.contentId, mappingId, stage: result.content.stage,
        role: result.content.role, exposureType: 'SURFACED', occurredAt: req.asOf,
        idempotencyKey: IdempotencyKey(`${req.idempotencyKey}:exp`),
      };
      this.events.append(streamId, { kind: 'EXPOSURE', event: exposure }, IdempotencyKey(`${req.idempotencyKey}:exp`), req.asOf);
    }
    if (result.adaptation) {
      const a: Adaptation = {
        adaptationId: AdaptationId(`${req.idempotencyKey}:ad`), actionId: ActionInstanceId(`${req.idempotencyKey}:act`),
        reflectionId: req.reflection ? req.reflection.reflectionId : null, outcome: result.adaptation.outcome,
        triggeredBy: result.adaptation.triggeredBy, nextState: result.nextState, occurredAt: req.asOf,
      };
      this.events.append(streamId, { kind: 'ADAPTATION', event: a }, IdempotencyKey(`${req.idempotencyKey}:ad`), req.asOf);
    }
  }

  /** ADDITIVE (10E): persist a first-class ParentActionEvent (parent agency) through the SAME event
   *  boundary — no engine call, no decision, no state transition. Used for explicit accept / reject /
   *  select / skip. Idempotent by key. This is the ONLY new persistence path and it stays app-layer. */
  recordParentAction(input: {
    readonly familyJourneyId: FamilyJourneyId;
    readonly threadId: DevelopmentThreadId | null;
    readonly focusId?: FocusId | null;
    readonly actionType: ParentActionType;
    readonly detail?: string | null;
    readonly asOf: IsoTimestamp;
    readonly idempotencyKey: IdempotencyKey;
  }): void {
    const ev: ParentActionEvent = {
      parentActionId: ParentActionEventId(`${input.idempotencyKey}:pa`),
      familyJourneyId: input.familyJourneyId,
      threadId: input.threadId,
      focusId: input.focusId ?? null,
      actionId: null,
      contentId: null,
      actionType: input.actionType,
      detail: input.detail ?? null,
      occurredAt: input.asOf,
      idempotencyKey: input.idempotencyKey,
    };
    this.events.append(input.familyJourneyId, { kind: 'PARENT_ACTION', event: ev }, input.idempotencyKey, input.asOf);
  }

  /** ADDITIVE (10E-6): read-only history. Returns the append-only event stream for a family journey,
   *  oldest→newest, straight from the persistence boundary. No projection rewrite, no fabrication. */
  listEvents(streamId: FamilyJourneyId): readonly StoredEvent[] {
    return this.events.read(streamId);
  }

  /** One journey step: load → assemble → DELEGATE to engine → persist → return the engine's result. */
  step(req: StepRequest): JourneyStepResult {
    const st = this.loadState(req.threadId);
    const input = this.assemble(req, st);
    const result = journeyEngineStep(input);   // ALL decisions happen here, in the frozen engine.
    // Persist a focus's targets when the parent selects one (app-layer, additive).
    if (req.parentSelectedTargets && req.activeFocusId) this.focusTargets.saveFocusTargets(req.activeFocusId, req.parentSelectedTargets);
    this.persist(req, result, st.seq);
    return result;
  }
}
