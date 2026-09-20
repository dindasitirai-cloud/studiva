// Rekah Journey — Content Selection tests (Phase 9B-5). Downstream of focus; canonical only.
import { describe, it, expect } from 'vitest';
import { selectContent } from '../selectContent';
import type { ContentSelectionInput, ContentDescriptor } from '../types';
import type { CanonicalJourneyContentMapping, VersionStamp } from '../../types';
import type { FocusTargets } from '../../focus/types';
import { focusKey } from '../../focus/resolveFocus';

const V: VersionStamp = { metadataVersion: 'v6' as any, mappingVersion: 'ctj-v1.0' as any, ruleVersion: 'fsm-v1.0' as any };
const map = (id: string, ct: string, role: string, stages: string[]): CanonicalJourneyContentMapping => ({
  mappingStatus: 'CANONICAL', confidence: 'HIGH', mappingId: ('m-' + id) as any, contentId: id as any,
  contentType: ct as any, primaryRole: role as any, secondaryRoles: [], stages: stages as any, mappingVersion: V.mappingVersion,
});
// Real frozen IDs.
const am001: ContentDescriptor = { mapping: map('am-001', 'AJAK_MAIN', 'DO', ['DO']), ageMinMonths: 0, ageMaxMonths: 12,
  devDomain: 'Gross Motor', devCapability: 'Locomotion and Moving Through Space', familyValue: null, knowledgeArea: null, knowledgeTopic: null, parentingPracticeCandidate: false };
const koReg = (stages: string[]): ContentDescriptor => ({ mapping: map('am-ko-regulasi', 'AJAK_MAIN', 'PARENT_IMPLEMENTATION', stages),
  ageMinMonths: 0, ageMaxMonths: 13, devDomain: null, devCapability: null, familyValue: null, knowledgeArea: null, knowledgeTopic: null,
  parentingPracticeCandidate: true, relatedFocusKeys: [focusKey({ domainOrArea: 'Self-Regulation & Executive Function', capabilityOrTopic: 'Emotional Regulation' })] });
// A synthetic KB (marked synthetic) covering older ages for the fallback path.
const kbOld: ContentDescriptor = { mapping: map('kb-050', 'KEBIASAAN_BAIK', 'ROUTINE', ['DO']), ageMinMonths: 0, ageMaxMonths: 72,
  devDomain: 'Gross Motor', devCapability: 'Locomotion and Moving Through Space', familyValue: 'Kemandirian', knowledgeArea: null, knowledgeTopic: null, parentingPracticeCandidate: false };

const grossFocus: FocusTargets = { domainOrArea: 'Gross Motor', capabilityOrTopic: 'Locomotion and Moving Through Space' };
const regFocus: FocusTargets = { domainOrArea: 'Self-Regulation & Executive Function', capabilityOrTopic: 'Emotional Regulation' };

const inp = (o: Partial<ContentSelectionInput>): ContentSelectionInput => ({
  asOf: '2026-01-01T00:00:00.000Z', versions: V, currentState: 'DO', activeFocusTargets: grossFocus,
  childAgeMonths: 8, descriptors: [], ...o,
});

describe('canonical + stage + eligibility', () => {
  it('1 selects a canonical AM primary in DO for an age-eligible child', () => {
    const r = selectContent(inp({ descriptors: [am001] }));
    expect(r.fallbackStatus).toBe('PRIMARY_MATCH');
    expect(r.selected?.contentId).toBe('am-001');
    expect(r.role).toBe('DO');
  });
  it('3 stage mismatch excluded (UNDERSTAND content asked in DO)', () => {
    const wt = { ...am001, mapping: map('RL-0-3m-KG', 'WAWASAN_TUMBUH', 'UNDERSTAND', ['PREPARE']), parentingPracticeCandidate: false } as ContentDescriptor;
    expect(selectContent(inp({ descriptors: [wt] })).fallbackStatus).toBe('NO_MATCH');
  });
  it('4 age mismatch excluded', () => {
    expect(selectContent(inp({ descriptors: [am001], childAgeMonths: 48 })).fallbackStatus).toBe('NO_MATCH');
  });
  it('5 focus mismatch excluded', () => {
    expect(selectContent(inp({ descriptors: [am001], activeFocusTargets: { domainOrArea: 'Cognitive', capabilityOrTopic: 'Attention and Focus' } })).fallbackStatus).toBe('NO_MATCH');
  });
  it('8 NO_MATCH when nothing qualifies', () => {
    expect(selectContent(inp({ descriptors: [] })).fallbackStatus).toBe('NO_MATCH');
  });
});

