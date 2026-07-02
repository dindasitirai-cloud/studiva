import React, { createContext, useContext, useState, useCallback } from 'react';

// TODO: this whole context is in-memory mock state, same approach used for
// DashboardTier2Context. Real Child/DailyUpdate/ParentInsight models already
// exist on the backend (see ParentDashboardTier1.tsx for the live-wired
// version), but Attendance/Portfolio/Assessment/IEP have no backend model
// yet - so for now everything here stays mocked until those are built and
// this can be swapped for real API calls.

export type DiagnosisTag = 'ASD' | 'ADHD' | 'Down Syndrome' | 'Tantangan Sensorik' | 'Tantangan Belajar';

export interface ChildProfileTier1 {
  id: string;
  name: string;
  age: number;
  photo?: string;
  kelas: string;
  waliKelas: string;
  diagnosis: DiagnosisTag[];
  ringkasanGuru: string;
}

export type UpdateCategory = 'akademik' | 'sosial-emosional' | 'motorik' | 'komunikasi' | 'sensorik';
export type UpdateMood = 'great' | 'good' | 'ok' | 'challenging';

export interface DailyUpdateTier1 {
  id: string;
  childId: string;
  date: string;
  teacherName: string;
  category: UpdateCategory;
  note: string;
  mood?: UpdateMood;
  photo?: string;
}

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alfa';

export interface AttendanceRecordTier1 {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export type PortfolioCategory = 'seni' | 'motorik' | 'proyek' | 'akademik';

export interface PortfolioItemTier1 {
  id: string;
  childId: string;
  title: string;
  date: string;
  category: PortfolioCategory;
  description: string;
  mediaType: 'photo' | 'video';
  thumbnailColor: string;
}

const CHILD: ChildProfileTier1 = {
  id: 'child-tier1-1',
  name: 'Raka Pratama',
  age: 7,
  kelas: 'Kelompok Cendana',
  waliKelas: 'Bu Ratna Sari, S.Pd',
  diagnosis: ['ASD', 'Tantangan Sensorik'],
  ringkasanGuru:
    'Raka anak yang ceria dan suka musik. Ia berkembang baik dalam rutinitas terstruktur dan merespons positif terhadap instruksi visual. Saat ini kami fokus membangun kemampuan komunikasi dua arah dan toleransi terhadap perubahan aktivitas.',
};

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const DAILY_UPDATES: DailyUpdateTier1[] = [
  {
    id: 'update-1',
    childId: CHILD.id,
    date: daysAgoISO(0),
    teacherName: 'Bu Ratna Sari',
    category: 'sosial-emosional',
    note: 'Raka berhasil bergiliran menggunakan mainan favoritnya dengan temannya tanpa perlu diingatkan berulang kali. Ia juga tersenyum dan melakukan kontak mata lebih lama saat bermain bersama hari ini.',
    mood: 'great',
  },
  {
    id: 'update-2',
    childId: CHILD.id,
    date: daysAgoISO(1),
    teacherName: 'Bu Ratna Sari',
    category: 'komunikasi',
    note: 'Mulai menggunakan kartu PECS untuk meminta minum tanpa bantuan. Ini kemajuan yang bagus dari minggu lalu yang masih perlu dibimbing penuh.',
    mood: 'good',
  },
  {
    id: 'update-3',
    childId: CHILD.id,
    date: daysAgoISO(2),
    teacherName: 'Pak Joko Widodo',
    category: 'motorik',
    note: 'Latihan menggunting garis lurus sudah cukup rapi. Masih perlu pendampingan untuk pola lengkung.',
    mood: 'ok',
  },
  {
    id: 'update-4',
    childId: CHILD.id,
    date: daysAgoISO(3),
    teacherName: 'Bu Ratna Sari',
    category: 'sensorik',
    note: 'Sempat menutup telinga saat suara bel sekolah berbunyi, namun bisa menenangkan diri sendiri dalam 2 menit di sudut tenang kelas.',
    mood: 'challenging',
  },
  {
    id: 'update-5',
    childId: CHILD.id,
    date: daysAgoISO(5),
    teacherName: 'Bu Ratna Sari',
    category: 'akademik',
    note: 'Berhasil mencocokkan 8 dari 10 kartu angka 1-10 secara mandiri. Senang sekali saat diberi pujian.',
    mood: 'great',
  },
  {
    id: 'update-6',
    childId: CHILD.id,
    date: daysAgoISO(7),
    teacherName: 'Pak Joko Widodo',
    category: 'motorik',
    note: 'Sesi sensory play dengan pasir kinetik berjalan lancar, Raka aktif eksplorasi tanpa tanda tidak nyaman.',
    mood: 'good',
  },
];

// School days (Mon-Fri) for the current calendar month, from the 1st up to
// today - so the Kehadiran calendar reflects "this month" realistically
// instead of a rolling 18-day window that could spill across month boundaries.
const ATTENDANCE: AttendanceRecordTier1[] = (() => {
  const now = new Date();
  const records: AttendanceRecordTier1[] = [];
  let schoolDayIdx = 0;
  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    schoolDayIdx++;
    let status: AttendanceStatus = 'hadir';
    let note: string | undefined;
    if (schoolDayIdx === 3) { note = 'Datang terlambat 15 menit karena macet, dijemput tepat waktu pukul 14:00.'; }
    else if (schoolDayIdx === 5) { status = 'sakit'; note = 'Demam ringan, surat dari orang tua.'; }
    else if (schoolDayIdx === 9) { status = 'izin'; note = 'Izin keperluan keluarga, dijemput pukul 11:00.'; }
    else if (schoolDayIdx === 13) { status = 'alfa'; }
    records.push({ id: `att-${day}`, childId: CHILD.id, date: d.toISOString(), status, note });
  }
  return records.reverse();
})();

