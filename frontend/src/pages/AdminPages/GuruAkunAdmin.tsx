import React, { useState } from 'react';
import {
  Plus, Search, Pencil, X, UserCheck, UserX, Mail, Phone, GraduationCap, CheckCircle, Eye, EyeOff,
} from 'lucide-react';
import { api } from '../../api/client';

// Guru (teacher) accounts are created by admin only — no public self-signup.
// This mirrors the offline-registration model used for Tier 1 parents
// (SekolahAkunAdmin.tsx).

type AccountStatus = 'aktif' | 'nonaktif';
const PANGGILAN_OPTIONS = ['Bu', 'Pak'];

interface GuruAccount {
  id: string;
  namaLengkap: string;
  email: string;
  phone: string;
  kelas: string;
  panggilan: string;
  status: AccountStatus;
  createdAt: string;
}

interface GuruFormState {
  panggilan: string;
  namaGuru: string;
  email: string;
  password: string;
  phone: string;
  kelas: string;
}

const EMPTY_FORM: GuruFormState = {
  panggilan: 'Bu', namaGuru: '', email: '', password: '', phone: '', kelas: '',
};

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}

const SEED_ACCOUNTS: GuruAccount[] = [
  { id: 'g-1', namaLengkap: 'Bu Ratna Sari, S.Pd', email: 'ratna@studiva.id',  phone: '081234500001', kelas: 'Kelompok Cendana', panggilan: 'Bu',  status: 'aktif',    createdAt: daysAgo(120) },
  { id: 'g-2', namaLengkap: 'Pak Joko Widodo',       email: 'joko@studiva.id',   phone: '081234500002', kelas: 'Kelompok Merah',  panggilan: 'Pak', status: 'aktif',    createdAt: daysAgo(90)  },
  { id: 'g-3', namaLengkap: 'Bu Leni Marlina',        email: 'leni@studiva.id',   phone: '081234500003', kelas: 'Kelompok Biru',   panggilan: 'Bu',  status: 'aktif',    createdAt: daysAgo(60)  },
  { id: 'g-4', namaLengkap: 'Bu Sari Dewi',           email: 'sari@studiva.id',   phone: '081234500004', kelas: 'Kelompok Hijau',  panggilan: 'Bu',  status: 'nonaktif', createdAt: daysAgo(200) },
];

// ── Credentials modal ────────────────────────────────────────────────────────

