import React, { useState } from 'react';
import {
  Hand,
  UserCog,
  Sparkles,
  Clock,
  Users,
  FileText,
  Eye,
  Repeat,
  Award,
  Smile,
  ExternalLink,
  GraduationCap,
  UserPlus,
  Network,
  ClipboardCheck,
  FolderOpen,
  CalendarClock,
  MessageCircleHeart,
  LayoutDashboard,
  Target,
  MessagesSquare,
  CreditCard,
  FolderHeart,
  LucideIcon,
} from 'lucide-react';
import Reveal from '../components/Reveal';

interface IconCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface BadgedIconCard extends IconCard {
  badgeBg: string;
  badgeColor: string;
}

const principles: BadgedIconCard[] = [
  {
    icon: Hand,
    badgeBg: 'bg-stv-yellow-tint',
    badgeColor: 'text-stv-yellow-deep',
    title: 'Inklusif & non-diskriminatif',
    description: 'Menerima setiap anak berkebutuhan khusus apa pun jenis atau tingkat hambatannya, tanpa diskriminasi.',
  },
  {
    icon: UserCog,
    badgeBg: 'bg-stv-sky-tint',
    badgeColor: 'text-stv-sky-stroke',
    title: 'Personalisasi berbasis asesmen',
    description: 'Setiap rencana belajar disusun dari asesmen perkembangan masing-masing anak.',
  },
  {
    icon: Sparkles,
    badgeBg: 'bg-stv-coral-tint',
    badgeColor: 'text-stv-coral',
    title: 'Multisensori & berbasis pengalaman',
    description: 'Belajar lewat gambar, benda konkret, lagu, dan gerakan, bukan hanya hafalan.',
  },
  {
    icon: Clock,
    badgeBg: 'bg-stv-sky-tint',
    badgeColor: 'text-stv-sky-stroke',
    title: 'Fleksibel pada kecepatan anak',
    description: 'Materi dan ritme disesuaikan dengan kemampuan unik tiap anak.',
  },
  {
    icon: Users,
    badgeBg: 'bg-stv-green-tint',
    badgeColor: 'text-stv-green',
    title: 'Kolaboratif',
    description: 'Guru, orang tua, dan terapis bekerja sebagai satu tim.',
  },
];

const curriculum: IconCard[] = [
  {
    icon: FileText,
    title: 'IEP, Individualized Education Plan',
    description: 'Rencana belajar individual yang disusun bersama guru, orang tua, dan tenaga ahli.',
  },
  {
    icon: Eye,
    title: 'Metode visual & multisensori',
    description: 'Gambar, benda konkret, lagu, dan gerakan untuk memperkuat pemahaman.',
  },
  {
    icon: Repeat,
    title: 'Repetisi & konsistensi',
    description: 'Jadwal rutin dan pengulangan konsep dengan variasi aktivitas.',
  },
  {
    icon: Award,
    title: 'Reinforcement positif',
    description: 'Pujian dan sistem reward untuk membangun perilaku positif.',
  },
  {
    icon: Smile,
    title: 'Zona nyaman & pilihan mandiri',
    description: 'Anak boleh memilih kegiatan sesuai minat dan suasana hatinya.',
  },
];

interface ResearchCard {
  title: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
}

