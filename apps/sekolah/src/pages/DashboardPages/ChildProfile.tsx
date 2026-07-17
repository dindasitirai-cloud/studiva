import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Child, DailyUpdate, UpdateCategory } from '../../types';
import Card from '../../components/Card';

const categoryLabels: Record<UpdateCategory, string> = {
  academics: 'Academics',
  behavior: 'Behavior',
  therapy: 'Therapy',
  social: 'Social',
};

export default function ChildProfile() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [childRes, updatesRes] = await Promise.all([
          api.get(`/children/${id}`),
          api.get(`/updates?childId=${id}`),
        ]);
        setChild(childRes.data.child);
        setUpdates(
          [...updatesRes.data.updates].sort(
            (a: DailyUpdate, b: DailyUpdate) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
      } catch (err: any) {
        setError(
          err.response?.status === 403
            ? 'Anda tidak memiliki akses ke profil anak ini.'
            : 'Gagal memuat profil anak.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const metrics = useMemo(() => {
    const counts: Record<UpdateCategory, number> = { academics: 0, behavior: 0, therapy: 0, social: 0 };
    updates.forEach((u) => {
      counts[u.category] = (counts[u.category] ?? 0) + 1;
    });
    return counts;
  }, [updates]);

  if (loading) {
    return <div className="px-4 py-16 text-center text-textlight">Memuat profil...</div>;
  }

  if (error || !child) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Profil tidak ditemukan.'}</p>
        <Link to="/" className="mt-4 inline-block text-gold hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1000px]">
        <Card className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-bordergray text-textlight">
            Foto
          </div>
          <div>
            <h1 className="text-h2 font-bold text-navy">{child.name}</h1>
            <p className="text-textlight">{child.age} tahun</p>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="text-h3 font-semibold text-navy">Learning Style Profile</h2>
          <p className="mt-2 text-textdark">
            {child.learning_style ?? 'Belum ada catatan gaya belajar untuk anak ini.'}
          </p>
        </Card>

        <Card className="mt-6">
          <h2 className="text-h3 font-semibold text-navy">Engagement Metrics</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(metrics).map(([cat, count]) => (
              <div key={cat} className="rounded-md bg-background p-4 text-center">
                <p className="text-h3 font-bold text-navy">{count}</p>
                <p className="text-sm text-textlight">{categoryLabels[cat as UpdateCategory]}</p>
              </div>
            ))}
          </div>
        </Card>

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">Timeline of Progress</h2>
          {updates.length === 0 ? (
            <p className="mt-4 text-textlight">Belum ada update yang tercatat.</p>
          ) : (
            <div className="mt-4 space-y-4 border-l-2 border-bordergray pl-6">
              {updates.map((u) => (
                <div key={u.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-gold" />
                  <Card>
                    <div className="flex items-center justify-between text-sm text-textlight">
                      <span>{new Date(u.date).toLocaleDateString('id-ID')}</span>
                      <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold">
                        {categoryLabels[u.category]}
                      </span>
                    </div>
                    {u.photos && (
                      <img src={u.photos.split(',')[0]} alt="Update" className="mt-3 max-w-full rounded-md" />
                    )}
                    <p className="mt-3 text-textdark">{u.content}</p>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">Recent Activities</h2>
          {updates.length === 0 ? (
            <p className="mt-4 text-textlight">Belum ada aktivitas terbaru.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {[...updates]
                .slice(-3)
                .reverse()
                .map((u) => (
                  <li key={u.id} className="rounded-md bg-white p-3 text-textdark shadow-sm">
                    {new Date(u.date).toLocaleDateString('id-ID')} &mdash; {u.content}
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
