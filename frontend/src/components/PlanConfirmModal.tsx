import React from 'react';
import Modal from './Modal';
import PaymentButton from './PaymentButton';
import { Plan, Tier } from '../types';
import { PRICING, TIER_LABELS, formatIDR } from '../lib/pricing';

const planLabels: Record<Plan, string> = {
  monthly: 'Bulanan',
  quarterly: '3 Bulan',
  yearly: 'Tahunan',
};

interface PlanConfirmModalProps {
  tier: Tier;
  plan: Plan;
  onClose: () => void;
}

export default function PlanConfirmModal({ tier, plan, onClose }: PlanConfirmModalProps) {
  return (
    <Modal title="Konfirmasi Pembayaran" onClose={onClose}>
      <p className="text-textdark">
        Anda akan berlangganan <strong>{TIER_LABELS[tier]}</strong> dengan paket{' '}
        <strong>{planLabels[plan]}</strong>.
      </p>
      <p className="mt-2 text-2xl font-bold text-navy">{formatIDR(PRICING[tier][plan].amount)}</p>
      <p className="mt-1 text-sm text-textlight">
        Anda akan diarahkan ke halaman pembayaran Stripe untuk memasukkan detail kartu.
      </p>
      <div className="mt-6 flex gap-3">
        <PaymentButton
          tier={tier}
          plan={plan}
          className="min-h-[48px] flex-1 rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
        >
          Confirm &amp; Pay
        </PaymentButton>
        <button
          onClick={onClose}
          className="min-h-[48px] rounded-md border border-bordergray px-6 py-3 font-semibold text-textdark transition hover:bg-background"
        >
          Batal
        </button>
      </div>
    </Modal>
  );
}
