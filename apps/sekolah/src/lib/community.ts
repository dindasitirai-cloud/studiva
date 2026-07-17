import { DiscussionCategory } from '../types';

export const CATEGORY_STYLES: Record<DiscussionCategory, { label: string; icon: string; chip: string }> = {
  general: { label: 'General', icon: '💬', chip: 'bg-navy/10 text-navy' },
  tier1: { label: 'Tier 1', icon: '🏫', chip: 'bg-skyblue/20 text-navy' },
  tier2: { label: 'Tier 2', icon: '💻', chip: 'bg-gold/20 text-navy' },
  topic: { label: 'Topic', icon: '💡', chip: 'bg-softpurple/40 text-navy' },
  fitri: { label: 'With Psikolog Fitri', icon: '🎉', chip: 'bg-softpink/40 text-navy' },
};

export function timeAgo(dateString: string): string {
  const date = new Date(dateString.replace(' ', 'T'));
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari yang lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;
  return `${Math.floor(months / 12)} tahun yang lalu`;
}

export function truncate(text: string, length = 140): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}...`;
}