describe('AM age gap fallback', () => {
  it('9 AM primary for <=36 months', () => {
    expect(selectContent(inp({ descriptors: [am001, kbOld], childAgeMonths: 10 })).selected?.contentId).toBe('am-001');
  });
  it('10-12 >36 months: AM age-excluded -> KB FALLBACK_MATCH with AM_AGE_GAP_FALLBACK', () => {
    const r = selectContent(inp({ descriptors: [am001, kbOld], childAgeMonths: 48 }));
    expect(r.fallbackStatus).toBe('FALLBACK_MATCH');
    expect(r.reasonCode).toBe('AM_AGE_GAP_FALLBACK');
    expect(r.selected?.contentId).toBe('kb-050');
  });
  it('13 NO_MATCH when >36m, AM excluded, and no KB fallback', () => {
    expect(selectContent(inp({ descriptors: [am001], childAgeMonths: 48 })).fallbackStatus).toBe('NO_MATCH');
  });
  it('9-fallback never masquerades as primary', () => {
    const r = selectContent(inp({ descriptors: [am001, kbOld], childAgeMonths: 48 }));
    expect(r.fallbackStatus).not.toBe('PRIMARY_MATCH');
  });
});

describe('parenting practice reuse (same content_id, PREPARE + DO)', () => {
  it('14-15-16 same am-ko-regulasi selected in PREPARE and DO', () => {
    const prep = selectContent(inp({ currentState: 'PREPARE', activeFocusTargets: regFocus, descriptors: [koReg(['PREPARE', 'DO'])] }));
    const doo = selectContent(inp({ currentState: 'DO', activeFocusTargets: regFocus, descriptors: [koReg(['PREPARE', 'DO'])] }));
    expect(prep.selected?.contentId).toBe('am-ko-regulasi');
    expect(doo.selected?.contentId).toBe('am-ko-regulasi');
    expect(prep.stage).toBe('PREPARE'); expect(doo.stage).toBe('DO');
  });
});

describe('exclusion / dedup / novelty', () => {
  it('17 cross-thread weekly dedup suppresses the content', () => {
    expect(selectContent(inp({ descriptors: [am001], weeklyDedupContentIds: ['am-001'] as any })).fallbackStatus).toBe('NO_MATCH');
  });
  it('18-19 previously exposed stays eligible; novelty only orders ties', () => {
    const r = selectContent(inp({ descriptors: [am001], recentlyExposedContentIds: ['am-001'] as any }));
    expect(r.selected?.contentId).toBe('am-001'); // still eligible
  });
  it('parent exclusion is a hard filter', () => {
    expect(selectContent(inp({ descriptors: [am001], excludedContentIds: ['am-001'] as any })).fallbackStatus).toBe('NO_MATCH');
  });
});

describe('boundaries / determinism / invariants', () => {
  it('25 unknown age -> NO_MATCH (not all-ages)', () => {
    expect(selectContent(inp({ descriptors: [am001], childAgeMonths: null })).fallbackStatus).toBe('NO_MATCH');
  });
  it('26 unknown focus -> NO_MATCH', () => {
    expect(selectContent(inp({ descriptors: [am001], activeFocusTargets: null })).fallbackStatus).toBe('NO_MATCH');
  });
  it('FOCUS/REFLECT/ADAPT states have no content stage', () => {
    for (const s of ['FOCUS', 'REFLECT', 'ADAPT', 'GROUND'] as const) {
      expect(selectContent(inp({ descriptors: [am001], currentState: s })).fallbackStatus).toBe('NO_MATCH');
    }
  });
  it('22 version stamps preserved', () => {
    const r = selectContent(inp({ descriptors: [am001] }));
    expect(r.versions).toEqual(V); expect(r.ruleVersion).toBe('fsm-v1.0');
  });
  it('23 determinism x50', () => {
    const i = inp({ descriptors: [am001, kbOld], childAgeMonths: 10 });
    const one = JSON.stringify(selectContent(i));
    for (let k = 0; k < 50; k++) expect(JSON.stringify(selectContent(i))).toBe(one);
  });
  it('24 stable content_id tie-break', () => {
    const a = { ...am001, mapping: map('am-020', 'AJAK_MAIN', 'DO', ['DO']) } as ContentDescriptor;
    const b = { ...am001, mapping: map('am-005', 'AJAK_MAIN', 'DO', ['DO']) } as ContentDescriptor;
    expect(selectContent(inp({ descriptors: [a, b] })).selected?.contentId).toBe('am-005'); // lower id wins
  });
  it('3/4 selected is only content_id + mappingId (no body/title/type copied)', () => {
    const r = selectContent(inp({ descriptors: [am001] }));
    expect(Object.keys(r.selected as object).sort()).toEqual(['contentId', 'mappingId']);
  });
});
