// Rekah Journey — deterministic Content Selection (Phase 9B-5)
// PURE. selectContent(input) -> ContentSelectionDecision. Downstream of focus. Canonical only.
// No content imports, no repo writes, no Date/random, no numeric score, no focus/FSM calls.
import type {
  ContentSelectionInput, ContentSelectionDecision, ContentDescriptor, ContentRankingDimension,
} from './types';
import { STATE_TO_CONTENT_STAGE, AM_MAX_AGE_MONTHS } from './types';
import type { ContentReference } from '../types';
import type { ContentId } from '../ids';
import type { JourneyRole, ContentStage, FallbackStatus } from '../enums';
import type { FocusTargets } from '../focus/types';
import { focusKey } from '../focus/resolveFocus';

const ACTIVITY_ROLES: readonly JourneyRole[] = ['DO', 'CONNECT'];

/** How strongly a content descriptor matches the resolved focus. 0 = no match (ineligible). */
function focusMatch(d: ContentDescriptor, f: FocusTargets): 0 | 1 | 2 {
  if (f.value != null) return d.familyValue === f.value ? 2 : 0;               // value focus: KB value link only
  const dom = f.domainOrArea, cap = f.capabilityOrTopic;
  if (dom != null) {
    // development axis
    if (d.devDomain === dom) return cap != null ? (d.devCapability === cap ? 2 : 0) : 1;
    // knowledge axis
    if (d.knowledgeArea === dom) return cap != null ? (d.knowledgeTopic === cap ? 2 : 0) : 1;
    return 0;
  }
  return 0;
}

/** Effective focus match: axis match, else an injected relatedFocusKeys relationship (e.g. parenting practices). */
function matchStrength(d: ContentDescriptor, f: FocusTargets): 0 | 1 | 2 {
  const fm = focusMatch(d, f);
  if (fm > 0) return fm;
  return d.relatedFocusKeys && d.relatedFocusKeys.includes(focusKey(f)) ? 2 : 0;
}

const ageEligible = (d: ContentDescriptor, age: number): boolean =>
  (d.ageMinMonths == null || age >= d.ageMinMonths) && (d.ageMaxMonths == null || age <= d.ageMaxMonths);

const ref = (d: ContentDescriptor): ContentReference => ({ contentId: d.mapping.contentId, mappingId: d.mapping.mappingId });

interface Ranked { d: ContentDescriptor; match: 0 | 1 | 2; rolePrimary: boolean; novel: boolean; }

