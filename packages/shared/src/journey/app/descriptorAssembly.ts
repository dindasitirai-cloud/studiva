// Rekah Journey — ContentDescriptor assembly (Phase 10C-2 Slice 1). ADDITIVE, PURE, read-only.
// Builds the injected read-only metadata projection the content selector consumes. It mechanically
// joins FROZEN metadata + CANONICAL mappings + the app-layer practice relation registry.
// It contains NO ranking/precedence/selection logic (that lives only in selectContent).
import type { ContentMetadata } from '../../content/metadata/types';
import { ALL_CONTENT_METADATA } from '../../content/metadata';
import type { ContentDescriptor } from '../content/types';
import { mappingForMetadata } from './canonicalMappings';
import { relatedFocusKeysFor } from '../config/practiceRelationRegistry';

const descriptorForMetadata = (m: ContentMetadata): ContentDescriptor => {
  const isPractice = m.candidate_content_type === 'PARENTING_PRACTICE';
  // Practices have NULL axes; their ONLY matchable relationship is the app-layer relatedFocusKeys.
  // Registry is empty (relations BLOCKED) → keys [] → selector returns NO_MATCH for practice-only.
  const relatedFocusKeys = isPractice ? relatedFocusKeysFor(m.content_id) : undefined;
  return {
    mapping: mappingForMetadata(m),
    ageMinMonths: m.age_range.min_months, ageMaxMonths: m.age_range.max_months,
    devDomain: m.development.primary_domain, devCapability: m.development.primary_capability,
    familyValue: m.family.primary_value, knowledgeArea: m.knowledge.area, knowledgeTopic: m.knowledge.topic,
    parentingPracticeCandidate: isPractice,
    ...(relatedFocusKeys && relatedFocusKeys.length > 0 ? { relatedFocusKeys } : {}),
  };
};

/** All canonical descriptors (frozen metadata projection). Read-only; nothing is mutated. */
export const buildAllDescriptors = (): readonly ContentDescriptor[] =>
  ALL_CONTENT_METADATA.map(descriptorForMetadata);