const PORTFOLIO: PortfolioItemTier1[] = [
  {
    id: 'pf-1',
    childId: CHILD.id,
    title: 'Lukisan Jari "Pelangi Ceria"',
    date: daysAgoISO(2),
    category: 'seni',
    description: 'Eksplorasi warna menggunakan teknik finger painting, fokus pada koordinasi tangan-mata.',
    mediaType: 'photo',
    thumbnailColor: '#A78BFA',
  },
  {
    id: 'pf-2',
    childId: CHILD.id,
    title: 'Proyek Menara Balok',
    date: daysAgoISO(6),
    category: 'proyek',
    description: 'Membangun menara dari balok kayu setinggi 8 tingkat bersama teman sekelompok.',
    mediaType: 'photo',
    thumbnailColor: '#F472B6',
  },
  {
    id: 'pf-3',
    childId: CHILD.id,
    title: 'Video Latihan Motorik Halus',
    date: daysAgoISO(10),
    category: 'motorik',
    description: 'Latihan meronce manik-manik untuk melatih kekuatan jari dan konsentrasi.',
    mediaType: 'video',
    thumbnailColor: '#60A5FA',
  },
  {
    id: 'pf-4',
    childId: CHILD.id,
    title: 'Mencocokkan Kartu Angka 1-10',
    date: daysAgoISO(13),
    category: 'akademik',
    description: 'Berhasil mencocokkan 8 dari 10 kartu angka secara mandiri, kemajuan yang baik dari minggu sebelumnya.',
    mediaType: 'photo',
    thumbnailColor: '#38BDF8',
  },
  {
    id: 'pf-5',
    childId: CHILD.id,
    title: 'Kolase Daun Kering',
    date: daysAgoISO(17),
    category: 'seni',
    description: 'Membuat kolase dari daun kering yang dikumpulkan saat aktivitas luar ruangan.',
    mediaType: 'photo',
    thumbnailColor: '#C084FC',
  },
  {
    id: 'pf-6',
    childId: CHILD.id,
    title: 'Video Proyek Sains Sederhana',
    date: daysAgoISO(21),
    category: 'proyek',
    description: 'Eksperimen mencampur warna dengan air, mengamati reaksi dan menyebutkan nama warna baru.',
    mediaType: 'video',
    thumbnailColor: '#FB7185',
  },
];

export interface AssessmentArea {
  name: string;
  score: number;
  note: string;
}

export interface AssessmentTier1 {
  id: string;
  childId: string;
  title: string;
  date: string;
  assessor: string;
  assessorRole: 'Guru' | 'Psikolog';
  summary: string;
  areas: AssessmentArea[];
  recommendations: string[];
}

