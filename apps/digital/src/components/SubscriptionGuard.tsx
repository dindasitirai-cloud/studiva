import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLangganan, statusGerbang, StatusGerbang, TEKS_GERBANG } from '../lib/supabase/langganan';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { supabaseUser, peranStaf, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'memeriksa' | StatusGerbang>('memeriksa');

  useEffect(() => {
    if (authLoading) return;

    // Staf (admin + peninjau_klinis) lewati paywall
    if (peranStaf && ['admin', 'peninjau_klinis'].includes(peranStaf)) {
      setStatus('aktif');
      return;
    }

    let mounted = true;

    async function periksa() {
      if (!supabaseUser) return;

      try {
        const langganan = await getLangganan();
        if (!mounted) return;
        setStatus(statusGerbang(langganan, new Date().toISOString()));
      } catch {
        if (mounted) setStatus('belum_berlangganan');
      }
    }

    periksa();
    return () => { mounted = false; };
  }, [supabaseUser, peranStaf, authLoading]);

  useEffect(() => {
    if (status === 'kedaluwarsa' || status === 'belum_berlangganan') {
      navigate('/pricing', {
        replace: true,
        state: { message: TEKS_GERBANG[status] },
      });
    }
  }, [status, navigate]);

  if (status === 'memeriksa') {
    return (
      <div className="flex h-48 items-center justify-center text-pekat/50">
        Memeriksa akses...
      </div>
    );
  }

  if (status !== 'aktif') return null;

  return <>{children}</>;
}
