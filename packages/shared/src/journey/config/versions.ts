// Rekah Journey — version stamp configuration (Phase 10C-2 Slice 1). ADDITIVE app-layer config.
// The version LABELS are sourced from the FROZEN phase artifacts (not invented):
//   metadataVersion = 'v6'   → Phase 6 "Metadata FROZEN v6" (172 items).
//   mappingVersion  = 'v1.0' → Phase 7B Content-to-Journey Map v1.0 (177 canonical mappings).
//   ruleVersion     = 'v1.0' → Phase 8A Journey Rules & State Machine v1.0.
// These stamp every EngineDecision so decisions remain reproducible (Phase 9A §27).
import type {
  VersionStamp, MetadataVersion, MappingVersion, RuleVersion,
} from '../types';

const brand = <T>(s: string): T => s as unknown as T;

export const REKAH_VERSIONS: VersionStamp = {
  metadataVersion: brand<MetadataVersion>('v6'),
  mappingVersion: brand<MappingVersion>('v1.0'),
  ruleVersion: brand<RuleVersion>('v1.0'),
};
