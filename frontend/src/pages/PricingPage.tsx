import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PricingCard from '../components/PricingCard';
import PlanConfirmModal from '../components/PlanConfirmModal';
import { useAuth } from '../context/AuthContext';
import { Plan, Tier } from '../types';

const tier1Features = [
  'Pembelajaran di kelas dengan guru bersertifikat',
  'Terapi profesional (speech, OT, behavioral)',
  'Dashboard orang tua real-time',
  'Komunikasi daily dengan guru',
  'Personalized learning plan',
  'Akses TIER 2 gratis',
];

const tier2Features = [
  'Ribuan panduan parenting berbasis research',
  'Kursus self-paced untuk orang tua',
  'Komunitas forum moderated',
  'Konsultasi 1-on-1 dengan expert',
  'Resource library (printables, templates)',
  'Webinar bulanan dengan Psikolog Fitri Effendy',
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  const [selection, setSelection] = useState<{ tier: Tier; plan: Plan } | null>(null);

  function handleChoosePlan(tier: Tier, plan: Plan) {
    if (!user) {
      navigate('/login', { state: { message: 'Silakan masuk untuk melanjutkan pembayaran.' } });
      return;
    }
    setSelection({ tier, plan });
  }

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <h1 className="text-h1 font-bold">Pilih Paket yang Tepat untuk Anak Anda</h1>
        <p className="mt-4 text-white/85">
          Dua tier yang dirancang untuk mendukung perjalanan pendidikan anak Anda, di sekolah
          maupun di rumah.
        </p>
      </section>

      {message && (
        <div className="mx-auto mt-6 max-w-3xl rounded-md bg-gold/15 px-4 py-3 text-center text-navy">
          {message}
        </div>
      )}

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-2">
          <PricingCard
            tier="tier1"
            icon="🏫"
            title="Tier 1: Sekolah Studiva"
            subtitle="Bukittinggi - Kolaborasi Penuh"
            features={tier1Features}
            onChoosePlan={handleChoosePlan}
          />
          <PricingCard
            tier="tier2"
            icon="💻"
            title="Tier 2: Studiva Digital"
            subtitle="Nasional - Pembelajaran Online"
            features={tier2Features}
            onChoosePlan={handleChoosePlan}
          />
        </div>
        <p className="mx-auto mt-6 max-w-[1200px] text-center text-sm text-textlight">
          Tier 2 juga tersedia gratis dengan akses terbatas (5 resource, tanpa kursus dan
          konsultasi). Hubungi kami via WhatsApp untuk informasi cicilan Tier 1.
        </p>
      </section>

      {selection && (
        <PlanConfirmModal tier={selection.tier} plan={selection.plan} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}
