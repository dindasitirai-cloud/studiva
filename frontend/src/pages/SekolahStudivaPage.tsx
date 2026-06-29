import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  FileBarChart,
  Target,
  MessagesSquare,
  CreditCard,
  FolderHeart,
  LucideIcon,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import Lightbox from '../components/Lightbox';

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
    title: 'IEP — Individualized Education Plan',
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
      'Tinjauan sistematis menemukan pengajaran terstruktur dan dipersonalisasi dikaitkan dengan kemajuan nyata pada perilaku adaptif, keterampilan hidup sehari-hari, dan bahasa — fondasi dari setiap IEP yang kami susun.',
    sourceLabel:
      'Effectiveness and experiences of early intensive behavioral and naturalistic developmental behavior interventions for ASD: a mixed-methods systematic review and meta-analysis',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12849440/',
  },
  {
    title: 'Keterlibatan orang tua mengubah hasil',
    body:
      'Riset konsisten menunjukkan keterlibatan orang tua meningkatkan capaian belajar, manajemen perilaku, dan kualitas hubungan orang tua–anak — terutama pada intervensi usia dini. Karena itu orang tua adalah bagian dari tim, bukan penonton.',
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
    title: 'Dashboard orang tua',
    description: 'Pantau kehadiran, sesi terapi, dan progres belajar anak secara real-time.',
  },
  {
    icon: FileBarChart,
    title: 'Laporan perkembangan digital',
    description: 'Portofolio & laporan berkala bisa diakses kapan saja, di mana saja.',
  },
  {
    icon: Target,
    title: 'Transparansi IEP',
    description: 'Lihat rencana belajar individual anak dan target yang sedang dikerjakan.',
  },
  {
    icon: MessagesSquare,
    title: 'Komunikasi langsung',
    description: 'Terhubung dengan guru, GPK, dan terapis dalam satu tempat.',
  },
  {
    icon: CreditCard,
    title: 'Pendaftaran & pembayaran mudah',
    description: 'Proses pendaftaran dan pembayaran aman dalam hitungan menit.',
  },
  {
    icon: FolderHeart,
    title: 'Satu profil, semua riwayat',
    description: 'Semua dokumentasi dan riwayat belajar anak tersimpan rapi di satu profil.',
  },
];

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

const galleryImages: GalleryImage[] = [
  { src: '/images/dashboard/dashboard-overview.png', alt: 'Tampilan ringkasan perkembangan anak', caption: 'Ringkasan perkembangan anak' },
  { src: '/images/dashboard/dashboard-attendance.png', alt: 'Tampilan ringkasan kehadiran anak', caption: 'Kehadiran & jadwal' },
  { src: '/images/dashboard/dashboard-therapy.png', alt: 'Tampilan catatan sesi terapi', caption: 'Catatan sesi terapi' },
  { src: '/images/dashboard/dashboard-progress.png', alt: 'Tampilan grafik progres belajar', caption: 'Grafik progres belajar' },
  { src: '/images/dashboard/dashboard-iep.png', alt: 'Tampilan target IEP anak', caption: 'Target IEP anak' },
  { src: '/images/dashboard/dashboard-reports.png', alt: 'Tampilan laporan berkala digital', caption: 'Laporan berkala digital' },
];

type TabId = 'tentang' | 'kurikulum' | 'riset' | 'tim' | 'asesmen' | 'fitur';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'kurikulum', label: 'Kurikulum' },
  { id: 'riset', label: 'Hasil Riset' },
  { id: 'tim', label: 'Tim' },
  { id: 'asesmen', label: 'Asesmen' },
  { id: 'fitur', label: 'Fitur Sekolah Studiva' },
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

