import React, { useState } from 'react';
import { CheckCircle2, Flag, AlertCircle } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';
import { useTracker } from './TrackerContext';
import { fmtYM } from '../../../lib/contentFreshness';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  approved:  'bg-sky-50 text-sky-700 border-sky-200',
  review:    'bg-amber-50 text-amber-700 border-amber-200',
  draft:     'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_LABEL: Record<string, string> = {
  published: 'Dipublikasi',
  approved:  'Disetujui',
  review:    'Dalam tinjauan',
  draft:     'Draft',
};

interface FlagInputState {
  moduleId: string;
  reason: string;
}

export function ModuleTable() {
  const {
    modules,
    usageMap,
    moduleOverrides,
    sourceState,
    computeModuleFreshness,
    markModuleValid,
    flagModule,
    setActiveTab,
    setHighlightModuleId,
  } = useTracker();

  const [flagInputState, setFlagInputState] = useState<FlagInputState | null>(null);
  const moduleList = Object.values(modules);

  function handleMarkValid(moduleId: string) {
    markModuleValid(moduleId);
    // TODO: persist ke backend
  }

  function handleFlag(moduleId: string, reason: string) {
    flagModule(moduleId, reason);
    setFlagInputState(null);
    // TODO: persist ke backend
  }

  function handleHighlightCards(moduleId: string) {
    setHighlightModuleId(moduleId);
    setActiveTab('matriks');
  }

  // Compute whether a module has any active source cascade flags
  function moduleHasSourceFlag(moduleId: string): boolean {
    const mod = modules[moduleId];
    if (!mod) return false;
    const acknowledgedAt = moduleOverrides[moduleId]?.acknowledgedAt;
    return mod.sourceIds.some((srcId) => {
      const flags = sourceState[srcId]?.flags ?? [];
      return flags.some((f) => !acknowledgedAt || f.createdAt > acknowledgedAt);
    });
  }

  return (
    <div className="rounded-xl border border-stv-border bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] overflow-hidden">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-stv-border bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Modul
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Domain
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Ditinjau
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Status
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Dipakai
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Freshness
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stv-muted">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stv-border">
          {moduleList.map((mod) => {
            const overrideFlags = moduleOverrides[mod.id]?.flags ?? [];
            const hasSrcFlag = moduleHasSourceFlag(mod.id);
            const totalFlags = overrideFlags.length + (hasSrcFlag ? 1 : 0);
            const freshness = computeModuleFreshness(mod.id);
            const cardCount = (usageMap.moduleToCards[mod.id] ?? []).length;
            const lastReviewed = moduleOverrides[mod.id]?.lastReviewed ?? mod.lastReviewed;

            return (
              <React.Fragment key={mod.id}>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-stv-navy text-[13px]">{mod.title}</p>
                    <p className="text-[11px] text-stv-muted mt-0.5">{mod.id}</p>
                    {totalFlags > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-600">
                        <Flag className="h-3 w-3" />
                        {totalFlags} flag aktif
                        {hasSrcFlag && (
                          <span className="text-red-400"> (kaskade sumber)</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-stv-body">
                      {mod.domainHints.join(', ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-stv-body whitespace-nowrap">
                    {fmtYM(lastReviewed)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[mod.status] ?? STATUS_BADGE.draft}`}
                    >
                      {STATUS_LABEL[mod.status] ?? mod.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {cardCount > 0 ? (
                      <button
                        onClick={() => handleHighlightCards(mod.id)}
                        className="text-xs font-semibold text-stv-sky underline underline-offset-2 hover:text-stv-sky-stroke"
                        title="Sorot sel-sel kartu yang memakai modul ini di tab Matriks"
                      >
                        {cardCount} kartu
                      </button>
                    ) : (
                      <span className="text-xs text-stv-muted-2">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <FreshnessBadge freshness={freshness} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* TODO: persist ke backend */}
                      <button
                        onClick={() => handleMarkValid(mod.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        title="Reset tanggal tinjau modul ke bulan ini; hapus flag modul"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Masih valid
                      </button>
                      <button
                        onClick={() =>
                          setFlagInputState(
                            flagInputState?.moduleId === mod.id ? null : { moduleId: mod.id, reason: '' }
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                        title="Tandai modul ini perlu ditinjau dan kaskadetkan ke sel kartu"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        Tandai berubah
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Inline flag input row */}
                {flagInputState?.moduleId === mod.id && (
                  <tr>
                    <td colSpan={7} className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="flex-1 space-y-2">
                          <p className="text-xs font-semibold text-amber-800">
                            Alasan flag untuk modul "{mod.title}" (wajib):
                          </p>
                          <p className="text-[11px] text-amber-600">
                            Ini akan membuat semua sel kartu yang memakai modul ini otomatis "Perlu tinjau".
                          </p>
                          <div className="flex gap-2">
                            <textarea
                              value={flagInputState.reason}
                              onChange={(e) =>
                                setFlagInputState({ ...flagInputState, reason: e.target.value })
                              }
                              rows={2}
                              placeholder="Mis. Pedoman AAP revisi 2026 mengubah rekomendasi…"
                              className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleFlag(mod.id, flagInputState.reason)}
                                disabled={!flagInputState.reason.trim()}
                                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
                              >
                                Buat flag
                              </button>
                              <button
                                onClick={() => setFlagInputState(null)}
                                className="rounded-lg border border-stv-border px-4 py-2 text-xs text-stv-muted hover:bg-white"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
