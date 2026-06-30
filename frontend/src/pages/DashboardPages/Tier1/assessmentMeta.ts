// Shared score -> level mapping so the assessment list (overall badge) and
// detail page (per-area progress bars) read the same scale consistently.
export function scoreLevel(score: number): { label: string; text: string; bar: string; bg: string } {
  if (score >= 75) return { label: 'Baik', text: 'text-stv-green', bar: 'bg-stv-green', bg: 'bg-stv-green-tint' };
  if (score >= 50) return { label: 'Berkembang', text: 'text-orange-600', bar: 'bg-orange-500', bg: 'bg-orange-50' };
  return { label: 'Perlu Perhatian', text: 'text-red-600', bar: 'bg-red-500', bg: 'bg-red-50' };
}

export function averageScore(areas: { score: number }[]): number {
  if (areas.length === 0) return 0;
  return Math.round(areas.reduce((sum, a) => sum + a.score, 0) / areas.length);
}
