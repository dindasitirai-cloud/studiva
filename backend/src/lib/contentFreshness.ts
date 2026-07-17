// Pure freshness logic — no DB imports, matches frontend/src/lib/contentFreshness.ts.
// Copied here so backend can compute derived freshness without importing React files.

export type Freshness = 'segar' | 'menua' | 'perlu-tinjau';

export function monthsDiff(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

export function parseYearMonth(ym: string): Date {
  const parts = ym.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
}

/**
 * Compute freshness for a last-reviewed date string ('YYYY-MM').
 * strictFreshness=true (KS, DK): <9mo=segar, 9-12=menua, >=12=perlu-tinjau
 * strictFreshness=false (others): <12mo=segar, 12-18=menua, >=18=perlu-tinjau
 */
export function hitungFreshness(
  lastReviewedYM: string | null | undefined,
  now: Date,
  strictFreshness: boolean,
  hasActiveFlag = false,
): Freshness {
  if (hasActiveFlag) return 'perlu-tinjau';
  if (!lastReviewedYM) return 'perlu-tinjau';
  const from = parseYearMonth(lastReviewedYM);
  const months = monthsDiff(from, now);
  if (strictFreshness) {
    if (months < 9) return 'segar';
    if (months < 12) return 'menua';
    return 'perlu-tinjau';
  }
  if (months < 12) return 'segar';
  if (months < 18) return 'menua';
  return 'perlu-tinjau';
}
