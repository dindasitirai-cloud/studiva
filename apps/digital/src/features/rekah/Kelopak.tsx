import React from 'react';

interface KelopakProps {
  children?: React.ReactNode;
  /** Rotates the sharp corner (BL by default) to a different position */
  rotate?: 0 | 90 | 180 | 270;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

/** Signature petal shape: border-radius 70% 70% 70% 4px. */
export default function Kelopak({ children, rotate = 0, className = '', style, 'aria-hidden': ariaHidden }: KelopakProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={className}
      style={{
        borderRadius: '70% 70% 70% 4px',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
