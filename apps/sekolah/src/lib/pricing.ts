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

export const PLAN_ORDER: Plan[] = ['monthly', 'quarterly', 'yearly'];

export function formatIDR(amount: number): string {
  if (amount === 0) return 'Rp0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    amount
  );
}

export const TIER_LABELS: Record<Tier, string> = {
  tier1: 'Tier 1: Sekolah Studiva',
  tier2: 'Tier 2: Studiva Digital',
};
