import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Consultation } from '../types';
import Card from '../components/Card';

const statusStyles: Record<string, string> = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-success/15 text-success',
  completed: 'bg-navy/10 text-navy',
  canceled: 'bg-bordergray text-textlight',
};

const typeLabels: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
};

export default function MyConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get('/consultations/my-bookings');
      setConsultations(data.consultations);
    } catch {
      setError('Gagal memuat data konsultasi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Batalkan permintaan konsultasi ini?')) return;
    setCanceling(id);
    try {
      await api.delete(`/consultations/${id}`);
      await load();
    } catch {
      setError('Gagal membatalkan konsultasi.');
    } finally {
      setCanceling(null);
    }
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h2 font-bold text-navy">My Consultations</h1>
          <Link
            to="/consultation"
            className="flex min-h-[48px] items-center rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
          >
            Book New Consultation
          </Link>
        </div>

        {loading && <p className="mt-6 text-textlight">Memuat...</p>}
        {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}

        {!loading && consultations.length === 0 && (
          <p className="mt-6 text-textlight">No consultations booked yet. Book now!</p>
        )}

        {!loading && consultations.length > 0 && (
          <div className="mt-6 space-y-4">
            {consultations.map((c) => (
              <Card key={c.id}>
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-navy">{c.child_name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="mt-2 text-textdark">Tipe: {typeLabels[c.consultation_type]}</p>
                {c.consultation_date && c.consultation_time ? (
                  <p className="text-textdark">
                    {new Date(c.consultation_date).toLocaleDateString('id-ID')} &middot; {c.consultation_time}
                  </p>
                ) : c.status === 'pending' ? (
                  <p className="text-sm text-textlight">Waiting for confirmation from Psikolog Fitri Effendy</p>
                ) : null}
                {c.notes && <p className="mt-2 text-sm text-textlight">Topik: {c.notes}</p>}

                {c.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(c.id)}
                    disabled={canceling === c.id}
                    className="mt-4 min-h-[48px] rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {canceling === c.id ? 'Membatalkan...' : 'Cancel'}
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
