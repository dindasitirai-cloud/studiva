import { IEPGoalStatus, IEPGoalTerm } from './DashboardTier1Context';

export const IEP_STATUS_META: Record<IEPGoalStatus, { label: string; text: string; bg: string; bar: string }> = {
  tercapai: { label: 'Tercapai', text: 'text-stv-green', bg: 'bg-stv-green-tint', bar: 'bg-stv-green' },
  berjalan: { label: 'Berjalan', text: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' },
  'perlu-perhatian': { label: 'Perlu Perhatian', text: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
};

export const IEP_TERM_META: Record<IEPGoalTerm, { label: string; text: string; bg: string }> = {
  'jangka-pendek': { label: 'Jangka Pendek', text: 'text-stv-sky-stroke', bg: 'bg-stv-sky-tint' },
  'jangka-panjang': { label: 'Jangka Panjang', text: 'text-indigo-600', bg: 'bg-indigo-50' },
};
