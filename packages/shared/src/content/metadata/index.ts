// Rekah Canonical Content Metadata — aggregate index (Phase 4, v4.0)
// Additive, runtime-inert. Lookup canonical metadata by content_id.
import type { ContentMetadata, ContentType } from './types';
import { KEBIASAAN_BAIK_METADATA } from './kebiasaanBaik';
import { AJAK_MAIN_METADATA } from './ajakMain';
import { WAWASAN_TUMBUH_METADATA } from './wawasanTumbuh';

export * from './types';
export { KEBIASAAN_BAIK_METADATA } from './kebiasaanBaik';
export { AJAK_MAIN_METADATA } from './ajakMain';
export { WAWASAN_TUMBUH_METADATA } from './wawasanTumbuh';

/** All 172 canonical metadata records (57 KB + 51 AM + 64 WT). */
export const ALL_CONTENT_METADATA: ContentMetadata[] = [
  ...KEBIASAAN_BAIK_METADATA,
  ...AJAK_MAIN_METADATA,
  ...WAWASAN_TUMBUH_METADATA,
];

const BY_ID: Record<string, ContentMetadata> = Object.fromEntries(
  ALL_CONTENT_METADATA.map((m) => [m.content_id, m]),
);

/** Look up canonical metadata for a content_id (undefined if none). Read-only. */
export function getContentMetadata(contentId: string): ContentMetadata | undefined {
  return BY_ID[contentId];
}

/** All canonical metadata for a given content type. */
export function getMetadataByType(type: ContentType): ContentMetadata[] {
  return ALL_CONTENT_METADATA.filter((m) => m.content_type === type);
}
