import React from 'react';
import { Freshness, FRESHNESS_META } from '../../../lib/contentFreshness';

interface FreshnessBadgeProps {
  freshness: Freshness;
  tooltip?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function FreshnessBadge({
  freshness,
  tooltip,
  size = 'md',
  showLabel = true,
}: FreshnessBadgeProps) {
  const meta = FRESHNESS_META[freshness];
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <span
      title={tooltip ?? meta.label}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1 ring-inset
        ${meta.bgClass} ${meta.textClass} ${meta.borderClass} ${textSize}`}
    >
      <span className={`${dotSize} shrink-0 rounded-full ${meta.dotClass}`} aria-hidden="true" />
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}

interface FreshnessDotProps {
  freshness: Freshness | null;
  tooltip?: string;
}

/** Just a coloured dot — used inside grid cells where space is tight. */
export function FreshnessDot({ freshness, tooltip }: FreshnessDotProps) {
  if (!freshness) return null;
  const meta = FRESHNESS_META[freshness];
  return (
    <span
      title={tooltip ?? meta.label}
      aria-label={meta.label}
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`}
    />
  );
}
