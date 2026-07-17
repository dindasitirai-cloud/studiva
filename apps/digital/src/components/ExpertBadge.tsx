import React from 'react';

interface ExpertBadgeProps {
  label?: string | null;
  credentials?: string;
  className?: string;
}

export default function ExpertBadge({ label, credentials, className = '' }: ExpertBadgeProps) {
  return (
    <span
      title={credentials}
      className={`inline-flex items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-navy ${className}`}
    >
      👩‍⚕️ {label || 'Expert - Founder'}
    </span>
  );
}
