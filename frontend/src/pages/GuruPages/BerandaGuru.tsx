import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, ListTodo, TrendingUp, CalendarCheck, FolderOpen, ClipboardList,
  AlertTriangle, ArrowRight, MessageSquare, Target, Sparkles, Users,
} from 'lucide-react';
import { useGuru, PANGGILAN_GURU } from './GuruContext';
import { useAuth } from '../../context/AuthContext';
import { GURU_COLORS } from './guruFeatureColors';

function formatTanggalIndo() {
  const d = new Date();
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const SHORTCUTS = [
  { to: '/guru/kehadiran', label: 'Input Kehadiran', icon: CalendarCheck, key: 'kehadiran' as const },
  { to: '/guru/perkembangan', label: 'Tulis Perkembangan', icon: TrendingUp, key: 'perkembangan' as const },
  { to: '/guru/portfolio', label: 'Unggah Karya', icon: FolderOpen, key: 'portfolio' as const },
  { to: '/guru/asesmen', label: 'Buat Asesmen', icon: ClipboardList, key: 'asesmen' as const },
];

const URGENCY_STYLE: Record<string, string> = {
  mendesak: 'bg-red-50 border-red-300 text-red-700',
  penting: 'bg-amber-50 border-amber-300 text-amber-700',
  normal: 'bg-teal-50 border-teal-200 text-teal-700',
};

const CATEGORY_LABEL: Record<string, string> = {
  kesehatan: 'Kesehatan',
  emosi: 'Emosi',
  permintaan: 'Permintaan',
  'info-umum': 'Info Umum',
};

export default function BerandaGuru() {
  const { user } = useAuth();
  const { students, parentNotes, todayAttendanceStatus, setTodayAttendanceStatus } = useGuru();

  const unreadNotes = parentNotes.filter(n => !n.readByTeacher && n.urgency !== 'normal');
  const highlightedNotes = [...parentNotes]
    .filter(n => !n.readByTeacher)
    .sort((a, b) => {
      const order = { mendesak: 0, penting: 1, normal: 2 };
      return order[a.urgency] - order[b.urgency];
    })
    .slice(0, 3);

  const firstName = user?.name?.split(' ')[0] ?? 'Guru';
  const kelasList = [...new Set(students.map(s => s.kelompok))];

  // Mock: IEP review approaching (static for Phase 1 — full IEP module in Phase 7)
  const iepReview = [
    { studentName: 'Raka Pratama', reviewDate: 'Minggu, 6 Juli 2026' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy sm:text-[24px]">
                Selamat datang, {PANGGILAN_GURU} {firstName}! 👋
              </h2>
            </div>
            <p className="mt-1 text-[14px] capitalize text-stv-muted">{formatTanggalIndo()}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-2">
            <Users className="h-4 w-4 text-teal-600" />
            <span className="text-[13px] font-semibold text-teal-700">{students.length} siswa</span>
          </div>
        </div>
      </div>

      {/* Tugas Hari Ini */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <ListTodo className="h-4 w-4 text-orange-500" />
          Tugas Hari Ini
        </h3>
        <div className="mt-3 flex flex-col gap-2">
          {/* Kehadiran */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            {todayAttendanceStatus === 'sudah-diinput' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-stv-green" />
            ) : (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-stv-muted-2" />
            )}
            <div className="flex-1">
              <p className={`text-[14px] font-semibold ${todayAttendanceStatus === 'sudah-diinput' ? 'text-stv-muted line-through' : 'text-stv-navy'}`}>
                Input kehadiran kelas hari ini
              </p>
              {kelasList.map(k => <span key={k} className="mr-1 text-[12px] text-stv-muted">{k}</span>)}
            </div>
            {todayAttendanceStatus !== 'sudah-diinput' ? (
              <Link to="/guru/kehadiran" className="shrink-0 rounded-full bg-stv-green px-3 py-1 text-[12px] font-bold text-white no-underline hover:opacity-90">
                Input
              </Link>
            ) : (
              <button type="button" onClick={() => setTodayAttendanceStatus('belum-diinput')} className="shrink-0 text-[11px] text-stv-muted hover:text-red-500">
                Batalkan
              </button>
            )}
          </div>

          {/* Catatan perkembangan */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-stv-muted-2" />
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-stv-navy">Tulis catatan perkembangan harian</p>
              <p className="text-[12px] text-stv-muted">{students.length} siswa belum memiliki catatan hari ini</p>
            </div>
            <Link to="/guru/perkembangan" className="shrink-0 rounded-full bg-orange-500 px-3 py-1 text-[12px] font-bold text-white no-underline hover:opacity-90">
              Tulis
            </Link>
          </div>

          {unreadNotes.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-stv-navy">{unreadNotes.length} catatan penting dari orang tua</p>
                <p className="text-[12px] text-stv-muted">Perlu ditindaklanjuti hari ini</p>
              </div>
              <Link to="/guru/catatan-orang-tua" className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-[12px] font-bold text-white no-underline hover:opacity-90">
                Lihat
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Catatan Terbaru dari Orang Tua */}
      {highlightedNotes.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
              <MessageSquare className="h-4 w-4 text-teal-600" />
              Catatan Orang Tua Perlu Perhatian
            </h3>
            <Link to="/guru/catatan-orang-tua" className="flex items-center gap-1 text-[13px] font-semibold text-teal-600 no-underline hover:underline">
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {highlightedNotes.map(note => {
              const student = students.find(s => s.id === note.studentId);
              return (
                <Link
                  key={note.id}
                  to="/guru/catatan-orang-tua"
                  className={`flex flex-col gap-1 rounded-xl border px-4 py-3 no-underline transition hover:opacity-80 ${URGENCY_STYLE[note.urgency]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold">{student?.name ?? '-'} &middot; {CATEGORY_LABEL[note.category]}</span>
                    {note.urgency !== 'normal' && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                        {note.urgency === 'mendesak' ? '🔴 Mendesak' : '🟡 Penting'}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[13px]">{note.message}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Jalan Pintas */}
      <div>
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">Jalan Pintas</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SHORTCUTS.map(({ to, label, icon: Icon, key }) => {
            const colors = GURU_COLORS[key];
            return (
              <Link
                key={to}
                to={to}
                className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
                </div>
                <p className="font-baloo text-[14px] font-bold text-stv-navy">{label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pengingat IEP */}
      {iepReview.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <h3 className="flex items-center gap-2 font-baloo text-[15px] font-bold text-indigo-700">
            <Target className="h-4 w-4" />
            IEP Mendekati Jadwal Tinjau Ulang
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {iepReview.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5">
                <div>
                  <p className="text-[13px] font-semibold text-stv-navy">{item.studentName}</p>
                  <p className="text-[12px] text-stv-muted">Tinjau ulang: {item.reviewDate}</p>
                </div>
                <Link to="/guru/iep" className="rounded-full bg-indigo-600 px-3 py-1 text-[12px] font-bold text-white no-underline hover:opacity-90">
                  Buka IEP
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
