import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES, getCardContentStatus } from './knowledgeCardData';
import { getBookColors, BEKAL_DOMAIN_TOKENS, DOMAIN_CODE_LABEL } from './bekalDomainTokens';

function useReducedMotion() {
  const [r] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return r;
}

export function splitTitle(raw: string): { pre: string; keyword: string; post: string } {
  const title = raw.replace(/\s*\(.*?\)/g, '').trim();
  const colonIdx = title.indexOf(':');
  if (colonIdx !== -1) {
    const after = title.slice(colonIdx + 1).trim();
    const words = after.split(/\s+/);
    return {
      pre:     title.slice(0, colonIdx + 1).trim(),
      keyword: words[0] ?? '',
      post:    words.slice(1).join(' '),
    };
  }
  const ampIdx = title.indexOf('&');
  if (ampIdx !== -1) {
    const before   = title.slice(0, ampIdx).trim();
    const afterAmp = title.slice(ampIdx + 1).trim();
    const words    = afterAmp.split(/\s+/);
    return { pre: before + ' &', keyword: words[0] ?? '', post: words.slice(1).join(' ') };
  }
  const words = title.split(/\s+/);
  return {
    pre:     words.slice(0, -1).join(' '),
    keyword: words[words.length - 1] ?? '',
    post:    '',
  };
}

