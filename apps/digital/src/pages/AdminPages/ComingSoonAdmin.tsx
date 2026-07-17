import React from 'react';

// Shared stub for admin modules not yet built in this phased rollout - see
// chat history for the build order (Beranda -> Konten -> Forum & Konsultasi
// -> Anggota & Pembayaran -> Pengaturan).
export default function ComingSoonAdmin({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <div className="text-4xl">🚧</div>
      <h2 className="font-baloo text-[22px] font-bold text-stv-navy">{label} Segera Hadir</h2>
      <p className="max-w-[360px] text-[15px] text-stv-muted">
        Modul ini sedang dalam pengembangan dan akan segera tersedia.
      </p>
    </div>
  );
}
