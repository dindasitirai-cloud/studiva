import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  GraduationCap,
  Lightbulb,
  Users,
  CalendarCheck,
  UserPlus,
  Compass,
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import Reveal from '../components/Reveal';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: UserPlus,
    title: 'Profil Anak & Perjalanan Belajar',
    description: 'Tambahkan profil anak (bisa lebih dari satu) dan pantau perjalanan belajarnya, terakumulasi otomatis dari semua aktivitas di platform.',
  },
  {
    icon: Library,
    title: 'Resource Library',
    description: 'Artikel dan panduan parenting berbasis riset, dapat difilter berdasarkan kategori dan usia anak. Progres membaca tercatat otomatis per anak.',
  },
  {
    icon: GraduationCap,
    title: 'Courses & Webinar',
    description: 'Live webinar bersama Psikolog Fitri Effendy untuk sesi interaktif langsung, plus video rekaman webinar yang sudah selesai, bisa ditonton kapan saja.',
  },
  {
    icon: Lightbulb,
    title: 'Learning Strategies',
    description: 'Strategi dan aktivitas edukatif praktis yang bisa langsung diterapkan di rumah. Tandai "Sudah Dilakukan" untuk melacak strategi yang sudah dicoba.',
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Forum diskusi termoderasi untuk berbagi pengalaman dengan sesama orang tua. Dapatkan notifikasi saat ada yang membalas diskusi Anda.',
  },
  {
    icon: CalendarCheck,
    title: 'Konsultasi dengan Psikolog',
    description: 'Ajukan permintaan konsultasi 1-on-1 dengan Psikolog Fitri Effendy. Jadwal dikonfirmasi secara manual oleh tim sesuai ketersediaan psikolog.',
  },
];

const steps = [
  { icon: UserPlus, title: 'Daftar & Berlangganan', description: 'Buat akun, pilih paket, dan selesaikan pembayaran via Stripe dalam beberapa menit.' },
  { icon: Compass, title: 'Tambah Profil Anak', description: 'Tambahkan satu atau lebih profil anak untuk melacak perjalanan belajarnya secara individual.' },
  {
    icon: Users,
    title: 'Eksplorasi & Terapkan',
    description: 'Baca artikel, ikuti webinar, simpan strategi, dan terapkan di rumah. Semua progres tercatat otomatis.',
  },
  {
    icon: CalendarCheck,
    title: 'Konsultasi Saat Dibutuhkan',
    description: 'Ajukan sesi konsultasi dengan psikolog kapan pun ada pertanyaan spesifik tentang anak Anda.',
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Didampingi Psikolog Profesional',
    description: 'Semua materi dan konsultasi dipandu langsung oleh Psikolog Fitri Effendy dan tim profesional Studiva.',
  },
  {
    icon: Sparkles,
    title: 'Fleksibel & Praktis',
    description: 'Akses kapan saja, di mana saja, disesuaikan dengan jadwal dan kebutuhan keluarga Anda.',
  },
  {
    icon: Heart,
    title: 'Inklusif untuk Semua Keluarga',
    description: 'Dirancang untuk mendukung setiap anak dan orang tua, apa pun kebutuhan belajarnya.',
  },
];

// Same badge-color rotation used on the home page and the Sekolah Studiva
// page (yellow/sky/coral/green/navy) - keeps icon badges on-brand and varied
// instead of one flat amber tint on every card across this page. Each mockup
// below gets exactly one color from this list so it still reads as a single
// coherent screenshot rather than a rainbow of unrelated icons.
const BADGE_PALETTE = [
  { bg: 'bg-amber-100', color: 'text-amber-600', solid: 'bg-amber-500', hoverBg: 'group-hover:bg-amber-500' },
  { bg: 'bg-stv-sky-tint', color: 'text-stv-sky-stroke', solid: 'bg-stv-sky-stroke', hoverBg: 'group-hover:bg-stv-sky-stroke' },
  { bg: 'bg-stv-coral-tint', color: 'text-stv-coral', solid: 'bg-stv-coral', hoverBg: 'group-hover:bg-stv-coral' },
  { bg: 'bg-stv-green-tint', color: 'text-stv-green', solid: 'bg-stv-green', hoverBg: 'group-hover:bg-stv-green' },
  { bg: 'bg-stv-badge-navy-tint', color: 'text-stv-navy', solid: 'bg-stv-navy', hoverBg: 'group-hover:bg-stv-navy' },
];

