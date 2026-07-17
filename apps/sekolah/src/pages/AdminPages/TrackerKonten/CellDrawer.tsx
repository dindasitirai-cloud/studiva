import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, CheckCircle2, Flag, ChevronRight } from 'lucide-react';
import { DomainCode } from '../../DashboardPages/Tier2/knowledgeCardData';
import { FreshnessBadge } from './FreshnessBadge';
import { useTracker } from './TrackerContext';
import { fmtYM } from '../../../lib/contentFreshness';

export function CellDrawer() {
  const {
    selectedCardId,
    setSelectedCardId,
    cardIndex,
    modules,
    usageMap,
    computeModuleFreshness,
    computeCellFreshness,
    getActiveFlags,
    markCardValid,
    flagCard,
  } = useTracker();

  const [flagInput, setFlagInput] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const card = selectedCardId ? cardIndex[selectedCardId] : null;

  useEffect(() => {
    if (card) setTimeout(() => closeRef.current?.focus(), 50);
  }, [card]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCardId) setSelectedCardId(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedCardId, setSelectedCardId]);

  if (!card) return null;

  const freshness = computeCellFreshness(card);
  const activeFlags = getActiveFlags(card.id);
  const cardModuleIds = usageMap.cardToModules[card.id] ?? [];
  const reviewedDate =
    card.scientific.reviewedBy?.date;
  const isFilled =
    Array.isArray(card.scientific.sections) && card.scientific.sections.length > 0;

  function handleMarkValid() {
    markCardValid(card!.id);
    setShowFlagInput(false);
    setFlagInput('');
  }

  function handleSubmitFlag() {
    if (!flagInput.trim()) return;
    flagCard(card!.id, flagInput.trim());
    setFlagInput('');
    setShowFlagInput(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
        onClick={() => setSelectedCardId(null)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail konten: ${card.title}`}
        className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stv-border px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stv-muted">
              {card.id}
            </p>
            <h3 className="mt-0.5 font-baloo text-[17px] font-bold leading-snug text-stv-navy">
              {card.scientific.title !== 'Detail ilmiah, TODO'
                ? card.scientific.title
                : card.title}
            </h3>
            <p className="mt-0.5 text-[12px] text-stv-muted">
              {card.ageKey} · Domain {card.domain}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={() => setSelectedCardId(null)}
            className="ml-3 rounded-lg p-1.5 text-stv-muted hover:bg-slate-100"
            aria-label="Tutup panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Freshness + fill status */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex-1">
              <p className="text-[11px] text-stv-muted">Status konten</p>
              <p className="mt-0.5 text-sm font-semibold text-stv-navy">
                {isFilled ? '✅ Detail ilmiah terisi' : '⬜ Detail ilmiah belum terisi'}
              </p>
            </div>
            {freshness && <FreshnessBadge freshness={freshness} />}
          </div>

          {/* Reviewer + date */}
          {reviewedDate && (
            <div>
              <p className="text-[11px] font-semibold text-stv-muted uppercase tracking-wider mb-1">
                Terakhir ditinjau
              </p>
              <p className="text-sm text-stv-body">
                {card.scientific.reviewedBy?.name ?? '—'} ·{' '}
                {fmtYM(reviewedDate)}
              </p>
            </div>
          )}

          {/* Active flags */}
          {activeFlags.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-600 mb-2">
                Flag aktif ({activeFlags.length})
              </p>
              <ul className="space-y-2">
                {activeFlags.map((f) => (
                  <li
                    key={f.id}
                    className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs"
                  >
                    <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800">{f.reason}</p>
                      {f.note && <p className="mt-0.5 text-red-600">{f.note}</p>}
                      <p className="mt-0.5 text-red-400">{f.createdAt}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modules used by this card */}
          {cardModuleIds.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stv-muted mb-2">
                Modul yang dipakai ({cardModuleIds.length})
              </p>
              <ul className="space-y-2">
                {cardModuleIds.map((modId) => {
                  const mod = modules[modId];
                  if (!mod) return null;
                  const modFresh = computeModuleFreshness(modId, card.domain as DomainCode);
                  return (
                    <li
                      key={modId}
                      className="flex items-start gap-2 rounded-xl border border-stv-border bg-slate-50 px-3 py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-stv-navy truncate">
                          {mod.title}
                        </p>
                        <p className="text-[11px] text-stv-muted">
                          Ditinjau: {fmtYM(mod.lastReviewed)} · {mod.status}
                        </p>
                      </div>
                      <FreshnessBadge freshness={modFresh} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Flag input */}
          {showFlagInput && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-800">Alasan flag (wajib):</p>
              <textarea
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                rows={3}
                placeholder="Mis. Rekomendasi AAP berubah, perlu cek bagian X…"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-stv-body focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitFlag}
                  disabled={!flagInput.trim()}
                  className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
                >
                  Buat flag
                </button>
                <button
                  onClick={() => { setShowFlagInput(false); setFlagInput(''); }}
                  className="rounded-lg border border-stv-border px-3 py-1.5 text-xs text-stv-muted hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-stv-border px-5 py-4 space-y-2">
          {/* TODO: persist ke backend */}
          <button
            onClick={handleMarkValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Masih valid — perbarui tanggal tinjau
          </button>
          {!showFlagInput && (
            <button
              onClick={() => setShowFlagInput(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Flag className="h-4 w-4" />
              Tandai perlu tinjau
            </button>
          )}
          <a
            href={`/dashboard/tier2/knowledge/${card.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stv-border py-2.5 text-sm font-semibold text-stv-navy hover:bg-stv-badge-navy-tint transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Buka kartu
            <ChevronRight className="h-4 w-4 ml-auto" />
          </a>
        </div>
      </aside>
    </>
  );
}
