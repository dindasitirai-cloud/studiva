// Rekah Journey — Content Selection contract (Phase 9B-5)
// PURE content-selection types. Downstream of focus. Canonical mappings ONLY.
import type {
  CanonicalJourneyContentMapping, ContentReference, VersionStamp, FamilyValue,
} from '../types';
import type { ContentId } from '../ids';
import type { JourneyRole, ContentStage, FallbackStatus, ReasonCode } from '../enums';
import type { CanonicalState } from '../engine/types';
import type { FocusTargets } from '../focus/types';
import type { RuleVersion } from '../types';

/**
 * A read-only projection of frozen v6 metadata for one canonically-mapped content item.
 * Injected by the orchestration layer (which has metadata access) so the SELECTOR stays pure
 * and never imports content data files. Nothing here is mutated.
 */
export interface ContentDescriptor {
  readonly mapping: CanonicalJourneyContentMapping;   // CANONICAL by type
  readonly ageMinMonths: number | null;
  readonly ageMaxMonths: number | null;
  readonly devDomain: string | null;
  readonly devCapability: string | null;
  readonly familyValue: FamilyValue | null;           // KB-only in frozen metadata
  readonly knowledgeArea: string | null;
  readonly knowledgeTopic: string | null;
  readonly parentingPracticeCandidate: boolean;       // the 5 overlay items
  /**
   * Focus keys this content supports, injected from the Phase 7B routing by the orchestration layer.
   * REQUIRED for parenting practices (their dev/value/knowledge axes are NULL in frozen metadata, so
   * they cannot be matched via an axis). The selector only CHECKS membership; it never invents the relationship.
   */
  readonly relatedFocusKeys?: readonly string[];
}

/** Explicit, focus-downstream input. Time is `asOf`; versions are explicit. */
export interface ContentSelectionInput {
  readonly asOf: string;
  readonly versions: VersionStamp;
  readonly currentState: CanonicalState;              // FSM state -> content stage
  readonly activeFocusTargets: FocusTargets | null;   // ALREADY resolved (Phase 9B-4)
  readonly childAgeMonths: number | null;
  /** CANONICAL descriptors only; candidates are structurally excluded by the mapping type. */
  readonly descriptors: readonly ContentDescriptor[];
  readonly excludedContentIds?: readonly ContentId[];       // parent exclusions (hard)
  readonly weeklyDedupContentIds?: readonly ContentId[];    // (content_id, family, week) already surfaced (hard)
  readonly recentlyExposedContentIds?: readonly ContentId[]; // novelty (soft, tie-break only)
}

export type ContentRankingDimension =
  | 'STAGE' | 'FOCUS_MATCH' | 'AGE' | 'ROLE_PRIMARY' | 'CAPABILITY' | 'SECONDARY' | 'NOVELTY' | 'TIEBREAK';

export interface ContentSelectionDecision {
  readonly fallbackStatus: FallbackStatus;            // PRIMARY_MATCH | FALLBACK_MATCH | NO_MATCH
  readonly selected: ContentReference | null;         // immutable content_id (+ mappingId) only
  readonly role: JourneyRole | null;
  readonly stage: ContentStage | null;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly versions: VersionStamp;
  readonly ruleVersion: RuleVersion;
  readonly rankingEvidence: readonly ContentRankingDimension[];
  readonly alternatives: readonly ContentReference[]; // other eligible items (no content bodies)
}

/** FSM state -> the single content stage it routes content for (Phase 7B). Others have no content stage. */
export const STATE_TO_CONTENT_STAGE: Partial<Record<CanonicalState, ContentStage>> = {
  NOTICE: 'NOTICE',
  PREPARE: 'PREPARE',
  DO: 'DO',
};
/** AM canonical coverage ends at 36 months (Phase 7B/8A). */
export const AM_MAX_AGE_MONTHS = 36;
