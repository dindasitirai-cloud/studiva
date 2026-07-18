// Re-export dari @studiva/shared/content — file ini adalah shim agar
// komponen Panduan yang direstorasi bisa tetap mengimpor dari path lokal ini
// tanpa mengubah satu baris logika UI pun.
export {
  CARDS,
  AGE_RANGES,
  DOMAIN_MAP,
  SUMMARY_LABEL_STYLES,
  getCardContentStatus,
} from '@studiva/shared';
export type { AgeKey, KnowledgeCard, LucideIcon } from '@studiva/shared';
export type { DomainCode } from '@studiva/shared';
