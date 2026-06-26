import { Plan, Tier } from '../types';

interface PlanInfo {
  amount: number;
  label: string;
  savingsPercent: number;
}

export const PRICING: Record<Tier, Record<Plan, PlanInfo>> = {
  tier1: {
    monthly: { amount: 500_000, label: 'Bulanan', savingsPercent: 0 },
    quarterly: { amount: 1_300_000, label: '3 Bulan', savingsPercent: 13 },
    yearly: { amount: 4_800_000, label: 'Tahunan', savingsPercent: 20 },
  },
  tier2: {
    monthly: { amount: 79_000, label: 'Bulanan', savingsPercent: 0 },
    quarterly: { amount: 200_000, label: '3 Bulan', savingsPercent: 15 },
    yearly: { amount: 650_000, label: 'Tahunan', savingsPercent: 30 },
  },
};

export function getPlanInfo(tier: Tier, plan: Plan): PlanInfo {
  return PRICING[tier][plan];
}

export function planToStripeRecurring(plan: Plan): { interval: 'month' | 'year'; interval_count: number } {
  switch (plan) {
    case 'monthly':
      return { interval: 'month', interval_count: 1 };
    case 'quarterly':
      return { interval: 'month', interval_count: 3 };
    case 'yearly':
      return { interval: 'year', interval_count: 1 };
  }
}

export function computeEndDate(plan: Plan, startDate: Date = new Date()): string {
  const end = new Date(startDate);
  switch (plan) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  return end.toISOString().slice(0, 10);
}

export const TIER_LABELS: Record<Tier, string> = {
  tier1: 'Tier 1: Sekolah Studiva',
  tier2: 'Tier 2: Studiva Digital',
};
