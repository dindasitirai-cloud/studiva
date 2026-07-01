export type GuruModuleKey =
  | 'beranda'
  | 'kelas'
  | 'perkembangan'
  | 'kehadiran'
  | 'portfolio'
  | 'asesmen'
  | 'iep'
  | 'catatan-ortu';

interface ModuleColor {
  text: string;
  bg: string;
  bgSolid: string;
}

export const GURU_COLORS: Record<GuruModuleKey, ModuleColor> = {
  beranda: { text: 'text-stv-navy', bg: 'bg-stv-badge-navy-tint', bgSolid: 'bg-stv-navy' },
  kelas: { text: 'text-cyan-700', bg: 'bg-cyan-50', bgSolid: 'bg-cyan-600' },
  perkembangan: { text: 'text-orange-600', bg: 'bg-orange-50', bgSolid: 'bg-orange-500' },
  kehadiran: { text: 'text-stv-green', bg: 'bg-stv-green-tint', bgSolid: 'bg-stv-green' },
  portfolio: { text: 'text-purple-600', bg: 'bg-purple-50', bgSolid: 'bg-purple-500' },
  asesmen: { text: 'text-blue-600', bg: 'bg-blue-50', bgSolid: 'bg-blue-600' },
  iep: { text: 'text-indigo-600', bg: 'bg-indigo-50', bgSolid: 'bg-indigo-600' },
  'catatan-ortu': { text: 'text-teal-600', bg: 'bg-teal-50', bgSolid: 'bg-teal-600' },
};
