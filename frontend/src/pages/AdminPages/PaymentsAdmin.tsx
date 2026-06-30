import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Clock, Receipt, BarChart3, Info } from 'lucide-react';
import { useAdmin, PaymentStatus, MemberTier, REVENUE_BY_MONTH } from './AdminContext';
import { formatIDR } from '../../lib/pricing';

const STATUS_LABEL: Record<PaymentStatus, string> = { berhasil: 'Berhasil', gagal: 'Gagal', menunggu: 'Menunggu' };
const STATUS_STYLE: Record<PaymentStatus, string> = {
  berhasil: 'bg-stv-green-tint text-stv-green',
  gagal: 'bg-red-100 text-red-600',
  menunggu: 'bg-amber-100 text-amber-700',
};
const STATUS_ICON: Record<PaymentStatus, typeof CheckCircle2> = { berhasil: CheckCircle2, gagal: XCircle, menunggu: Clock };
const TIER_LABEL: Record<MemberTier, string> = { tier1: 'Sekolah Studiva', tier2: 'Studiva Digital' };
const PLAN_LABEL: Record<string, string> = { monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' };

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 24;
    const stepTime = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(Math.round((target * current) / steps));
      if (current >= steps) clearInterval(interval);
    }, stepTime);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

export default function PaymentsAdmin() {
  const { payments, totalRevenueThisMonth, successfulPaymentsCount } = useAdmin();
  const [statusFilter, setStatusFilter] = useState<'semua' | PaymentStatus>('semua');
  const [tierFilter, setTierFilter] = useState<'semua' | MemberTier>('semua');

  const animatedRevenue = useAnimatedCounter(Math.round(totalRevenueThisMonth / 1000));
  const animatedSuccess = useAnimatedCounter(successfulPaymentsCount);
  const successRate = payments.length > 0 ? Math.round((successfulPaymentsCount / payments.length) * 100) : 0;
  const animatedRate = useAnimatedCounter(successRate);

  const filtered = useMemo(() => {
    return [...payments]
      .filter(p => statusFilter === 'semua' || p.status === statusFilter)
      .filter(p => tierFilter === 'semua' || p.tier === tierFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, statusFilter, tierFilter]);

  const maxRevenue = Math.max(...REVENUE_BY_MONTH.map(r => r.amount));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Pembayaran</h2>
        <p className="text-[14px] text-stv-muted">Ringkasan transaksi langganan SPP Sekolah Studiva & Studiva Digital.</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-[13px] text-stv-body">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        Halaman ini hanya menampilkan ringkasan (read-only) dari data Stripe (mock untuk sekarang). Tidak ada data kartu/kredensial pembayaran yang diproses atau disimpan di sini.
        {/* TODO: tarik data transaksi nyata dari Stripe API/webhook di backend. */}
      </p>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50"><Wallet className="h-4 w-4 text-indigo-600" /></div>
          <div className="font-baloo text-[22px] font-extrabold text-stv-navy">Rp{animatedRevenue}rb</div>
          <div className="text-[12px] text-stv-muted">Pendapatan Bulan Ini</div>
        </div>
        <div className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stv-green-tint"><CheckCircle2 className="h-4 w-4 text-stv-green" /></div>
          <div className="font-baloo text-[22px] font-extrabold text-stv-navy">{animatedSuccess}</div>
          <div className="text-[12px] text-stv-muted">Transaksi Berhasil</div>
        </div>
        <div className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50"><Receipt className="h-4 w-4 text-indigo-600" /></div>
          <div className="font-baloo text-[22px] font-extrabold text-stv-navy">{animatedRate}%</div>
          <div className="text-[12px] text-stv-muted">Tingkat Keberhasilan</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          Pendapatan 6 Bulan Terakhir
        </h3>
        <div className="mt-5 flex h-32 items-end gap-2.5">
          {REVENUE_BY_MONTH.map(r => (
            <div key={r.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-300 transition-all duration-700"
                style={{ height: `${(r.amount / maxRevenue) * 100}%` }}
                title={formatIDR(r.amount)}
              />
              <span className="text-[11px] text-stv-muted">{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Riwayat Transaksi</h3>
          <div className="flex flex-wrap gap-2">
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value as 'semua' | MemberTier)} className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-indigo-400 focus:outline-none">
              <option value="semua">Semua Tier</option>
              <option value="tier1">Sekolah Studiva</option>
              <option value="tier2">Studiva Digital</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'semua' | PaymentStatus)} className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-indigo-400 focus:outline-none">
              <option value="semua">Semua Status</option>
              <option value="berhasil">Berhasil</option>
              <option value="gagal">Gagal</option>
              <option value="menunggu">Menunggu</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-indigo-200 py-14 text-center">
            <Receipt className="h-10 w-10 text-indigo-300" strokeWidth={1.5} />
            <p className="mt-3 font-semibold text-stv-navy">Tidak ada transaksi yang cocok</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(p => {
              const StatusIcon = STATUS_ICON[p.status];
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <div>
                    <p className="text-[14px] font-semibold text-stv-navy">{p.memberName}</p>
                    <p className="text-[12px] text-stv-muted">
                      {TIER_LABEL[p.tier]} &middot; {PLAN_LABEL[p.plan]} &middot; {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-baloo text-[15px] font-bold text-stv-navy">{formatIDR(p.amount)}</span>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[p.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
