import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Lock, Info } from 'lucide-react';
import PlanConfirmModal from '../components/PlanConfirmModal';
import Kelopak from '../components/Kelopak';
import { useAuth } from '../context/AuthContext';
import { PRICING, PLAN_ORDER, formatIDR } from '../lib/pricing';
import { Plan, Tier } from '../types';

// Halaman paket — khusus langganan Rekah (orang tua).
// Dibuka dari homepage, atau otomatis saat orang tua masuk tanpa langganan aktif
// (pesan gerbang dikirim lewat location.state.message).

const FITUR_REKAH = [
  'Bekal: Ajak Main, Kebiasaan Baik, dan Wawasan Tumbuh sesuai usia anak',
  'Kelola: susun irama hari keluarga dengan ringan',
  'Temani: perjalanan berpandu hari demi hari',
  'Bantu: pegangan saat menghadapi situasi sulit',
  'Dikurasi Psikolog Fitri Effendy, untuk anak usia 0–6 tahun',
];

const KETERANGAN: Record<Plan, string> = {
  monthly: 'Dibayar setiap bulan',
  quarterly: 'Dibayar setiap 3 bulan',
  yearly: 'Dibayar setahun sekali',
};

const TIER: Tier = 'tier2';

export default function PricingPage() {
  const { user, supabaseUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;
  const sudahMasuk = !!(user || supabaseUser);

  const [pilihan, setPilihan] = useState<Plan | null>(null);
  const [params, setParams] = useSearchParams();

  // Datang dari tautan konfirmasi email (/pricing?paket=monthly): buka konfirmasi paket otomatis.
  useEffect(() => {
    const paket = params.get('paket');
    if (!sudahMasuk || !paket || !(PLAN_ORDER as string[]).includes(paket)) return;
    setPilihan(paket as Plan);
    params.delete('paket');
    setParams(params, { replace: true });
  }, [sudahMasuk, params, setParams]);

  function pilihPaket(plan: Plan) {
    if (!sudahMasuk) {
      // Belum punya sesi: arahkan ke pendaftaran Rekah (bisa pindah ke Masuk dari sana).
      navigate('/daftar');
      return;
    }
    setPilihan(plan);
  }

  return (
    <div className="bg-kanvas">
      {/* ── Kepala halaman ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-pekat px-4 pb-24 pt-16 text-center sm:px-8">
        <Kelopak aria-hidden rotate={90} className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 bg-rekah/20" />
        <Kelopak aria-hidden rotate={270} className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 bg-rekah/10" />
        <div className="relative mx-auto max-w-[640px]">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-mawar">Langganan Rekah</p>
          <h1 className="font-bricolage text-[32px] font-extrabold leading-[1.1] text-white sm:text-[42px]">
            Satu langganan, semua isi Rekah.
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-white/65">
            Pilih durasi yang paling pas untuk keluarga kamu. Semua paket berisi fitur yang sama.
          </p>
        </div>
      </section>

      <section className="relative -mt-14 px-4 pb-20 sm:px-8">
        <div className="mx-auto max-w-[1040px]">
          {message && (
            <div className="mx-auto mb-6 flex max-w-[640px] items-start gap-2 rounded-[16px] bg-white px-5 py-4 text-[14px] text-pekat shadow-[0_4px_20px_rgba(110,59,87,0.08)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-rekah" aria-hidden />
              {message}
            </div>
          )}

          {/* ── Kartu paket ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PLAN_ORDER.map(plan => {
              const info = PRICING[TIER][plan];
              const unggulan = plan === 'yearly';
              return (
                <div
                  key={plan}
                  className={`relative flex flex-col rounded-[24px] bg-white p-7 ${
                    unggulan
                      ? 'border-2 border-rekah shadow-[0_10px_32px_rgba(224,82,107,0.16)]'
                      : 'border border-pekat/10 shadow-[0_4px_20px_rgba(110,59,87,0.06)]'
                  }`}
                >
                  {unggulan && (
                    <span className="absolute -top-3 left-7 rounded-full bg-rekah px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      Paling hemat
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold uppercase tracking-wider text-pekat/55">{info.label}</span>
                    {info.savingsPercent > 0 && (
                      <span className="rounded-full bg-daun/15 px-2 py-0.5 text-[11px] font-bold text-daun">Hemat {info.savingsPercent}%</span>
                    )}
                  </div>
                  <p className="mt-3 font-bricolage text-[34px] font-extrabold leading-none text-pekat">{formatIDR(info.amount)}</p>
                  <p className="mt-2 text-[13px] text-pekat/55">{KETERANGAN[plan]}</p>

                  <button
                    type="button"
                    onClick={() => pilihPaket(plan)}
                    className={`mt-6 flex min-h-[48px] items-center justify-center rounded-full font-bricolage text-[15px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 ${
                      unggulan
                        ? 'bg-rekah text-white shadow-[0_4px_16px_rgba(224,82,107,0.28)] hover:bg-rekah-tua'
                        : 'bg-fajar text-pekat hover:bg-mawar/40'
                    }`}
                  >
                    Pilih paket {info.label}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Isi langganan ───────────────────────────────────────── */}
          <div className="mt-8 rounded-[24px] border border-pekat/10 bg-white p-7 sm:p-9">
            <h2 className="font-bricolage text-[20px] font-bold text-pekat">Yang kamu dapatkan di setiap paket</h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FITUR_REKAH.map(f => (
                <li key={f} className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-pekat/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rekah/15 text-rekah">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-pekat/50">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Pembayaran aman. Kami tidak menyimpan data kartu kamu.
          </p>

          {!sudahMasuk && (
            <p className="mt-3 text-center text-[14px] text-pekat/65">
              Sudah punya akun Rekah?{' '}
              <Link to="/login" className="font-bold text-rekah no-underline hover:underline">Masuk</Link>
            </p>
          )}
        </div>
      </section>

      {pilihan && (
        <PlanConfirmModal tier={TIER} plan={pilihan} onClose={() => setPilihan(null)} />
      )}
    </div>
  );
}
