import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, CreditCard, FileText, ChevronDown, ChevronUp } from 'lucide-react';

type BillingStatus = 'menunggu' | 'lunas' | 'terlambat';

interface SppBill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: BillingStatus;
  type: 'monthly' | 'one-time';
  month?: string;
  receiptUrl?: string;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const BILLS: SppBill[] = [
  { id: 'b1', description: 'SPP Bulan Juli 2026', amount: 1_500_000, dueDate: '2026-07-10', status: 'menunggu', type: 'monthly', month: 'Juli 2026' },
  { id: 'b2', description: 'Seragam Sekolah (2 set)', amount: 350_000, dueDate: '2026-07-15', status: 'menunggu', type: 'one-time' },
  { id: 'b3', description: 'SPP Bulan Juni 2026', amount: 1_500_000, dueDate: '2026-06-10', paidDate: '2026-06-08', status: 'lunas', type: 'monthly', month: 'Juni 2026', receiptUrl: '#' },
  { id: 'b4', description: 'SPP Bulan Mei 2026', amount: 1_500_000, dueDate: '2026-05-10', paidDate: '2026-05-07', status: 'lunas', type: 'monthly', month: 'Mei 2026', receiptUrl: '#' },
  { id: 'b5', description: 'Biaya Asesmen Awal', amount: 500_000, dueDate: '2026-04-20', paidDate: '2026-04-18', status: 'lunas', type: 'one-time', receiptUrl: '#' },
];

const STATUS_META: Record<BillingStatus, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  lunas:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Lunas', icon: CheckCircle },
  menunggu:  { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Belum Dibayar', icon: Clock },
  terlambat: { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Terlambat', icon: AlertCircle },
};

function BillCard({ bill, onPay }: { bill: SppBill; onPay: (id: string) => void }) {
  const { bg, text, label, icon: StatusIcon } = STATUS_META[bill.status];
  const isUnpaid = bill.status !== 'lunas';

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] ${bill.status === 'terlambat' ? 'border-red-200' : 'border-stv-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-baloo text-[16px] font-bold text-stv-navy">{bill.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${bg} ${text}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bill.type === 'monthly' ? 'bg-stv-sky-tint text-stv-sky-stroke' : 'bg-purple-50 text-purple-600'}`}>
              {bill.type === 'monthly' ? 'SPP Bulanan' : 'Satu Kali'}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-stv-muted">
            {bill.status === 'lunas' && bill.paidDate
              ? `Dibayar: ${formatDate(bill.paidDate)}`
              : `Jatuh tempo: ${formatDate(bill.dueDate)}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-baloo text-[20px] font-extrabold text-stv-navy">{formatIDR(bill.amount)}</p>
        </div>
      </div>

      {isUnpaid && (
        <button
          type="button"
          onClick={() => onPay(bill.id)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stv-sky-stroke py-3 font-baloo text-[15px] font-bold text-white transition hover:bg-stv-sky-stroke/90"
        >
          <CreditCard className="h-4 w-4" />
          Bayar Sekarang
        </button>
      )}
      {bill.status === 'lunas' && bill.receiptUrl && (
        <a
          href={bill.receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-stv-sky-stroke no-underline transition hover:opacity-75"
        >
          <FileText className="h-4 w-4" />
          Unduh Bukti Pembayaran
        </a>
      )}
    </div>
  );
}

export default function PembayaranSPPTier1() {
  const [bills] = useState<SppBill[]>(BILLS);
  const [historyOpen, setHistoryOpen] = useState(false);

  function handlePay(id: string) {
    alert(`TODO: Stripe Checkout untuk tagihan ${id}. Integrasi backend diperlukan.`);
  }

  const unpaidBills = bills.filter(b => b.status !== 'lunas');
  const paidBills = bills.filter(b => b.status === 'lunas');
  const totalUnpaid = unpaidBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      {/* Summary card */}
      {unpaidBills.length > 0 && (
        <div className="rounded-2xl bg-stv-sky p-6 text-white shadow-[0_8px_24px_rgba(16,58,107,.12)]">
          <p className="text-[14px] font-semibold text-white/80">Total Tagihan Belum Dibayar</p>
          <p className="font-baloo text-[34px] font-extrabold">{formatIDR(totalUnpaid)}</p>
          <p className="mt-1 text-[13px] text-white/70">{unpaidBills.length} tagihan menunggu pembayaran</p>
        </div>
      )}

      {unpaidBills.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
          <p className="font-baloo text-[16px] font-bold text-emerald-700">Semua tagihan sudah lunas!</p>
          <p className="text-[13px] text-emerald-600">Tidak ada tagihan yang perlu dibayar saat ini.</p>
        </div>
      )}

      {/* Unpaid bills */}
      {unpaidBills.length > 0 && (
        <div>
          <h2 className="mb-3 font-baloo text-[17px] font-bold text-stv-navy">Tagihan Belum Dibayar</h2>
          <div className="flex flex-col gap-3">
            {unpaidBills.map(b => (
              <BillCard key={b.id} bill={b} onPay={handlePay} />
            ))}
          </div>
        </div>
      )}

      {/* Payment notice */}
      <div className="rounded-2xl border border-stv-border bg-slate-50 p-4">
        <p className="text-[13px] text-stv-body">
          <strong className="text-stv-navy">Pembayaran aman via Stripe.</strong>{' '}
          Anda akan diarahkan ke halaman pembayaran Stripe yang aman. Kami tidak menyimpan data kartu Anda.
          Untuk pertanyaan tagihan, hubungi kami di{' '}
          <a href="https://wa.me/6281211470407" target="_blank" rel="noopener noreferrer" className="font-semibold text-stv-sky-stroke">WhatsApp</a>.
        </p>
      </div>

      {/* Payment history */}
      {paidBills.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen(o => !o)}
            className="flex w-full items-center justify-between rounded-2xl border border-stv-border bg-white p-4 text-left transition hover:bg-slate-50"
          >
            <span className="font-baloo text-[16px] font-bold text-stv-navy">Riwayat Pembayaran ({paidBills.length})</span>
            {historyOpen ? <ChevronUp className="h-5 w-5 text-stv-muted" /> : <ChevronDown className="h-5 w-5 text-stv-muted" />}
          </button>

          {historyOpen && (
            <div className="mt-3 flex flex-col gap-3">
              {paidBills.map(b => (
                <BillCard key={b.id} bill={b} onPay={handlePay} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
