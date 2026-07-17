// Pure freshness logic — no React, no project data imports. Easily unit-tested.

export type Freshness = "segar" | "menua" | "perlu-tinjau";

export interface FreshnessMeta {
  label: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
  borderClass: string;
}

export const FRESHNESS_META: Record<Freshness, FreshnessMeta> = {
  segar: {
    label: "Segar",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-300",
  },
  menua: {
    label: "Menua",
    textClass: "text-rekah-tua",
    bgClass: "bg-fajar",
    dotClass: "bg-madu",
    borderClass: "border-madu",
  },
  "perlu-tinjau": {
    label: "Perlu tinjau",
    textClass: "text-red-700",
    bgClass: "bg-red-50",
    dotClass: "bg-red-500",
    borderClass: "border-red-300",
  },
};

/** Parse "YYYY-MM" or "YYYY-MM-DD" to a Date at the first of that month. */
export function parseYearMonth(ym: string): Date {
  const parts = ym.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
}

/** Complete months elapsed from `from` to `to` (floored). */
export function monthsDiff(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

/**
 * Compute freshness for a single last-reviewed date.
 * Any active flag immediately returns "perlu-tinjau".
 *
 * strictFreshness=true  (KS, DK): <9 mo = segar, 9–12 = menua, ≥12 = perlu-tinjau.
 * strictFreshness=false (others):  <12 mo = segar, 12–18 = menua, ≥18 = perlu-tinjau.
 *
 * Callers derive `strictFreshness` from DOMAIN_CONFIG_MAP[domain].strictFreshness.
 */
export function hitungFreshness(
  lastReviewed: string,
  strictFreshness: boolean,
  adaFlag: boolean,
  now: Date
): Freshness {
  if (adaFlag) return "perlu-tinjau";
  const age = monthsDiff(parseYearMonth(lastReviewed), now);
  if (strictFreshness) {
    if (age < 9) return "segar";
    if (age < 12) return "menua";
    return "perlu-tinjau";
  }
  if (age < 12) return "segar";
  if (age < 18) return "menua";
  return "perlu-tinjau";
}

/** Return the worst freshness value in the list; "segar" if the list is empty. */
export function worstFreshness(values: Freshness[]): Freshness {
  if (values.includes("perlu-tinjau")) return "perlu-tinjau";
  if (values.includes("menua")) return "menua";
  return "segar";
}

/** Format a "YYYY-MM" string for display as "Bln/Thn" (e.g. "07/2026"). */
export function fmtYM(ym: string): string {
  const [y, m] = ym.split("-");
  return `${m}/${y}`;
}
