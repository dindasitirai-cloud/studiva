import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Baby, Users, BookOpen, ArrowRight, CheckCircle,
  GraduationCap, Laptop, Sparkles,
} from 'lucide-react';
import Reveal from '../components/Reveal';

// ── Konstanta konten ────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: Heart,
    title: 'Inklusif Sungguh-sungguh',
    desc: 'Tidak ada anak yang ditolak karena kondisinya. Setiap profil kebutuhan khusus, ASD, ADHD, Down Syndrome, hambatan belajar, hambatan sensorik, diterima dan didampingi.',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-100',
  },
  {
    icon: Baby,
    title: 'Berpusat pada Anak',
    desc: 'Kurikulumlah yang menyesuaikan diri dengan anak, bukan sebaliknya. Setiap rencana belajar dirancang khusus untuk keunikan, kecepatan, dan gaya belajar masing-masing anak.',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
  },
  {
    icon: Users,
    title: 'Kolaboratif',
    desc: 'Orang tua, guru, dan psikolog bekerja sebagai satu tim. Kemajuan anak terbaik terjadi ketika apa yang dipelajari di sekolah diperkuat di rumah, dan sebaliknya.',
    bg: 'bg-sky-50',
    iconColor: 'text-stv-sky-stroke',
    iconBg: 'bg-stv-sky-tint',
  },
  {
    icon: BookOpen,
    title: 'Berbasis Ilmu',
    desc: 'Setiap metode yang kami gunakan berakar pada bukti riset, ABA, PECS, sensory integration, dan pendekatan terapi lain yang terbukti efektif untuk anak berkebutuhan khusus.',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
];

const TEAM_PLACEHOLDERS = [
  // TODO: tambahkan anggota tim lain di sini dengan struktur { name, role, desc, photo? }
];

// ── Komponen Nilai ──────────────────────────────────────────────────────────

function ValueCard({ icon: Icon, title, desc, bg, iconColor, iconBg }: typeof VALUES[0]) {
  return (
    <div className={`rounded-2xl ${bg} p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]`}>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />
      </div>
      <h3 className="mb-2 font-baloo text-[18px] font-bold text-stv-navy">{title}</h3>
      <p className="text-[14px] leading-[1.7] text-stv-body">{desc}</p>
    </div>
  );
}

// ── Halaman Utama ───────────────────────────────────────────────────────────

