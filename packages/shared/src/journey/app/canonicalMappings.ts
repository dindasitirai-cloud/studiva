// Rekah Journey — CANONICAL content mappings, realized from the FROZEN Phase 7A/7B role matrix
// (Phase 10C-2 Slice 1). ADDITIVE. This does NOT change the frozen mappings; it realizes the
// documented 7B rule in code (there was no data file — only the spec + the 9B-9 test derivation,
// which this mirrors exactly). Canonical-only; candidates are never produced here.
//
// Frozen 7A/7B Content Role Matrix:
//   WAWASAN_TUMBUH → role UNDERSTAND, stages [NOTICE, PREPARE]
//   KEBIASAAN_BAIK → role ROUTINE,    stages [DO]
//   AJAK_MAIN (parenting practice)  → role PARENT_IMPLEMENTATION, stages [PREPARE, DO]
//   AJAK_MAIN (plain activity)      → role DO,                    stages [DO]
import type { ContentMetadata } from '../../content/metadata/types';
import { ALL_CONTENT_METADATA } from '../../content/metadata';
import type { CanonicalJourneyContentMapping, MappingVersion } from '../types';
import { ContentId, MappingId } from '../ids';
import type { JourneyRole, ContentStage } from '../enums';

const brand = <T>(s: string): T => s as unknown as T;

const roleFor = (m: ContentMetadata): { role: JourneyRole; stages: ContentStage[] } => {
  if (m.content_type === 'WAWASAN_TUMBUH') return { role: 'UNDERSTAND', stages: ['NOTICE', 'PREPARE'] };
  if (m.content_type === 'KEBIASAAN_BAIK') return { role: 'ROUTINE', stages: ['DO'] };
  if (m.candidate_content_type === 'PARENTING_PRACTICE') return { role: 'PARENT_IMPLEMENTATION', stages: ['PREPARE', 'DO'] };
  return { role: 'DO', stages: ['DO'] };
};

export const mappingForMetadata = (m: ContentMetadata): CanonicalJourneyContentMapping => {
  const r = roleFor(m);
  return {
    mappingId: MappingId(`map-${m.content_id}`), contentId: ContentId(m.content_id),
    contentType: m.content_type, primaryRole: r.role, secondaryRoles: [], stages: r.stages,
    mappingVersion: brand<MappingVersion>('v1.0'), mappingStatus: 'CANONICAL', confidence: 'HIGH',
  };
};

/** All 172 canonical mappings (one per frozen content item). Candidates are never included. */
export const CANONICAL_MAPPINGS: readonly CanonicalJourneyContentMapping[] =
  ALL_CONTENT_METADATA.map(mappingForMetadata);
