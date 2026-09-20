// Rekah Canonical Content Metadata — validation (Phase 4 + Phase 5 adjudication)
// Pure, dependency-free integrity checks (the 17 required checks + Phase 5 candidate checks).
import {
  ALL_CONTENT_METADATA,
  CANONICAL_DOMAINS,
  CANONICAL_CAPABILITIES,
  CANONICAL_FAMILY_VALUES,
  CANONICAL_KNOWLEDGE,
  CONTENT_TYPES,
  PARENTING_PRACTICE_IDS,
  PARENTING_PRACTICE_EVALUATED_IDS,
} from './index';
import type { ContentMetadata } from './types';

export const EXPECTED_CONTENT_IDS: string[] = [
  'kb-001', 'kb-002', 'kb-003', 'kb-004', 'kb-005', 'kb-006',
  'kb-007', 'kb-008', 'kb-009', 'kb-010', 'kb-011', 'kb-012',
  'kb-013', 'kb-014', 'kb-015', 'kb-016', 'kb-017', 'kb-018',
  'kb-019', 'kb-020', 'kb-021', 'kb-022', 'kb-023', 'kb-024',
  'kb-025', 'kb-026', 'kb-027', 'kb-028', 'kb-029', 'kb-030',
  'kb-031', 'kb-032', 'kb-033', 'kb-034', 'kb-035', 'kb-036',
  'kb-037', 'kb-038', 'kb-039', 'kb-040', 'kb-041', 'kb-042',
  'kb-043', 'kb-044', 'kb-045', 'kb-046', 'kb-047', 'kb-048',
  'kb-049', 'kb-050', 'kb-051', 'kb-052', 'kb-053', 'kb-054',
  'kb-055', 'kb-056', 'kb-057', 'am-001', 'am-tummy-time', 'am-motorik',
  'am-object-perm', 'am-kemandirian-praktis', 'am-makan-seru', 'am-toilet', 'am-fungsi-eksekutif', 'am-pilih-sendiri',
  'am-003', 'am-senyum-balas', 'am-kelekatan', 'am-joint-attention', 'am-temperamen', 'am-keterampilan-sosial',
  'am-disiplin-empati', 'am-genggam', 'am-pilihan-kecil', 'am-coba-lagi', 'am-pujian-proses', 'am-bebas-mencoba',
  'am-rutinitas', 'am-ko-regulasi', 'am-tantrum', 'am-nama-perasaan', 'am-tidur-sehat', 'am-serve-return',
  'am-002', 'am-tonggak-bahasa', 'am-pra-literasi', 'am-koneksi-nyata', 'am-bercerita-bersama', 'am-bermain-paralel',
  'am-005', 'am-giliran', 'am-kesiapan-sosial', 'am-kartu-kontras', 'am-lagu-ritmis', 'am-ciluk-ba',
  'am-meraih-mainan', 'am-cermin-bayi', 'am-eksplorasi-tekstur', 'am-sebab-akibat', 'am-musik-marakas', 'am-berdiri-merambat',
  'am-lukis-jari', 'am-menara-balok', 'am-coret-bebas', 'am-puzzle-sederhana', 'am-messy-play', 'am-tendang-bola',
  'RL-0-3m-FM', 'RL-0-3m-KG', 'RL-0-3m-BH', 'RL-0-3m-SE', 'RL-0-3m-KS', 'RL-0-3m-PS',
  'RL-3-6m-FM', 'RL-3-6m-KG', 'RL-3-6m-BH', 'RL-3-6m-SE', 'RL-3-6m-KS', 'RL-3-6m-PS',
  'RL-6-9m-FM', 'RL-6-9m-KG', 'RL-6-9m-BH', 'RL-6-9m-SE', 'RL-6-9m-KS', 'RL-6-9m-PS',
  'RL-9-12m-FM', 'RL-9-12m-KG', 'RL-9-12m-BH', 'RL-9-12m-SE', 'RL-9-12m-KS', 'RL-9-12m-PS',
  'RL-12-18m-FM', 'RL-12-18m-KG', 'RL-12-18m-BH', 'RL-12-18m-SE', 'RL-12-18m-KS', 'RL-12-18m-PS',
  'RL-18-24m-FM', 'RL-18-24m-KG', 'RL-18-24m-BH', 'RL-18-24m-SE', 'RL-18-24m-KS', 'RL-18-24m-PS',
  'RL-2-3y-FM', 'RL-2-3y-KG', 'RL-2-3y-BH', 'RL-2-3y-SE', 'RL-2-3y-KS', 'RL-2-3y-PS',
  'RL-3-4y-FM', 'RL-3-4y-KG', 'RL-3-4y-BH', 'RL-3-4y-SE', 'RL-3-4y-KS', 'RL-3-4y-PS',
  'RL-4-5y-FM', 'RL-4-5y-KG', 'RL-4-5y-BH', 'RL-4-5y-SE', 'RL-4-5y-KS', 'RL-4-5y-PS',
  'RL-0-3m-DK', 'RL-3-6m-DK', 'RL-6-9m-DK', 'RL-9-12m-DK', 'RL-12-18m-DK', 'RL-18-24m-DK',
  'RL-2-3y-DK', 'RL-3-4y-DK', 'RL-4-5y-DK', 'RL-5-6y-DK',
];

