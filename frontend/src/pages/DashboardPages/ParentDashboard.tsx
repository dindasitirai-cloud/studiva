import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ParentDashboardTier1 from './ParentDashboardTier1';
import ParentDashboardTier2 from './ParentDashboardTier2';
import OnboardingModal from '../../components/OnboardingModal';

export default function ParentDashboard() {
  const { user, tier, logout, refreshTier } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    refreshTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {tier === 'tier1' && <ParentDashboardTier1 />}
        {tier === 'tier2' && <ParentDashboardTier2 />}
      </div>

      {showOnboarding && tier && <OnboardingModal tier={tier} onClose={dismissOnboarding} />}
    </div>
  );
}
