import React, {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { upsertOrangTua, catatConsent, VERSI_KEBIJAKAN_AKTIF } from '../lib/supabase/rekah';
import { getLangganan, statusGerbang } from '../lib/supabase/langganan';
import { api } from '../api/client';
import type { PublicUser, Tier, UserRole } from '../types';

interface AuthContextValue {
  /** Sesi Supabase — null bila belum login. */
  supabaseUser: User | null;
  /** Role dari Supabase app_metadata — 'admin' | 'peninjau_klinis' | 'parent' | null. */
  peranStaf: string | null;
  /** Data pengguna dari Express backend (Stripe, admin, sekolah). */
  user: PublicUser | null;
  tier: Tier | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    childName?: string;
    childAge?: number;
    consentDiberikan: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTier: () => Promise<Tier | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTier = useCallback(async (): Promise<Tier | null> => {
    // Supabase users (Rekah parents): cek tabel langganan Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const langganan = await getLangganan();
        const gate = statusGerbang(langganan, new Date().toISOString());
        const nextTier: Tier | null = gate === 'aktif' ? 'tier2' : null;
        setTier(nextTier);
        return nextTier;
      } catch {
        setTier(null);
        return null;
      }
    }

    // Express users legacy (Tier 1, admin): cek Express backend
    try {
      const { data } = await api.get('/subscriptions/check');
      const nextTier = data.hasSubscription ? (data.tier as Tier) : null;
      setTier(nextTier);
      return nextTier;
    } catch {
      setTier(null);
      return null;
    }
  }, []);

  // Muat data pengguna Express dari API — tidak dari localStorage (tidak ada PII plaintext).
  const loadExpressUser = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user as PublicUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([loadExpressUser(), refreshTier()]).finally(() => setLoading(false));
      } else {
        // Fallback: cek token Express lama (backward compat selama migrasi)
        const token = localStorage.getItem('studiva_token');
        if (token) {
          loadExpressUser().then(() => refreshTier()).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (!session) {
        setUser(null);
        setTier(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadExpressUser, refreshTier]);

  async function login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await Promise.all([loadExpressUser(), refreshTier()]);
  }

  async function signup(params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    childName?: string;
    childAge?: number;
    consentDiberikan: boolean;
  }): Promise<void> {
    if (!params.consentDiberikan) {
      throw new Error('Persetujuan kebijakan privasi wajib diberikan untuk mendaftar.');
    }

    // 1. Daftar ke Supabase Auth (platform auth — tidak menulis auth sendiri)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { name: params.name } },
    });
    if (signUpError) throw new Error(signUpError.message);
    // user.id tersedia dari response signUp — tidak perlu menunggu sesi aktif
    const newUserId = signUpData.user?.id;

    // 2. Buat pengguna di Express (untuk Stripe, admin, sekolah)
    try {
      const { data } = await api.post('/auth/signup', {
        email: params.email,
        password: params.password,
        name: params.name,
        role: params.role,
        childName: params.childName,
        childAge: params.childAge,
      });
      // Simpan token Express untuk panggilan API berikutnya
      if (data.token) localStorage.setItem('studiva_token', data.token);
      setUser(data.user as PublicUser);
    } catch {
      console.warn('[Rekah] Express signup gagal — fitur sekolah/Stripe mungkin terbatas.');
    }

    // 3. Simpan profil orang tua dan consent di Supabase
    // newUserId diteruskan langsung agar tidak perlu sesi aktif (getUser() belum bisa dipanggil)
    if (newUserId) {
      try {
        await upsertOrangTua(params.email, undefined, newUserId);
        await catatConsent(VERSI_KEBIJAKAN_AKTIF, newUserId);
      } catch (e) {
        console.error('[Rekah] Gagal menyimpan profil/consent ke Supabase:', e);
      }
    }
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('studiva_token');
    // studiva_user tidak ada lagi — sudah dihapus dalam migrasi ini
    setUser(null);
    setTier(null);
  }

  const peranStaf = (supabaseUser?.app_metadata?.role as string | undefined) ?? null;

  return (
    <AuthContext.Provider value={{ supabaseUser, peranStaf, user, tier, loading, login, signup, logout, refreshTier }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
