export type LucideIcon = (props: any) => any;
import type { DomainCode } from './domains';
export type { DomainCode } from './domains';
export type AgeKey = "0-3m" | "3-6m" | "6-9m" | "9-12m" | "12-18m" | "18-24m" | "2-3y" | "3-4y" | "4-5y" | "5-6y";
export interface ScientificStat {
    value: string;
    label: string;
    ref?: number;
}
export interface ScientificSection {
    judul: string;
    isi: string;
}
export interface ScientificReference {
    n: number;
    text: string;
    url?: string;
}
export interface ScientificFigure {
    id: string;
    caption: string;
    afterSectionIndex?: number;
}
export type ScientificSectionRef = {
    type: "module";
    moduleId: string;
    sectionKey: string;
    judulOverride?: string;
    isiOverride?: string;
} | {
    type: "own";
    judul: string;
    isi: string;
};
export type ScientificStatRef = {
    type: "module";
    moduleId: string;
    statKey: string;
} | {
    type: "own";
    value: string;
    label: string;
    sourceId: string;
};
/** Card scientific payload — accepts BOTH the legacy shape (plain
 *  ScientificSection/ScientificStat with numbered [n] markers + references) and
 *  the new composable shape (…Ref arrays with [ref:id] tokens, no references). */
export interface ScientificData {
    title: string;
    readMinutes?: number;
    reviewedBy?: {
        name: string;
        date: string;
    };
    stats?: (ScientificStat | ScientificStatRef)[];
    figure?: ScientificFigure;
    /** Multiple figures (used by admin pipeline). Reader prefers this over figure. */
    figures?: ScientificFigure[];
    sections?: (ScientificSection | ScientificSectionRef)[];
    references?: ScientificReference[];
    /** Legacy fallback, still rendered if sections is absent/empty */
    paragraphs?: string[];
    takeaways?: string[];
}
export interface KnowledgeCard {
    id: string;
    ageKey: AgeKey;
    domain: DomainCode;
    title: string;
    photo: {
        src: string;
        alt: string;
        credit?: string;
    };
    readMinutes: number;
    /** Absent on placeholder cards (domain DK batch 1) → status derivasi = "segera-hadir" */
    summary?: {
        terjadi: string;
        penting: string;
        lakukan: string[];
        perhatian: string;
    };
    isMedical?: boolean;
    scientific: ScientificData;
    sources: string[];
    adminStatus?: 'draft' | 'published';
}
/** Derived content-fill status — NOT stored as data, computed from field presence. */
export type CardContentStatus = 'segera-hadir' | 'ringkasan-saja' | 'lengkap';
export declare function getCardContentStatus(card: KnowledgeCard): CardContentStatus;
export declare const AGE_RANGES: {
    key: AgeKey;
    label: string;
    fill: string;
    ink: string;
}[];
/** Derived from DOMAIN_CONFIGS — adding a domain only requires updating domains.ts. */
export declare const DOMAIN_MAP: Record<DomainCode, {
    label: string;
    icon: LucideIcon;
    bg: string;
    fg: string;
}>;
export declare const SUMMARY_LABEL_STYLES: {
    terjadi: {
        text: string;
        bg: string;
        fg: string;
    };
    penting: {
        text: string;
        bg: string;
        fg: string;
    };
    lakukan: {
        text: string;
        bg: string;
        fg: string;
    };
};
export declare const CARDS: KnowledgeCard[];
//# sourceMappingURL=knowledgeCardData.d.ts.map