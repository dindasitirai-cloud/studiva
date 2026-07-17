"use strict";
// ============================================================================
// Shared compose module — canonical implementation.
// Imported by BOTH frontend (via symlink at src/lib/compose) and backend
// (via symlink at src/lib/compose).  ONE implementation, two execution sites.
//
// Design: pure function — accepts card/modules/sources as parameters; no global
// imports, no framework dependencies, safe to import in Node or browser.
//
// Output is byte-identical to the original hand-written card.scientific shape
// (modulo citation renumbering), so no UI change is required.
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeScientific = void 0;
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
const REF_TOKEN = /\[ref:([^\]]+)\]/g;
function hasType(x) {
    return typeof x === 'object' && x !== null && 'type' in x;
}
function isModuleSectionRef(x) {
    return hasType(x) && x.type === 'module' && 'sectionKey' in x;
}
function isOwnSectionRef(x) {
    return hasType(x) && x.type === 'own' && 'isi' in x;
}
function isModuleStatRef(x) {
    return hasType(x) && x.type === 'module' && 'statKey' in x;
}
function isOwnStatRef(x) {
    return hasType(x) && x.type === 'own' && 'sourceId' in x;
}
// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
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
function composeScientific(card, modules, sources) {
    const sci = card.scientific;
    const sections = sci.sections ?? [];
    const stats = sci.stats ?? [];
    // Legacy / TODO cards: any ref-type markers → already in final shape.
    const isNew = sections.some(hasType) || stats.some(hasType);
    if (!isNew) {
        return { ...sci };
    }
    // 1. Resolve stats to intermediate { value, label, sourceId? }
    const resolvedStats = stats.map((st) => {
        if (isModuleStatRef(st)) {
            const mod = modules[st.moduleId];
            const ms = mod?.stats.find((s) => s.key === st.statKey);
            if (!ms)
                throw new Error(`[composeScientific] ${card.id}: unknown module stat ${st.moduleId}::${st.statKey}`);
            return { value: ms.value, label: ms.label, sourceId: ms.sourceId };
        }
        if (isOwnStatRef(st)) {
            return { value: st.value, label: st.label, sourceId: st.sourceId };
        }
        // legacy: plain stat, no sourceId token
        const s = st;
        return { value: s.value, label: s.label, sourceId: undefined };
    });
    // 2. Resolve sections to { judul, isi } (isi still holds [ref:id] tokens)
    const resolvedSections = sections.map((sec) => {
        if (isModuleSectionRef(sec)) {
            const mod = modules[sec.moduleId];
            const ms = mod?.sections.find((s) => s.key === sec.sectionKey);
            if (!ms)
                throw new Error(`[composeScientific] ${card.id}: unknown module section ${sec.moduleId}::${sec.sectionKey}`);
            return { judul: sec.judulOverride ?? ms.judul, isi: sec.isiOverride ?? ms.isi };
        }
        if (isOwnSectionRef(sec)) {
            return { judul: sec.judul, isi: sec.isi };
        }
        // legacy: plain { judul, isi }
        const s = sec;
        return { judul: s.judul, isi: s.isi };
    });
    // 3. Number sourceIds by first appearance: stats first, then section tokens
    const order = [];
    const idx = new Map();
    const reg = (id) => {
        if (!idx.has(id)) {
            order.push(id);
            idx.set(id, order.length);
        }
        return idx.get(id);
    };
    for (const s of resolvedStats)
        if (s.sourceId)
            reg(s.sourceId);
    for (const s of resolvedSections) {
        let m;
        REF_TOKEN.lastIndex = 0;
        while ((m = REF_TOKEN.exec(s.isi)) !== null)
            reg(m[1]);
    }
    // 4. Emit final output shapes
    const outStats = resolvedStats.map((s) => ({
        value: s.value,
        label: s.label,
        ...(s.sourceId ? { ref: idx.get(s.sourceId) } : {}),
    }));
    const outSections = resolvedSections.map((s) => ({
        judul: s.judul,
        isi: s.isi.replace(REF_TOKEN, (_full, id) => {
            const n = idx.get(id);
            if (!n) {
                console.warn(`[composeScientific] ${card.id}: unmapped [ref:${id}]`);
                return `[ref:${id}]`;
            }
            return `[${n}]`;
        }),
    }));
    const references = order.map((id, i) => {
        const src = sources[id];
        if (!src) {
            console.warn(`[composeScientific] ${card.id}: sourceId '${id}' not found in sources`);
            return { n: i + 1, text: `(sumber tak dikenal: ${id})` };
        }
        return { n: i + 1, text: src.label, ...(src.url ? { url: src.url } : {}) };
    });
    return {
        title: sci.title,
        readMinutes: sci.readMinutes,
        reviewedBy: sci.reviewedBy,
        figure: sci.figure,
        stats: outStats.length ? outStats : undefined,
        sections: outSections,
        references: references.length ? references : undefined,
    };
}
exports.composeScientific = composeScientific;
//# sourceMappingURL=index.js.map