const ASSESSMENTS: AssessmentTier1[] = [
  {
    id: 'asesmen-1',
    childId: CHILD.id,
    title: 'Asesmen Awal Masuk Sekolah',
    date: daysAgoISO(180),
    assessor: 'Psikolog Fitri Effendy',
    assessorRole: 'Psikolog',
    summary:
      'Pada saat masuk, Raka menunjukkan kebutuhan dukungan signifikan terutama pada komunikasi dua arah dan kemandirian bina diri. Ia merespons positif terhadap pendekatan visual dan rutinitas terstruktur, sehingga ini menjadi dasar strategi pembelajaran yang disusun.',
    areas: [
      { name: 'Komunikasi', score: 35, note: 'Masih bergantung pada komunikasi non-verbal, perlu bantuan kartu bantu (PECS).' },
      { name: 'Sosial-Emosional', score: 40, note: 'Cenderung menghindar dari interaksi kelompok besar.' },
      { name: 'Motorik Halus', score: 50, note: 'Memegang alat tulis masih kaku, perlu latihan rutin.' },
      { name: 'Motorik Kasar', score: 65, note: 'Keseimbangan dan koordinasi tubuh cukup baik untuk usianya.' },
      { name: 'Kemandirian (Bina Diri)', score: 45, note: 'Masih membutuhkan bantuan penuh untuk memakai sepatu dan merapikan alat makan.' },
    ],
    recommendations: [
      'Mulai program komunikasi augmentatif (PECS) secara konsisten di sekolah dan rumah.',
      'Latihan motorik halus rutin melalui aktivitas meronce dan menggunting.',
      'Bangun rutinitas bina diri bertahap dengan dukungan visual (jadwal bergambar).',
    ],
  },
  {
    id: 'asesmen-2',
    childId: CHILD.id,
    title: 'Asesmen Berkala Triwulan 2',
    date: daysAgoISO(20),
    assessor: 'Bu Ratna Sari, S.Pd',
    assessorRole: 'Guru',
    summary:
      'Perkembangan Raka menunjukkan progres yang konsisten pada seluruh area, terutama komunikasi dan sosial-emosional. Pendekatan visual dan rutinitas terstruktur yang diterapkan sejak asesmen awal terbukti efektif dan akan dilanjutkan dengan target yang lebih menantang.',
    areas: [
      { name: 'Komunikasi', score: 60, note: 'Mulai menggunakan kartu PECS untuk meminta sesuatu tanpa bantuan penuh.' },
      { name: 'Sosial-Emosional', score: 62, note: 'Sudah bisa bergiliran bermain dengan 1-2 teman tanpa diingatkan berulang.' },
      { name: 'Motorik Halus', score: 68, note: 'Memegang gunting lebih stabil, garis potong sudah cukup rapi.' },
      { name: 'Motorik Kasar', score: 75, note: 'Aktif dan percaya diri dalam aktivitas fisik kelompok.' },
      { name: 'Kemandirian (Bina Diri)', score: 58, note: 'Mulai bisa memakai sepatu sendiri dengan sedikit pengingat verbal.' },
    ],
    recommendations: [
      'Lanjutkan penguatan komunikasi dua arah dengan menambah variasi kartu PECS.',
      'Perluas interaksi sosial ke kelompok yang lebih besar secara bertahap.',
      'Mulai latihan kemandirian baru seperti merapikan tas sekolah sendiri.',
    ],
  },
];

// Notifications for things the TEACHER inputs (catatan perkembangan, karya
// portfolio, hasil asesmen) - derived from the seed data above rather than
// a separate feed, since there's no live teacher panel yet pushing these in
// real time. Kehadiran (routine, daily) and IEP (reviewed periodically, not
// an ongoing input stream) are intentionally left out of this notification
// feed - see chat history for the reasoning.
export type TeacherNotificationKind = 'perkembangan' | 'portfolio' | 'asesmen';

export interface TeacherNotificationTier1 {
  id: string;
  kind: TeacherNotificationKind;
  title: string;
  message: string;
  to: string;
  createdAt: string;
  read: boolean;
}

const TEACHER_NOTIFICATIONS: TeacherNotificationTier1[] = (() => {
  const items: Omit<TeacherNotificationTier1, 'read'>[] = [
    ...DAILY_UPDATES.map(u => ({
      id: `notif-${u.id}`,
      kind: 'perkembangan' as const,
      title: 'Catatan perkembangan baru',
      message: `${u.teacherName} menambahkan catatan baru: "${u.note.slice(0, 70)}${u.note.length > 70 ? '...' : ''}"`,
      to: '/dashboard/tier1/perkembangan',
      createdAt: u.date,
    })),
    ...PORTFOLIO.map(p => ({
      id: `notif-${p.id}`,
      kind: 'portfolio' as const,
      title: 'Karya baru diunggah',
      message: `Guru menambahkan karya baru ke portfolio: "${p.title}".`,
      to: '/dashboard/tier1/portfolio',
      createdAt: p.date,
    })),
    ...ASSESSMENTS.map(a => ({
      id: `notif-${a.id}`,
      kind: 'asesmen' as const,
      title: 'Hasil asesmen baru',
      message: `${a.assessor} menambahkan hasil "${a.title}".`,
      to: `/dashboard/tier1/asesmen/${a.id}`,
      createdAt: a.date,
    })),
  ];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Only the 2 most recent start unread, so the bell feels like "something
  // new happened" on first load instead of dumping years of history as unread.
  return items.map((item, i) => ({ ...item, read: i >= 2 }));
})();

