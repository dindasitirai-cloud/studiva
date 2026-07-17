import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { CommunityReport, Discussion, ReportStatus } from '../types';
import { timeAgo } from '../lib/community';
import Card from '../components/Card';

const REPORT_STATUSES: (ReportStatus | 'all')[] = ['all', 'pending', 'reviewed', 'resolved', 'dismissed'];

export default function AdminCommunityPage() {
  const [tab, setTab] = useState<'discussions' | 'reports'>('reports');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [reportFilter, setReportFilter] = useState<ReportStatus | 'all'>('pending');
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

  useEffect(() => {
    api
      .get('/community/stats')
      .then(({ data }) => setTotalDiscussions(data.totalDiscussions))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFilter]);

  async function loadDiscussions() {
    try {
      setLoading(true);
      const { data } = await api.get('/community/discussions', { params: { sort: 'newest', limit: 50 } });
      setDiscussions(data.discussions);
    } catch {
      setError('Gagal memuat diskusi.');
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/community/reports', {
        params: reportFilter === 'all' ? {} : { status: reportFilter },
      });
      setReports(data.reports);
    } catch {
      setError('Gagal memuat reports.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePin(id: number) {
    await api.post(`/admin/community/discussions/${id}/pin`);
    await loadDiscussions();
  }

  async function handleDeleteDiscussion(id: number) {
    if (!window.confirm('Hapus diskusi ini?')) return;
    await api.delete(`/admin/community/discussions/${id}`);
    await loadDiscussions();
  }

  async function handleResolveReport(id: number, status: ReportStatus) {
    await api.patch(`/admin/community/reports/${id}`, { status, adminNotes: notesDraft[id] });
    await loadReports();
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h2 font-bold text-navy">Community Admin Dashboard</h1>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-2xl font-bold text-navy">{totalDiscussions}</p>
            <p className="text-sm text-textlight">Total Discussions</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-navy">{reports.filter((r) => r.status === 'pending').length}</p>
            <p className="text-sm text-textlight">Pending Reports</p>
          </Card>
          <Card>
            <Link to="/community" className="text-sm font-medium text-gold hover:underline">
              View Community →
            </Link>
          </Card>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab('reports')}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'reports' ? 'bg-navy text-white' : 'bg-white text-textdark shadow-sm'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setTab('discussions')}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'discussions' ? 'bg-navy text-white' : 'bg-white text-textdark shadow-sm'
            }`}
          >
            Manage Discussions
          </button>
        </div>

        {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}

        {tab === 'reports' && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {REPORT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setReportFilter(s)}
                  className={`min-h-[40px] rounded-full px-3 py-1 text-sm font-medium ${
                    reportFilter === s ? 'bg-skyblue text-white' : 'bg-white text-textdark shadow-sm'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading && <p className="mt-4 text-textlight">Memuat...</p>}
            {!loading && reports.length === 0 && <p className="mt-4 text-textlight">Tidak ada report.</p>}

            <div className="mt-4 space-y-4">
              {reports.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-navy">
                      {r.content_type} #{r.content_id} &middot; {r.reason}
                    </p>
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                      {r.status}
                    </span>
                  </div>
                  {r.details && <p className="mt-1 text-sm text-textlight">&ldquo;{r.details}&rdquo;</p>}
                  <p className="mt-1 text-xs text-textlight">Reported {timeAgo(r.created_at)}</p>

                  {r.status === 'pending' && (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        placeholder="Admin notes (optional)"
                        onChange={(e) => setNotesDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                        className="rounded-md border border-bordergray px-3 py-2 text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResolveReport(r.id, 'resolved')}
                          className="min-h-[40px] rounded-md bg-success px-3 py-1 text-sm font-semibold text-white hover:bg-success/90"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, 'dismissed')}
                          className="min-h-[40px] rounded-md border border-bordergray px-3 py-1 text-sm font-semibold text-textdark hover:bg-background"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                  {r.admin_notes && <p className="mt-2 text-sm text-textlight">Note: {r.admin_notes}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'discussions' && (
          <div className="mt-6 space-y-4">
            {loading && <p className="text-textlight">Memuat...</p>}
            {discussions.map((d) => (
              <Card key={d.id}>
                <div className="flex items-center justify-between">
                  <Link to={`/community/discussions/${d.id}`} className="font-semibold text-navy hover:underline">
                    {d.title}
                  </Link>
                  {d.is_pinned === 1 && <span className="text-xs text-gold">📌 Pinned</span>}
                </div>
                <p className="mt-1 text-xs text-textlight">
                  {d.display_name} &middot; {timeAgo(d.created_at)} &middot; {d.replies_count} replies
                </p>
                <div className="mt-2 flex gap-3">
                  <button onClick={() => handlePin(d.id)} className="text-sm font-medium text-gold hover:underline">
                    {d.is_pinned === 1 ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleDeleteDiscussion(d.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
