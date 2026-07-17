import React from 'react';

interface BlobProps {
  color: string;
  className?: string;
  size?: number;
  blur?: boolean;
  animate?: boolean;
}

/**
 * Organic background shape using the well-known asymmetric border-radius
 * trick instead of a hand-authored SVG path - cheap to color/resize/reuse
 * and reads as "hand-drawn blob" rather than a hard geometric circle.
 */
export default function Blob({ color, className = '', size = 220, blur = true, animate = false }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-blob ${blur ? 'opacity-70' : 'opacity-100'} ${
        animate ? 'animate-floaty' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        filter: blur ? 'blur(2px)' : undefined,
      }}
    />
  );
}
