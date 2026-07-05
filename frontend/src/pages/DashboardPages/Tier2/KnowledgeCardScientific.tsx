import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, BadgeCheck, CheckCircle2, Bookmark, ExternalLink,
} from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import { CARDS, DOMAIN_MAP } from './knowledgeCardData';
import AudioPlayerWidget from './AudioPlayerWidget';
import { FIGURE_REGISTRY } from '../../../components/figures';

// Render inline [n] markers as superscript links to reference anchors
function renderCitations(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      return (
        <sup key={i}>
          <a
            href={`#ref-${match[1]}`}
            className="font-semibold text-amber-700 no-underline hover:underline"
          >
            [{match[1]}]
          </a>
        </sup>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function KnowledgeCardScientific() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate   = useNavigate();
  const basePath   = useDashboardBasePath();
  const { segments, setCurrentIndex, registerNavigate } = useAudioPlayer();
  const { isRead, isBookmarked, toggleRead, toggleBookmark } = useKnowledgeLibrary();

  const card = CARDS.find(c => c.id === cardId);

  useEffect(() => {
    registerNavigate((cId, part) => {
      if (part === 'summary') navigate(`${basePath}/knowledge/${cId}`);
      else navigate(`${basePath}/knowledge/${cId}/ilmiah`);
    });
  }, [registerNavigate, navigate, basePath]);

  useEffect(() => {
    if (!cardId || segments.length === 0) return;
    const idx = segments.findIndex(s => s.cardId === cardId && s.part === 'scientific');
    if (idx !== -1) setCurrentIndex(idx);
  }, [cardId, segments, setCurrentIndex]);

  // Next card in filtered list
  const orderedCardIds = [...new Set(segments.map(s => s.cardId))];
  const currentPos     = orderedCardIds.indexOf(cardId ?? '');
  const nextCardId     = currentPos !== -1 && currentPos < orderedCardIds.length - 1
    ? orderedCardIds[currentPos + 1] : null;
  const nextCard = nextCardId ? CARDS.find(c => c.id === nextCardId) : null;

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center font-nunito-sans text-stv-muted">
        Kartu tidak ditemukan.
      </div>
    );
  }

  const { scientific: sci } = card;
  const hasSections    = (sci.sections?.length ?? 0) > 0;
  const hasParagraphs  = (sci.paragraphs?.length ?? 0) > 0;
  const read           = isRead(card.id);
  const bookmarked     = isBookmarked(card.id);
  const FigureComp     = sci.figure ? FIGURE_REGISTRY[sci.figure.id] : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 font-nunito-sans sm:px-6">
      <div className="mx-auto max-w-[720px]">

        {/* Back to summary */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/knowledge/${card.id}`)}
          className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-stv-muted hover:text-stv-navy"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke ringkasan
        </button>

        {/* ── Badge row ─────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-bold text-amber-700">
            Detail ilmiah · tinjauan berbasis bukti
          </span>
          {sci.reviewedBy && (
            <span className="flex items-center gap-1.5 rounded-full bg-stv-green-tint px-3 py-1 text-[12px] font-semibold text-stv-green">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
              Ditinjau oleh {sci.reviewedBy.name} · {sci.reviewedBy.date}
            </span>
          )}
        </div>

        {/* ── Title + read time ─────────────────────────────────────── */}
        <h1 className="mb-1 font-baloo text-2xl font-extrabold leading-snug text-stv-navy">
          {sci.title}
        </h1>
        {sci.readMinutes && (
          <p className="mb-4 flex items-center gap-1.5 text-[13px] text-stv-muted">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            {sci.readMinutes} menit baca
          </p>
        )}

        {/* ── Bookmark button — stays near the top ──────────────────── */}
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => toggleBookmark(card.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold transition ${
              bookmarked
                ? 'border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'border-stv-border bg-white text-stv-muted hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={2} />
            {bookmarked ? 'Disimpan' : 'Simpan'}
          </button>
        </div>

        {/* ── Audio player ──────────────────────────────────────────── */}
        <div className="mb-6">
          <AudioPlayerWidget />
        </div>

        {/* ── Callout stats ─────────────────────────────────────────── */}
        {sci.stats && sci.stats.length > 0 && (
          <div className={`mb-7 grid gap-4 ${sci.stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {sci.stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="font-baloo text-[28px] font-bold leading-none" style={{ color: '#BA7517' }}>
                  {stat.value}
                  {stat.ref && (
                    <sup className="text-[14px]">
                      <a href={`#ref-${stat.ref}`} className="text-amber-600 no-underline hover:underline">
                        [{stat.ref}]
                      </a>
                    </sup>
                  )}
                </p>
                <p className="mt-1.5 text-[12px] leading-[1.5] text-amber-800">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Sections (rich) OR paragraphs (fallback) ──────────────── */}
        {hasSections ? (
          <div className="space-y-0">
            {sci.sections!.map((section, idx) => (
              <React.Fragment key={idx}>
                <section className="mb-6">
                  {/* Section heading */}
                  <h2 className="mb-2 flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-navy">
                    <span
                      className="inline-block h-4 w-1 shrink-0 rounded-full"
                      style={{ background: '#BA7517' }}
                    />
                    {section.judul}
                  </h2>
                  <p className="text-[15px] leading-[1.85] text-stv-body">
                    {renderCitations(section.isi)}
                  </p>
                </section>

                {/* Insert figure after the specified section index */}
                {FigureComp && sci.figure?.afterSectionIndex === idx && (
                  <figure className="mb-6 overflow-hidden rounded-2xl border border-stv-border bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                    <FigureComp />
                    <figcaption className="mt-3 text-center text-[12px] text-stv-muted">
                      Gambar 1. {sci.figure.caption}
                    </figcaption>
                  </figure>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : hasParagraphs ? (
          <div className="space-y-5 rounded-2xl border border-stv-border bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
            {sci.paragraphs!.map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-stv-body">{para}</p>
            ))}
          </div>
        ) : null}

        {/* ── References ────────────────────────────────────────────── */}
        {sci.references && sci.references.length > 0 && (
          <div className="mt-8 rounded-2xl border border-stv-border bg-white p-5">
            <h3 className="mb-3 font-baloo text-[15px] font-bold text-stv-navy">Referensi</h3>
            <ol className="list-none space-y-2">
              {sci.references.map(ref => (
                <li key={ref.n} id={`ref-${ref.n}`} className="flex items-start gap-2 text-[13px] text-stv-body">
                  <span className="mt-0.5 shrink-0 font-bold text-amber-700">[{ref.n}]</span>
                  <span>
                    {ref.text}
                    {ref.url && (
                      <>
                        {' '}
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-0.5 text-stv-sky-stroke no-underline hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" strokeWidth={2} />
                          Buka
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Sudah Dibaca — after content, before next card ────────── */}
        <button
          type="button"
          onClick={() => toggleRead(card.id)}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[14px] font-bold transition ${
            read
              ? 'border-stv-green bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
              : 'border-stv-border bg-white text-stv-muted hover:border-stv-green hover:text-stv-green'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          {read ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
        </button>

        {/* ── Next card ─────────────────────────────────────────────── */}
        {nextCard && (
          <button
            type="button"
            onClick={() => navigate(`${basePath}/knowledge/${nextCard.id}`)}
            className="mt-6 flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-stv-navy/10 bg-white px-5 py-4 text-left transition hover:border-stv-navy/30 hover:shadow-[0_4px_16px_rgba(16,58,107,.08)]"
          >
            <div className="min-w-0">
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-stv-muted">Kartu Berikutnya</p>
              <p className="truncate font-baloo text-[15px] font-bold text-stv-navy">{nextCard.title}</p>
              <p className="text-[12px] text-stv-muted">{DOMAIN_MAP[nextCard.domain].label}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-stv-navy" strokeWidth={2} />
          </button>
        )}

      </div>
    </div>
  );
}
