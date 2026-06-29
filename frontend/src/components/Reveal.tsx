import React from 'react';
import { useInView } from '../hooks/useInView';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/** Fades/slides content in once it scrolls into view, using the existing fade-in-up keyframe. */
export default function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${inView ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={inView && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
