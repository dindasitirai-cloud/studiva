import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check, ChevronLeft, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlanConfirmModal from '../components/PlanConfirmModal';
import LogoRekah from '../components/LogoRekah';
import Kelopak from '../components/Kelopak';
import { Plan, Tier } from '../types';

// Halaman pendaftaran — khusus akun Rekah (orang tua).
// Akun Sekolah Studiva & guru tidak didaftarkan dari sini.
// Alur: 1) pilih paket → 2) buat akun → lanjut pembayaran (PlanConfirmModal).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FITUR_REKAH = [
  'Bekal: Ajak Main, Kebiasaan Baik, dan Wawasan Tumbuh sesuai usia anak',
  'Kelola: susun irama hari keluarga dengan ringan',
  'Temani: perjalanan berpandu hari demi hari',
  'Bantu: pegangan saat menghadapi situasi sulit',
  'Dikurasi Psikolog Fitri Effendy, untuk anak usia 0–6 tahun',
];

const PAKET: { id: Plan; label: string; harga: string; hemat: string | null; unggulan: boolean }[] = [
  { id: 'monthly',   label: 'Bulanan', harga: 'Rp 79.000',  hemat: null,        unggulan: false },
  { id: 'quarterly', label: '3 Bulan', harga: 'Rp 200.000', hemat: 'Hemat 15%', unggulan: false },
  { id: 'yearly',    label: 'Tahunan', harga: 'Rp 650.000', hemat: 'Hemat 30%', unggulan: true },
];

