import React from 'react';

export default function RekahLoadingSkeleton() {
  return (
    <div
      className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center gap-6 bg-kanvas px-4"
      aria-label="Memuat..."
      role="status"
    >
      {/* Kelopak-shaped skeleton */}
      <div className="relative h-24 w-24 animate-pulse">
        <div
          className="absolute inset-0 bg-mawar opacity-60"
          style={{ borderRadius: '70% 70% 70% 4px' }}
        />
        <div
          className="absolute inset-3 bg-fajar opacity-80"
          style={{ borderRadius: '70% 70% 70% 4px' }}
        />
      </div>
      <div className="space-y-3 text-center">
        <div className="mx-auto h-4 w-36 animate-pulse rounded-full bg-mawar/60" />
        <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-mawar/40" />
      </div>
    </div>
  );
}