export default function TentangPage() {
  return (
    <div className="font-nunito-sans">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stv-navy via-[#1a3f6f] to-[#0d2a4d] px-4 py-24 text-center sm:px-8 sm:py-32">
        {/* dekorasi halus */}
        <div className="pointer-events-none absolute left-[8%] top-12 h-32 w-32 rounded-full bg-stv-yellow/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-12 right-[10%] h-24 w-24 rounded-full bg-stv-sky/20 blur-2xl" />
        <Sparkles className="absolute right-[18%] top-10 h-6 w-6 text-stv-yellow/40" fill="currentColor" strokeWidth={0} />
        <span className="absolute bottom-[60px] left-[14%] h-3 w-3 rounded-full bg-white/25" />

        <div className="relative mx-auto max-w-[720px]">
          <span className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white/80">
            Tentang Kami
          </span>
          <h1 className="mb-6 font-baloo text-[40px] font-extrabold leading-[1.08] text-white sm:text-[52px] md:text-[64px]">
            Mendampingi Setiap Anak<br className="hidden sm:block" />
            <span className="text-stv-yellow"> Tumbuh Sesuai Potensinya</span>
          </h1>
          <p className="text-[17px] leading-[1.7] text-white/80 sm:text-[19px]">
            Studiva lahir dari keyakinan sederhana: setiap anak berhak mendapatkan pendidikan
            yang memahami, menghargai, dan merayakan keunikannya, apa pun kondisi atau cara belajarnya.
          </p>
        </div>
      </section>

      {/* ── KISAH & MISI ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">

            <Reveal>
              <div>
                <span className="mb-4 inline-block rounded-full bg-stv-yellow-tint px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-stv-yellow-deep">
                  Kisah Kami
                </span>
                <h2 className="mb-6 font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                  Dari Satu Keluarga,<br />untuk Banyak Keluarga
                </h2>
                <div className="space-y-4 text-[16px] leading-[1.8] text-stv-body">
                  <p>
                    Studiva didirikan oleh <strong className="text-stv-navy">Psikolog Fitri Effendy, S.Psi</strong> di
                    Bukittinggi, Sumatera Barat. Perjalanan ini berawal dari pengalaman pribadinya mendampingi anak-anak
                    dengan kebutuhan belajar yang berbeda, dan menyaksikan langsung betapa banyak orang tua merasa
                    sendirian, bingung, dan kelelahan dalam perjalanan tersebut.
                  </p>
                  <p>
                    Ia menyadari bahwa hambatan terbesar bukan hanya kurangnya ahli, melainkan juga kurangnya
                    <em> jembatan</em> antara sekolah dan rumah. Orang tua yang berdaya, yang memahami kebutuhan anak
                    dan tahu cara mendampinginya, adalah fondasi terkuat dari tumbuh-kembang anak yang optimal.
                  </p>
                  <p>
                    Dari situ lahirlah Studiva: sebuah sekolah yang merayakan keberagaman cara belajar, sekaligus
                    platform digital yang menjangkau orang tua di seluruh Indonesia, agar tak ada satu pun keluarga
                    yang harus menghadapi perjalanan ini sendirian.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={100}>
              <div className="space-y-5">
                <div className="rounded-2xl bg-stv-sky-tint p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <h3 className="mb-3 font-baloo text-[18px] font-bold text-stv-navy">Visi Kami</h3>
                  <p className="text-[15px] leading-[1.7] text-stv-body">
                    Menjadi pusat pendidikan inklusif terkemuka di Indonesia yang memberdayakan setiap
                    anak berkebutuhan khusus untuk tumbuh, belajar, dan berkontribusi sesuai potensi
                    uniknya, dengan dukungan keluarga yang kuat dan sistem pendidikan yang adaptif.
                  </p>
                </div>
                <div className="rounded-2xl bg-stv-yellow-tint p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <h3 className="mb-3 font-baloo text-[18px] font-bold text-stv-navy">Misi Kami</h3>
                  <ul className="space-y-2">
                    {[
                      'Menyediakan lingkungan belajar inklusif yang aman, hangat, dan berpusat pada anak',
                      'Merancang program pembelajaran yang disesuaikan dengan keunikan setiap anak',
                      'Membangun kolaborasi erat antara orang tua, guru, dan psikolog',
                      'Memberdayakan orang tua dengan pengetahuan dan dukungan komunitas yang nyata',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-stv-body">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-stv-yellow-deep" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── NILAI-NILAI KAMI ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-8 sm:py-24">
        <span className="pointer-events-none absolute left-[2%] top-[10%] h-[12px] w-[12px] rounded-full bg-rose-400 opacity-40" />
        <span className="pointer-events-none absolute right-[3%] top-[20%] h-[8px] w-[8px] rounded-full bg-amber-400 opacity-50" />
        <span className="pointer-events-none absolute bottom-[15%] left-[5%] h-[9px] w-[9px] rounded-full bg-emerald-400 opacity-40" />
        <span className="pointer-events-none absolute bottom-[10%] right-[5%] h-[11px] w-[11px] rounded-full bg-stv-sky-stroke opacity-35" />
        <Sparkles className="pointer-events-none absolute right-[9%] top-[8%] h-[16px] w-[16px] text-amber-400 opacity-45" fill="currentColor" strokeWidth={0} />
        <Sparkles className="pointer-events-none absolute bottom-[22%] left-[8%] h-[12px] w-[12px] text-stv-sky-stroke opacity-40" fill="currentColor" strokeWidth={0} />
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-stv-yellow-tint px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-stv-yellow-deep">
                Nilai-Nilai Kami
              </span>
              <h2 className="font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                Prinsip yang Memandu Setiap Langkah Kami
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delayMs={i * 80}>
                <ValueCard {...v} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── APA YANG KAMI TAWARKAN ────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-stv-badge-navy-tint px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-stv-navy">
                Layanan Kami
              </span>
              <h2 className="font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                Dua Cara untuk Mendampingi Anak Anda
              </h2>
              <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-[1.7] text-stv-body">
                Studiva hadir dalam dua bentuk yang saling melengkapi, sekolah fisik di Bukittinggi
                dan platform digital yang bisa diakses dari seluruh Indonesia.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Tier 1 */}
            <Reveal>
              <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-stv-sky-tint bg-white shadow-[0_8px_24px_rgba(16,58,107,.08)] transition hover:-translate-y-1 hover:border-stv-sky-stroke hover:shadow-[0_16px_40px_rgba(16,58,107,.14)]">
                <div className="bg-gradient-to-br from-stv-sky-tint to-blue-100 px-6 py-7">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stv-sky-stroke shadow-[0_4px_12px_rgba(46,139,201,.3)]">
                    <GraduationCap className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="mb-1 block text-[12px] font-bold uppercase tracking-wider text-stv-sky-stroke">
                    Sekolah Fisik
                  </span>
                  <h3 className="font-baloo text-[24px] font-extrabold text-stv-navy">Sekolah Studiva</h3>
                  <p className="mt-1 text-[13px] text-stv-muted">Bukittinggi, Sumatera Barat</p>
                </div>
                <div className="flex flex-1 flex-col gap-5 p-6">
                  <p className="text-[15px] leading-[1.7] text-stv-body">
                    Sekolah khusus inklusif untuk anak berkebutuhan khusus usia 5–10 tahun. Setiap anak
                    mendapat rencana belajar personal, terapi profesional (speech, OT, behavioral), dan
                    pendampingan intensif dari guru bersertifikat.
                  </p>
                  <ul className="space-y-2">
                    {['Kurikulum adaptif & personalized', 'Terapi speech, OT, behavioral', 'Dashboard orang tua real-time', 'Komunikasi harian guru–orang tua'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-[14px] text-stv-body">
                        <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="mb-3 rounded-xl bg-stv-sky-tint px-4 py-2.5 text-[13px] font-semibold text-stv-sky-stroke">
                      Pendaftaran dilakukan langsung via WhatsApp atau kunjungan ke sekolah.
                    </p>
                    <Link
                      to="/sekolah-studiva"
                      className="inline-flex items-center gap-1.5 font-baloo text-[15px] font-bold text-stv-sky-stroke no-underline transition hover:underline"
                    >
                      Pelajari lebih lanjut <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Tier 2 */}
            <Reveal delayMs={80}>
              <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-amber-100 bg-white shadow-[0_8px_24px_rgba(16,58,107,.08)] transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_16px_40px_rgba(217,119,6,.14)]">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 px-6 py-7">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-[0_4px_12px_rgba(251,146,60,.35)]">
                    <Laptop className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="mb-1 block text-[12px] font-bold uppercase tracking-wider text-amber-600">
                    Tier 2 · Platform Digital
                  </span>
                  <h3 className="font-baloo text-[24px] font-extrabold text-stv-navy">Studiva Digital</h3>
                  <p className="mt-1 text-[13px] text-stv-muted">Tersedia di seluruh Indonesia</p>
                </div>
                <div className="flex flex-1 flex-col gap-5 p-6">
                  <p className="text-[15px] leading-[1.7] text-stv-body">
                    Platform langganan untuk orang tua di seluruh Indonesia. Akses ribuan panduan
                    parenting berbasis riset, webinar langsung bersama psikolog, komunitas saling
                    dukung, dan konsultasi 1-on-1.
                  </p>
                  <ul className="space-y-2">
                    {['Resource library & panduan praktis', 'Webinar live + video rekaman', 'Konsultasi 1-on-1 dengan psikolog', 'Komunitas forum orang tua'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-[14px] text-stv-body">
                        <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-700">
                      Daftar mandiri secara online dan mulai akses langsung.
                    </p>
                    <Link
                      to="/studiva-digital"
                      className="inline-flex items-center gap-1.5 font-baloo text-[15px] font-bold text-amber-600 no-underline transition hover:underline"
                    >
                      Pelajari lebih lanjut <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PENDIRI & TIM ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-stv-yellow-tint px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-stv-yellow-deep">
                Tim Kami
              </span>
              <h2 className="font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                Orang-orang di Balik Studiva
              </h2>
            </div>
          </Reveal>

          {/* Pendiri */}
          <Reveal>
            <div className="mx-auto mb-10 max-w-[680px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(16,58,107,.10)]">
              <div className="bg-gradient-to-br from-stv-sky-tint to-blue-50 px-8 pt-10 pb-0 text-center">
                {/* TODO: ganti div ini dengan <img src="/images/fitri-effendy.jpg" /> saat foto tersedia */}
                <div className="mx-auto mb-[-28px] flex h-24 w-24 items-center justify-center rounded-full bg-stv-sky-stroke shadow-[0_8px_24px_rgba(46,139,201,.35)] font-baloo text-[38px] font-extrabold text-white">
                  F
                </div>
              </div>
              <div className="px-8 pb-8 pt-12 text-center">
                <h3 className="font-baloo text-[22px] font-extrabold text-stv-navy">Psikolog Fitri Effendy, S.Psi</h3>
                <p className="mt-1 text-[14px] font-semibold text-stv-sky-stroke">Pendiri & Direktur Studiva</p>
                <div className="my-5 h-px bg-stv-border" />
                <p className="text-[15px] leading-[1.75] text-stv-body">
                  Psikolog klinis dengan spesialisasi di bidang pendidikan anak berkebutuhan khusus.
                  Selama lebih dari satu dekade, Psikolog Fitri telah mendampingi ratusan anak dan
                  keluarga di Sumatera Barat, membantu mereka menemukan cara belajar yang tepat,
                  membangun kepercayaan diri, dan meraih potensi penuhnya. Ia mendirikan Studiva
                  dengan satu keyakinan: setiap anak berhak dilihat, dipahami, dan didukung.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {['Anak Berkebutuhan Khusus', 'ASD & ADHD', 'Family Therapy', 'Pendidikan Inklusif'].map(tag => (
                    <span key={tag} className="rounded-full bg-stv-sky-tint px-3 py-1 text-[12px] font-semibold text-stv-sky-stroke">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Tim pendukung */}
          <Reveal>
            <p className="mb-6 text-center text-[15px] leading-[1.7] text-stv-body">
              Psikolog Fitri didukung oleh tim guru bersertifikat, terapis speech & occupational
              therapy, dan konselor behavioral yang berdedikasi penuh pada perkembangan setiap anak.
            </p>
          </Reveal>

          {/* Grid anggota tim lain, TODO: isi dengan data nyata saat tim bertambah */}
          {TEAM_PLACEHOLDERS.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* TODO: render kartu anggota tim di sini */}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA PENUTUP ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stv-navy to-[#0d2a4d] px-4 py-20 text-center sm:px-8 sm:py-24">
        <div className="pointer-events-none absolute left-[6%] top-8 h-28 w-28 rounded-full bg-stv-yellow/10 blur-xl" />
        <div className="pointer-events-none absolute bottom-8 right-[8%] h-20 w-20 rounded-full bg-stv-sky/20 blur-xl" />
        <Reveal className="relative mx-auto max-w-[680px]">
          <h2 className="mb-5 font-baloo text-[32px] font-extrabold leading-[1.1] text-white sm:text-[42px]">
            Ingin Mengenal Studiva Lebih Dekat?
          </h2>
          <p className="mb-8 text-[17px] leading-[1.7] text-white/80">
            Tim kami siap menjawab pertanyaan Anda dan membantu menemukan jalur yang paling
            sesuai untuk anak dan keluarga Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/kontak"
              className="rounded-full bg-stv-yellow px-8 py-4 font-baloo text-[16px] font-bold text-stv-navy no-underline shadow-[0_8px_24px_rgba(251,208,10,.4)] transition hover:-translate-y-0.5 hover:bg-stv-yellow-hover"
            >
              Hubungi Kami
            </Link>
            <Link
              to="/sekolah-studiva"
              className="rounded-full border-2 border-white/40 bg-transparent px-8 py-4 font-baloo text-[16px] font-bold text-white no-underline transition hover:border-white hover:bg-white/10"
            >
              Lihat Sekolah Studiva
            </Link>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
