import React from 'react';

interface LogoRekahProps {
  size?: number;
  withWordmark?: boolean;
  /** Light variant for dark backgrounds */
  light?: boolean;
}

export default function LogoRekah({ size = 36, withWordmark = false, light = false }: LogoRekahProps) {
  const textColor = light ? '#F8B9D4' : '#F06BA8';

  return (
    <div className="flex items-center gap-2" role="img" aria-label="Rekah">
      <img
        src="/images/logo-rekah-icon.png"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
      {withWordmark && (
        <span
          className="font-fredoka font-bold leading-none select-none"
          style={{ fontSize: size * 0.72, color: textColor }}
          aria-hidden="true"
        >
          rekah
        </span>
      )}
    </div>
  );
}
