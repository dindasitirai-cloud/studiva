import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CoverImage } from './BookCarousel';
import { KnowledgeCard, DOMAIN_MAP } from './knowledgeCardData';
import AudioPlayerWidget from './AudioPlayerWidget';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { composeScientific } from '../../../lib/composeScientific';
import { getBookColors, DOMAIN_CODE_LABEL } from './bekalDomainTokens';
import { SCI_DATA } from './scienceDetailData';

function useReducedMotion() {
  const [r] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return r;
}

interface BookReaderProps {
  card: KnowledgeCard;
  isRead: boolean;
  onToggleRead: () => void;
  onClose: () => void;
  prevCard?: KnowledgeCard | null;
  nextCard?: KnowledgeCard | null;
  onNavigate?: (card: KnowledgeCard) => void;
  onNavigateInReader?: (card: KnowledgeCard) => void;
  /** When true, stay on the cover — don't auto-advance to summary (used by admin preview) */
  noAutoAdvance?: boolean;
}

export default function BookReader({ card, isRead, onToggleRead, onClose, prevCard, nextCard, onNavigate, onNavigateInReader, noAutoAdvance }: BookReaderProps) {
  const reduced = useReducedMotion();
  const [page, setPage] = useState<'cover' | 'summary' | 'scientific'>('cover');
  const { segments, setCurrentIndex, registerNavigate } = useAudioPlayer();
  const [imgErr, setImgErr] = useState(false);
  const domain = DOMAIN_MAP[card.domain];
  const DomainIcon = domain.icon;
  const sci = composeScientific(card);
  const hasSections = (sci.sections?.length ?? 0) > 0;
  const hasParagraphs = (sci.paragraphs?.length ?? 0) > 0;
  const hasScientific = hasSections || hasParagraphs;

  // Open to summary after mounting (cover → summary), unless caller wants to start on cover
  useEffect(() => {
    if (noAutoAdvance) return;
    const t = setTimeout(() => setPage('summary'), reduced ? 10 : 80);
    return () => clearTimeout(t);
  }, [card.id, reduced, noAutoAdvance]);

  // Sync audio player
  useEffect(() => {
    registerNavigate(() => {});
  }, [registerNavigate]);
  useEffect(() => {
    if (!segments.length) return;
    const part = page === 'scientific' ? 'scientific' : 'summary';
    const idx = segments.findIndex(s => s.cardId === card.id && s.part === part);
    if (idx !== -1) setCurrentIndex(idx);
  }, [page, card.id, segments, setCurrentIndex]);

  const transition = reduced ? 'none' : 'transform 0.95s cubic-bezier(.4,0,.2,1)';
  const coverRotate = page !== 'cover' ? 'rotateY(-170deg)' : 'rotateY(0deg)';

  // Navigate within reader — stay in reader, remount with new card
  function navigateTo(target: KnowledgeCard) {
    if (onNavigateInReader) {
      onNavigateInReader(target);
    } else {
      if (onNavigate) onNavigate(target);
      onClose();
    }
  }

  // ── Token helpers ──
  const curTokens  = getBookColors(card.domain);
  const prevTokens = prevCard ? getBookColors(prevCard.domain) : null;
  const nextTokens = nextCard ? getBookColors(nextCard.domain) : null;


  // ── Render ──
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ animation: reduced ? 'none' : 'readerFadeIn 0.32s ease-out both' }}
    >
      <style>{`@keyframes readerFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* ── SUMMARY PAGE — new full-width reading layout ── */}
      {page === 'summary' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
          <div style={{ maxWidth:1160, margin:'0 auto' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ display:'inline-flex', alignItems:'center', gap:9, fontFamily:'Nunito', fontWeight:800, fontSize:15, color:'#6E3B57', background:'none', border:'none', cursor:'pointer', marginBottom:12 }}
            >
              <span style={{ fontSize:17, lineHeight:1 }}>‹</span> Rak buku
            </button>
            <div style={{ position:'relative', minHeight:966, padding:'12px 0' }}>
              <div style={{ display:'flex', alignItems:'stretch', justifyContent:'center' }}>

                {/* Left neighbor */}
                {prevCard && prevTokens && (
                  <div style={{
                    width:196, margin:'24px -86px 24px 0',
                    borderRadius:24, background:prevTokens.soft,
                    border:`2px solid ${prevTokens.border}`,
                    position:'relative', overflow:'hidden', zIndex:1,
                    boxShadow:'0 20px 34px -26px rgba(90,50,70,.5)',
                    flexShrink:0, cursor:'pointer',
                  }}
                    onClick={() => navigateTo(prevCard)}
                  >
                    <div style={{ position:'absolute', right:-46, bottom:-52, width:170, height:170, borderRadius:'50%', background:prevTokens.blob, opacity:.5 }} />
                    <div style={{ position:'relative', padding:'24px 22px', fontFamily:'Nunito', fontWeight:800, fontSize:12, letterSpacing:.6, color:prevTokens.ink, textTransform:'uppercase' }}>
                      {DOMAIN_CODE_LABEL[prevCard.domain]}
                      <div style={{ fontWeight:700, color:'#A98DA0', marginTop:5, textTransform:'none' }}>{prevCard.ageKey}</div>
                    </div>
                  </div>
                )}

                {/* Reading pane */}
                <div style={{
                  width:694, background:'#fff', borderRadius:28,
                  boxShadow:'0 34px 64px -42px rgba(90,50,70,.6)',
                  overflowY:'auto', zIndex:3,
                  padding:'32px 38px 38px',
                  flexShrink:0,
                }}>

                  {/* Age + domain chips row */}
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <span style={{
                      fontFamily:'Nunito', fontWeight:800, fontSize:13,
                      color:curTokens.ink, background:curTokens.soft,
                      padding:'6px 14px', borderRadius:999,
                    }}>{card.ageKey}</span>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:7,
                      fontFamily:'Nunito', fontWeight:800, fontSize:13,
                      color:curTokens.ink, background:'#fff',
                      border:`1.5px solid ${curTokens.soft}`,
                      padding:'5px 13px', borderRadius:999,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {(curTokens.iconPaths ?? []).map((d, idx) => <path key={idx} d={d} />)}
                      </svg>
                      {DOMAIN_CODE_LABEL[card.domain]}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 style={{
                    fontFamily:'Fredoka', fontWeight:700, fontSize:31, lineHeight:1.1,
                    color:'#6E3B57', margin:'16px 0 0', letterSpacing:-.3,
                  }}>{card.title}</h1>

                  {/* Read minutes */}
                  <div style={{ display:'flex', gap:8, marginTop:12, fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#A98DA0', alignItems:'center' }}>
                    <Clock className="h-4 w-4" strokeWidth={2} />
                    {card.readMinutes} menit baca
                  </div>

                  {/* Audio summary bar */}
                  <div style={{ marginTop:20 }}>
                    <AudioPlayerWidget />
                  </div>

                  {card.isMedical && (
                    <div style={{ marginTop:16, background:'#FFF6E0', border:'1.5px solid #FADFA4', borderRadius:14, padding:'12px 16px', fontFamily:'Nunito', fontWeight:600, fontSize:13, color:'#B07D1B' }}>
                      Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional.
                    </div>
                  )}

                  {/* Info card */}
                  <div style={{ marginTop:20, background:'#F8F3EA', borderRadius:20, padding:'24px 26px', display:'flex', flexDirection:'column', gap:22 }}>
                    {/* Yang biasa terjadi */}
                    <div>
                      <div style={{ display:'inline-block', fontFamily:'Nunito', fontWeight:800, fontSize:12.5, color:'#B07D1B', background:'#F6E6C4', padding:'5px 12px', borderRadius:999 }}>Yang biasa terjadi di usia ini</div>
                      <p style={{ fontFamily:'Nunito', fontWeight:600, fontSize:16, lineHeight:1.55, color:'#5C4A56', margin:'12px 0 0' }}>{card.summary?.terjadi}</p>
                    </div>
                    {/* Kenapa penting */}
                    <div>
                      <div style={{ display:'inline-block', fontFamily:'Nunito', fontWeight:800, fontSize:12.5, color:'#5E8A34', background:'#E4F0D3', padding:'5px 12px', borderRadius:999 }}>Kenapa penting</div>
                      <p style={{ fontFamily:'Nunito', fontWeight:600, fontSize:16, lineHeight:1.55, color:'#5C4A56', margin:'12px 0 0' }}>{card.summary?.penting}</p>
                    </div>
                    {/* Yang bisa dilakukan */}
                    <div>
                      <div style={{ display:'inline-block', fontFamily:'Nunito', fontWeight:800, fontSize:12.5, color:'#4A72D6', background:'#DEEAFB', padding:'5px 12px', borderRadius:999 }}>Yang bisa Anda lakukan</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:11, marginTop:14 }}>
                        {(card.summary?.lakukan ?? []).map((text, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                            <span style={{
                              flexShrink:0, width:24, height:24, borderRadius:'50%',
                              background:'#DEEAFB', color:'#4A72D6',
                              fontFamily:'Nunito', fontWeight:800, fontSize:13,
                              display:'flex', alignItems:'center', justifyContent:'center',
                            }}>{i + 1}</span>
                            <span style={{ fontFamily:'Nunito', fontWeight:600, fontSize:16, lineHeight:1.5, color:'#5C4A56' }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alert */}
                  <div style={{ marginTop:20, background:'#FDECEF', border:'1.5px solid #F4C6D0', borderRadius:18, padding:'18px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Nunito', fontWeight:800, fontSize:15, color:'#C0435F' }}>
                      <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                      Perlu perhatian bila
                    </div>
                    <p style={{ fontFamily:'Nunito', fontWeight:600, fontSize:15.5, lineHeight:1.5, color:'#B4566B', margin:'9px 0 0' }}>{card.summary?.perhatian}</p>
                  </div>

                  {/* Sources */}
                  {card.sources.length > 0 && (
                    <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:9, fontFamily:'Nunito', fontWeight:600, fontSize:13.5, color:'#A98DA0' }}>
                      <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2} />
                      <span><strong>Sumber:</strong> {card.sources.join(' · ')}</span>
                    </div>
                  )}

                  {/* CTA to scientific */}
                  {hasScientific && (
                    <div
                      onClick={() => setPage('scientific')}
                      style={{ marginTop:22, background:'#FFF3D9', border:'1.5px solid #FFE29A', borderRadius:16, padding:16, textAlign:'center', fontFamily:'Nunito', fontWeight:800, fontSize:15, color:'#B07D1B', cursor:'pointer' }}
                    >
                      Lanjut ke detail ilmiah →
                    </div>
                  )}

                  {/* Tandai Sudah Dibaca */}
                  <button
                    type="button"
                    onClick={onToggleRead}
                    aria-label={isRead ? 'Sudah dibaca' : 'Tandai sudah dibaca'}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-bold transition ${
                      isRead
                        ? 'border-stv-green bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
                        : 'border-stv-border bg-white text-stv-muted hover:border-stv-green hover:text-stv-green'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                    {isRead ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
                  </button>
                </div>

                {/* Right neighbor */}
                {nextCard && nextTokens && (
                  <div style={{
                    width:196, margin:'24px 0 24px -86px',
                    borderRadius:24, background:nextTokens.soft,
                    border:`2px solid ${nextTokens.border}`,
                    position:'relative', overflow:'hidden', zIndex:1,
                    boxShadow:'0 20px 34px -26px rgba(90,50,70,.5)',
                    flexShrink:0, cursor:'pointer',
                  }}
                    onClick={() => navigateTo(nextCard)}
                  >
                    <div style={{ position:'absolute', left:-46, bottom:-52, width:170, height:170, borderRadius:'50%', background:nextTokens.blob, opacity:.5 }} />
                    <div style={{ position:'relative', padding:'24px 22px 24px 40px', textAlign:'right', fontFamily:'Nunito', fontWeight:800, fontSize:12, letterSpacing:.6, color:nextTokens.ink, textTransform:'uppercase' }}>
                      {DOMAIN_CODE_LABEL[nextCard.domain]}
                      <div style={{ fontWeight:700, color:'#A98DA0', marginTop:5, textTransform:'none' }}>{nextCard.ageKey}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow prev */}
              {prevCard && onNavigateInReader && (
                <div
                  onClick={() => onNavigateInReader(prevCard)}
                  style={{
                    position:'absolute', left:'calc(50% - 402px)', top:'50%',
                    transform:'translateY(-50%)', width:54, height:54, borderRadius:'50%',
                    background:'#fff', boxShadow:'0 12px 26px -12px rgba(90,50,70,.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', zIndex:5, color:'#6E3B57', fontSize:24,
                  }}
                >‹</div>
              )}
              {/* Arrow next */}
              {nextCard && onNavigateInReader && (
                <div
                  onClick={() => onNavigateInReader(nextCard)}
                  style={{
                    position:'absolute', left:'calc(50% + 348px)', top:'50%',
                    transform:'translateY(-50%)', width:54, height:54, borderRadius:'50%',
                    background:'#fff', boxShadow:'0 12px 26px -12px rgba(90,50,70,.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', zIndex:5, color:'#6E3B57', fontSize:24,
                  }}
                >›</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COVER — brief flip animation before auto-advancing to summary ── */}
      {page === 'cover' && (
        <div className="flex flex-1 items-start justify-center px-0 py-8">
          <div className="relative w-full" style={{ maxWidth: 760 }}>
            {prevCard && <div style={{ position: 'absolute', top: 0, left: 0, width: '14%', bottom: 0, zIndex: 5, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '100%' }}><CoverImage card={prevCard} minimal /></div>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.55)', backdropFilter: 'blur(2px)' }} />
              <button type="button" onClick={() => navigateTo(prevCard)} aria-label={`Buku sebelumnya: ${prevCard.title}`}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,.20)] transition hover:scale-105">
                <ChevronLeft className="h-7 w-7 text-stv-navy" strokeWidth={2.5} />
              </button>
            </div>}
            {!prevCard && <div style={{ position: 'absolute', top: 0, left: 0, width: '14%', bottom: 0 }} />}
            {nextCard && <div style={{ position: 'absolute', top: 0, right: 0, width: '14%', bottom: 0, zIndex: 5, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '100%' }}><CoverImage card={nextCard} minimal /></div>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.55)', backdropFilter: 'blur(2px)' }} />
              <button type="button" onClick={() => navigateTo(nextCard)} aria-label={`Buku berikutnya: ${nextCard.title}`}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,.20)] transition hover:scale-105">
                <ChevronRight className="h-7 w-7 text-stv-navy" strokeWidth={2.5} />
              </button>
            </div>}
            {!nextCard && <div style={{ position: 'absolute', top: 0, right: 0, width: '14%', bottom: 0 }} />}
            <div style={{ margin: '0 14%' }}>
              <div style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}>
                <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '130%' }}>
                  <div style={{ position: 'absolute', inset: 0, zIndex: 3, transformOrigin: 'left center', transform: coverRotate, transition, backfaceVisibility: 'hidden', borderRadius: '5px 14px 14px 5px', overflow: 'hidden', boxShadow: '8px 8px 32px rgba(0,0,0,.22)' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: 'rgba(0,0,0,0.32)', zIndex: 2 }} />
                    {!imgErr && card.photo.src ? (
                      <img src={card.photo.src} alt={card.photo.alt} onError={() => setImgErr(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: domain.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DomainIcon style={{ width: 80, height: 80, color: domain.fg, opacity: 0.2 }} strokeWidth={1.5} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 18, right: 0, padding: '20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 3 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{domain.label}</p>
                      <p style={{ fontSize: 20, color: 'white', fontWeight: 800, lineHeight: 1.3, fontFamily: "'Fredoka', sans-serif" }}>{card.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCIENCE VIEW — new full-page design ── */}
      {page === 'scientific' && (() => {
        // Derive pseudo-sections from flat paragraphs for cards published via admin pipeline
        // before the sci_sections column existed. Paragraphs may carry "Judul: isi" encoding.
        // Kartu statis Studiva punya ID prefix "RL-"; kartu admin DB tidak.
        // Kartu admin DB: konten tersimpan selalu menang atas SCI_DATA statis.
        // Kartu statis: gunakan SCI_DATA (lebih fokus) sebagai prioritas utama.
        const isDbCard = !card.id.startsWith('RL-');

        // Untuk kartu DB lama yang punya sci_paragraphs (bukan sci_sections)
        const derivedSections: Array<{ judul: string; isi: string }> = isDbCard && !hasSections && hasParagraphs
          ? (sci.paragraphs ?? []).map(p => {
              const sep = p.indexOf(': ');
              return sep > 0 && sep < 70 ? { judul: p.slice(0, sep), isi: p.slice(sep + 2) } : { judul: '', isi: p };
            })
          : [];
        const adminSections: Array<{ judul: string; isi: string }> = hasSections
          ? (sci.sections ?? [])
          : derivedSections;
        // Admin layout hanya untuk kartu DB yang punya konten tersimpan
        const useAdminLayout = isDbCard && (hasSections || derivedSections.length > 0);

        // Priority 1: konten admin yang dimasukkan via pipeline (hanya kartu DB)
        if (useAdminLayout) {
          const { soft, ink } = curTokens;
          const domainLabel = DOMAIN_CODE_LABEL[card.domain] ?? '';
          const domainIconPaths = curTokens.iconPaths ?? [];
          return (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
              <div style={{ maxWidth: 1160, margin: '0 auto' }}>
                <button type="button" onClick={() => setPage('summary')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#6E3B57', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 17, lineHeight: 1 }}>‹</span> Kembali ke ringkasan
                </button>
                <div style={{ position: 'relative', minHeight: 800 }}>
                  <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>

                    {/* Left neighbor */}
                    {prevCard && prevTokens && (
                      <div onClick={() => navigateTo(prevCard)} style={{ width: 196, margin: '24px -86px 24px 0', borderRadius: 24, background: prevTokens.soft, border: `2px solid ${prevTokens.border}`, position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 34px -26px rgba(90,50,70,.5)', flexShrink: 0, cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', right: -46, bottom: -52, width: 170, height: 170, borderRadius: '50%', background: prevTokens.blob, opacity: .5 }} />
                        <div style={{ position: 'relative', padding: '24px 22px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .6, color: prevTokens.ink, textTransform: 'uppercase' }}>
                          {DOMAIN_CODE_LABEL[prevCard.domain]}
                          <div style={{ fontWeight: 700, color: '#A98DA0', marginTop: 5, textTransform: 'none' }}>{prevCard.ageKey}</div>
                        </div>
                      </div>
                    )}

                    {/* Science pane */}
                    <div style={{ width: 756, background: '#fff', borderRadius: 28, boxShadow: '0 34px 64px -42px rgba(90,50,70,.6)', overflowY: 'auto', zIndex: 3, padding: '34px 42px 40px', flexShrink: 0 }}>

                      {/* Eyebrow pill */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .5, textTransform: 'uppercase', color: ink, background: soft, padding: '7px 15px', borderRadius: 999 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          Detail ilmiah · tinjauan berbasis bukti
                        </div>
                      </div>

                      {/* Reviewer badge */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 11, fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: '#4E8A3E', background: '#E9F4DD', padding: '7px 15px', borderRadius: 999 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4E8A3E" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.2 2.2 4.8-5"/>
                        </svg>
                        Ditinjau secara klinis oleh tim Rekah
                      </div>

                      {/* Title */}
                      <h1 style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 33, lineHeight: 1.1, color: '#6E3B57', margin: '18px 0 0', letterSpacing: -.4 }}>
                        {sci.title || card.title}
                      </h1>

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#A98DA0' }}>
                        {sci.readMinutes ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <Clock className="h-4 w-4" strokeWidth={2.1} />
                            {sci.readMinutes} menit baca
                          </span>
                        ) : null}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800, color: ink }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                            {domainIconPaths.map((d, i) => <path key={i} d={d} />)}
                          </svg>
                          {domainLabel}
                        </span>
                      </div>

                      {/* Audio bar */}
                      <div style={{ marginTop: 20 }}>
                        <AudioPlayerWidget />
                      </div>

                      {/* Sections */}
                      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {adminSections.map((sec, si) => (
                          <div key={si}>
                            {sec.judul && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <div style={{ flexShrink: 0, width: 6, height: 24, borderRadius: 3, background: ink }} />
                                <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 22, color: '#6E3B57', letterSpacing: -.2 }}>{sec.judul}</div>
                              </div>
                            )}
                            <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16.5, lineHeight: 1.62, color: '#5C4A56', margin: sec.judul ? '12px 0 0' : 0 }}>
                              {sec.isi}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* References */}
                      {card.sources.length > 0 && (
                        <div style={{ marginTop: 26 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: '#6E3B57' }}>
                            <BookOpen className="h-4 w-4" strokeWidth={1.9} style={{ color: '#A98DA0' }} />
                            Referensi
                          </div>
                          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {card.sources.map((text, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                                <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, background: '#F1E7D7', color: '#8A7280', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                                <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#8A7280' }}>{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medical trust footer */}
                      <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1.5px solid #F0E7D8', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#A98DA0' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4E8A3E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3l7 3v5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        Konten ini ditinjau secara medis oleh tim ahli Rekah dan diperbarui berkala.
                      </div>

                      {/* Tandai Sudah Dibaca */}
                      <button
                        type="button"
                        onClick={onToggleRead}
                        aria-label={isRead ? 'Sudah dibaca' : 'Tandai sudah dibaca'}
                        className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border py-3 text-[13px] font-bold transition ${
                          isRead
                            ? 'border-stv-green bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
                            : 'border-stv-border bg-white text-stv-muted hover:border-stv-green hover:text-stv-green'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                        {isRead ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
                      </button>
                    </div>

                    {/* Right neighbor */}
                    {nextCard && nextTokens && (
                      <div onClick={() => navigateTo(nextCard)} style={{ width: 196, margin: '24px 0 24px -86px', borderRadius: 24, background: nextTokens.soft, border: `2px solid ${nextTokens.border}`, position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 34px -26px rgba(90,50,70,.5)', flexShrink: 0, cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', left: -46, bottom: -52, width: 170, height: 170, borderRadius: '50%', background: nextTokens.blob, opacity: .5 }} />
                        <div style={{ position: 'relative', padding: '24px 22px 24px 40px', textAlign: 'right', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .6, color: nextTokens.ink, textTransform: 'uppercase' }}>
                          {DOMAIN_CODE_LABEL[nextCard.domain]}
                          <div style={{ fontWeight: 700, color: '#A98DA0', marginTop: 5, textTransform: 'none' }}>{nextCard.ageKey}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow prev */}
                  {prevCard && onNavigateInReader && (
                    <div onClick={() => onNavigateInReader(prevCard)}
                      style={{ position: 'absolute', left: 'calc(50% - 432px)', top: 340, width: 54, height: 54, borderRadius: '50%', background: '#fff', boxShadow: '0 12px 26px -12px rgba(90,50,70,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, color: '#6E3B57', fontSize: 24 }}>‹</div>
                  )}
                  {/* Arrow next */}
                  {nextCard && onNavigateInReader && (
                    <div onClick={() => onNavigateInReader(nextCard)}
                      style={{ position: 'absolute', left: 'calc(50% + 378px)', top: 340, width: 54, height: 54, borderRadius: '50%', background: '#fff', boxShadow: '0 12px 26px -12px rgba(90,50,70,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, color: '#6E3B57', fontSize: 24 }}>›</div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        const sciDetail = SCI_DATA[`${card.domain}-${card.ageKey}`];
        if (!sciDetail) {
          // Graceful fallback for cards without rich science data
          return (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <button type="button" onClick={() => setPage('summary')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#6E3B57', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
                  <span style={{ fontSize: 17, lineHeight: 1 }}>‹</span> Kembali ke ringkasan
                </button>
                <div style={{ background: '#fff', borderRadius: 24, padding: '32px 36px', boxShadow: '0 20px 40px -26px rgba(90,50,70,.4)' }}>
                  <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, color: '#A98DA0' }}>Detail ilmiah belum tersedia untuk buku ini.</p>
                </div>
              </div>
            </div>
          );
        }
        const { soft, ink, border } = curTokens;
        const domainIconPaths = curTokens.iconPaths ?? [];
        const domainLabel = DOMAIN_CODE_LABEL[card.domain] ?? '';
        return (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto' }}>
              {/* Back link */}
              <button type="button" onClick={() => setPage('summary')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#6E3B57', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 17, lineHeight: 1 }}>‹</span> Kembali ke ringkasan
              </button>

              <div style={{ position: 'relative', minHeight: 1160 }}>
                <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>

                  {/* Left neighbor */}
                  {prevCard && prevTokens && (
                    <div onClick={() => navigateTo(prevCard)} style={{ width: 196, margin: '24px -86px 24px 0', borderRadius: 24, background: prevTokens.soft, border: `2px solid ${prevTokens.border}`, position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 34px -26px rgba(90,50,70,.5)', flexShrink: 0, cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', right: -46, bottom: -52, width: 170, height: 170, borderRadius: '50%', background: prevTokens.blob, opacity: .5 }} />
                      <div style={{ position: 'relative', padding: '24px 22px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .6, color: prevTokens.ink, textTransform: 'uppercase' }}>
                        {DOMAIN_CODE_LABEL[prevCard.domain]}
                        <div style={{ fontWeight: 700, color: '#A98DA0', marginTop: 5, textTransform: 'none' }}>{prevCard.ageKey}</div>
                      </div>
                    </div>
                  )}

                  {/* Science pane */}
                  <div style={{ width: 756, background: '#fff', borderRadius: 28, boxShadow: '0 34px 64px -42px rgba(90,50,70,.6)', overflowY: 'auto', zIndex: 3, padding: '34px 42px 40px', flexShrink: 0 }}>

                    {/* Eyebrow pill */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .5, textTransform: 'uppercase', color: ink, background: soft, padding: '7px 15px', borderRadius: 999 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        Detail ilmiah · tinjauan berbasis bukti
                      </div>
                    </div>

                    {/* Reviewer badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 11, fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: '#4E8A3E', background: '#E9F4DD', padding: '7px 15px', borderRadius: 999 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4E8A3E" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.2 2.2 4.8-5"/>
                      </svg>
                      Ditinjau oleh {sciDetail.reviewer} · {sciDetail.date}
                    </div>

                    {/* Title */}
                    <h1 style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 33, lineHeight: 1.1, color: '#6E3B57', margin: '18px 0 0', letterSpacing: -.4 }}>{sciDetail.title}</h1>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#A98DA0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                        </svg>
                        {sciDetail.readMin} menit baca
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800, color: ink }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          {domainIconPaths.map((d, i) => <path key={i} d={d} />)}
                        </svg>
                        {domainLabel}
                      </span>
                    </div>

                    {/* Audio bar */}
                    <div style={{ marginTop: 20 }}>
                      <AudioPlayerWidget />
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                      {sciDetail.stats.map((st, i) => (
                        <div key={i} style={{ background: soft, border: `1.5px solid ${border}`, borderRadius: 20, padding: '22px 20px', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 38, lineHeight: 1, color: ink }}>
                            {st.v}<sup style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, verticalAlign: 'super' }}>[{st.ref}]</sup>
                          </div>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: '#7A5E71', marginTop: 10 }}>{st.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Sections */}
                    <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {sciDetail.sections.map((sec, si) => (
                        <div key={si}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{ flexShrink: 0, width: 6, height: 24, borderRadius: 3, background: ink }} />
                            <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 22, color: '#6E3B57', letterSpacing: -.2 }}>{sec.h}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                            {sec.p.map((pp, pi) => (
                              <p key={pi} style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16.5, lineHeight: 1.62, color: '#5C4A56', margin: 0 }}>
                                {pp.t}
                                {(pp.refs ?? []).map(r => (
                                  <sup key={r} style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: ink, verticalAlign: 'super', marginLeft: 1 }}>[{r}]</sup>
                                ))}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Figure (relationship diagram) */}
                    <div style={{ marginTop: 26, background: '#FBF6EE', border: '1.5px solid #EFE4D2', borderRadius: 22, padding: '30px 26px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                        {/* Circle A */}
                        <div style={{ flexShrink: 0, width: 112, height: 112, borderRadius: '50%', background: soft, border: `2.5px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ fontSize: 34, lineHeight: 1 }}>{sciDetail.fig.ae}</div>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: ink, marginTop: 3 }}>{sciDetail.fig.al}</div>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: '#A98DA0' }}>{sciDetail.fig.asSub}</div>
                        </div>
                        {/* Connector */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '100%', borderTop: `2.5px dashed ${border}`, position: 'relative', marginBottom: 0 }} />
                          <div style={{ marginTop: -16, background: '#fff', border: `2px solid ${border}`, borderRadius: 12, padding: '7px 14px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 16, color: ink, lineHeight: 1 }}>{sciDetail.fig.big}</div>
                            <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: '#A98DA0', marginTop: 2 }}>{sciDetail.fig.small}</div>
                          </div>
                        </div>
                        {/* Circle B */}
                        <div style={{ flexShrink: 0, width: 112, height: 112, borderRadius: '50%', background: soft, border: `2.5px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ fontSize: 34, lineHeight: 1 }}>{sciDetail.fig.be}</div>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: ink, marginTop: 3 }}>{sciDetail.fig.bl}</div>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: '#A98DA0' }}>{sciDetail.fig.bsSub}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#8A7280', textAlign: 'center', marginTop: 18 }}>{sciDetail.fig.cap}</div>
                      <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#B49C6A', textAlign: 'center', marginTop: 6 }}>Gambar {sciDetail.fig.num}. {sciDetail.fig.title}</div>
                    </div>

                    {/* Poin penting callout */}
                    <div style={{ marginTop: 24, background: soft, borderRadius: 20, padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18h6"/><path d="M10 21h4"/>
                          <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.9h5c.1-.8.4-1.4 1-1.9A6 6 0 0 0 12 3z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, letterSpacing: .4, textTransform: 'uppercase', color: ink }}>Poin penting</div>
                        <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, lineHeight: 1.55, color: '#5C4A56', margin: '7px 0 0' }}>{sciDetail.keypoint}</p>
                      </div>
                    </div>

                    {/* References */}
                    <div style={{ marginTop: 26 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: '#6E3B57' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A98DA0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 6.5C10.5 5 8 4.5 4 4.7v12.6c4-.2 6.5.3 8 1.7"/>
                          <path d="M12 6.5C13.5 5 16 4.5 20 4.7v12.6c-4-.2-6.5.3-8 1.7"/>
                        </svg>
                        Referensi
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {sciDetail.refs.map((text, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, background: '#F1E7D7', color: '#8A7280', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#8A7280' }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Medical trust footer */}
                    <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1.5px solid #F0E7D8', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#A98DA0' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4E8A3E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l7 3v5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                      Konten ini ditinjau secara medis oleh tim ahli Rekah dan diperbarui berkala.
                    </div>

                    {/* Tandai Sudah Dibaca */}
                    <button
                      type="button"
                      onClick={onToggleRead}
                      aria-label={isRead ? 'Sudah dibaca' : 'Tandai sudah dibaca'}
                      className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border py-3 text-[13px] font-bold transition ${
                        isRead
                          ? 'border-stv-green bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
                          : 'border-stv-border bg-white text-stv-muted hover:border-stv-green hover:text-stv-green'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      {isRead ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
                    </button>
                  </div>

                  {/* Right neighbor */}
                  {nextCard && nextTokens && (
                    <div onClick={() => navigateTo(nextCard)} style={{ width: 196, margin: '24px 0 24px -86px', borderRadius: 24, background: nextTokens.soft, border: `2px solid ${nextTokens.border}`, position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 34px -26px rgba(90,50,70,.5)', flexShrink: 0, cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', left: -46, bottom: -52, width: 170, height: 170, borderRadius: '50%', background: nextTokens.blob, opacity: .5 }} />
                      <div style={{ position: 'relative', padding: '24px 22px 24px 40px', textAlign: 'right', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, letterSpacing: .6, color: nextTokens.ink, textTransform: 'uppercase' }}>
                        {DOMAIN_CODE_LABEL[nextCard.domain]}
                        <div style={{ fontWeight: 700, color: '#A98DA0', marginTop: 5, textTransform: 'none' }}>{nextCard.ageKey}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow prev — wider pane: 432px offset */}
                {prevCard && onNavigateInReader && (
                  <div onClick={() => onNavigateInReader(prevCard)}
                    style={{ position: 'absolute', left: 'calc(50% - 432px)', top: 340, width: 54, height: 54, borderRadius: '50%', background: '#fff', boxShadow: '0 12px 26px -12px rgba(90,50,70,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, color: '#6E3B57', fontSize: 24 }}>‹</div>
                )}
                {/* Arrow next */}
                {nextCard && onNavigateInReader && (
                  <div onClick={() => onNavigateInReader(nextCard)}
                    style={{ position: 'absolute', left: 'calc(50% + 378px)', top: 340, width: 54, height: 54, borderRadius: '50%', background: '#fff', boxShadow: '0 12px 26px -12px rgba(90,50,70,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, color: '#6E3B57', fontSize: 24 }}>›</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
