import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="mt-4 text-h2 font-bold text-navy">Payment Failed</h1>
        <p className="mt-2 text-textlight">
          Pembayaran Anda tidak berhasil diproses. Ini bisa terjadi karena kartu ditolak,
          informasi yang tidak valid, atau Anda membatalkan proses pembayaran.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/pricing"
            className="min-h-[48px] w-full max-w-xs rounded-md bg-gold px-8 py-3 text-center font-semibold text-navy transition hover:bg-gold/90"
          >
            Try Again
          </Link>
          <a
            href="mailto:halo@studiva.id"
            className="min-h-[48px] w-full max-w-xs rounded-md border border-bordergray px-8 py-3 text-center font-semibold text-textdark transition hover:bg-white"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
