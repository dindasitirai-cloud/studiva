import { UpdateCategory } from './DashboardTier1Context';

// Shared so Beranda's "Update Hari Ini" card and the full Perkembangan
// Harian timeline/filter chips show the same label + color per category.
interface CategoryMeta {
  label: string;
  text: string;
  bg: string;
  chipActive: string;
}

export const CATEGORY_META: Record<UpdateCategory, CategoryMeta> = {
  akademik: { label: 'Akademik', text: 'text-blue-600', bg: 'bg-blue-50', chipActive: 'bg-blue-600 text-white' },
  'sosial-emosional': { label: 'Sosial-Emosional', text: 'text-pink-600', bg: 'bg-pink-50', chipActive: 'bg-pink-600 text-white' },
  motorik: { label: 'Motorik', text: 'text-green-600', bg: 'bg-green-50', chipActive: 'bg-green-600 text-white' },
  komunikasi: { label: 'Komunikasi', text: 'text-purple-600', bg: 'bg-purple-50', chipActive: 'bg-purple-600 text-white' },
  sensorik: { label: 'Sensorik', text: 'text-teal-600', bg: 'bg-teal-50', chipActive: 'bg-teal-600 text-white' },
};
