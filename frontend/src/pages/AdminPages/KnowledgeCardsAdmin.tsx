import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode } from '../DashboardPages/Tier2/knowledgeCardData';

interface AdminKnowledgeCard {
  id: number;
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  read_minutes: number;
  is_medical: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

type CardStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';

const STATUS_STYLE: Record<CardStatus, { bg: string; text: string; label: string }> = {
  DRAFT:     { bg: 'bg-slate-100',   text: 'text-slate-600',  label: 'Draft' },
  IN_REVIEW: { bg: 'bg-amber-50',    text: 'text-amber-700',  label: 'In Review' },
  APPROVED:  { bg: 'bg-blue-50',     text: 'text-blue-700',   label: 'Disetujui' },
  PUBLISHED: { bg: 'bg-emerald-50',  text: 'text-emerald-700', label: 'Dipublikasi' },
};

const STATUS_OPTIONS: CardStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'];

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status as CardStatus] ?? STATUS_STYLE.DRAFT;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function KnowledgeCardsAdmin() {
  const navigate = useNavigate();

  const [cards, setCards] = useState<AdminKnowledgeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterAge, setFilterAge] = useState<AgeKey | ''>('');
  const [filterDomain, setFilterDomain] = useState<DomainCode | ''>('');
  const [filterStatus, setFilterStatus] = useState<CardStatus | ''>('');

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusChanging, setStatusChanging] = useState<number | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterAge) params.set('ageKey', filterAge);
      if (filterDomain) params.set('domain', filterDomain);
      if (filterStatus) params.set('status', filterStatus);

      const res = await api.get<{ cards: AdminKnowledgeCard[] }>(
        `/knowledge-cards/admin/all${params.toString() ? `?${params}` : ''}`
      );
      setCards(res.data.cards);
    } catch {
      setError('Gagal memuat data kartu. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [filterAge, filterDomain, filterStatus]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Hapus kartu "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/knowledge-cards/admin/${id}`);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Gagal menghapus kartu. Coba lagi.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(card: AdminKnowledgeCard, newStatus: CardStatus) {
    let reviewerNotes: string | undefined;

    if (['IN_REVIEW', 'APPROVED', 'PUBLISHED'].includes(newStatus)) {
      const notes = window.prompt(`Catatan reviewer untuk status "${STATUS_STYLE[newStatus].label}" (opsional):`);
      if (notes !== null) {
        reviewerNotes = notes || undefined;
      } else {
        return; // user cancelled
      }
    }

    setStatusChanging(card.id);
    try {
      const res = await api.put<{ card: AdminKnowledgeCard }>(
        `/knowledge-cards/admin/${card.id}/status`,
        { status: newStatus, reviewerNotes }
      );
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: res.data.card.status } : c));
    } catch {
      alert('Gagal mengubah status. Coba lagi.');
    } finally {
      setStatusChanging(null);
    }
  }

  const domainEntries = Object.entries(DOMAIN_MAP) as [DomainCode, typeof DOMAIN_MAP[DomainCode]][];

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Age filter */}
        <select
          value={filterAge}
          onChange={e => setFilterAge(e.target.value as AgeKey | '')}
          className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none focus:border-amber-400"
        >
          <option value="">Semua Usia</option>
          {AGE_RANGES.map(ar => (
            <option key={ar.key} value={ar.key}>{ar.label}</option>
          ))}
        </select>

        {/* Domain filter */}
        <select
          value={filterDomain}
          onChange={e => setFilterDomain(e.target.value as DomainCode | '')}
          className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none focus:border-amber-400"
        >
          <option value="">Semua Domain</option>
          {domainEntries.map(([code, info]) => (
            <option key={code} value={code}>{info.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as CardStatus | '')}
          className="rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:outline-none focus:border-amber-400"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
          ))}
        </select>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => navigate('/admin/knowledge-cards/new')}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Tambah Kartu Baru
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[13px] text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stv-border bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-stv-muted">
            <div className="text-[14px]">Memuat data...</div>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stv-muted">
            <BookOpen className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-[14px]">Tidak ada kartu yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="border-b border-stv-border bg-slate-50">
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Judul</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Usia</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Domain</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Status</th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-stv-muted">Diperbarui</th>
                  <th className="px-4 py-3 text-right text-[12px] font-bold uppercase tracking-wide text-stv-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stv-border">
                {cards.map(card => {
                  const ageLabel = AGE_RANGES.find(a => a.key === card.age_key)?.label ?? card.age_key;
                  const domainInfo = DOMAIN_MAP[card.domain as DomainCode];
                  const Icon = domainInfo?.icon;

                  return (
                    <tr key={card.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stv-navy">{card.title}</p>
                        <p className="text-[12px] text-stv-muted">{card.slug}</p>
                        {card.is_medical && (
                          <span className="mt-0.5 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            Medis
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stv-body">{ageLabel}</td>
                      <td className="px-4 py-3">
                        {domainInfo && Icon && (
                          <span
                            className="flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{ background: domainInfo.bg, color: domainInfo.fg }}
                          >
                            <Icon className="h-3 w-3" strokeWidth={2} />
                            {domainInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={card.status} />
                          <select
                            value={card.status}
                            onChange={e => handleStatusChange(card, e.target.value as CardStatus)}
                            disabled={statusChanging === card.id}
                            className="rounded-lg border border-stv-border px-2 py-1 text-[11px] text-stv-body focus:outline-none disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stv-muted">{formatDate(card.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/knowledge-cards/${card.id}/edit`)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-stv-muted transition hover:text-stv-navy"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(card.id, card.title)}
                            disabled={deletingId === card.id}
                            title="Hapus"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Stats summary */}
      {!loading && cards.length > 0 && (
        <div className="flex gap-4 text-[13px] text-stv-muted">
          <span><strong className="text-stv-navy">{cards.length}</strong> kartu total</span>
          <span><strong className="text-emerald-600">{cards.filter(c => c.status === 'PUBLISHED').length}</strong> dipublikasi</span>
          <span><strong className="text-amber-600">{cards.filter(c => c.status === 'IN_REVIEW').length}</strong> in review</span>
          <span><strong className="text-slate-600">{cards.filter(c => c.status === 'DRAFT').length}</strong> draft</span>
        </div>
      )}
    </div>
  );
}