export type IEPGoalTerm = 'jangka-pendek' | 'jangka-panjang';
export type IEPGoalStatus = 'tercapai' | 'berjalan' | 'perlu-perhatian';

export interface IEPGoal {
  id: string;
  term: IEPGoalTerm;
  areaFokus: string;
  tujuan: string;
  targetTerukur: string;
  strategi: string;
  progress: number;
  status: IEPGoalStatus;
}

export interface IEPTeamMember {
  name: string;
  role: string;
}

export interface IEPDataTier1 {
  childId: string;
  createdDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  team: IEPTeamMember[];
  goals: IEPGoal[];
}

const IEP_DATA: IEPDataTier1 = {
  childId: CHILD.id,
  createdDate: daysAgoISO(180),
  lastReviewDate: daysAgoISO(30),
  nextReviewDate: (() => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toISOString(); })(),
  team: [
    { name: 'Bu Ratna Sari, S.Pd', role: 'Wali Kelas' },
    { name: 'Psikolog Fitri Effendy', role: 'Psikolog' },
    { name: 'Pak Joko Widodo', role: 'Terapis Okupasi' },
  ],
  goals: [
    {
      id: 'iep-1',
      term: 'jangka-pendek',
      areaFokus: 'Komunikasi',
      tujuan: 'Mampu menggunakan kartu PECS untuk mengungkapkan kebutuhan dasar tanpa bantuan penuh.',
      targetTerukur: 'Menggunakan minimal 5 kartu PECS secara mandiri dalam satu hari sekolah.',
      strategi: 'Latihan PECS terstruktur setiap pagi, diperkuat dengan pujian positif.',
      progress: 70,
      status: 'berjalan',
    },
    {
      id: 'iep-2',
      term: 'jangka-pendek',
      areaFokus: 'Kemandirian (Bina Diri)',
      tujuan: 'Mampu memakai sepatu sendiri tanpa bantuan.',
      targetTerukur: 'Memakai sepatu mandiri pada 4 dari 5 hari sekolah dalam seminggu.',
      strategi: 'Latihan rutin sebelum istirahat dengan dukungan visual yang dikurangi secara bertahap.',
      progress: 55,
      status: 'berjalan',
    },
    {
      id: 'iep-3',
      term: 'jangka-panjang',
      areaFokus: 'Sosial-Emosional',
      tujuan: 'Mampu berinteraksi dan bermain bersama 3-4 teman dalam kelompok kecil.',
      targetTerukur: 'Berpartisipasi aktif dalam aktivitas kelompok minimal 10 menit tanpa pendampingan penuh.',
      strategi: 'Aktivitas bermain terstruktur dengan rotasi teman secara bertahap.',
      progress: 40,
      status: 'berjalan',
    },
    {
      id: 'iep-4',
      term: 'jangka-panjang',
      areaFokus: 'Motorik Halus',
      tujuan: 'Mampu menulis namanya sendiri dengan huruf yang terbaca.',
      targetTerukur: 'Menulis nama lengkap dengan 80% huruf terbaca jelas.',
      strategi: 'Latihan menulis terbimbing dengan grip pensil khusus.',
      progress: 95,
      status: 'tercapai',
    },
    {
      id: 'iep-5',
      term: 'jangka-pendek',
      areaFokus: 'Sensorik',
      tujuan: 'Mampu menenangkan diri secara mandiri dalam waktu kurang dari 1 menit saat terpapar suara keras.',
      targetTerukur: 'Menggunakan strategi menenangkan diri (sudut tenang/headphone) tanpa arahan verbal.',
      strategi: 'Pengenalan rutin terhadap sudut tenang dan latihan pernapasan sederhana.',
      progress: 20,
      status: 'perlu-perhatian',
    },
  ],
};

