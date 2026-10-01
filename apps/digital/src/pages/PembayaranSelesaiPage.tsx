import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Clock, RotateCcw } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../context/AuthContext';
import Kelopak from '../components/Kelopak';

// Halaman tujuan setelah orang tua kembali dari halaman bayar Midtrans/Xendit.
// Status dibaca dari tabel `pembayaran` (diisi webhook) — bukan dari parameter URL,
// karena parameter URL bisa diubah siapa saja.

const sb = supabase as unknown as SupabaseClient;
type Status = 'memuat' | 'menunggu' | 'lunas' | 'gagal' | 'kedaluwarsa' | 'tidak_ditemukan';

const BATAS_TUNGGU_MS = 2 * 60 * 1000;

export default function PembayaranSelesaiPage() {
  const [params] = useSearchParams();
  const kode = params.get('order') ?? params.get('order_id') ?? params.get('external_id') ?? '';
  const { supabaseUser, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('memuat');
  const [lewatBatas, setLewatBatas] = useState(false);
  const [putaran, setPutaran] = useState(0);
  const mulai = useRef(Date.now());

  useEffect(() => {
    if (loading || !supabaseUser || !kode) return;
    let batal = false;
    let timer: ReturnType<typeof setTimeout>;
    const cek = async () => {
      const { data } = await sb.from('pembayaran').select('status').eq('kode_order', kode).maybeSingle();
      if (batal) return;
      const s = ((data as { status?: Status } | null)?.status ?? 'tidak_ditemukan') as Status;
      setStatus(s);
      if (s === 'menunggu') {
        if (Date.now() - mulai.current > BATAS_TUNGGU_MS) { setLewatBatas(true); return; }
        timer = setTimeout(cek, 3000);
      }
    };
    cek();
    return () => { batal = true; clearTimeout(timer); };
  }, [kode, supabaseUser, loading, putaran]);

  function cekLagi() {
    mulai.current = Date.now();
    setLewatBatas(false);
    setPutaran(n => n + 1);
  }

  let judul = 'Mengecek pembayaran…';
  let isi: React.ReactNode = 'Sebentar ya, kami sedang memastikan pembayaranmu sudah diterima.';
  let ikon = <Clock className="h-7 w-7" aria-hidden />;
  let aksi: React.ReactNode = null;

  if (!loading && !supabaseUser) {
    judul = 'Masuk untuk melihat status pembayaran';
    isi = 'Pembayaranmu tetap tercatat. Masuk dengan akun Rekah yang sama untuk melanjutkan.';
    aksi = <Link to="/login" className="inline-flex min-h-[48px] items-center rounded-full bg-rekah px-7 font-bricolage text-[15px] font-bold text-white no-underline hover:bg-rekah-tua">Masuk</Link>;
  } else if (!kode || status === 'tidak_ditemukan') {
    judul = 'Pembayaran tidak ditemukan';
    isi = 'Kami tidak menemukan pembayaran ini di akunmu. Kalau kamu baru saja membayar, coba buka halaman ini lagi dari tautan di emailmu, atau hubungi tim Rekah.';
    aksi = <Link to="/pricing" className="inline-flex min-h-[48px] items-center rounded-full bg-rekah px-7 font-bricolage text-[15px] font-bold text-white no-underline hover:bg-rekah-tua">Kembali ke paket</Link>;
  } else if (status === 'lunas') {
    judul = 'Pembayaran diterima. Selamat datang di Rekah!';
    isi = 'Langgananmu sudah aktif. Yuk mulai menemani si kecil hari ini.';
    ikon = <Check className="h-7 w-7" strokeWidth={3} aria-hidden />;
    aksi = (
      <button type="button" onClick={() => navigate('/dashboard/tier2')} className="inline-flex min-h-[48px] items-center rounded-full bg-rekah px-7 font-bricolage text-[15px] font-bold text-white hover:bg-rekah-tua">
        Masuk ke Rekah
      </button>
    );
  } else if (status === 'gagal' || status === 'kedaluwarsa') {
    judul = status === 'kedaluwarsa' ? 'Batas waktu pembayaran habis' : 'Pembayaran belum berhasil';
    isi = 'Tidak ada biaya yang ditarik. Kamu bisa memilih paket lagi kapan saja.';
    ikon = <RotateCcw className="h-7 w-7" aria-hidden />;
    aksi = <Link to="/pricing" className="inline-flex min-h-[48px] items-center rounded-full bg-rekah px-7 font-bricolage text-[15px] font-bold text-white no-underline hover:bg-rekah-tua">Pilih paket lagi</Link>;
  } else if (lewatBatas) {
    judul = 'Pembayaran belum terkonfirmasi';
    isi = 'Kalau kamu membayar lewat transfer bank, konfirmasinya bisa memerlukan beberapa menit. Kalau belum membayar, selesaikan dulu di halaman pembayaran.';
    aksi = (
      <button type="button" onClick={cekLagi} className="inline-flex min-h-[48px] items-center rounded-full border-2 border-rekah px-7 font-bricolage text-[15px] font-bold text-rekah hover:bg-rekah/5">
        Cek lagi
      </button>
    );
  }

  const berhasil = status === 'lunas';

  return (
    <div className="relative flex min-h-[calc(100vh-82px)] items-center justify-center overflow-hidden bg-kanvas px-4 py-16">
      <Kelopak aria-hidden rotate={90} className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 bg-mawar/40" />
      <Kelopak aria-hidden rotate={270} className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 bg-rekah/10" />
      <div className="relative w-full max-w-[460px] rounded-[28px] bg-white p-8 text-center shadow-[0_12px_40px_rgba(110,59,87,0.10)]" role="status" aria-live="polite">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${berhasil ? 'bg-daun/15 text-daun' : 'bg-rekah/10 text-rekah'}`}>
          {ikon}
        </span>
        <h1 className="mt-5 font-bricolage text-[24px] font-extrabold leading-tight text-pekat">{judul}</h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-pekat/65">{isi}</p>
        {aksi && <div className="mt-7">{aksi}</div>}
        {kode && <p className="mt-6 text-[12px] text-pekat/35">Kode pesanan: {kode}</p>}
      </div>
    </div>
  );
}
