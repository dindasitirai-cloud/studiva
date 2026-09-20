// Rekah Canonical Content Metadata — types & locked vocabularies (Phase 4, v4.0)
// Source of truth: Rekah Canonical Content Model v3.2 + Product Decisions v3.3.
// This layer is ADDITIVE and RUNTIME-INERT. It attaches to production content by content_id.
// It does NOT extend or replace KnowledgeCard / ActivityModule / MateriItem.

export type ContentType = 'KEBIASAAN_BAIK' | 'AJAK_MAIN' | 'WAWASAN_TUMBUH';

export type DevelopmentDomain =
  'Gross Motor' | 'Fine Motor' | 'Cognitive' | 'Language & Communication' | 'Social-Emotional' | 'Self-Regulation & Executive Function' | 'Adaptive / Self-Help';

export type FamilyValue =
  'Kejujuran' | 'Syukur' | 'Kasih Sayang' | 'Empati' | 'Kemandirian' | 'Tanggung Jawab' | 'Kesederhanaan' | 'Cinta Ilmu' | 'Sabar' | 'Berbagi' | 'Keberanian' | 'Hormat pada Sesama';

export type KnowledgeArea = 'Child Health' | 'Parenting & Caregiving' | 'Development Monitoring';

export type KnowledgeTopic =
  'Nutrition & Feeding' | 'Sleep' | 'Growth & Physical Health' | 'Responsive Caregiving & Stimulation' | 'Positive Discipline & Boundaries' | 'Routines & Consistency' | 'Screening & Milestones' | 'Developmental Concerns' | 'Early Intervention & Special Needs' | 'School Readiness & Transition';

export type MappingStatus = 'MAPPED' | 'NULL';
/** Adjudicated candidate content-type overlay (Phase 5). Production content_type is unaffected. */
export type CandidateContentType = 'PARENTING_PRACTICE';
export type EvidenceStrength = 'VERIFIED' | 'PARTIAL' | 'UNVERIFIED';
export type GovernanceStatus = 'READY' | 'IN_REVIEW' | 'NEEDS_REVIEW';
export type ReadinessStatus = 'READY' | 'READY_WITH_NULLS' | 'NEEDS_REVIEW' | 'BLOCKED';

export interface DevelopmentSecondary { domain: DevelopmentDomain; capability: string; }

export interface DevelopmentMapping {
  primary_domain: DevelopmentDomain | null;
  primary_capability: string | null;
  secondary: DevelopmentSecondary[];
  mapping_status: MappingStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
}

export interface FamilyMapping {
  primary_value: FamilyValue | null;
  secondary: FamilyValue[];
}

export interface KnowledgeMapping {
  area: KnowledgeArea | null;
  topic: KnowledgeTopic | null;
}

export interface EvidenceMeta {
  type: string | null;
  strength: EvidenceStrength | null;
  source_ids: string[];
}

export interface GovernanceMeta {
  expert_reviewer: string | null;
  review_status: GovernanceStatus;
  review_date: string | null;
}

/** Canonical metadata attached to a single content item by content_id (additive, inert). */
export interface ContentMetadata {
  content_id: string;
  legacy_id: string;
  content_type: ContentType;
  age_range: { min_months: number | null; max_months: number | null };
  development: DevelopmentMapping;
  family: FamilyMapping;
  knowledge: KnowledgeMapping;
  evidence: EvidenceMeta;
  governance: GovernanceMeta;
  readiness: ReadinessStatus;
  /** True only for the Ajak Main caregiver-script items CONFIRMED as parenting practices in Phase 5. */
  parenting_practice_candidate?: boolean;
  /**
   * Phase 5 adjudication of a parenting-practice candidate. Overlay only — the production
   * `content_type` above is never changed and PARENTING_PRACTICE is NOT a production type.
   * 'PARENTING_PRACTICE' = confirmed; null = evaluated and rejected (stays a plain Ajak Main).
   * Present only on the 6 items adjudicated in Phase 5.
   */
  candidate_content_type?: CandidateContentType | null;
}

