import React from 'react';
import Card from './Card';
import { Subscription } from '../types';
import { TIER_LABELS, formatIDR } from '../lib/pricing';

const planLabels: Record<string, string> = {
  monthly: 'Bulanan',
  quarterly: '3 Bulan',
  yearly: 'Tahunan',
};

const statusStyles: Record<string, string> = {
  active: 'bg-success/15 text-success',
  canceled: 'bg-bordergray text-textlight',
  expired: 'bg-red-50 text-red-600',
};

export default function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-h3 font-semibold text-navy">{TIER_LABELS[subscription.tier]}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[subscription.status]}`}>
          {subscription.status}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <dt className="text-textlight">Plan</dt>
        <dd className="text-textdark">{planLabels[subscription.plan] ?? subscription.plan}</dd>
        <dt className="text-textlight">Next billing date</dt>
        <dd className="text-textdark">{new Date(subscription.end_date).toLocaleDateString('id-ID')}</dd>
        <dt className="text-textlight">Amount paid</dt>
        <dd className="text-textdark">{formatIDR(subscription.amount_paid)}</dd>
      </dl>
    </Card>
  );
}