export const EXPECTED_COUNTS = { KEBIASAAN_BAIK: 57, AJAK_MAIN: 51, WAWASAN_TUMBUH: 64 } as const;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, unknown>;
}

const EVIDENCE_STRENGTHS = ['VERIFIED', 'PARTIAL', 'UNVERIFIED'];
const GOV_STATUSES = ['READY', 'IN_REVIEW', 'NEEDS_REVIEW'];
const READINESS = ['READY', 'READY_WITH_NULLS', 'NEEDS_REVIEW', 'BLOCKED'];
const MAPPING_STATUS = ['MAPPED', 'NULL'];

export function validateMetadata(records: ContentMetadata[] = ALL_CONTENT_METADATA): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = records.map((r) => r.content_id);
  const idSet = new Set(ids);
  const expectedSet = new Set(EXPECTED_CONTENT_IDS);

  // 1. All 172 content IDs exist
  if (records.length !== 172) errors.push(`[1] Expected 172 records, found ${records.length}`);
  for (const id of EXPECTED_CONTENT_IDS) if (!idSet.has(id)) errors.push(`[1/4] Missing metadata for expected id: ${id}`);

  // 2. No duplicate IDs
  const seen = new Set<string>();
  for (const id of ids) { if (seen.has(id)) errors.push(`[2] Duplicate content_id: ${id}`); seen.add(id); }

  // 3. No orphan metadata records (record id must be an approved content id)
  for (const id of ids) if (!expectedSet.has(id)) errors.push(`[3] Orphan metadata record (unknown content_id): ${id}`);

  // per-type counts (17 — bijection)
  const byType: Record<string, number> = {};
  for (const r of records) byType[r.content_type] = (byType[r.content_type] ?? 0) + 1;
  for (const [t, n] of Object.entries(EXPECTED_COUNTS)) {
    if (byType[t] !== n) errors.push(`[5/17] ${t}: expected ${n}, found ${byType[t] ?? 0}`);
  }

  let allNullAxes = 0;
  for (const r of records) {
    const tag = r.content_id;
    // 5. Content type valid
    if (!CONTENT_TYPES.includes(r.content_type)) errors.push(`[5] ${tag}: invalid content_type ${r.content_type}`);
    // 6. Age range valid
    const { min_months: mn, max_months: mx } = r.age_range;
    if (mn === null || mx === null) {
      if (!(mn === null && mx === null)) errors.push(`[6] ${tag}: partial age_range`);
    } else if (mn < 0 || mx > 72 || mn > mx) {
      errors.push(`[6] ${tag}: invalid age_range ${mn}-${mx}`);
    }
    // 7. Primary development mapping valid when present
    const d = r.development;
    if (d.primary_domain !== null) {
      if (!CANONICAL_DOMAINS.includes(d.primary_domain)) errors.push(`[7] ${tag}: unknown domain ${d.primary_domain}`);
      else if (d.primary_capability === null || !CANONICAL_CAPABILITIES[d.primary_domain].includes(d.primary_capability))
        errors.push(`[7] ${tag}: capability "${d.primary_capability}" not in domain ${d.primary_domain}`);
      if (d.mapping_status !== 'MAPPED') errors.push(`[7] ${tag}: domain present but mapping_status=${d.mapping_status}`);
    } else {
      if (d.primary_capability !== null) errors.push(`[7] ${tag}: capability without domain`);
      if (d.mapping_status !== 'NULL') errors.push(`[7] ${tag}: no domain but mapping_status=${d.mapping_status}`);
    }
    if (!MAPPING_STATUS.includes(d.mapping_status)) errors.push(`[16] ${tag}: invalid mapping_status`);
    // 8. Secondary dev mappings — strict
    if (d.secondary.length > 2) errors.push(`[8] ${tag}: >2 secondary dev mappings`);
    for (const sdc of d.secondary) {
      if (!CANONICAL_DOMAINS.includes(sdc.domain)) errors.push(`[8] ${tag}: unknown secondary domain ${sdc.domain}`);
      else if (!CANONICAL_CAPABILITIES[sdc.domain].includes(sdc.capability))
        errors.push(`[8] ${tag}: secondary capability "${sdc.capability}" not in ${sdc.domain}`);
      if (sdc.domain === d.primary_domain && sdc.capability === d.primary_capability)
        errors.push(`[8] ${tag}: secondary duplicates primary`);
    }
    // 9. Family value in canonical 12
    if (r.family.primary_value !== null && !CANONICAL_FAMILY_VALUES.includes(r.family.primary_value))
      errors.push(`[9] ${tag}: unknown family value ${r.family.primary_value}`);
    if (r.family.secondary.length > 2) errors.push(`[9] ${tag}: >2 secondary family values`);
    for (const v of r.family.secondary) if (!CANONICAL_FAMILY_VALUES.includes(v)) errors.push(`[9] ${tag}: unknown secondary family value ${v}`);
    // 10. No Percaya Diri family value
    const fam = [r.family.primary_value, ...r.family.secondary].filter(Boolean) as string[];
    if (fam.some((v) => /percaya\s*diri|confidence/i.test(v))) errors.push(`[10] ${tag}: Percaya Diri present as family value`);
    // 11. Knowledge area/topic combos valid
    const k = r.knowledge;
    if ((k.area === null) !== (k.topic === null)) errors.push(`[11] ${tag}: partial knowledge area/topic`);
    if (k.area !== null && k.topic !== null) {
      const topics = CANONICAL_KNOWLEDGE[k.area];
      if (!topics) errors.push(`[11] ${tag}: unknown knowledge area ${k.area}`);
      else if (!topics.includes(k.topic)) errors.push(`[11] ${tag}: topic "${k.topic}" not in area ${k.area}`);
    }
    // 12. NULL accepted
    if (d.primary_domain === null && r.family.primary_value === null && k.area === null) allNullAxes++;
    // 13. Evidence values valid
    if (r.evidence.strength !== null && !EVIDENCE_STRENGTHS.includes(r.evidence.strength)) errors.push(`[13] ${tag}: invalid evidence strength`);
    if (!Array.isArray(r.evidence.source_ids)) errors.push(`[13] ${tag}: source_ids not array`);
    // 14. Governance values valid
    if (!GOV_STATUSES.includes(r.governance.review_status)) errors.push(`[14] ${tag}: invalid governance status`);
    // 15. parenting_practice_candidate only on Phase-5-confirmed items; production type never PARENTING_PRACTICE
    if (r.parenting_practice_candidate) {
      if (!PARENTING_PRACTICE_IDS.includes(r.content_id)) errors.push(`[15] ${tag}: parenting flag on non-confirmed item`);
      if (r.content_type !== 'AJAK_MAIN') errors.push(`[15] ${tag}: parenting flag on non-AJAK_MAIN`);
      if (r.development.primary_domain !== null) errors.push(`[15] ${tag}: parenting practice must have Development NULL`);
      if (r.candidate_content_type !== 'PARENTING_PRACTICE') errors.push(`[15] ${tag}: confirmed practice must have candidate_content_type=PARENTING_PRACTICE`);
    }
    // 15b. candidate_content_type is an overlay only — never leak into production content_type
    if (r.candidate_content_type !== undefined && r.candidate_content_type !== null && r.candidate_content_type !== 'PARENTING_PRACTICE')
      errors.push(`[15] ${tag}: invalid candidate_content_type`);
    if (r.candidate_content_type === 'PARENTING_PRACTICE' && !r.parenting_practice_candidate)
      errors.push(`[15] ${tag}: candidate_content_type set but flag false`);
    if ((r.content_type as string) === 'PARENTING_PRACTICE') errors.push(`[15] ${tag}: PARENTING_PRACTICE leaked into production content_type`);
    // 16. readiness valid
    if (!READINESS.includes(r.readiness)) errors.push(`[16] ${tag}: invalid readiness ${r.readiness}`);
  }
  // 15 (cont): every confirmed parenting id flagged + typed; the rejected evaluated id must be cleared
  for (const id of PARENTING_PRACTICE_IDS) {
    const rec = records.find((r) => r.content_id === id);
    if (!rec) errors.push(`[15] confirmed parenting id missing: ${id}`);
    else if (!rec.parenting_practice_candidate || rec.candidate_content_type !== 'PARENTING_PRACTICE')
      errors.push(`[15] confirmed parenting id not properly set: ${id}`);
  }
  for (const id of PARENTING_PRACTICE_EVALUATED_IDS) {
    if (PARENTING_PRACTICE_IDS.includes(id)) continue;
    const rec = records.find((r) => r.content_id === id);
    if (rec && (rec.parenting_practice_candidate || rec.candidate_content_type === 'PARENTING_PRACTICE'))
      errors.push(`[15] rejected candidate still flagged: ${id}`);
  }

  const readinessCounts: Record<string, number> = {};
  for (const r of records) readinessCounts[r.readiness] = (readinessCounts[r.readiness] ?? 0) + 1;

  const stats = {
    total: records.length,
    byType,
    readiness: readinessCounts,
    duplicates: ids.length - idSet.size,
    orphans: ids.filter((id) => !expectedSet.has(id)).length,
    missing: EXPECTED_CONTENT_IDS.filter((id) => !idSet.has(id)).length,
    allNullAxes,
    parentingPractices: records.filter((r) => r.candidate_content_type === 'PARENTING_PRACTICE').length,
    parentingRejected: PARENTING_PRACTICE_EVALUATED_IDS.filter((id) => !PARENTING_PRACTICE_IDS.includes(id)).length,
    remainingNeedsReview: records.filter((r) => r.readiness === 'NEEDS_REVIEW').length,
  };
  return { ok: errors.length === 0, errors, warnings, stats };
}

/** Convenience: run the 17 checks over the full 172-record set. */
export function runValidation(): ValidationResult {
  return validateMetadata(ALL_CONTENT_METADATA);
}
