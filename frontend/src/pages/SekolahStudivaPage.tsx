import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart,
  UserCog,
  Sparkles,
  GitBranch,
  HeartHandshake,
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

const principles: IconCard[] = [
  {
    icon: HandHeart,
    title: 'Inklusif & non-diskriminatif',
    description: 'Menerima setiap anak berkebutuhan khusus apa pun jenis atau tingkat hambatannya, tanpa diskriminasi.',
  },
  {
    icon: UserCog,
    title: 'Personalisasi berbasis asesmen',
    description: 'Setiap rencana belajar disusun dari asesmen perkembangan masing-masing anak.',
  },
  {
    icon: Sparkles,
    title: 'Multisensori & berbasis pengalaman',
    description: 'Belajar lewat gambar, benda konkret, lagu, dan gerakan, bukan hanya hafalan.',
  },
  {
    icon: GitBranch,
    title: 'Fleksibel pada kecepatan anak',
    description: 'Materi dan ritme disesuaikan dengan kemampuan unik tiap anak.',
  },
  {
    icon: HeartHandshake,
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

function IconCardGrid({ items, columns = 'sm:grid-cols-2 lg:grid-cols-5' }: { items: IconCard[]; columns?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${columns}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Reveal key={item.title}>
            <div className="hover-lift h-full rounded-2xl border-[1.5px] border-stv-border bg-white p-6 shadow-[0_10px_30px_rgba(16,58,107,.05)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stv-sky-tint text-stv-sky-stroke">
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
    <div className="mx-auto max-w-[1100px]">
      <SectionHeading>Apa itu Sekolah Studiva?</SectionHeading>

      <Reveal>
        <p className="mx-auto max-w-[760px] text-center text-[16px] leading-[1.7] text-stv-body sm:text-[17px]">
          Sekolah Studiva adalah sekolah khusus bagi anak berkebutuhan khusus. Setiap anak — apa pun jenis atau
          tingkat hambatannya — memiliki ruang untuk tumbuh dan berkembang secara utuh dalam lingkungan yang aman,
          suportif, dan penuh makna. Pembelajaran tidak menuntut anak menyesuaikan diri dengan satu standar;
          sebaliknya, kurikulum yang menyesuaikan diri dengan setiap anak.
        </p>
      </Reveal>

      <Reveal>
        <div className="mx-auto mt-8 max-w-[760px] rounded-2xl border-[1.5px] border-stv-sky-tint bg-stv-sky-tint/50 p-6">
          <p className="text-center text-[15px] italic leading-[1.6] text-stv-quote sm:text-[16px]">
            Inklusif di Studiva berarti tidak ada anak yang ditolak karena kondisinya. Semua jenis kebutuhan khusus —
            dari ASD, ADHD, Down Syndrome, hingga hambatan belajar dan sensorik — diterima dan didampingi sesuai
            kebutuhan masing-masing.
          </p>
        </div>
      </Reveal>

      <h3 className="mb-6 mt-12 text-center font-baloo text-[20px] font-bold text-stv-navy">Prinsip utama kami</h3>
      <IconCardGrid items={principles} />
    </div>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-stv-sky-tint to-white px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[820px] text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-[18px] py-[9px] text-[13px] font-extrabold uppercase tracking-[2px] text-stv-navy shadow-sm">
              <span className="h-[7px] w-[7px] rounded-full bg-stv-sky-stroke" />
              Tier 1 · Sekolah Fisik
            </span>
            <h1 className="mt-6 font-baloo text-[36px] font-extrabold leading-[1.1] text-stv-navy sm:text-[48px]">
              Sekolah Studiva
            </h1>
            <p className="mx-auto mt-5 max-w-[620px] text-[17px] italic leading-[1.6] text-stv-quote sm:text-[19px]">
              Sekolah khusus inklusif tempat setiap anak berkebutuhan khusus tumbuh, belajar, dan berkembang sesuai
              potensinya — dengan pendampingan yang dirancang khusus untuk kebutuhannya.
            </p>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] font-semibold text-stv-muted sm:text-[15px]">
              Untuk anak berkebutuhan khusus usia 5–10 tahun · ASD, ADHD, Down Syndrome, hambatan belajar & sensorik,
              dll.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/signup"
                state={{ presetTier: 'tier1' }}
                className="rounded-full bg-stv-sky px-8 py-[14px] font-baloo text-[16px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(95,176,221,.4)] transition hover:-translate-y-0.5 hover:bg-stv-sky-stroke"
              >
                Daftar sekarang
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TAB BAR ============ */}
      <div className="sticky top-[82px] z-40 border-b border-stv-border bg-white/95 backdrop-blur-sm">
        <div
          className="mx-auto flex max-w-[1100px] justify-center gap-1 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden sm:px-8"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-4 text-[15px] font-semibold transition ${
                  isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-500 hover:text-sky-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ TAB CONTENT ============ */}
      <section className="px-4 py-14 sm:px-8 sm:py-16">
        <Reveal key={activeTab}>
          {activeTab === 'tentang' && <TentangPanel />}
          {activeTab === 'kurikulum' && <KurikulumPanel />}
          {activeTab === 'riset' && <RisetPanel />}
          {activeTab === 'tim' && <TimPanel />}
          {activeTab === 'asesmen' && <AsesmenPanel />}
          {activeTab === 'fitur' && <FiturPanel onOpenGallery={setLightboxIndex} />}
        </Reveal>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* ============ CTA PENUTUP ============ */}
      <section className="bg-stv-sky px-4 py-16 text-center sm:px-8 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-[700px]">
            <h2 className="font-baloo text-[28px] font-extrabold leading-[1.15] text-white sm:text-[36px]">
              Siap memberi anak Anda ruang untuk bertumbuh?
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-[1.6] text-white/90 sm:text-[17px]">
              Bergabunglah dengan Sekolah Studiva dan jadi bagian dari komunitas belajar yang inklusif.
            </p>
            <Link
              to="/signup"
              state={{ presetTier: 'tier1' }}
              className="mt-8 inline-block rounded-full bg-white px-10 py-4 font-baloo text-[18px] font-bold text-stv-navy no-underline shadow-[0_14px_30px_rgba(16,58,107,.25)] transition hover:-translate-y-0.5 hover:bg-stv-sky-tint"
            >
              Daftar sekarang
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
