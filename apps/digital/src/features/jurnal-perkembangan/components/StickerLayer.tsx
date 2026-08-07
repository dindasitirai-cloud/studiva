import React from 'react';
import { X } from 'lucide-react';
import { StickerData } from '../data/mockJurnalData';

interface Props {
  stickers: StickerData[];
  containerRef: React.RefObject<HTMLDivElement>;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

export default function StickerLayer({ stickers, containerRef, onMove, onDelete }: Props) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  function handlePointerDown(e: React.PointerEvent, sticker: StickerData) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLButtonElement;
    el.setPointerCapture(e.pointerId);

    const container = containerRef.current;
    if (!container) return;

    const pr = container.getBoundingClientRect();
    const sr = el.getBoundingClientRect();
    const ox = e.clientX - sr.left;
    const oy = e.clientY - sr.top;

    function onMove_(ev: PointerEvent) {
      const x = Math.min(Math.max(ev.clientX - pr.left - ox, 0), pr.width - 44);
      const y = Math.min(Math.max(ev.clientY - pr.top - oy, 0), pr.height - 44);
      onMove(sticker.id, x, y);
    }
    function onUp() {
      el.removeEventListener('pointermove', onMove_ as EventListener);
      el.removeEventListener('pointerup', onUp);
    }
    el.addEventListener('pointermove', onMove_ as EventListener);
    el.addEventListener('pointerup', onUp);
  }

  return (
    <>
      {stickers.map(st => (
        <div
          key={st.id}
          className="absolute"
          style={{ left: st.x, top: st.y, zIndex: 6 }}
          onMouseEnter={() => setHoveredId(st.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            type="button"
            aria-label={`Stiker ${st.emoji}`}
            onPointerDown={e => handlePointerDown(e, st)}
            className="flex h-11 w-11 cursor-grab items-center justify-center rounded-full text-2xl shadow-md active:cursor-grabbing"
            style={{ background: st.bgColor, userSelect: 'none', touchAction: 'none' }}
          >
            {st.emoji}
          </button>
          {hoveredId === st.id && (
            <button
              type="button"
              aria-label={`Hapus stiker ${st.emoji}`}
              onClick={() => onDelete(st.id)}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white"
              style={{ fontSize: 10 }}
            >
              <X className="h-2.5 w-2.5" strokeWidth={3} />
            </button>
          )}
        </div>
      ))}
    </>
  );
}
