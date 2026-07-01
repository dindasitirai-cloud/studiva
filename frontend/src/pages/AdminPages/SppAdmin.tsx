import React, { useState } from 'react';
import {
  Plus, Search, Send, Pencil, X, CheckCircle, Clock, AlertCircle, Trash2, Receipt,
} from 'lucide-react';

type BillingType = 'monthly' | 'one-time';
type BillingStatus = 'menunggu' | 'lunas' | 'terlambat' | 'dibatalkan';

interface SppBilling {
  id: string;
  parentName: string;
  childName: string;
  type: BillingType;
  description: string;
  amount: number;
  dueDate: string;
  status: BillingStatus;
  month?: string;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const SEED_BILLINGS: SppBilling[] = [
  { id: 'spp-1', parentName: 'Andi Saputra', childName: 'Bima Saputra', type: 'monthly', description: 'SPP Bulan Juli 2026', amount: 1_500_000, dueDate: '2026-07-10', status: 'menunggu', month: 'Juli 2026' },
  { id: 'spp-2', parentName: 'Joko Prasetyo', childName: 'Arka Prasetyo', type: 'monthly', description: 'SPP Bulan Juli 2026', amount: 1_500_000, dueDate: '2026-07-10', status: 'lunas', month: 'Juli 2026' },
  { id: 'spp-3', parentName: 'Hendra Gunawan', childName: 'Dafa Gunawan', type: 'monthly', description: 'SPP Bulan Juli 2026', amount: 1_500_000, dueDate: '2026-07-10', status: 'terlambat', month: 'Juli 2026' },
  { id: 'spp-4', parentName: 'Ayu Permatasari', childName: 'Kenzo Permatasari', type: 'monthly', description: 'SPP Bulan Juni 2026', amount: 1_500_000, dueDate: '2026-06-10', status: 'lunas', month: 'Juni 2026' },
  { id: 'spp-5', parentName: 'Bambang Hidayat', childName: 'Citra Hidayat', type: 'one-time', description: 'Biaya Asesmen Awal', amount: 500_000, dueDate: '2026-06-20', status: 'lunas' },
  { id: 'spp-6', parentName: 'Andi Saputra', childName: 'Bima Saputra', type: 'one-time', description: 'Seragam Sekolah (2 set)', amount: 350_000, dueDate: '2026-07-15', status: 'menunggu' },
];

const STATUS_STYLE: Record<BillingStatus, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  lunas:      { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Lunas', icon: CheckCircle },
  menunggu:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Menunggu',  icon: Clock },
  terlambat:  { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Terlambat', icon: AlertCircle },
  dibatalkan: { bg: 'bg-slate-100',  text: 'text-slate-500',   label: 'Dibatalkan', icon: X },
};

interface BillingFormState {
  parentName: string;
  childName: string;
  type: BillingType;
  description: string;
  amount: string;
  dueDate: string;
  month: string;
}

const EMPTY_FORM: BillingFormState = {
  parentName: '', childName: '', type: 'monthly',
  description: '', amount: '', dueDate: '', month: '',
};

function BillingFormModal({ initial, onClose, onSave }: {
  initial?: SppBilling;
  onClose: () => void;
  onSave: (data: BillingFormState) => void;
}) {
  const [form, setForm] = useState<BillingFormState>(
    initial
      ? { parentName: initial.parentName, childName: initial.childName, type: initial.type, description: initial.description, amount: String(initial.amount), dueDate: initial.dueDate, month: initial.month ?? '' }
      : EMPTY_FORM,
  );
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parentName.trim() || !form.childName.trim()) { setError('Nama orang tua dan anak wajib diisi.'); return; }
    if (!form.description.trim()) { setError('Keterangan tagihan wajib diisi.'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setError('Nominal tidak valid.'); return; }
    if (!form.dueDate) { setError('Tanggal jatuh tempo wajib diisi.'); return; }
    onSave(form);
  }

  const f = (key: keyof BillingFormState, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-10">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {initial ? 'Edit Tagihan' : 'Tambah Tagihan SPP'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Orang Tua *</label>
              <input value={form.parentName} onChange={e => f('parentName', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" placeholder="contoh: Andi Saputra" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Anak *</label>
              <input value={form.childName} onChange={e => f('childName', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" placeholder="contoh: Bima Saputra" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Jenis Tagihan</label>
            <select value={form.type} onChange={e => f('type', e.target.value as BillingType)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none">
              <option value="monthly">SPP Bulanan Berulang</option>
              <option value="one-time">Tagihan Satu Kali</option>
            </select>
          </div>

          {form.type === 'monthly' && (
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Bulan</label>
              <input value={form.month} onChange={e => f('month', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" placeholder="contoh: Juli 2026" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Keterangan *</label>
            <input value={form.description} onChange={e => f('description', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" placeholder="contoh: SPP Bulan Juli 2026" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nominal (IDR) *</label>
              <input type="number" min={0} value={form.amount} onChange={e => f('amount', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" placeholder="1500000" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Jatuh Tempo *</label>
              <input type="date" value={form.dueDate} onChange={e => f('dueDate', e.target.value)} className="w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-emerald-400 focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
            <button type="submit" className="rounded-full bg-emerald-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-emerald-700">
              {initial ? 'Simpan Perubahan' : 'Buat Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

let idCtr = 100;

export default function SppAdmin() {
  const [billings, setBillings] = useState<SppBilling[]>(SEED_BILLINGS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BillingStatus | 'semua'>('semua');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SppBilling | null>(null);

  const filtered = billings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.parentName.toLowerCase().includes(q) || b.childName.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'semua' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleSave(data: BillingFormState) {
    if (editing) {
      setBillings(prev => prev.map(b => b.id === editing.id
        ? { ...b, parentName: data.parentName, childName: data.childName, type: data.type, description: data.description, amount: Number(data.amount), dueDate: data.dueDate, month: data.month }
        : b));
      setEditing(null);
    } else {
      const newBilling: SppBilling = {
        id: `spp-new-${idCtr++}`, parentName: data.parentName, childName: data.childName, type: data.type, description: data.description, amount: Number(data.amount), dueDate: data.dueDate, status: 'menunggu', month: data.month || undefined,
      };
      setBillings(prev => [newBilling, ...prev]);
      setShowForm(false);
    }
  }

  function handleCancel(id: string) {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, status: 'dibatalkan' } : b));
  }

  function handleMarkLunas(id: string) {
    setBillings(prev => prev.map(b => b.id === id ? { ...b, status: 'lunas' } : b));
  }

  function handleSendReminder(billing: SppBilling) {
    const msg = encodeURIComponent(`Halo, ini pengingat pembayaran SPP: ${billing.description} sebesar ${formatIDR(billing.amount)}. Jatuh tempo: ${formatDate(billing.dueDate)}. Terima kasih.`);
    window.open(`https://wa.me/6281211470407?text=${msg}`, '_blank');
  }

  const stats = {
    total: billings.filter(b => b.status !== 'dibatalkan').length,
    lunas: billings.filter(b => b.status === 'lunas').length,
    menunggu: billings.filter(b => b.status === 'menunggu').length,
    terlambat: billings.filter(b => b.status === 'terlambat').length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Tagihan', value: stats.total, color: 'text-stv-navy', bg: 'bg-slate-50' },
          { label: 'Sudah Lunas', value: stats.lunas, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Menunggu', value: stats.menunggu, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Terlambat', value: stats.terlambat, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.bg} p-4`}>
            <p className="text-[12px] font-semibold text-stv-muted">{s.label}</p>
            <p className={`font-baloo text-[28px] font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama orang tua, anak, atau keterangan..."
            className="w-full rounded-xl border border-stv-border py-2.5 pl-9 pr-4 text-[14px] focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as BillingStatus | 'semua')}
          className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none"
        >
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="lunas">Lunas</option>
          <option value="terlambat">Terlambat</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Tagihan
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stv-border bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stv-muted">
            <Receipt className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-[14px]">Tidak ada tagihan yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="border-b border-stv-border bg-slate-50">
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Orang Tua / Anak</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Tagihan</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Nominal</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Status</th>
                  <th className="px-4 py-3 text-right text-[12px] font-bold uppercase tracking-wide text-stv-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stv-border">
                {filtered.map(b => {
                  const { bg, text, label, icon: StatusIcon } = STATUS_STYLE[b.status];
                  return (
                    <tr key={b.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stv-navy">{b.parentName}</p>
                        <p className="text-[12px] text-stv-muted">{b.childName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stv-body">{b.description}</p>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.type === 'monthly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {b.type === 'monthly' ? 'SPP Bulanan' : 'Satu Kali'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-stv-navy">{formatIDR(b.amount)}</td>
                      <td className="px-4 py-3 text-stv-body">{formatDate(b.dueDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${bg} ${text}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'menunggu' || b.status === 'terlambat' ? (
                            <>
                              <button type="button" onClick={() => handleMarkLunas(b.id)} title="Tandai Lunas" className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleSendReminder(b)} title="Kirim Pengingat WA" className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100">
                                <Send className="h-4 w-4" />
                              </button>
                            </>
                          ) : null}
                          {b.status !== 'dibatalkan' && b.status !== 'lunas' && (
                            <button type="button" onClick={() => setEditing(b)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-stv-muted transition hover:text-stv-navy">
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {b.status !== 'dibatalkan' && b.status !== 'lunas' && (
                            <button type="button" onClick={() => handleCancel(b.id)} title="Batalkan Tagihan" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <BillingFormModal
          initial={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
