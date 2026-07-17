import { PortfolioCategory } from './DashboardTier1Context';

interface CategoryMeta {
  label: string;
  text: string;
  bg: string;
  chipActive: string;
}

export const PORTFOLIO_CATEGORY_META: Record<PortfolioCategory, CategoryMeta> = {
  seni: { label: 'Seni', text: 'text-purple-600', bg: 'bg-purple-50', chipActive: 'bg-purple-500 text-white' },
  motorik: { label: 'Motorik', text: 'text-cyan-600', bg: 'bg-cyan-50', chipActive: 'bg-cyan-500 text-white' },
  proyek: { label: 'Proyek', text: 'text-pink-600', bg: 'bg-pink-50', chipActive: 'bg-pink-500 text-white' },
  akademik: { label: 'Akademik', text: 'text-blue-600', bg: 'bg-blue-50', chipActive: 'bg-blue-500 text-white' },
};
