import React, { useState } from 'react';
import { Building2, Tags, UserCog, Save, Plus, X, Mail } from 'lucide-react';
import { useDashboardTier2 } from '../../context/DashboardTier2Context';
import { useAdmin, AdminRole } from './AdminContext';

const ROLE_OPTIONS: AdminRole[] = ['Super Admin', 'Pengelola Konten', 'Psikolog', 'Staf Operasional'];

function ChipList({ items, onRemove, accent }: { items: string[]; onRemove: (item: string) => void; accent: string }) {
  if (items.length === 0) return <p className="text-[13px] text-stv-muted">Belum ada kategori.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${accent}`}>
          {item}
          <button type="button" onClick={() => onRemove(item)} aria-label={`Hapus ${item}`} className="hover:opacity-70">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export default function SettingsAdmin() {
  const { categories, addCategory, removeCategory, ageGroups, addAgeGroup, removeAgeGroup } = useDashboardTier2();
  const { platformInfo, updatePlatformInfo, adminUsers, addAdminUser, removeAdminUser } = useAdmin();

  const [infoForm, setInfoForm] = useState(platformInfo);
  const [infoSaved, setInfoSaved] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('Staf Operasional');

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    updatePlatformInfo(infoForm);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 3000);
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    addAdminUser({ name: newAdminName.trim(), email: newAdminEmail.trim(), role: newAdminRole });
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminRole('Staf Operasional');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Pengaturan</h2>
        <p className="text-[14px] text-stv-muted">Pengaturan umum platform Studiva.</p>
      </div>

      {/* Info Studiva */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <Building2 className="h-4 w-4 text-slate-600" />
          Info Studiva
        </h3>
        <form onSubmit={handleSaveInfo} className="mt-3 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Platform</label>
            <input value={infoForm.name} onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-slate-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tagline</label>
            <input value={infoForm.tagline} onChange={e => setInfoForm(f => ({ ...f, tagline: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-slate-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Alamat</label>
            <input value={infoForm.address} onChange={e => setInfoForm(f => ({ ...f, address: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-slate-400 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Email Kontak</label>
              <input value={infoForm.email} onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Telepon</label>
              <input value={infoForm.phone} onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-slate-400 focus:outline-none" />
            </div>
          </div>
          {infoSaved && <p className="text-[13px] text-stv-green">Info platform tersimpan.</p>}
          <button type="submit" className="flex w-fit items-center gap-1.5 self-end rounded-full bg-slate-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-slate-700">
            <Save className="h-3.5 w-3.5" />
            Simpan
          </button>
        </form>
      </div>

      {/* Kategori Konten */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <Tags className="h-4 w-4 text-slate-600" />
          Kategori Konten
        </h3>
        <p className="mt-1 text-[13px] text-stv-muted">Mengelola daftar ini langsung memengaruhi pilihan kategori di Resource Library dan Learning Strategies.</p>

        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-stv-navy">Kategori Resource Library</p>
          <ChipList items={categories} onRemove={removeCategory} accent="bg-blue-50 text-blue-700" />
          <form
            onSubmit={e => { e.preventDefault(); if (newCategory.trim()) { addCategory(newCategory.trim()); setNewCategory(''); } }}
            className="mt-3 flex gap-2"
          >
            <input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Tambah kategori baru..."
              className="flex-1 rounded-full border border-stv-border px-4 py-2 text-[13px] focus:border-blue-400 focus:outline-none"
            />
            <button type="submit" className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />Tambah
            </button>
          </form>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[13px] font-semibold text-stv-navy">Kelompok Usia Learning Strategies</p>
          <ChipList items={ageGroups} onRemove={removeAgeGroup} accent="bg-stv-green-tint text-stv-green" />
          <form
            onSubmit={e => { e.preventDefault(); if (newAgeGroup.trim()) { addAgeGroup(newAgeGroup.trim()); setNewAgeGroup(''); } }}
            className="mt-3 flex gap-2"
          >
            <input
              value={newAgeGroup}
              onChange={e => setNewAgeGroup(e.target.value)}
              placeholder="mis. 13-15 tahun"
              className="flex-1 rounded-full border border-stv-border px-4 py-2 text-[13px] focus:border-stv-green focus:outline-none"
            />
            <button type="submit" className="flex items-center gap-1 rounded-full bg-stv-green px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90">
              <Plus className="h-3.5 w-3.5" />Tambah
            </button>
          </form>
        </div>
      </div>

      {/* Manajemen Admin & Role */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <UserCog className="h-4 w-4 text-slate-600" />
          Manajemen Admin & Role
        </h3>
        <p className="mt-1 text-[13px] text-stv-muted">Daftar ini hanya tampilan UI - belum terhubung ke sistem auth/role nyata.</p>

        <div className="mt-4 flex flex-col gap-2">
          {adminUsers.map(u => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-[12px] font-bold text-white">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-stv-navy">{u.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-stv-muted"><Mail className="h-2.5 w-2.5" />{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">{u.role}</span>
                <button type="button" onClick={() => removeAdminUser(u.id)} className="text-red-500 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddAdmin} className="mt-4 flex flex-wrap items-end gap-2 border-t border-stv-border pt-4">
          <input
            value={newAdminName}
            onChange={e => setNewAdminName(e.target.value)}
            placeholder="Nama"
            className="min-w-[140px] flex-1 rounded-xl border border-stv-border px-3.5 py-2 text-[13px] focus:border-slate-400 focus:outline-none"
          />
          <input
            value={newAdminEmail}
            onChange={e => setNewAdminEmail(e.target.value)}
            placeholder="Email"
            className="min-w-[160px] flex-1 rounded-xl border border-stv-border px-3.5 py-2 text-[13px] focus:border-slate-400 focus:outline-none"
          />
          <select
            value={newAdminRole}
            onChange={e => setNewAdminRole(e.target.value as AdminRole)}
            className="rounded-xl border border-stv-border px-3.5 py-2 text-[13px] focus:border-slate-400 focus:outline-none"
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" className="flex items-center gap-1.5 rounded-full bg-slate-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-slate-700">
            <Plus className="h-3.5 w-3.5" />
            Tambah Admin
          </button>
        </form>
      </div>
    </div>
  );
}
