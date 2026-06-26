import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { Tier } from '../types';

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
    icon: '🧠',
    title: 'Expertise',
    description:
      'Dipimpin oleh Psikolog Fitri Effendy, S.Psi dengan pengalaman puluhan tahun di bidang pendidikan inklusif.',
  },
  {
    icon: '👥',
    title: 'Community',
    description:
      'Bergabung dengan komunitas parents yang supportive dan saling membantu dalam journey parenting.',
  },
  {
    icon: '🎯',
    title: 'Personalized',
    description: 'Setiap anak unik. Kami menyesuaikan pendekatan dengan kebutuhan individual anak Anda.',
  },
  {
    icon: '📊',
    title: 'Evidence-Based',
    description: 'Metode kami didasarkan pada penelitian ilmiah dan terbukti mendukung perkembangan anak.',
  },
];

const testimonials = [
  {
    quote:
      'Anak saya sangat berkembang sejak bergabung dengan Studiva. Psikolog Fitri benar-benar memahami kebutuhan anak-anak dengan special needs.',
    author: 'Ibu Siti',
    role: 'Parent Tier 1',
  },
  {
    quote:
      'Resources di Tier 2 sangat membantu saya memahami anak saya lebih baik. Komunitas juga sangat supportive.',
    author: 'Ibu Rina',
    role: 'Parent Tier 2',
  },
  {
    quote:
      'Terima kasih Studiva! Konsultasi dengan Psikolog Fitri memberikan perspektif baru dalam pendekatan saya.',
    author: 'Ibu Devi',
    role: 'Parent Tier 1',
  },
];

const expertiseAreas = ['Inclusive Education', 'Child Psychology', 'Special Needs Support', 'Parent Counseling'];

const steps = [
  {
    icon: '🎯',
    title: 'Pilih Tier',
    description: 'Tier 1 (School) atau Tier 2 (Digital). Sesuaikan dengan kebutuhan keluarga Anda.',
  },
  {
    icon: '✍️',
    title: 'Daftar',
    description: 'Isi form singkat dengan data keluarga. Verifikasi email Anda.',
  },
  {
    icon: '💳',
    title: 'Subscribe',
    description: 'Pilih durasi (monthly/yearly). Pembayaran mudah via Stripe.',
  },
  {
    icon: '🚀',
    title: 'Mulai Journey',
    description: 'Akses resources, community, dan layanan konsultasi Psikolog Fitri.',
  },
];

const newsItems = [
  {
    icon: '📞',
    title: 'Konsultasi Gratis dengan Psikolog Fitri',
    description: 'Dapatkan sesi konsultasi gratis untuk mengenal lebih lanjut kebutuhan anak Anda.',
    linkLabel: 'Learn More',
    to: '/consultation',
  },
  {
    icon: '👥',
    title: 'Komunitas Studiva Terus Berkembang',
    description: 'Bergabunglah dengan komunitas parents yang saling mendukung perjalanan parenting inklusif.',
    linkLabel: 'Join Community',
    to: '/community',
  },
  {
    icon: '📚',
    title: 'Resources Baru: Panduan Parent',
    description: 'Kami terus menambahkan resources baru untuk membantu parents lebih efektif mendukung anak.',
    linkLabel: 'Explore',
    to: '/resources',
  },
];

interface ArrowButtonProps {
  to: string;
  presetTier?: Tier;
  bgClass: string;
  label: string;
  className?: string;
}

