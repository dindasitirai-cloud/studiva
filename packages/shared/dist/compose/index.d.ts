export interface ComposeModuleSection {
    key: string;
    judul: string;
    isi: string;
}
export interface ComposeModuleStat {
    key: string;
    value: string;
    label: string;
    sourceId: string;
}
export interface ComposeModule {
    sections: ComposeModuleSection[];
    stats: ComposeModuleStat[];
}
export interface ComposeSource {
    label: string;
    url?: string;
}
type SectionRef = {
    type: 'module';
    moduleId: string;
    sectionKey: string;
    judulOverride?: string;
    isiOverride?: string;
} | {
    type: 'own';
    judul: string;
    isi: string;
};
type StatRef = {
    type: 'module';
    moduleId: string;
    statKey: string;
} | {
    type: 'own';
    value: string;
    label: string;
    sourceId: string;
};
interface LegacyStat {
    value: string;
    label: string;
    ref?: number;
}
interface LegacySection {
    judul: string;
    isi: string;
}
export interface ComposeFigure {
    id: string;
    caption: string;
    afterSectionIndex?: number;
}
export interface ComposeCard {
    id: string;
    scientific: {
        title: string;
        readMinutes?: number;
        reviewedBy?: {
            name: string;
            date: string;
        };
        figure?: ComposeFigure;
        figures?: ComposeFigure[];
        sections?: (SectionRef | LegacySection)[];
        stats?: (StatRef | LegacyStat)[];
        paragraphs?: string[];
        takeaways?: string[];
    };
}
export interface ResolvedStat {
    value: string;
    label: string;
    ref?: number;
}
export interface ResolvedSection {
    judul: string;
    isi: string;
}
export interface ResolvedReference {
    n: number;
    text: string;
    url?: string;
}
export interface ScientificResolved {
    title: string;
    readMinutes?: number;
    reviewedBy?: {
        name: string;
        date: string;
    };
    stats?: ResolvedStat[];
    figure?: ComposeFigure;
    figures?: ComposeFigure[];
    sections?: ResolvedSection[];
    references?: ResolvedReference[];
    paragraphs?: string[];
    takeaways?: string[];
}
/**
 * Resolve a card's composable scientific payload into the concrete shape the
 * reader UI expects: numbered [n] citations + a references list.
 *
 * Legacy / TODO cards (plain sections with [n] markers, or title-only stubs)
 * are passed through untouched.
 *
 * @param card    - card to compose
 * @param modules - keyed record of ComposeModule (by moduleId)
 * @param sources - keyed record of ComposeSource (by sourceId)
 */
export declare function composeScientific(card: ComposeCard, modules: Record<string, ComposeModule>, sources: Record<string, ComposeSource>): ScientificResolved;
export {};
//# sourceMappingURL=index.d.ts.map