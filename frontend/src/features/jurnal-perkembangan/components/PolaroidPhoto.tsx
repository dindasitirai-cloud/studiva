import React from 'react';
import { PhotoData } from '../data/mockJurnalData';

interface Props {
  photo: PhotoData;
}

export default function PolaroidPhoto({ photo }: Props) {
  const hasPhoto = Boolean(photo.src);

  return (
    <div
      className="relative mx-auto my-4"
      style={{
        background: '#fff',
        padding: '10px 10px 8px',
        boxShadow: '0 6px 14px rgba(60,70,110,.22)',
        width: 160,
        transform: `rotate(${photo.rotation}deg)`,
      }}
    >
      {/* Washi tape */}
      <span
        className="absolute -top-3 left-1/2 -translate-x-1/2 block rounded-sm"
        style={{
          width: 86,
          height: 22,
          opacity: 0.9,
          transform: `translateX(-50%) rotate(-3deg)`,
        }}
      >
        <span
          className="block h-full w-full rounded-sm"
          style={{
            background:
              photo.washiVariant === 'yellow'
                ? 'repeating-linear-gradient(45deg,#f7d98b 0 8px,#fdf1cf 8px 16px)'
                : 'repeating-linear-gradient(45deg,#f6bdd1 0 8px,#fde3ee 8px 16px)',
          }}
        />
      </span>

      {/* Photo area */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: 120, background: hasPhoto ? undefined : photo.gradientBg }}
      >
        {hasPhoto ? (
          <img src={photo.src} alt={photo.caption} className="h-full w-full object-cover" />
        ) : (
          <span style={{ fontSize: 44 }}>{photo.placeholderEmoji}</span>
        )}
      </div>

      {/* Caption */}
      <p
        className="mt-1 text-center font-caveat"
        style={{ fontSize: 16, color: '#55618a' }}
      >
        {photo.caption}
      </p>
    </div>
  );
}
