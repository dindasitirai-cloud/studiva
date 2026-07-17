import React, { createContext, useContext, useState, useCallback } from 'react';
import { Plan } from '../../types';
import { PRICING } from '../../lib/pricing';
import { useAuth } from '../../context/AuthContext';

// TODO: this context is in-memory mock state, same approach used for
// DashboardTier1Context/DashboardTier2Context. Real backend models exist for
// users/subscriptions (see ParentDashboardTier1.tsx, AdminEnrollmentRequestsPage
// for the live-wired equivalents) but there's no single "all members" admin
// API yet, so member data here stays mocked until that endpoint exists.
// Payment data is even further from real: it's meant to represent what
// Stripe would report via API/webhook - see PaymentsAdmin.tsx's notes.

export interface PlatformInfo {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
}

const PLATFORM_INFO: PlatformInfo = {
  name: 'Studiva',
  tagline: 'Pusat belajar inklusif untuk anak berkebutuhan khusus di Bukittinggi',
  address: 'Jl. Mandiangin No. 65, Bukittinggi, Sumatera Barat',
  email: 'halo@studiva.id',
  phone: '0812-1147-0407',
};

// UI-only role list, not wired to real auth/permissions yet.
// TODO: integrate with real auth backend so roles actually gate access
// (currently any user with role==='admin' sees the whole AdminShell).
export type AdminRole = 'Super Admin' | 'Pengelola Konten' | 'Psikolog' | 'Staf Operasional';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

const ADMIN_USERS: AdminUser[] = [
  { id: 'admin-1', name: 'Fitri Effendy', email: 'fitri@studiva.id', role: 'Super Admin' },
  { id: 'admin-2', name: 'Rani Oktaviani', email: 'rani@studiva.id', role: 'Pengelola Konten' },
  { id: 'admin-3', name: 'Dimas Aulia', email: 'dimas@studiva.id', role: 'Staf Operasional' },
];

export type MemberTier = 'tier1' | 'tier2';
export type MemberStatus = 'aktif' | 'kadaluarsa' | 'nonaktif';