// ---- Locked canonical vocabularies (v3.2/v3.3) ----
export const CANONICAL_DOMAINS: DevelopmentDomain[] = ['Gross Motor', 'Fine Motor', 'Cognitive', 'Language & Communication', 'Social-Emotional', 'Self-Regulation & Executive Function', 'Adaptive / Self-Help'];

export const CANONICAL_CAPABILITIES: Record<DevelopmentDomain, string[]> = {
  "Gross Motor": ['Balance and Coordination', 'Locomotion and Moving Through Space', 'Sensory and Body Awareness', 'Trunk and Postural Control'],
  "Fine Motor": ['Early Mark-Making and Drawing', 'Grasping and Reaching', 'Hand-Eye Coordination', 'Manipulating Objects', 'Tool Use'],
  "Cognitive": ['Attention and Focus', 'Cause-and-Effect Understanding', 'Curiosity and Exploration', 'Early Concepts (Shapes, Colors, Numbers, Letters)', 'Object Permanence and Memory', 'Problem Solving', 'Symbolic and Pretend Thinking'],
  "Language & Communication": ['Conversation and Turn-Taking', 'Early Literacy and Storytelling', 'Expressive Communication', 'Gestures and Nonverbal Communication', 'Receptive Language', 'Vocabulary Building'],
  "Social-Emotional": ['Attachment and Secure Relationship', 'Autonomy and Sense of Agency', 'Empathy and Understanding Others', 'Self-Awareness and Identity', 'Social Interaction and Play with Others'],
  "Self-Regulation & Executive Function": ['Decision-Making and Choice-Making', 'Emotional Regulation', 'Focus and Attention Control', 'Following Simple Routines and Instructions', 'Impulse Control and Waiting'],
  "Adaptive / Self-Help": ['Growing Independence in Daily Tasks', 'Participating in Routines and Chores', 'Participating in Self-Care', 'Self-Feeding', 'Toileting and Hygiene']
};

export const CANONICAL_FAMILY_VALUES: FamilyValue[] = ['Kejujuran', 'Syukur', 'Kasih Sayang', 'Empati', 'Kemandirian', 'Tanggung Jawab', 'Kesederhanaan', 'Cinta Ilmu', 'Sabar', 'Berbagi', 'Keberanian', 'Hormat pada Sesama'];

export const CANONICAL_KNOWLEDGE: Record<KnowledgeArea, KnowledgeTopic[]> = {
  "Child Health": ['Nutrition & Feeding', 'Sleep', 'Growth & Physical Health'],
  "Parenting & Caregiving": ['Responsive Caregiving & Stimulation', 'Positive Discipline & Boundaries', 'Routines & Consistency'],
  "Development Monitoring": ['Screening & Milestones', 'Developmental Concerns', 'Early Intervention & Special Needs', 'School Readiness & Transition']
};

export const CONTENT_TYPES: ContentType[] = ['KEBIASAAN_BAIK','AJAK_MAIN','WAWASAN_TUMBUH'];

/** The 6 Ajak Main items evaluated as parenting-practice candidates in Phase 4/5 (for traceability). */
export const PARENTING_PRACTICE_EVALUATED_IDS: string[] = ['am-temperamen', 'am-disiplin-empati', 'am-pujian-proses', 'am-rutinitas', 'am-ko-regulasi', 'am-koneksi-nyata'];

/** Ajak Main items CONFIRMED as parenting practices in Phase 5 (candidate_content_type = PARENTING_PRACTICE). PARENTING_PRACTICE is NOT a production type. am-temperamen was evaluated and rejected (→ NULL). */
export const PARENTING_PRACTICE_IDS: string[] = ['am-disiplin-empati', 'am-pujian-proses', 'am-rutinitas', 'am-ko-regulasi', 'am-koneksi-nyata'];
