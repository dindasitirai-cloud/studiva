import React from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart, ArrowRight, TrendingUp, CalendarCheck, FolderOpen, FileText, Sparkles, GraduationCap,
} from 'lucide-react';
import { useDashboardTier1, DiagnosisTag } from './DashboardTier1Context';
import { FEATURE_COLORS } from './featureColors';
import { PerjalananPembelajaran } from '../Tier2/ProfilAnakTier2';

// Phrased to inform, not label - the goal is for parents to see this as
// context the school uses to support their child, not a clinical tag.
const DIAGNOSIS_INFO: Record<DiagnosisTag, string> = {
  ASD: 'Memiliki cara unik dalam berkomunikasi dan berinteraksi sosial. Pendekatan visual dan rutinitas terstruktur sangat membantu.',
  ADHD: 'Membutuhkan dukungan ekstra dalam menjaga fokus dan mengatur impuls. Instruksi singkat dan jelas paling efektif.',
  'Down Syndrome': 'Berkembang dengan kecepatannya sendiri yang istimewa. Pengulangan dan pujian positif mendorong rasa percaya diri.',
  'Tantangan Sensorik': 'Cukup sensitif terhadap rangsangan tertentu seperti suara, tekstur, atau cahaya. Sudut tenang tersedia bila dibutuhkan.',
  'Tantangan Belajar': 'Membutuhkan pendekatan belajar yang disesuaikan dengan kecepatan dan gaya belajarnya sendiri.',
};

const QUICK_LINKS = [
  { key: 'perkembangan' as const, to: '/dashboard/tier1/perkembangan', label: 'Perkembangan Harian', icon: TrendingUp },
  { key: 'kehadiran' as const, to: '/dashboard/tier1/kehadiran', label: 'Kehadiran', icon: CalendarCheck },
  { key: 'portfolio' as const, to: '/dashboard/tier1/portfolio', label: 'Portfolio', icon: FolderOpen },
  { key: 'iep' as const, to: '/dashboard/tier1/iep', label: 'IEP', icon: FileText },
];

export default function ProfilAnakTier1() {
  const { child } = useDashboardTier1();

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-stv-sky-stroke font-baloo text-[32px] font-bold text-white">
          {child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">{child.name}</h2>
          <p className="mt-0.5 text-[14px] text-stv-body">{child.age} tahun</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-stv-sky-tint px-3 py-1 text-[12px] font-bold text-stv-sky-stroke">
              <GraduationCap className="h-3.5 w-3.5" />
              {child.kelas}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-stv-muted">Wali Kelas: <strong className="text-stv-navy">{child.waliKelas}</strong></p>
        </div>
      </div>

      {/* Ringkasan dari Guru */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Tentang {child.name.split(' ')[0]}</h3>
        <p className="mt-2 text-[14px] leading-[1.7] text-stv-body">{child.ringkasanGuru}</p>
      </div>

      {/* Kebutuhan Khusus & Dukungan */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="mb-1 flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-stv-sky-stroke" />
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Kebutuhan Khusus & Dukungan</h3>
        </div>
        <p className="mb-4 text-[13px] text-stv-muted">
          Informasi ini membantu tim sekolah memberikan pendampingan yang paling sesuai untuk {child.name.split(' ')[0]}.
        </p>
        <div className="flex flex-col gap-3">
          {child.diagnosis.map(tag => (
            <div key={tag} className="rounded-xl bg-stv-sky-tint p-4">
              <p className="font-baloo text-[14px] font-bold text-stv-sky-stroke">{tag}</p>
              <p className="mt-1 text-[13px] leading-[1.6] text-stv-body">{DIAGNOSIS_INFO[tag]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Perjalanan Pembelajaran (Studiva Digital) */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Status Perjalanan Pembelajaran</h3>
        </div>
        <p className="mb-4 text-[13px] text-stv-muted">
          Progres ini berasal dari aktivitas {child.name.split(' ')[0]} di fitur Studiva Digital (Resource Library, Courses, Learning Strategies) - tersambung otomatis tanpa perlu memilih nama anak.
        </p>
        <PerjalananPembelajaran childId={child.id} />
      </div>

      {/* Tautan Cepat */}
      <div>
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">Lihat Lebih Lanjut</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map(({ key, to, label, icon: Icon }) => {
            const colors = FEATURE_COLORS[key];
            return (
              <Link
                key={to}
                to={to}
                className="animate-fade-in-up flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
                </div>
                <p className="font-baloo text-[13px] font-bold text-stv-navy">{label}</p>
                <ArrowRight className="h-3.5 w-3.5 text-stv-muted" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
