// Rekah Journey — Full Engine Orchestration (Phase 9B-8). THE CONDUCTOR.
// PURE routing: for the current FSM state + trigger, run the ONE authoritative module for the
// destination state, map its decision to an FSM trigger, and compose a reused EngineResult.
// NO new ranking/precedence/focus/content/adaptation/transition logic. No persistence. No Date/random.
import type { JourneyEngineStepInput, JourneyStepResult } from './types';
import type {
  EngineResult, JourneyEngineOutput, ContentReference, FocusCandidate, VersionStamp,
} from '../types';
import type { EngineDecisionId } from '../ids';
import type { CanonicalState, TransitionDecision } from '../engine/types';
import type { TransitionTrigger, ReasonCode, FallbackStatus } from '../enums';
import { evaluateTransition } from '../engine/stateMachine';
import { resolveActiveThread } from '../multichild/resolveActiveThread';
import { resolveFocus } from '../focus/resolveFocus';
import { selectContent } from '../content/selectContent';
import { resolveAdaptation } from '../adaptation/resolveAdaptation';
import type { ActiveThreadDecision } from '../multichild/types';
import type { FocusResolution } from '../focus/types';
import type { ContentSelectionDecision } from '../content/types';
import type { AdaptationDecision } from '../adaptation/types';

const buildOutput = (
  nextState: CanonicalState, reasonCode: ReasonCode, reasonText: string, fallbackStatus: FallbackStatus,
  decisionRef: EngineDecisionId, focus: FocusResolution | null, content: ContentSelectionDecision | null,
): JourneyEngineOutput => {
  const focusRecommendation = focus && focus.proposed
    ? { candidates: [{ rationale: focus.reason, source: focus.proposed.source, targets: focus.proposed.targets }] as readonly FocusCandidate[] }
    : null;
  const selectedContent: readonly ContentReference[] = content && content.selected ? [content.selected] : [];
  return {
    nextState, focusRecommendation, contentCandidates: [], selectedContent,
    parentAction: null, reason: { code: reasonCode, text: reasonText }, fallbackStatus, decisionRef,
  };
};