export interface MemberAdmin {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  plan: Plan;
  status: MemberStatus;
  joinedDate: string;
  childrenNames: string[];
  recentActivity: string[];
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const MEMBERS: MemberAdmin[] = [
  { id: 'mem-1', name: 'Rina Wulandari', email: 'rina.wulandari@gmail.com', tier: 'tier2', plan: 'monthly', status: 'aktif', joinedDate: daysAgoISO(3), childrenNames: ['Kayla Wulandari'], recentActivity: ['Membaca artikel "Mengenal Gaya Belajar Visual"', 'Mendaftar webinar ADHD'] },
  { id: 'mem-2', name: 'Andi Saputra', email: 'andi.saputra@gmail.com', tier: 'tier1', plan: 'yearly', status: 'aktif', joinedDate: daysAgoISO(8), childrenNames: ['Bima Saputra'], recentActivity: ['Mengirim catatan untuk guru', 'Melihat hasil asesmen terbaru'] },
  { id: 'mem-3', name: 'Dewi Kartika', email: 'dewi.kartika@gmail.com', tier: 'tier2', plan: 'quarterly', status: 'aktif', joinedDate: daysAgoISO(15), childrenNames: ['Nadia Kartika', 'Rafa Kartika'], recentActivity: ['Menyimpan strategi "Playdough Buatan Sendiri"'] },
  { id: 'mem-4', name: 'Maya Anggraini', email: 'maya.anggraini@gmail.com', tier: 'tier2', plan: 'monthly', status: 'kadaluarsa', joinedDate: daysAgoISO(95), childrenNames: ['Zahra Anggraini'], recentActivity: ['Langganan berakhir 5 hari lalu'] },
  { id: 'mem-5', name: 'Joko Prasetyo', email: 'joko.prasetyo@gmail.com', tier: 'tier1', plan: 'quarterly', status: 'aktif', joinedDate: daysAgoISO(40), childrenNames: ['Arka Prasetyo'], recentActivity: ['Booking konsultasi baru'] },
  { id: 'mem-6', name: 'Siti Rahma', email: 'siti.rahma@gmail.com', tier: 'tier2', plan: 'yearly', status: 'aktif', joinedDate: daysAgoISO(22), childrenNames: ['Fatih Rahma'], recentActivity: ['Membaca 3 artikel minggu ini'] },
  { id: 'mem-7', name: 'Bambang Hidayat', email: 'bambang.hidayat@gmail.com', tier: 'tier1', plan: 'monthly', status: 'kadaluarsa', joinedDate: daysAgoISO(150), childrenNames: ['Citra Hidayat'], recentActivity: ['Langganan berakhir 20 hari lalu'] },
  { id: 'mem-8', name: 'Putri Lestari', email: 'putri.lestari@gmail.com', tier: 'tier2', plan: 'monthly', status: 'aktif', joinedDate: daysAgoISO(60), childrenNames: ['Aisyah Lestari'], recentActivity: ['Mengikuti video "Sensory Diet"'] },
  { id: 'mem-9', name: 'Hendra Gunawan', email: 'hendra.gunawan@gmail.com', tier: 'tier1', plan: 'yearly', status: 'aktif', joinedDate: daysAgoISO(11), childrenNames: ['Dafa Gunawan'], recentActivity: ['Melihat IEP anak'] },
  { id: 'mem-10', name: 'Lina Marlina', email: 'lina.marlina@gmail.com', tier: 'tier2', plan: 'quarterly', status: 'aktif', joinedDate: daysAgoISO(75), childrenNames: ['Salsa Marlina'], recentActivity: ['Posting diskusi baru di forum'] },
  { id: 'mem-11', name: 'Fajar Nugraha', email: 'fajar.nugraha@gmail.com', tier: 'tier2', plan: 'monthly', status: 'aktif', joinedDate: daysAgoISO(5), childrenNames: ['Raina Nugraha'], recentActivity: ['Baru bergabung'] },
  { id: 'mem-12', name: 'Ayu Permatasari', email: 'ayu.permatasari@gmail.com', tier: 'tier1', plan: 'monthly', status: 'aktif', joinedDate: daysAgoISO(28), childrenNames: ['Kenzo Permatasari'], recentActivity: ['Mengirim catatan untuk guru'] },
];

// Mock monthly new-member counts for the Beranda growth chart - last 6 months.
export const MEMBER_GROWTH = [
  { label: 'Jan', count: 6 },
  { label: 'Feb', count: 9 },
  { label: 'Mar', count: 7 },
  { label: 'Apr', count: 12 },
  { label: 'Mei', count: 10 },
  { label: 'Jun', count: 14 },
];

export type PaymentStatus = 'berhasil' | 'gagal' | 'menunggu';

export interface PaymentTransaction {
  id: string;
  memberId: string;
  memberName: string;
  tier: MemberTier;
  plan: Plan;
  amount: number;
  status: PaymentStatus;
  date: string;
}

// Represents what would come from Stripe's API/webhook in production - see
// PaymentsAdmin.tsx for the read-only-by-design note. Amounts mirror the
// real pricing table (lib/pricing.ts) so they're at least realistic.
const PAYMENTS: PaymentTransaction[] = MEMBERS.flatMap((m, i) => {
  const amount = PRICING[m.tier][m.plan].amount;
  const txns: PaymentTransaction[] = [
    { id: `txn-${i}-1`, memberId: m.id, memberName: m.name, tier: m.tier, plan: m.plan, amount, status: 'berhasil', date: m.joinedDate },
  ];
  if (m.status === 'aktif' && i % 3 === 0) {
    txns.push({ id: `txn-${i}-2`, memberId: m.id, memberName: m.name, tier: m.tier, plan: m.plan, amount, status: 'berhasil', date: daysAgoISO(2) });
  }
  if (i === 1) {
    txns.push({ id: `txn-${i}-3`, memberId: m.id, memberName: m.name, tier: m.tier, plan: m.plan, amount, status: 'gagal', date: daysAgoISO(1) });
  }
  if (i === 4) {
    txns.push({ id: `txn-${i}-4`, memberId: m.id, memberName: m.name, tier: m.tier, plan: m.plan, amount, status: 'menunggu', date: daysAgoISO(0) });
  }
  return txns;
});

export const REVENUE_BY_MONTH = [
  { label: 'Jan', amount: 8_400_000 },
  { label: 'Feb', amount: 11_200_000 },
  { label: 'Mar', amount: 9_600_000 },
  { label: 'Apr', amount: 14_900_000 },
  { label: 'Mei', amount: 13_100_000 },
  { label: 'Jun', amount: 17_350_000 },
];

interface AdminContextValue {
  members: MemberAdmin[];
  totalActiveMembers: number;
  newMembersThisMonth: number;
  deactivateMember: (id: string) => void;
  reactivateMember: (id: string) => void;

