import React, { createContext, useCallback, useContext, useState } from 'react';
import { useFullscreenNotif } from '../components/FullscreenNotificationProvider';
import { api } from '../api/client';

// Shared in-memory state for Sekolah Studiva (Tier 1) offline operations.
// Hoisted in App.tsx so both admin pages and the Tier 1 parent dashboard read
// from the same copy — billing records created by admin immediately appear in
// the parent's Pembayaran SPP page without a page reload.

// ── Types ───────────────────────────────────────────────────────────────────

export type BillingType   = 'monthly' | 'one-time';
export type BillingStatus = 'menunggu' | 'lunas' | 'terlambat' | 'dibatalkan';
export type AccountStatus = 'aktif' | 'nonaktif';

export interface Tier1Child {
  name: string;
  age: number;
  kelas: string;
  diagnosis: string;
  waliKelas: string;
}

export interface Tier1ParentAccount {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  status: AccountStatus;
  createdAt: string;
  child: Tier1Child;
}

export interface SppBilling {
  id: string;
  parentAccountId: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  type: BillingType;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: BillingStatus;
  month?: string;
  receiptUrl?: string;
}

// ── Seed data ────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function daysAhead(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
}

const SEED_ACCOUNTS: Tier1ParentAccount[] = [
  { id: 'ta-1', parentName: 'Andi Saputra',    email: 'andi.saputra@gmail.com',    phone: '081234567890', status: 'aktif',    createdAt: daysAgo(8),   child: { name: 'Bima Saputra',     age: 8, kelas: 'Kelompok Merah',  diagnosis: 'ASD',                      waliKelas: 'Bu Rini' } },
  { id: 'ta-2', parentName: 'Joko Prasetyo',   email: 'joko.prasetyo@gmail.com',   phone: '082345678901', status: 'aktif',    createdAt: daysAgo(40),  child: { name: 'Arka Prasetyo',    age: 7, kelas: 'Kelompok Biru',   diagnosis: 'ADHD',                     waliKelas: 'Bu Sari' } },
  { id: 'ta-3', parentName: 'Hendra Gunawan',  email: 'hendra.gunawan@gmail.com',  phone: '083456789012', status: 'aktif',    createdAt: daysAgo(11),  child: { name: 'Dafa Gunawan',     age: 9, kelas: 'Kelompok Hijau',  diagnosis: 'Down Syndrome',            waliKelas: 'Bu Leni' } },
  { id: 'ta-4', parentName: 'Ayu Permatasari', email: 'ayu.permatasari@gmail.com', phone: '084567890123', status: 'aktif',    createdAt: daysAgo(28),  child: { name: 'Kenzo Permatasari', age: 6, kelas: 'Kelompok Kuning', diagnosis: 'ASD, Tantangan Sensorik', waliKelas: 'Bu Rini' } },
  { id: 'ta-5', parentName: 'Bambang Hidayat', email: 'bambang.hidayat@gmail.com', phone: '085678901234', status: 'nonaktif', createdAt: daysAgo(150), child: { name: 'Citra Hidayat',    age: 10, kelas: 'Kelompok Merah', diagnosis: 'Tantangan Belajar',        waliKelas: 'Bu Sari' } },
];

const SEED_BILLINGS: SppBilling[] = [
  { id: 'spp-1', parentAccountId: 'ta-1', parentName: 'Andi Saputra',    parentEmail: 'andi.saputra@gmail.com',    childName: 'Bima Saputra',     type: 'monthly',  description: 'SPP Bulan Juli 2026',  amount: 1_500_000, dueDate: daysAhead(9),  status: 'menunggu', month: 'Juli 2026' },
  { id: 'spp-2', parentAccountId: 'ta-2', parentName: 'Joko Prasetyo',   parentEmail: 'joko.prasetyo@gmail.com',   childName: 'Arka Prasetyo',    type: 'monthly',  description: 'SPP Bulan Juli 2026',  amount: 1_500_000, dueDate: daysAhead(9),  status: 'lunas',    month: 'Juli 2026', paidDate: daysAgo(2), receiptUrl: '#' },
  { id: 'spp-3', parentAccountId: 'ta-3', parentName: 'Hendra Gunawan',  parentEmail: 'hendra.gunawan@gmail.com',  childName: 'Dafa Gunawan',     type: 'monthly',  description: 'SPP Bulan Juli 2026',  amount: 1_500_000, dueDate: daysAhead(2),  status: 'terlambat', month: 'Juli 2026' },
  { id: 'spp-4', parentAccountId: 'ta-4', parentName: 'Ayu Permatasari', parentEmail: 'ayu.permatasari@gmail.com', childName: 'Kenzo Permatasari', type: 'monthly', description: 'SPP Bulan Juni 2026', amount: 1_500_000, dueDate: daysAgo(20),   status: 'lunas',    month: 'Juni 2026', paidDate: daysAgo(22), receiptUrl: '#' },
  { id: 'spp-5', parentAccountId: 'ta-5', parentName: 'Bambang Hidayat', parentEmail: 'bambang.hidayat@gmail.com', childName: 'Citra Hidayat',    type: 'one-time', description: 'Biaya Asesmen Awal',   amount: 500_000,   dueDate: daysAgo(10),   status: 'lunas',    paidDate: daysAgo(12), receiptUrl: '#' },
  { id: 'spp-6', parentAccountId: 'ta-1', parentName: 'Andi Saputra',    parentEmail: 'andi.saputra@gmail.com',    childName: 'Bima Saputra',     type: 'one-time', description: 'Seragam Sekolah',      amount: 350_000,   dueDate: daysAhead(14), status: 'menunggu' },
];

