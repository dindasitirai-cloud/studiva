import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Child, Subscription } from '../../types';
import ParentDashboardTier1 from './ParentDashboardTier1';
import ParentDashboardTier2 from './ParentDashboardTier2';
import OnboardingModal from '../../components/OnboardingModal';
import { ProfileCard } from '../../components/ui/profile-card';

function subscriptionProgressPercent(subscription: Subscription | null): number {
  if (!subscription) return 0;
  const start = new Date(subscription.start_date).getTime();
  const end = new Date(subscription.end_date).getTime();
  const now = Date.now();
  if (!(end > start)) return 0;
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

export default function ParentDashboard() {
  const { user, tier, logout, refreshTier } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [childrenCount, setChildrenCount] = useState(0);
  const [updatesCount, setUpdatesCount] = useState(0);
  const [consultationsCount, setConsultationsCount] = useState(0);
  const [subscriptionProgress, setSubscriptionProgress] = useState(0);

  useEffect(() => {
    refreshTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tier) return;

    async function loadProfileStats() {
      try {
        const { data } = await api.get('/children');
        const children = data.children as Child[];
        setChildrenCount(children.length);

        // Daily updates are a Tier 1 (school) feature only - Tier 2 parents
        // genuinely have none, so the count correctly stays 0 for them.
        if (tier === 'tier1' && children.length > 0) {
          const counts = await Promise.all(
            children.map((child) =>
              api
                .get(`/updates?childId=${child.id}`)
                .then(({ data: updatesData }) => updatesData.updates.length as number)
                .catch(() => 0)
            )
          );
          setUpdatesCount(counts.reduce((sum, count) => sum + count, 0));
        }
      } catch {
        // Stats are decorative - leave them at 0 rather than blocking the dashboard.
      }

      try {
        const { data } = await api.get('/consultations/my-bookings');
        setConsultationsCount(data.consultations.length);
      } catch {
        // Same as above.
      }

      try {
        const { data } = await api.get('/subscriptions/my-subscription');
        setSubscriptionProgress(subscriptionProgressPercent(data.subscription));
      } catch {
        // Same as above.
      }
    }

    loadProfileStats();
  }, [tier]);

  useEffect(() => {
    if (!user || !tier) return;
    const key = `studiva_onboarding_done_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user, tier]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function dismissOnboarding() {
    if (user) localStorage.setItem(`studiva_onboarding_done_${user.id}`, 'true');
    setShowOnboarding(false);
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h2 font-bold text-navy">
            {tier === 'tier1' ? '🏫 ' : tier === 'tier2' ? '💻 ' : ''}Selamat datang, {user?.name}
          </h1>
          <button
            onClick={handleLogout}
            className="min-h-[48px] rounded-md border border-bordergray px-4 py-2 text-textdark transition hover:bg-white"
          >
            Logout
          </button>
        </div>

        {user && tier && (
          <div className="mt-6">
            <ProfileCard
              name={user.name}
              title={tier === 'tier1' ? 'Tier 1 Parent at Studiva' : 'Tier 2 Parent at Studiva'}
              childrenCount={childrenCount}
              updatesCount={updatesCount}
              consultationsCount={consultationsCount}
              subscriptionProgress={subscriptionProgress}
            />
          </div>
        )}

        {tier === 'tier1' && <ParentDashboardTier1 />}
        {tier === 'tier2' && <ParentDashboardTier2 />}
      </div>

      {showOnboarding && tier && <OnboardingModal tier={tier} onClose={dismissOnboarding} />}
    </div>
  );
}
