import React, { createContext, useContext, useState } from 'react';
import type { RekahProfile } from '@studiva/shared';

interface RekahProfileContextValue {
  profile: RekahProfile | null;
  setProfile: (p: RekahProfile) => void;
}

const RekahProfileContext = createContext<RekahProfileContextValue | null>(null);

export function RekahProfileProvider({ children }: { children: React.ReactNode }) {
  // TODO: muat profil dari backend saat login (GET /api/me/rekah-profile)
  const [profile, setProfile] = useState<RekahProfile | null>(null);

  return (
    <RekahProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </RekahProfileContext.Provider>
  );
}

export function useRekahProfile(): RekahProfileContextValue {
  const ctx = useContext(RekahProfileContext);
  if (!ctx) throw new Error('useRekahProfile must be used inside RekahProfileProvider');
  return ctx;
}