export type ParentNoteCategory = 'kesehatan' | 'emosi' | 'permintaan' | 'info-umum';
export type ParentNoteUrgency = 'normal' | 'penting' | 'mendesak';

export interface ParentNoteTier1 {
  id: string;
  childId: string;
  date: string;
  category: ParentNoteCategory;
  message: string;
  urgency: ParentNoteUrgency;
  createdAt: string;
  readByTeacher: boolean;
}

let nextId = 1;
const uid = () => `local-${nextId++}`;

interface DashboardTier1ContextValue {
  child: ChildProfileTier1;
  dailyUpdates: DailyUpdateTier1[];
  latestUpdate: DailyUpdateTier1 | undefined;
  attendanceRecords: AttendanceRecordTier1[];
  todayAttendance: AttendanceRecordTier1 | undefined;
  portfolioItems: PortfolioItemTier1[];
  assessments: AssessmentTier1[];
  iep: IEPDataTier1;
  parentNotes: ParentNoteTier1[];
  addParentNote: (note: { date: string; category: ParentNoteCategory; message: string; urgency: ParentNoteUrgency }) => void;
  teacherNotifications: TeacherNotificationTier1[];
  unreadTeacherNotificationCount: number;
  markTeacherNotificationRead: (id: string) => void;
  markAllTeacherNotificationsRead: () => void;
}

const DashboardTier1Context = createContext<DashboardTier1ContextValue | null>(null);

export function DashboardTier1Provider({ children }: { children: React.ReactNode }) {
  const [dailyUpdates] = useState<DailyUpdateTier1[]>(DAILY_UPDATES);
  const [attendanceRecords] = useState<AttendanceRecordTier1[]>(ATTENDANCE);
  const [portfolioItems] = useState<PortfolioItemTier1[]>(PORTFOLIO);
  const [assessments] = useState<AssessmentTier1[]>(ASSESSMENTS);
  const [iep] = useState<IEPDataTier1>(IEP_DATA);
  const [parentNotes, setParentNotes] = useState<ParentNoteTier1[]>([]);
  const [teacherNotifications, setTeacherNotifications] = useState<TeacherNotificationTier1[]>(TEACHER_NOTIFICATIONS);

  const markTeacherNotificationRead = useCallback((id: string) =>
    setTeacherNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const markAllTeacherNotificationsRead = useCallback(() =>
    setTeacherNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const unreadTeacherNotificationCount = teacherNotifications.filter(n => !n.read).length;

  const latestUpdate = dailyUpdates[0];
  const todayAttendance = attendanceRecords.find(a => a.date.slice(0, 10) === new Date().toISOString().slice(0, 10));

  const addParentNote = useCallback((note: { date: string; category: ParentNoteCategory; message: string; urgency: ParentNoteUrgency }) => {
    const id = uid();
    setParentNotes(prev => [
      { ...note, id, childId: CHILD.id, createdAt: new Date().toISOString(), readByTeacher: false },
      ...prev,
    ]);

    // TODO: remove once a real teacher panel with read-receipts exists -
    // this simulates the teacher opening and reading the note shortly after
    // it's sent, so the "Sudah Dibaca Guru" status is demonstrable.
    const delay = 8000 + Math.random() * 7000;
    setTimeout(() => {
      setParentNotes(prev => prev.map(n => n.id === id ? { ...n, readByTeacher: true } : n));
    }, delay);
  }, []);

  return (
    <DashboardTier1Context.Provider value={{
      child: CHILD,
      dailyUpdates,
      latestUpdate,
      attendanceRecords,
      todayAttendance,
      assessments,
      portfolioItems,
      iep,
      parentNotes,
      addParentNote,
      teacherNotifications,
      unreadTeacherNotificationCount,
      markTeacherNotificationRead,
      markAllTeacherNotificationsRead,
    }}>
      {children}
    </DashboardTier1Context.Provider>
  );
}

export function useDashboardTier1() {
  const ctx = useContext(DashboardTier1Context);
  if (!ctx) throw new Error('useDashboardTier1 must be used within DashboardTier1Provider');
  return ctx;
}

// Non-throwing variant for shared Studiva Digital pages (under src/pages/
// DashboardPages/Tier2/) that render inside EITHER dashboard - they can't
// call useDashboardTier1() directly since it throws when there's no
// DashboardTier1Provider above them (i.e. when rendered under /dashboard/tier2).
export function useDashboardTier1Optional() {
  return useContext(DashboardTier1Context);
}
