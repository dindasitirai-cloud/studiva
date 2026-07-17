import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Consultation, CommunityReport, DashboardStats } from '../types';
import { formatIDR } from '../lib/pricing';
import Card from '../components/Card';

export default function AdminFitriDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([]);
  const [pendingReports, setPendingReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, consultRes, reportsRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/consultations', { params: { status: 'confirmed' } }),
          api.get('/admin/community/reports', { params: { status: 'pending' } }),
        ]);
        setStats(statsRes.data);
        setUpcomingConsultations(consultRes.data.consultations);
        setPendingReports(reportsRes.data.reports);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="px-4 py-16 text-center text-textlight">Memuat dashboard...</div>;

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="text-h2 font-bold text-navy">👩‍⚕️ Psikolog Fitri Dashboard</h1>

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.totalUsers}</p>
              <p className="text-sm text-textlight">Total Users</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.activeUsersThisWeek}</p>
              <p className="text-sm text-textlight">Active This Week</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.totalDiscussions}</p>
              <p className="text-sm text-textlight">Total Discussions</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.postsThisWeek}</p>
              <p className="text-sm text-textlight">Posts This Week</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.upcomingConsultations}</p>
              <p className="text-sm text-textlight">Upcoming Consultations</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.pendingReports}</p>
              <p className="text-sm text-textlight">Pending Reports</p>
            </Card>
            <Card className="col-span-2">
              <p className="text-2xl font-bold text-navy">{formatIDR(stats.totalRevenue)}</p>
              <p className="text-sm text-textlight">Total Revenue (completed payments)</p>
            </Card>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/admin/consultations/manage" className="btn-primary">
            Manage Consultations
          </Link>
          <Link to="/admin/community" className="btn-secondary">
            Moderate Community
          </Link>
          <Link to="/admin/enrollment-requests" className="btn-outline">
            Enrollment Requests
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">Upcoming Consultations</h2>
          {upcomingConsultations.length === 0 ? (
            <p className="mt-2 text-textlight">Tidak ada konsultasi yang dijadwalkan.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {upcomingConsultations.map((c) => (
                <Card key={c.id}>
                  <p className="font-semibold text-navy">{c.child_name}</p>
                  <p className="text-sm text-textdark">
                    {c.consultation_type} &middot;{' '}
                    {c.consultation_date && new Date(c.consultation_date).toLocaleDateString('id-ID')}{' '}
                    {c.consultation_time}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">Pending Community Moderation</h2>
          {pendingReports.length === 0 ? (
            <p className="mt-2 text-textlight">Tidak ada report yang menunggu.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pendingReports.map((r) => (
                <Card key={r.id}>
                  <p className="font-semibold text-navy">
                    {r.content_type} #{r.content_id} &middot; {r.reason}
                  </p>
                  {r.details && <p className="mt-1 text-sm text-textlight">&ldquo;{r.details}&rdquo;</p>}
                </Card>
              ))}
            </div>
          )}
          <Link to="/admin/community" className="mt-3 inline-block text-sm font-medium text-gold hover:underline">
            View all reports →
          </Link>
        </section>
      </div>
    </div>
  );
}
