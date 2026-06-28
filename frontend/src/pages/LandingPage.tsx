import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Users,
  Target,
  BarChart3,
  Phone,
  BookOpen,
  Layers,
  ClipboardCheck,
  CreditCard,
  Rocket,
  Check,
  ArrowRight,
  Star,
  Sparkle,
  Calendar,
} from 'lucide-react';

const tier1Features = [
  'Daily updates dari guru',
  'Therapy progress tracking',
  'Parent-teacher communication',
  'School calendar & activities',
  'Community forum',
];

const tier2Features = [
  'Resource library (1000+ guides)',
  'Self-paced courses',
  'Learning strategies',
  'Community forum & support',
  'Consultation dengan Psikolog Fitri',
];

const whyStudiva = [
  {
    icon: Award,
    badgeBg: 'bg-stv-yellow-tint',
    badgeColor: 'text-stv-navy',
    title: 'Expertise',
    description:
      'Dipimpin oleh Psikolog Fitri Effendy, S.Psi dengan pengalaman puluhan tahun di bidang pendidikan inklusif.',
    sparkle: true,
  },
  {
    icon: Users,
    badgeBg: 'bg-stv-sky-tint',
    badgeColor: 'text-stv-sky-stroke',
    title: 'Community',
    description: 'Bergabung dengan komunitas parents yang supportive dan saling membantu dalam journey parenting.',
    sparkle: false,
  },
  {
    icon: Target,
    badgeBg: 'bg-stv-coral-tint',
    badgeColor: 'text-stv-coral',
    title: 'Personalized',
    description: 'Setiap anak unik. Kami menyesuaikan pendekatan dengan kebutuhan individual anak Anda.',
    sparkle: false,
  },
  {
    icon: BarChart3,
    badgeBg: 'bg-stv-badge-navy-tint',
    badgeColor: 'text-stv-navy',
    title: 'Evidence-Based',
    description: 'Metode kami didasarkan pada penelitian ilmiah dan terbukti mendukung perkembangan anak.',
    sparkle: false,
  },
];

const testimonials = [
  {
    quote:
      'Anak saya sangat berkembang sejak bergabung dengan Studiva. Psikolog Fitri benar-benar memahami kebutuhan anak-anak dengan special needs.',
    author: 'Ibu Siti',
    role: 'Parent Tier 1',
    avatarBg: 'bg-stv-navy',
  },
  {
    quote: 'Resources di Tier 2 sangat membantu saya memahami anak saya lebih baik. Komunitas juga sangat supportive.',
    author: 'Ibu Rina',
    role: 'Parent Tier 2',
    avatarBg: 'bg-stv-sky-stroke',
  },
  {
    quote:
      'Terima kasih Studiva! Konsultasi dengan Psikolog Fitri memberikan perspektif baru dalam pendekatan saya.',
    author: 'Ibu Devi',
    role: 'Parent Tier 1',
    avatarBg: 'bg-stv-coral',
  },
];

const expertiseAreas = ['Inclusive Education', 'Child Psychology', 'Special Needs Support', 'Parent Counseling'];

const steps = [
  {
    icon: Layers,
    iconColor: 'text-stv-navy',
    circleBg: 'bg-stv-navy',
    circleText: 'text-white',
    circleShadow: 'shadow-[0_8px_20px_rgba(16,58,107,.2)]',
    title: 'Pilih Tier',
    description: 'Tier 1 (School) atau Tier 2 (Digital). Sesuaikan dengan kebutuhan keluarga Anda.',
  },
  {
    icon: ClipboardCheck,
    iconColor: 'text-stv-sky-stroke',
    circleBg: 'bg-stv-navy',
    circleText: 'text-white',
    circleShadow: 'shadow-[0_8px_20px_rgba(16,58,107,.2)]',
    title: 'Daftar',
    description: 'Isi form singkat dengan data keluarga. Verifikasi email Anda.',
  },
  {
    icon: CreditCard,
    iconColor: 'text-stv-coral',
    circleBg: 'bg-stv-navy',
    circleText: 'text-white',
    circleShadow: 'shadow-[0_8px_20px_rgba(16,58,107,.2)]',
    title: 'Subscribe',
    description: 'Pilih durasi (monthly/yearly). Pembayaran mudah via Stripe.',
  },
  {
    icon: Rocket,
    iconColor: 'text-stv-navy',
    circleBg: 'bg-stv-yellow',
    circleText: 'text-stv-navy',
    circleShadow: 'shadow-[0_8px_20px_rgba(251,208,10,.45)]',
    title: 'Mulai Journey',
    description: 'Akses resources, community, dan layanan konsultasi Psikolog Fitri.',
  },
];

