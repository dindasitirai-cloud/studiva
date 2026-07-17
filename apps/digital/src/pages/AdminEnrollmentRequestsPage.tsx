import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { EnrollmentRequest, EnrollmentRequestStatus, PublicUser } from '../types';
import Card from '../components/Card';

const statuses: (EnrollmentRequestStatus | 'all')[] = ['all', 'pending', 'approved', 'rejected'];

export default function AdminEnrollmentRequestsPage() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [teachers, setTeachers] = useState<PublicUser[]>([]);
  const [filter, setFilter] = useState<EnrollmentRequestStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { teacherId: string; schoolClass: string; startDate: string }>>(
    {}
  );
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    api
      .get('/admin/teachers')
      .then(({ data }) => setTeachers(data.teachers))
      .catch(() => setTeachers([]));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/enrollment-requests', {
        params: filter === 'all' ? {} : { status: filter },
      });
      setRequests(data.requests);
    } catch {
      setError('Gagal memuat data enrollment requests.');
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: number, field: 'teacherId' | 'schoolClass' | 'startDate', value: string) {
    setDrafts((prev) => {
      const existing = prev[id] ?? { teacherId: '', schoolClass: '', startDate: '' };
      return { ...prev, [id]: { ...existing, [field]: value } };
    });
  }

  async function handleApprove(id: number) {
    const draft = drafts[id];
    if (!draft?.teacherId || !draft?.schoolClass || !draft?.startDate) {
      setError('Pilih guru, kelas, dan tanggal mulai sebelum menyetujui.');
      return;
    }
    setBusyId(id);
    try {
      await api.post(`/admin/enrollment-requests/${id}/approve`, {
        teacherId: Number(draft.teacherId),
        schoolClass: draft.schoolClass,
        startDate: draft.startDate,
      });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menyetujui enrollment request.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: number) {
    setBusyId(id);
    try {
      await api.post(`/admin/enrollment-requests/${id}/reject`);
      await load();
    } catch {
      setError('Gagal menolak enrollment request.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h2 font-bold text-navy">Tier 1 Enrollment Requests</h1>
        <p className="mt-1 text-textlight">
          Permintaan upgrade dari orang tua Tier 2 yang ingin mendaftarkan anaknya ke Sekolah Studiva.
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

        {!loading && requests.length === 0 && (
          <p className="mt-6 text-textlight">Tidak ada enrollment request untuk filter ini.</p>
        )}

        {!loading && requests.length > 0 && (
          <div className="mt-6 space-y-4">
            {requests.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-navy">
                    {r.child_name} &middot; {r.requester_name}
                  </h3>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                    {r.status}
                  </span>
                </div>
                {r.message && <p className="mt-2 text-sm text-textlight">&ldquo;{r.message}&rdquo;</p>}

                {r.status === 'pending' && (
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-xs text-textlight">Guru</label>
                      <select
                        onChange={(e) => updateDraft(r.id, 'teacherId', e.target.value)}
                        className="block min-h-[48px] rounded-md border border-bordergray px-3 py-2"
                      >
                        <option value="">Pilih guru</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-textlight">Kelas</label>
                      <input
                        type="text"
                        placeholder="e.g. TK A"
                        onChange={(e) => updateDraft(r.id, 'schoolClass', e.target.value)}
                        className="block min-h-[48px] rounded-md border border-bordergray px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-textlight">Tanggal Mulai</label>
                      <input
                        type="date"
                        onChange={(e) => updateDraft(r.id, 'startDate', e.target.value)}
                        className="block min-h-[48px] rounded-md border border-bordergray px-3 py-2"
                      />
                    </div>
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={busyId === r.id}
                      className="min-h-[48px] rounded-md bg-success px-4 py-2 font-semibold text-white transition hover:bg-success/90 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={busyId === r.id}
                      className="min-h-[48px] rounded-md border border-red-300 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
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
