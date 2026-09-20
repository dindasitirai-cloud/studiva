// Rekah Journey — Parenting-Practice → Focus Relation Registry MECHANISM (Phase 10C-2 Slice 1).
// AUTHORIZED additive app-layer config (Phase 10C-2A §A). It supplies, per practice content_id,
// the CANONICAL focus keys the practice supports, so the Application Service can inject
// `relatedFocusKeys` into a ContentDescriptor (the selector never invents the relationship).
//
// STRICT RULES (Phase 10C-2A §A.5):
//   - relatedFocusKeys MUST be exact canonical focus keys: `${value}|${domainOrArea}|${capabilityOrTopic}`.
//   - source MUST be 'DOMAIN_EXPERT_AUTHORED' and status 'ACTIVE' before a relation may ship.
//   - Relations are NEVER inferred from similarity, tags, titles, or an LLM.
//   - The 5 relations remain BLOCKED (registry ships EMPTY) until a domain expert authors them.
//   - With no active relation, the selector returns NO_MATCH (honest); no fallback is invented.

export type PracticeRelationStatus = 'ACTIVE' | 'BLOCKED';
export type PracticeRelationSource = 'DOMAIN_EXPERT_AUTHORED';

export interface PracticeRelation {
  readonly content_id: string;                    // one of the 5 frozen practice IDs
  readonly relatedFocusKeys: readonly string[];   // canonical focus keys only
  readonly source: PracticeRelationSource;
  readonly status: PracticeRelationStatus;
  readonly rationale: string;
  readonly version: string;
}

/** The 5 practice IDs whose relations are BLOCKED pending domain-expert authorship (traceability). */
export const BLOCKED_PRACTICE_IDS: readonly string[] = [
  'am-disiplin-empati', 'am-pujian-proses', 'am-rutinitas', 'am-ko-regulasi', 'am-koneksi-nyata',
];

/**
 * INTENTIONALLY EMPTY. Each of the 5 relations is BLOCKED (Phase 10C-2A §A) — they cannot be
 * derived from any frozen artifact without inventing taxonomy semantics. A domain expert adds
 * entries here later; until then no practice surfaces.
 */
export const PRACTICE_RELATION_REGISTRY: readonly PracticeRelation[] = [];

/** Return the canonical focus keys for a practice, or [] when BLOCKED/absent (→ selector NO_MATCH). */
export const relatedFocusKeysFor = (contentId: string): readonly string[] => {
  const rel = PRACTICE_RELATION_REGISTRY.find(
    (r) => r.content_id === contentId && r.status === 'ACTIVE' && r.source === 'DOMAIN_EXPERT_AUTHORED',
  );
  return rel ? rel.relatedFocusKeys : [];
};