const researchCards: ResearchCard[] = [
  {
    title: 'Intervensi dini mengubah lintasan perkembangan',
    body:
      'Penelitian menunjukkan intervensi dini yang terstruktur dikaitkan dengan peningkatan signifikan pada kemampuan adaptif, kognitif, dan bahasa anak. Anak yang mulai didampingi lebih awal cenderung mencapai hasil yang lebih baik dibanding yang mulai terlambat. Inilah mengapa rentang usia 5–10 tahun begitu krusial.',
    sourceLabel:
      'The Impact of Early Intensive Behavioral and Developmental Interventions on Key Developmental Outcomes in Young Children With ASD: A Narrative Review',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12514992/',
  },
  {
    title: 'Kelompok kecil & 1:1 jauh lebih efektif',
    body:
      'Meta-analisis menunjukkan pembelajaran kelompok kecil menghasilkan efek belajar yang jauh lebih besar (effect size g = 0,86) dibanding kelompok besar (g = 0,30). Inilah alasan Studiva mengutamakan kelas kecil dan sesi 1:1.',
    sourceLabel: 'Achievement of learners receiving UDL instruction: A meta-analysis (Teaching and Teacher Education, ScienceDirect)',
    sourceUrl: 'https://www.sciencedirect.com/science/article/abs/pii/S0742051X22003316',
  },
  {
    title: 'Rencana belajar individual & terstruktur membuahkan hasil',
    body:
      'Tinjauan sistematis menemukan pengajaran terstruktur dan dipersonalisasi dikaitkan dengan kemajuan nyata pada perilaku adaptif, keterampilan hidup sehari-hari, dan bahasa, fondasi dari setiap IEP yang kami susun.',
    sourceLabel:
      'Effectiveness and experiences of early intensive behavioral and naturalistic developmental behavior interventions for ASD: a mixed-methods systematic review and meta-analysis',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12849440/',
  },
  {
    title: 'Keterlibatan orang tua mengubah hasil',
    body:
      'Riset konsisten menunjukkan keterlibatan orang tua meningkatkan capaian belajar, manajemen perilaku, dan kualitas hubungan orang tua–anak, terutama pada intervensi usia dini. Karena itu orang tua adalah bagian dari tim, bukan penonton.',
    sourceLabel: 'Family Involvement in Special Education (EBSCO Research Starters)',
    sourceUrl: 'https://www.ebsco.com/research-starters/education/family-involvement-special-education',
  },
];

const additionalReferences = [
  {
    label:
      'Clinically Significant Outcomes of Early Intensive Behavioral Intervention for Children With ASD: An Individual Participant Data Meta-Analysis (PubMed)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41502379/',
  },
  {
    label: 'The effectiveness of Universal Design for Learning: a meta-analysis 2013–2016 (Capp, 2017, ERIC)',
    url: 'https://eric.ed.gov/?id=EJ1147229',
  },
];

const team: IconCard[] = [
  {
    icon: GraduationCap,
    title: 'Guru Kelas Inklusif',
    description: 'Terlatih dalam strategi pembelajaran diferensiasi.',
  },
  {
    icon: UserPlus,
    title: 'Guru Pendamping Khusus (GPK)',
    description: 'Dukungan intensif bagi anak yang membutuhkan.',
  },
  {
    icon: Network,
    title: 'Kolaborasi Tim',
    description: 'Guru, orang tua, terapis, dan psikolog anak bekerja bersama.',
  },
];

const assessmentPoints: IconCard[] = [
  {
    icon: ClipboardCheck,
    title: 'Penilaian formatif & kualitatif',
    description: 'Dari observasi harian.',
  },
  {
    icon: FolderOpen,
    title: 'Portofolio anak',
    description: 'Kumpulan karya & dokumentasi proses belajar.',
  },
  {
    icon: CalendarClock,
    title: 'Laporan berkala',
    description: 'Setiap 2–3 bulan, dibahas bersama orang tua.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Refleksi diri sederhana',
    description: 'Untuk anak yang sudah mampu menyampaikan perasaannya.',
  },
];

const benefits: IconCard[] = [
  {
    icon: LayoutDashboard,
    title: 'Perkembangan Harian',
    description: 'Catatan perkembangan harian dari guru dalam 5 area: akademik, sosial-emosional, motorik, komunikasi, dan sensorik, lengkap dengan suasana hati anak hari itu.',
  },
  {
    icon: CalendarClock,
    title: 'Rekap Kehadiran',
    description: 'Pantau kehadiran anak setiap hari lewat kalender digital, hadir, izin, sakit, atau alfa, beserta catatan dari guru.',
  },
  {
    icon: FolderOpen,
    title: 'Portfolio & Asesmen',
    description: 'Karya terbaik anak terdokumentasi rapi (seni, motorik, proyek, akademik), ditambah hasil asesmen perkembangan dari tim ahli.',
  },
  {
    icon: Target,
    title: 'IEP Transparan',
    description: 'Lihat Rencana Belajar Individual anak, progres tiap tujuan, dan catatan revisi, selalu sinkron dengan yang dikerjakan guru di sekolah.',
  },
  {
    icon: MessagesSquare,
    title: 'Catatan untuk Guru',
    description: 'Sampaikan pesan, pertanyaan, atau info penting langsung ke wali kelas melalui dashboard. Guru membalas langsung di dalam aplikasi.',
  },
  {
    icon: CreditCard,
    title: 'Pembayaran SPP',
    description: 'Terima tagihan SPP bulanan, bayar via Stripe, dan unduh bukti pembayaran, semua dari dashboard tanpa perlu datang ke sekolah.',
  },
  {
    icon: FolderHeart,
    title: 'Satu Profil, Semua Riwayat',
    description: 'Perkembangan harian, kehadiran, portfolio, asesmen, dan IEP anak tersimpan rapi dalam satu profil digital yang bisa diakses kapan saja.',
  },
  {
    icon: Network,
    title: 'Bonus: Akses Studiva Digital',
    description: 'Orang tua Sekolah Studiva mendapat akses penuh ke platform Studiva Digital: resource library, webinar psikolog, komunitas forum, dan konsultasi online.',
  },
];