function DashboardGalleryItem({ image, onOpen }: { image: GalleryImage; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);

  return (
    <button type="button" onClick={onOpen} disabled={failed} className="group w-full text-left disabled:cursor-default">
      <div className="overflow-hidden rounded-xl border border-stv-sky-tint bg-stv-sky-tint/40 shadow-[0_10px_30px_rgba(16,58,107,.08)]">
        {failed ? (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-stv-sky-tint/60 text-stv-muted">
            <LayoutDashboard className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-[13px] font-semibold">Pratinjau segera hadir</span>
          </div>
        ) : (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="mt-2 text-center text-[14px] font-semibold text-stv-navy">{image.caption}</p>
    </button>
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
            Sekolah Studiva adalah sekolah khusus bagi anak berkebutuhan khusus. Setiap anak — apa pun jenis atau
            tingkat hambatannya — memiliki ruang untuk tumbuh dan berkembang secara utuh dalam lingkungan yang aman,
            suportif, dan penuh makna. Pembelajaran tidak menuntut anak menyesuaikan diri dengan satu standar;
            sebaliknya, kurikulum yang menyesuaikan diri dengan setiap anak.
          </p>

          {/* Quote block */}
          <div className="relative mb-12 rounded-2xl bg-[#EDF4FB] px-6 py-8 sm:mb-16 sm:px-11 sm:py-9">
            <Sparkles className="absolute right-[18px] top-[14px] h-5 w-5 text-stv-yellow opacity-65" fill="currentColor" strokeWidth={0} />
            <span className="absolute bottom-4 left-5 h-[9px] w-[9px] rounded-full bg-stv-coral opacity-50" />
            <p className="text-[16px] italic leading-[1.85] text-stv-quote sm:text-[18px]">
              Inklusif di Studiva berarti tidak ada anak yang ditolak karena kondisinya. Semua jenis kebutuhan khusus
              — dari ASD, ADHD, Down Syndrome, hingga hambatan belajar dan sensorik — diterima dan didampingi sesuai
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
        Mengapa pendekatan Studiva efektif — menurut penelitian
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

function FiturPanel({ onOpenGallery }: { onOpenGallery: (index: number) => void }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <SectionHeading intro="Mendaftar lewat platform Studiva memberi Anda lebih dari sekadar kursi di kelas.">
        Fitur Sekolah Studiva
      </SectionHeading>
      <IconCardGrid items={benefits} columns="sm:grid-cols-2 lg:grid-cols-3" />

      <div className="mt-16">
        <h3 className="text-center font-baloo text-[20px] font-bold text-stv-navy sm:text-[22px]">
          Intip dashboard yang akan Anda gunakan
        </h3>
        <p className="mx-auto mt-2 max-w-[560px] text-center text-[15px] text-stv-body">
          Pantau perkembangan anak Anda dalam satu tampilan yang jelas dan ramah.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, i) => (
            <Reveal key={image.src}>
              <DashboardGalleryItem image={image} onOpen={() => onOpenGallery(i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SekolahStudivaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tentang');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
              Tier 1 · Sekolah Fisik
            </span>
            <h1 className="mb-7 mt-6 font-baloo text-[40px] font-extrabold leading-[1.06] text-stv-navy sm:text-[56px] md:text-[76px]">
              Sekolah Studiva
            </h1>
            <p className="mb-5 text-[17px] italic leading-[1.72] text-stv-quote sm:text-[21px]">
              Sekolah khusus inklusif tempat setiap anak berkebutuhan khusus tumbuh, belajar, dan berkembang sesuai
              potensinya — dengan pendampingan yang dirancang khusus untuk kebutuhannya.
            </p>
            <p className="mb-9 text-[15px] leading-[1.6] text-stv-muted sm:text-[16px]">
              Untuk anak berkebutuhan khusus usia 5–10 tahun · ASD, ADHD, Down Syndrome, hambatan belajar & sensorik,
              dll.
            </p>
            <Link
              to="/signup"
              state={{ presetTier: 'tier1' }}
              className="inline-flex items-center rounded-full bg-stv-yellow px-9 py-[18px] font-baloo text-[17px] font-bold text-stv-navy no-underline shadow-[0_10px_28px_rgba(251,208,10,.45)] transition hover:-translate-y-[3px] hover:bg-stv-yellow-hover sm:px-12 sm:text-[19px]"
            >
              Daftar sekarang
            </Link>
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
        <section className="px-4 py-14 sm:px-8 sm:py-16">
          <Reveal key={activeTab}>
            {activeTab === 'kurikulum' && <KurikulumPanel />}
            {activeTab === 'riset' && <RisetPanel />}
            {activeTab === 'tim' && <TimPanel />}
            {activeTab === 'asesmen' && <AsesmenPanel />}
            {activeTab === 'fitur' && <FiturPanel onOpenGallery={setLightboxIndex} />}
          </Reveal>
        </section>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
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
            <Link
              to="/signup"
              state={{ presetTier: 'tier1' }}
              className="inline-block rounded-2xl bg-stv-yellow px-12 py-[18px] font-baloo text-[19px] font-bold text-stv-navy no-underline shadow-[0_10px_28px_rgba(251,208,10,.4)] transition hover:-translate-y-[3px] hover:bg-stv-yellow-hover"
            >
              Daftar sekarang
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
