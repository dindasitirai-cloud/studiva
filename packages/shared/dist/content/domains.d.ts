import { LucideIcon } from 'lucide-react';
export type DomainCode = "FM" | "KG" | "BH" | "SE" | "KS" | "PS" | "DK";
export interface DomainConfig {
    code: DomainCode;
    label: string;
    shortLabel: string;
    icon: LucideIcon;
    bg: string;
    fg: string;
    strictFreshness: boolean;
    sensitiveDisclaimer?: string;
    attentionLabel?: string;
}
export declare const DOMAIN_CONFIGS: DomainConfig[];
export declare const DOMAIN_CONFIG_MAP: Record<DomainCode, DomainConfig>;
export declare const DOMAIN_CODES: DomainCode[];
//# sourceMappingURL=domains.d.ts.map