// ── Tier 2 dashboard mockup components ──────────────────────────────────────

function T2Shell({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stv-border bg-white shadow-[0_8px_28px_rgba(16,58,107,.10)]">
      <div className={`flex items-center gap-2 px-3 py-2.5 ${accent}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-2 flex-1 truncate font-baloo text-[11px] font-bold text-white/90">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// 1. Beranda
function T2MockupBeranda() {
  return (
    <T2Shell title="Beranda" accent="bg-stv-navy">
      <div className="mb-2 rounded-xl bg-gradient-to-br from-stv-navy to-[#1a3f6f] p-3 text-white">
        <p className="text-[10px] text-white/70">Selamat datang kembali!</p>
        <p className="font-baloo text-[13px] font-extrabold">Setiap langkah kecil itu berarti.</p>
        <div className="mt-2 flex gap-3 text-center">
          {[['4', 'Artikel', 'text-amber-300'], ['2', 'Course', 'text-sky-300'], ['3', 'Strategi', 'text-emerald-300']].map(([n, label, c]) => (
            <div key={label} className="flex-1 rounded-lg bg-white/10 py-1.5">
              <p className={`font-baloo text-[14px] font-extrabold ${c}`}>{n}</p>
              <p className="text-[9px] text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[['bg-amber-100 text-amber-700', '📚', 'Resource Library'], ['bg-sky-100 text-sky-700', '🎓', 'Courses'], ['bg-emerald-100 text-emerald-700', '💡', 'Strategies'], ['bg-violet-100 text-violet-700', '💬', 'Konsultasi']].map(([cls, icon, label]) => (
          <div key={label} className={`rounded-xl p-2 text-center ${cls}`}>
            <span className="text-[14px]">{icon}</span>
            <p className="mt-0.5 text-[9px] font-bold">{label}</p>
          </div>
        ))}
      </div>
    </T2Shell>
  );
}

// 2. Resource Library
function T2MockupLibrary() {
  const articles = [
    { title: 'Mengenal Gaya Belajar Visual', cat: 'Gaya Belajar', read: true },
    { title: 'Strategi Komunikasi Positif', cat: 'Komunikasi', read: true },
    { title: 'Membangun Rutinitas Pagi', cat: 'Rutinitas', read: false },
    { title: 'Teknik Sensory Break di Rumah', cat: 'Sensorik', read: false },
  ];
  return (
    <T2Shell title="Resource Library" accent="bg-amber-500">
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {['Semua', 'ASD', 'ADHD', 'Sensorik'].map((cat, i) => (
          <span key={cat} className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${i === 0 ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'}`}>{cat}</span>
        ))}
      </div>
      <div className="flex flex-col divide-y divide-stv-border">
        {articles.map(a => (
          <div key={a.title} className="flex items-center gap-2 py-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${a.read ? 'bg-stv-green' : 'bg-amber-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11px] font-semibold text-stv-navy">{a.title}</p>
              <p className="text-[9px] text-stv-muted">{a.cat}</p>
            </div>
            {a.read && <span className="shrink-0 rounded-full bg-stv-green-tint px-1.5 py-0.5 text-[9px] font-bold text-stv-green">Dibaca</span>}
          </div>
        ))}
      </div>
    </T2Shell>
  );
}

