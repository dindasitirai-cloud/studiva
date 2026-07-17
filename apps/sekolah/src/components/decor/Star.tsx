import React from 'react';

interface StarProps {
  color: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function Star({ color, size = 24, className = '', animate = false }: StarProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`pointer-events-none absolute ${animate ? 'animate-floaty' : ''} ${className}`}
    >
      <path
        d="M12 1.5c.4 3.3 1.1 5.7 2.2 7.1 1.4 1.7 3.7 2.5 7.1 2.4-3.3.4-5.7 1.1-7.1 2.2-1.7 1.4-2.5 3.7-2.4 7.1-.4-3.3-1.1-5.7-2.2-7.1-1.4-1.7-3.7-2.5-7.1-2.4 3.3-.4 5.7-1.1 7.1-2.2 1.7-1.4 2.5-3.7 2.4-7.1z"
        fill={color}
      />
    </svg>
  );
}
