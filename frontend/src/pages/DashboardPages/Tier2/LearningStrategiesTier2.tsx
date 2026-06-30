import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  BookmarkCheck,
  Dumbbell,
  Sparkles,
  HandHeart,
  BookOpen,
  MessageCircle,
  Puzzle,
  LucideIcon,
} from 'lucide-react';
import { STRATEGIES, ACTIVITY_TYPES, AGE_GROUPS, Strategy } from './strategyData';
import { useDashboardTier2, LearningStyle } from '../../../context/DashboardTier2Context';

const TYPE_ICON: Record<Strategy['activityType'], LucideIcon> = {
  Motorik: Dumbbell,
  Sensorik: Sparkles,
  Sosial: HandHeart,
  Akademik: BookOpen,
  Komunikasi: MessageCircle,
};

const THEME_GRADIENT: Record<Strategy['colorTheme'], string> = {
  amber: 'from-amber-300 to-yellow-200',
  sky: 'from-stv-sky-tint to-sky-100',
  coral: 'from-stv-coral-tint to-orange-100',
  green: 'from-stv-green-tint to-emerald-100',
};

const THEME_ICON_COLOR: Record<Strategy['colorTheme'], string> = {
  amber: 'text-amber-600',
  sky: 'text-stv-sky-stroke',
  coral: 'text-stv-coral',
  green: 'text-stv-green',
};

const LEARNING_STYLES: LearningStyle[] = ['Visual', 'Auditori', 'Kinestetik', 'Membaca/Menulis'];

function StrategyCard({ strategy, isSaved, onClick }: { strategy: Strategy; isSaved: boolean; onClick: () => void }) {
  const Icon = TYPE_ICON[strategy.activityType];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(217,119,6,.14)]"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${THEME_GRADIENT[strategy.colorTheme]}`}>
        <Icon className={`h-10 w-10 ${THEME_ICON_COLOR[strategy.colorTheme]}`} strokeWidth={1.5} />
        {isSaved && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-stv-green shadow">
            <BookmarkCheck className="h-3.5 w-3.5" />
            Disimpan
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
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
      </div>
    </button>
  );
}

export default function LearningStrategiesTier2() {
  const navigate = useNavigate();
  const { isStrategySavedByAnyChild } = useDashboardTier2();
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('Semua');
  const [ageGroup, setAgeGroup] = useState('Semua usia');
  const [learningStyle, setLearningStyle] = useState('Semua');
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => {
    return STRATEGIES.filter(s => {
      const matchesType = activityType === 'Semua' || s.activityType === activityType;
      const matchesAge = ageGroup === 'Semua usia' || s.ageGroup === ageGroup || s.ageGroup === 'Semua usia';
      const matchesStyle = learningStyle === 'Semua' || s.learningStyles.includes(learningStyle as LearningStyle);
      const matchesSaved = !savedOnly || isStrategySavedByAnyChild(s.id);
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.summary.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesAge && matchesStyle && matchesSaved && matchesSearch;
    });
  }, [search, activityType, ageGroup, learningStyle, savedOnly, isStrategySavedByAnyChild]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Learning Strategies</h2>
        <p className="text-[14px] text-stv-muted">Kegiatan, sarana edukatif, dan tips praktis untuk diterapkan di rumah.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari strategi atau aktivitas..."
          className="w-full rounded-full border border-amber-200 bg-white py-2.5 pl-11 pr-4 text-[14px] focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Activity type chips */}
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setActivityType(type)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              activityType === type ? 'bg-amber-500 text-white' : 'border border-amber-200 bg-white text-stv-body hover:bg-amber-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Secondary filters: age group + learning style */}
      <div className="flex flex-wrap gap-3">
        <select
          value={ageGroup}
          onChange={e => setAgeGroup(e.target.value)}
          className="rounded-full border border-amber-200 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body focus:border-amber-500 focus:outline-none"
        >
          {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={learningStyle}
          onChange={e => setLearningStyle(e.target.value)}
          className="rounded-full border border-amber-200 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body focus:border-amber-500 focus:outline-none"
        >
          <option value="Semua">Semua Tipe Belajar</option>
          {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setSavedOnly(v => !v)}
          aria-pressed={savedOnly}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
            savedOnly ? 'bg-stv-green text-white' : 'border border-amber-200 bg-white text-stv-body hover:bg-amber-50'
          }`}
        >
          <BookmarkCheck className="h-3.5 w-3.5" />
          Sudah Dilakukan
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <Puzzle className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">
            {savedOnly ? 'Belum ada strategi yang sudah dilakukan' : 'Tidak ada strategi ditemukan'}
          </p>
          <p className="mt-1 text-[13px] text-stv-muted">
            {savedOnly
              ? 'Buka salah satu strategi dan klik "Sudah Dilakukan" untuk menandainya di sini.'
              : 'Coba ubah filter atau kata kunci pencarian.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSaved={isStrategySavedByAnyChild(strategy.id)}
              onClick={() => navigate(`/dashboard/tier2/strategies/${strategy.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
