import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, BookOpen, CheckCircle2, Bookmark,
} from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import { CARDS, DOMAIN_MAP } from './knowledgeCardData';
import AudioPlayerWidget from './AudioPlayerWidget';

export default function KnowledgeCardScientific() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
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

  // Find next card
  const orderedCardIds = [...new Set(segments.map(s => s.cardId))];
  const currentPos     = orderedCardIds.indexOf(cardId ?? '');
  const nextCardId     = currentPos !== -1 && currentPos < orderedCardIds.length - 1
    ? orderedCardIds[currentPos + 1]
    : null;
  const nextCard = nextCardId ? CARDS.find(c => c.id === nextCardId) : null;

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center font-nunito-sans text-stv-muted">
        Kartu tidak ditemukan.
      </div>
    );
  }

  const read       = isRead(card.id);
  const bookmarked = isBookmarked(card.id);

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 font-nunito-sans sm:px-6">
      <div className="mx-auto max-w-[680px]">

        {/* Back to summary */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/knowledge/${card.id}`)}
          className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-stv-muted hover:text-stv-navy"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke ringkasan
        </button>

        {/* Badge */}
        <span className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-[12px] font-bold text-amber-700">
          Detail ilmiah
        </span>

        {/* Title + read time */}
        <h1 className="mb-1 font-baloo text-2xl font-extrabold leading-snug text-stv-navy">
          {card.scientific.title}
        </h1>
        <p className="mb-4 flex items-center gap-1.5 text-[13px] text-stv-muted">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          {card.scientific.readMinutes} menit baca
        </p>

        {/* Action bar */}
        <div className="mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => toggleRead(card.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-bold transition ${
              read
                ? 'border-stv-green bg-stv-green-tint text-stv-green hover:bg-stv-green hover:text-white'
                : 'border-stv-border bg-white text-stv-muted hover:border-stv-green hover:text-stv-green'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            {read ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
          </button>
          <button
            type="button"
            onClick={() => toggleBookmark(card.id)}
            title={bookmarked ? 'Hapus bookmark' : 'Bookmark'}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition ${
              bookmarked
                ? 'border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'border-stv-border bg-white text-stv-muted hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={2} />
            {bookmarked ? 'Disimpan' : 'Simpan'}
          </button>
        </div>

        {/* Audio player */}
        <div className="mb-6">
          <AudioPlayerWidget />
        </div>

        {/* Paragraphs */}
        <div className="space-y-5 rounded-2xl border border-stv-border bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          {card.scientific.paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-stv-body">{para}</p>
          ))}
        </div>

        {/* Sources */}
        {card.sources.length > 0 && (
          <div className="mt-5 flex items-start gap-2 text-[12px] text-stv-muted">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <div><span className="font-semibold">Sumber: </span>{card.sources.join(' · ')}</div>
          </div>
        )}

        {/* Next card */}
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