  payments: PaymentTransaction[];
  totalRevenueThisMonth: number;
  successfulPaymentsCount: number;

  platformInfo: PlatformInfo;
  updatePlatformInfo: (updates: Partial<PlatformInfo>) => void;

  adminUsers: AdminUser[];
  addAdminUser: (user: Omit<AdminUser, 'id'>) => void;
  removeAdminUser: (id: string) => void;

  // Which AdminRole the CURRENTLY LOGGED IN admin acts as - drives section
  // access (see adminAccess.ts). Real auth has no concept of AdminRole yet
  // (the backend only knows role==='admin', not which kind), so this
  // defaults to matching the logged-in user's email against adminUsers,
  // falling back to Super Admin. The setter exists so this dashboard is
  // actually testable without separate logins per role - TODO: remove the
  // setter once a real backend exposes the admin's true role.
  currentAdminRole: AdminRole;
  setCurrentAdminRole: (role: AdminRole) => void;
}

let adminUserIdCounter = 1;

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberAdmin[]>(MEMBERS);
  const [payments] = useState<PaymentTransaction[]>(PAYMENTS);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(PLATFORM_INFO);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>(
    () => ADMIN_USERS.find(u => u.email === user?.email)?.role ?? 'Super Admin'
  );

  const updatePlatformInfo = useCallback((updates: Partial<PlatformInfo>) =>
    setPlatformInfo(prev => ({ ...prev, ...updates })), []);

  const addAdminUser = useCallback((user: Omit<AdminUser, 'id'>) =>
    setAdminUsers(prev => [...prev, { ...user, id: `admin-new-${adminUserIdCounter++}` }]), []);

  const removeAdminUser = useCallback((id: string) =>
    setAdminUsers(prev => prev.filter(u => u.id !== id)), []);

  const deactivateMember = useCallback((id: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'nonaktif' } : m)), []);

  const reactivateMember = useCallback((id: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'aktif' } : m)), []);

  const totalActiveMembers = members.filter(m => m.status === 'aktif').length;

  const now = new Date();
  const newMembersThisMonth = members.filter(m => {
    const d = new Date(m.joinedDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const totalRevenueThisMonth = payments
    .filter(p => p.status === 'berhasil' && new Date(p.date).getMonth() === now.getMonth() && new Date(p.date).getFullYear() === now.getFullYear())
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulPaymentsCount = payments.filter(p => p.status === 'berhasil').length;

  return (
    <AdminContext.Provider value={{
      members, totalActiveMembers, newMembersThisMonth, deactivateMember, reactivateMember,
      payments, totalRevenueThisMonth, successfulPaymentsCount,
      platformInfo, updatePlatformInfo,
      adminUsers, addAdminUser, removeAdminUser,
      currentAdminRole, setCurrentAdminRole,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
