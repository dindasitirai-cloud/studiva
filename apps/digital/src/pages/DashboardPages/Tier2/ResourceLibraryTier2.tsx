import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Clock, CheckCircle2, Brain, MessageCircle, Activity,
  Sparkles, BookOpen, Stethoscope, Library, Bookmark, Heart, LucideIcon,
} from 'lucide-react';
import { Article } from './articleData';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useActivityChild } from '../useActivityChild';

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
  sky:   'from-stv-sky-tint to-sky-100',
  coral: 'from-stv-coral-tint to-orange-100',
  green: 'from-stv-green-tint to-emerald-100',
};

const THEME_ICON_COLOR: Record<Article['colorTheme'], string> = {
  amber: 'text-amber-600',
  sky:   'text-stv-sky-stroke',
  coral: 'text-stv-coral',
  green: 'text-stv-green',
};

function ArticleCard({
  article, isRead, isBookmarked, isFavorited,
  onOpen, onToggleRead, onToggleBookmark, onToggleFavorite,
}: {
  article: Article;
  isRead: boolean;
  isBookmarked: boolean;
  isFavorited: boolean;
  onOpen: () => void;
  onToggleRead: () => void;
  onToggleBookmark: () => void;
  onToggleFavorite: () => void;
}) {
  const Icon = CATEGORY_ICON[article.category] ?? BookOpen;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(217,119,6,.14)]">
      {/* Thumbnail */}
      <button type="button" onClick={onOpen} className="relative focus:outline-none">
        <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${THEME_GRADIENT[article.colorTheme]}`}>
          <Icon className={`h-10 w-10 ${THEME_ICON_COLOR[article.colorTheme]}`} strokeWidth={1.5} />
        </div>
        {isRead && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-stv-green shadow">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Dibaca
          </span>
        )}
      </button>

      {/* Body */}
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col gap-2 p-4 text-left focus:outline-none">
        <span className="self-start rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
          {article.category}
        </span>
        <p className="font-baloo text-[15px] font-bold leading-[1.3] text-stv-navy">{article.title}</p>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-stv-muted">{article.summary}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-[12px] text-stv-muted">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime} menit baca
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-stv-border px-3 py-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleRead(); }}
          aria-pressed={isRead}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-[12px] font-semibold transition ${
            isRead
              ? 'bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
              : 'text-stv-muted hover:bg-slate-50 hover:text-stv-green'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sudah Dibaca
        </button>
        <div className="h-4 w-px bg-stv-border" />
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
          aria-pressed={isBookmarked}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            isBookmarked ? 'text-amber-500' : 'text-stv-muted hover:text-amber-500'
          }`}
        >
          <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
          aria-pressed={isFavorited}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            isFavorited ? 'text-rose-500' : 'text-stv-muted hover:text-rose-500'
          }`}
        >
          <Heart className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

type FilterTab = 'semua' | 'bookmark' | 'favorit' | 'sudah-dibaca';

export default function ResourceLibraryTier2() {
  const navigate   = useNavigate();
  const basePath   = useDashboardBasePath();
  const {
    articles, categories, isArticleReadByAnyChild, totalArticlesRead,
    markArticleRead, unmarkArticleRead,
    isArticleBookmarked, isArticleFavorited,
    toggleArticleBookmark, toggleArticleFavorite,
  } = useDashboardTier2();
  const { singleChild } = useActivityChild();

  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('Semua');
  const [filterTab, setFilterTab] = useState<FilterTab>('semua');

  function handleToggleRead(articleId: string) {
    if (!singleChild) { navigate(`${basePath}/resources/${articleId}`); return; }
    if (isArticleReadByAnyChild(articleId)) unmarkArticleRead(singleChild.id, articleId);
    else                                     markArticleRead(singleChild.id, articleId);
  }

  const filtered = useMemo(() => articles.filter(a => {
    if (a.status !== 'published') return false;
    const matchCat    = category === 'Semua' || a.category === category;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.summary.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === 'semua'        ? true :
      filterTab === 'bookmark'     ? isArticleBookmarked(a.id) :
      filterTab === 'favorit'      ? isArticleFavorited(a.id) :
      filterTab === 'sudah-dibaca' ? isArticleReadByAnyChild(a.id) : true;
    return matchCat && matchSearch && matchTab;
  }), [articles, search, category, filterTab, isArticleBookmarked, isArticleFavorited, isArticleReadByAnyChild]);

  const FILTER_TABS: { id: FilterTab; label: string; icon: LucideIcon }[] = [
    { id: 'semua',        label: 'Semua',        icon: Library      },
    { id: 'bookmark',     label: 'Disimpan',      icon: Bookmark     },
    { id: 'favorit',      label: 'Favorit',       icon: Heart        },
    { id: 'sudah-dibaca', label: 'Sudah Dibaca',  icon: CheckCircle2 },
  ];

  const cardProps = (article: Article) => ({
    article,
    isRead:       isArticleReadByAnyChild(article.id),
    isBookmarked: isArticleBookmarked(article.id),
    isFavorited:  isArticleFavorited(article.id),
    onOpen:           () => navigate(`${basePath}/resources/${article.id}`),
    onToggleRead:     () => handleToggleRead(article.id),
    onToggleBookmark: () => toggleArticleBookmark(article.id),
    onToggleFavorite: () => toggleArticleFavorite(article.id),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Resource Library</h2>
        <p className="text-[14px] text-stv-muted">
          {totalArticlesRead > 0
            ? `Anda sudah membaca ${totalArticlesRead} artikel. Terus eksplorasi!`
            : 'Rangkuman materi pendidikan dan pengasuhan anak, siap diterapkan.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari artikel..."
          className="w-full rounded-full border border-amber-200 bg-white py-2.5 pl-11 pr-4 text-[14px] focus:border-amber-500 focus:outline-none" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => setFilterTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                filterTab === tab.id ? 'bg-amber-500 text-white shadow-sm' : 'border border-amber-200 bg-white text-stv-body hover:bg-amber-50'
              }`}>
              <TabIcon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {['Semua', ...categories].map(cat => (
          <button key={cat} type="button" onClick={() => setCategory(cat)}
            className={`rounded-full px-3.5 py-1 text-[12px] font-semibold transition ${
              category === cat ? 'bg-stv-navy text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-slate-50'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <Library className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">
            {filterTab !== 'semua' ? 'Belum ada artikel di tab ini' : 'Tidak ada artikel ditemukan'}
          </p>
          <p className="mt-1 text-[13px] text-stv-muted">
            {filterTab !== 'semua' ? 'Gunakan ikon di kartu artikel untuk menambahkan.' : 'Coba ubah kata kunci atau kategori.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(article => (
            <ArticleCard key={article.id} {...cardProps(article)} />
          ))}
        </div>
      )}
    </div>
  );
}
