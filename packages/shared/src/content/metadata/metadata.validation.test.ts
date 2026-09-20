// Runs the Phase 4 canonical-metadata integrity checks (the 17 required checks)
// through the project's own toolchain (vitest). Runtime-inert; test only.
import { describe, it, expect } from 'vitest';
import { runValidation, EXPECTED_COUNTS } from './validation';
import { ALL_CONTENT_METADATA } from './index';

describe('canonical content metadata (Phase 4)', () => {
  const res = runValidation();

  it('passes all 17 integrity checks with zero errors', () => {
    if (!res.ok) console.error(res.errors);
    expect(res.errors).toEqual([]);
    expect(res.ok).toBe(true);
  });

  it('has exactly 172 records, no duplicates, no orphans, none missing', () => {
    expect(res.stats.total).toBe(172);
    expect(res.stats.duplicates).toBe(0);
    expect(res.stats.orphans).toBe(0);
    expect(res.stats.missing).toBe(0);
  });

  it('matches the approved per-type counts (57 / 51 / 64)', () => {
    expect(res.stats.byType).toEqual(EXPECTED_COUNTS);
  });

  it('matches the post-Phase-5 readiness distribution (54 / 118 / 0 / 0)', () => {
    expect(res.stats.readiness).toEqual({
      READY: 54,
      READY_WITH_NULLS: 118,
    });
    expect(res.stats.remainingNeedsReview).toBe(0);
  });

  it('has no Percaya Diri family value anywhere', () => {
    const bad = ALL_CONTENT_METADATA.filter((m) =>
      [m.family.primary_value, ...m.family.secondary]
        .filter(Boolean)
        .some((v) => /percaya\s*diri|confidence/i.test(String(v))),
    );
    expect(bad).toEqual([]);
  });

  it('confirms exactly 5 parenting practices and rejects 1 (Phase 5)', () => {
    expect(res.stats.parentingPractices).toBe(5);
    expect(res.stats.parentingRejected).toBe(1);
  });
});
