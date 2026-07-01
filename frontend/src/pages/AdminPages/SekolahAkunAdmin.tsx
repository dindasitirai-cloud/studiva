import React, { useState } from 'react';
import {
  Plus, Search, Pencil, X, UserCheck, UserX, Mail, Phone, Baby, CheckCircle, Eye, EyeOff,
} from 'lucide-react';
import { useSekolahStudiva, Tier1ParentAccount, Tier1Child } from '../../context/SekolahStudivaContext';

type AccountStatus = 'aktif' | 'nonaktif';

interface AccountFormState {
  parentName: string;
  email: string;
  password: string;
  phone: string;
  childName: string;
  childAge: string;
  childKelas: string;
  childDiagnosis: string;
  childWaliKelas: string;
}

const EMPTY_FORM: AccountFormState = {
  parentName: '', email: '', password: '', phone: '', childName: '', childAge: '',
  childKelas: '', childDiagnosis: '', childWaliKelas: '',
};

function CredentialsModal({ email, password, name, onClose }: {
  email: string; password: string; name: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-stv-navy/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(16,58,107,.25)]">
        <div className="bg-gradient-to-br from-sky-500 to-indigo-600 px-6 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-baloo text-[22px] font-extrabold">Akun Berhasil Dibuat!</h2>
          <p className="mt-1 text-[14px] text-white/80">Untuk: {name}</p>
        </div>
        <div className="px-6 py-5">
          <p className="mb-4 text-[13px] text-stv-muted">Bagikan kredensial ini kepada orang tua untuk login pertama kali:</p>
          {[{ label: 'Email', value: email, key: 'email' }, { label: 'Password', value: password, key: 'pass' }].map(item => (
            <div key={item.key} className="mb-3">
              <label className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-stv-muted">{item.label}</label>
              <div className="flex items-center gap-2 rounded-xl border border-stv-border bg-slate-50 px-4 py-2.5">
                <span className="flex-1 font-mono text-[14px] text-stv-navy">{item.value}</span>
                <button
                  type="button"
                  onClick={() => copy(item.value, item.key)}
                  className="text-[12px] font-semibold text-sky-600 transition hover:text-sky-700"
                >
                  {copied === item.key ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            </div>
          ))}
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-[12px] text-amber-700">
            Orang tua dapat login di halaman <strong>/login</strong>. Akses Tier 1 akan diaktifkan setelah proses administrasi selesai.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-sky-600 py-2.5 font-bold text-white transition hover:bg-sky-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountFormModal({ initial, onClose, onSave }: {
  initial?: Tier1ParentAccount;
  onClose: () => void;
  onSave: (data: AccountFormState) => void;
}) {
  const [form, setForm] = useState<AccountFormState>(
    initial
      ? { parentName: initial.parentName, email: initial.email, password: '', phone: initial.phone, childName: initial.child.name, childAge: String(initial.child.age), childKelas: initial.child.kelas, childDiagnosis: initial.child.diagnosis, childWaliKelas: initial.child.waliKelas }
      : EMPTY_FORM,
  );
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const f = (key: keyof AccountFormState, val: string) => setForm(p => ({ ...p, [key]: val }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parentName.trim() || !form.email.trim()) { setError('Nama orang tua dan email wajib diisi.'); return; }
    if (!initial && !form.password.trim()) { setError('Password wajib diisi untuk akun baru.'); return; }
    if (!initial && form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (!form.childName.trim()) { setError('Nama anak wajib diisi.'); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-10">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {initial ? 'Edit Akun Orang Tua' : 'Buat Akun Orang Tua'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-stv-muted">Data Orang Tua</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Lengkap *</label>
                <input value={form.parentName} onChange={e => f('parentName', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="Nama orang tua" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Email *</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)} disabled={!!initial} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none disabled:bg-slate-50 disabled:text-stv-muted" placeholder="nama@email.com" />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">No. WhatsApp</label>
                  <input value={form.phone} onChange={e => f('phone', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              {!initial && (
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => f('password', e.target.value)}
                      className="w-full rounded-xl border border-stv-border px-3 py-2.5 pr-10 text-[14px] focus:border-sky-400 focus:outline-none"
                      placeholder="Minimal 6 karakter"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-stv-border pt-4">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-stv-muted">Data Anak</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Anak *</label>
                  <input value={form.childName} onChange={e => f('childName', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="Nama anak" />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Usia</label>
                  <input type="number" min={3} max={18} value={form.childAge} onChange={e => f('childAge', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="Tahun" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Kelas</label>
                  <input value={form.childKelas} onChange={e => f('childKelas', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="contoh: Kelompok Merah" />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Wali Kelas</label>
                  <input value={form.childWaliKelas} onChange={e => f('childWaliKelas', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="contoh: Bu Rini" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Kebutuhan Khusus / Diagnosis</label>
                <input value={form.childDiagnosis} onChange={e => f('childDiagnosis', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-sky-400 focus:outline-none" placeholder="contoh: ASD, ADHD" />
              </div>
            </div>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="mt-1 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
            <button type="submit" className="rounded-full bg-sky-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-sky-700">
              {initial ? 'Simpan' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SekolahAkunAdmin() {
  const { accounts, addAccount, updateAccount, toggleAccountStatus } = useSekolahStudiva();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | 'semua'>('semua');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tier1ParentAccount | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; name: string } | null>(null);
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.parentName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.child.name.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function handleSaveNew(data: AccountFormState) {
    setSaving(true);
    setApiError('');
    const child: Tier1Child = { name: data.childName, age: Number(data.childAge) || 0, kelas: data.childKelas, diagnosis: data.childDiagnosis, waliKelas: data.childWaliKelas };
    const result = await addAccount({ parentName: data.parentName, email: data.email, password: data.password, phone: data.phone, child });
    setSaving(false);
    if (!result.success) {
      setApiError(result.error ?? 'Terjadi kesalahan.');
      return;
    }
    setShowForm(false);
    setCreatedCreds({ email: data.email, password: data.password, name: data.parentName });
  }

  function handleSaveEdit(data: AccountFormState) {
    if (!editing) return;
    const child: Tier1Child = { name: data.childName, age: Number(data.childAge) || 0, kelas: data.childKelas, diagnosis: data.childDiagnosis, waliKelas: data.childWaliKelas };
    updateAccount(editing.id, { parentName: data.parentName, phone: data.phone, child });
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header note */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <p className="text-[14px] text-sky-800">
          <strong>Pendaftaran Offline:</strong> Akun orang tua Sekolah Studiva dibuat oleh admin setelah proses pendaftaran offline selesai. Orang tua tidak bisa mendaftar sendiri.
        </p>
      </div>

      {apiError && (
        <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700">{apiError}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama orang tua, email, atau nama anak..." className="w-full rounded-xl border border-stv-border py-2.5 pl-9 pr-4 text-[14px] focus:border-sky-400 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AccountStatus | 'semua')} className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none">
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <button type="button" onClick={() => { setApiError(''); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-sky-700">
          <Plus className="h-4 w-4" />
          Buat Akun Orang Tua
        </button>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-stv-border bg-white py-16 text-stv-muted">
          <Baby className="h-8 w-8" strokeWidth={1.5} />
          <p className="text-[14px]">Tidak ada akun yang sesuai filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <div key={a.id} className={`rounded-2xl border bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.05)] transition hover:shadow-[0_8px_24px_rgba(16,58,107,.09)] ${a.status === 'nonaktif' ? 'opacity-60 border-slate-200' : 'border-stv-border'}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-baloo text-[16px] font-bold text-stv-navy">{a.parentName}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {a.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" onClick={() => setEditing(a)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-stv-muted transition hover:text-stv-navy" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => toggleAccountStatus(a.id)} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${a.status === 'aktif' ? 'bg-red-50 text-red-400 hover:text-red-600' : 'bg-emerald-50 text-emerald-500 hover:text-emerald-700'}`} title={a.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
                    {a.status === 'aktif' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mb-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] text-stv-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{a.email}</span>
                </div>
                {a.phone && (
                  <div className="flex items-center gap-2 text-[13px] text-stv-muted">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {a.phone}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-sky-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-sky-700">
                  <Baby className="h-3.5 w-3.5" />
                  Data Anak
                </div>
                <p className="font-semibold text-stv-navy">{a.child.name}</p>
                <p className="text-[12px] text-stv-muted">{a.child.age} tahun &middot; {a.child.kelas}</p>
                {a.child.diagnosis && <p className="mt-0.5 text-[12px] text-stv-muted">{a.child.diagnosis}</p>}
                <p className="mt-0.5 text-[12px] text-stv-muted">Wali Kelas: {a.child.waliKelas}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AccountFormModal
          onClose={() => setShowForm(false)}
          onSave={data => { if (!saving) handleSaveNew(data); }}
        />
      )}

      {editing && (
        <AccountFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}

      {createdCreds && (
        <CredentialsModal
          email={createdCreds.email}
          password={createdCreds.password}
          name={createdCreds.name}
          onClose={() => setCreatedCreds(null)}
        />
      )}
    </div>
  );
}
