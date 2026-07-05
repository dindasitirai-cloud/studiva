import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES } from './knowledgeCardData';

function useReducedMotion() {
  const [r] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return r;
}

// ── Keyword extractor for yellow highlight ───────────────────────────────────

function splitTitle(raw: string): { pre: string; keyword: string; post: string } {
  // Strip parentheses content for cleanliness
  const title = raw.replace(/\s*\(.*?\)/g, '').trim();

  // If colon present, highlight the first word after it
  const colonIdx = title.indexOf(':');
  if (colonIdx !== -1) {
    const after = title.slice(colonIdx + 1).trim();
    const words = after.split(/\s+/);
    return {
      pre:     title.slice(0, colonIdx + 1).trim(),   // "Tummy time:"
      keyword: words[0] ?? '',                          // "menegakkan"
      post:    words.slice(1).join(' '),                // "kepala"
    };
  }

  // No colon: highlight the most distinctive word
  // Prefer a word after "&" or the last meaningful word
  const ampIdx = title.indexOf('&');
  if (ampIdx !== -1) {
    const before  = title.slice(0, ampIdx).trim();
    const afterAmp = title.slice(ampIdx + 1).trim();
    const words    = afterAmp.split(/\s+/);
    return { pre: before + ' &', keyword: words[0] ?? '', post: words.slice(1).join(' ') };
  }

  // Fallback: last word
  const words = title.split(/\s+/);
  return {
    pre:     words.slice(0, -1).join(' '),
    keyword: words[words.length - 1] ?? '',
    post:    '',
  };
}

// ── Book cover — typographic, ALL CAPS, yellow keyword highlight ─────────────

