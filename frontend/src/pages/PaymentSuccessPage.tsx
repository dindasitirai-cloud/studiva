import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Subscription } from '../types';
import { TIER_LABELS, formatIDR } from '../lib/pricing';
import Card from '../components/Card';

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load(attempt = 0) {
      try {
        const { data } = await api.get('/subscriptions/my-subscription');
        if (!mounted) return;
        if (data.subscription) {
          setSubscription(data.subscription);
          setLoading(false);
        } else if (attempt < 2) {
          // The Stripe webhook may take a moment to arrive; retry briefly.
          setTimeout(() => load(attempt + 1), 2000);
        } else {
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const dashboardPath = user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/parent';

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-h2 font-bold text-navy">Terima kasih atas pembayaran Anda!</h1>
        <p className="mt-2 text-textlight">Subscription Anda telah berhasil diaktifkan.</p>

        {loading && <p className="mt-6 text-textlight">Memuat detail subscription...</p>}

        {!loading && subscription && (
          <div className="mt-6 text-left">
            <Card>
              <p className="font-semibold text-navy">{TIER_LABELS[subscription.tier]}</p>
              <p className="text-textlight">Paket: {subscription.plan}</p>
              <p className="mt-2 text-textdark">{formatIDR(subscription.amount_paid)}</p>
              <p className="text-sm text-textlight">
                Berlaku hingga {new Date(subscription.end_date).toLocaleDateString('id-ID')}
              </p>
            </Card>
          </div>
        )}

        {!loading && !subscription && (
          <p className="mt-6 text-sm text-textlight">
            Detail subscription mungkin masih diproses. Silakan periksa kembali dalam beberapa
            menit.
          </p>
        )}

        <Link
          to={dashboardPath}
          className="mt-8 inline-block min-h-[48px] rounded-md bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-gold/90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
