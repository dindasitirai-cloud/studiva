// PARKIR: Articles feature removed in Rekah build 1 — types kept for DashboardTier2Context compat.
export interface Article {
  id: string; title: string; category: string; readTime: number;
  summary: string; content: string[]; colorTheme: 'amber' | 'sky' | 'coral' | 'green';
  status: 'draft' | 'published'; author: string; publishedDate: string;
  readCount: number; thumbnailUrl?: string;
}
export const CATEGORIES: string[] = [];
export const ARTICLES: Article[] = [];
