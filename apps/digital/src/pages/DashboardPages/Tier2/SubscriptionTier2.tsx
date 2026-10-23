import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Receipt, ExternalLink } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { formatIDR } from '../../../lib/pricing';

// Langganan & Pembayaran — membaca tabel `langganan` dan `pembayaran` (Supabase, migrasi 004 & 031).
// Status pembayaran diisi oleh notifikasi Midtrans/Xendit, bukan oleh browser.

const sb = supabase as unknown as SupabaseClient;

interface BarisLangganan { status: string; akhir_periode: string | null }
interface BarisBayar {
  kode_order: string; paket: 'monthly' | 'quarterly' | 'yearly'; jumlah: number; penyedia: string;
  metode: string | null; status: 'menunggu' | 'lunas' | 'gagal' | 'kedaluwarsa';
  url_bayar: string | null; dibuat_pada: string; dilunasi_pada: string | null;
}

const NAMA_PAKET = { monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' } as const;
const LABEL_STATUS: Record<BarisBayar['status'], { teks: string; kelas: string }> = {
  lunas:       { teks: 'Lunas',               kelas: 'bg-daun/15 text-daun' },
  menunggu:    { teks: 'Menunggu pembayaran', kelas: 'bg-madu/25 text-pekat' },
  gagal:       { teks: 'Gagal',               kelas: 'bg-rekah/10 text-rekah-tua' },
  kedaluwarsa: { teks: 'Kedaluwarsa',         kelas: 'bg-pekat/5 text-pekat/60' },
};
const METODE: Record<string, string> = {
  qris: 'QRIS', gopay: 'GoPay', shopeepay: 'ShopeePay', bank_transfer: 'Transfer bank (VA)', echannel: 'Mandiri Bill',
  credit_card: 'Kartu kredit/debit', cstore: 'Gerai retail', ovo: 'OVO', dana: 'DANA',
};

const tgl = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export default function SubscriptionTier2() {
  const [langganan, setLanggananState] = useState<BarisLangganan | null>(null);
  const [riwayat, setRiwayat] = useState<BarisBayar[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let batal = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMemuat(false); return; }
      const [l, p] = await Promise.all([
        sb.from('langganan').select('status, akhir_periode').eq('id_orang_tua', user.id).maybeSingle(),
        sb.from('pembayaran')
          .select('kode_order, paket, jumlah, penyedia, metode, status, url_bayar, dibuat_pada, dilunasi_pada')
          .eq('id_orang_tua', user.id).order('dibuat_pada', { ascending: false }).limit(50),
      ]);
      if (batal) return;
      setLanggananState((l.data as BarisLangganan | null) ?? null);
      setRiwayat(((p.data as BarisBayar[] | null) ?? []));
      setMemuat(false);
    })();
    return () => { batal = true; };
  }, []);

  const aktif = !!langganan && langganan.status === 'aktif' && !!langganan.akhir_periode && new Date(langganan.akhir_periode) > new Date();
  const sisaHari = aktif ? Math.ceil((new Date(langganan!.akhir_periode!).getTime() - Date.now()) / 86_400_000) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-bricolage text-[28px] font-extrabold text-pekat">Langganan & Pembayaran</h1>
      <p className="mt-1 text-[15px] text-pekat/60">Status langganan Rekah dan riwayat pembayaranmu.</p>

      {/* ── Status langganan ─────────────────────────────────────── */}
      <section className="mt-6 rounded-[24px] border border-pekat/10 bg-white p-6">
        {memuat ? (
          <p className="text-[14px] text-pekat/50">Memuat…</p>
        ) : aktif ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-daun/15 px-3 py-1 text-[12px] font-bold text-daun">Aktif</span>
              <p className="mt-3 flex items-center gap-2 text-[15px] text-pekat">
                <CalendarDays className="h-4 w-4 text-pekat/50" aria-hidden />
                Berlaku sampai <strong>{tgl(langganan!.akhir_periode)}</strong>
              </p>
              <p className="mt-1 text-[13px] text-pekat/55">Sisa {sisaHari} hari. Langganan tidak diperpanjang otomatis.</p>
            </div>
            <Link to="/pricing" className="inline-flex min-h-[44px] items-center rounded-full border-2 border-rekah px-5 font-bricolage text-[14px] font-bold text-rekah no-underline hover:bg-rekah/5">
              Perpanjang lebih awal
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-pekat/5 px-3 py-1 text-[12px] font-bold text-pekat/60">
                {langganan?.akhir_periode ? 'Sudah berakhir' : 'Belum berlangganan'}
              </span>
              <p className="mt-3 text-[15px] text-pekat/70">
                {langganan?.akhir_periode
                  ? <>Langganan berakhir pada <strong>{tgl(langganan.akhir_periode)}</strong>. Data si kecil tetap aman menunggu.</>
                  : 'Pilih paket untuk mulai memakai Rekah.'}
              </p>
            </div>
            <Link to="/pricing" className="inline-flex min-h-[44px] items-center rounded-full bg-rekah px-6 font-bricolage text-[14px] font-bold text-white no-underline hover:bg-rekah-tua">
              Pilih paket
            </Link>
          </div>
        )}
      </section>

      {/* ── Riwayat pembayaran ───────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-bricolage text-[18px] font-bold text-pekat">
          <Receipt className="h-5 w-5 text-pekat/50" aria-hidden /> Riwayat pembayaran
        </h2>
        {!memuat && riwayat.length === 0 && (
          <p className="mt-3 rounded-[16px] bg-white px-5 py-4 text-[14px] text-pekat/55">Belum ada pembayaran.</p>
        )}
        {riwayat.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-[20px] border border-pekat/10 bg-white">
            {riwayat.map((b, i) => (
              <div key={b.kode_order} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 ${i ? 'border-t border-pekat/8' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-pekat">Rekah {NAMA_PAKET[b.paket]} · {formatIDR(b.jumlah)}</p>
                  <p className="mt-0.5 text-[12px] text-pekat/50">
                    {tgl(b.dibuat_pada)} · {b.kode_order}
                    {b.metode ? ` · ${METODE[b.metode] ?? b.metode}` : ''}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${LABEL_STATUS[b.status].kelas}`}>{LABEL_STATUS[b.status].teks}</span>
                {b.status === 'menunggu' && b.url_bayar && (
                  <a href={b.url_bayar} className="inline-flex items-center gap-1 text-[13px] font-bold text-rekah no-underline hover:underline">
                    Lanjutkan bayar <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
