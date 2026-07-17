import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Child, Consultation, Resource } from '../../types';
import Card from '../../components/Card';
import UpgradeRequestForm from '../../components/UpgradeRequestForm';

const consultationStatusStyles: Record<string, string> = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-success/15 text-success',
  completed: 'bg-navy/10 text-navy',
  canceled: 'bg-bordergray text-textlight',
};

export default function ParentDashboardTier2() {
  const [children, setChildren] = useState<Child[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [childrenRes, resourcesRes] = await Promise.all([api.get('/children'), api.get('/resources')]);
        setChildren(childrenRes.data.children);
        setResources(resourcesRes.data.resources.slice(0, 3));
      } catch {
        // children/resources failing independently isn't fatal for this view
      }

      try {
        const consultationsRes = await api.get('/consultations/my-bookings');
        setConsultations(consultationsRes.data.consultations);
      } catch {
        // no-op
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="px-4 py-16 text-center text-textlight">Memuat dashboard...</div>;
  }

  return (
    <>
      <section className="mt-6">
        <h2 className="text-h3 font-semibold text-navy">Consultation History</h2>
        {consultations.length === 0 ? (
          <div className="mt-4">
            <p className="text-textlight">Belum ada konsultasi. Mulai konsultasi pertama Anda!</p>
            <Link
              to="/consultation"
              className="mt-3 inline-flex min-h-[48px] items-center rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
            >
              Book Consultation
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {consultations.map((c) => (
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
                {c.consultation_date && c.consultation_time && (
                  <p className="text-sm text-textdark">
                    {new Date(c.consultation_date).toLocaleDateString('id-ID')} &middot; {c.consultation_time}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-navy">Recommended Resources</h2>
          <Link to="/resources" className="text-sm font-medium text-gold hover:underline">
            Lihat semua
          </Link>
        </div>
        {resources.length === 0 ? (
          <p className="mt-4 text-textlight">Belum ada resource yang tersedia.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {resources.map((r) => (
              <Card key={r.id}>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                  {r.category}
                </span>
                <h3 className="mt-2 font-semibold text-navy">{r.title}</h3>
                <p className="mt-1 text-sm text-textlight">{r.description.split(' ').slice(0, 20).join(' ')}...</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/resources"
          className="flex min-h-[48px] items-center rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
        >
          Explore Resources
        </Link>
        <Link
          to="/consultation"
          className="flex min-h-[48px] items-center rounded-md border border-bordergray px-6 py-3 font-semibold text-textdark transition hover:bg-white"
        >
          Book Consultation
        </Link>
      </section>

      <section className="mt-10 border-t border-bordergray pt-8">
        <h2 className="text-h3 font-semibold text-navy">Ingin akses penuh ke Sekolah Studiva?</h2>
        <p className="mt-2 text-textdark">
          Daily updates dari guru, kalender sekolah, dan sesi terapi hanya tersedia untuk siswa
          yang terdaftar di Tier 1 (Sekolah Studiva). Daftarkan anak Anda untuk mendapatkan akses
          penuh.
        </p>
        {!upgradeOpen ? (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="mt-4 min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
          >
            Upgrade to Tier 1
          </button>
        ) : (
          <Card className="mt-4 max-w-xl">
            <UpgradeRequestForm childrenList={children} />
          </Card>
        )}
      </section>
    </>
  );
}
