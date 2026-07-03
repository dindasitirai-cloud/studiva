import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Clock, Dumbbell, Sparkles, HandHeart, BookOpen, MessageCircle,
  Puzzle, Bookmark, Heart, CheckCircle2, LucideIcon,
} from 'lucide-react';
import { ACTIVITY_TYPES, Strategy } from './strategyData';
import { useDashboardTier2, LearningStyle } from '../../../context/DashboardTier2Context';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useActivityChild } from '../useActivityChild';

const TYPE_ICON: Record<Strategy['activityType'], LucideIcon> = {
  Motorik: Dumbbell,
  Sensorik: Sparkles,
  Sosial: HandHeart,
  Akademik: BookOpen,
  Komunikasi: MessageCircle,
};

const THEME_GRADIENT: Record<Strategy['colorTheme'], string> = {
  amber: 'from-amber-300 to-yellow-200',
  sky:   'from-stv-sky-tint to-sky-100',
  coral: 'from-stv-coral-tint to-orange-100',
  green: 'from-stv-green-tint to-emerald-100',
};

const THEME_ICON_COLOR: Record<Strategy['colorTheme'], string> = {
  amber: 'text-amber-600',
  sky:   'text-stv-sky-stroke',
  coral: 'text-stv-coral',
  green: 'text-stv-green',
};

const LEARNING_STYLES: LearningStyle[] = ['Visual', 'Auditori', 'Kinestetik', 'Membaca/Menulis'];

