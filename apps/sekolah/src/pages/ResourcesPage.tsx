import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Resource, ResourceCategory } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';

const categories: ResourceCategory[] = ['Sensory', 'Social', 'Behavior', 'Academic', 'Therapy'];

const formatLabels: Record<string, string> = {
  article: 'Article',
  video: 'Video',
  checklist: 'Checklist',
  template: 'Template',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | null>(null);
  const [selected, setSelected] = useState<Resource | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get('/resources');
        setResources(data.resources);
      } catch {
        setError('Gagal memuat resources. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || r.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [resources, search, activeCategory]);

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <h1 className="text-h1 font-bold">Panduan Tumbuh Kembang</h1>
        <p className="mt-4 text-white/85">
          Panduan, checklist, dan materi berbasis riset untuk mendukung perjalanan belajar anak Anda.
        </p>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <input
            type="text"
            placeholder="Cari berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`min-h-[48px] rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === null ? 'bg-navy text-white' : 'bg-background text-textdark'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[48px] rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat ? 'bg-navy text-white' : 'bg-background text-textdark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && <p className="mt-8 text-textlight">Memuat resources...</p>}
          {error && <p className="mt-8 text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((resource) => (
                <Card
                  key={resource.id}
                  className="flex cursor-pointer flex-col"
                >
                  <button
                    onClick={() => setSelected(resource)}
                    className="flex flex-1 flex-col text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                        {resource.category}
                      </span>
                      <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                        {formatLabels[resource.format] ?? resource.format}
                      </span>
                    </div>
                    <h3 className="mt-3 text-h3 font-semibold text-navy">{resource.title}</h3>
                    <p className="mt-2 flex-1 text-textdark">
                      {resource.description.split(' ').slice(0, 100).join(' ')}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-textlight">
                      <span>{resource.author}</span>
                      <span>{new Date(resource.published_date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </button>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-textlight">Tidak ada resource yang cocok dengan pencarian Anda.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
              {selected.category}
            </span>
            <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
              {formatLabels[selected.format] ?? selected.format}
            </span>
          </div>
          <p className="mt-4 text-sm text-textlight">
            {selected.author} &middot; {new Date(selected.published_date).toLocaleDateString('id-ID')}
          </p>
          <p className="mt-4 whitespace-pre-line text-textdark">{selected.content}</p>
        </Modal>
      )}
    </div>
  );
}
