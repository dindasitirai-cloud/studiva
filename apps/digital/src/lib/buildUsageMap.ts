import type { KnowledgeCard } from '../pages/DashboardPages/Tier2/knowledgeCardData';
import type { KnowledgeModule } from '../pages/DashboardPages/Tier2/modules';

export interface UsageMap {
  /** moduleId → cardId[] */
  moduleToCards: Record<string, string[]>;
  /** cardId → moduleId[] */
  cardToModules: Record<string, string[]>;
  /** sourceId → moduleId[] (from module.sourceIds) */
  sourceToModules: Record<string, string[]>;
  /** sourceId → cardId[] (transitive: source → modules → cards, plus direct own-stat citations) */
  sourceToCards: Record<string, string[]>;
}

function isModuleSectionRef(s: unknown): s is { type: "module"; moduleId: string } {
  return typeof s === "object" && s !== null && (s as Record<string, unknown>).type === "module";
}

function isModuleStatRef(s: unknown): s is { type: "module"; moduleId: string } {
  return typeof s === "object" && s !== null && (s as Record<string, unknown>).type === "module";
}

function isOwnStatWithSource(s: unknown): s is { type: "own"; sourceId: string } {
  return (
    typeof s === "object" &&
    s !== null &&
    (s as Record<string, unknown>).type === "own" &&
    typeof (s as Record<string, unknown>).sourceId === "string"
  );
}

/**
 * Build the full usage map by traversing card section/stat refs and
 * module sourceIds. Pure derivation — never hard-code module↔card relationships.
 */
export function buildUsageMap(
  cards: KnowledgeCard[],
  modules: Record<string, KnowledgeModule>
): UsageMap {
  const moduleToCards: Record<string, string[]> = {};
  const cardToModules: Record<string, string[]> = {};
  const sourceToModules: Record<string, string[]> = {};
  const sourceToCards: Record<string, string[]> = {};

  // source → modules from module.sourceIds
  for (const mod of Object.values(modules)) {
    for (const srcId of mod.sourceIds) {
      (sourceToModules[srcId] ??= []).push(mod.id);
    }
  }

  // cards → modules via section/stat refs
  for (const card of cards) {
    const usedModules = new Set<string>();
    const { sections, stats } = card.scientific;

    if (sections) {
      for (const s of sections) {
        if (isModuleSectionRef(s)) usedModules.add(s.moduleId);
      }
    }
    if (stats) {
      for (const s of stats) {
        if (isModuleStatRef(s)) usedModules.add(s.moduleId);
      }
    }

    const modArr = Array.from(usedModules);
    cardToModules[card.id] = modArr;
    for (const modId of modArr) {
      (moduleToCards[modId] ??= []).push(card.id);
    }
  }

  // transitive: source → cards (via module chain)
  for (const [srcId, modIds] of Object.entries(sourceToModules)) {
    const cardSet = new Set<string>();
    for (const modId of modIds) {
      for (const cId of moduleToCards[modId] ?? []) cardSet.add(cId);
    }
    sourceToCards[srcId] = Array.from(cardSet);
  }

  // also add direct own-stat source citations
  for (const card of cards) {
    const { stats } = card.scientific;
    if (!stats) continue;
    for (const s of stats) {
      if (isOwnStatWithSource(s)) {
        const arr = (sourceToCards[s.sourceId] ??= []);
        if (!arr.includes(card.id)) arr.push(card.id);
      }
    }
  }

  return { moduleToCards, cardToModules, sourceToModules, sourceToCards };
}
