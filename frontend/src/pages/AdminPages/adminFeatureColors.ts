// Single source of truth for each admin module's accent color, so the
// sidebar, Beranda shortcut cards, and each module's own page header stay
// visually consistent. Organized/professional palette, not a playful one -
// this is a work tool for the internal team, not a parent-facing dashboard.
export type AdminModuleKey =
  | 'beranda'
  | 'courses'
  | 'strategies'
  | 'forum'
  | 'konsultasi'
  | 'members'
  | 'payments'
  | 'settings'
  | 'spp-billing'
  | 'sekolah-akun'
  | 'guru-akun'
  | 'knowledge-cards';

interface ModuleColor {
  text: string;
  bg: string;
  bgSolid: string;
}

export const ADMIN_COLORS: Record<AdminModuleKey, ModuleColor> = {
  beranda: { text: 'text-stv-navy', bg: 'bg-stv-badge-navy-tint', bgSolid: 'bg-stv-navy' },
  courses: { text: 'text-purple-600', bg: 'bg-purple-50', bgSolid: 'bg-purple-600' },
  strategies: { text: 'text-stv-green', bg: 'bg-stv-green-tint', bgSolid: 'bg-stv-green' },
  forum: { text: 'text-orange-600', bg: 'bg-orange-50', bgSolid: 'bg-orange-500' },
  konsultasi: { text: 'text-teal-600', bg: 'bg-teal-50', bgSolid: 'bg-teal-500' },
  members: { text: 'text-pink-600', bg: 'bg-pink-50', bgSolid: 'bg-pink-500' },
  payments: { text: 'text-indigo-600', bg: 'bg-indigo-50', bgSolid: 'bg-indigo-500' },
  settings: { text: 'text-slate-600', bg: 'bg-slate-100', bgSolid: 'bg-slate-500' },
  'spp-billing': { text: 'text-emerald-600', bg: 'bg-emerald-50', bgSolid: 'bg-emerald-500' },
  'sekolah-akun': { text: 'text-sky-600', bg: 'bg-sky-50', bgSolid: 'bg-sky-500' },
  'guru-akun':    { text: 'text-teal-600', bg: 'bg-teal-50', bgSolid: 'bg-teal-500' },
  'knowledge-cards': { text: 'text-amber-600', bg: 'bg-amber-50', bgSolid: 'bg-amber-500' },
};