function StrategyCard({
  strategy, isSaved, isBookmarked, isFavorited,
  onOpen, onToggleDone, onToggleBookmark, onToggleFavorite,
}: {
  strategy: Strategy;
  isSaved: boolean;
  isBookmarked: boolean;
  isFavorited: boolean;
  onOpen: () => void;
  onToggleDone: () => void;
  onToggleBookmark: () => void;
  onToggleFavorite: () => void;
}) {
  const Icon = TYPE_ICON[strategy.activityType];
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(217,119,6,.14)]">
      {/* Thumbnail */}
      <button type="button" onClick={onOpen} className="relative focus:outline-none">
        <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${THEME_GRADIENT[strategy.colorTheme]}`}>
          <Icon className={`h-10 w-10 ${THEME_ICON_COLOR[strategy.colorTheme]}`} strokeWidth={1.5} />
        </div>
        {isSaved && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-stv-green shadow">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Selesai
          </span>
        )}
      </button>

      {/* Body */}
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col gap-2 p-4 text-left focus:outline-none">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">{strategy.activityType}</span>
          <span className="rounded-full bg-stv-border px-2.5 py-0.5 text-[11px] font-semibold text-stv-muted">{strategy.ageGroup}</span>
        </div>
        <p className="font-baloo text-[15px] font-bold leading-[1.3] text-stv-navy">{strategy.title}</p>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-stv-muted">{strategy.summary}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-[12px] text-stv-muted">
          <Clock className="h-3.5 w-3.5" />
          {strategy.duration}
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-stv-border px-3 py-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleDone(); }}
          aria-pressed={isSaved}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-[12px] font-semibold transition ${
            isSaved
              ? 'bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
              : 'text-stv-muted hover:bg-slate-50 hover:text-stv-green'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sudah Dilakukan
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

type FilterTab = 'semua' | 'bookmark' | 'favorit' | 'sudah-dilakukan';

export default function LearningStrategiesTier2() {
  const navigate  = useNavigate();
  const basePath  = useDashboardBasePath();
  const {
    strategies, ageGroups, isStrategySavedByAnyChild,
    saveStrategy, unsaveStrategy,
    isStrategyBookmarked, isStrategyFavorited,
    toggleStrategyBookmark, toggleStrategyFavorite,
  } = useDashboardTier2();
  const { singleChild } = useActivityChild();

  const [search, setSearch]               = useState('');
  const [activityType, setActivityType]   = useState('Semua');
  const [ageGroup, setAgeGroup]           = useState('Semua usia');
  const [learningStyle, setLearningStyle] = useState('Semua');
  const [filterTab, setFilterTab]         = useState<FilterTab>('semua');

  function handleToggleDone(strategyId: string) {
    if (!singleChild) { navigate(`${basePath}/strategies/${strategyId}`); return; }
    if (isStrategySavedByAnyChild(strategyId)) unsaveStrategy(singleChild.id, strategyId);
    else                                        saveStrategy(singleChild.id, strategyId);
  }

  const filtered = useMemo(() => strategies.filter(s => {
    if (s.status !== 'published') return false;
    const matchType   = activityType === 'Semua' || s.activityType === activityType;
    const matchAge    = ageGroup === 'Semua usia' || s.ageGroup === ageGroup || s.ageGroup === 'Semua usia';
    const matchStyle  = learningStyle === 'Semua' || s.learningStyles.includes(learningStyle as LearningStyle);
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.summary.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === 'semua'           ? true :
      filterTab === 'bookmark'        ? isStrategyBookmarked(s.id) :
      filterTab === 'favorit'         ? isStrategyFavorited(s.id) :
      filterTab === 'sudah-dilakukan' ? isStrategySavedByAnyChild(s.id) : true;
    return matchType && matchAge && matchStyle && matchSearch && matchTab;
  }), [strategies, search, activityType, ageGroup, learningStyle, filterTab,
       isStrategyBookmarked, isStrategyFavorited, isStrategySavedByAnyChild]);

  const FILTER_TABS: { id: FilterTab; label: string; icon: LucideIcon }[] = [
    { id: 'semua',           label: 'Semua',           icon: Puzzle      },
    { id: 'bookmark',        label: 'Disimpan',         icon: Bookmark    },
    { id: 'favorit',         label: 'Favorit',          icon: Heart       },
    { id: 'sudah-dilakukan', label: 'Sudah Dilakukan',  icon: CheckCircle2 },
  ];

  const cardProps = (strategy: Strategy) => ({
    strategy,
    isSaved:      isStrategySavedByAnyChild(strategy.id),
    isBookmarked: isStrategyBookmarked(strategy.id),
    isFavorited:  isStrategyFavorited(strategy.id),
    onOpen:           () => navigate(`${basePath}/strategies/${strategy.id}`),
    onToggleDone:     () => handleToggleDone(strategy.id),
    onToggleBookmark: () => toggleStrategyBookmark(strategy.id),
    onToggleFavorite: () => toggleStrategyFavorite(strategy.id),
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Learning Strategies</h2>
        <p className="text-[14px] text-stv-muted">Kegiatan, sarana edukatif, dan tips praktis untuk diterapkan di rumah.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari strategi atau aktivitas..."
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

      {/* Activity type chips */}
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TYPES.map(type => (
          <button key={type} type="button" onClick={() => setActivityType(type)}
            className={`rounded-full px-3.5 py-1 text-[12px] font-semibold transition ${
              activityType === type ? 'bg-stv-navy text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-slate-50'
            }`}>
            {type}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-3">
        <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
          className="rounded-full border border-amber-200 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body focus:border-amber-500 focus:outline-none">
          {['Semua usia', ...ageGroups].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={learningStyle} onChange={e => setLearningStyle(e.target.value)}
          className="rounded-full border border-amber-200 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body focus:border-amber-500 focus:outline-none">
          <option value="Semua">Semua Tipe Belajar</option>
          {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <Puzzle className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">
            {filterTab !== 'semua' ? 'Belum ada strategi di tab ini' : 'Tidak ada strategi ditemukan'}
          </p>
          <p className="mt-1 text-[13px] text-stv-muted">
            {filterTab !== 'semua' ? 'Gunakan ikon di kartu strategi untuk menambahkan.' : 'Coba ubah filter atau kata kunci.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(strategy => (
            <StrategyCard key={strategy.id} {...cardProps(strategy)} />
          ))}
        </div>
      )}
    </div>
  );
}
