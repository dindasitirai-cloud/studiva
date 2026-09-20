// Rekah Journey — pure deterministic state machine (Phase 9B-3)
// evaluateTransition(input) -> TransitionDecision. PURE: no persistence, no Date/random,
// no content/focus/adaptation logic, no object-iteration-order dependence (rules are an ordered array).
import type { FsmInput, TransitionDecision, CanonicalState } from './types';
import type { Rule } from './transitionRules';
import { CANONICAL_RULES, ANY_RULES, nextInLoop } from './transitionRules';

const resolveTo = (rule: Rule, input: FsmInput): CanonicalState => {
  switch (rule.to) {
    case 'SAME': return input.currentState;
    case 'NEXT_IN_LOOP': return nextInLoop(input.currentState);
    case 'OVERRIDE_TARGET': return input.overrideTarget === 'STEP' ? 'DO' : 'FOCUS';
    default: return rule.to;
  }
};

const invalid = (input: FsmInput): TransitionDecision => ({
  allowed: false,
  fromState: input.currentState,
  trigger: input.trigger,
  toState: input.currentState,          // stays put on an invalid transition
  sideTransition: null,
  lifecycle: input.paused ? 'PAUSED' : 'RUNNING',
  resumeState: input.resumeState,
  reasonCode: 'INVALID_TRANSITION',
  ruleId: 'INVALID',
  ruleVersion: input.ruleVersion,
  result: 'INVALID_STATE',
});

const apply = (rule: Rule, input: FsmInput): TransitionDecision => ({
  allowed: true,
  fromState: input.currentState,
  trigger: input.trigger,
  toState: resolveTo(rule, input),
  sideTransition: rule.side,
  lifecycle: rule.lifecycle,
  resumeState: rule.setResumeToFrom ? input.currentState : null,
  reasonCode: rule.reason,
  ruleId: rule.ruleId,
  ruleVersion: input.ruleVersion,
  result: rule.result,
});

/**
 * Deterministically evaluate one journey transition.
 * Precedence: paused-guard -> specific-from rule -> ANY side-transition rule -> INVALID.
 * The FSM never selects content, ranks content, resolves focus, interprets reflections,
 * or mutates anything. It maps (state, explicit trigger) to the Phase 8A transition.
 */
export const evaluateTransition = (input: FsmInput): TransitionDecision => {
  // While paused, the ONLY valid trigger is RESUME (Phase 8A / 9B-2). Everything else is invalid.
  if (input.paused) {
    if (input.trigger !== 'RESUME') return invalid(input);
    if (input.resumeState === null) return invalid(input);
    return {
      allowed: true,
      fromState: input.currentState,
      trigger: input.trigger,
      toState: input.resumeState,        // resume to the exact stored canonical state
      sideTransition: 'RESUME',
      lifecycle: 'RUNNING',
      resumeState: null,
      reasonCode: 'PARENT_RESUME',
      ruleId: 'S-RESUME',
      ruleVersion: input.ruleVersion,
      result: 'OK',
    };
  }
  // RESUME is only valid from a paused condition.
  if (input.trigger === 'RESUME') return invalid(input);

  // Specific-from rules take precedence over ANY rules (deterministic).
  const specific = CANONICAL_RULES.find((r) => r.from === input.currentState && r.trigger === input.trigger);
  if (specific) return apply(specific, input);

  const any = ANY_RULES.find((r) => r.trigger === input.trigger);
  if (any) return apply(any, input);

  return invalid(input);
};
