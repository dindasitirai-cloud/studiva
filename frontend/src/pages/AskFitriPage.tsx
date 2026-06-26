import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Discussion } from '../types';
import DiscussionCard from '../components/DiscussionCard';
import FitriProfileCard from '../components/FitriProfileCard';

export default function AskFitriPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/community/discussions', { params: { category: 'fitri', sort: 'newest' } })
      .then(({ data }) => setDiscussions(data.discussions))
      .catch(() => setError('Gagal memuat pertanyaan.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <h1 className="text-h1 font-bold">👩‍⚕️ Ask Psikolog Fitri</h1>
        <p className="mt-4 text-white/85">
          Tanyakan langsung ke Psikolog Fitri Effendy. Hanya beliau yang menjawab di forum ini.
        </p>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-[1000px]">
          <FitriProfileCard />

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-h3 font-semibold text-navy">Pertanyaan Terbaru</h2>
            <Link to="/community/new" state={{ presetCategory: 'fitri' }} className="btn-primary">
              + Ask a Question
            </Link>
          </div>

          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}
          {loading && <p className="mt-4 text-textlight">Memuat...</p>}
          {!loading && discussions.length === 0 && (
            <p className="mt-4 text-textlight">Belum ada pertanyaan. Jadilah yang pertama bertanya!</p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {discussions.map((d) => (
              <DiscussionCard key={d.id} discussion={d} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