export const journeyEngineStep = (input: JourneyEngineStepInput): JourneyStepResult => {
  const rv = input.versions.ruleVersion;
  // Deterministic decision reference derived from the idempotency key (no id minting / no random).
  const decisionRef = `${input.idempotencyKey}:decision` as unknown as EngineDecisionId;
  const fsm = (state: CanonicalState, trig: TransitionTrigger): TransitionDecision =>
    evaluateTransition({ currentState: state, paused: input.paused, resumeState: input.resumeState, trigger: trig, actor: input.actor, overrideTarget: input.overrideTarget, ruleVersion: rv });

  const compose = (
    result: EngineResult, transition: TransitionDecision, reasonCode: ReasonCode,
    activeThread: ActiveThreadDecision | null = null, focus: FocusResolution | null = null,
    content: ContentSelectionDecision | null = null, adaptation: AdaptationDecision | null = null,
  ): JourneyStepResult => ({
    result, transition, activeThread, focus, content, adaptation,
    nextState: transition.toState, reasonCode, versions: input.versions, ruleVersion: rv,
  });

  // ---- 1. Authoritative FSM transition for the caller's trigger. ----
  const t1 = fsm(input.currentState, input.trigger);
  if (!t1.allowed) {
    return compose({ kind: 'INVALID_STATE', attempted: input.trigger, from: input.currentState }, t1, 'INVALID_TRANSITION');
  }
  if (t1.result === 'PAUSED') {
    return compose({ kind: 'PAUSED', resumeState: t1.resumeState }, t1, 'PARENT_PAUSE');
  }

  const dest = t1.toState;
  const ok = (rc: ReasonCode, text: string, fb: FallbackStatus, f: FocusResolution | null, c: ContentSelectionDecision | null): EngineResult =>
    ({ kind: 'OK', output: buildOutput(dest, rc, text, fb, decisionRef, f, c) });

  // ---- Side transitions restore/route WITHOUT re-running content/focus modules. ----
  const SIDE_TRIGGERS = ['RESUME', 'SKIP', 'OVERRIDE', 'CHANGE_CHILD', 'CHANGE_CONTEXT', 'ABANDON', 'NO_MATCH'];
  if (SIDE_TRIGGERS.indexOf(input.trigger) !== -1) {
    if (input.trigger === 'CHANGE_CHILD') {
      const at = input.activeThreadInput ? resolveActiveThread(input.activeThreadInput) : null; // 9B-7 only
      return compose(ok(t1.reasonCode, 'Changed active child; entered NOTICE.', 'PRIMARY_MATCH', null, null), t1, t1.reasonCode, at);
    }
    if (input.trigger === 'OVERRIDE' || t1.result === 'PARENT_OVERRIDE') {
      return compose({ kind: 'PARENT_OVERRIDE', appliedFocusId: null }, t1, t1.reasonCode);
    }
    if (input.trigger === 'NO_MATCH') {
      return compose({ kind: 'NO_MATCH', gapReasonCode: 'NO_MATCH_ROUTED' }, t1, t1.reasonCode);
    }
    // RESUME / SKIP / CHANGE_CONTEXT / ABANDON: apply the transition; do not populate a module step.
    return compose(ok(t1.reasonCode, `Applied ${input.trigger}.`, 'PRIMARY_MATCH', null, null), t1, t1.reasonCode);
  }

  // ---- 2. Advance triggers: populate the destination state via its ONE authoritative module. ----
  switch (dest) {
    case 'NOTICE': {
      // Multi-child: who is active for the upcoming cycle (9B-7). Optional.
      const at = input.activeThreadInput ? resolveActiveThread(input.activeThreadInput) : null;
      return compose(ok(t1.reasonCode, 'Entered NOTICE.', 'PRIMARY_MATCH', null, null), t1, t1.reasonCode, at);
    }
    case 'FOCUS': {
      if (!input.focusInput) return compose({ kind: 'INSUFFICIENT_CONTEXT', missing: ['focusInput'] }, t1, 'NO_ELIGIBLE_CONTENT');
      const f = resolveFocus(input.focusInput);                 // 9B-4 is the ONLY focus authority
      if (f.outcome === 'NO_FOCUS') {
        const t2 = fsm('FOCUS', 'FOCUS_DEFERRED');              // routing: defer back to NOTICE
        return compose({ kind: 'NO_FOCUS' }, t2.allowed ? t2 : t1, f.reasonCode, null, f);
      }
      return compose(ok(f.reasonCode, f.reason, 'PRIMARY_MATCH', f, null), t1, f.reasonCode, null, f);
    }
    case 'PREPARE': {
      if (!input.contentInput) return compose({ kind: 'INSUFFICIENT_CONTEXT', missing: ['contentInput'] }, t1, 'NO_ELIGIBLE_CONTENT');
      const c = selectContent({ ...input.contentInput, currentState: 'PREPARE' }); // 9B-5 is the ONLY content authority
      const res: EngineResult = c.fallbackStatus === 'NO_MATCH'
        ? { kind: 'NO_MATCH', gapReasonCode: c.reasonCode }
        : ok(c.reasonCode, c.reason, c.fallbackStatus, null, c);
      return compose(res, t1, c.reasonCode, null, null, c);
    }
    case 'DO': {
      if (!input.contentInput) return compose({ kind: 'INSUFFICIENT_CONTEXT', missing: ['contentInput'] }, t1, 'NO_ELIGIBLE_CONTENT');
      const c = selectContent({ ...input.contentInput, currentState: 'DO' });
      let res: EngineResult;
      if (c.fallbackStatus === 'NO_MATCH') res = { kind: 'NO_MATCH', gapReasonCode: c.reasonCode };
      else if (c.fallbackStatus === 'FALLBACK_MATCH') res = { kind: 'FALLBACK_ONLY', output: buildOutput(dest, c.reasonCode, c.reason, 'FALLBACK_MATCH', decisionRef, null, c) };
      else res = ok(c.reasonCode, c.reason, 'PRIMARY_MATCH', null, c);
      return compose(res, t1, c.reasonCode, null, null, c);
    }
    case 'REFLECT':
      return compose(ok(t1.reasonCode, 'Entered REFLECT; awaiting reflection.', 'PRIMARY_MATCH', null, null), t1, t1.reasonCode);
    case 'ADAPT': {
      if (!input.adaptationInput) return compose({ kind: 'INSUFFICIENT_CONTEXT', missing: ['adaptationInput'] }, t1, 'NO_ELIGIBLE_CONTENT');
      const a = resolveAdaptation(input.adaptationInput);       // 9B-6 is the ONLY adaptation authority
      const t2 = fsm('ADAPT', a.outcome as TransitionTrigger);  // outcome name IS the FSM trigger (routing)
      const transition = t2.allowed ? t2 : t1;
      const out = buildOutput(transition.toState, a.reasonCode, a.reason, 'PRIMARY_MATCH', decisionRef, null, null);
      return compose({ kind: 'OK', output: out }, transition, a.reasonCode, null, null, null, a);
    }
    case 'GROUND':
      return compose(ok(t1.reasonCode, 'At GROUND.', 'PRIMARY_MATCH', null, null), t1, t1.reasonCode);
    default:
      return compose(ok(t1.reasonCode, `Entered ${dest}.`, 'PRIMARY_MATCH', null, null), t1, t1.reasonCode);
  }
};