const NAMA_PAKET: Record<Plan, string> = { monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' };

type Langkah = 'paket' | 'akun';

interface FormState {
  namaLengkap: string; email: string; password: string; konfirmasiPassword: string; setuju: boolean;
}
type FormErrors = Partial<Record<keyof FormState, string>>;

// ── Penanda langkah ──────────────────────────────────────────────────────────

function PenandaLangkah({ aktif }: { aktif: Langkah }) {
  const daftar: { id: Langkah; label: string }[] = [{ id: 'paket', label: 'Pilih paket' }, { id: 'akun', label: 'Buat akun' }];
  const idx = daftar.findIndex(d => d.id === aktif);
  return (
    <ol className="mb-8 flex items-center gap-3" aria-label="Langkah pendaftaran">
      {daftar.map((d, i) => {
        const selesai = i < idx;
        const kini = i === idx;
        return (
          <li key={d.id} className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${
                  selesai ? 'bg-daun text-white' : kini ? 'bg-rekah text-white' : 'border-2 border-pekat/15 text-pekat/40'
                }`}
                aria-current={kini ? 'step' : undefined}
              >
                {selesai ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className={`text-[13px] font-semibold ${kini ? 'text-pekat' : 'text-pekat/45'}`}>{d.label}</span>
            </span>
            {i < daftar.length - 1 && <span aria-hidden className="h-[2px] w-8 rounded-full bg-pekat/10" />}
          </li>
        );
      })}
    </ol>
  );
}

// ── Kekuatan password ────────────────────────────────────────────────────────

function KekuatanPassword({ password }: { password: string }) {
  const s = password.length === 0 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2;
  if (s === 0) return null;
  const warna = ['', 'bg-rekah-tua', 'bg-madu', 'bg-daun'];
  const label = ['', 'Lemah', 'Cukup', 'Kuat'];
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3].map(n => <div key={n} className={`h-1.5 flex-1 rounded-full ${s >= n ? warna[s] : 'bg-pekat/10'}`} />)}
      </div>
      <span className="text-[11px] font-semibold text-pekat/60">{label[s]}</span>
    </div>
  );
}

// ── Halaman ──────────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const { signup } = useAuth();
  const [langkah, setLangkah]         = useState<Langkah>('paket');
  const [paket, setPaket]             = useState<Plan | null>(null);
  const [konfirmasi, setKonfirmasi]   = useState<{ tier: Tier; plan: Plan } | null>(null);
  const [showPass, setShowPass]       = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [cekEmail, setCekEmail]       = useState(false);
  const [form, setForm] = useState<FormState>({ namaLengkap: '', email: '', password: '', konfirmasiPassword: '', setuju: false });
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
    setApiError(null);
  }

  function validasi(): boolean {
    const e: FormErrors = {};
    if (!form.namaLengkap.trim()) e.namaLengkap = 'Nama wajib diisi.';
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password) e.password = 'Password wajib diisi.';
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    if (!form.konfirmasiPassword) e.konfirmasiPassword = 'Konfirmasi password wajib diisi.';
    else if (form.password !== form.konfirmasiPassword) e.konfirmasiPassword = 'Password tidak cocok.';
    if (!form.setuju) e.setuju = 'Setujui syarat & kebijakan privasi untuk melanjutkan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleDaftar() {
    if (!validasi()) return;
    setSubmitting(true); setApiError(null);
    try {
      // TODO: teks kebijakan privasi final oleh manusia + tinjauan hukum sebelum live
      const { perluKonfirmasiEmail } = await signup({
        email: form.email, password: form.password, name: form.namaLengkap, role: 'parent', consentDiberikan: form.setuju,
        // Setelah konfirmasi email, orang tua kembali ke halaman paket dan langsung melihat konfirmasi pembayaran.
        emailRedirectTo: `${window.location.origin}/pricing${paket ? `?paket=${paket}` : ''}`,
      });
      if (perluKonfirmasiEmail) { setCekEmail(true); return; }
      if (paket) setKonfirmasi({ tier: 'tier2', plan: paket });
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : null) || (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg || 'Gagal membuat akun. Periksa kembali data kamu atau coba lagi.');
    } finally { setSubmitting(false); }
  }

  const inputCls = (f: keyof FormErrors) =>
    `w-full min-h-[52px] rounded-[14px] border bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:outline-none focus:ring-2 ${
      errors[f] ? 'border-rekah-tua focus:ring-rekah-tua/20' : 'border-daun/30 focus:border-rekah focus:ring-rekah/20'
    }`;

  const Galat = ({ f }: { f: keyof FormErrors }) =>
    errors[f] ? <p className="mt-1 flex items-center gap-1 text-[12px] text-rekah-tua"><AlertCircle className="h-3 w-3" aria-hidden />{errors[f]}</p> : null;

  return (
    <div className="flex min-h-[calc(100vh-82px)]">

      {/* ── Panel kiri, branding ─────────────────────────────────────── */}
      <div className="relative hidden w-[40%] shrink-0 flex-col justify-between overflow-hidden bg-pekat p-12 lg:flex">
        <Kelopak aria-hidden rotate={90} className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 bg-rekah/20" />
        <Kelopak aria-hidden rotate={270} className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 bg-rekah/10" />

        <div className="relative">
          <LogoRekah size={40} withWordmark light />
        </div>

        <div className="relative">
          <h2 className="mb-4 font-bricolage text-[32px] font-extrabold leading-[1.1] text-white">
            Mulai menemani<br />si kecil bersama Rekah.
          </h2>
          <p className="mb-10 text-[15px] leading-[1.7] text-white/60">
            Satu ajakan sederhana setiap hari, sesuai usia dan nilai keluarga kamu.
          </p>
          <ul className="space-y-3">
            {FITUR_REKAH.map(item => (
              <li key={item} className="flex items-start gap-3 text-[14px] leading-[1.5] text-white/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rekah/25 text-mawar">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[13px] text-white/30">
          © {new Date().getFullYear()} Rekah · oleh Psikolog Fitri Effendy
        </p>
      </div>

      {/* ── Panel kanan ──────────────────────────────────────────────── */}
      <div className="flex flex-1 justify-center bg-kanvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-[480px]">

          <PenandaLangkah aktif={langkah} />

          {/* ── Langkah 1: pilih paket ─────────────────────────────── */}
          {langkah === 'paket' && (
            <>
              <h1 className="mb-1 font-bricolage text-[28px] font-extrabold text-pekat sm:text-[32px]">Pilih paket Rekah</h1>
              <p className="mb-7 text-[15px] text-pekat/60">Semua paket berisi fitur yang sama. Kamu bisa berlangganan kembali kapan saja.</p>

              <div className="flex flex-col gap-3">
                {PAKET.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPaket(p.id); setLangkah('akun'); }}
                    className={`relative flex items-center justify-between rounded-[18px] border-2 bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 ${
                      p.unggulan ? 'border-rekah shadow-[0_6px_22px_rgba(224,82,107,0.16)]' : 'border-pekat/10 hover:border-rekah/40'
                    }`}
                  >
                    {p.unggulan && (
                      <span className="absolute -top-3 left-5 rounded-full bg-rekah px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                        Paling hemat
                      </span>
                    )}
                    <span>
                      <span className="flex items-center gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-pekat/55">{p.label}</span>
                        {p.hemat && <span className="rounded-full bg-daun/15 px-2 py-0.5 text-[11px] font-bold text-daun">{p.hemat}</span>}
                      </span>
                      <span className="mt-1 block font-bricolage text-[26px] font-extrabold leading-none text-pekat">{p.harga}</span>
                    </span>
                    <span className={`rounded-full px-5 py-2.5 font-bricolage text-[15px] font-bold ${p.unggulan ? 'bg-rekah text-white' : 'bg-fajar text-pekat'}`}>
                      Pilih
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-pekat/50">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Pembayaran aman. Kami tidak menyimpan data kartu kamu.
              </p>
            </>
          )}

          {/* ── Setelah daftar: konfirmasi email dulu ─────────────── */}
          {cekEmail && (
            <div className="rounded-[24px] bg-white p-7 shadow-[0_12px_40px_rgba(110,59,87,0.10)]" role="status" aria-live="polite">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rekah/10 text-rekah">
                <Mail className="h-6 w-6" aria-hidden />
              </span>
              <h1 className="mt-4 font-bricolage text-[26px] font-extrabold leading-tight text-pekat">Cek emailmu dulu, ya</h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-pekat/65">
                Kami mengirim tautan konfirmasi ke <strong className="text-pekat">{form.email}</strong>. Buka tautan itu, lalu kamu akan
                langsung diarahkan ke pembayaran paket <strong className="text-pekat">{paket ? NAMA_PAKET[paket] : 'pilihanmu'}</strong>.
              </p>
              <p className="mt-3 text-[13px] leading-[1.6] text-pekat/50">
                Tidak ada di kotak masuk? Cek folder Spam atau Promosi. Tautan dibuka di perangkat ini atau perangkat lain sama saja.
              </p>
            </div>
          )}

          {/* ── Langkah 2: buat akun ──────────────────────────────── */}
          {langkah === 'akun' && !cekEmail && (
            <>
              <button
                type="button"
                onClick={() => setLangkah('paket')}
                className="mb-6 flex items-center gap-1 text-[14px] font-semibold text-pekat/55 transition hover:text-pekat"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden /> Ganti paket
              </button>

              <h1 className="mb-1 font-bricolage text-[28px] font-extrabold text-pekat sm:text-[32px]">Buat akun Rekah</h1>
              <p className="mb-6 text-[15px] text-pekat/60">Isi data di bawah, lalu lanjut ke pembayaran.</p>

              {paket && (
                <div className="mb-5 flex items-center justify-between rounded-[14px] bg-fajar px-4 py-3 text-[14px]">
                  <span className="text-pekat/70">Paket dipilih: <strong className="text-pekat">{NAMA_PAKET[paket]}</strong></span>
                  <button type="button" onClick={() => setLangkah('paket')} className="text-[13px] font-semibold text-rekah hover:underline">Ubah</button>
                </div>
              )}

              {apiError && (
                <div className="mb-5 flex items-start gap-2 rounded-xl bg-rekah/10 px-4 py-3 text-[14px] text-rekah-tua">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{apiError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="daftar-nama" className="mb-1.5 block text-[13px] font-semibold text-pekat">Nama lengkap</label>
                  <input id="daftar-nama" type="text" value={form.namaLengkap} onChange={e => setField('namaLengkap', e.target.value)} placeholder="Nama kamu" autoComplete="name" className={inputCls('namaLengkap')} />
                  <Galat f="namaLengkap" />
                </div>
                <div>
                  <label htmlFor="daftar-email" className="mb-1.5 block text-[13px] font-semibold text-pekat">Email</label>
                  <input id="daftar-email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="nama@email.com" autoComplete="email" className={inputCls('email')} />
                  <Galat f="email" />
                </div>
                <div>
                  <label htmlFor="daftar-password" className="mb-1.5 block text-[13px] font-semibold text-pekat">Password</label>
                  <div className="relative">
                    <input id="daftar-password" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" className={`${inputCls('password')} pr-11`} />
                    <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-pekat/40 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <KekuatanPassword password={form.password} />
                  <Galat f="password" />
                </div>
                <div>
                  <label htmlFor="daftar-konfirmasi" className="mb-1.5 block text-[13px] font-semibold text-pekat">Ulangi password</label>
                  <div className="relative">
                    <input id="daftar-konfirmasi" type={showKonfirm ? 'text' : 'password'} value={form.konfirmasiPassword} onChange={e => setField('konfirmasiPassword', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDaftar()} placeholder="Ketik ulang password" autoComplete="new-password" className={`${inputCls('konfirmasiPassword')} pr-11`} />
                    <button type="button" onClick={() => setShowKonfirm(s => !s)} aria-label={showKonfirm ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-pekat/40 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                      {showKonfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Galat f="konfirmasiPassword" />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.6] text-pekat/70">
                    <input type="checkbox" checked={form.setuju} onChange={e => setField('setuju', e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded accent-rekah" />
                    <span>
                      Saya setuju dengan{' '}
                      <Link to="/tentang" className="font-semibold text-rekah no-underline hover:underline">Syarat &amp; Ketentuan</Link>
                      {' '}dan{' '}
                      <Link to="/tentang" className="font-semibold text-rekah no-underline hover:underline">Kebijakan Privasi</Link> Rekah.
                    </span>
                  </label>
                  <Galat f="setuju" />
                </div>

                <p className="text-[13px] leading-[1.6] text-pekat/55">
                  Data anak diisi setelah masuk, supaya isi Rekah langsung sesuai usianya.
                </p>

                <button
                  type="button"
                  onClick={handleDaftar}
                  disabled={submitting}
                  className="flex min-h-[52px] items-center justify-center rounded-full bg-rekah font-bricolage text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(224,82,107,0.28)] transition hover:bg-rekah-tua disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
                >
                  {submitting ? 'Memproses...' : 'Buat akun & lanjut ke pembayaran'}
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-[14px] text-pekat/65">
            Sudah punya akun Rekah?{' '}
            <Link to="/login" className="font-bold text-rekah no-underline transition hover:underline">Masuk</Link>
          </p>
        </div>
      </div>

      {konfirmasi && (
        <PlanConfirmModal tier={konfirmasi.tier} plan={konfirmasi.plan} onClose={() => setKonfirmasi(null)} />
      )}
    </div>
  );
}
