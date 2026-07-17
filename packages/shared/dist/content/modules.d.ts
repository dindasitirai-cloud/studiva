export interface ModuleSection {
    key: string;
    judul: string;
    isi: string;
}
export interface ModuleStat {
    key: string;
    value: string;
    label: string;
    sourceId: string;
}
export interface KnowledgeModule {
    id: string;
    title: string;
    domainHints: string[];
    sections: ModuleSection[];
    stats: ModuleStat[];
    figureId?: string;
    sourceIds: string[];
    status: "draft" | "review" | "approved" | "published";
    lastReviewed: string;
}
export declare const MODULES: Record<string, KnowledgeModule>;
//# sourceMappingURL=modules.d.ts.map