// ── Dashboard mockup sub-components ─────────────────────────────────────────

function MockupShell({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stv-border bg-white shadow-[0_8px_28px_rgba(16,58,107,.10)]">
      {/* Mini browser chrome */}
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

// 1. Perkembangan Harian
function MockupPerkembangan() {
  return (
    <MockupShell title="Perkembangan Harian" accent="bg-orange-500">
      <div className="flex flex-col gap-2">
        {[
          { date: 'Hari ini', teacher: 'Bu Ratna Sari', cat: 'Sosial-Emosional', catColor: 'bg-sky-100 text-sky-700', mood: '😊', note: 'Raka berhasil berbagi mainan tanpa diingatkan.' },
          { date: 'Kemarin', teacher: 'Pak Joko', cat: 'Motorik', catColor: 'bg-purple-100 text-purple-700', mood: '🙂', note: 'Latihan menggunting garis lurus sudah cukup rapi.' },
        ].map(u => (
          <div key={u.date} className="rounded-xl border border-stv-border bg-slate-50 p-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold text-stv-muted">{u.date} · {u.teacher}</span>
              <span className="text-[13px]">{u.mood}</span>
            </div>
            <span className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${u.catColor}`}>{u.cat}</span>
            <p className="text-[11px] leading-[1.5] text-stv-body">{u.note}</p>
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

// 2. Rekap Kehadiran
function MockupKehadiran() {
  const days = ['S','S','R','K','J'];
  const rows = [
    ['H','H','I','H','H'],
    ['H','S','H','H','H'],
    ['H','H','H','H','·'],
  ];
  const color: Record<string, string> = { H: 'bg-stv-green text-white', I: 'bg-amber-400 text-white', S: 'bg-red-400 text-white', '·': 'bg-slate-100 text-stv-muted' };
  const label: Record<string, string> = { H: 'H', I: 'I', S: 'S', '·': '·' };
  return (
    <MockupShell title="Rekap Kehadiran" accent="bg-stv-green">
      <div>
        <p className="mb-2 text-center text-[11px] font-bold text-stv-navy">Juli 2026</p>
        <div className="grid grid-cols-5 gap-1">
          {days.map(d => <div key={d} className="text-center text-[10px] font-bold text-stv-muted">{d}</div>)}
          {rows.flat().map((cell, i) => (
            <div key={i} className={`flex h-7 items-center justify-center rounded-lg text-[10px] font-bold ${color[cell]}`}>{label[cell]}</div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
          {[['bg-stv-green', 'Hadir'], ['bg-amber-400', 'Izin'], ['bg-red-400', 'Sakit']].map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${bg}`}/><span className="text-[10px] text-stv-muted">{label}</span></div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}

// 3. Portfolio & Asesmen
function MockupPortfolio() {
  const items = [
    { emoji: '🎨', label: 'Seni', color: 'bg-rose-50 border-rose-200' },
    { emoji: '✏️', label: 'Akademik', color: 'bg-blue-50 border-blue-200' },
    { emoji: '🏃', label: 'Motorik', color: 'bg-green-50 border-green-200' },
    { emoji: '📁', label: 'Proyek', color: 'bg-amber-50 border-amber-200' },
  ];
  return (
    <MockupShell title="Portfolio Anak" accent="bg-purple-600">
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <div key={item.label} className={`rounded-xl border p-2.5 text-center ${item.color}`}>
            <div className="mb-1 text-[20px]">{item.emoji}</div>
            <p className="text-[10px] font-bold text-stv-navy">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-xl bg-indigo-50 p-2">
        <p className="text-[10px] font-bold text-indigo-700">Asesmen Terbaru</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-stv-body">Komunikasi Verbal</span>
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">Berjalan</span>
        </div>
      </div>
    </MockupShell>
  );
}

// 4. IEP
function MockupIEP() {
  return (
    <MockupShell title="IEP Anak" accent="bg-stv-sky-stroke">
      <div className="flex flex-col gap-2">
        {[
          { area: 'Komunikasi', pct: 70, status: 'Berjalan', statusColor: 'bg-stv-sky-tint text-stv-sky-stroke', barColor: 'bg-stv-sky-stroke', goal: 'Menggunakan PECS tanpa bantuan' },
          { area: 'Motorik Halus', pct: 95, status: 'Tercapai', statusColor: 'bg-stv-green-tint text-stv-green', barColor: 'bg-stv-green', goal: 'Menulis nama sendiri' },
          { area: 'Sensorik', pct: 20, status: 'Perlu Perhatian', statusColor: 'bg-rose-50 text-rose-600', barColor: 'bg-rose-400', goal: 'Toleransi suara keras' },
        ].map(g => (
          <div key={g.area} className="rounded-xl border border-stv-border p-2.5">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-stv-navy">{g.area}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${g.statusColor}`}>{g.status}</span>
            </div>
            <p className="mb-1.5 text-[10px] text-stv-muted">{g.goal}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${g.barColor}`} style={{ width: `${g.pct}%` }} />
            </div>
            <p className="mt-0.5 text-right text-[9px] font-semibold text-stv-muted">{g.pct}%</p>
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

// 5. Catatan untuk Guru
function MockupCatatanGuru() {
  return (
    <MockupShell title="Catatan untuk Guru" accent="bg-teal-600">
      <div className="flex flex-col gap-2">
        {/* Parent message (right) */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-stv-sky-tint px-3 py-2">
            <p className="mb-0.5 text-[9px] font-bold text-stv-sky-stroke">Orang Tua</p>
            <p className="text-[10px] leading-[1.5] text-stv-navy">Raka terlihat lebih mudah lelah minggu ini. Ada info dari sekolah?</p>
            <p className="mt-0.5 text-right text-[9px] text-stv-muted">Senin, 09.15</p>
          </div>
        </div>
        {/* Teacher reply (left) */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-stv-green-tint px-3 py-2">
            <p className="mb-0.5 text-[9px] font-bold text-stv-green">Bu Ratna Sari</p>
            <p className="text-[10px] leading-[1.5] text-stv-navy">Terima kasih infonya. Kami perhatikan hal yang sama, sedang kami amati lebih lanjut.</p>
            <p className="mt-0.5 text-[9px] text-stv-muted">Senin, 11.30</p>
          </div>
        </div>
        {/* Input stub */}
        <div className="mt-1 flex items-center gap-1.5 rounded-xl border border-stv-border bg-slate-50 px-3 py-2">
          <span className="flex-1 text-[10px] text-stv-muted">Tulis catatan...</span>
          <span className="h-5 w-5 rounded-full bg-teal-600 text-center text-[10px] font-bold leading-5 text-white">↑</span>
        </div>
      </div>
    </MockupShell>
  );
}

// 6. Pembayaran SPP
function MockupSPP() {
  return (
    <MockupShell title="Pembayaran SPP" accent="bg-emerald-600">
      <div>
        <div className="mb-3 rounded-xl bg-emerald-600 px-3 py-2.5 text-white">
          <p className="text-[10px] text-white/75">Total Belum Dibayar</p>
          <p className="font-baloo text-[18px] font-extrabold">Rp 1.500.000</p>
          <p className="text-[9px] text-white/70">1 tagihan menunggu</p>
        </div>
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-bold text-stv-navy">SPP Bulan Juli 2026</p>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Menunggu</span>
          </div>
          <p className="mb-2 text-[10px] text-stv-muted">Jatuh tempo: 10 Juli 2026</p>
          <div className="flex items-center justify-between">
            <span className="font-baloo text-[13px] font-bold text-stv-navy">Rp 1.500.000</span>
            <button type="button" className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Bayar Sekarang</button>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

const DASHBOARD_MOCKUPS: { component: React.FC; caption: string }[] = [
  { component: MockupPerkembangan, caption: 'Perkembangan Harian' },
  { component: MockupKehadiran,    caption: 'Rekap Kehadiran' },
  { component: MockupPortfolio,    caption: 'Portfolio & Asesmen' },
  { component: MockupIEP,          caption: 'IEP Transparan' },
  { component: MockupCatatanGuru,  caption: 'Catatan untuk Guru' },
  { component: MockupSPP,          caption: 'Pembayaran SPP' },
];

type TabId = 'tentang' | 'kurikulum' | 'riset' | 'tim' | 'asesmen' | 'fitur' | 'dashboard';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'kurikulum', label: 'Kurikulum' },
  { id: 'riset', label: 'Hasil Riset' },
  { id: 'tim', label: 'Tim' },
  { id: 'asesmen', label: 'Asesmen' },
  { id: 'fitur', label: 'Fitur Dashboard' },
  { id: 'dashboard', label: 'Intip Dashboard' },
];

function SectionHeading({ children, intro }: { children: React.ReactNode; intro?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-[720px] text-center">
      <h2 className="font-baloo text-[26px] font-extrabold leading-[1.15] text-stv-navy sm:text-[32px]">{children}</h2>
      {intro && <p className="mt-3 text-[16px] leading-[1.6] text-stv-body sm:text-[17px]">{intro}</p>}
    </div>
  );
}

// Same badge-color rotation used for the "Mengapa Memilih Studiva" cards on the
// home page (yellow/sky/coral/navy), with green added since this page also
// uses it for the Prinsip cards - keeps every icon badge on-brand while still
// giving each card its own color instead of one flat sky tint everywhere.
const BADGE_PALETTE = [
  { bg: 'bg-stv-yellow-tint', color: 'text-stv-yellow-deep' },
  { bg: 'bg-stv-sky-tint', color: 'text-stv-sky-stroke' },
  { bg: 'bg-stv-coral-tint', color: 'text-stv-coral' },
  { bg: 'bg-stv-green-tint', color: 'text-stv-green' },
  { bg: 'bg-stv-badge-navy-tint', color: 'text-stv-navy' },
];

function IconCardGrid({ items, columns = 'sm:grid-cols-2 lg:grid-cols-5' }: { items: IconCard[]; columns?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${columns}`}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const badge = BADGE_PALETTE[i % BADGE_PALETTE.length];
        return (
          <Reveal key={item.title}>
            <div className="hover-lift h-full rounded-2xl border-[1.5px] border-stv-border bg-white p-6 shadow-[0_10px_30px_rgba(16,58,107,.05)]">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${badge.bg} ${badge.color}`}>
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mb-1.5 font-baloo text-[18px] font-bold text-stv-navy">{item.title}</h3>
              <p className="text-[15px] leading-[1.5] text-stv-body">{item.description}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}


function TentangPanel() {
  return (
    <Reveal>
      {/* 4a. Apa itu Sekolah Studiva? */}
      <section className="bg-white px-4 pb-16 pt-12 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-7 font-baloo text-[28px] font-extrabold leading-[1.1] text-stv-navy sm:text-[36px] md:text-[46px]">
            Apa itu Sekolah Studiva?
          </h2>
          <p className="mb-8 text-[16px] leading-[1.85] text-stv-body sm:text-[18px]">
            Sekolah Studiva adalah sekolah khusus bagi anak berkebutuhan khusus. Setiap anak, apa pun jenis atau
            tingkat hambatannya, memiliki ruang untuk tumbuh dan berkembang secara utuh dalam lingkungan yang aman,
            suportif, dan penuh makna. Pembelajaran tidak menuntut anak menyesuaikan diri dengan satu standar;
            sebaliknya, kurikulum yang menyesuaikan diri dengan setiap anak.
          </p>

          {/* Quote block */}
          <div className="relative mb-12 rounded-2xl bg-[#EDF4FB] px-6 py-8 sm:mb-16 sm:px-11 sm:py-9">
            <Sparkles className="absolute right-[18px] top-[14px] h-5 w-5 text-stv-yellow opacity-65" fill="currentColor" strokeWidth={0} />
            <span className="absolute bottom-4 left-5 h-[9px] w-[9px] rounded-full bg-stv-coral opacity-50" />
            <p className="text-[16px] italic leading-[1.85] text-stv-quote sm:text-[18px]">
              Inklusif di Studiva berarti tidak ada anak yang ditolak karena kondisinya. Semua jenis kebutuhan khusus
             , dari ASD, ADHD, Down Syndrome, hingga hambatan belajar dan sensorik, diterima dan didampingi sesuai
              kebutuhan masing-masing.
            </p>
          </div>

          <h3 className="font-baloo text-[24px] font-extrabold text-stv-navy sm:text-[32px]">Prinsip utama kami</h3>
        </div>
      </section>

      {/* 4b. Prinsip cards */}
      <section className="bg-white px-4 pb-16 pt-2 sm:px-8 sm:pb-[88px]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="hover-lift rounded-[20px] border-[1.5px] border-stv-border bg-white p-[22px] shadow-[0_8px_24px_rgba(16,58,107,.05)] sm:p-7"
              >
                <div className={`mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${item.badgeBg} ${item.badgeColor}`}>
                  <Icon className="h-[26px] w-[26px]" strokeWidth={2} />
                </div>
                <h4 className="mb-3 font-baloo text-[19px] font-bold leading-[1.3] text-stv-navy">{item.title}</h4>
                <p className="text-[14px] leading-[1.7] text-stv-body">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4c. Cara Mendaftar, pendaftaran offline lewat admin */}
      <section className="bg-[#EDF4FB] px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-baloo text-[28px] font-extrabold leading-[1.1] text-stv-navy sm:text-[36px]">
              Cara Mendaftar ke Sekolah Studiva
            </h2>
            <p className="text-[16px] leading-[1.7] text-stv-body sm:text-[17px]">
              Pendaftaran dilakukan secara offline melalui tim Studiva. Kami akan memandu Anda dari awal hingga anak
              siap memulai hari pertamanya di sekolah.
            </p>
          </div>

          {/* 3 steps */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Hubungi Tim Studiva',
                desc: 'Kirim pesan via WhatsApp atau kunjungi kantor kami. Tim akan menjadwalkan sesi perkenalan untuk memahami kebutuhan anak Anda.',
                bg: 'bg-stv-sky-stroke',
              },
              {
                step: '2',
                title: 'Sesi Asesmen & Orientasi',
                desc: 'Anak akan menjalani asesmen awal ringan bersama tim psikolog dan guru kami, untuk menyusun rencana belajar yang tepat.',
                bg: 'bg-stv-coral',
              },
              {
                step: '3',
                title: 'Mulai Belajar',
                desc: 'Setelah administrasi selesai, akun orang tua akan dibuat oleh admin. Anda bisa langsung memantau perkembangan anak dari dashboard.',
                bg: 'bg-stv-green',
              },
            ].map(({ step, title, desc, bg }) => (
              <div key={step} className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(16,58,107,.07)]">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bg} font-baloo text-[22px] font-extrabold text-white`}>
                  {step}
                </div>
                <h3 className="mb-2 font-baloo text-[18px] font-bold text-stv-navy">{title}</h3>
                <p className="text-[14px] leading-[1.7] text-stv-body">{desc}</p>
              </div>
            ))}
          </div>

          {/* Contact options */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="https://wa.me/6281211470407?text=Halo%20Studiva%2C%20saya%20ingin%20mendaftarkan%20anak%20saya%20ke%20Sekolah%20Studiva"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border-2 border-stv-sky-stroke bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.10)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stv-sky-tint text-stv-sky-stroke">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="font-baloo text-[16px] font-bold text-stv-navy">Chat via WhatsApp</p>
                <p className="text-[13px] text-stv-muted">0812-1147-0407 · Senin–Jumat, 08.00–16.00</p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-2xl border-2 border-stv-border bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stv-sky-tint text-stv-sky-stroke">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-baloo text-[16px] font-bold text-stv-navy">Kunjungi Kantor Kami</p>
                <p className="text-[13px] text-stv-muted">Jl. Mandiangin No. 65, Bukittinggi, Sumatera Barat</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function KurikulumPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <SectionHeading intro="Pendekatan pembelajaran adaptif Studiva memadukan praktik yang sudah terbukti membantu beragam profil belajar.">
        Kurikulum yang menyesuaikan diri dengan anak
      </SectionHeading>
      <IconCardGrid items={curriculum} />
    </div>
  );
}

function RisetPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <SectionHeading intro="Metode yang kami pakai bukan sekadar pilihan nilai, tetapi sejalan dengan bukti riset tentang apa yang benar-benar membantu anak berkebutuhan khusus berkembang.">
        Mengapa pendekatan Studiva efektif, menurut penelitian
      </SectionHeading>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {researchCards.map((card) => (
          <Reveal key={card.title}>
            <div className="h-full rounded-2xl bg-stv-sky-tint p-7 shadow-[0_10px_30px_rgba(16,58,107,.06)]">
              <h3 className="mb-3 font-baloo text-[19px] font-bold leading-[1.3] text-stv-navy">{card.title}</h3>
              <p className="text-[15px] leading-[1.6] text-stv-quote">{card.body}</p>
              <a
                href={card.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-start gap-1.5 text-[13px] font-semibold text-stv-sky-stroke no-underline hover:underline"
              >
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Sumber: {card.sourceLabel}</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-[760px] text-center">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-stv-muted">Referensi tambahan</p>
        <div className="flex flex-col items-center gap-1.5">
          {additionalReferences.map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-stv-muted no-underline hover:text-stv-sky-stroke hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {ref.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimPanel() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <SectionHeading>Didampingi tim, bukan satu guru</SectionHeading>
      <IconCardGrid items={team} columns="sm:grid-cols-3" />
      <p className="mt-8 text-center text-[15px] font-semibold italic text-stv-navy">Dipimpin oleh Psikolog Fitri Effendy.</p>
    </div>
  );
}

function AsesmenPanel() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <SectionHeading>Perkembangan anak yang terukur dan transparan</SectionHeading>
      <IconCardGrid items={assessmentPoints} columns="sm:grid-cols-2 lg:grid-cols-4" />
    </div>
  );
}

function FiturPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <SectionHeading intro="Selain pembelajaran di kelas, orang tua mendapat akses dashboard digital yang transparan dan lengkap.">
        Fitur Dashboard Orang Tua
      </SectionHeading>
      <IconCardGrid items={benefits} columns="sm:grid-cols-2 lg:grid-cols-4" />
    </div>
  );
}

function IntipDashboardPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-10 text-center">
        <h2 className="font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[36px]">Intip Dashboard</h2>
        <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-stv-body">
          Intip tampilan setiap fitur dashboard yang akan Anda gunakan sebagai orang tua di Sekolah Studiva.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_MOCKUPS.map(({ component: Mockup, caption }) => (
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

export default function SekolahStudivaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tentang');

  return (
    <div className="bg-white font-nunito-sans text-stv-body">
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden px-4 py-16 text-center sm:px-8 sm:py-20 md:py-[100px]"
        style={{ background: 'linear-gradient(160deg, #EBF6FD 0%, #C8E8F8 55%, #DDF1FB 100%)' }}
      >
        <Reveal className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-90px] top-[-70px] h-[220px] w-[220px] animate-stv-float rounded-full bg-stv-sky/[.22] blur-[12px] sm:h-[340px] sm:w-[340px]" />
          <div className="absolute bottom-[-50px] right-[-70px] h-[170px] w-[170px] animate-stv-float-slow rounded-full bg-stv-sky/[.18] blur-[10px] sm:h-[260px] sm:w-[260px]" />
          <Sparkles className="absolute right-[10%] top-[60px] h-5 w-5 text-stv-yellow/50" fill="currentColor" strokeWidth={0} />
          <span className="absolute bottom-20 left-[12%] h-[10px] w-[10px] rounded-full bg-stv-yellow/[.55]" />
          <span className="absolute right-[5%] top-[38%] h-[13px] w-[13px] rounded-full bg-stv-coral/45" />
        </Reveal>

        <div className="relative mx-auto max-w-[740px]">
          <Reveal>
            <span className="inline-flex items-center gap-[10px] rounded-full bg-white px-[26px] py-[10px] text-[13px] font-extrabold uppercase tracking-[2.5px] text-stv-navy shadow-[0_4px_18px_rgba(16,58,107,.1)]">
              <span className="h-2 w-2 rounded-full bg-stv-yellow" />
              Sekolah Fisik
            </span>
            <h1 className="mb-7 mt-6 font-baloo text-[40px] font-extrabold leading-[1.06] text-stv-navy sm:text-[56px] md:text-[76px]">
              Sekolah Studiva
            </h1>
            <p className="mb-5 text-[17px] italic leading-[1.72] text-stv-quote sm:text-[21px]">
              Sekolah khusus inklusif tempat setiap anak berkebutuhan khusus tumbuh, belajar, dan berkembang sesuai
              potensinya, dengan pendampingan yang dirancang khusus untuk kebutuhannya.
            </p>
            <p className="mb-9 text-[15px] leading-[1.6] text-stv-muted sm:text-[16px]">
              Untuk anak berkebutuhan khusus usia 5–10 tahun · ASD, ADHD, Down Syndrome, hambatan belajar & sensorik,
              dll.
            </p>
            <a
              href="https://wa.me/6281211470407?text=Halo%20Studiva%2C%20saya%20ingin%20mendaftarkan%20anak%20saya%20ke%20Sekolah%20Studiva"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-stv-yellow px-9 py-[18px] font-baloo text-[17px] font-bold text-stv-navy no-underline shadow-[0_10px_28px_rgba(251,208,10,.45)] transition hover:-translate-y-[3px] hover:bg-stv-yellow-hover sm:px-12 sm:text-[19px]"
            >
              Hubungi Kami via WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ TAB BAR ============ */}
      <div className="sticky top-[82px] z-40 border-b border-stv-border bg-white">
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
                    ? 'border-stv-sky-stroke font-bold text-stv-sky-stroke'
                    : 'border-transparent font-semibold text-stv-body hover:text-stv-sky-stroke'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ TAB CONTENT ============ */}
      {activeTab === 'tentang' ? (
        <TentangPanel />
      ) : (
        <section className="relative overflow-hidden px-4 py-14 sm:px-8 sm:py-16">
          {/* Playful section accents */}
          <span className="pointer-events-none absolute left-[3%] top-[8%] h-[10px] w-[10px] rounded-full bg-stv-yellow opacity-60" />
          <span className="pointer-events-none absolute right-[4%] top-[15%] h-[7px] w-[7px] rounded-full bg-stv-coral opacity-50" />
          <span className="pointer-events-none absolute bottom-[12%] left-[6%] h-[8px] w-[8px] rounded-full bg-stv-green opacity-50" />
          <span className="pointer-events-none absolute bottom-[8%] right-[3%] h-[10px] w-[10px] rounded-full bg-stv-sky-stroke opacity-40" />
          <Sparkles className="pointer-events-none absolute right-[8%] top-[6%] h-[14px] w-[14px] text-stv-yellow opacity-50" fill="currentColor" strokeWidth={0} />
          <Sparkles className="pointer-events-none absolute bottom-[18%] left-[9%] h-[11px] w-[11px] text-stv-sky-stroke opacity-40" fill="currentColor" strokeWidth={0} />
          <Reveal key={activeTab}>
            {activeTab === 'kurikulum' && <KurikulumPanel />}
            {activeTab === 'riset' && <RisetPanel />}
            {activeTab === 'tim' && <TimPanel />}
            {activeTab === 'asesmen' && <AsesmenPanel />}
            {activeTab === 'fitur' && <FiturPanel />}
            {activeTab === 'dashboard' && <IntipDashboardPanel />}
          </Reveal>
        </section>
      )}

      {/* ============ CTA PENUTUP ============ */}
      <section className="relative overflow-hidden bg-stv-sky px-4 py-20 text-center sm:px-8 md:py-[104px]">
        <Reveal className="pointer-events-none absolute inset-0">
          <div className="absolute left-[7%] top-6 h-[110px] w-[110px] animate-stv-float rounded-full bg-white/10 sm:h-[160px] sm:w-[160px]" />
          <div className="absolute bottom-7 right-[9%] h-[90px] w-[90px] animate-stv-float-slow rounded-[28px] bg-white/[.08] sm:h-[130px] sm:w-[130px]" />
          <Sparkles className="absolute right-[18%] top-[50px] h-[22px] w-[22px] text-white/40" fill="currentColor" strokeWidth={0} />
          <span className="absolute bottom-[70px] left-[15%] h-3 w-3 rounded-full bg-white/35" />
        </Reveal>
        <Reveal className="relative">
          <div className="mx-auto max-w-[720px]">
            <h2 className="mb-[22px] font-baloo text-[32px] font-extrabold leading-[1.12] text-white sm:text-[42px] md:text-[54px]">
              Siap memberi anak Anda ruang untuk bertumbuh?
            </h2>
            <p className="mb-10 text-[16px] leading-[1.7] text-white/90 sm:text-[18px]">
              Bergabunglah dengan Sekolah Studiva dan jadi bagian dari komunitas belajar yang inklusif.
            </p>
            <a
              href="https://wa.me/6281211470407?text=Halo%20Studiva%2C%20saya%20ingin%20mendaftarkan%20anak%20saya%20ke%20Sekolah%20Studiva"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-2xl bg-stv-yellow px-12 py-[18px] font-baloo text-[19px] font-bold text-stv-navy no-underline shadow-[0_10px_28px_rgba(251,208,10,.4)] transition hover:-translate-y-[3px] hover:bg-stv-yellow-hover"
            >
              Hubungi Kami via WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
