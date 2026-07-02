import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle,
  AlertCircle, ArrowRight, ExternalLink,
} from 'lucide-react';
import Reveal from '../components/Reveal';

// ── Konstanta kontak ────────────────────────────────────────────────────────

// TODO: ganti nilai di bawah ini bila ada perubahan data kontak
const WHATSAPP_NUMBER = '6281211470407';
const WHATSAPP_MSG    = encodeURIComponent('Halo Studiva, saya ingin bertanya lebih lanjut tentang program Anda.');
const EMAIL           = 'halo@studiva.id';
const PHONE           = '+62 812-1147-0407';
const ADDRESS         = 'Jl. Mandiangin No. 65, Bukittinggi, Sumatera Barat';
const HOURS           = 'Senin – Jumat, 08.00 – 16.00 WIB';

// TODO: ganti src embed di bawah dengan iframe URL Google Maps yang valid untuk
// alamat sekolah. Cara mendapatkannya: buka Google Maps → cari alamat → klik
// "Bagikan" → "Sematkan peta" → salin URL dari atribut src iframe.
const MAPS_EMBED_URL  =
  'https://maps.google.com/maps?q=Jl.+Mandiangin+No.+65,+Bukittinggi,+Sumatera+Barat&output=embed&z=15';
const MAPS_OPEN_URL   =
  'https://www.google.com/maps/search/?api=1&query=Jl.+Mandiangin+No.+65+Bukittinggi+Sumatera+Barat';

// ── Kartu kontak ────────────────────────────────────────────────────────────

interface ContactCardProps {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  action?: { label: string; href: string; external?: boolean };
  gradient: string;
  iconColor: string;
}

const CONTACT_CARDS: ContactCardProps[] = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+62 812-1147-0407',
    action: {
      label: 'Chat Sekarang',
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`,
      external: true,
    },
    gradient: 'from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: EMAIL,
    action: { label: 'Kirim Email', href: `mailto:${EMAIL}` },
    gradient: 'from-sky-50 to-blue-50',
    iconColor: 'text-stv-sky-stroke',
  },
  {
    icon: Phone,
    label: 'Telepon',
    value: PHONE,
    action: { label: 'Hubungi', href: `tel:${PHONE.replace(/\s|-/g, '')}` },
    gradient: 'from-violet-50 to-purple-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: MapPin,
    label: 'Alamat',
    value: ADDRESS,
    action: { label: 'Lihat di Peta', href: MAPS_OPEN_URL, external: true },
    gradient: 'from-rose-50 to-pink-50',
    iconColor: 'text-rose-500',
  },
  {
    icon: Clock,
    label: 'Jam Operasional',
    value: HOURS,
    gradient: 'from-amber-50 to-yellow-50',
    iconColor: 'text-amber-600',
  },
];

function ContactCard({ icon: Icon, label, value, action, gradient, iconColor }: ContactCardProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.10)]`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ${iconColor}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-stv-muted-2">{label}</p>
        <p className="text-[15px] font-semibold leading-[1.5] text-stv-navy">{value}</p>
      </div>
      {action && (
        <a
          href={action.href}
          target={action.external ? '_blank' : undefined}
          rel={action.external ? 'noopener noreferrer' : undefined}
          className={`mt-auto inline-flex items-center gap-1.5 text-[13px] font-bold no-underline transition ${iconColor} hover:opacity-75`}
        >
          {action.label}
          {action.external ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </a>
      )}
    </div>
  );
}

// ── Form kontak ─────────────────────────────────────────────────────────────

const TOPICS = [
  'Informasi Sekolah Studiva (Tier 1)',
  'Informasi Studiva Digital (Tier 2)',
  'Pertanyaan Umum',
  'Kerjasama / Partnership',
  'Lainnya',
];

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

type SubmitStatus = 'idle' | 'success' | 'error';

function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi.';
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.topic) e.topic = 'Pilih topik pertanyaan.';
    if (!form.message.trim()) e.message = 'Pesan wajib diisi.';
    else if (form.message.trim().length < 10) e.message = 'Pesan terlalu singkat (min. 10 karakter).';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit() {
    if (!validate()) return;
    // TODO: integrasikan dengan backend — kirim email notifikasi ke halo@studiva.id
    // atau simpan ke tabel `contact_messages` di database.
    // Contoh endpoint: POST /api/contact { name, email, topic, message }
    setStatus('success');
    setForm({ name: '', email: '', topic: '', message: '' });
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 px-8 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="font-baloo text-[22px] font-bold text-stv-navy">Pesan Terkirim!</h3>
        <p className="max-w-[360px] text-[15px] leading-[1.7] text-stv-body">
          Terima kasih sudah menghubungi Studiva. Tim kami akan membalas dalam 1–2 hari kerja melalui
          email atau WhatsApp yang Anda berikan.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 rounded-full border border-emerald-300 px-6 py-2.5 text-[14px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Kirim Pesan Lain
        </button>
      </div>
    );
  }

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-xl border px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/30 transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-stv-border bg-white focus:border-stv-sky-stroke'
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Nama Anda"
            className={inputCls('name')}
          />
          {errors.name && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="nama@email.com"
            className={inputCls('email')}
          />
          {errors.email && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
          Topik <span className="text-red-500">*</span>
        </label>
        <select
          value={form.topic}
          onChange={e => handleChange('topic', e.target.value)}
          className={inputCls('topic')}
        >
          <option value="">— Pilih topik —</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.topic && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.topic}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
          Pesan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => handleChange('message', e.target.value)}
          placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
          rows={5}
          className={`resize-none ${inputCls('message')}`}
        />
        {errors.message && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.message}</p>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 rounded-full bg-stv-navy px-8 py-4 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(16,58,107,.25)] transition hover:-translate-y-0.5 hover:bg-stv-navy-dark"
      >
        <Send className="h-4 w-4" />
        Kirim Pesan
      </button>

      {status === 'error' && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung via WhatsApp.
        </p>
      )}
    </div>
  );
}