function compare(a: Ranked, b: Ranked): number {
  if (b.match !== a.match) return b.match - a.match;                 // FOCUS_MATCH / CAPABILITY (exact>partial)
  if (b.rolePrimary !== a.rolePrimary) return Number(b.rolePrimary) - Number(a.rolePrimary); // ROLE_PRIMARY
  if (b.novel !== a.novel) return Number(b.novel) - Number(a.novel); // NOVELTY (soft)
  const ai = a.d.mapping.contentId as string, bi = b.d.mapping.contentId as string; // stable TIEBREAK: content_id asc
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

export const selectContent = (input: ContentSelectionInput): ContentSelectionDecision => {
  const base = {
    versions: input.versions, ruleVersion: input.versions.ruleVersion, alternatives: [] as readonly ContentReference[],
  };
  const noMatch = (reason: string, evidence: ContentRankingDimension[] = ['STAGE']): ContentSelectionDecision => ({
    ...base, fallbackStatus: 'NO_MATCH', selected: null, role: null, stage: null,
    reasonCode: 'NO_ELIGIBLE_CONTENT', reason, rankingEvidence: evidence,
  });

  // ---- STAGE routing: only NOTICE/PREPARE/DO route content (Phase 7B). ----
  const stage: ContentStage | undefined = STATE_TO_CONTENT_STAGE[input.currentState];
  if (!stage) return noMatch(`State ${input.currentState} has no content stage; content selection is not applicable.`);

  // ---- FOCUS boundary: content is downstream of a resolved focus. No focus -> no selection. ----
  if (input.activeFocusTargets == null) {
    return noMatch('No resolved focus; content selection is downstream of focus (no selection made).', ['STAGE', 'FOCUS_MATCH']);
  }
  // ---- AGE: unknown age is not eligible-for-all (conservative non-fabrication rule). ----
  if (input.childAgeMonths == null) {
    return noMatch('Child age unknown; eligibility cannot be verified (no selection made).', ['STAGE', 'AGE']);
  }
  const age = input.childAgeMonths;
  const focus = input.activeFocusTargets;
  const excluded = new Set<ContentId>(input.excludedContentIds ?? []);
  const dedup = new Set<ContentId>(input.weeklyDedupContentIds ?? []);
  const recent = new Set<ContentId>(input.recentlyExposedContentIds ?? []);

  // ---- Eligibility: canonical (by type) + stage + focus + age + not-excluded + not-weekly-dedup ----
  const stageOk = (d: ContentDescriptor) => d.mapping.stages.includes(stage);
  const notBlocked = (d: ContentDescriptor) => !excluded.has(d.mapping.contentId) && !dedup.has(d.mapping.contentId);
  const focusMatching = input.descriptors.filter((d) => stageOk(d) && matchStrength(d, focus) > 0 && notBlocked(d));

  const eligible = focusMatching.filter((d) => ageEligible(d, age));

  const rank = (d: ContentDescriptor): Ranked => ({
    d, match: matchStrength(d, focus),
    rolePrimary: (stage === 'DO' && ACTIVITY_ROLES.includes(d.mapping.primaryRole)) ||
                 (stage === 'PREPARE' && d.mapping.primaryRole === 'UNDERSTAND') ||
                 (stage === 'NOTICE' && d.mapping.primaryRole === 'NOTICE'),
    novel: !recent.has(d.mapping.contentId),
  });

  const isAM = (d: ContentDescriptor) => d.mapping.contentType === 'AJAK_MAIN' && ACTIVITY_ROLES.includes(d.mapping.primaryRole);
  const isKB = (d: ContentDescriptor) => d.mapping.contentType === 'KEBIASAAN_BAIK';

  const pick = (pool: ContentDescriptor[]): { winner: ContentDescriptor; rest: ContentDescriptor[] } => {
    const ranked = pool.map(rank).sort(compare);
    return { winner: ranked[0].d, rest: ranked.slice(1).map((r) => r.d) };
  };
  const result = (
    winner: ContentDescriptor, rest: ContentDescriptor[], fallbackStatus: FallbackStatus,
    reasonCode: ContentSelectionDecision['reasonCode'], reason: string, evidence: ContentRankingDimension[],
  ): ContentSelectionDecision => ({
    ...base, fallbackStatus, selected: ref(winner), role: winner.mapping.primaryRole, stage,
    reasonCode, reason, rankingEvidence: evidence, alternatives: rest.map(ref),
  });

  // ---- DO stage: primary AM, else explicit AM-age-gap KB fallback, else other eligible, else NO_MATCH ----
  if (stage === 'DO') {
    const eligibleAM = eligible.filter(isAM);
    if (eligibleAM.length > 0) {
      const { winner, rest } = pick(eligibleAM);
      return result(winner, rest, 'PRIMARY_MATCH', 'PRIMARY_MATCH_SELECTED',
        'Primary Ajak Main activity selected for the DO stage.', ['STAGE', 'FOCUS_MATCH', 'AGE', 'ROLE_PRIMARY', 'CAPABILITY', 'NOVELTY', 'TIEBREAK']);
    }
    // Was an AM for this focus present but age-excluded (the 0-36m gap)?
    const amAgeExcluded = focusMatching.some((d) => isAM(d) && !ageEligible(d, age));
    const eligibleKB = eligible.filter(isKB);
    if (amAgeExcluded && age > AM_MAX_AGE_MONTHS && eligibleKB.length > 0) {
      const { winner, rest } = pick(eligibleKB);
      return result(winner, rest, 'FALLBACK_MATCH', 'AM_AGE_GAP_FALLBACK',
        'No age-appropriate Ajak Main (coverage ends at 36m); Kebiasaan Baik used as an explicit fallback.',
        ['STAGE', 'FOCUS_MATCH', 'AGE', 'ROLE_PRIMARY', 'TIEBREAK']);
    }
    // Other eligible DO content (KB value focus, parenting practice, etc.) is a normal primary match.
    if (eligible.length > 0) {
      const { winner, rest } = pick(eligible);
      return result(winner, rest, 'PRIMARY_MATCH', 'PRIMARY_MATCH_SELECTED',
        'Primary DO-stage content selected (non-activity role).', ['STAGE', 'FOCUS_MATCH', 'AGE', 'ROLE_PRIMARY', 'TIEBREAK']);
    }
    return noMatch('No eligible DO content (no age-appropriate AM primary and no KB fallback).', ['STAGE', 'FOCUS_MATCH', 'AGE']);
  }

  // ---- NOTICE / PREPARE: primary match if eligible, else NO_MATCH (no fallback concept). ----
  if (eligible.length > 0) {
    const { winner, rest } = pick(eligible);
    return result(winner, rest, 'PRIMARY_MATCH', 'PRIMARY_MATCH_SELECTED',
      `Primary ${stage}-stage content selected.`, ['STAGE', 'FOCUS_MATCH', 'AGE', 'ROLE_PRIMARY', 'CAPABILITY', 'NOVELTY', 'TIEBREAK']);
  }
  return noMatch(`No eligible ${stage}-stage content for the resolved focus.`, ['STAGE', 'FOCUS_MATCH', 'AGE']);
};
