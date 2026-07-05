import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, FlaskConical, AlertTriangle, BookOpen, BadgeCheck, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { CoverImage } from './BookCarousel';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES, SUMMARY_LABEL_STYLES } from './knowledgeCardData';
import { FIGURE_REGISTRY } from '../../../components/figures';
import AudioPlayerWidget from './AudioPlayerWidget';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';

function useReducedMotion() {
  const [r] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return r;
}

function renderCitations(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) return <sup key={i}><a href={`#ref-${m[1]}`} className="font-semibold text-amber-700 no-underline hover:underline">[{m[1]}]</a></sup>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
}

export default function BookReader({ card, isRead, onToggleRead, onClose, prevCard, nextCard, onNavigate, onNavigateInReader }: BookReaderProps) {
  const reduced = useReducedMotion();
  const [page, setPage] = useState<'cover' | 'summary' | 'scientific'>('cover');
  const { segments, setCurrentIndex, registerNavigate } = useAudioPlayer();
  const [imgErr, setImgErr] = useState(false);
  const domain = DOMAIN_MAP[card.domain];
  const DomainIcon = domain.icon;
  const ageRange = AGE_RANGES.find(a => a.key === card.ageKey);
  const sci = card.scientific;
  const hasSections = (sci.sections?.length ?? 0) > 0;
  const hasParagraphs = (sci.paragraphs?.length ?? 0) > 0;
  const hasScientific = hasSections || hasParagraphs;
  const FigureComp = sci.figure ? FIGURE_REGISTRY[sci.figure.id] : null;

  // Open to summary after mounting (cover → summary)
  useEffect(() => {
    const t = setTimeout(() => setPage('summary'), reduced ? 10 : 80);
    return () => clearTimeout(t);
  }, [card.id, reduced]);

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
  const summaryTransition = reduced ? 'none' : 'transform 0.8s cubic-bezier(.4,0,.2,1)';

  const coverRotate = page !== 'cover' ? 'rotateY(-170deg)' : 'rotateY(0deg)';
  const summaryRotate = page === 'scientific' ? 'rotateY(-170deg)' : 'rotateY(0deg)';

  // Navigate within reader — stay in reader, remount with new card (cover animation plays)
  function navigateTo(target: KnowledgeCard) {
    if (onNavigateInReader) {
      onNavigateInReader(target);
    } else {
      // Fallback: go to carousel
      if (onNavigate) onNavigate(target);
      onClose();
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col font-nunito-sans"
      style={{ background: '#FAFAF8', animation: reduced ? 'none' : 'readerFadeIn 0.32s ease-out both' }}
    >
      <style>{`@keyframes readerFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
      {/* Top bar — only Back button */}
      <div className="sticky top-0 z-50 flex items-center border-b border-stv-border bg-white px-4 py-3 sm:px-6">
        <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-semibold text-stv-muted hover:text-stv-navy">
          <X className="h-4 w-4" strokeWidth={2} />
          Kembali
        </button>
      </div>

      {/*
        Layout mirrors carousel exactly:
        container full-width, book 72% centered (14% margin each side),
        neighbor covers peek from the sides as ghost elements.
      */}
      <div className="flex flex-1 items-start justify-center px-0 py-8">
        <div className="relative w-full" style={{ maxWidth: 760 }}>

          {/* Left ghost — prev book sliver */}
          {prevCard && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '14%', bottom: 0, zIndex: 5, overflow: 'hidden' }}>
              {/* show right edge of prev cover — minimal hides title text */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '100%' }}>
                <CoverImage card={prevCard} minimal />
              </div>
              {/* darken + blur overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.55)', backdropFilter: 'blur(2px)' }} />
              {/* Arrow on top */}
              <button
                type="button"
                aria-label={`Buku sebelumnya: ${prevCard.title}`}
                onClick={() => navigateTo(prevCard)}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,.20)] transition hover:scale-105"
              >
                <ChevronLeft className="h-7 w-7 text-stv-navy" strokeWidth={2.5} />
              </button>
            </div>
          )}
          {/* Left filler when no prev card */}
          {!prevCard && <div style={{ position: 'absolute', top: 0, left: 0, width: '14%', bottom: 0 }} />}

          {/* Right ghost — next book sliver */}
          {nextCard && (
            <div style={{ position: 'absolute', top: 0, right: 0, width: '14%', bottom: 0, zIndex: 5, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '100%' }}>
                <CoverImage card={nextCard} minimal />
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.55)', backdropFilter: 'blur(2px)' }} />
              <button
                type="button"
                aria-label={`Buku berikutnya: ${nextCard.title}`}
                onClick={() => navigateTo(nextCard)}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,.20)] transition hover:scale-105"
              >
                <ChevronRight className="h-7 w-7 text-stv-navy" strokeWidth={2.5} />
              </button>
            </div>
          )}
          {!nextCard && <div style={{ position: 'absolute', top: 0, right: 0, width: '14%', bottom: 0 }} />}

          {/* Center book (72% wide, matching carousel) */}
          <div style={{ margin: '0 14%' }}>
          <div style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}>
            <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '130%' }}>

              {/* ── COVER (z=3, flips away first) ── */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 3,
                transformOrigin: 'left center',
                transform: coverRotate,
                transition,
                backfaceVisibility: 'hidden',
                borderRadius: '5px 14px 14px 5px',
                overflow: 'hidden',
                boxShadow: '8px 8px 32px rgba(0,0,0,.22)',
              }}>
                {/* Spine */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: 'rgba(0,0,0,0.32)', zIndex: 2 }} />
                {!imgErr && card.photo.src ? (
                  <img src={card.photo.src} alt={card.photo.alt} onError={() => setImgErr(true)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: domain.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DomainIcon style={{ width: 80, height: 80, color: domain.fg, opacity: 0.2 }} strokeWidth={1.5} />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 18, right: 0, padding: '20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 3 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{domain.label}</p>
                  <p style={{ fontSize: 20, color: 'white', fontWeight: 800, lineHeight: 1.3, fontFamily: "'Baloo 2', sans-serif" }}>{card.title}</p>
                </div>
              </div>

              {/* ── SUMMARY PAGE (z=2, flips away second) ── */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 2,
                transformOrigin: 'left center',
                transform: summaryRotate,
                transition: summaryTransition,
                backfaceVisibility: 'hidden',
                borderRadius: '5px 14px 14px 5px',
                overflow: 'hidden',
                boxShadow: '6px 6px 24px rgba(0,0,0,.16)',
                background: '#fff',
              }}>
                {/* Page spine */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)', zIndex: 2 }} />
                <div style={{ position: 'absolute', inset: 0, paddingLeft: 18, overflowY: 'auto' }}>
                  <div className="p-4 pb-6">
                    {/* Badges */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {ageRange && (
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: ageRange.fill, color: ageRange.ink }}>{ageRange.label}</span>
                      )}
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: domain.bg, color: domain.fg }}>
                        <DomainIcon className="h-3 w-3" strokeWidth={2} />{domain.label}
                      </span>
                    </div>
                    <h1 className="mb-3 font-baloo text-[20px] font-extrabold leading-snug text-stv-navy">{card.title}</h1>
                    <p className="mb-3 flex items-center gap-1.5 text-[12px] text-stv-muted">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />{card.readMinutes} menit baca
                    </p>

                    {/* Audio */}
                    <div className="mb-4"><AudioPlayerWidget /></div>

                    {card.isMedical && (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                        Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional.
                      </div>
                    )}

                    {/* Summary sections */}
                    <div className="space-y-4 rounded-xl border border-stv-border bg-slate-50 p-4">
                      {([
                        { key: 'terjadi', content: card.summary.terjadi },
                        { key: 'penting', content: card.summary.penting },
                      ] as const).map(({ key, content }) => (
                        <div key={key}>
                          <span className="mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                            style={{ background: SUMMARY_LABEL_STYLES[key].bg, color: SUMMARY_LABEL_STYLES[key].fg }}>
                            {SUMMARY_LABEL_STYLES[key].text}
                          </span>
                          <p className="text-[13px] leading-[1.7] text-stv-body">{content}</p>
                        </div>
                      ))}
                      <div>
                        <span className="mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                          style={{ background: SUMMARY_LABEL_STYLES.lakukan.bg, color: SUMMARY_LABEL_STYLES.lakukan.fg }}>
                          {SUMMARY_LABEL_STYLES.lakukan.text}
                        </span>
                        <ul className="mt-1 space-y-1">
                          {card.summary.lakukan.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] text-stv-body">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-center text-[10px] font-bold leading-4"
                                style={{ background: SUMMARY_LABEL_STYLES.lakukan.bg, color: SUMMARY_LABEL_STYLES.lakukan.fg }}>{i + 1}</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Perhatian */}
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" strokeWidth={2} />
                        <span className="text-[12px] font-bold text-red-700">Perlu perhatian bila</span>
                      </div>
                      <p className="text-[13px] text-red-800">{card.summary.perhatian}</p>
                    </div>

                    {/* Sources */}
                    {card.sources.length > 0 && (
                      <div className="mt-4 flex items-start gap-2 text-[11px] text-stv-muted">
                        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        <span><span className="font-semibold">Sumber: </span>{card.sources.join(' · ')}</span>
                      </div>
                    )}

                    {/* Lanjut button */}
                    {hasScientific && (
                      <button
                        type="button"
                        onClick={() => setPage('scientific')}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-[13px] font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        <FlaskConical className="h-4 w-4" strokeWidth={2} />
                        Lanjut ke detail ilmiah
                      </button>
                    )}

                    {/* Tandai Sudah Dibaca — below Lanjut button */}
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
                </div>
              </div>

              {/* ── SCIENTIFIC PAGE (z=1, always visible underneath) ── */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                borderRadius: '5px 14px 14px 5px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '4px 4px 16px rgba(0,0,0,.10)',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(to right, rgba(0,0,0,0.14), transparent)', zIndex: 2 }} />
                <div style={{ position: 'absolute', inset: 0, paddingLeft: 18, overflowY: 'auto' }}>
                  <div className="p-4 pb-8">
                    {/* Back to summary */}
                    <button type="button" onClick={() => setPage('summary')}
                      className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-stv-muted hover:text-stv-navy">
                      Kembali ke ringkasan
                    </button>

                    {/* Badges */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        Detail ilmiah · tinjauan berbasis bukti
                      </span>
                      {sci.reviewedBy && (
                        <span className="flex items-center gap-1 rounded-full bg-stv-green-tint px-2.5 py-0.5 text-[11px] font-semibold text-stv-green">
                          <BadgeCheck className="h-3 w-3" strokeWidth={2} />
                          Ditinjau oleh {sci.reviewedBy.name} · {sci.reviewedBy.date}
                        </span>
                      )}
                    </div>

                    <h2 className="mb-1 font-baloo text-[18px] font-extrabold leading-snug text-stv-navy">{sci.title}</h2>
                    {sci.readMinutes && (
                      <p className="mb-4 flex items-center gap-1.5 text-[12px] text-stv-muted">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />{sci.readMinutes} menit baca
                      </p>
                    )}

                    {/* Audio */}
                    <div className="mb-4"><AudioPlayerWidget /></div>

                    {/* Stats */}
                    {sci.stats && sci.stats.length > 0 && (
                      <div className={`mb-5 grid gap-3 ${sci.stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {sci.stats.map((stat, i) => (
                          <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                            <p className="font-baloo text-[22px] font-bold leading-none" style={{ color: '#BA7517' }}>
                              {stat.value}
                              {stat.ref && <sup className="text-[11px]"><a href={`#ref-${stat.ref}`} className="text-amber-600 no-underline hover:underline">[{stat.ref}]</a></sup>}
                            </p>
                            <p className="mt-1 text-[11px] leading-[1.4] text-amber-800">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sections or paragraphs */}
                    {hasSections ? (
                      <div>
                        {sci.sections!.map((section, idx) => (
                          <React.Fragment key={idx}>
                            <section className="mb-5">
                              <h3 className="mb-1.5 flex items-center gap-2 font-baloo text-[15px] font-bold text-stv-navy">
                                <span className="inline-block h-3.5 w-1 shrink-0 rounded-full" style={{ background: '#BA7517' }} />
                                {section.judul}
                              </h3>
                              <p className="text-[13px] leading-[1.8] text-stv-body">{renderCitations(section.isi)}</p>
                            </section>
                            {FigureComp && sci.figure?.afterSectionIndex === idx && (
                              <figure className="mb-5 overflow-hidden rounded-xl border border-stv-border bg-white p-3">
                                <FigureComp />
                                <figcaption className="mt-2 text-center text-[11px] text-stv-muted">Gambar 1. {sci.figure.caption}</figcaption>
                              </figure>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : hasParagraphs ? (
                      <div className="space-y-4">
                        {sci.paragraphs!.map((para, i) => (
                          <p key={i} className="text-[13px] leading-[1.8] text-stv-body">{para}</p>
                        ))}
                      </div>
                    ) : null}

                    {/* References */}
                    {sci.references && sci.references.length > 0 && (
                      <div className="mt-6 rounded-xl border border-stv-border bg-white p-4">
                        <h4 className="mb-2 font-baloo text-[14px] font-bold text-stv-navy">Referensi</h4>
                        <ol className="list-none space-y-1.5">
                          {sci.references.map(ref => (
                            <li key={ref.n} id={`ref-${ref.n}`} className="flex items-start gap-2 text-[12px] text-stv-body">
                              <span className="mt-0.5 shrink-0 font-bold text-amber-700">[{ref.n}]</span>
                              <span>
                                {ref.text}
                                {ref.url && (
                                  <> <a href={ref.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-0.5 text-stv-sky-stroke no-underline hover:underline">
                                    <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />Buka
                                  </a></>
                                )}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Tandai Sudah Dibaca — bottom of scientific page */}
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
                </div>
              </div>

            </div>
          </div>
          </div> {/* close margin 0 14% center wrapper */}
        </div> {/* close relative maxWidth-760 */}
      </div>
    </div>
  );
}
