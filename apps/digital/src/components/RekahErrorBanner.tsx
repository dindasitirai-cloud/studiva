import React, { useEffect, useState } from 'react';

export default function RekahErrorBanner() {
  const [pesan, setPesan] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const msg = (e as CustomEvent<string>).detail;
      setPesan(msg);
      setTimeout(() => setPesan(null), 5000);
    }
    window.addEventListener('rekah:api-error', handler);
    return () => window.removeEventListener('rekah:api-error', handler);
  }, []);

  if (!pesan) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-[14px] bg-pekat/90 px-4 py-3 text-[13px] text-white shadow-xl backdrop-blur-sm"
    >
      {pesan}
    </div>
  );
}
