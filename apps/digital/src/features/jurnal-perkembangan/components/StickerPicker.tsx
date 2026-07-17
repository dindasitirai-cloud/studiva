import React from 'react';
import { STICKER_OPTIONS } from '../data/mockJurnalData';

interface Props {
  open: boolean;
  onPick: (emoji: string, bgColor: string) => void;
}

export default function StickerPicker({ open, onPick }: Props) {
  if (!open) return null;

  return (
    <div className="jp-fade-in mt-3 flex flex-wrap justify-center gap-2">
      {STICKER_OPTIONS.map(({ emoji, bgColor }) => (
        <button
          key={emoji}
          type="button"
          aria-label={`Tambah stiker ${emoji}`}
          onClick={() => onPick(emoji, bgColor)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-sm transition hover:scale-110"
          style={{ background: bgColor }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