// 3. Courses & Webinar
function T2MockupCourses() {
  return (
    <T2Shell title="Courses & Webinar" accent="bg-stv-sky-stroke">
      <div className="flex flex-col gap-2">
        {/* Upcoming webinar */}
        <div className="rounded-xl bg-gradient-to-br from-stv-sky-tint to-blue-100 p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-stv-sky-stroke px-2 py-0.5 text-[9px] font-bold text-white">Live Webinar</span>
            <span className="text-[9px] text-stv-muted">Sabtu 19.00</span>
          </div>
          <p className="text-[11px] font-bold text-stv-navy">Mendampingi Anak dengan ADHD</p>
          <p className="mt-0.5 text-[9px] text-stv-muted">Psikolog Fitri Effendy</p>
          <button type="button" className="mt-1.5 w-full rounded-full bg-amber-500 py-1 text-[9px] font-bold text-white">Daftar Webinar</button>
        </div>
        {/* Video recording */}
        <div className="rounded-xl border border-stv-border bg-slate-50 p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">Rekaman</span>
            <span className="text-[9px] text-stv-green">Tersedia</span>
          </div>
          <p className="text-[11px] font-bold text-stv-navy">Mengelola Kecemasan Orang Tua</p>
          <div className="mt-1.5 flex gap-1.5">
            <button type="button" className="flex-1 rounded-full bg-amber-500 py-1 text-[9px] font-bold text-white">Tonton</button>
            <button type="button" className="flex-1 rounded-full border border-stv-border py-1 text-[9px] font-semibold text-stv-body">Materi</button>
          </div>
        </div>
      </div>
    </T2Shell>
  );
}

// 4. Learning Strategies
function T2MockupStrategies() {
  const items = [
    { title: 'Jadwal Visual Harian', cat: 'ASD', done: true },
    { title: 'Sensory Break 10 Menit', cat: 'Sensorik', done: true },
    { title: 'Reward Chart Sederhana', cat: 'ADHD', done: false },
    { title: 'Bermain Peran Sosial', cat: 'Komunikasi', done: false },
  ];
  return (
    <T2Shell title="Learning Strategies" accent="bg-emerald-600">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold text-stv-navy">4 strategi tersimpan</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Sudah Dicoba: 2</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map(s => (
          <div key={s.title} className={`flex items-center gap-2 rounded-xl border p-2 ${s.done ? 'border-emerald-200 bg-emerald-50' : 'border-stv-border bg-white'}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-stv-muted'}`}>
              {s.done ? '✓' : '·'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[10px] font-semibold text-stv-navy">{s.title}</p>
              <span className="text-[9px] text-stv-muted">{s.cat}</span>
            </div>
            {!s.done && <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">Coba</span>}
          </div>
        ))}
      </div>
    </T2Shell>
  );
}

