import React, { useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { Plan, Tier } from '../types';

export type PenyediaBayar = 'midtrans' | 'xendit';

interface PaymentButtonProps {
  tier: Tier;
  plan: Plan;
  /** Kosong = penyedia bawaan yang diatur di server. */
  penyedia?: PenyediaBayar;
  className?: string;
  children: React.ReactNode;
}

// Membuat tagihan lewat Edge Function Supabase `buat-pembayaran` (Midtrans/Xendit),
// lalu mengarahkan orang tua ke halaman bayar penyedia.
export default function PaymentButton({ plan, penyedia, className, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke('buat-pembayaran', { body: { plan, penyedia } });
      if (err) {
        let pesan = '';
        if (err instanceof FunctionsHttpError) {
          try { pesan = (await err.context.json())?.error ?? ''; } catch { /* abaikan */ }
        }
        throw new Error(pesan || 'Gagal membuat sesi pembayaran. Silakan coba lagi.');
      }
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error('Gagal membuat sesi pembayaran. Silakan coba lagi.');
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat sesi pembayaran. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-[13px] text-rekah-tua">{error}</p>}
      <button type="button" onClick={handleClick} disabled={loading} className={className}>
        {loading ? 'Memproses...' : children}
      </button>
    </div>
  );
}
