import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Consultation, ConsultationStatus } from '../types';
import Card from '../components/Card';

const statuses: (ConsultationStatus | 'all')[] = ['all', 'pending', 'confirmed', 'completed', 'canceled'];

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filter, setFilter] = useState<ConsultationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<number, { date: string; time: string }>>({});
  const [outcomeDrafts, setOutcomeDrafts] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/consultations', {
        params: filter === 'all' ? {} : { status: filter },
      });
      setConsultations(data.consultations);
    } catch {
      setError('Gagal memuat data konsultasi.');
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: number, field: 'date' | 'time', value: string) {
    setScheduleDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleConfirm(id: number) {
    const draft = scheduleDrafts[id];
    if (!draft?.date || !draft?.time) {
      setError('Tentukan tanggal dan waktu sebelum mengonfirmasi.');
      return;
    }
    setBusyId(id);
    try {
      await api.post(`/admin/consultations/${id}/confirm`, draft);
      await load();
    } catch {
      setError('Gagal mengonfirmasi konsultasi.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleComplete(id: number) {
    setBusyId(id);
    try {
      await api.post(`/admin/consultations/${id}/complete`, { outcomeNotes: outcomeDrafts[id] });
      await load();
    } catch {
      setError('Gagal menandai konsultasi sebagai selesai.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopyConfirmation(c: Consultation) {
    const message = `Halo, konsultasi Anda untuk ${c.child_name} telah dikonfirmasi pada ${
      c.consultation_date ? new Date(c.consultation_date).toLocaleDateString('id-ID') : ''
    } pukul ${c.consultation_time}. Sampai jumpa! - Psikolog Fitri Effendy, Studiva`;
    await navigator.clipboard.writeText(message);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h2 font-bold text-navy">Consultation Requests</h1>
        <p className="mt-1 text-sm text-textlight">
          Note: we don't collect parents' WhatsApp numbers anywhere in this app (the original
          contact comes from the parent messaging in via the booking flow), so "Send WhatsApp
          Confirmation" copies a ready-made message instead of opening a chat directly.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`min-h-[48px] rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === s ? 'bg-navy text-white' : 'bg-white text-textdark'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}
        {loading && <p className="mt-6 text-textlight">Memuat...</p>}

        {!loading && consultations.length === 0 && (
          <p className="mt-6 text-textlight">Tidak ada konsultasi untuk filter ini.</p>
        )}

        {!loading && consultations.length > 0 && (
          <div className="mt-6 space-y-4">
            {consultations.map((c) => (
              <Card key={c.id}>
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-navy">
                    {c.child_name} &middot; {c.requester_name}
                  </h3>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                    {c.status}
                  </span>
                </div>
                <p className="mt-2 text-textdark">Tipe: {c.consultation_type}</p>
                {c.notes && <p className="text-sm text-textlight">Topik: {c.notes}</p>}
                {c.consultation_date && c.consultation_time && (
                  <p className="mt-1 text-sm text-textdark">
                    Terjadwal: {new Date(c.consultation_date).toLocaleDateString('id-ID')} &middot;{' '}
                    {c.consultation_time}
                  </p>
                )}
                {c.outcome_notes && (
                  <p className="mt-1 text-sm text-textlight">Outcome: {c.outcome_notes}</p>
                )}

                {c.status === 'pending' && (
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-xs text-textlight">Tanggal</label>
                      <input
                        type="date"
                        onChange={(e) => updateDraft(c.id, 'date', e.target.value)}
                        className="block min-h-[48px] rounded-md border border-bordergray px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-textlight">Waktu</label>
                      <input
                        type="time"
                        onChange={(e) => updateDraft(c.id, 'time', e.target.value)}
                        className="block min-h-[48px] rounded-md border border-bordergray px-3 py-2"
                      />
                    </div>
                    <button
                      onClick={() => handleConfirm(c.id)}
                      disabled={busyId === c.id}
                      className="min-h-[48px] rounded-md bg-success px-4 py-2 font-semibold text-white transition hover:bg-success/90 disabled:opacity-60"
                    >
                      Confirm
                    </button>
                  </div>
                )}

                {c.status === 'confirmed' && (
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={() => handleCopyConfirmation(c)}
                      className="min-h-[48px] self-start rounded-md border border-skyblue px-4 py-2 font-semibold text-skyblue transition hover:bg-skyblue/10"
                    >
                      {copiedId === c.id ? '✓ Copied!' : '📋 Copy WhatsApp Confirmation Message'}
                    </button>
                    <div>
                      <label className="text-xs text-textlight">Outcome notes (optional, saved on complete)</label>
                      <textarea
                        rows={2}
                        onChange={(e) => setOutcomeDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-bordergray px-3 py-2"
                      />
                    </div>
                    <button
                      onClick={() => handleComplete(c.id)}
                      disabled={busyId === c.id}
                      className="min-h-[48px] self-start rounded-md bg-navy px-4 py-2 font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
