import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Discussion, DiscussionCategory } from '../types';
import { CATEGORY_STYLES } from '../lib/community';
import DiscussionCard from '../components/DiscussionCard';
import CommunityGuidelines from '../components/CommunityGuidelines';

const CATEGORY_FILTERS: { value: DiscussionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Discussions' },
  { value: 'general', label: 'General' },
  { value: 'tier1', label: 'Tier 1 Specific' },
  { value: 'tier2', label: 'Tier 2 Specific' },
  { value: 'topic', label: 'Topics' },
  { value: 'fitri', label: 'With Psikolog Fitri' },
];

const SORTS: { value: 'newest' | 'popular' | 'trending' | 'replies'; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'replies', label: 'Most Replies' },
];

export default function CommunityHubPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [category, setCategory] = useState<DiscussionCategory | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'popular' | 'trending' | 'replies'>('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/community/discussions', {
        params: { category: category === 'all' ? undefined : category, sort },
      });
      setDiscussions(data.discussions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat diskusi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) {
      load();
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/community/search', { params: { q: search } });
      setDiscussions(data.discussions);
    } catch {
      setError('Gagal mencari diskusi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <h1 className="text-h1 font-bold">Studiva Community</h1>
        <p className="mt-4 text-white/85">Parents Supporting Parents</p>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari diskusi atau tag..."
                className="min-h-[48px] w-full max-w-md rounded-full border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="btn-secondary">
                Search
              </button>
            </form>
            <Link to="/community/new" className="btn-primary">
              + New Discussion
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === c.value ? 'bg-navy text-white' : 'bg-white text-textdark shadow-sm'
                }`}
              >
                {c.value !== 'all' && CATEGORY_STYLES[c.value].icon} {c.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`min-h-[36px] rounded-full px-3 py-1 text-xs font-medium transition ${
                  sort === s.value ? 'bg-skyblue text-white' : 'bg-white text-textlight shadow-sm'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}
          {loading && <p className="mt-6 text-textlight">Memuat diskusi...</p>}

          {!loading && !error && discussions.length === 0 && (
            <p className="mt-6 text-textlight">Belum ada diskusi di kategori ini. Jadilah yang pertama!</p>
          )}

          {!loading && discussions.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discussions.map((d) => (
                <DiscussionCard key={d.id} discussion={d} />
              ))}
            </div>
          )}

          <div className="mt-10">
            <CommunityGuidelines />
          </div>
        </div>
      </section>
    </div>
  );
}