// ── Halaman Utama ───────────────────────────────────────────────────────────

export default function KontakPage() {
  return (
    <div className="font-nunito-sans">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stv-navy via-[#1a3f6f] to-[#0d2a4d] px-4 py-24 text-center sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute left-[10%] top-10 h-28 w-28 rounded-full bg-stv-yellow/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-10 right-[8%] h-20 w-20 rounded-full bg-emerald-400/15 blur-2xl" />
        <div className="relative mx-auto max-w-[640px]">
          <span className="mb-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white/80">
            Kontak
          </span>
          <h1 className="mb-5 font-baloo text-[40px] font-extrabold leading-[1.08] text-white sm:text-[52px]">
            Hubungi Kami
          </h1>
          <p className="text-[17px] leading-[1.7] text-white/80">
            Ada pertanyaan tentang program kami, pendaftaran, atau sekadar ingin bercerita?
            Tim Studiva siap mendengarkan dan membantu.
          </p>
        </div>
      </section>

      {/* ── KARTU-KARTU KONTAK ───────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h2 className="mb-8 text-center font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[34px]">
              Cara Menghubungi Kami
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CONTACT_CARDS.map((card, i) => (
              <Reveal key={card.label} delayMs={i * 60}>
                <ContactCard {...card} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + PETA ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 lg:grid-cols-2">

          {/* Form */}
          <Reveal>
            <div className="rounded-2xl bg-white p-6 shadow-[0_8px_32px_rgba(16,58,107,.08)] sm:p-8">
              <h2 className="mb-2 font-baloo text-[26px] font-extrabold text-stv-navy">Kirim Pesan</h2>
              <p className="mb-6 text-[14px] text-stv-body">
                Isi form di bawah dan kami akan menghubungi Anda dalam 1–2 hari kerja.
              </p>
              <ContactForm />
            </div>
          </Reveal>

          {/* Peta */}
          <Reveal delayMs={80}>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(16,58,107,.08)]">
                <div className="relative">
                  <iframe
                    title="Lokasi Sekolah Studiva"
                    src={MAPS_EMBED_URL}
                    width="100%"
                    height="340"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-baloo text-[15px] font-bold text-stv-navy">Sekolah Studiva</p>
                    <p className="text-[13px] text-stv-muted">{ADDRESS}</p>
                  </div>
                  <a
                    href={MAPS_OPEN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-stv-navy px-4 py-2 text-[13px] font-bold text-white no-underline transition hover:bg-stv-navy-dark"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka Maps
                  </a>
                </div>
              </div>

              {/* Jam operasional */}
              <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Jam Operasional</h3>
                </div>
                <div className="space-y-1.5 text-[14px] text-stv-body">
                  <p><span className="font-semibold">Senin – Jumat</span> · 08.00 – 16.00 WIB</p>
                  <p className="text-stv-muted">Sabtu & Minggu: Tutup</p>
                  <p className="mt-2 text-[13px] text-stv-muted">
                    Di luar jam operasional, Anda tetap dapat mengirim pesan via WhatsApp dan kami
                    akan membalas pada hari kerja berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── CATATAN PENDAFTARAN ───────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h2 className="mb-8 text-center font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[34px]">
              Informasi Pendaftaran
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Tier 1 */}
            <Reveal>
              <div className="rounded-2xl border-2 border-stv-sky-tint bg-stv-sky-tint/40 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stv-sky-stroke">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stv-sky-stroke">Tier 1</p>
                    <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Sekolah Studiva</h3>
                  </div>
                </div>
                <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                  Pendaftaran Sekolah Studiva dilakukan secara <strong className="text-stv-navy">offline</strong>,
                  langsung melalui tim kami. Tidak ada pendaftaran online atau pembayaran di website — kami
                  ingin memastikan setiap anak mendapat pendampingan yang tepat sejak awal.
                </p>
                <ul className="mb-5 space-y-2">
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                    Hubungi via WhatsApp untuk sesi perkenalan
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                    Asesmen awal bersama tim psikolog
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                    Akun orang tua dibuatkan oleh admin
                  </li>
                </ul>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo Studiva, saya ingin mendaftarkan anak saya ke Sekolah Studiva.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-stv-sky-stroke px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-stv-sky-stroke/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </Reveal>

            {/* Tier 2 */}
            <Reveal delayMs={80}>
              <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/40 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Tier 2</p>
                    <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Studiva Digital</h3>
                  </div>
                </div>
                <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                  Pendaftaran Studiva Digital dilakukan <strong className="text-stv-navy">sepenuhnya online</strong>.
                  Buat akun, pilih paket berlangganan, dan akses langsung semua fitur platform — dari
                  mana saja di Indonesia.
                </p>
                <ul className="mb-5 space-y-2">
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    Daftar mandiri di website — tak perlu menghubungi tim
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    Pilih paket bulanan, 3 bulan, atau tahunan
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    Akses langsung setelah pembayaran berhasil
                  </li>
                </ul>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
                >
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </div>
  );
}
