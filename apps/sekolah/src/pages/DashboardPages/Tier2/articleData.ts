// Stub for apps/sekolah — no digital content here; types kept for DashboardTier2Context compat.
// TODO: remove once sekolah admin components (BerandaAdmin, SettingsAdmin) are decoupled from DashboardTier2Context.
export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  summary: string;
  content: string[];
  colorTheme: 'amber' | 'sky' | 'coral' | 'green';
  status: 'draft' | 'published';
  author: string;
  publishedDate: string;
  readCount: number;
  thumbnailUrl?: string;
}

export const CATEGORIES: string[] = [];
export const ARTICLES: Article[] = [];
