// Rekah Journey — deterministic Reflection -> Adaptation (Phase 9B-6)
// PURE. resolveAdaptation(input) -> AdaptationDecision. No focus/content/FSM/persistence calls,
// no Date/random, no numeric score, no diagnosis. Reflection is navigation input, never a grade.
import type { AdaptationInput, AdaptationDecision, AdaptationProvenance } from './types';
import type { AdaptationOutcome, AdaptationTriggeredBy, ReasonCode } from '../enums';

const preserves = (o: AdaptationOutcome): boolean => o !== 'CHANGE_FOCUS' && o !== 'EXIT';

/** Reason code for a system-inferred/lifecycle outcome (all reuse existing codes except CHANGE_APPROACH). */
const systemReason = (o: AdaptationOutcome): ReasonCode => {
  switch (o) {
    case 'SIMPLIFY': return 'CONTEXT_FEASIBILITY';
    case 'CHANGE_APPROACH': return 'ADAPT_CHANGE_APPROACH';
    case 'CHANGE_CONTEXT': return 'CONTEXT_CHANGED';
    case 'CHANGE_FOCUS': return 'FOCUS_DEFERRED';
    case 'EXIT': return 'ABANDONED';
    case 'PAUSE': return 'PARENT_PAUSE';
    default: return 'FOCUS_CONTINUITY'; // CONTINUE, REPEAT, EXPLORE_DEEPER
  }
};

const decide = (
  input: AdaptationInput, outcome: AdaptationOutcome, provenance: AdaptationProvenance,
  triggeredBy: AdaptationTriggeredBy, reasonCode: ReasonCode, reason: string,
): AdaptationDecision => ({
  outcome, provenance, triggeredBy, focusId: input.focusId, preserveFocus: preserves(outcome),
  reasonCode, reason, versions: input.versions, ruleVersion: input.versions.ruleVersion,
});

/**
 * Interpret a completed/reflected action into the next adaptation outcome.
 * Precedence (Phase 8A): explicit parent > hard constraint > focus lifecycle > reflection > continuity default.
 * This function NEVER creates a focus, selects content, calls the FSM, or persists.
 */
export const resolveAdaptation = (input: AdaptationInput): AdaptationDecision => {
  const trig: AdaptationTriggeredBy = input.reflection ? 'REFLECTION' : 'DO_OUTCOME';

  // 1. EXPLICIT PARENT DECISION (authoritative; never overridden by inference).
  if (input.parentChosenOutcome) {
    return decide(input, input.parentChosenOutcome, 'PARENT_SELECTED', trig, 'PARENT_CHOICE',
      `Parent explicitly chose ${input.parentChosenOutcome}.`);
  }

  // 2. HARD JOURNEY CONSTRAINT.
  if (input.hardConstraint) {
    return decide(input, input.hardConstraint, 'SYSTEM_DERIVED', 'DO_OUTCOME', systemReason(input.hardConstraint),
      `A hard journey constraint requires ${input.hardConstraint}.`);
  }

  // 3. CURRENT FOCUS LIFECYCLE (authorized focus-lifecycle rule; parent origin already handled in step 1).
  if (input.focusLifecycleSignal) {
    if (input.focusLifecycleSignal === 'COMPLETED')
      return decide(input, 'EXIT', 'SYSTEM_DERIVED', 'DO_OUTCOME', 'STATE_COMPLETE', 'Current focus completed; exit this focus path.');
    if (input.focusLifecycleSignal === 'ABANDONED')
      return decide(input, 'EXIT', 'SYSTEM_DERIVED', 'DO_OUTCOME', 'ABANDONED', 'Current focus abandoned; exit this focus path.');
    return decide(input, 'CHANGE_FOCUS', 'SYSTEM_DERIVED', 'DO_OUTCOME', 'FOCUS_DEFERRED', 'Focus change requested; the next focus will be resolved separately.');
  }

  // 4. REFLECTION SIGNALS (system inference — only CONTINUE/REPEAT/SIMPLIFY/CHANGE_APPROACH).
  const refl = input.reflection;
  if (!refl) {
    // No reflection: Phase 8A default = CONTINUE once (then cadence eases upstream). Not fabricated.
    return decide(input, 'CONTINUE', 'SYSTEM_DERIVED', 'NO_REFLECTION_DEFAULT', 'FOCUS_CONTINUITY',
      'No reflection provided; continue by default (Phase 8A no-reflection rule).');
  }
  if (refl.difficulty === 'TOO_HARD') {
    return decide(input, 'SIMPLIFY', 'SYSTEM_DERIVED', 'REFLECTION', 'CONTEXT_FEASIBILITY',
      'Reflection indicates it was too difficult; simplify the step (not a developmental judgement).');
  }
  if (refl.relevance === 'NOT_RELEVANT') {
    // Same focus, different way — NOT an automatic focus change (which needs parent/lifecycle).
    return decide(input, 'CHANGE_APPROACH', 'SYSTEM_DERIVED', 'REFLECTION', 'ADAPT_CHANGE_APPROACH',
      'Reflection indicates the approach did not fit; change approach within the same focus.');
  }
  if (refl.willingnessToRepeat === true) {
    return decide(input, 'REPEAT', 'SYSTEM_DERIVED', 'REFLECTION', 'FOCUS_CONTINUITY',
      'Parent is willing to try the same approach again; repeat.');
  }

  // 5-6. CONTINUITY / DEFAULT SAFE OUTCOME.
  return decide(input, 'CONTINUE', 'SYSTEM_DERIVED', 'REFLECTION', 'FOCUS_CONTINUITY',
    'Current approach remains appropriate; continue.');
};
