// Rekah Journey — COMPILE-TIME type tests (Phase 9B-1).
// Validated by `tsc --noEmit`. Each `@ts-expect-error` MUST fail to compile; if any
// negative case compiles, tsc reports an unused directive and the typecheck fails.
// No runtime behavior is exercised here.
import type {
  CanonicalJourneyContentMapping, CandidateJourneyContentMapping, JourneyEngineInput,
  EngineResult, ParentSelectedFocus, ContentReference,
} from '../types';
import type { FamilyId, ChildId, ContentId } from '../ids';
import type { JourneyState } from '../enums';
import { assertNever } from '../guards';

// --- G: branded IDs prevent accidental cross-assignment ---
declare const familyId: FamilyId;
declare const childId: ChildId;
// @ts-expect-error ChildId is not assignable to FamilyId
const badId: FamilyId = childId;
const okId: FamilyId = familyId; // positive: same brand assigns
void badId; void okId;

// --- B: candidate mappings cannot be passed where canonical is required ---
declare const candidate: CandidateJourneyContentMapping;
declare const canonical: CanonicalJourneyContentMapping;
// @ts-expect-error candidate mapping is structurally not a canonical mapping
const forcedCanonical: CanonicalJourneyContentMapping = candidate;
const realCanonical: CanonicalJourneyContentMapping = canonical; // positive
void forcedCanonical; void realCanonical;

// --- A: invalid journey states are rejected ---
// @ts-expect-error 'FOOBAR' is not a JourneyState
const badState: JourneyState = 'FOOBAR';
const goodState: JourneyState = 'DO';
void badState; void goodState;

// --- D/parent-agency: PARENT_SELECTED focus is confirmed by construction ---
declare const parentFocus: ParentSelectedFocus;
// @ts-expect-error parentConfirmed must be `true` for a PARENT_SELECTED focus
const badFocus: ParentSelectedFocus = { ...parentFocus, parentConfirmed: false };
void badFocus;

// --- Engine input accepts CANONICAL mappings only ---
declare const candidates: readonly CandidateJourneyContentMapping[];
// @ts-expect-error candidate[] is not assignable to canonicalContentMappings
const badInput: Pick<JourneyEngineInput, 'canonicalContentMappings'> = { canonicalContentMappings: candidates };
void badInput;

// --- C: a ContentReference exposes only immutable ids (no metadata fields) ---
declare const ref: ContentReference;
const cid: ContentId = ref.contentId; // positive
// @ts-expect-error ContentReference has no `title` (content metadata is never duplicated)
const title: string = ref.title;
void cid; void title;

// --- I: EngineResult union is exhaustive (assertNever proves closure) ---
declare const result: EngineResult;
function handle(r: EngineResult): string {
  switch (r.kind) {
    case 'OK': return 'ok';
    case 'INSUFFICIENT_CONTEXT': return 'ctx';
    case 'NO_FOCUS': return 'nofocus';
    case 'NO_MATCH': return 'nomatch';
    case 'FALLBACK_ONLY': return 'fallback';
    case 'PARENT_OVERRIDE': return 'override';
    case 'INVALID_STATE': return 'invalid';
    case 'STALE_STATE': return 'stale';
    case 'CONFLICT': return 'conflict';
    case 'PAUSED': return 'paused';
    default: return assertNever(r); // compiles only if all variants are handled
  }
}
void handle(result);
