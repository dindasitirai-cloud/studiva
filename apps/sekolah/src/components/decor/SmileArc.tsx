import React from 'react';

interface SmileArcProps {
  color?: string;
  className?: string;
}

/**
 * Hand-drawn-feeling underline echoing the smile in the Studiva house mark -
 * used beneath emphasized words in headings as the site's signature accent,
 * rather than a generic straight underline or gradient swoosh.
 */
export default function SmileArc({ color = '#FFD700', className = '' }: SmileArcProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 24"
      preserveAspectRatio="none"
      className={`pointer-events-none block w-full ${className}`}
    >
      <path
        d="M4 6c30 16 136 16 192 0"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
