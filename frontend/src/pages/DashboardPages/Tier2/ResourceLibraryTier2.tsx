import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  CheckCircle2,
  Brain,
  MessageCircle,
  Activity,
  Sparkles,
  BookOpen,
  Stethoscope,
  Library,
  LucideIcon,
} from 'lucide-react';
import { Article } from './articleData';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useDashboardBasePath } from '../useDashboardBasePath';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  'Gaya Belajar': Brain,
  Komunikasi: MessageCircle,
  Perilaku: Activity,
  Sensorik: Sparkles,
  Akademik: BookOpen,
  Terapi: Stethoscope,
};

const THEME_GRADIENT: Record<Article['colorTheme'], string> = {
  amber: 'from-amber-300 to-yellow-200',
  sky: 'from-stv-sky-tint to-sky-100',
  coral: 'from-stv-coral-tint to-orange-100',
  green: 'from-stv-green-tint to-emerald-100',
};

const THEME_ICON_COLOR: Record<Article['colorTheme'], string> = {
  amber: 'text-amber-600',
  sky: 'text-stv-sky-stroke',
  coral: 'text-stv-coral',
  green: 'text-stv-green',
};

function ArticleCard({ article, isRead, onClick }: { article: Article; isRead: boolean; onClick: () => void }) {
  const Icon = CATEGORY_ICON[article.category] ?? BookOpen;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(217,119,6,.14)]"
    >
      {/* Thumbnail */}
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${THEME_GRADIENT[article.colorTheme]}`}>
        <Icon className={`h-10 w-10 ${THEME_ICON_COLOR[article.colorTheme]}`} strokeWidth={1.5} />
        {isRead && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-stv-green shadow">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sudah Dibaca
          </span>
        )}
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="self-start rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
          {article.category}
        </span>
        <p className="font-baloo text-[15px] font-bold leading-[1.3] text-stv-navy">{article.title}</p>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-stv-muted">{article.summary}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-[12px] text-stv-muted">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime} menit baca
        </div>
      </div>
    </button>
  );
}

export default function ResourceLibraryTier2() {
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { articles, categories, isArticleReadByAnyChild, totalArticlesRead } = useDashboardTier2();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (a.status !== 'published') return false;
      const matchesCategory = category === 'Semua' || a.category === category;
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [articles, search, category]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Resource Library</h2>
          <p className="text-[14px] text-stv-muted">
            {totalArticlesRead > 0
              ? `Anda sudah membaca ${totalArticlesRead} artikel. Terus eksplorasi!`
              : 'Rangkuman materi pendidikan dan pengasuhan anak, siap diterapkan.'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari artikel..."
          className="w-full rounded-full border border-amber-200 bg-white py-2.5 pl-11 pr-4 text-[14px] focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {['Semua', ...categories].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              category === cat
                ? 'bg-amber-500 text-white'
                : 'border border-amber-200 bg-white text-stv-body hover:bg-amber-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <Library className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada artikel ditemukan</p>
          <p className="mt-1 text-[13px] text-stv-muted">Coba ubah kata kunci atau kategori pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={isArticleReadByAnyChild(article.id)}
              onClick={() => navigate(`${basePath}/resources/${article.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