const newsItems = [
  {
    icon: Phone,
    badgeBg: 'bg-stv-yellow-tint',
    badgeColor: 'text-stv-yellow-deep',
    title: 'Konsultasi Gratis dengan Psikolog Fitri',
    description: 'Dapatkan sesi konsultasi gratis untuk mengenal lebih lanjut kebutuhan anak Anda.',
    linkLabel: 'Learn More',
    to: '/consultation',
  },
  {
    icon: Users,
    badgeBg: 'bg-stv-sky-tint',
    badgeColor: 'text-stv-sky-stroke',
    title: 'Komunitas Studiva Terus Berkembang',
    description: 'Bergabunglah dengan komunitas parents yang saling mendukung perjalanan parenting inklusif.',
    linkLabel: 'Join Community',
    to: '/community',
  },
  {
    icon: BookOpen,
    badgeBg: 'bg-stv-coral-tint',
    badgeColor: 'text-stv-coral',
    title: 'Resources Baru: Panduan Parent',
    description: 'Kami terus menambahkan resources baru untuk membantu parents lebih efektif mendukung anak.',
    linkLabel: 'Explore',
    to: '/resources',
  },
];

function EyebrowPill({ label, tone = 'tint' }: { label: string; tone?: 'tint' | 'white' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-[18px] py-[9px] text-[13px] font-extrabold uppercase tracking-[2px] text-stv-navy ${
        tone === 'tint' ? 'bg-stv-yellow-tint' : 'bg-white'
      }`}
    >
      <span className="h-[7px] w-[7px] rounded-full bg-stv-yellow" />
      {label}
    </span>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative z-0 inline-block">
      <span className="absolute inset-x-[-6px] bottom-[8%] z-[-1] h-[34%] rounded-[8px] bg-stv-yellow" />
      {children}
    </span>
  );
}

// Purely decorative - the click target is the parent <Link> wrapping both
// this circle and the "Daftar sekarang" text as one unit, per spec. A nested
// <Link> here would create invalid nested anchors.
function ArrowCircle({ bgClass, arrowClass }: { bgClass: string; arrowClass: string }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
      <ArrowRight className={`h-4 w-4 ${arrowClass}`} strokeWidth={2.4} />
    </span>
  );
}

function StarRating() {
  return (
    <div className="mb-[22px] flex gap-1 text-stv-yellow" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-[22px] w-[22px]" fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function FloatingBlobs({ children }: { children: React.ReactNode }) {
  return <div className="pointer-events-none absolute inset-0">{children}</div>;
}

export default function LandingPage() {
  // Scroll-snap is scoped to this page only (not a global style) so it
  // doesn't change scroll feel on long-content pages like the dashboards
  // or community forum.
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = 'y proximity';
    html.style.scrollPaddingTop = '82px';
    return () => {
      html.style.scrollSnapType = '';
      html.style.scrollPaddingTop = '';
    };
  }, []);

  return (
    <div className="bg-white font-nunito-sans text-stv-body">
      {/* ============ HERO ============ */}
      <section className="grid snap-start grid-cols-1 md:min-h-[calc(100vh-82px)] md:grid-cols-[1.15fr_.85fr]">
        {/* Left: photo + overlay */}
        <div className="relative h-[60vh] overflow-hidden bg-[#D8DEE6] sm:h-[480px] md:h-auto">
          <img
            src="/images/hero-children.jpg"
            alt="Anak-anak belajar bersama dengan penuh semangat di Studiva"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(16,58,107,.12) 0%, rgba(16,58,107,0) 35%, rgba(16,58,107,.55) 100%)',
            }}
          />
          <img
            src="/images/logo-studiva-bordered.png"
            alt="Studiva — Rumah Belajar Istimewa"
            className="absolute left-1/2 top-[9%] w-[150px] -translate-x-1/2 drop-shadow-[0_12px_26px_rgba(16,58,107,.4)] sm:w-[190px] md:w-[224px]"
          />
          <div className="absolute inset-x-0 bottom-0 px-7 pb-10 pt-10 sm:px-10 md:px-[52px] md:pb-14">
            <h1 className="max-w-[560px] font-baloo text-[34px] font-extrabold leading-[1.08] text-white [text-shadow:0_3px_20px_rgba(16,58,107,.45)] sm:text-[44px] md:text-[60px]">
              Pendidikan Inklusif untuk <span className="text-stv-yellow">Setiap</span> Anak
            </h1>
          </div>
        </div>

        {/* Right: two product cards */}
        <div className="flex flex-col justify-center gap-3 bg-stv-cream p-5 sm:p-6">
          {/* Sekolah Studiva (blue) */}
          <div
            id="tier1"
            className="rounded-[28px] bg-stv-sky px-5 py-2 text-white shadow-[0_16px_36px_rgba(16,58,107,.14)] sm:px-6 sm:py-3"
          >
            <h3 className="mb-1 text-center font-baloo text-[22px] font-extrabold text-white sm:text-[24px]">
              Sekolah Studiva
            </h3>
            <div className="mb-2 text-[15px] font-bold text-white">Untuk Anak di Sekolah Kami</div>
            <div className="mb-2 flex flex-col gap-1">
              {tier1Features.map((f) => (
                <div key={f} className="flex items-center gap-[11px] text-[15px]">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-stv-yellow" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              state={{ presetTier: 'tier1' }}
              className="flex items-center justify-between no-underline transition hover:opacity-90"
            >
              <span className="font-baloo text-[18px] font-bold text-stv-yellow">Daftar sekarang</span>
              <ArrowCircle bgClass="bg-white" arrowClass="text-stv-navy" />
            </Link>
          </div>

          {/* Studiva Digital (yellow) */}
          <div
            id="tier2"
            className="rounded-[28px] bg-stv-yellow px-5 py-2 text-stv-navy shadow-[0_16px_36px_rgba(251,208,10,.28)] sm:px-6 sm:py-3"
          >
            <h3 className="mb-1 text-center font-baloo text-[22px] font-extrabold text-stv-navy sm:text-[24px]">
              Studiva Digital
            </h3>
            <div className="mb-2 text-[15px] font-bold text-stv-navy">Untuk Orangtua di Mana Saja</div>
            <div className="mb-2 flex flex-col gap-1">
              {tier2Features.map((f) => (
                <div key={f} className="flex items-center gap-[11px] text-[15px] font-semibold">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-stv-navy" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              state={{ presetTier: 'tier2' }}
              className="flex items-center justify-between no-underline transition hover:opacity-90"
            >
              <span className="font-baloo text-[18px] font-bold text-stv-navy">Daftar sekarang</span>
              <ArrowCircle bgClass="bg-stv-navy" arrowClass="text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ MENGAPA MEMILIH STUDIVA ============ */}
      <section className="relative snap-start overflow-hidden bg-white px-4 py-10 md:flex md:min-h-[calc(100vh-82px)] md:flex-col md:justify-center md:px-8">
        <FloatingBlobs>
          <div className="absolute left-[-90px] top-[60px] h-[280px] w-[280px] animate-stv-float rounded-full bg-stv-sky-tint blur-[8px]" />
          <div className="absolute bottom-10 right-[-70px] h-[220px] w-[220px] animate-stv-float-slow rounded-full bg-stv-yellow-tint blur-[6px]" />
        </FloatingBlobs>

        <div className="relative mx-auto max-w-[1160px]">
          <div className="mx-auto mb-8 max-w-[680px] text-center">
            <EyebrowPill label="Kenapa Kami" />
            <h2 className="my-3 font-baloo text-[34px] font-extrabold leading-[1.08] text-stv-navy sm:text-[44px] md:text-[48px]">
              Mengapa Memilih <Highlight>Studiva</Highlight>?
            </h2>
            <p className="text-[17px] text-stv-body">
              Dipimpin oleh Psikolog Fitri Effendy yang berpengalaman puluhan tahun di bidang pendidikan inklusif.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {whyStudiva.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="hover-lift relative rounded-[28px] border-[1.5px] border-stv-border bg-white p-6 shadow-[0_10px_30px_rgba(16,58,107,.05)]"
                >
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] ${item.badgeBg} ${item.badgeColor}`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="mb-1.5 font-baloo text-[22px] font-bold text-stv-navy">{item.title}</h3>
                  <p className="text-[15px] leading-[1.45] text-stv-body">{item.description}</p>
                  {item.sparkle && (
                    <Sparkle className="absolute right-[34px] top-[30px] h-[18px] w-[18px] text-stv-yellow" fill="currentColor" strokeWidth={0} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ APA KATA PARENTS ============ */}
      <section className="relative snap-start overflow-hidden bg-stv-beige px-4 py-[72px] md:flex md:min-h-[calc(100vh-82px)] md:flex-col md:justify-center md:px-8">
        <FloatingBlobs>
          <div className="absolute right-[8%] top-[-50px] select-none font-baloo text-[220px] font-extrabold leading-none text-stv-navy/5 sm:text-[340px]">
            &rdquo;
          </div>
          <div className="absolute bottom-[30px] left-[-60px] h-[200px] w-[200px] animate-stv-float rounded-full bg-stv-yellow/[.18] blur-[4px]" />
        </FloatingBlobs>

        <div className="relative mx-auto max-w-[1160px]">
          <div className="mb-[60px] text-center">
            <EyebrowPill label="Testimoni" tone="white" />
            <h2 className="mt-[22px] font-baloo text-[34px] font-extrabold leading-[1.1] text-stv-navy sm:text-[44px] md:text-[54px]">
              Apa Kata <Highlight>Parents</Highlight> Kami
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="flex flex-col rounded-[28px] bg-white px-[34px] py-[38px] shadow-[0_14px_40px_rgba(16,58,107,.08)]"
              >
                <StarRating />
                <p className="mb-7 flex-1 font-nunito-sans text-[18px] italic leading-[1.65] text-stv-quote">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-[14px]">
                  <div
                    className={`flex h-[50px] w-[50px] items-center justify-center rounded-full font-baloo text-[19px] font-bold text-white ${t.avatarBg}`}
                  >
                    {t.author.charAt(t.author.indexOf(' ') + 1)}
                  </div>
                  <div>
                    <div className="font-extrabold text-stv-navy">{t.author}</div>
                    <div className="text-[15px] text-stv-muted-2">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROFIL PSIKOLOG FITRI ============ */}
      <section className="relative snap-start overflow-hidden bg-white px-4 py-[72px] md:flex md:min-h-[calc(100vh-82px)] md:flex-col md:justify-center md:px-8">
        <FloatingBlobs>
          <div className="absolute right-[-80px] top-20 h-[260px] w-[260px] animate-stv-float-slow rounded-full bg-stv-yellow-tint blur-[8px]" />
        </FloatingBlobs>

        <div className="relative mx-auto grid max-w-[1140px] items-center gap-12 md:grid-cols-[1.05fr_.95fr] md:gap-[72px]">
          <div>
            <EyebrowPill label="Founder" />
            <h2 className="mt-5 mb-[6px] font-baloo text-[34px] font-extrabold leading-[1.12] text-stv-navy sm:text-[40px] md:text-[48px]">
              Psikolog Fitri Effendy
            </h2>
            <p className="mb-7 font-baloo text-[19px] font-semibold text-stv-yellow-deep md:text-[21px]">
              S.Psi, Founder &amp; Head Psychologist
            </p>
            <p className="mb-8 max-w-[520px] font-nunito-sans text-[18px] italic leading-[1.7] text-stv-quote md:text-[19px]">
              &ldquo;Setiap anak memiliki potensi. Misi saya adalah membantu setiap anak mengembangkan potensi mereka
              melalui pendidikan inklusif yang personal dan penuh kasih sayang.&rdquo;
            </p>
            <div className="mb-9 grid max-w-[520px] grid-cols-1 gap-x-7 gap-y-[14px] sm:grid-cols-2">
              {expertiseAreas.map((area) => (
                <div key={area} className="flex items-center gap-[11px]">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-stv-sky-tint text-stv-sky-stroke">
                    <Check className="h-[15px] w-[15px]" strokeWidth={3} />
                  </span>
                  <span className="text-[17px] font-bold text-stv-navy">{area}</span>
                </div>
              ))}
            </div>
            <Link
              to="/consultation"
              className="inline-flex items-center gap-[10px] rounded-full bg-stv-yellow px-[30px] py-4 font-baloo text-[18px] font-bold text-stv-navy no-underline shadow-[0_10px_24px_rgba(251,208,10,.4)] transition hover:-translate-y-0.5 hover:bg-stv-yellow-hover"
            >
              <Calendar className="h-5 w-5" strokeWidth={2.2} />
              Book Consultation with Psikolog Fitri
            </Link>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute right-[18px] top-[-26px] h-[120px] w-[120px] animate-stv-float rounded-[32px] bg-stv-yellow/25" />
            <div className="absolute bottom-[-18px] left-[6px] h-[84px] w-[84px] animate-stv-float-slow rounded-full bg-stv-sky-stroke/[.18]" />
            <div className="relative flex h-[340px] w-[300px] flex-col items-center justify-center overflow-hidden rounded-[36px] bg-gradient-to-br from-stv-sky-tint to-[#D2E8F8] shadow-[0_24px_60px_rgba(16,58,107,.18)] sm:h-[420px] sm:w-[380px]">
              <div className="absolute inset-x-0 top-0 h-[7px] bg-stv-yellow" />
              <div className="font-baloo text-[110px] font-extrabold leading-none text-stv-navy sm:text-[150px]">
                FE
              </div>
              <div className="mt-[14px] inline-flex items-center gap-2 rounded-full bg-white px-[18px] py-[9px] text-[14px] font-extrabold text-stv-navy shadow-[0_6px_16px_rgba(16,58,107,.12)]">
                <span className="h-2 w-2 rounded-full bg-[#3FBF6A]" />
                Founder &amp; Psikolog
              </div>
              <Sparkle className="absolute left-[26px] top-7 h-6 w-6 text-stv-yellow" fill="currentColor" strokeWidth={0} />
            </div>
          </div>
        </div>
      </section>

      {/* ============ BAGAIMANA CARA MEMULAI ============ */}
      <section className="relative snap-start overflow-hidden bg-stv-cream px-4 py-[72px] md:flex md:min-h-[calc(100vh-82px)] md:flex-col md:justify-center md:px-8">
        <FloatingBlobs>
          <div className="absolute left-[4%] top-[50px] h-[14px] w-[14px] rounded-full bg-stv-yellow" />
          <div className="absolute bottom-[90px] right-[7%] h-[22px] w-[22px] rounded-full bg-stv-sky-stroke/40" />
        </FloatingBlobs>

        <div className="relative mx-auto max-w-[1160px]">
          <div className="mb-16 text-center">
            <EyebrowPill label="Mudah & Cepat" tone="white" />
            <h2 className="mt-[22px] font-baloo text-[34px] font-extrabold leading-[1.1] text-stv-navy sm:text-[44px] md:text-[54px]">
              Bagaimana Cara <Highlight>Memulai</Highlight>?
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div className="absolute top-[30px] left-[14%] right-[14%] hidden border-t-[3px] border-dashed border-[#D9C99B] lg:block" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative z-[1] flex flex-col items-center text-center">
                  <div
                    className={`flex h-[62px] w-[62px] items-center justify-center rounded-full border-[5px] border-stv-cream font-baloo text-[26px] font-extrabold ${step.circleBg} ${step.circleText} ${step.circleShadow}`}
                  >
                    {index + 1}
                  </div>
                  <div className="my-[18px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white shadow-[0_8px_20px_rgba(16,58,107,.08)]">
                    <Icon className={`h-7 w-7 ${step.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className="mb-[10px] font-baloo text-[24px] font-bold text-stv-navy">{step.title}</h3>
                  <p className="max-w-[240px] text-[16px] leading-[1.6] text-stv-muted">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TERBARU DARI STUDIVA ============ */}
      <section className="relative snap-start overflow-hidden bg-white px-4 py-[72px] md:flex md:min-h-[calc(100vh-82px)] md:flex-col md:justify-center md:px-8">
        <div className="relative mx-auto max-w-[1160px]">
          <div className="mb-[60px] text-center">
            <EyebrowPill label="Update" />
            <h2 className="mt-[22px] font-baloo text-[34px] font-extrabold leading-[1.1] text-stv-navy sm:text-[44px] md:text-[54px]">
              Terbaru dari <Highlight>Studiva</Highlight>
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {newsItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="hover-lift relative rounded-[28px] border-[1.5px] border-stv-border bg-white px-[34px] py-[38px] shadow-[0_10px_30px_rgba(16,58,107,.05)]"
                >
                  <div className={`mb-[26px] flex h-[62px] w-[62px] items-center justify-center rounded-[18px] ${item.badgeBg} ${item.badgeColor}`}>
                    <Icon className="h-[30px] w-[30px]" strokeWidth={2} />
                  </div>
                  <h3 className="mb-[14px] font-baloo text-[25px] font-bold leading-[1.2] text-stv-navy">{item.title}</h3>
                  <p className="mb-[22px] text-[16px] leading-[1.6] text-stv-body">{item.description}</p>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-yellow-deep no-underline"
                  >
                    {item.linkLabel}
                    <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA + FOOTER SCREEN ============ */}
      <section
        className="relative snap-start overflow-hidden px-4 py-24 text-center md:px-8 md:py-[104px]"
        style={{ background: 'linear-gradient(150deg, #0E3766 0%, #103A6B 45%, #15406F 100%)' }}
      >
        <FloatingBlobs>
          <div className="absolute left-[8%] top-10 h-[120px] w-[120px] animate-stv-float rounded-full bg-stv-yellow/[.16]" />
          <div className="absolute bottom-[50px] right-[10%] h-[160px] w-[160px] animate-stv-float-slow rounded-[40px] bg-white/5" />
          <Sparkle className="absolute right-[18%] top-20 h-[26px] w-[26px] text-stv-yellow/40" fill="currentColor" strokeWidth={0} />
          <div className="absolute bottom-[90px] left-[16%] h-4 w-4 rounded-full bg-stv-yellow/50" />
        </FloatingBlobs>

        <div className="relative mx-auto max-w-[780px]">
          <h2 className="mb-[22px] font-baloo text-[34px] font-extrabold leading-[1.12] text-white sm:text-[44px] md:text-[56px]">
            Siap Mulai Journey{' '}
            <span className="relative z-0 inline-block text-stv-navy">
              <span className="absolute inset-x-[-8px] bottom-[10%] top-[6%] z-[-1] rounded-[12px] bg-stv-yellow" />
              Inklusif
            </span>{' '}
            Anda?
          </h2>
          <p className="mb-11 text-[18px] leading-[1.6] text-white/[.82] md:text-[20px]">
            Bergabunglah dengan ribuan parents yang telah melihat perubahan positif dalam perkembangan anak mereka.
          </p>
          <div className="flex flex-wrap justify-center gap-[18px]">
            <Link
              to="/signup"
              state={{ presetTier: 'tier1' }}
              className="rounded-full bg-stv-yellow px-10 py-[18px] font-baloo text-[19px] font-bold text-stv-navy no-underline shadow-[0_14px_30px_rgba(251,208,10,.4)] transition hover:-translate-y-0.5 hover:bg-stv-yellow-hover"
            >
              Daftar Tier 1
            </Link>
            <Link
              to="/signup"
              state={{ presetTier: 'tier2' }}
              className="rounded-full border-2 border-white/[.55] bg-transparent px-10 py-[18px] font-baloo text-[19px] font-bold text-white no-underline transition hover:border-white hover:bg-white/[.08]"
            >
              Daftar Tier 2
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