function ArrowButton({ to, presetTier, bgClass, label, className = '' }: ArrowButtonProps) {
  return (
    <Link
      to={to}
      state={presetTier ? { presetTier } : undefined}
      aria-label={label}
      className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-[1.15] hover:shadow-lg ${bgClass} ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function StarRating() {
  return (
    <div className="flex gap-1 text-gold" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero: image+text left, stacked program cards right. 85vh (not
          100vh/full-viewport-minus-nav) so the cards have room to breathe
          and never get clipped - see the 60px bottom padding on the right
          column below. */}
      <section className="overflow-hidden">
        <div className="flex flex-col md:h-[85vh] md:flex-row">
          {/* Left: hero photo + heading overlay */}
          <div className="relative flex h-[60vh] items-center justify-center overflow-hidden rounded-none sm:h-[400px] md:h-full md:w-1/2">
            <img
              src="/images/hero-children.jpg"
              alt="Anak-anak belajar bersama dengan penuh semangat di Studiva"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/15" />
            <h1 className="relative z-10 max-w-[420px] px-10 py-5 text-center text-[32px] font-bold leading-[1.3] text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.4)] sm:text-[40px] md:text-[48px]">
              Pendidikan Inklusif untuk <span className="text-gold">Setiap</span> Anak
            </h1>
          </div>

          {/* Right: stacked program cards, vertically centered with generous
              breathing room and extra bottom padding so nothing gets cut off */}
          <div className="flex flex-col items-center justify-center gap-7 bg-cream px-10 pb-[60px] pt-10 md:h-full md:w-1/2">
            <div
              id="tier1"
              className="hover-lift flex h-[270px] w-full flex-col items-center justify-center rounded-2xl bg-skyblue p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
            >
              <h3 className="text-[26px] font-bold text-white">Sekolah Studiva</h3>
              <p className="mt-1 w-full text-left text-[16px] text-white/90">Untuk Anak di Sekolah Kami</p>
              <ul className="mt-3 w-full space-y-1 text-left">
                {tier1Features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px] leading-[1.4] text-white">
                    <span className="text-gold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-center gap-4">
                <Link
                  to="/signup"
                  state={{ presetTier: 'tier1' }}
                  className="cursor-pointer text-[16px] font-bold text-gold no-underline transition hover:underline"
                >
                  Daftar sekarang
                </Link>
                <ArrowButton to="/pricing" bgClass="bg-white" label="Pelajari Sekolah Studiva" />
              </div>
            </div>

            <div
              id="tier2"
              className="hover-lift flex h-[270px] w-full flex-col items-center justify-center rounded-2xl bg-gold p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
            >
              <h3 className="text-[26px] font-bold text-navy">Studiva Digital</h3>
              <p className="mt-1 w-full text-left text-[16px] text-navy/85">Untuk Orangtua di Mana Saja</p>
              <ul className="mt-3 w-full space-y-1 text-left">
                {tier2Features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px] leading-[1.4] text-navy">
                    <span>•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-center gap-4">
                <Link
                  to="/signup"
                  state={{ presetTier: 'tier2' }}
                  className="cursor-pointer text-[16px] font-bold text-navy no-underline transition hover:underline"
                >
                  Daftar sekarang
                </Link>
                <ArrowButton to="/signup" presetTier="tier2" bgClass="bg-navy" label="Mulai Studiva Digital" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Studiva */}
      <section className="bg-white px-4 py-20 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-center text-h2 font-bold text-navy">Mengapa Memilih Studiva?</h2>
          <p className="mt-3 text-center text-textlight">
            Dipimpin oleh Psikolog Fitri Effendy yang berpengalaman
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {whyStudiva.map((item) => (
              <div key={item.title} className="hover-lift rounded-lg bg-[#F8F8F8] p-8">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-3 text-h3 font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-textlight">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-skyblue/10 px-4 py-20 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-center text-h2 font-bold text-navy">Apa Kata Parents Kami</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="hover-lift mx-auto max-w-[360px]">
                <StarRating />
                <p className="mt-4 italic text-navy">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-bold text-textdark">{t.author}</p>
                <p className="text-sm text-textlight">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Psikolog Fitri */}
      <section className="bg-white px-4 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-h2 font-bold text-navy" style={{ fontSize: '32px' }}>
              Psikolog Fitri Effendy
            </h2>
            <p className="mt-1 font-semibold text-gold">S.Psi, Founder &amp; Head Psychologist</p>
            <p className="my-7 italic text-navy">
              &ldquo;Setiap anak memiliki potensi. Misi saya adalah membantu setiap anak
              mengembangkan potensi mereka melalui pendidikan inklusif yang personal dan penuh
              kasih sayang.&rdquo;
            </p>
            <ul className="space-y-2">
              {expertiseAreas.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-navy">
                  <span>✓</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
            <Link to="/consultation" className="btn-primary mt-8 inline-flex">
              Book Consultation with Psikolog Fitri
            </Link>
          </div>
          <div className="flex justify-center">
            {/* No real photo asset available yet - honest placeholder rather than a fake stock image. */}
            <div className="flex h-[300px] w-[300px] max-w-full items-center justify-center rounded-xl bg-skyblue/20 text-6xl font-bold text-navy shadow-md">
              FE
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-cream px-4 py-20 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-center text-h2 font-bold text-navy">Bagaimana Cara Memulai?</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                  {index + 1}
                </div>
                <div className="mt-3 text-4xl">{step.icon}</div>
                <h3 className="mt-3 text-h3 font-bold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-textlight">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News/Events */}
      <section className="bg-white px-4 py-20 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-center text-h2 font-bold text-navy">Terbaru dari Studiva</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {newsItems.map((item) => (
              <div key={item.title} className="hover-lift rounded-lg bg-[#F8F8F8] p-8">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-3 text-h3 font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-textlight">{item.description}</p>
                <Link
                  to={item.to}
                  className="mt-3 inline-block font-semibold text-gold hover:underline"
                >
                  {item.linkLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy px-4 py-24 text-center text-white md:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,215,0,0.28), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-h2 font-bold">Siap Mulai Journey Inklusif Anda?</h2>
          <p className="mt-4 text-white/90">
            Bergabunglah dengan ribuan parents yang telah melihat perubahan positif dalam
            perkembangan anak mereka.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link to="/signup" state={{ presetTier: 'tier1' }} className="btn-primary">
              Daftar Tier 1
            </Link>
            <Link to="/signup" state={{ presetTier: 'tier2' }} className="btn-outline border-white text-white hover:bg-white hover:text-navy">
              Daftar Tier 2
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