function CredentialsModal({ email, password, name, onClose }: {
  email: string; password: string; name: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 2000);
    });
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-stv-navy/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(16,58,107,.25)]">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 px-6 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-baloo text-[22px] font-extrabold">Akun Guru Dibuat!</h2>
          <p className="mt-1 text-[14px] text-white/80">Untuk: {name}</p>
        </div>
        <div className="px-6 py-5">
          <p className="mb-4 text-[13px] text-stv-muted">Bagikan kredensial ini kepada guru untuk login pertama kali:</p>
          {[{ label: 'Email', value: email, key: 'email' }, { label: 'Password', value: password, key: 'pass' }].map(item => (
            <div key={item.key} className="mb-3">
              <label className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-stv-muted">{item.label}</label>
              <div className="flex items-center gap-2 rounded-xl border border-stv-border bg-slate-50 px-4 py-2.5">
                <span className="flex-1 font-mono text-[14px] text-stv-navy">{item.value}</span>
                <button type="button" onClick={() => copy(item.value, item.key)} className="text-[12px] font-semibold text-teal-600 hover:text-teal-700">
                  {copied === item.key ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            </div>
          ))}
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-[12px] text-amber-700">
            Guru dapat login di <strong>/login</strong>. Akses dashboard guru langsung aktif setelah login.
          </p>
          {/* TODO: integrasikan pengiriman email kredensial otomatis ke guru */}
          <button type="button" onClick={onClose} className="w-full rounded-xl bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700">
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form modal ───────────────────────────────────────────────────────────────

function GuruFormModal({ initial, onClose, onSave }: {
  initial?: GuruAccount;
  onClose: () => void;
  onSave: (data: GuruFormState) => Promise<{ success: boolean; error?: string }>;
}) {
  const [form, setForm] = useState<GuruFormState>(
    initial
      ? { panggilan: initial.panggilan, namaGuru: initial.namaLengkap.replace(/^(Bu|Pak)\s/, ''), email: initial.email, password: '', phone: initial.phone, kelas: initial.kelas }
      : EMPTY_FORM,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const f = (key: keyof GuruFormState, val: string) => { setForm(p => ({ ...p, [key]: val })); setError(''); };

  async function handleSubmit() {
    if (!form.namaGuru.trim()) { setError('Nama guru wajib diisi.'); return; }
    if (!form.email.trim()) { setError('Email wajib diisi.'); return; }
    if (!initial && !form.password.trim()) { setError('Password wajib diisi.'); return; }
    if (!initial && form.password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    if (!result.success) { setError(result.error ?? 'Terjadi kesalahan.'); }
  }

  const namaLengkap = `${form.panggilan} ${form.namaGuru}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-10">
      <div className="w-full max-w-[540px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {initial ? 'Edit Akun Guru' : 'Buat Akun Guru'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Panggilan + Nama */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Nama Guru *</label>
            <div className="flex gap-2">
              <select
                value={form.panggilan}
                onChange={e => f('panggilan', e.target.value)}
                className="w-24 shrink-0 rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
              >
                {PANGGILAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                value={form.namaGuru}
                onChange={e => f('namaGuru', e.target.value)}
                placeholder="Nama belakang / lengkap"
                className="flex-1 rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
              />
            </div>
            {namaLengkap.trim() && (
              <p className="mt-1 text-[12px] text-stv-muted">Nama yang tersimpan: <strong>{namaLengkap}</strong></p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => f('email', e.target.value)}
                disabled={!!initial}
                placeholder="nama@studiva.id"
                className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none disabled:bg-slate-50 disabled:text-stv-muted"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">No. HP</label>
              <input
                value={form.phone}
                onChange={e => f('phone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          {!initial && (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => f('password', e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-stv-border px-3 py-2.5 pr-10 text-[14px] focus:border-teal-400 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Penempatan Kelas / Kelompok</label>
            <input
              value={form.kelas}
              onChange={e => f('kelas', e.target.value)}
              placeholder="contoh: Kelompok Cendana, Kelompok Merah"
              className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
            />
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="mt-1 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-full bg-teal-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? 'Memproses...' : initial ? 'Simpan' : 'Buat Akun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama ────────────────────────────────────────────────────────────

let idCtr = 300;

export default function GuruAkunAdmin() {
  const [accounts, setAccounts] = useState<GuruAccount[]>(SEED_ACCOUNTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | 'semua'>('semua');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GuruAccount | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; name: string } | null>(null);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.namaLengkap.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.kelas.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function handleSaveNew(data: GuruFormState): Promise<{ success: boolean; error?: string }> {
    const namaLengkap = `${data.panggilan} ${data.namaGuru}`.trim();
    try {
      // TODO: panggil POST /api/auth/signup dengan role: 'teacher' untuk membuat
      // akun guru di backend. Setelah berhasil, kirim email kredensial ke guru.
      // Role guard di backend memastikan hanya admin yang bisa membuat akun guru.
      await api.post('/auth/signup', {
        email: data.email,
        password: data.password,
        name: namaLengkap,
        role: 'teacher',
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Terjadi kesalahan saat membuat akun.';
      return { success: false, error: msg };
    }
    const newAcc: GuruAccount = {
      id: `g-new-${idCtr++}`,
      namaLengkap,
      email: data.email,
      phone: data.phone,
      kelas: data.kelas,
      panggilan: data.panggilan,
      status: 'aktif',
      createdAt: new Date().toISOString(),
    };
    setAccounts(prev => [newAcc, ...prev]);
    setShowForm(false);
    setCreatedCreds({ email: data.email, password: data.password, name: namaLengkap });
    return { success: true };
  }

  function handleSaveEdit(data: GuruFormState): Promise<{ success: boolean; error?: string }> {
    if (!editing) return Promise.resolve({ success: false });
    const namaLengkap = `${data.panggilan} ${data.namaGuru}`.trim();
    // TODO: panggil PATCH /api/admin/users/:id untuk update data guru di backend
    setAccounts(prev => prev.map(a => a.id === editing.id ? { ...a, namaLengkap, phone: data.phone, kelas: data.kelas, panggilan: data.panggilan } : a));
    setEditing(null);
    return Promise.resolve({ success: true });
  }

  function toggleStatus(id: string) {
    // TODO: panggil PATCH /api/admin/users/:id/status di backend
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'aktif' ? 'nonaktif' : 'aktif' } : a));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Info banner */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-[14px] text-teal-800">
          <strong>Pendaftaran Offline:</strong> Akun guru dibuat oleh admin — tidak tersedia pendaftaran mandiri untuk guru di halaman publik manapun.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau kelas..."
            className="w-full rounded-xl border border-stv-border py-2.5 pl-9 pr-4 text-[14px] focus:border-teal-400 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as AccountStatus | 'semua')}
          className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none"
        >
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Buat Akun Guru
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stv-border bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stv-muted">
            <GraduationCap className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-[14px]">Tidak ada akun guru yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="border-b border-stv-border bg-slate-50">
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Guru</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Kelas</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Dibuat</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Status</th>
                  <th className="px-4 py-3 text-right text-[12px] font-bold uppercase tracking-wide text-stv-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stv-border">
                {filtered.map(a => (
                  <tr key={a.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stv-navy">{a.namaLengkap}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-stv-muted">
                        <Mail className="h-3 w-3" />
                        {a.email}
                      </div>
                      {a.phone && (
                        <div className="flex items-center gap-1.5 text-[12px] text-stv-muted">
                          <Phone className="h-3 w-3" />
                          {a.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stv-body">{a.kelas || '—'}</td>
                    <td className="px-4 py-3 text-[13px] text-stv-muted">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${a.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {a.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => setEditing(a)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-stv-muted transition hover:text-stv-navy">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (a.status === 'aktif' && !window.confirm(`Nonaktifkan akun ${a.namaLengkap}? Guru tidak bisa login sampai diaktifkan kembali.`)) return;
                            toggleStatus(a.id);
                          }}
                          title={a.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${a.status === 'aktif' ? 'bg-red-50 text-red-400 hover:text-red-600' : 'bg-emerald-50 text-emerald-500 hover:text-emerald-700'}`}
                        >
                          {a.status === 'aktif' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <GuruFormModal onClose={() => setShowForm(false)} onSave={handleSaveNew} />
      )}
      {editing && (
        <GuruFormModal initial={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />
      )}
      {createdCreds && (
        <CredentialsModal {...createdCreds} onClose={() => setCreatedCreds(null)} />
      )}
    </div>
  );
}
