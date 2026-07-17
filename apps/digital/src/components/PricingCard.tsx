import React from 'react';
import Card from './Card';
import { Plan, Tier } from '../types';
import { PRICING, PLAN_ORDER, formatIDR } from '../lib/pricing';

interface PricingCardProps {
  tier: Tier;
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
  onChoosePlan: (tier: Tier, plan: Plan) => void;
}

const planLabels: Record<Plan, string> = {
  monthly: 'Bulanan',
  quarterly: '3 Bulan',
  yearly: 'Tahunan',
};

export default function PricingCard({ tier, icon, title, subtitle, features, onChoosePlan }: PricingCardProps) {
  if (tier === 'tier1') {
    return (
      <Card className="flex flex-col">
        <div className="text-4xl">{icon}</div>
        <h2 className="mt-2 text-h2 font-bold text-navy">{title}</h2>
        <p className="text-textlight">{subtitle}</p>

        <ul className="mt-4 flex-1 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-textdark">
              <span className="text-success">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl bg-blue-50 p-5 text-center">
          <p className="mb-1 font-semibold text-navy">Pendaftaran Offline</p>
          <p className="mb-4 text-sm text-textlight">
            Setiap anak memiliki kebutuhan unik. Hubungi kami dan tim akan memandu proses pendaftaran langsung bersama Anda.
          </p>
          <a
            href="https://wa.me/6281211470407?text=Halo%20Studiva%2C%20saya%20ingin%20mendaftarkan%20anak%20saya%20ke%20Sekolah%20Studiva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy no-underline transition hover:bg-gold/90"
          >
            Hubungi via WhatsApp
          </a>
          <p className="mt-3 text-xs text-textlight">Jl. Mandiangin No. 65, Bukittinggi, Sumatera Barat</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <div className="text-4xl">{icon}</div>
      <h2 className="mt-2 text-h2 font-bold text-navy">{title}</h2>
      <p className="text-textlight">{subtitle}</p>

      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-textdark">
            <span className="text-success">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1 space-y-3">
        {PLAN_ORDER.map((plan) => {
          const info = PRICING[tier][plan];
          return (
            <div
              key={plan}
              className="flex items-center justify-between rounded-md border border-bordergray p-4"
            >
              <div>
                <p className="font-semibold text-navy">{planLabels[plan]}</p>
                <p className="text-lg font-bold text-textdark">{formatIDR(info.amount)}</p>
                {info.savingsPercent > 0 && (
                  <p className="text-xs font-semibold text-success">Hemat {info.savingsPercent}%</p>
                )}
              </div>
              <button
                onClick={() => onChoosePlan(tier, plan)}
                className="min-h-[48px] rounded-md bg-gold px-4 py-2 font-semibold text-navy transition hover:bg-gold/90"
              >
                Choose Plan
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
