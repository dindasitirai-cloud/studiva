import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Subscription } from '../types';
import SubscriptionCard from '../components/SubscriptionCard';

export default function SubscriptionSettingsPage() {
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
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-h2 font-bold text-navy">Subscription Settings</h1>

        {loading && <p className="mt-6 text-textlight">Memuat...</p>}

        {!loading && message && (
          <p className="mt-6 rounded-md bg-white p-3 text-sm text-textdark shadow-sm">{message}</p>
        )}

        {!loading && !subscription && (
          <p className="mt-6 text-textlight">
            Anda belum memiliki subscription.{' '}
            <Link to="/pricing" className="font-medium text-gold hover:underline">
              Lihat paket kami
            </Link>
            .
          </p>
        )}

        {!loading && subscription && (
          <>
            <div className="mt-6">
              <SubscriptionCard subscription={subscription} />
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/pricing"
                className="flex min-h-[48px] items-center rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
              >
                Upgrade / Downgrade Tier
              </Link>
              {subscription.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="min-h-[48px] rounded-md border border-red-300 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {canceling ? 'Membatalkan...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
