import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CalendarDays, Wallet, ArrowUpCircle, XCircle } from 'lucide-react';
import { api } from '../../../api/client';
import { Subscription, SubscriptionStatus } from '../../../types';
import { TIER_LABELS, formatIDR } from '../../../lib/pricing';

const PLAN_LABEL: Record<Subscription['plan'], string> = {
  monthly: 'Bulanan',
  quarterly: '3 Bulan',
  yearly: 'Tahunan',
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Aktif',
  canceled: 'Dibatalkan',
  expired: 'Berakhir',
};

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  active: 'bg-stv-green-tint text-stv-green',
  canceled: 'bg-stv-badge-navy-tint text-stv-navy',
  expired: 'bg-red-100 text-red-600',
};

export default function SubscriptionTier2() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get('/subscriptions/my-subscription');
      setSubscription(data.subscription);
    } catch {
      setMessage('Gagal memuat data subscription.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan subscription ini?')) return;
    setCanceling(true);
    setMessage(null);
    try {
      await api.post('/subscriptions/cancel');
      setMessage('Subscription berhasil dibatalkan.');
      await load();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Gagal membatalkan subscription.');
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Subscription</h2>
        <p className="text-[14px] text-stv-muted">Kelola paket dan status pembayaran Studiva Digital Anda.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-stv-muted">Memuat...</div>
      ) : (
        <>
          {message && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-body">{message}</p>
          )}

          {!subscription ? (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
              <CreditCard className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
              <p className="mt-3 font-semibold text-stv-navy">Anda belum memiliki subscription</p>
              <Link
                to="/pricing"
                className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
              >
                Lihat Paket Kami
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-baloo text-[17px] font-bold text-stv-navy">{TIER_LABELS[subscription.tier]}</p>
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[subscription.status]}`}>
                    {STATUS_LABEL[subscription.status]}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-amber-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[12px] text-stv-muted"><CreditCard className="h-3.5 w-3.5" />Plan</p>
                    <p className="mt-1 text-[14px] font-bold text-stv-navy">{PLAN_LABEL[subscription.plan]}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[12px] text-stv-muted"><CalendarDays className="h-3.5 w-3.5" />Tanggal Perpanjangan</p>
                    <p className="mt-1 text-[14px] font-bold text-stv-navy">{new Date(subscription.end_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[12px] text-stv-muted"><Wallet className="h-3.5 w-3.5" />Jumlah Dibayar</p>
                    <p className="mt-1 text-[14px] font-bold text-stv-navy">{formatIDR(subscription.amount_paid)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Upgrade / Downgrade Tier
                </Link>
                {subscription.status === 'active' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={canceling}
                    className="flex items-center gap-1.5 rounded-full border border-red-300 px-5 py-2.5 text-[14px] font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    {canceling ? 'Membatalkan...' : 'Batalkan Subscription'}
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
