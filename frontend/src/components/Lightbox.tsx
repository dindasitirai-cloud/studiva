import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxImage {
  src: string;
  alt: string;
  caption: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const image = images[index];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stv-navy-dark/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.caption}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
        aria-label="Selanjutnya"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <p className="mt-4 text-center text-[15px] text-white/80">{image.caption}</p>
      </div>
    </div>
  );
}
