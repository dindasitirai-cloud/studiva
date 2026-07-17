import React, { useState } from 'react';
import { api } from '../api/client';
import { Plan, Tier } from '../types';

interface PaymentButtonProps {
  tier: Tier;
  plan: Plan;
  className?: string;
  children: React.ReactNode;
}

export default function PaymentButton({ tier, plan, className, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/payments/create-checkout-session', { tier, plan });
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat sesi pembayaran. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? 'Memproses...' : children}
      </button>
    </div>
  );
}
