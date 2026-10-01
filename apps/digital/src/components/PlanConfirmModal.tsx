import React, { useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import PaymentButton, { type PenyediaBayar } from './PaymentButton';
import { Plan, Tier } from '../types';
import { PRICING, TIER_LABELS, formatIDR } from '../lib/pricing';

interface PlanConfirmModalProps {
  tier: Tier;
  plan: Plan;
  onClose: () => void;
}

// Penyedia yang ditampilkan. Masa uji coba: keduanya ("midtrans,xendit").
// Setelah memilih satu, isi REACT_APP_PENYEDIA_BAYAR di Vercel dengan satu nama saja.
const PENYEDIA: PenyediaBayar[] = (process.env.REACT_APP_PENYEDIA_BAYAR || 'midtrans,xendit')
  .split(',').map(s => s.trim()).filter((s): s is PenyediaBayar => s === 'midtrans' || s === 'xendit');
const NAMA_PENYEDIA: Record<PenyediaBayar, string> = { midtrans: 'Midtrans', xendit: 'Xendit' };

// Konfirmasi sebelum diarahkan ke halaman pembayaran — tampilan Rekah.
export default function PlanConfirmModal({ tier, plan, onClose }: PlanConfirmModalProps) {
  const info = PRICING[tier][plan];

  useEffect(() => {
    const tutup = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-pekat/40 px-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="konfirmasi-paket-judul"
        className="w-full max-w-[440px] rounded-t-[24px] bg-white p-7 shadow-[0_16px_48px_rgba(110,59,87,0.18)] sm:rounded-[24px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="konfirmasi-paket-judul" className="font-bricolage text-[22px] font-extrabold text-pekat">Konfirmasi paket</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-pekat/50 transition hover:bg-kanvas hover:text-pekat">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 rounded-[16px] bg-fajar px-5 py-4">
          <p className="text-[13px] text-pekat/60">{TIER_LABELS[tier]} · paket {info.label}</p>
          <p className="mt-1 font-bricolage text-[30px] font-extrabold leading-none text-pekat">{formatIDR(info.amount)}</p>
          {info.savingsPercent > 0 && (
            <span className="mt-2 inline-block rounded-full bg-daun/15 px-2 py-0.5 text-[11px] font-bold text-daun">Hemat {info.savingsPercent}%</span>
          )}
        </div>

        <p className="mt-4 flex items-start gap-2 text-[13px] leading-[1.6] text-pekat/60">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Kamu akan diarahkan ke halaman pembayaran yang aman. Bisa bayar dengan QRIS, transfer bank (virtual account), atau e-wallet.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {(PENYEDIA.length ? PENYEDIA : [undefined]).map((p, i) => (
            <PaymentButton
              key={p ?? 'bawaan'}
              tier={tier}
              plan={plan}
              penyedia={p}
              className={`flex min-h-[48px] w-full items-center justify-center rounded-full px-6 font-bricolage text-[15px] font-bold transition disabled:opacity-60 ${
                i === 0
                  ? 'bg-rekah text-white shadow-[0_4px_16px_rgba(224,82,107,0.28)] hover:bg-rekah-tua'
                  : 'border-2 border-rekah text-rekah hover:bg-rekah/5'
              }`}
            >
              {PENYEDIA.length > 1 && p ? `Bayar lewat ${NAMA_PENYEDIA[p]}` : 'Lanjut ke pembayaran'}
            </PaymentButton>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full px-6 font-bricolage text-[15px] font-bold text-pekat/60 transition hover:bg-kanvas"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
