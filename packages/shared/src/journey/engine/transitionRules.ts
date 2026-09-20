// Rekah Journey — the Phase 8A transition matrix as an explicit, ordered rule table (Phase 9B-3)
// Deterministic data only. Specific-from rules take precedence over ANY rules. No invented transitions.
import type { CanonicalState } from './types';
import type { TransitionTrigger, SideTransition, ReasonCode, EngineResultKind } from '../enums';

export type ToSpec = CanonicalState | 'SAME' | 'NEXT_IN_LOOP' | 'OVERRIDE_TARGET';

export interface Rule {
  readonly from: CanonicalState | 'ANY';
  readonly trigger: TransitionTrigger;
  readonly to: ToSpec;
  readonly side: SideTransition | null;
  readonly lifecycle: 'RUNNING' | 'PAUSED';
  readonly setResumeToFrom: boolean;       // PAUSE captures the canonical state to resume to
  readonly reason: ReasonCode;
  readonly result: EngineResultKind;
  readonly ruleId: string;
}

/** Canonical loop order (Phase 8A). ADAPT loops back to NOTICE. */
export const CANONICAL_ORDER: readonly CanonicalState[] = ['GROUND', 'NOTICE', 'FOCUS', 'PREPARE', 'DO', 'REFLECT', 'ADAPT'];
export const nextInLoop = (s: CanonicalState): CanonicalState => {
  const i = CANONICAL_ORDER.indexOf(s);
  return i === CANONICAL_ORDER.length - 1 ? 'NOTICE' : CANONICAL_ORDER[i + 1];
};

/** Specific-from canonical transitions (Phase 8A Section C + the unambiguous ADAPT outcomes from Section H). */
export const CANONICAL_RULES: readonly Rule[] = [
  { from: 'GROUND',  trigger: 'FOUNDATION_SET', to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'FOUNDATION_SET', result: 'OK', ruleId: 'C-GROUND-NOTICE' },
  { from: 'NOTICE',  trigger: 'OBSERVED',       to: 'FOCUS',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-NOTICE-FOCUS-OBS' },
  { from: 'NOTICE',  trigger: 'SKIPPED',        to: 'FOCUS',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-NOTICE-FOCUS-SKIP' },
  { from: 'NOTICE',  trigger: 'TIMEOUT',        to: 'FOCUS',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-NOTICE-FOCUS-TO' },
  { from: 'FOCUS',   trigger: 'FOCUS_SELECTED', to: 'PREPARE', side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'FOCUS_SELECTED', result: 'OK', ruleId: 'C-FOCUS-PREPARE' },
  { from: 'FOCUS',   trigger: 'FOCUS_DEFERRED', to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'FOCUS_DEFERRED', result: 'OK', ruleId: 'C-FOCUS-NOTICE' },
  { from: 'PREPARE', trigger: 'PREPARED',       to: 'DO',      side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-PREPARE-DO' },
  { from: 'DO',      trigger: 'ACTED',          to: 'REFLECT', side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-DO-REFLECT' },
  { from: 'DO',      trigger: 'NO_MATCH',       to: 'NOTICE',  side: 'NO_MATCH', lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'NO_MATCH_ROUTED', result: 'NO_MATCH', ruleId: 'C-DO-NOMATCH' },
  { from: 'REFLECT', trigger: 'REFLECTED',      to: 'ADAPT',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-REFLECT-ADAPT' },
  { from: 'REFLECT', trigger: 'SKIPPED',        to: 'ADAPT',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-REFLECT-ADAPT-SKIP' },
  { from: 'ADAPT',   trigger: 'CONTINUE',       to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-NOTICE-CONT' },
  { from: 'ADAPT',   trigger: 'REPEAT',         to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-NOTICE-REP' },
  { from: 'ADAPT',   trigger: 'SIMPLIFY',       to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-NOTICE-SIMP' },
  { from: 'ADAPT',   trigger: 'EXIT',           to: 'NOTICE',  side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-NOTICE-EXIT' },
  { from: 'ADAPT',   trigger: 'CHANGE_FOCUS',   to: 'FOCUS',   side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-FOCUS' },
  { from: 'ADAPT',   trigger: 'CHANGE_APPROACH', to: 'PREPARE', side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-PREPARE-APP' },
  { from: 'ADAPT',   trigger: 'EXPLORE_DEEPER', to: 'PREPARE', side: null, lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'STATE_COMPLETE', result: 'OK', ruleId: 'C-ADAPT-PREPARE-EXP' },
];

/** ANY-state side transitions (Phase 8A). Applied only when no specific-from rule matches. */
export const ANY_RULES: readonly Rule[] = [
  { from: 'ANY', trigger: 'PAUSE',          to: 'SAME',            side: 'PAUSE',          lifecycle: 'PAUSED',  setResumeToFrom: true,  reason: 'PARENT_PAUSE',   result: 'PAUSED',          ruleId: 'S-PAUSE' },
  { from: 'ANY', trigger: 'SKIP',           to: 'NEXT_IN_LOOP',    side: 'SKIP',           lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'PARENT_SKIP',    result: 'OK',              ruleId: 'S-SKIP' },
  { from: 'ANY', trigger: 'OVERRIDE',       to: 'OVERRIDE_TARGET', side: 'OVERRIDE',       lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'PARENT_OVERRIDE', result: 'PARENT_OVERRIDE', ruleId: 'S-OVERRIDE' },
  { from: 'ANY', trigger: 'CHANGE_CHILD',   to: 'NOTICE',          side: 'CHANGE_CHILD',   lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'CHILD_CHANGED',  result: 'OK',              ruleId: 'S-CHILD' },
  { from: 'ANY', trigger: 'CHANGE_CONTEXT', to: 'NOTICE',          side: 'CHANGE_CONTEXT', lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'CONTEXT_CHANGED', result: 'OK',              ruleId: 'S-CONTEXT' },
  { from: 'ANY', trigger: 'ABANDON',        to: 'FOCUS',           side: 'ABANDON',        lifecycle: 'RUNNING', setResumeToFrom: false, reason: 'ABANDONED',      result: 'OK',              ruleId: 'S-ABANDON' },
];
