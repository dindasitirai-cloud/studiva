import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '../api/client';
import { PublicUser, UserRole, Tier } from '../types';

interface AuthContextValue {
  user: PublicUser | null;
  tier: Tier | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    childName?: string;
    childAge?: number;
  }) => Promise<PublicUser>;
  logout: () => void;
  refreshTier: () => Promise<Tier | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTier = useCallback(async (): Promise<Tier | null> => {
    try {
      const { data } = await api.get('/subscriptions/check');
      const nextTier = data.hasSubscription ? data.tier : null;
      setTier(nextTier);
      return nextTier;
    } catch {
      setTier(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('studiva_token');
    const storedUser = localStorage.getItem('studiva_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      refreshTier().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshTier]);

  async function login(email: string, password: string): Promise<PublicUser> {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('studiva_token', data.token);
    localStorage.setItem('studiva_user', JSON.stringify(data.user));
    setUser(data.user);
    await refreshTier();
    return data.user;
  }

  async function signup(formData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    childName?: string;
    childAge?: number;
  }): Promise<PublicUser> {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('studiva_token', data.token);
    localStorage.setItem('studiva_user', JSON.stringify(data.user));
    setUser(data.user);
    setTier(null);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('studiva_token');
    localStorage.removeItem('studiva_user');
    setUser(null);
    setTier(null);
  }

  return (
    <AuthContext.Provider value={{ user, tier, loading, login, signup, logout, refreshTier }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
