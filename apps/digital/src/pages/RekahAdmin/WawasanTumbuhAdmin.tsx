import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, Trash2 } from 'lucide-react';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import { AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode } from '@studiva/shared';

export default function WawasanTumbuhAdmin() {
  const { managedCards, apiLoaded, adminDeleteCard } = useKnowledgeLibrary();
  const [search, setSearch] = useState('');
  const [filterAge, setFilterAge] = useState<AgeKey | 'semua'>('semua');
  const [filterDomain, setFilterDomain] = useState<DomainCode | 'semua'>('semua');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return managedCards.filter(c =>
      (!search || c.title.toLowerCase().includes(q)) &&
      (filterAge === 'semua' || c.ageKey === filterAge) &&
      (filterDomain === 'semua' || c.domain === filterDomain)
    );
  }, [managedCards, search, filterAge, filterDomain]);

  const domainEntries = Object.entries(DOMAIN_MAP) as [DomainCode, { label: string }][];

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      adminDeleteCard(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bricolage text-[22px] font-extrabold text-pekat">Wawasan Tumbuh</h1>
          <p className="mt-0.5 text-[13px] text-pekat/50">
            {managedCards.length} kartu Panduan Tumbuh Kembang
            {!apiLoaded && ' · data dari sumber statik'}
            {apiLoaded && ' · sinkron dari database'}
          </p>
        </div>
        <Link
          to="/rekah-admin/wawasan/new"
          className="flex shrink-0 items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_3px_12px_rgba(224,82,107,0.22)] hover:bg-rekah-tua transition"
        >
          <Plus className="h-4 w-4" /> Tambah Kartu
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pekat/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul..."
            className="w-full rounded-xl border border-rekah/15 bg-white pl-8 pr-4 py-2 text-[13px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none"
          />
        </div>
        <select
          value={filterAge}
          onChange={e => setFilterAge(e.target.value as AgeKey | 'semua')}
          className="rounded-xl border border-rekah/15 bg-white px-3 py-2 text-[13px] text-pekat focus:border-rekah focus:outline-none"
        >
          <option value="semua">Semua usia</option>
          {AGE_RANGES.map(r => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
        <select
          value={filterDomain}
          onChange={e => setFilterDomain(e.target.value as DomainCode | 'semua')}
          className="rounded-xl border border-rekah/15 bg-white px-3 py-2 text-[13px] text-pekat focus:border-rekah focus:outline-none"
        >
          <option value="semua">Semua domain</option>
          {domainEntries.map(([code, d]) => (
            <option key={code} value={code}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Card list */}
      {managedCards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-rekah/20 py-12 text-center">
          <p className="text-[13px] text-pekat/40">Memuat kartu Panduan...</p>
        </div>
      )}

      {managedCards.length > 0 && filtered.length === 0 && (
        <p className="text-center text-[13px] text-pekat/40 py-8">
          Tidak ada kartu yang cocok dengan filter.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map(card => {
            const domain = DOMAIN_MAP[card.domain as DomainCode];
            const ageLabel = AGE_RANGES.find(r => r.key === card.ageKey)?.label ?? card.ageKey;
            const isPlaceholder = !card.summary;
            const isDraft = card.adminStatus === 'draft';

            return (
              <div
                key={card.id}
                className="flex flex-col rounded-xl border border-rekah/10 bg-white px-4 py-3 gap-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-pekat">{card.title}</p>
                    <p className="text-[12px] text-pekat/40">
                      {ageLabel} · {domain?.label ?? card.domain} ·{' '}
                      <span className="font-mono">{card.id}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isPlaceholder
                        ? 'bg-pekat/10 text-pekat/40'
                        : isDraft
                          ? 'bg-rekah/10 text-rekah/70'
                          : 'bg-daun/20 text-daun'
                    }`}>
                      {isPlaceholder ? 'Segera Hadir' : isDraft ? 'Draft' : 'Tayang'}
                    </span>
                    <Link
                      to={`/rekah-admin/wawasan/${encodeURIComponent(card.id)}/edit`}
                      className="flex items-center gap-1.5 rounded-full border border-rekah/30 px-3 py-1.5 text-[12px] font-semibold text-rekah hover:bg-rekah/10 transition"
                    >
                      <Pencil className="h-3 w-3" /> Edit &amp; Ajukan
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmId(confirmId === card.id ? null : card.id)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </button>
                  </div>
                </div>

                {/* Konfirmasi hapus — inline */}
                {confirmId === card.id && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                    <p className="text-[12px] text-red-700 font-medium">
                      Hapus kartu ini secara permanen?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-100 transition"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === card.id}
                        onClick={() => handleDelete(card.id)}
                        className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {deletingId === card.id ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-3 text-right text-[12px] text-pekat/30">
          Menampilkan {filtered.length} dari {managedCards.length} kartu
        </p>
      )}
    </div>
  );
}
