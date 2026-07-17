import React, { useState } from 'react';
import { CheckCircle, Square, Flag } from 'lucide-react';
import { AGE_RANGES, DOMAIN_MAP, DomainCode, AgeKey } from '../../DashboardPages/Tier2/knowledgeCardData';
import { DOMAIN_CODES } from '../../DashboardPages/Tier2/domains';
import { FreshnessDot } from './FreshnessBadge';
import { useTracker } from './TrackerContext';

const DOMAINS: DomainCode[] = DOMAIN_CODES;
const EMPTY_BANDS: AgeKey[] = ['3-4y', '4-5y', '5-6y'];

interface MatrixFilters {
  perluTinjauOnly: boolean;
  domainFilter: DomainCode | '';
  belumTerisiOnly: boolean;
}

function isCardFilled(card: { scientific: { sections?: unknown[] } }): boolean {
  return Array.isArray(card.scientific.sections) && card.scientific.sections.length > 0;
}

export function MatrixGrid() {
  const {
    cardIndex,
    selectedCardId,
    setSelectedCardId,
    computeCellFreshness,
    getActiveFlags,
  } = useTracker();

  const [filters, setFilters] = useState<MatrixFilters>({
    perluTinjauOnly: false,
    domainFilter: '',
    belumTerisiOnly: false,
  });

  const visibleDomains = filters.domainFilter
    ? DOMAINS.filter((d) => d === filters.domainFilter)
    : DOMAINS;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilters((f) => ({ ...f, perluTinjauOnly: !f.perluTinjauOnly }))}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.perluTinjauOnly
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-stv-border bg-white text-stv-body hover:bg-slate-50'
          }`}
        >
          Hanya Perlu Tinjau
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, belumTerisiOnly: !f.belumTerisiOnly }))}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.belumTerisiOnly
              ? 'border-stv-navy bg-stv-badge-navy-tint text-stv-navy'
              : 'border-stv-border bg-white text-stv-body hover:bg-slate-50'
          }`}
        >
          Hanya Belum Terisi
        </button>
        <select
          value={filters.domainFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, domainFilter: e.target.value as DomainCode | '' }))
          }
          className="rounded-full border border-stv-border bg-white px-3 py-1 text-xs text-stv-body"
        >
          <option value="">Semua Domain</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d} — {DOMAIN_MAP[d].label}
            </option>
          ))}
        </select>
        {(filters.perluTinjauOnly || filters.belumTerisiOnly || filters.domainFilter) && (
          <button
            onClick={() =>
              setFilters({ perluTinjauOnly: false, domainFilter: '', belumTerisiOnly: false })
            }
            className="text-xs text-stv-muted underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto rounded-xl border border-stv-border bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              {/* sticky domain column header */}
              <th className="sticky left-0 z-10 w-28 border-b border-r border-stv-border bg-white px-3 py-2.5 text-left font-semibold text-stv-navy">
                Domain
              </th>
              {AGE_RANGES.map((ar) => (
                <th
                  key={ar.key}
                  className="border-b border-r border-stv-border px-2 py-2.5 text-center font-semibold text-stv-navy last:border-r-0"
                  style={{ minWidth: 88 }}
                >
                  {ar.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleDomains.map((domain, di) => {
              const dm = DOMAIN_MAP[domain];
              return (
                <tr key={domain} className={di % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {/* Domain label — sticky */}
                  <td
                    className="sticky left-0 z-10 border-r border-stv-border px-3 py-2.5 font-semibold"
                    style={{ backgroundColor: dm.bg, color: dm.fg }}
                  >
                    <span className="block leading-tight">{domain}</span>
                    <span className="block text-[10px] font-normal opacity-80">{dm.label}</span>
                  </td>

                  {AGE_RANGES.map((ar) => {
                    const card = cardIndex[`RL-${ar.key}-${domain}`];
                    if (!card) return <td key={ar.key} className="border-r border-stv-border last:border-r-0" />;

                    const isEmptyBand = EMPTY_BANDS.includes(ar.key as AgeKey);
                    const filled = isCardFilled(card);
                    const freshness = !isEmptyBand && filled ? computeCellFreshness(card) : null;
                    const flags = !isEmptyBand && filled ? getActiveFlags(card.id) : [];

                    // Apply filters
                    if (filters.perluTinjauOnly && freshness !== 'perlu-tinjau') return null;
                    if (filters.belumTerisiOnly && filled) return null;

                    const isSelected = selectedCardId === card.id;
                    const isGrey = isEmptyBand || !filled;

                    return (
                      <td
                        key={ar.key}
                        className="border-r border-stv-border last:border-r-0"
                      >
                        <button
                          onClick={() =>
                            setSelectedCardId(isSelected ? null : card.id)
                          }
                          aria-label={`${card.title} — ${freshness ?? (isGrey ? 'belum terisi' : 'tidak ada tanggal tinjau')}`}
                          className={`flex w-full flex-col items-center gap-1 px-2 py-2 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-stv-sky ${
                            isSelected
                              ? 'bg-stv-badge-navy-tint ring-2 ring-inset ring-stv-sky'
                              : isGrey
                              ? 'cursor-default bg-slate-100 hover:bg-slate-100'
                              : 'hover:bg-stv-badge-navy-tint/60 cursor-pointer'
                          }`}
                          tabIndex={0}
                        >
                          {isGrey ? (
                            <span className="text-[10px] text-stv-muted-2">Belum terisi</span>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                {freshness ? (
                                  <FreshnessDot
                                    freshness={freshness}
                                    tooltip={`Freshness: ${freshness}`}
                                  />
                                ) : (
                                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" title="Tanggal tinjau tidak tersedia" />
                                )}
                                {filled ? (
                                  <CheckCircle className="h-3 w-3 text-stv-navy/60" aria-label="Terisi" />
                                ) : (
                                  <Square className="h-3 w-3 text-slate-300" aria-label="Belum terisi" />
                                )}
                                {flags.length > 0 && (
                                  <span
                                    className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                                    title={`${flags.length} flag aktif`}
                                  >
                                    {flags.length}
                                  </span>
                                )}
                              </div>
                              <span className="line-clamp-1 max-w-[80px] text-[9px] text-stv-muted leading-tight">
                                {card.id}
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-stv-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Segar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Menua
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Perlu tinjau
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-stv-navy/60" />
          Detail ilmiah terisi
        </span>
        <span className="flex items-center gap-1.5">
          <Flag className="h-3 w-3 text-red-500" />
          Ada flag aktif
        </span>
      </div>
    </div>
  );
}
