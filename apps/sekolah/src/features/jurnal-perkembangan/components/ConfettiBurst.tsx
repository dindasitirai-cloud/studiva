import React, { useEffect, useState } from 'react';

interface Piece {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
}

interface Props {
  x: number;
  y: number;
  onDone: () => void;
}

const CONFETTI_EMOJIS = ['🎉', '✨', '⭐', '🎊', '💛'];

export default function ConfettiBurst({ x, y, onDone }: Props) {
  const [pieces] = useState<Piece[]>(() =>
    CONFETTI_EMOJIS.map((emoji, i) => ({
      id: `${emoji}-${i}`,
      emoji,
      x: x + (i - 2) * 18,
      y,
      delay: i * 0.05,
    })),
  );

  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      {pieces.map(p => (
        <span
          key={p.id}
          className="jp-confetti"
          style={{ left: p.x, top: p.y, animationDelay: `${p.delay}s` }}
        >
          {p.emoji}
        </span>
      ))}
    </>
  );
}
