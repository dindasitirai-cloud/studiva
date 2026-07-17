import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Child, DailyUpdate, Consultation } from '../../types';
import Card from '../../components/Card';

const categoryLabels: Record<string, string> = {
  academics: 'Academics',
  behavior: 'Behavior',
  therapy: 'Therapy',
  social: 'Social',
};

const consultationStatusStyles: Record<string, string> = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-success/15 text-success',
  completed: 'bg-navy/10 text-navy',
  canceled: 'bg-bordergray text-textlight',
};

export default function ParentDashboardTier1() {
  const [child, setChild] = useState<Child | null>(null);
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [insightOpen, setInsightOpen] = useState(false);
  const [insightContent, setInsightContent] = useState('');
  const [insightStatus, setInsightStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get('/children');
        const firstChild = data.children[0] as Child | undefined;
        setChild(firstChild ?? null);
        if (firstChild) {
          const updatesRes = await api.get(`/updates?childId=${firstChild.id}&limit=5`);
          setUpdates(updatesRes.data.updates);
        }
      } catch {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }

      try {
        const consultationsRes = await api.get('/consultations/my-bookings');
        setConsultations(consultationsRes.data.consultations);
      } catch {
        // Subscription may not cover consultations; section just stays empty.
      }
    }
    load();
  }, []);

  async function handleSubmitInsight(e: React.FormEvent) {
    e.preventDefault();
    if (!child || !insightContent.trim()) return;
    try {
      await api.post('/updates/insights', {
        childId: child.id,
        content: insightContent,
        date: new Date().toISOString().slice(0, 10),
      });
      setInsightStatus('Insight berhasil dikirim. Terima kasih!');
      setInsightContent('');
      setTimeout(() => setInsightOpen(false), 1500);
    } catch {
      setInsightStatus('Gagal mengirim insight. Silakan coba lagi.');
    }
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-textlight">Memuat dashboard...</div>;
  }

  if (!child) {
    return (
      <div className="px-4 py-16 text-center">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-textlight">Belum ada profil anak yang terhubung dengan akun Anda.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-bordergray text-textlight">
          Foto
        </div>
        <div>
          <h2 className="text-h3 font-semibold text-navy">{child.name}</h2>
          <p className="text-textlight">{child.age} tahun</p>
          {child.school_class && <p className="text-textlight">Kelas: {child.school_class}</p>}
          <p className="mt-2 text-textdark">{child.learning_style ?? 'Belum ada catatan gaya belajar.'}</p>
        </div>
      </Card>

      {child.assigned_teacher_name && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold uppercase text-textlight">Guru Pendamping</h3>
          <p className="mt-1 text-h3 font-semibold text-navy">{child.assigned_teacher_name}</p>
        </Card>
      )}

      <section className="mt-8">
        <h2 className="text-h3 font-semibold text-navy">Recent Updates from Teacher</h2>
        {updates.length === 0 ? (
          <p className="mt-4 text-textlight">Belum ada update dari guru.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {updates.map((u) => (
              <Card key={u.id}>
                <div className="flex items-center justify-between text-sm text-textlight">
                  <span>{new Date(u.date).toLocaleDateString('id-ID')}</span>
                  <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold">
                    {categoryLabels[u.category] ?? u.category}
                  </span>
                </div>
                {u.photos && <img src={u.photos.split(',')[0]} alt="Update" className="mt-3 max-w-full rounded-md" />}
                <p className="mt-3 text-textdark">{u.content}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-h3 font-semibold text-navy">Upcoming Consultations</h2>
        {consultations.length === 0 ? (
          <div className="mt-4">
            <p className="text-textlight">No consultations booked yet. Book now!</p>
            <Link
              to="/consultation"
              className="mt-3 inline-flex min-h-[48px] items-center rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
            >
              Book Consultation
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {consultations
              .filter((c) => c.status === 'pending' || c.status === 'confirmed')
              .map((c) => (
                <Card key={c.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-navy">{c.child_name}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${consultationStatusStyles[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-textdark">Tipe: {c.consultation_type}</p>
                  {c.consultation_date && c.consultation_time ? (
                    <p className="text-sm text-textdark">
                      {new Date(c.consultation_date).toLocaleDateString('id-ID')} &middot; {c.consultation_time}
                    </p>
                  ) : (
                    <p className="text-sm text-textlight">Waiting for confirmation from Psikolog Fitri Effendy</p>
                  )}
                </Card>
              ))}
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={() => setInsightOpen((v) => !v)}
          className="min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
        >
          Submit Parent Insight
        </button>
        <Link
          to={`/dashboard/child/${child.id}`}
          className="flex min-h-[48px] items-center rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
        >
          View Full Progress
        </Link>
        <Link
          to="/resources"
          className="flex min-h-[48px] items-center rounded-md border border-bordergray px-6 py-3 font-semibold text-textdark transition hover:bg-white"
        >
          Learning Resources
        </Link>
        <Link
          to="/consultation"
          className="flex min-h-[48px] items-center rounded-md border border-bordergray px-6 py-3 font-semibold text-textdark transition hover:bg-white"
        >
          Book Consultation with Psikolog
        </Link>
      </div>

      {insightOpen && (
        <Card className="mt-6 max-w-xl">
          <h3 className="text-h3 font-semibold text-navy">Bagikan Insight Tentang {child.name}</h3>
          <p className="mt-1 text-sm text-textlight">
            Ceritakan bagaimana {child.name} di rumah agar guru dapat menyesuaikan pendekatan belajar.
          </p>
          {insightStatus && <p className="mt-3 text-sm text-success">{insightStatus}</p>}
          <form onSubmit={handleSubmitInsight} className="mt-4 flex flex-col gap-3">
            <textarea
              value={insightContent}
              onChange={(e) => setInsightContent(e.target.value)}
              rows={4}
              required
              placeholder="Tulis insight Anda di sini..."
              className="rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[48px] self-start rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
            >
              Kirim Insight
            </button>
          </form>
        </Card>
      )}
    </>
  );
}