export function CoverImage({ card }: { card: KnowledgeCard }) {
  const domain = DOMAIN_MAP[card.domain];
  const age    = AGE_RANGES.find(a => a.key === card.ageKey);
  const { pre, keyword, post } = splitTitle(card.title);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '5px 14px 14px 5px',
      overflow: 'hidden',
      background: domain.bg,
    }}>
      {/* Spine */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 12,
        background: `${domain.fg}33`, zIndex: 2,
      }} />

      {/* Decorative background motif — circles only, no icon */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-18%',
        width: '70%', height: '70%', borderRadius: '50%',
        background: `${domain.fg}14`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', left: '-20%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: `${domain.fg}0E`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '8%',
        width: '38%', height: '38%', borderRadius: '50%',
        background: `${domain.fg}10`, pointerEvents: 'none',
      }} />

      {/* Small header: domain, then age below */}
      <div style={{
        position: 'absolute', top: 14, left: 20, right: 14,
        zIndex: 3,
      }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: `${domain.fg}BB`, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          {domain.label}
        </p>
        {age && (
          <p style={{ fontSize: 9, fontWeight: 700, color: `${domain.fg}88`, letterSpacing: '0.04em', margin: '2px 0 0' }}>
            {age.label}
          </p>
        )}
      </div>

      {/* Main title — ALL CAPS, typographic, centered */}
      <div style={{
        position: 'absolute', top: '18%', bottom: '18%',
        left: 20, right: 14,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        zIndex: 3,
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(16px, 4.5cqi, 28px)',
          lineHeight: 1.15,
          color: domain.fg,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          wordBreak: 'break-word',
        }}>
          {pre && <>{pre}<br /></>}
          {/* Yellow highlight on keyword */}
          {keyword && (
            <span style={{ position: 'relative', display: 'inline' }}>
              <span style={{
                position: 'absolute',
                left: -2, right: -2,
                bottom: 1,
                height: '35%',
                background: '#FBD00A',
                borderRadius: 4,
                zIndex: -1,
              }} />
              {keyword}
            </span>
          )}
          {post && <><br />{post}</>}
        </p>
      </div>

      {/* Bottom thin accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 12, right: 0, height: 3,
        background: `${domain.fg}44`, zIndex: 4,
      }} />
    </div>
  );
}

// ── Carousel ─────────────────────────────────────────────────────────────────

interface BookCarouselProps {
  cards: KnowledgeCard[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (card: KnowledgeCard) => void;
  onBack: () => void;
}

export default function BookCarousel({ cards, selectedId, onSelect, onOpen, onBack }: BookCarouselProps) {
  const reduced = useReducedMotion();
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const centerIdx = Math.max(0, cards.findIndex(c => c.id === selectedId));
  const selected  = cards[centerIdx] ?? cards[0];

  function shiftLeft()  { if (centerIdx > 0) onSelect(cards[centerIdx - 1].id); }
  function shiftRight() { if (centerIdx < cards.length - 1) onSelect(cards[centerIdx + 1].id); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') shiftLeft();
      else if (e.key === 'ArrowRight') shiftRight();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onPointerDown(e: React.PointerEvent) {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isDragging.current = false;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const dx = Math.abs(e.clientX - pointerStartX.current);
    const dy = Math.abs(e.clientY - (pointerStartY.current ?? e.clientY));
    if (dx > 6 || dy > 6) isDragging.current = true;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    if (isDragging.current && Math.abs(delta) > 40) {
      if (delta > 0) shiftLeft(); else shiftRight();
    }
    pointerStartX.current = null;
    isDragging.current = false;
  }

  const ageRange = AGE_RANGES.find(a => a.key === selected?.ageKey);

  // Layout: book = 72% of container, margin 14% each side, step = 72%
  const BOOK_W = 72;
  const MARGIN = (100 - BOOK_W) / 2; // 14
  const STEP   = BOOK_W;             // 72% → ~14% peek each side

  const TRANSITION = reduced ? 'none' : 'transform 0.45s cubic-bezier(.34,1.04,.64,1), opacity 0.35s ease';

  return (
    <div className="flex flex-col gap-5 font-nunito-sans">
      {/* Back */}
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-stv-muted transition hover:text-stv-navy">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        Semua buku
      </button>

      {/* Carousel wrapper — same max-width as BookReader outer (760px) */}
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div
          style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-label="Carousel buku"
        >
          {/* Height spacer */}
          <div style={{ paddingBottom: `${1.30 * BOOK_W}%`, pointerEvents: 'none' }} />

          {cards.map((card, i) => {
            const offset   = i - centerIdx;
            const isCenter = offset === 0;
            const visible  = Math.abs(offset) <= 1;
            const opacity  = isCenter ? 1 : visible ? 0.62 : 0;
            const scale    = isCenter ? 1 : 0.96;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (!isDragging.current) {
                    if (isCenter) onOpen(card); else onSelect(card.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  left: `${MARGIN}%`,
                  width: `${BOOK_W}%`,
                  transform: `translateX(${offset * STEP}%) scale(${scale})`,
                  transformOrigin: 'center center',
                  opacity,
                  transition: TRANSITION,
                  cursor: isCenter ? 'pointer' : 'pointer',
                  boxShadow: isCenter ? '8px 8px 32px rgba(0,0,0,.18)' : '3px 3px 10px rgba(0,0,0,.10)',
                  pointerEvents: visible ? 'auto' : 'none',
                  zIndex: isCenter ? 10 : 5,
                  borderRadius: '5px 14px 14px 5px',
                }}
              >
                <CoverImage card={card} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected book info */}
      {selected && (
        <div className="text-center">
          <p className="font-baloo text-[20px] font-extrabold text-stv-navy">{selected.title}</p>
          <p className="mt-0.5 text-[13px] text-stv-muted">{DOMAIN_MAP[selected.domain].label}</p>
          {ageRange && (
            <span className="mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-bold"
              style={{ background: ageRange.fill, color: ageRange.ink }}>
              {ageRange.label}
            </span>
          )}
        </div>
      )}

      {/* Open + dots */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => selected && onOpen(selected)}
          className="rounded-full bg-amber-500 px-8 py-3 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600"
        >
          Buka buku ini
        </button>
        <div className="flex gap-1.5">
          {cards.map((c, i) => (
            <button key={c.id} type="button" aria-label={`Buku ${i + 1}`} onClick={() => onSelect(c.id)}
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: i === centerIdx ? 20 : 8, background: i === centerIdx ? '#103A6B' : '#D1D9E6' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
