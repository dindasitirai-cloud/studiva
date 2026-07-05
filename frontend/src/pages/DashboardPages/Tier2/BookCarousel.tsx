import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES } from './knowledgeCardData';

function useReducedMotion() {
  const [reduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return reduced;
}

interface BookCarouselProps {
  cards: KnowledgeCard[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (card: KnowledgeCard) => void;
  onBack: () => void;
}

function CoverMini({ card, scale, opacity, onClick, zIndex, translateX, reducedMotion }: {
  card: KnowledgeCard; scale: number; opacity: number; onClick: () => void;
  zIndex: number; translateX: number; reducedMotion: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const domain = DOMAIN_MAP[card.domain];
  const Icon = domain.icon;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 160,
        height: 213,
        marginLeft: -80,
        marginTop: -106,
        transform: reducedMotion
          ? `translateX(${translateX}px) scale(${scale})`
          : `translateX(${translateX}px) translateY(-50%) translateY(106px) scale(${scale})`,
        opacity,
        zIndex,
        cursor: 'pointer',
        transition: reducedMotion ? 'none' : 'transform 0.42s ease, opacity 0.42s ease',
        borderRadius: '5px 11px 11px 5px',
        boxShadow: scale > 1 ? '6px 6px 20px rgba(0,0,0,.25)' : '3px 3px 10px rgba(0,0,0,.15)',
        overflow: 'hidden',
      }}
    >
      {/* Spine */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: 'rgba(0,0,0,0.28)', zIndex: 2 }} />
      {/* Image or fallback */}
      {!imgErr && card.photo.src ? (
        <img src={card.photo.src} alt={card.photo.alt} onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: domain.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 40, height: 40, color: domain.fg, opacity: 0.3 }} strokeWidth={1.5} />
        </div>
      )}
      {/* Title */}
      <div style={{
        position: 'absolute', bottom: 0, left: 10, right: 0, padding: '6px 8px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
        zIndex: 3,
      }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 700, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.title}
        </p>
      </div>
    </div>
  );
}

export default function BookCarousel({ cards, selectedId, onSelect, onOpen, onBack }: BookCarouselProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);

  const centerIdx = cards.findIndex(c => c.id === selectedId);
  const selected = cards[centerIdx] ?? cards[0];

  function shiftLeft() {
    if (centerIdx > 0) onSelect(cards[centerIdx - 1].id);
  }
  function shiftRight() {
    if (centerIdx < cards.length - 1) onSelect(cards[centerIdx + 1].id);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') shiftLeft();
      else if (e.key === 'ArrowRight') shiftRight();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Touch/pointer swipe
  function onPointerDown(e: React.PointerEvent) { pointerStartX.current = e.clientX; }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    if (delta > 40) shiftLeft();
    else if (delta < -40) shiftRight();
    pointerStartX.current = null;
  }

  const OFFSETS: Record<number, { scale: number; opacity: number; tx: number }> = {
    "-2": { scale: 0.62, opacity: 0.15, tx: -268 },
    "-1": { scale: 0.82, opacity: 0.55, tx: -155 },
    "0":  { scale: 1.08, opacity: 1,    tx: 0    },
    "1":  { scale: 0.82, opacity: 0.55, tx: 155  },
    "2":  { scale: 0.62, opacity: 0.15, tx: 268  },
  };

  return (
    <div className="flex flex-col gap-6 font-nunito-sans">
      {/* Back */}
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-stv-muted transition hover:text-stv-navy">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        Semua buku
      </button>

      {/* Carousel area */}
      <div
        ref={containerRef}
        style={{ position: 'relative', height: 300, overflow: 'hidden', userSelect: 'none' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label="Carousel buku"
      >
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Sebelumnya"
          onClick={shiftLeft}
          disabled={centerIdx === 0}
          className="absolute left-0 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-stv-navy" strokeWidth={2} />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Berikutnya"
          onClick={shiftRight}
          disabled={centerIdx === cards.length - 1}
          className="absolute right-0 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5 text-stv-navy" strokeWidth={2} />
        </button>

        {/* Book covers */}
        {cards.map((card, i) => {
          const offset = Math.max(-2, Math.min(2, i - centerIdx));
          const cfg = OFFSETS[offset] ?? { scale: 0, opacity: 0, tx: offset < 0 ? -400 : 400 };
          return (
            <CoverMini
              key={card.id}
              card={card}
              scale={cfg.scale}
              opacity={cfg.opacity}
              translateX={cfg.tx}
              zIndex={offset === 0 ? 10 : Math.abs(offset) === 1 ? 5 : 1}
              reducedMotion={reducedMotion}
              onClick={() => offset !== 0 ? onSelect(card.id) : onOpen(card)}
            />
          );
        })}
      </div>

      {/* Selected book info */}
      {selected && (
        <div className="text-center">
          <p className="font-baloo text-[20px] font-extrabold text-stv-navy">{selected.title}</p>
          <p className="mt-1 text-[13px] text-stv-muted">{DOMAIN_MAP[selected.domain].label}</p>
          {AGE_RANGES.find(a => a.key === selected.ageKey) && (
            <span
              className="mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-bold"
              style={{ background: AGE_RANGES.find(a => a.key === selected.ageKey)!.fill,
                       color: AGE_RANGES.find(a => a.key === selected.ageKey)!.ink }}
            >
              {AGE_RANGES.find(a => a.key === selected.ageKey)!.label}
            </span>
          )}
        </div>
      )}

      {/* Open button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => selected && onOpen(selected)}
          className="rounded-full bg-amber-500 px-8 py-3 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600"
        >
          Buka buku ini
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Buka buku ${i + 1}`}
            onClick={() => onSelect(c.id)}
            className="h-2 rounded-full transition-all"
            style={{ width: i === centerIdx ? 20 : 8, background: i === centerIdx ? '#103A6B' : '#D1D9E6' }}
          />
        ))}
      </div>
    </div>
  );
}