// 5. Community Forum
function T2MockupForum() {
  const threads = [
    { author: 'Ibu Rina', avatar: 'R', avatarBg: 'bg-stv-sky-stroke', title: 'Tips transisi antar aktivitas untuk anak ADHD?', replies: 12, hasNew: true },
    { author: 'Ibu Devi', avatar: 'D', avatarBg: 'bg-stv-coral', title: 'Pengalaman terapi OT di rumah', replies: 8, hasNew: false },
    { author: 'Bapak Andi', avatar: 'A', avatarBg: 'bg-stv-green', title: 'Rekomendasi buku parenting inklusif?', replies: 5, hasNew: false },
  ];
  return (
    <T2Shell title="Community Forum" accent="bg-violet-600">
      <div className="flex flex-col gap-1.5">
        {threads.map(t => (
          <div key={t.title} className="flex items-start gap-2 rounded-xl border border-stv-border bg-white p-2">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-baloo text-[11px] font-bold text-white ${t.avatarBg}`}>{t.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[10px] font-bold text-stv-navy">{t.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[9px] text-stv-muted">{t.author} · {t.replies} balasan</span>
                {t.hasNew && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white">Baru</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-2 w-full rounded-full bg-violet-600 py-1.5 text-[10px] font-bold text-white">+ Buat Diskusi</button>
    </T2Shell>
  );
}

// 6. Konsultasi
function T2MockupKonsultasi() {
  return (
    <T2Shell title="Konsultasi" accent="bg-teal-600">
      <div className="flex flex-col gap-2">
        {/* Psikolog card */}
        <div className="flex items-center gap-2.5 rounded-xl bg-teal-50 p-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 font-baloo text-[14px] font-bold text-white">F</div>
          <div>
            <p className="text-[11px] font-bold text-stv-navy">Psikolog Fitri Effendy</p>
            <p className="text-[9px] text-stv-muted">Spesialis Anak Berkebutuhan Khusus</p>
            <div className="mt-0.5 flex gap-1">
              {['ASD', 'ADHD', 'OT'].map(t => <span key={t} className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[8px] font-bold text-teal-700">{t}</span>)}
            </div>
          </div>
        </div>
        {/* Booking status */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-stv-navy">Pengajuan Konsultasi</span>
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-white">Menunggu</span>
          </div>
          <p className="text-[10px] text-stv-muted">Tim kami akan menghubungi Anda untuk konfirmasi jadwal.</p>
        </div>
        {/* CTA */}
        <button type="button" className="w-full rounded-full bg-teal-600 py-1.5 text-[10px] font-bold text-white">Ajukan Konsultasi Baru</button>
      </div>
    </T2Shell>
  );
}

const TIER2_MOCKUPS: { component: React.FC; caption: string }[] = [
  { component: T2MockupBeranda,    caption: 'Beranda & Ringkasan Aktivitas' },
  { component: T2MockupLibrary,    caption: 'Resource Library' },
  { component: T2MockupCourses,    caption: 'Courses & Webinar' },
  { component: T2MockupStrategies, caption: 'Learning Strategies' },
  { component: T2MockupForum,      caption: 'Community Forum' },
  { component: T2MockupKonsultasi, caption: 'Konsultasi dengan Psikolog' },
];


type TabId = 'tentang' | 'fitur' | 'sorotan' | 'cara-kerja' | 'kenapa';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'fitur', label: 'Fitur Dashboard' },
  { id: 'sorotan', label: 'Intip Dashboard' },
  { id: 'cara-kerja', label: 'Cara Kerja' },
  { id: 'kenapa', label: 'Kenapa Kami' },
];

function TentangPanel() {
  return (
    <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-2">
      <Reveal>
        <div className="flex items-center justify-center">
          <div className="flex h-[260px] w-[260px] items-center justify-center rounded-[40px] bg-gradient-to-br from-amber-100 to-yellow-50 shadow-[0_20px_50px_rgba(245,158,11,.15)] sm:h-[320px] sm:w-[320px]">
            <Heart className="h-24 w-24 text-amber-500" strokeWidth={1.5} />
          </div>
        </div>
      </Reveal>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-[16px] py-[8px] text-[13px] font-extrabold uppercase tracking-[2px] text-amber-700">
          Apa itu Studiva Digital?
        </span>
        <h2 className="mb-5 mt-4 font-baloo text-[26px] font-extrabold leading-[1.2] text-stv-navy sm:text-[32px]">
          Teman pendamping Anda dalam mengasuh anak, kapan pun dibutuhkan
        </h2>
        <p className="mb-4 text-[16px] leading-[1.75] text-stv-body sm:text-[17px]">
          Sebagai orang tua, Anda tidak harus menghadapi setiap tantangan tumbuh kembang anak sendirian. Studiva
          Digital menghadirkan pendampingan dari psikolog profesional, langsung ke ponsel Anda, praktis, inklusif,
          dan bisa diakses kapan saja.
        </p>
        <p className="text-[16px] leading-[1.75] text-stv-body sm:text-[17px]">
          Mulai dari rangkuman materi yang mudah dipahami, kelas bersama psikolog, hingga konsultasi langsung untuk
          kebutuhan spesifik anak Anda, semua dirancang agar Anda merasa lebih siap dan tidak sendirian.
        </p>
      </Reveal>
    </div>
  );
}

function FiturPanel() {
  return (
    <div className="mx-auto max-w-[1160px]">
      <Reveal>
        <div className="mx-auto mb-12 max-w-[680px] text-center">
          <h2 className="font-baloo text-[28px] font-extrabold leading-[1.15] text-stv-navy sm:text-[36px]">Fitur Dashboard</h2>
          <p className="mt-3 text-[16px] leading-[1.6] text-stv-body sm:text-[17px]">
            Semua yang Anda butuhkan untuk mendampingi tumbuh kembang anak, dalam satu platform.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          const badge = BADGE_PALETTE[i % BADGE_PALETTE.length];
          return (
            <Reveal key={feature.title}>
              <div className="group h-full rounded-2xl border-[1.5px] border-amber-100 bg-white p-7 shadow-[0_8px_24px_rgba(217,119,6,.06)] transition duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_40px_rgba(217,119,6,.18)]">
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:text-white ${badge.bg} ${badge.color} ${badge.hoverBg}`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="mb-2 font-baloo text-[19px] font-bold text-stv-navy">{feature.title}</h3>
                <p className="text-[15px] leading-[1.6] text-stv-body">{feature.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function SorotanPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <Reveal>
        <div className="mb-10 text-center">
          <h2 className="font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[36px]">Intip Dashboard</h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-stv-body">
            Intip tampilan setiap fitur dashboard Studiva Digital yang akan Anda gunakan sehari-hari.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TIER2_MOCKUPS.map(({ component: Mockup, caption }) => (
          <Reveal key={caption}>
            <div>
              <Mockup />
              <p className="mt-2.5 text-center text-[14px] font-semibold text-stv-navy">{caption}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CaraKerjaPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <Reveal>
        <h2 className="mb-14 text-center font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[36px]">
          Bagaimana Cara Kerjanya?
        </h2>
      </Reveal>

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const badge = BADGE_PALETTE[i % BADGE_PALETTE.length];
          return (
            <Reveal key={step.title}>
              <div className="relative z-[1] flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-amber-50 bg-amber-500 font-baloo text-[22px] font-extrabold text-white shadow-[0_8px_20px_rgba(245,158,11,.35)]">
                  {i + 1}
                </div>
                <div className={`my-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-[0_8px_20px_rgba(217,119,6,.1)] ${badge.bg} ${badge.color}`}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mb-1.5 font-baloo text-[18px] font-bold text-stv-navy">{step.title}</h3>
                <p className="max-w-[220px] text-[14px] leading-[1.6] text-stv-body">{step.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function KenapaPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <Reveal>
        <h2 className="mb-12 text-center font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[36px]">
          Kenapa Studiva Digital?
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {highlights.map((item, i) => {
          const Icon = item.icon;
          const badge = BADGE_PALETTE[i % BADGE_PALETTE.length];
          return (
            <Reveal key={item.title}>
              <div className="h-full rounded-2xl border-[1.5px] border-amber-100 bg-white p-7 text-center shadow-[0_8px_24px_rgba(217,119,6,.06)]">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${badge.bg} ${badge.color}`}>
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="mb-2 font-baloo text-[18px] font-bold text-stv-navy">{item.title}</h3>
                <p className="text-[15px] leading-[1.6] text-stv-body">{item.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function StudivaDigitalPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tentang');

  return (
    <div className="bg-white font-nunito-sans text-stv-body">
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden px-4 py-16 text-center sm:px-8 sm:py-20 md:py-24"
        style={{ background: 'linear-gradient(160deg, #FFFBEB 0%, #FDE9C8 55%, #FFF6E0 100%)' }}
      >
        <Reveal className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-90px] top-[-70px] h-[260px] w-[260px] rounded-full bg-amber-300/30 blur-[40px]" />
          <div className="absolute bottom-[-60px] right-[-70px] h-[220px] w-[220px] rounded-full bg-amber-400/25 blur-[40px]" />
        </Reveal>

        <div className="relative mx-auto max-w-[780px]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-[18px] py-[9px] text-[13px] font-extrabold uppercase tracking-[2px] text-stv-navy shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Platform Digital
            </span>
            <h1 className="mb-6 mt-6 font-baloo text-[34px] font-extrabold leading-[1.12] text-stv-navy sm:text-[46px] md:text-[58px]">
              Pendampingan Cerdas untuk Tumbuh Kembang Anak
            </h1>
            <p className="mx-auto mb-9 max-w-[620px] text-[16px] leading-[1.7] text-stv-body sm:text-[18px]">
              Studiva Digital adalah platform langganan yang memberi Anda akses ke materi, kelas, strategi belajar,
              komunitas, dan konsultasi langsung dengan psikolog, semua dalam satu tempat.
            </p>
            <Link
              to="/daftar"
              state={{ presetTier: 'tier2' }}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-10 py-[16px] font-baloo text-[17px] font-bold text-stv-navy no-underline shadow-[0_10px_28px_rgba(245,158,11,.4)] transition hover:-translate-y-[3px] hover:shadow-[0_16px_36px_rgba(245,158,11,.5)]"
            >
              Daftar Sekarang
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ TAB BAR ============ */}
      <div className="sticky top-[82px] z-40 border-b border-amber-100 bg-white">
        <div
          className="mx-auto flex max-w-[1240px] justify-center gap-7 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden sm:px-8"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 whitespace-nowrap border-b-[3px] px-1 py-[18px] text-[16px] transition ${
                  isActive
                    ? 'border-amber-500 font-bold text-amber-600'
                    : 'border-transparent font-semibold text-stv-body hover:text-amber-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ TAB CONTENT ============ */}
      <section className={`relative overflow-hidden px-4 py-14 sm:px-8 sm:py-16 ${activeTab === 'fitur' || activeTab === 'cara-kerja' ? 'bg-amber-50/40' : ''}`}>
        <span className="pointer-events-none absolute left-[2%] top-[8%] h-[11px] w-[11px] rounded-full bg-amber-400 opacity-40" />
        <span className="pointer-events-none absolute right-[3%] top-[16%] h-[8px] w-[8px] rounded-full bg-stv-coral opacity-45" />
        <span className="pointer-events-none absolute bottom-[12%] left-[4%] h-[9px] w-[9px] rounded-full bg-stv-green opacity-40" />
        <span className="pointer-events-none absolute bottom-[9%] right-[5%] h-[10px] w-[10px] rounded-full bg-stv-sky-stroke opacity-35" />
        <Sparkles className="pointer-events-none absolute right-[7%] top-[5%] h-[14px] w-[14px] text-amber-500 opacity-50" fill="currentColor" strokeWidth={0} />
        <Reveal key={activeTab}>
          {activeTab === 'tentang' && <TentangPanel />}
          {activeTab === 'fitur' && <FiturPanel />}
          {activeTab === 'sorotan' && <SorotanPanel />}
          {activeTab === 'cara-kerja' && <CaraKerjaPanel />}
          {activeTab === 'kenapa' && <KenapaPanel />}
        </Reveal>
      </section>

      {/* ============ CTA PENUTUP ============ */}
      <section
        className="relative overflow-hidden px-4 py-20 text-center sm:px-8 md:py-24"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}
      >
        <Reveal className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-8 h-[120px] w-[120px] rounded-full bg-white/15" />
          <div className="absolute bottom-8 right-[10%] h-[150px] w-[150px] rounded-[36px] bg-white/10" />
        </Reveal>
        <Reveal className="relative">
          <div className="mx-auto max-w-[700px]">
            <h2 className="mb-5 font-baloo text-[30px] font-extrabold leading-[1.15] text-white sm:text-[40px]">
              Mulai Dampingi Tumbuh Kembang Anak Anda Hari Ini
            </h2>
            <p className="mb-9 text-[16px] leading-[1.7] text-white/90 sm:text-[18px]">
              Bergabunglah dengan Studiva Digital dan dapatkan akses penuh ke materi, kelas, komunitas, dan
              konsultasi dengan psikolog.
            </p>
            <Link
              to="/daftar"
              state={{ presetTier: 'tier2' }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-[16px] font-baloo text-[18px] font-bold text-amber-600 no-underline shadow-[0_14px_30px_rgba(0,0,0,.15)] transition hover:-translate-y-[3px]"
            >
              Daftar Sekarang
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
