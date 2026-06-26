import { DiscussionCategory } from '../types';

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = ['general', 'tier1', 'tier2', 'topic', 'fitri'];

export const CATEGORY_STRUCTURE: Record<DiscussionCategory, { label: string; subcategories: string[] }> = {
  general: {
    label: 'General',
    subcategories: [
      'Introductions',
      'Wins & Celebrations',
      'Advice Needed',
      'Resource Sharing',
      'Off-Topic',
    ],
  },
  tier1: {
    label: 'Tier 1 Specific',
    subcategories: [
      'Daily Updates',
      'School Events',
      'Therapy Progress',
      'Teacher Communication',
      'Parent Insights',
    ],
  },
  tier2: {
    label: 'Tier 2 Specific',
    subcategories: [
      'Course Reviews',
      'Learning at Home',
      'Technology Tips',
      'Motivation & Accountability',
      'Age Groups',
    ],
  },
  topic: {
    label: 'Topics',
    subcategories: [
      'Sensory Issues',
      'Social Skills',
      'Behavior Management',
      'Speech & Language',
      'Learning Disabilities',
      'Parent Mental Health',
      'Self Care',
      'Milestone Celebrations',
    ],
  },
  fitri: {
    label: 'With Psikolog Fitri',
    subcategories: [
      'Questions for Psikolog Fitri',
      'Expert Advice',
      'After Consultation',
      'Success Stories',
    ],
  },
};

/**
 * Which subscription tier(s) may READ a category. `general`/`topic`/`fitri`
 * are visible to any active subscriber; `tier1`/`tier2` are restricted to
 * that tier specifically (mirrors the POST restriction below).
 */
export function categoryReadableByTier(category: DiscussionCategory, tier: 'tier1' | 'tier2' | null): boolean {
  if (category === 'tier1') return tier === 'tier1';
  if (category === 'tier2') return tier === 'tier2';
  return true;
}
