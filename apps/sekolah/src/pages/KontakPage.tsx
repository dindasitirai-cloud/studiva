import React from 'react';
import {
  MessageCircle, Mail, Phone, MapPin, Clock,
  ArrowRight, ExternalLink, Sparkles,
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
const MAPS_EMBED_URL =
  'https://maps.google.com/maps?q=Jl.+Mandiangin+No.+65,+Bukittinggi,+Sumatera+Barat&output=embed&z=15';
const MAPS_OPEN_URL =
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
    action: { label: 'Chat Sekarang', href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`, external: true },
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
      <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-20">
        <span className="pointer-events-none absolute left-[2%] top-[12%] h-[11px] w-[11px] rounded-full bg-emerald-400 opacity-40" />
        <span className="pointer-events-none absolute right-[2%] top-[18%] h-[8px] w-[8px] rounded-full bg-violet-400 opacity-40" />
        <span className="pointer-events-none absolute bottom-[14%] left-[3%] h-[9px] w-[9px] rounded-full bg-amber-400 opacity-45" />
        <span className="pointer-events-none absolute bottom-[8%] right-[4%] h-[10px] w-[10px] rounded-full bg-sky-400 opacity-35" />
        <Sparkles className="pointer-events-none absolute right-[6%] top-[6%] h-[14px] w-[14px] text-emerald-500 opacity-45" fill="currentColor" strokeWidth={0} />
        <Sparkles className="pointer-events-none absolute bottom-[20%] left-[7%] h-[11px] w-[11px] text-amber-400 opacity-40" fill="currentColor" strokeWidth={0} />
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

      {/* ── PETA LOKASI ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(16,58,107,.08)]">
                <iframe
                  title="Lokasi Sekolah Studiva"
                  src={MAPS_EMBED_URL}
                  width="100%"
                  height="380"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
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

              <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Jam Operasional</h3>
                </div>
                <div className="space-y-1.5 text-[14px] text-stv-body">
                  <p><span className="font-semibold">Senin – Jumat</span> · 08.00 – 16.00 WIB</p>
                  <p className="text-stv-muted">Sabtu &amp; Minggu: Tutup</p>
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


    </div>
  );
}