function titleNice(raw: string): string {
  const t = raw.replace(/\s*\(.*?\)/g, '').trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

// ── CoverImage — 3D cover FACE only (no 3D transforms; those go in the wrapper) ─

export function CoverImage({ card, minimal }: { card: KnowledgeCard; minimal?: boolean }) {
  const { soft, ink, blob, border, coverLo } = getBookColors(card.domain);
  const domainLabel = DOMAIN_CODE_LABEL[card.domain] ?? DOMAIN_MAP[card.domain]?.label ?? '';
  const ageLabel = AGE_RANGES.find(a => a.key === card.ageKey)?.label ?? card.ageKey;
  const { pre, keyword, post } = splitTitle(card.title);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '3px 16px 16px 3px',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${soft}, ${coverLo})`,
      border: `2px solid ${border}`,
    }}>
      {/* Blob right-bottom */}
      <div style={{ position:'absolute', right:-46, bottom:-52, width:170, height:170, borderRadius:'50%', background:blob, opacity:.5 }} />
      {/* Blob left-top */}
      <div style={{ position:'absolute', left:-30, top:30, width:110, height:110, borderRadius:'50%', background:blob, opacity:.32 }} />

      {/* Cover content */}
      {!minimal && (
        <div style={{ position:'relative', zIndex:1, height:'100%', padding:'20px 20px 20px 24px', display:'flex', flexDirection:'column' }}>
          <div>
            <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:11, letterSpacing:.6, color:ink, textTransform:'uppercase' }}>{domainLabel}</div>
            <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:13, color:'#A98DA0', marginTop:3 }}>{ageLabel}</div>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center' }}>
            <div style={{
              fontFamily:'Fredoka', fontWeight:700, fontSize:28, lineHeight:1.1,
              color:'#6E3B57', textTransform:'uppercase', letterSpacing:-.3,
            }}>
              {pre && <>{pre}<br /></>}
              {keyword && (
                <span style={{ backgroundImage:`linear-gradient(transparent 58%, ${blob} 58%)`, padding:'0 2px' }}>{keyword}</span>
              )}
              {post && <><br />{post}</>}
            </div>
          </div>
        </div>
      )}
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

  function nextNonPlaceholder(from: number, dir: 1 | -1): number {
    let i = from + dir;
    while (i >= 0 && i < cards.length) {
      if (getCardContentStatus(cards[i]) !== 'segera-hadir') return i;
      i += dir;
    }
    return -1;
  }

  function shiftLeft()  {
    const i = nextNonPlaceholder(centerIdx, -1);
    if (i >= 0) onSelect(cards[i].id);
  }
  function shiftRight() {
    const i = nextNonPlaceholder(centerIdx, 1);
    if (i >= 0) onSelect(cards[i].id);
  }

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

  const prevIdx = nextNonPlaceholder(centerIdx, -1);
  const nextIdx = nextNonPlaceholder(centerIdx, 1);

  // Stage: prev / curr / next
  interface StageItem {
    card: KnowledgeCard;
    idx: number;
    transform: string;
    opacity: number;
    z: number;
    blur: string;
    isCurr: boolean;
  }

  const stage: StageItem[] = [];
  if (prevIdx >= 0) stage.push({ card: cards[prevIdx], idx: prevIdx, transform:'translateX(-330px) scale(.82) rotateY(-18deg)', opacity:.5, z:1, blur:'blur(1.2px)', isCurr:false });
  stage.push({ card: selected, idx: centerIdx, transform:'translateX(0) scale(1) rotateY(-13deg)', opacity:1, z:3, blur:'none', isCurr:true });
  if (nextIdx >= 0) stage.push({ card: cards[nextIdx], idx: nextIdx, transform:'translateX(330px) scale(.82) rotateY(-18deg)', opacity:.5, z:1, blur:'blur(1.2px)', isCurr:false });

  const curTokens = getBookColors(selected.domain);
  const { soft, ink } = curTokens;
  const domainLabel = DOMAIN_CODE_LABEL[selected.domain] ?? DOMAIN_MAP[selected.domain]?.label ?? '';
  const ageLabel = AGE_RANGES.find(a => a.key === selected.ageKey)?.label ?? selected.ageKey;

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-stv-muted transition hover:text-stv-navy">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        Semua buku
      </button>

      {/* 3D Coverflow Carousel */}
      <div
        style={{ position:'relative', height:640, touchAction:'pan-y', cursor:'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Carousel buku"
      >
        <div style={{ perspective:1900, position:'relative', height:'100%' }}>
          {stage.map((s) => {
            const c = s.card;
            const ct = getBookColors(c.domain);
            const cLabel = DOMAIN_CODE_LABEL[c.domain] ?? DOMAIN_MAP[c.domain]?.label ?? '';
            const aLabel = AGE_RANGES.find(a => a.key === c.ageKey)?.label ?? c.ageKey;
            const sp = splitTitle(c.title);

            return (
              <div
                key={c.id}
                onClick={() => {
                  if (!isDragging.current) {
                    if (s.isCurr) onOpen(c); else onSelect(c.id);
                  }
                }}
                style={{
                  position:'absolute', top:44, left:'50%', marginLeft:-215,
                  width:430, height:552,
                  transformStyle:'preserve-3d',
                  transform: reduced ? (s.isCurr ? 'none' : '') : s.transform,
                  opacity: s.opacity, zIndex: s.z,
                  filter: s.blur === 'none' ? undefined : s.blur,
                  transition: reduced ? 'none' : 'transform .5s cubic-bezier(.2,.7,.2,1), opacity .4s ease',
                  cursor:'pointer',
                }}
              >
                {/* Ground shadow */}
                <div style={{ position:'absolute', left:'4%', bottom:-34, width:'94%', height:46, background:'rgba(90,50,70,.28)', filter:'blur(18px)', borderRadius:'50%' }} />

                {/* Pages (fore-edge right) */}
                <div style={{ position:'absolute', top:8, right:-16, width:32, height:536, transform:'rotateY(90deg)', background:'repeating-linear-gradient(to bottom,#F7F0E1 0 2px,#DCCBB0 2px 3.4px)', borderRadius:2 }} />

                {/* Spine (left) */}
                <div style={{ position:'absolute', top:0, left:-16, width:32, height:552, transform:'rotateY(90deg)', background:`linear-gradient(90deg,${ct.spineHi},${ct.ink} 32%,${ct.spineDark})`, borderRadius:3 }}>
                  <div style={{ position:'absolute', top:38, left:0, right:0, height:2, background:'rgba(255,255,255,.4)' }} />
                  <div style={{ position:'absolute', bottom:38, left:0, right:0, height:2, background:'rgba(255,255,255,.4)' }} />
                </div>

                {/* Cover face */}
                <div style={{
                  position:'absolute', inset:0, transform:'translateZ(16px)',
                  background:`linear-gradient(135deg,${ct.soft},${ct.coverLo})`,
                  border:`2px solid ${ct.border}`,
                  borderRadius:'3px 20px 20px 3px',
                  overflow:'hidden',
                  boxShadow:'inset 5px 0 0 rgba(0,0,0,.06), 0 34px 54px -30px rgba(90,50,70,.62)',
                }}>
                  {/* Blobs */}
                  <div style={{ position:'absolute', right:-60, bottom:-80, width:300, height:300, borderRadius:'50%', background:ct.blob, opacity:.5 }} />
                  <div style={{ position:'absolute', left:-40, top:44, width:150, height:150, borderRadius:'50%', background:ct.blob, opacity:.32 }} />

                  {/* Cover content */}
                  <div style={{ position:'relative', zIndex:1, height:'100%', padding:'34px 34px 34px 40px', display:'flex', flexDirection:'column' }}>
                    <div>
                      <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:12, letterSpacing:.8, color:ct.ink, textTransform:'uppercase' }}>{cLabel}</div>
                      <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#A98DA0', marginTop:4 }}>{aLabel}</div>
                    </div>
                    <div style={{ flex:1, display:'flex', alignItems:'center' }}>
                      <div style={{ fontFamily:'Fredoka', fontWeight:700, fontSize:40, lineHeight:1.05, color:'#6E3B57', textTransform:'uppercase', letterSpacing:-.5 }}>
                        {sp.pre && <>{sp.pre}<br /></>}
                        {sp.keyword && (
                          <span style={{ backgroundImage:`linear-gradient(transparent 58%, ${ct.blob} 58%)`, padding:'0 2px' }}>{sp.keyword}</span>
                        )}
                        {sp.post && <><br />{sp.post}</>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected book info */}
      {selected && (
        <div style={{ textAlign:'center', marginTop:8 }}>
          <div style={{ fontFamily:'Fredoka', fontWeight:700, fontSize:27, color:'#6E3B57', textTransform:'capitalize' }}>{titleNice(selected.title)}</div>
          <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:14, textTransform:'uppercase', letterSpacing:.8, color:ink, marginTop:4 }}>{domainLabel}</div>
          <span style={{ display:'inline-block', marginTop:8, background:soft, color:ink, borderRadius:999, padding:'5px 14px', fontFamily:'Nunito', fontWeight:700, fontSize:13 }}>{ageLabel}</span>
        </div>
      )}

      {/* Open + dots */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, marginTop:4 }}>
        {selected && getCardContentStatus(selected) === 'segera-hadir' ? (
          <span style={{ borderRadius:999, background:'#E5E7EB', padding:'18px 46px', fontFamily:'Nunito', fontWeight:800, fontSize:18, color:'#9CA3AF', cursor:'default', userSelect:'none' }}>
            Segera hadir
          </span>
        ) : (
          <button
            type="button"
            onClick={() => selected && onOpen(selected)}
            style={{
              borderRadius:999, background:'#E0A21F', color:'white', border:'none',
              padding:'18px 46px', fontFamily:'Nunito', fontWeight:800, fontSize:18,
              boxShadow:'0 16px 30px -14px rgba(224,162,31,.9)',
              cursor:'pointer', transition:'transform .18s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
          >
            Buka buku ini
          </button>
        )}
        {/* Dot pagination */}
        <div style={{ display:'flex', gap:6 }}>
          {cards.map((c, i) => {
            const active = i === centerIdx;
            const dotInk = active ? BEKAL_DOMAIN_TOKENS[selected.domain]?.ink ?? '#E0A21F' : '#E6D6C2';
            return (
              <button key={c.id} type="button" aria-label={`Buku ${i + 1}`} onClick={() => onSelect(c.id)}
                style={{
                  height:9, borderRadius:999, border:'none', cursor:'pointer',
                  width: active ? 26 : 9,
                  background: dotInk,
                  transition:'width .3s ease, background .3s ease',
                  padding:0,
                }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
