import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, BookOpen, Building2, FlaskConical, Scroll } from 'lucide-react';
import { useTracker } from './TrackerContext';
import { Source } from '../../DashboardPages/Tier2/sources';
import { monthsDiff, parseYearMonth } from '../../../lib/contentFreshness';

const TYPE_META: Record<Source['type'], { label: string; icon: React.ElementType; className: string }> = {
  institusi:     { label: 'Institusi',      icon: Building2,   className: 'text-stv-sky bg-sky-50 border-sky-200' },
  pedoman:       { label: 'Pedoman',        icon: BookOpen,    className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  riset:         { label: 'Riset',          icon: FlaskConical,className: 'text-purple-700 bg-purple-50 border-purple-200' },
  'karya-klasik':{ label: 'Karya klasik',   icon: Scroll,      className: 'text-stv-muted-2 bg-slate-50 border-slate-200' },
};

interface InspectionDialog {
  sourceId: string;
  mode: 'no-change' | 'changed' | null;
  note: string;
  url: string;
}

export function SourceTable() {
  const {
    sources,
    usageMap,
    sourceState,
    inspectionLog,
    now,
    recordSourceNoChange,
    recordSourceChanged,
  } = useTracker();

  const [dialog, setDialog] = useState<InspectionDialog | null>(null);

  // Sources that need periodic checking (exclude karya-klasik)
  const checkableSources = Object.values(sources).filter((s) => s.type !== 'karya-klasik');
  const classicSources   = Object.values(sources).filter((s) => s.type === 'karya-klasik');

  const oldestLastChecked: string | null = checkableSources.reduce<string | null>((oldest, s) => {
    const lc = sourceState[s.id]?.lastChecked;
    if (!lc) return oldest;
    if (!oldest) return lc;
    return lc < oldest ? lc : oldest;
  }, null);

  const showQuarterlyBanner =
    oldestLastChecked !== null && monthsDiff(parseYearMonth(oldestLastChecked), now) >= 3;

  function openDialog(sourceId: string) {
    setDialog({ sourceId, mode: null, note: '', url: '' });
  }

  function handleConfirmDialog() {
    if (!dialog) return;
    if (dialog.mode === 'no-change') {
      recordSourceNoChange(dialog.sourceId, dialog.note || undefined);
      // TODO: persist ke backend
    } else if (dialog.mode === 'changed') {
      if (!dialog.note.trim()) return;
      recordSourceChanged(dialog.sourceId, dialog.note.trim(), dialog.url || undefined);
      // TODO: persist ke backend
    }
    setDialog(null);
  }

  function renderSourceRow(src: Source) {
    const st = sourceState[src.id] ?? { lastChecked: '—', flags: [] };
    const moduleCount = (usageMap.sourceToModules[src.id] ?? []).length;
    const cardCount   = (usageMap.sourceToCards[src.id]   ?? []).length;
    const typeMeta    = TYPE_META[src.type];
    const TypeIcon    = typeMeta.icon;
    const activeFlags = st.flags;
    const isClassic   = src.type === 'karya-klasik';

    const lastCheckedAge =
      !isClassic && st.lastChecked !== '—'
        ? monthsDiff(parseYearMonth(st.lastChecked), now)
        : null;

    const staleChecked = lastCheckedAge !== null && lastCheckedAge >= 3;

    return (
      <tr key={src.id} className="hover:bg-slate-50/70 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${typeMeta.className}`}
            >
              <TypeIcon className="h-2.5 w-2.5" />
              {typeMeta.label}
            </span>
            <div>
              <p className="text-[12px] font-semibold text-stv-navy leading-snug">{src.label}</p>
              <p className="text-[10px] text-stv-muted">{src.id}</p>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-stv-sky hover:underline"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Buka sumber
                </a>
              )}
              {activeFlags.length > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  ⚑ {activeFlags.length} flag aktif
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-xs text-stv-body">
          {moduleCount > 0 ? (
            <span>
              {moduleCount} modul → {cardCount} kartu
            </span>
          ) : (
            <span className="text-stv-muted-2">—</span>
          )}
        </td>
        <td className="px-3 py-3 text-xs">
          {isClassic ? (
            <span className="text-stv-muted-2 italic">Tidak perlu</span>
          ) : (
            <span className={staleChecked ? 'font-semibold text-amber-700' : 'text-stv-body'}>
              {st.lastChecked !== '—'
                ? `${st.lastChecked.replace('-', '/')} ${staleChecked ? '⚠' : ''}`
                : '—'}
            </span>
          )}
        </td>
        <td className="px-3 py-3 text-right">
          {!isClassic && (
            <button
              onClick={() => openDialog(src.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-stv-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stv-navy hover:bg-stv-badge-navy-tint transition-colors"
            >
              Catat pemeriksaan
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Quarterly banner */}
      {showQuarterlyBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Sudah waktunya pemeriksaan sumber kuartalan
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Satu atau lebih sumber belum diperiksa selama ≥3 bulan. Lakukan pemeriksaan berkala dan catat hasilnya.
            </p>
          </div>
        </div>
      )}

      {/* Source table — checkable sources */}
      <div className="rounded-xl border border-stv-border bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] overflow-hidden">
        <div className="border-b border-stv-border bg-slate-50 px-4 py-2.5">
          <p className="text-xs font-semibold text-stv-muted uppercase tracking-wider">
            Sumber yang perlu pemeriksaan berkala
          </p>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-stv-border">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-stv-muted">Sumber</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-stv-muted">Pemakaian</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-stv-muted">Terakhir diperiksa</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-stv-muted">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stv-border">
            {checkableSources.map(renderSourceRow)}
          </tbody>
        </table>
      </div>

      {/* Classic sources */}
      {classicSources.length > 0 && (
        <div className="rounded-xl border border-stv-border bg-white overflow-hidden">
          <div className="border-b border-stv-border bg-slate-50 px-4 py-2.5">
            <p className="text-xs font-semibold text-stv-muted uppercase tracking-wider">
              Karya klasik — tidak perlu pemeriksaan berkala
            </p>
          </div>
          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-stv-border">
              {classicSources.map(renderSourceRow)}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspection log */}
      <div className="rounded-xl border border-stv-border bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] overflow-hidden">
        <div className="border-b border-stv-border bg-slate-50 px-4 py-2.5">
          <p className="text-xs font-semibold text-stv-muted uppercase tracking-wider">
            Log pemeriksaan
          </p>
        </div>
        {inspectionLog.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-stv-muted">Belum ada pemeriksaan yang dicatat.</p>
        ) : (
          <ul className="divide-y divide-stv-border">
            {inspectionLog.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    entry.result === 'no-change' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {entry.result === 'no-change' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-stv-navy">
                    {sources[entry.sourceId]?.label ?? entry.sourceId}
                  </p>
                  <p className={`text-[11px] font-medium ${entry.result === 'no-change' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {entry.result === 'no-change' ? 'Tidak ada perubahan' : 'Ada perubahan'}
                  </p>
                  {entry.note && <p className="mt-0.5 text-[11px] text-stv-muted">{entry.note}</p>}
                  {entry.url && (
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-stv-sky hover:underline">
                      {entry.url}
                    </a>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-stv-muted-2">{entry.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inspection dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Catat pemeriksaan sumber"
        >
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setDialog(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-baloo text-[18px] font-bold text-stv-navy">
              Catat pemeriksaan sumber
            </h3>
            <p className="mt-1 text-sm text-stv-muted">
              {sources[dialog.sourceId]?.label ?? dialog.sourceId}
            </p>

            {/* Mode selection */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setDialog({ ...dialog, mode: 'no-change' })}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  dialog.mode === 'no-change'
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-stv-border hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`h-5 w-5 mb-1.5 ${dialog.mode === 'no-change' ? 'text-emerald-600' : 'text-stv-muted'}`} />
                <p className="text-sm font-semibold text-stv-navy">Tidak ada perubahan</p>
                <p className="text-[11px] text-stv-muted mt-0.5">Sumber sudah diperiksa, konten masih akurat.</p>
              </button>
              <button
                onClick={() => setDialog({ ...dialog, mode: 'changed' })}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  dialog.mode === 'changed'
                    ? 'border-red-400 bg-red-50'
                    : 'border-stv-border hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 mb-1.5 ${dialog.mode === 'changed' ? 'text-red-600' : 'text-stv-muted'}`} />
                <p className="text-sm font-semibold text-stv-navy">Ada perubahan</p>
                <p className="text-[11px] text-stv-muted mt-0.5">Sumber diperbarui — flag semua modul terkait.</p>
              </button>
            </div>

            {dialog.mode && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stv-body mb-1">
                    Catatan {dialog.mode === 'changed' ? '(wajib)' : '(opsional)'}
                  </label>
                  <textarea
                    value={dialog.note}
                    onChange={(e) => setDialog({ ...dialog, note: e.target.value })}
                    rows={3}
                    placeholder={
                      dialog.mode === 'changed'
                        ? 'Jelaskan perubahan yang ditemukan…'
                        : 'Catatan opsional…'
                    }
                    className="w-full rounded-lg border border-stv-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stv-sky"
                  />
                </div>
                {dialog.mode === 'changed' && (
                  <div>
                    <label className="block text-xs font-semibold text-stv-body mb-1">
                      Tautan (opsional)
                    </label>
                    <input
                      type="url"
                      value={dialog.url}
                      onChange={(e) => setDialog({ ...dialog, url: e.target.value })}
                      placeholder="https://…"
                      className="w-full rounded-lg border border-stv-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stv-sky"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleConfirmDialog}
                disabled={!dialog.mode || (dialog.mode === 'changed' && !dialog.note.trim())}
                className="flex-1 rounded-xl bg-stv-navy py-2.5 text-sm font-semibold text-white hover:bg-stv-navy-dark disabled:opacity-40 transition-colors"
              >
                Simpan
              </button>
              <button
                onClick={() => setDialog(null)}
                className="rounded-xl border border-stv-border px-4 py-2.5 text-sm font-semibold text-stv-muted hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
