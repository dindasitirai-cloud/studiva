import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const DEFAULT_MESSAGE = 'Silakan upgrade untuk mengakses fitur ini.';

interface SubscriptionGuardProps {
  children: ReactNode;
  message?: string;
}

export default function SubscriptionGuard({ children, message = DEFAULT_MESSAGE }: SubscriptionGuardProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const { data } = await api.get('/subscriptions/check');
        if (!mounted) return;
        setStatus(data.hasSubscription ? 'allowed' : 'denied');
      } catch {
        if (mounted) setStatus('denied');
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status !== 'denied') return;
    const timer = setTimeout(() => {
      navigate('/pricing', { state: { message } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, navigate, message]);

  if (status === 'checking') {
    return <div className="px-4 py-16 text-center text-textlight">Memeriksa status subscription...</div>;
  }

  if (status === 'denied') {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-h3 font-semibold text-navy">Please upgrade to access this feature</p>
        <p className="mt-2 text-textlight">{message}</p>
        <p className="mt-2 text-sm text-textlight">Anda akan diarahkan ke halaman harga dalam beberapa saat...</p>
        <Link
          to="/pricing"
          className="mt-6 inline-block min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
        >
          Upgrade Sekarang
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
