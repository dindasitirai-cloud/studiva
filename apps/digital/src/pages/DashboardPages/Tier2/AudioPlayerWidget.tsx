import React from 'react';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { CARDS } from './knowledgeCardData';

const AMBER = '#BA7517';

export default function AudioPlayerWidget() {
  const { segments, currentIndex, isPlaying, play, pause, next, prev } = useAudioPlayer();

  if (segments.length === 0) return null;

  const seg = segments[currentIndex];
  const card = seg ? CARDS.find(c => c.id === seg.cardId) : null;
  const segmentLabel = seg?.part === 'scientific' ? 'Detail ilmiah' : 'Ringkasan';
  const titleLabel = card ? `${segmentLabel}: ${card.title}` : segmentLabel;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < segments.length - 1;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      {/* Skip back */}
      <button
        type="button"
        onClick={prev}
        disabled={!hasPrev}
        aria-label="Sebelumnya"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-amber-100 disabled:opacity-30"
        style={{ color: AMBER }}
      >
        <SkipBack className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        onClick={() => isPlaying ? pause() : play()}
        aria-label={isPlaying ? 'Jeda' : 'Putar'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90"
        style={{ background: AMBER }}
      >
        {isPlaying
          ? <Pause className="h-4 w-4" strokeWidth={2} />
          : <Play className="h-4 w-4" strokeWidth={2} />
        }
      </button>

      {/* Skip forward */}
      <button
        type="button"
        onClick={next}
        disabled={!hasNext}
        aria-label="Berikutnya"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-amber-100 disabled:opacity-30"
        style={{ color: AMBER }}
      >
        <SkipForward className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold" style={{ color: AMBER }}>
          {titleLabel}
        </p>
        <p className="text-[11px] text-amber-600">
          {currentIndex + 1} / {segments.length}
        </p>
      </div>
    </div>
  );
}
