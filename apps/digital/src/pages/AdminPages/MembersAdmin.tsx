import React, { useMemo, useState } from 'react';
import { Search, Mail, CalendarDays, Baby, Activity, UserX, UserCheck, X, UserCog } from 'lucide-react';
import { useAdmin, MemberAdmin, MemberTier, MemberStatus } from './AdminContext';

const TIER_LABEL: Record<MemberTier, string> = { tier1: 'Sekolah Studiva', tier2: 'Studiva Digital' };
const TIER_STYLE: Record<MemberTier, string> = { tier1: 'bg-stv-sky-tint text-stv-sky-stroke', tier2: 'bg-amber-50 text-amber-700' };
const STATUS_LABEL: Record<MemberStatus, string> = { aktif: 'Aktif', kadaluarsa: 'Kadaluarsa', nonaktif: 'Nonaktif' };
const STATUS_STYLE: Record<MemberStatus, string> = {
  aktif: 'bg-stv-green-tint text-stv-green',
  kadaluarsa: 'bg-amber-100 text-amber-700',
  nonaktif: 'bg-red-100 text-red-600',
};
const PLAN_LABEL: Record<string, string> = { monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' };

function MemberDetailModal({ member, onClose, onDeactivate, onReactivate }: {
  member: MemberAdmin;
  onClose: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Detail Anggota</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-500 font-baloo text-[18px] font-bold text-white">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-baloo text-[16px] font-bold text-stv-navy">{member.name}</p>
            <p className="flex items-center gap-1 text-[13px] text-stv-muted"><Mail className="h-3 w-3" />{member.email}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TIER_STYLE[member.tier]}`}>{TIER_LABEL[member.tier]}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[member.status]}`}>{STATUS_LABEL[member.status]}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">{PLAN_LABEL[member.plan]}</span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-stv-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          Gabung {new Date(member.joinedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-stv-navy"><Baby className="h-3.5 w-3.5 text-pink-500" />Anak Terdaftar</p>
          {member.childrenNames.length === 0 ? (
            <p className="text-[13px] text-stv-muted">Belum ada profil anak terdaftar.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {member.childrenNames.map(name => (
                <span key={name} className="rounded-full bg-pink-50 px-3 py-1 text-[12px] font-semibold text-pink-700">{name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-stv-navy"><Activity className="h-3.5 w-3.5 text-pink-500" />Aktivitas Terbaru</p>
          {member.recentActivity.length === 0 ? (
            <p className="text-[13px] text-stv-muted">Belum ada aktivitas tercatat.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {member.recentActivity.map((a, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-stv-body">{a}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {member.status === 'nonaktif' ? (
            <button type="button" onClick={onReactivate} className="flex items-center gap-1.5 rounded-full bg-stv-green px-5 py-2 text-[14px] font-bold text-white hover:opacity-90">
              <UserCheck className="h-4 w-4" />
              Aktifkan Kembali
            </button>
          ) : (
            <button type="button" onClick={onDeactivate} className="flex items-center gap-1.5 rounded-full border border-red-300 px-5 py-2 text-[14px] font-bold text-red-600 hover:bg-red-50">
              <UserX className="h-4 w-4" />
              Nonaktifkan Anggota
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembersAdmin() {
  const { members, deactivateMember, reactivateMember } = useAdmin();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'semua' | MemberTier>('semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | MemberStatus>('semua');
  const [selected, setSelected] = useState<MemberAdmin | null>(null);

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchesTier = tierFilter === 'semua' || m.tier === tierFilter;
      const matchesStatus = statusFilter === 'semua' || m.status === statusFilter;
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
      return matchesTier && matchesStatus && matchesSearch;
    });
  }, [members, search, tierFilter, statusFilter]);

  function handleDeactivate(member: MemberAdmin) {
    if (window.confirm(`Nonaktifkan akun "${member.name}"? Anggota tidak akan bisa mengakses dashboard sampai diaktifkan kembali.`)) {
      deactivateMember(member.id);
      setSelected(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Anggota & Langganan</h2>
        <p className="text-[14px] text-stv-muted">Kelola anggota Sekolah Studiva dan Studiva Digital.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full rounded-full border border-stv-border bg-white py-2.5 pl-10 pr-4 text-[14px] focus:border-pink-400 focus:outline-none"
          />
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value as 'semua' | MemberTier)} className="rounded-full border border-stv-border bg-white px-4 py-2.5 text-[14px] focus:border-pink-400 focus:outline-none">
          <option value="semua">Semua Tier</option>
          <option value="tier1">Sekolah Studiva</option>
          <option value="tier2">Studiva Digital</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'semua' | MemberStatus)} className="rounded-full border border-stv-border bg-white px-4 py-2.5 text-[14px] focus:border-pink-400 focus:outline-none">
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="kadaluarsa">Kadaluarsa</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-pink-200 py-14 text-center">
          <UserCog className="h-10 w-10 text-pink-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada anggota yang cocok</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.1)] sm:flex-row sm:items-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 font-baloo text-[15px] font-bold text-white">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-baloo text-[14px] font-bold text-stv-navy">{m.name}</p>
                <p className="text-[12px] text-stv-muted">{m.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TIER_STYLE[m.tier]}`}>{TIER_LABEL[m.tier]}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                <span className="text-[12px] text-stv-muted">{new Date(m.joinedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <MemberDetailModal
          member={selected}
          onClose={() => setSelected(null)}
          onDeactivate={() => handleDeactivate(selected)}
          onReactivate={() => { reactivateMember(selected.id); setSelected(null); }}
        />
      )}
    </div>
  );
}
