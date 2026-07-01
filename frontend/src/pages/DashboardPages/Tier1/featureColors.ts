// Single source of truth for each Sekolah Studiva feature's accent color, so
// the sidebar, Beranda shortcut cards, and each feature's own page header all
// stay visually consistent without repeating hex/class strings everywhere.
export type FeatureKey =
  | 'beranda'
  | 'profil-anak'
  | 'perkembangan'
  | 'kehadiran'
  | 'portfolio'
  | 'asesmen'
  | 'iep'
  | 'catatan-guru'
  | 'pembayaran-spp';

interface FeatureColor {
  text: string;
  bg: string;
  bgSolid: string;
  border: string;
}

export const FEATURE_COLORS: Record<FeatureKey, FeatureColor> = {
  beranda: { text: 'text-stv-sky-stroke', bg: 'bg-stv-sky-tint', bgSolid: 'bg-stv-sky-stroke', border: 'border-stv-sky-stroke' },
  'profil-anak': { text: 'text-cyan-700', bg: 'bg-cyan-50', bgSolid: 'bg-cyan-600', border: 'border-cyan-600' },
  perkembangan: { text: 'text-orange-600', bg: 'bg-orange-50', bgSolid: 'bg-orange-500', border: 'border-orange-500' },
  kehadiran: { text: 'text-stv-green', bg: 'bg-stv-green-tint', bgSolid: 'bg-stv-green', border: 'border-stv-green' },
  portfolio: { text: 'text-purple-600', bg: 'bg-purple-50', bgSolid: 'bg-purple-500', border: 'border-purple-500' },
  asesmen: { text: 'text-indigo-600', bg: 'bg-indigo-50', bgSolid: 'bg-indigo-500', border: 'border-indigo-500' },
  iep: { text: 'text-blue-600', bg: 'bg-blue-50', bgSolid: 'bg-blue-600', border: 'border-blue-600' },
  'catatan-guru': { text: 'text-teal-600', bg: 'bg-teal-50', bgSolid: 'bg-teal-500', border: 'border-teal-500' },
  'pembayaran-spp': { text: 'text-emerald-600', bg: 'bg-emerald-50', bgSolid: 'bg-emerald-500', border: 'border-emerald-500' },
};
