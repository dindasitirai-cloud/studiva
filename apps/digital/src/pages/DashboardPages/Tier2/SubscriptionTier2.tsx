import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Receipt, ExternalLink, X } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { formatIDR } from '../../../lib/pricing';
import BotanicalStem, { type BotanicalConfig } from '../../../components/BotanicalStem';

// Langganan & Pembayaran — membaca tabel `langganan` dan `pembayaran` (Supabase, migrasi 004 & 031).
// Status pembayaran diisi oleh notifikasi Midtrans/Xendit, bukan oleh browser.
// Desain: design_handoff_langganan (Langganan.dc.html).

const sb = supabase as unknown as SupabaseClient;

type Paket = 'monthly' | 'quarterly' | 'yearly';
type StatusBayar = 'menunggu' | 'lunas' | 'gagal' | 'kedaluwarsa';

interface BarisLangganan { status: string; akhir_periode: string | null }
interface BarisBayar {
  kode_order: string; paket: Paket; jumlah: number; penyedia: string;
  metode: string | null; status: StatusBayar;
  url_bayar: string | null; dibuat_pada: string; dilunasi_pada: string | null;
}

const NAMA_PAKET: Record<Paket, string> = { monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' };
const BULAN_PAKET: Record<Paket, number> = { monthly: 1, quarterly: 3, yearly: 12 };

// Token status dari handoff. "Gagal" tidak ada di desain: memakai warna netral Kedaluwarsa.
const TOKEN_STATUS: Record<StatusBayar, { teks: string; soft: string; ink: string; Ikon: typeof Check }> = {
  lunas:       { teks: 'Lunas',               soft: '#E6F2D6', ink: '#3F6A1E', Ikon: Check },
  menunggu:    { teks: 'Menunggu pembayaran', soft: '#FFF3D0', ink: '#6B4A00', Ikon: Receipt },
  kedaluwarsa: { teks: 'Kedaluwarsa',         soft: '#F3ECEF', ink: '#6E5462', Ikon: Clock },
  gagal:       { teks: 'Gagal',               soft: '#F3ECEF', ink: '#6E5462', Ikon: X },
};

const METODE: Record<string, string> = {
  qris: 'QRIS', gopay: 'GoPay', shopeepay: 'ShopeePay', bank_transfer: 'Transfer bank (VA)', echannel: 'Mandiri Bill',
  credit_card: 'Kartu kredit/debit', cstore: 'Gerai retail', ovo: 'OVO', dana: 'DANA',
};

// Tautan bayar Midtrans/Xendit berlaku 24 jam. Tagihan "menunggu" yang lebih tua dari itu
// tidak bisa dibayar lagi; penyedia tidak selalu mengirim notifikasi kedaluwarsa bila
// orang tua belum memilih metode, jadi ditampilkan sebagai Kedaluwarsa di sini.
const BATAS_TAGIHAN_MS = 24 * 60 * 60 * 1000;
const statusTampil = (b: BarisBayar): StatusBayar =>
  b.status === 'menunggu' && Date.now() - new Date(b.dibuat_pada).getTime() > BATAS_TAGIHAN_MS ? 'kedaluwarsa' : b.status;

const BATAS_BARIS = 4;
const HARI_MS = 86_400_000;

const tgl = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

// Hiasan kebun di pojok kartu status (urutan & ukuran mengikuti handoff).
const KEBUN: { cfg: BotanicalConfig; right: number; bottom: number; w: number }[] = [
  { cfg: { type: 'foliage' },                                                 right: 168, bottom: -6,  w: 46 },
  { cfg: { type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' },              right: 120, bottom: 6,   w: 62 },
  { cfg: { type: 'daisy', bloom: '#FFE29A', center: '#F06BA8', bloom2: '#FFF3E6' }, right: 72, bottom: -2, w: 56 },
  { cfg: { type: 'bell', bloom: '#8FB8F7', bloom2: '#FFE29A' },               right: 26,  bottom: 4,   w: 60 },
  { cfg: { type: 'leaf', leaf: '#A7C63E' },                                   right: -4,  bottom: -10, w: 40 },
];

const GAYA = `
@keyframes lgSway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
.lg-sway{transform-origin:50% 100%;animation:lgSway 5s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.lg-sway{animation:none!important}.lg-transisi{transition:none!important}}
`;

export default function SubscriptionTier2() {
  const [langganan, setLanggananState] = useState<BarisLangganan | null>(null);
  const [riwayat, setRiwayat] = useState<BarisBayar[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [semua, setSemua] = useState(false);

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

  const akhir = langganan?.akhir_periode ? new Date(langganan.akhir_periode) : null;
  const aktif = !!akhir && langganan?.status === 'aktif' && akhir > new Date();
  const sisaHari = aktif && akhir ? Math.ceil((akhir.getTime() - Date.now()) / HARI_MS) : 0;

  // Paket yang sedang berjalan = pembayaran lunas terakhir. Bisa kosong bila langganan
  // diaktifkan admin tanpa pembayaran; label paket lalu disembunyikan.
  const lunasTerakhir = riwayat.find(b => b.status === 'lunas');
  const paketAktif: Paket | null = lunasTerakhir?.paket ?? null;
  // Panjang periode = jumlah hari dalam (akhir_periode − durasi paket). Tidak pernah lebih
  // pendek dari sisa hari (mis. perpanjangan lebih awal menumpuk dua periode).
  let hariPeriode = Math.max(1, sisaHari);
  if (akhir && paketAktif) {
    const mulai = new Date(akhir);
    mulai.setMonth(mulai.getMonth() - BULAN_PAKET[paketAktif]);
    hariPeriode = Math.max(sisaHari, Math.round((akhir.getTime() - mulai.getTime()) / HARI_MS), 1);
  }
  const persenSisa = Math.min(100, Math.max(0, (sisaHari / hariPeriode) * 100));

  const baris = riwayat.map(b => ({ ...b, tampil: statusTampil(b) }));
  const nMenunggu = baris.filter(b => b.tampil === 'menunggu').length;
  const terlihat = semua ? baris : baris.slice(0, BATAS_BARIS);

  return (
    <div className="relative min-h-full overflow-hidden bg-kanvas font-nunito text-pekat">
      <style>{GAYA}</style>
      <div aria-hidden className="pointer-events-none absolute -right-[60px] -top-10 h-[260px] w-[260px] rounded-full bg-[#FCE3EE] opacity-60" />

      <div className="relative mx-auto max-w-[840px] px-5 pb-24 pt-10 sm:px-7 sm:pt-16">
        <h1 className="font-fredoka text-[clamp(30px,4.4vw,42px)] font-bold leading-[1.1] text-pekat">Langganan &amp; Pembayaran</h1>
        <p className="mt-2.5 text-[17px] font-semibold text-[#8A5A73]">Status langganan Rekah dan riwayat pembayaranmu.</p>

        {/* ── Status langganan ─────────────────────────────────────── */}
        <section className="relative mt-8 overflow-hidden rounded-[32px] border-2 border-[#FCE3EE] bg-white shadow-[0_24px_40px_-34px_#6E3B57]">
          {aktif && (
            <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[120px] w-[250px]">
              <div className="absolute -bottom-[70px] -right-[50px] h-[120px] w-[320px] rounded-full bg-[#EEFFD4]" />
              {KEBUN.map((k, i) => (
                <div
                  key={i}
                  className="lg-sway absolute"
                  style={{ right: k.right, bottom: k.bottom, width: k.w, height: k.w * 1.5, animationDuration: `${5 + (i % 3)}s`, animationDelay: `${-i}s` }}
                >
                  <BotanicalStem cfg={k.cfg} />
                </div>
              ))}
            </div>
          )}

          {/* Di layar sempit tombol turun ke bawah info; ruang bawah dilebihkan supaya tidak menimpa kebun. */}
          <div className={`relative flex flex-wrap items-start justify-between gap-6 px-6 pt-7 sm:px-8 ${aktif ? 'pb-[132px] lg:pb-8' : 'pb-8'}`}>
            {memuat ? (
              <p className="min-h-[120px] text-[15px] font-semibold text-[#8A5A73]">Memuat…</p>
            ) : aktif ? (
              <>
                <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex items-center gap-[7px] rounded-full bg-[#E6F2D6] py-1.5 pl-2.5 pr-3.5 text-[14px] font-extrabold text-[#3F6A1E]">
                      <span className="h-2 w-2 rounded-full bg-[#6F9E3F]" />Aktif
                    </span>
                    {paketAktif && <span className="text-[14px] font-extrabold text-[#8A5A73]">Rekah {NAMA_PAKET[paketAktif]}</span>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold text-[#8A5A73]">Berlaku sampai</span>
                    <span className="font-fredoka text-[30px] font-bold leading-tight text-pekat">{tgl(langganan!.akhir_periode)}</span>
                  </div>
                  <div className="flex max-w-[340px] flex-col gap-2">
                    <div
                      role="progressbar"
                      aria-label="Sisa hari langganan"
                      aria-valuemin={0}
                      aria-valuemax={hariPeriode}
                      aria-valuenow={sisaHari}
                      aria-valuetext={`Sisa ${sisaHari} dari ${hariPeriode} hari`}
                      className="h-2.5 overflow-hidden rounded-full bg-[#FCE3EE]"
                    >
                      <div className="h-full rounded-full bg-rekah" style={{ width: `${persenSisa.toFixed(1)}%` }} />
                    </div>
                    <p className="text-[15px] font-semibold text-[#8A5A73]">Sisa {sisaHari} hari. Langganan tidak diperpanjang otomatis.</p>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="lg-transisi inline-flex h-14 items-center rounded-full border-2 border-rekah bg-white px-[26px] font-fredoka text-[18px] font-bold text-[#D2478A] no-underline transition-colors duration-200 hover:bg-rekah hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
                >
                  Perpanjang lebih awal
                </Link>
              </>
            ) : (
              <>
                <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
                  <span className="w-max rounded-full bg-[#F3ECEF] px-3.5 py-1.5 text-[14px] font-extrabold text-[#6E5462]">
                    {akhir ? 'Sudah berakhir' : 'Belum berlangganan'}
                  </span>
                  <p className="text-[16px] font-semibold leading-[1.6] text-[#8A5A73]">
                    {akhir
                      ? <>Langganan berakhir pada <strong className="text-pekat">{tgl(langganan!.akhir_periode)}</strong>. Data si kecil tetap aman menunggu.</>
                      : 'Pilih paket untuk mulai memakai Rekah.'}
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="lg-transisi inline-flex h-14 items-center rounded-full bg-rekah px-[26px] font-fredoka text-[18px] font-bold text-white no-underline transition-colors duration-200 hover:bg-[#E0559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
                >
                  Pilih paket
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ── Riwayat pembayaran ───────────────────────────────────── */}
        <div className="mt-[52px] flex items-center gap-3">
          <div aria-hidden className="h-[42px] w-7 flex-none">
            <BotanicalStem cfg={{ type: 'sprig', bloom: '#F06BA8', bloom2: '#FFE29A' }} />
          </div>
          <h2 className="font-fredoka text-[24px] font-bold text-pekat">Riwayat pembayaran</h2>
        </div>

        {nMenunggu > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-[20px] bg-[#FFF3D0] px-[18px] py-3.5 text-[15px] font-bold leading-[1.45] text-[#6B4A00]">
            <Clock className="h-5 w-5 flex-none" strokeWidth={2.2} aria-hidden />
            <span>Ada {nMenunggu} tagihan yang belum dibayar.</span>
          </div>
        )}

        {!memuat && baris.length === 0 && (
          <p className="mt-4 rounded-[28px] border-2 border-[#FCE3EE] bg-white px-[26px] py-5 text-[15px] font-semibold text-[#8A5A73]">Belum ada pembayaran.</p>
        )}

        {terlihat.length > 0 && (
          <ul className="mt-4 overflow-hidden rounded-[28px] border-2 border-[#FCE3EE] bg-white">
            {terlihat.map((b, i) => {
              const t = TOKEN_STATUS[b.tampil];
              const meta = [tgl(b.dibuat_pada), b.kode_order, b.metode ? (METODE[b.metode] ?? b.metode) : null].filter(Boolean).join(' · ');
              return (
                <li key={b.kode_order} className={`flex flex-wrap items-center gap-4 px-5 py-5 sm:px-[26px] ${i ? 'border-t border-[#FCE3EE]' : ''}`}>
                  {/* Ikon + teks tidak pernah terpisah; status & aksi yang turun ke bawah di layar sempit. */}
                  <div className="flex min-w-0 flex-[1_1_300px] items-center gap-4">
                    <span aria-hidden className="flex h-11 w-11 flex-none items-center justify-center rounded-[22px_22px_22px_8px]" style={{ background: t.soft, color: t.ink }}>
                      <t.Ikon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[17px] font-extrabold text-pekat">Rekah {NAMA_PAKET[b.paket]} · {formatIDR(b.jumlah)}</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#8A5A73] [overflow-wrap:anywhere]">{meta}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3.5 max-sm:pl-[60px]">
                    <span className="whitespace-nowrap rounded-full px-3.5 py-[7px] text-[14px] font-extrabold" style={{ background: t.soft, color: t.ink }}>{t.teks}</span>
                    {b.tampil === 'menunggu' && b.url_bayar && (
                      <a
                        href={b.url_bayar}
                        className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-rekah px-4 text-[15px] font-extrabold text-white no-underline hover:bg-[#E0559A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
                      >
                        Lanjutkan bayar <ExternalLink className="h-[15px] w-[15px]" strokeWidth={2.6} aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {baris.length > BATAS_BARIS && (
          <button
            type="button"
            onClick={() => setSemua(s => !s)}
            aria-expanded={semua}
            className="mx-auto mt-3.5 flex h-12 items-center rounded-full px-5 text-[15px] font-extrabold text-pekat hover:bg-[#FCE3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {semua ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${baris.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