// ── Context interface ────────────────────────────────────────────────────────

interface SekolahStudivaContextValue {
  accounts: Tier1ParentAccount[];
  addAccount: (data: NewAccountData) => Promise<{ success: boolean; error?: string }>;
  updateAccount: (id: string, data: Partial<Omit<Tier1ParentAccount, 'id'>>) => void;
  toggleAccountStatus: (id: string) => void;

  billings: SppBilling[];
  addBilling: (data: NewBillingData) => void;
  updateBilling: (id: string, data: Partial<SppBilling>) => void;
  cancelBilling: (id: string) => void;
  markLunas: (id: string) => void;
}

export interface NewAccountData {
  parentName: string;
  email: string;
  password: string;
  phone: string;
  child: Tier1Child;
}

export interface NewBillingData {
  parentAccountId: string;
  type: BillingType;
  description: string;
  amount: number;
  dueDate: string;
  month?: string;
}

let idCtr = 200;

const SekolahStudivaContext = createContext<SekolahStudivaContextValue | null>(null);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function SekolahStudivaProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Tier1ParentAccount[]>(SEED_ACCOUNTS);
  const [billings, setBillings] = useState<SppBilling[]>(SEED_BILLINGS);
  const { showFullscreenNotif } = useFullscreenNotif();

  const addAccount = useCallback(async (data: NewAccountData): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/signup', {
        email: data.email,
        password: data.password,
        name: data.parentName,
        role: 'parent',
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Terjadi kesalahan saat membuat akun.';
      return { success: false, error: msg };
    }
    const newAcc: Tier1ParentAccount = {
      id: `ta-new-${idCtr++}`,
      parentName: data.parentName,
      email: data.email,
      phone: data.phone,
      status: 'aktif',
      createdAt: new Date().toISOString(),
      child: data.child,
    };
    setAccounts(prev => [newAcc, ...prev]);
    return { success: true };
  }, []);

  const updateAccount = useCallback((id: string, data: Partial<Omit<Tier1ParentAccount, 'id'>>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);

  const toggleAccountStatus = useCallback((id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'aktif' ? 'nonaktif' : 'aktif' } : a));
  }, []);

  const addBilling = useCallback((data: NewBillingData) => {
    const account = accounts.find(a => a.id === data.parentAccountId);
    if (!account) return;

    const newBilling: SppBilling = {
      id: `spp-new-${idCtr++}`,
      parentAccountId: data.parentAccountId,
      parentName: account.parentName,
      parentEmail: account.email,
      childName: account.child.name,
      type: data.type,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      status: 'menunggu',
      month: data.month,
    };
    setBillings(prev => [newBilling, ...prev]);

    // Immediate "new bill" fullscreen notification to the parent's dashboard
    showFullscreenNotif({
      kind: 'spp-new',
      title: 'Tagihan SPP Baru',
      message: `${data.description} untuk ${account.child.name} telah diterbitkan. Jatuh tempo: ${formatDate(data.dueDate)}.`,
      amount: data.amount,
      ctaLabel: 'Lihat Tagihan',
      ctaTo: '/dashboard/tier1/pembayaran-spp',
    });

    // H-7 reminder (demo: 10s delay)
    const d7 = daysUntil(data.dueDate);
    if (d7 > 0) {
      setTimeout(() => {
        showFullscreenNotif({
          kind: 'spp-reminder-h7',
          title: 'Pengingat Tagihan — 7 Hari Lagi',
          message: `${data.description} untuk ${account.child.name} jatuh tempo dalam 7 hari (${formatDate(data.dueDate)}).`,
          amount: data.amount,
          ctaLabel: 'Bayar Sekarang',
          ctaTo: '/dashboard/tier1/pembayaran-spp',
        });
      }, 10000);

      // H-1 reminder (demo: 20s delay)
      setTimeout(() => {
        showFullscreenNotif({
          kind: 'spp-reminder-h1',
          title: 'Pengingat Tagihan — Besok Jatuh Tempo!',
          message: `${data.description} untuk ${account.child.name} jatuh tempo BESOK (${formatDate(data.dueDate)}). Segera lakukan pembayaran.`,
          amount: data.amount,
          ctaLabel: 'Bayar Sekarang',
          ctaTo: '/dashboard/tier1/pembayaran-spp',
        });
      }, 20000);
    }
  }, [accounts, showFullscreenNotif]);

  const updateBilling = useCallback((id: string, data: Partial<SppBilling>) => {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  const cancelBilling = useCallback((id: string) => {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, status: 'dibatalkan' } : b));
  }, []);

  const markLunas = useCallback((id: string) => {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, status: 'lunas', paidDate: new Date().toISOString() } : b));
  }, []);

  return (
    <SekolahStudivaContext.Provider value={{
      accounts, addAccount, updateAccount, toggleAccountStatus,
      billings, addBilling, updateBilling, cancelBilling, markLunas,
    }}>
      {children}
    </SekolahStudivaContext.Provider>
  );
}

export function useSekolahStudiva() {
  const ctx = useContext(SekolahStudivaContext);
  if (!ctx) throw new Error('useSekolahStudiva must be used within SekolahStudivaProvider');
  return ctx;
}
