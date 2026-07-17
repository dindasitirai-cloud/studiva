import React from 'react';

interface SmilingHouseIconProps {
  className?: string;
}

/**
 * Decorative reinterpretation of the Studiva house-and-smile mark, used as
 * hero/illustration art in place of stock photography (we have no real
 * family photos to use, and a generic stock photo would undercut the brand
 * mark we already have - this keeps the hero honest and on-brand).
 */
export default function SmilingHouseIcon({ className = '' }: SmilingHouseIconProps) {
  return (
    <svg viewBox="0 0 320 320" className={className} role="img" aria-label="Ilustrasi rumah Studiva yang tersenyum">
      <rect x="70" y="140" width="180" height="130" rx="28" fill="#FFFFFF" stroke="#003366" strokeWidth="8" />
      <path
        d="M40 150 L160 60 L280 150"
        fill="none"
        stroke="#FFD700"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="125" cy="190" r="11" fill="#003366" />
      <circle cx="195" cy="190" r="11" fill="#003366" />
      <path
        d="M118 222c14 18 70 18 84 0"
        fill="none"
        stroke="#003366"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="86" y="246" width="148" height="34" rx="17" fill="#5DADE2" stroke="#003366" strokeWidth="6" />
      <rect x="148" y="253" width="24" height="20" rx="4" fill="#FFD700" />
    </svg>
  );
}
