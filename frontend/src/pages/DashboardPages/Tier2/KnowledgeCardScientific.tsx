import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { CARDS } from './knowledgeCardData';
import AudioPlayerWidget from './AudioPlayerWidget';

export default function KnowledgeCardScientific() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { segments, setCurrentIndex, registerNavigate } = useAudioPlayer();

  const card = CARDS.find(c => c.id === cardId);

  // Register navigation callback so audio player can drive page navigation
  useEffect(() => {
    registerNavigate((cId, part) => {
      if (part === 'summary') {
        navigate(`${basePath}/knowledge/${cId}`);
      } else {
        navigate(`${basePath}/knowledge/${cId}/ilmiah`);
      }
    });
  }, [registerNavigate, navigate, basePath]);

  // Sync context index to this card's scientific segment
  useEffect(() => {
    if (!cardId || segments.length === 0) return;
    const idx = segments.findIndex(s => s.cardId === cardId && s.part === 'scientific');
    if (idx !== -1) setCurrentIndex(idx);
  }, [cardId, segments, setCurrentIndex]);

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center font-nunito-sans text-stv-muted">
        Kartu tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 font-nunito-sans sm:px-6">
      <div className="mx-auto max-w-[680px]">
        {/* Back button */}
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

        {/* Audio player */}
        <div className="mb-6">
          <AudioPlayerWidget />
        </div>

        {/* Paragraphs */}
        <div className="space-y-5 rounded-2xl border border-stv-border bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          {card.scientific.paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-stv-body">
              {para}
            </p>
          ))}
        </div>

        {/* Sources */}
        {card.sources.length > 0 && (
          <div className="mt-6 flex items-start gap-2 text-[12px] text-stv-muted">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <div>
              <span className="font-semibold">Sumber: </span>
              {card.sources.join(' · ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
