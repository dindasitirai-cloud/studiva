import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES } from './knowledgeCardData';

function useReducedMotion() {
  const [r] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return r;
}

interface BookCarouselProps {
  cards: KnowledgeCard[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (card: KnowledgeCard) => void;
  onBack: () => void;
}

function CoverCard({ card }: { card: KnowledgeCard }) {
  const [imgErr, setImgErr] = useState(false);
  const domain = DOMAIN_MAP[card.domain];
  const Icon = domain.icon;
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: '5px 14px 14px 5px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'rgba(0,0,0,0.3)', zIndex: 2 }} />
      {!imgErr && card.photo.src ? (
        <img src={card.photo.src} alt={card.photo.alt} onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: domain.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 72, height: 72, color: domain.fg, opacity: 0.25 }} strokeWidth={1.5} />
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 14, right: 0, padding: '20px 14px', background: 'linear-gradient(to top, rgba(0,0,0,0.78), transparent)', zIndex: 3 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 600, marginBottom: 3 }}>{domain.label}</p>
        <p style={{ fontSize: 18, color: 'white', fontWeight: 800, lineHeight: 1.3, fontFamily: "'Baloo 2', sans-serif" }}>{card.title}</p>
      </div>
    </div>
  );
}

export default function BookCarousel({ cards, selectedId, onSelect, onOpen, onBack }: BookCarouselProps) {
  const reduced = useReducedMotion();
  const pointerStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const centerIdx = Math.max(0, cards.findIndex(c => c.id === selectedId));
  const selected = cards[centerIdx] ?? cards[0];

  function shiftLeft() { if (centerIdx > 0) onSelect(cards[centerIdx - 1].id); }
  function shiftRight() { if (centerIdx < cards.length - 1) onSelect(cards[centerIdx + 1].id); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') shiftLeft();
      else if (e.key === 'ArrowRight') shiftRight();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onPointerDown(e: React.PointerEvent) { pointerStartX.current = e.clientX; }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    if (delta > 44) shiftLeft();
    else if (delta < -44) shiftRight();
    pointerStartX.current = null;
  }

  const ageRange = AGE_RANGES.find(a => a.key === selected?.ageKey);

  return (
    <div className="flex flex-col gap-5 font-nunito-sans">
      {/* Back */}
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-stv-muted transition hover:text-stv-navy">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        Semua buku
      </button>

      {/* Carousel — overflow hidden, each book positioned via transform */}
      <div
        ref={containerRef}
        style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label="Carousel buku"
      >
        {/* The track container — full height determined by the book aspect */}
        {/* Each book: 82% width, centered at 9% left, offset by ±92% per step */}
        <div style={{ position: 'relative', paddingBottom: 'calc(130% * 0.82)', pointerEvents: 'none' }} />
        {cards.map((card, i) => {
          const offset = i - centerIdx;
          const isCenter = offset === 0;
          // Only render -1, 0, +1 for perf; others invisible
          const visible = Math.abs(offset) <= 1;
          // translateX: each step = 91% of container (book width 82% + gap ~9%)
          const tx = `calc(${offset * 91}% + ${offset * 8}px)`;
          const opacity = isCenter ? 1 : visible ? 0.55 : 0;
          const scale = isCenter ? 1 : visible ? 0.96 : 0.8;
          return (
            <div
              key={card.id}
              onClick={() => isCenter ? onOpen(card) : onSelect(card.id)}
              style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: '9%', width: '82%',
                transform: `translateX(${tx}) scale(${scale})`,
                transformOrigin: 'center center',
                opacity,
                transition: reduced ? 'none' : 'transform 0.42s ease, opacity 0.42s ease',
                cursor: 'pointer',
                borderRadius: '5px 14px 14px 5px',
                boxShadow: isCenter ? '8px 8px 28px rgba(0,0,0,.24)' : '4px 4px 12px rgba(0,0,0,.14)',
                pointerEvents: 'auto',
                zIndex: isCenter ? 10 : 5,
              }}
            >
              <CoverCard card={card} />
            </div>
          );
        })}
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

      {/* Open + dot indicators */}
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
              className="h-2 rounded-full transition-all"
              style={{ width: i === centerIdx ? 20 : 8, background: i === centerIdx ? '#103A6B' : '#D1D9E6' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
