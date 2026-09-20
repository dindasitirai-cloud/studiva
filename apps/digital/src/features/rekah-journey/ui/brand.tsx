// Rekah Journey — brand UI primitives (Phase 10C-3). Built from the EXISTING "Langit Peony"
// Tailwind tokens (rekah/kanvas/pekat/langit/ungu/kuning/rose-soft/fajar + fredoka/nunito/shantell).
// Reuses LogoRekah + BotanicalStem. Reduced-motion is handled globally in styles/index.css.
import React from 'react';
import BotanicalStem from '../../../components/BotanicalStem';
import ExistingCard from '../../../components/Card';
import type { BotanicalConfig } from '../../../components/BotanicalStem';

type BtnVariant = 'primary' | 'secondary' | 'ghost';
export function Btn({ variant = 'primary', full, className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; full?: boolean }) {
  const base = 'inline-flex items-center justify-center font-nunito font-extrabold min-h-[48px] rounded-[26px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-langit disabled:opacity-50';
  const v = variant === 'primary'
    ? 'bg-rekah text-white px-6 py-3 shadow-[0_10px_20px_-10px_rgba(240,107,168,0.8)] hover:bg-rekah-tua'
    : variant === 'secondary'
    ? 'bg-transparent border-2 border-rekah text-rekah px-6 py-3 hover:bg-fajar'
    : 'text-[#5F84E6] hover:text-rekah underline underline-offset-4 min-h-[44px]';
  return <button {...p} className={`${base} ${v} ${full ? 'w-full' : ''} ${className}`} />;
}

// REUSE the existing Rekah Card component (no duplicate card system). Journey cards look like the rest of the dashboard.
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <ExistingCard className={className}>{children}</ExistingCard>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-shantell font-bold text-rekah text-lg">{children}</p>;
}

/** Provenance shown by LABEL + SHAPE (solid vs dashed) — never color alone. */
export function ProvenanceTag({ provenance }: { provenance: 'PARENT' | 'SYSTEM_SUGGESTED' | 'SYSTEM_DERIVED' }) {
  const parent = provenance === 'PARENT';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-nunito font-bold ${parent ? 'bg-rekah text-white' : 'border-2 border-dashed border-ungu text-pekat bg-white'}`}>
      <span aria-hidden>{parent ? '●' : '✦'}</span>
      {parent ? 'Pilihanmu' : 'Sebuah ide lembut'}
    </span>
  );
}

export function Botanical({ type = 'daisy', size = 72, className = '', sway = true, bloom, bloom2 }: { type?: BotanicalConfig['type']; size?: number; className?: string; sway?: boolean; bloom?: string; bloom2?: string }) {
  return (
    <div aria-hidden className={`${sway ? 'animate-sway' : ''} ${className}`} style={{ width: size, height: size * 1.5 }}>
      <BotanicalStem cfg={{ type, bloom, bloom2 }} />
    </div>
  );
}

/** Honest empty / rest state with a calm botanical companion. */
export function EmptyState({ title, body, cta, onCta, secondary, onSecondary, botanical = 'sprig' }: { title: string; body?: string; cta?: string; onCta?: () => void; secondary?: string; onSecondary?: () => void; botanical?: BotanicalConfig['type'] }) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <Botanical type={botanical} size={84} className="mb-4" />
      <h1 className="font-fredoka font-bold text-xl text-pekat">{title}</h1>
      {body && <p className="mt-2 font-nunito text-pekat/75 max-w-xs">{body}</p>}
      {cta && <Btn className="mt-6" full onClick={onCta}>{cta}</Btn>}
      {secondary && <Btn variant="ghost" className="mt-2" onClick={onSecondary}>{secondary}</Btn>}
    </div>
  );
}

/** EMBEDDED content region — renders INSIDE the existing DashboardShellTier2 (which already provides the
 *  Rekah header, sidebar, bottom nav, cream background, and active-child gating). It adds NO second shell. */
export function JourneyShell({ children, eyebrow, child, botanical }: { children?: React.ReactNode; eyebrow?: string; child?: string; botanical?: BotanicalConfig['type'] }) {
  return (
    <section className="relative mx-auto w-full max-w-md py-4" aria-live="polite">
      {botanical && <div className="pointer-events-none absolute -right-2 -top-2 opacity-40"><Botanical type={botanical} size={96} /></div>}
      {(eyebrow || child) && (
        <div className="mb-1">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          {child && <p className="font-nunito text-sm text-pekat/70">Hari ini bersama <b className="text-pekat">{child}</b></p>}
        </div>
      )}
      {children}
    </section>
  );
}
