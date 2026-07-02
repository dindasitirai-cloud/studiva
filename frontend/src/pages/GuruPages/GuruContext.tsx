import React, { createContext, useContext, useState, useCallback } from 'react';

let nextStudentId = 10;
let nextUpdateId = 100;
const uid = () => `sg-${nextStudentId++}`;
const uidUpdate = () => `du-${nextUpdateId++}`;

export type UpdateCategoryGuru = 'akademik' | 'sosial-emosional' | 'motorik' | 'komunikasi' | 'sensorik';
export type UpdateMoodGuru = 'great' | 'good' | 'ok' | 'challenging';

export interface DailyUpdateGuru {
  id: string;
  studentId: string;
  date: string;
  teacherName: string;
  category: UpdateCategoryGuru;
  note: string;
  mood?: UpdateMoodGuru;
  photo?: string;
  createdAt: string;
}

export const UPDATE_CATEGORIES: { key: UpdateCategoryGuru; label: string; bg: string; text: string; chipActive: string }[] = [
  { key: 'akademik', label: 'Akademik', text: 'text-blue-600', bg: 'bg-blue-50', chipActive: 'bg-blue-600 text-white' },
  { key: 'sosial-emosional', label: 'Sosial-Emosional', text: 'text-pink-600', bg: 'bg-pink-50', chipActive: 'bg-pink-600 text-white' },
  { key: 'motorik', label: 'Motorik', text: 'text-green-600', bg: 'bg-green-50', chipActive: 'bg-green-600 text-white' },
  { key: 'komunikasi', label: 'Komunikasi', text: 'text-purple-600', bg: 'bg-purple-50', chipActive: 'bg-purple-600 text-white' },
  { key: 'sensorik', label: 'Sensorik', text: 'text-teal-600', bg: 'bg-teal-50', chipActive: 'bg-teal-600 text-white' },
];

export const KELOMPOK_OPTIONS = ['Kelompok Cendana', 'Kelompok Anggrek', 'Kelompok Melati', 'Kelompok Mawar'];
export const DIAGNOSIS_OPTIONS = ['ASD', 'ADHD', 'Down Syndrome', 'Tantangan Sensorik', 'Tantangan Belajar'];

// TODO: this context is in-memory mock state. In production, all data here
// flows bidirectionally with the backend: what the teacher writes (daily
// updates, attendance, portfolio, assessments, IEP) becomes read-only data
// for the parent in DashboardTier1Context, and parentNotes written by
// parents surface here in the teacher's "Catatan dari Orang Tua" inbox.

// "[PANGGILAN_GURU]" convention: the honorific used when addressing a teacher
// in Indonesian. Default to "Bu" (feminine); TODO: make configurable per
// teacher profile so "Pak" teachers also get appropriate greeting.
export const PANGGILAN_GURU = 'Bu';

export type DiagnosisTags = string[];

export interface StudentGuru {
  id: string;
  name: string;
  age: number;
  photo?: string;
  kelompok: string;
  diagnosis: DiagnosisTags;
  waliKelas: string;
  ringkasan: string;
}

// Attendance tracking for the Beranda quick-status indicator.
// Detailed attendance records move to their own dedicated module in Phase 4.
export type QuickAttendanceStatus = 'belum-diinput' | 'sudah-diinput';

export type ParentNoteCategory = 'kesehatan' | 'emosi' | 'permintaan' | 'info-umum';
export type ParentNoteUrgency = 'normal' | 'penting' | 'mendesak';

export interface ParentNoteGuru {
  id: string;
  studentId: string;
  date: string;
  category: ParentNoteCategory;
  message: string;
  urgency: ParentNoteUrgency;
  readByTeacher: boolean;
  /** Teacher's reply, visible to parent in their chat view. */
  teacherResponse?: string;
  teacherResponseAt?: string;
}

const STUDENTS: StudentGuru[] = [
  {
    id: 'sg-1',
    name: 'Raka Pratama',
    age: 7,
    kelompok: 'Kelompok Cendana',
    waliKelas: 'Bu Ratna Sari, S.Pd',
    diagnosis: ['ASD', 'Tantangan Sensorik'],
    ringkasan:
      'Anak yang ceria dan suka musik. Berkembang baik dalam rutinitas terstruktur dan merespons positif terhadap instruksi visual.',
  },
  {
    id: 'sg-2',
    name: 'Zahra Aulia',
    age: 6,
    kelompok: 'Kelompok Cendana',
    waliKelas: 'Bu Ratna Sari, S.Pd',
    diagnosis: ['ADHD'],
    ringkasan:
      'Bersemangat dan penuh energi. Merespons baik terhadap sesi singkat dan terstruktur dengan jeda gerak di antaranya.',
  },
  {
    id: 'sg-3',
    name: 'Bima Santoso',
    age: 8,
    kelompok: 'Kelompok Cendana',
    waliKelas: 'Bu Ratna Sari, S.Pd',
    diagnosis: ['Down Syndrome'],
    ringkasan:
      'Senang berinteraksi sosial dan aktif dalam kegiatan musik serta gerak. Perkembangan akademik berjalan bertahap dengan dukungan penuh.',
  },
  {
    id: 'sg-4',
    name: 'Nadia Putri',
    age: 7,
    kelompok: 'Kelompok Cendana',
    waliKelas: 'Bu Ratna Sari, S.Pd',
    diagnosis: ['Tantangan Belajar'],
    ringkasan:
      'Anak yang tekun dan sabar. Merespons baik terhadap pendekatan visual dan multimodal dalam proses belajar.',
  },
  {
    id: 'sg-5',
    name: 'Farhan Malik',
    age: 5,
    kelompok: 'Kelompok Anggrek',
    waliKelas: 'Bu Ratna Sari, S.Pd',
    diagnosis: ['Tantangan Sensorik', 'ADHD'],
    ringkasan:
      'Baru bergabung di Studiva. Sedang dalam masa orientasi dan pengenalan rutinitas. Menunjukkan kemajuan yang baik dalam adaptasi.',
  },
];

// Mock parent notes that come from the parent-side app.
// In production these sync from DashboardTier1Context's parentNotes via
// the shared backend API. TODO: wire to real shared data source.
function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Seed daily updates, mirrors what the parent sees as read-only in
// DashboardTier1Context. TODO: in production these share one backend source.
export type AttendanceStatusGuru = 'hadir' | 'izin' | 'sakit' | 'alfa';

export interface AttendanceRecordGuru {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusGuru;
  note?: string;
}

let nextAttId = 200;
const uidAtt = () => `att-${nextAttId++}`;

const STUDENT_IDS = ['sg-1', 'sg-2', 'sg-3', 'sg-4', 'sg-5'];

function buildSeedAttendance(): AttendanceRecordGuru[] {
  const records: AttendanceRecordGuru[] = [];
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const dateStr = d.toISOString().slice(0, 10);
    STUDENT_IDS.forEach((sid, i) => {
      // Spread absences realistically
      let status: AttendanceStatusGuru = 'hadir';
      if (sid === 'sg-2' && dayOffset === 3) status = 'izin';
      if (sid === 'sg-4' && dayOffset === 7) status = 'sakit';
      if (sid === 'sg-1' && dayOffset === 10) status = 'sakit';
      if (sid === 'sg-5' && dayOffset === 5) status = 'alfa';
      records.push({ id: uidAtt(), studentId: sid, date: dateStr, status });
    });
  }
  return records;
}

const SEED_ATTENDANCE: AttendanceRecordGuru[] = buildSeedAttendance();

export type PortfolioCategoryGuru = 'seni' | 'motorik' | 'proyek' | 'akademik' | 'komunikasi' | 'lainnya';

export interface PortfolioItemGuru {
  id: string;
  studentId: string;
  title: string;
  date: string;
  category: PortfolioCategoryGuru;
  description: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl?: string;
  videoUrl?: string;
  thumbnailColor: string;
  uploadedAt: string;
}

let nextPortfolioId = 300;
const uidPf = () => `pf-${nextPortfolioId++}`;

export const PORTFOLIO_CATEGORIES: { key: PortfolioCategoryGuru; label: string; bg: string; text: string; chipActive: string; color: string }[] = [
  { key: 'seni', label: 'Seni', bg: 'bg-purple-50', text: 'text-purple-600', chipActive: 'bg-purple-500 text-white', color: '#A78BFA' },
  { key: 'motorik', label: 'Motorik', bg: 'bg-cyan-50', text: 'text-cyan-600', chipActive: 'bg-cyan-500 text-white', color: '#22D3EE' },
  { key: 'proyek', label: 'Proyek', bg: 'bg-pink-50', text: 'text-pink-600', chipActive: 'bg-pink-500 text-white', color: '#F472B6' },
  { key: 'akademik', label: 'Akademik', bg: 'bg-blue-50', text: 'text-blue-600', chipActive: 'bg-blue-500 text-white', color: '#60A5FA' },
  { key: 'komunikasi', label: 'Komunikasi', bg: 'bg-orange-50', text: 'text-orange-600', chipActive: 'bg-orange-500 text-white', color: '#F97316' },
  { key: 'lainnya', label: 'Lainnya', bg: 'bg-slate-100', text: 'text-slate-600', chipActive: 'bg-slate-500 text-white', color: '#94A3B8' },
];

const SEED_PORTFOLIO: PortfolioItemGuru[] = [
  { id: 'pf-1', studentId: 'sg-1', title: 'Lukisan Jari "Pelangi Ceria"', date: daysAgoISO(2).slice(0,10), category: 'seni', description: 'Eksplorasi warna dengan finger painting. Raka sangat fokus dan memilih warna sendiri.', mediaType: 'photo', thumbnailColor: '#A78BFA', uploadedAt: daysAgoISO(2) },
  { id: 'pf-2', studentId: 'sg-1', title: 'Proyek Menara Balok', date: daysAgoISO(6).slice(0,10), category: 'proyek', description: 'Membangun menara 8 tingkat bersama teman. Kesabaran dan kolaborasi sangat baik!', mediaType: 'photo', thumbnailColor: '#F472B6', uploadedAt: daysAgoISO(6) },
  { id: 'pf-3', studentId: 'sg-2', title: 'Latihan Menggunting Pola', date: daysAgoISO(3).slice(0,10), category: 'motorik', description: 'Menggunting pola bintang dan lingkaran. Sudah bisa mengikuti garis potong dengan rapi.', mediaType: 'photo', thumbnailColor: '#22D3EE', uploadedAt: daysAgoISO(3) },
  { id: 'pf-4', studentId: 'sg-3', title: 'Pencocokan Warna Gambar', date: daysAgoISO(5).slice(0,10), category: 'akademik', description: 'Bima menyelesaikan permainan pencocokan 6 dari 8 pasang secara mandiri. Progres luar biasa!', mediaType: 'photo', thumbnailColor: '#60A5FA', uploadedAt: daysAgoISO(5) },
  { id: 'pf-5', studentId: 'sg-4', title: 'Kolase Daun Kering', date: daysAgoISO(8).slice(0,10), category: 'seni', description: 'Membuat kolase dari daun kering hasil kegiatan di luar ruangan. Kreativitas tinggi!', mediaType: 'photo', thumbnailColor: '#A78BFA', uploadedAt: daysAgoISO(8) },
];

export type AssessorRole = 'Guru' | 'Psikolog' | 'Terapis Okupasi';

// ─── IEP ────────────────────────────────────────────────────────────────────
export type IEPGoalTerm = 'jangka-pendek' | 'jangka-panjang';
export type IEPGoalStatus = 'tercapai' | 'berjalan' | 'perlu-perhatian';

export interface IEPGoalGuru {
  id: string;
  term: IEPGoalTerm;
  areaFokus: string;
  tujuan: string;
  targetTerukur: string;
  strategi: string;
  progress: number;
  status: IEPGoalStatus;
}

export interface IEPTeamMemberGuru {
  name: string;
  role: string;
}

export interface IEPRevisionGuru {
  id: string;
  date: string;
  notes: string;
  revisedBy: string;
}

export interface IEPGuru {
  id: string;
  studentId: string;
  createdDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  team: IEPTeamMemberGuru[];
  goals: IEPGoalGuru[];
  revisionHistory: IEPRevisionGuru[];
}

let nextIEPId = 500;
const uidIEP = () => `iep-${nextIEPId++}`;
let nextIEPGoalId = 600;
const uidGoal = () => `g-${nextIEPGoalId++}`;
let nextRevId = 700;
const uidRev = () => `rev-${nextRevId++}`;

const SEED_IEPS: IEPGuru[] = [
  {
    id: 'iep-1', studentId: 'sg-1',
    createdDate: daysAgoISO(180).slice(0, 10),
    lastReviewDate: daysAgoISO(30).slice(0, 10),
    nextReviewDate: (() => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toISOString().slice(0, 10); })(),
    team: [
      { name: 'Bu Ratna Sari, S.Pd', role: 'Wali Kelas' },
      { name: 'Psikolog Fitri Effendy', role: 'Psikolog' },
      { name: 'Pak Joko Widodo', role: 'Terapis Okupasi' },
    ],
    goals: [
      { id: 'g-1', term: 'jangka-pendek', areaFokus: 'Komunikasi', tujuan: 'Mampu menggunakan kartu PECS untuk mengungkapkan kebutuhan dasar tanpa bantuan penuh.', targetTerukur: 'Menggunakan minimal 5 kartu PECS secara mandiri dalam satu hari sekolah.', strategi: 'Latihan PECS terstruktur setiap pagi, diperkuat dengan pujian positif.', progress: 70, status: 'berjalan' },
      { id: 'g-2', term: 'jangka-pendek', areaFokus: 'Kemandirian (Bina Diri)', tujuan: 'Mampu memakai sepatu sendiri tanpa bantuan.', targetTerukur: 'Memakai sepatu mandiri pada 4 dari 5 hari sekolah dalam seminggu.', strategi: 'Latihan rutin sebelum istirahat dengan dukungan visual yang dikurangi bertahap.', progress: 55, status: 'berjalan' },
      { id: 'g-3', term: 'jangka-panjang', areaFokus: 'Sosial-Emosional', tujuan: 'Mampu berinteraksi dan bermain bersama 3-4 teman dalam kelompok kecil.', targetTerukur: 'Berpartisipasi aktif dalam aktivitas kelompok minimal 10 menit tanpa pendampingan penuh.', strategi: 'Aktivitas bermain terstruktur dengan rotasi teman secara bertahap.', progress: 40, status: 'berjalan' },
      { id: 'g-4', term: 'jangka-panjang', areaFokus: 'Motorik Halus', tujuan: 'Mampu menulis namanya sendiri dengan huruf yang terbaca.', targetTerukur: 'Menulis nama lengkap dengan 80% huruf terbaca jelas.', strategi: 'Latihan menulis terbimbing dengan grip pensil khusus.', progress: 95, status: 'tercapai' },
      { id: 'g-5', term: 'jangka-pendek', areaFokus: 'Sensorik', tujuan: 'Mampu menenangkan diri secara mandiri dalam waktu kurang dari 1 menit saat terpapar suara keras.', targetTerukur: 'Menggunakan strategi menenangkan diri tanpa arahan verbal.', strategi: 'Pengenalan rutin terhadap sudut tenang dan latihan pernapasan sederhana.', progress: 20, status: 'perlu-perhatian' },
    ],
    revisionHistory: [
      { id: 'rev-1', date: daysAgoISO(30).slice(0, 10), notes: 'Tinjauan berkala triwulan 2. Progres komunikasi dan motorik halus meningkat signifikan. Target sensorik perlu strategi tambahan.', revisedBy: 'Bu Ratna Sari, S.Pd' },
    ],
  },
];

export interface AssessmentAreaGuru {
  name: string;
  score: number;
  note: string;
}

export interface AssessmentGuru {
  id: string;
  studentId: string;
  title: string;
  date: string;
  assessor: string;
  assessorRole: AssessorRole;
  summary: string;
  areas: AssessmentAreaGuru[];
  recommendations: string[];
  createdAt: string;
}

let nextAssessmentId = 400;
const uidAs = () => `as-${nextAssessmentId++}`;

export const DEFAULT_ASSESSMENT_AREAS: AssessmentAreaGuru[] = [
  { name: 'Komunikasi', score: 50, note: '' },
  { name: 'Sosial-Emosional', score: 50, note: '' },
  { name: 'Motorik Halus', score: 50, note: '' },
  { name: 'Motorik Kasar', score: 50, note: '' },
  { name: 'Kemandirian (Bina Diri)', score: 50, note: '' },
];

const SEED_ASSESSMENTS: AssessmentGuru[] = [
  {
    id: 'as-1', studentId: 'sg-1', title: 'Asesmen Awal Masuk Sekolah', date: daysAgoISO(180).slice(0, 10), assessor: 'Psikolog Fitri Effendy', assessorRole: 'Psikolog',
    summary: 'Raka menunjukkan kebutuhan dukungan signifikan terutama pada komunikasi dua arah dan kemandirian bina diri. Merespons positif terhadap pendekatan visual dan rutinitas terstruktur.',
    areas: [
      { name: 'Komunikasi', score: 35, note: 'Bergantung pada komunikasi non-verbal, perlu bantuan kartu bantu (PECS).' },
      { name: 'Sosial-Emosional', score: 40, note: 'Cenderung menghindar dari interaksi kelompok besar.' },
      { name: 'Motorik Halus', score: 50, note: 'Memegang alat tulis masih kaku, perlu latihan rutin.' },
      { name: 'Motorik Kasar', score: 65, note: 'Keseimbangan dan koordinasi cukup baik untuk usianya.' },
      { name: 'Kemandirian (Bina Diri)', score: 45, note: 'Masih membutuhkan bantuan penuh untuk memakai sepatu.' },
    ],
    recommendations: ['Mulai program PECS secara konsisten.', 'Latihan motorik halus rutin.', 'Bangun rutinitas bina diri bertahap.'],
    createdAt: daysAgoISO(180),
  },
  {
    id: 'as-2', studentId: 'sg-1', title: 'Asesmen Berkala Triwulan 2', date: daysAgoISO(20).slice(0, 10), assessor: 'Bu Ratna Sari, S.Pd', assessorRole: 'Guru',
    summary: 'Perkembangan Raka menunjukkan progres konsisten pada seluruh area, terutama komunikasi dan sosial-emosional.',
    areas: [
      { name: 'Komunikasi', score: 60, note: 'Mulai menggunakan kartu PECS mandiri.' },
      { name: 'Sosial-Emosional', score: 62, note: 'Bisa bergiliran bermain dengan 1-2 teman.' },
      { name: 'Motorik Halus', score: 68, note: 'Gunting lebih stabil, garis potong cukup rapi.' },
      { name: 'Motorik Kasar', score: 75, note: 'Aktif dalam aktivitas fisik kelompok.' },
      { name: 'Kemandirian (Bina Diri)', score: 58, note: 'Mulai bisa memakai sepatu sendiri.' },
    ],
    recommendations: ['Lanjutkan dan variasikan kartu PECS.', 'Perluas interaksi sosial ke kelompok lebih besar.', 'Mulai latihan merapikan tas sekolah sendiri.'],
    createdAt: daysAgoISO(20),
  },
];

const SEED_DAILY_UPDATES: DailyUpdateGuru[] = [
  { id: 'du-1', studentId: 'sg-1', date: daysAgoISO(0).slice(0,10), teacherName: 'Bu Ratna Sari', category: 'sosial-emosional', note: 'Raka berhasil bergiliran bermain dengan teman tanpa diingatkan berulang kali. Kemajuan luar biasa hari ini!', mood: 'great', createdAt: daysAgoISO(0) },
  { id: 'du-2', studentId: 'sg-2', date: daysAgoISO(0).slice(0,10), teacherName: 'Bu Ratna Sari', category: 'motorik', note: 'Zahra menyelesaikan latihan menggunting pola bintang dengan baik. Fokus meningkat dibanding minggu lalu.', mood: 'good', createdAt: daysAgoISO(0) },
  { id: 'du-3', studentId: 'sg-1', date: daysAgoISO(1).slice(0,10), teacherName: 'Bu Ratna Sari', category: 'komunikasi', note: 'Menggunakan kartu PECS 5 kali secara mandiri untuk meminta minuman dan mainan. Sangat membanggakan!', mood: 'great', createdAt: daysAgoISO(1) },
  { id: 'du-4', studentId: 'sg-3', date: daysAgoISO(1).slice(0,10), teacherName: 'Bu Ratna Sari', category: 'akademik', note: 'Bima menyelesaikan pencocokan gambar 6 dari 8 pasang secara mandiri. Perlu lebih banyak latihan pencocokan angka.', mood: 'ok', createdAt: daysAgoISO(1) },
  { id: 'du-5', studentId: 'sg-4', date: daysAgoISO(2).slice(0,10), teacherName: 'Bu Ratna Sari', category: 'sensorik', note: 'Nadia tampak lebih nyaman dengan sesi sensory play hari ini. Tidak ada tanda-tanda ketidaknyamanan pada tekstur pasir.', mood: 'good', createdAt: daysAgoISO(2) },
];

const MOCK_PARENT_NOTES: ParentNoteGuru[] = [
  {
    id: 'pn-1',
    studentId: 'sg-1',
    date: new Date().toISOString(),
    category: 'kesehatan',
    message: 'Raka kurang tidur semalam karena ada acara keluarga. Mungkin lebih mudah kelelahan hari ini.',
    urgency: 'penting',
    readByTeacher: false,
  },
  {
    id: 'pn-2',
    studentId: 'sg-2',
    date: new Date(Date.now() - 86400000).toISOString(),
    category: 'info-umum',
    message: 'Zahra akan dijemput lebih awal hari Kamis untuk keperluan terapi rutin.',
    urgency: 'normal',
    readByTeacher: false,
  },
  {
    id: 'pn-3',
    studentId: 'sg-3',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'emosi',
    message: 'Bima sempat rewel pagi ini, mungkin perlu lebih banyak transisi pelan dari aktivitas satu ke aktivitas lain.',
    urgency: 'normal',
    readByTeacher: true,
    teacherResponse: 'Sudah dicatat. Akan saya perhatikan ritme transisi aktivitas Bima hari ini. Terima kasih informasinya!',
    teacherResponseAt: new Date(Date.now() - 2 * 86400000 + 30 * 60000).toISOString(),
  },
  {
    id: 'pn-4',
    studentId: 'sg-1',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'permintaan',
    message: 'Bolehkah kami minta salinan laporan perkembangan Raka bulan ini? Kami ingin berbagi dengan terapis di luar sekolah.',
    urgency: 'penting',
    readByTeacher: false,
  },
  {
    id: 'pn-5',
    studentId: 'sg-4',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'kesehatan',
    message: 'Nadia baru saja selesai menjalani pemeriksaan gigi kemarin. Mungkin sedikit sensitif di area mulut hari ini, mohon maklum kalau ada ketidaknyamanan saat makan siang.',
    urgency: 'normal',
    readByTeacher: false,
  },
  {
    id: 'pn-6',
    studentId: 'sg-2',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'emosi',
    message: 'Zahra tampak cemas beberapa hari ini karena ada perubahan rutinitas di rumah (ayah baru pindah kota untuk pekerjaan). Mohon diberi perhatian ekstra jika ada tanda-tanda kecemasan di sekolah.',
    urgency: 'mendesak',
    readByTeacher: false,
  },
  {
    id: 'pn-7',
    studentId: 'sg-5',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    category: 'info-umum',
    message: 'Farhan sangat antusias setelah sesi pertama di Studiva minggu lalu. Ia bercerita tentang aktivitasnya di sekolah kepada kami di rumah, pertanda baik untuk proses adaptasinya!',
    urgency: 'normal',
    readByTeacher: true,
  },
];

interface GuruContextValue {
  students: StudentGuru[];
  addStudent: (student: Omit<StudentGuru, 'id'>) => string;
  updateStudent: (id: string, updates: Partial<Omit<StudentGuru, 'id'>>) => void;
  deleteStudent: (id: string) => void;
  dailyUpdates: DailyUpdateGuru[];
  addDailyUpdate: (update: Omit<DailyUpdateGuru, 'id' | 'createdAt'>) => string;
  updateDailyUpdate: (id: string, updates: Partial<Omit<DailyUpdateGuru, 'id'>>) => void;
  deleteDailyUpdate: (id: string) => void;
  attendanceRecords: AttendanceRecordGuru[];
  saveClassAttendance: (records: Omit<AttendanceRecordGuru, 'id'>[]) => void;
  updateAttendanceRecord: (id: string, updates: Partial<Omit<AttendanceRecordGuru, 'id'>>) => void;
  portfolioItems: PortfolioItemGuru[];
  addPortfolioItem: (item: Omit<PortfolioItemGuru, 'id' | 'uploadedAt'>) => string;
  updatePortfolioItem: (id: string, updates: Partial<Omit<PortfolioItemGuru, 'id'>>) => void;
  deletePortfolioItem: (id: string) => void;
  assessments: AssessmentGuru[];
  addAssessment: (assessment: Omit<AssessmentGuru, 'id' | 'createdAt'>) => string;
  updateAssessment: (id: string, updates: Partial<Omit<AssessmentGuru, 'id'>>) => void;
  deleteAssessment: (id: string) => void;
  ieps: IEPGuru[];
  createIEP: (iep: Omit<IEPGuru, 'id'>) => string;
  updateIEP: (id: string, updates: Partial<Omit<IEPGuru, 'id'>>) => void;
  updateIEPGoal: (iepId: string, goalId: string, updates: Partial<Omit<IEPGoalGuru, 'id'>>) => void;
  addIEPGoal: (iepId: string, goal: Omit<IEPGoalGuru, 'id'>) => void;
  deleteIEPGoal: (iepId: string, goalId: string) => void;
  addIEPRevision: (iepId: string, revision: Omit<IEPRevisionGuru, 'id'>) => void;
  parentNotes: ParentNoteGuru[];
  unreadParentNoteCount: number;
  todayAttendanceStatus: QuickAttendanceStatus;
  setTodayAttendanceStatus: (status: QuickAttendanceStatus) => void;
  markParentNoteRead: (id: string) => void;
  addTeacherResponse: (id: string, response: string) => void;
}

const GuruContext = createContext<GuruContextValue | null>(null);

export function GuruProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentGuru[]>(STUDENTS);
  const [parentNotes, setParentNotes] = useState<ParentNoteGuru[]>(MOCK_PARENT_NOTES);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdateGuru[]>(SEED_DAILY_UPDATES);

  const addDailyUpdate = useCallback((update: Omit<DailyUpdateGuru, 'id' | 'createdAt'>) => {
    const id = uidUpdate();
    setDailyUpdates(prev => [{ ...update, id, createdAt: new Date().toISOString() }, ...prev]);
    return id;
  }, []);
  const updateDailyUpdate = useCallback((id: string, updates: Partial<Omit<DailyUpdateGuru, 'id'>>) =>
    setDailyUpdates(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u)), []);
  const deleteDailyUpdate = useCallback((id: string) =>
    setDailyUpdates(prev => prev.filter(u => u.id !== id)), []);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordGuru[]>(SEED_ATTENDANCE);

  const saveClassAttendance = useCallback((records: Omit<AttendanceRecordGuru, 'id'>[]) => {
    setAttendanceRecords(prev => {
      // Remove existing records for those dates+students, then add new ones
      const incoming = records.map(r => ({ ...r, id: uidAtt() }));
      const dates = new Set(incoming.map(r => r.date));
      const studentIds = new Set(incoming.map(r => r.studentId));
      const filtered = prev.filter(r => !(dates.has(r.date) && studentIds.has(r.studentId)));
      return [...filtered, ...incoming];
    });
  }, []);

  const updateAttendanceRecord = useCallback((id: string, updates: Partial<Omit<AttendanceRecordGuru, 'id'>>) =>
    setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r)), []);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemGuru[]>(SEED_PORTFOLIO);

  const addPortfolioItem = useCallback((item: Omit<PortfolioItemGuru, 'id' | 'uploadedAt'>) => {
    const id = uidPf();
    setPortfolioItems(prev => [{ ...item, id, uploadedAt: new Date().toISOString() }, ...prev]);
    return id;
  }, []);
  const updatePortfolioItem = useCallback((id: string, updates: Partial<Omit<PortfolioItemGuru, 'id'>>) =>
    setPortfolioItems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)), []);
  const deletePortfolioItem = useCallback((id: string) =>
    setPortfolioItems(prev => prev.filter(p => p.id !== id)), []);

  const [assessments, setAssessments] = useState<AssessmentGuru[]>(SEED_ASSESSMENTS);
  const addAssessment = useCallback((assessment: Omit<AssessmentGuru, 'id' | 'createdAt'>) => {
    const id = uidAs();
    setAssessments(prev => [{ ...assessment, id, createdAt: new Date().toISOString() }, ...prev]);
    return id;
  }, []);
  const updateAssessment = useCallback((id: string, updates: Partial<Omit<AssessmentGuru, 'id'>>) =>
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)), []);
  const deleteAssessment = useCallback((id: string) =>
    setAssessments(prev => prev.filter(a => a.id !== id)), []);

  const [ieps, setIEPs] = useState<IEPGuru[]>(SEED_IEPS);

  const createIEP = useCallback((iep: Omit<IEPGuru, 'id'>) => {
    const id = uidIEP();
    setIEPs(prev => [...prev, { ...iep, id }]);
    return id;
  }, []);
  const updateIEP = useCallback((id: string, updates: Partial<Omit<IEPGuru, 'id'>>) =>
    setIEPs(prev => prev.map(iep => iep.id === id ? { ...iep, ...updates } : iep)), []);
  const updateIEPGoal = useCallback((iepId: string, goalId: string, updates: Partial<Omit<IEPGoalGuru, 'id'>>) =>
    setIEPs(prev => prev.map(iep => iep.id === iepId
      ? { ...iep, goals: iep.goals.map(g => g.id === goalId ? { ...g, ...updates } : g) }
      : iep)), []);
  const addIEPGoal = useCallback((iepId: string, goal: Omit<IEPGoalGuru, 'id'>) =>
    setIEPs(prev => prev.map(iep => iep.id === iepId
      ? { ...iep, goals: [...iep.goals, { ...goal, id: uidGoal() }] }
      : iep)), []);
  const deleteIEPGoal = useCallback((iepId: string, goalId: string) =>
    setIEPs(prev => prev.map(iep => iep.id === iepId
      ? { ...iep, goals: iep.goals.filter(g => g.id !== goalId) }
      : iep)), []);
  const addIEPRevision = useCallback((iepId: string, revision: Omit<IEPRevisionGuru, 'id'>) =>
    setIEPs(prev => prev.map(iep => iep.id === iepId
      ? { ...iep, revisionHistory: [{ ...revision, id: uidRev() }, ...iep.revisionHistory] }
      : iep)), []);

  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState<QuickAttendanceStatus>('belum-diinput');

  const unreadParentNoteCount = parentNotes.filter(n => !n.readByTeacher).length;

  const addStudent = useCallback((student: Omit<StudentGuru, 'id'>) => {
    const id = uid();
    setStudents(prev => [...prev, { ...student, id }]);
    return id;
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Omit<StudentGuru, 'id'>>) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)), []);

  const deleteStudent = useCallback((id: string) =>
    setStudents(prev => prev.filter(s => s.id !== id)), []);

  const markParentNoteRead = useCallback((id: string) =>
    setParentNotes(prev => prev.map(n => n.id === id ? { ...n, readByTeacher: true } : n)), []);

  const addTeacherResponse = useCallback((id: string, response: string) =>
    setParentNotes(prev => prev.map(n => n.id === id
      ? { ...n, teacherResponse: response, teacherResponseAt: new Date().toISOString(), readByTeacher: true }
      : n)), []);

  return (
    <GuruContext.Provider value={{
      students, addStudent, updateStudent, deleteStudent,
      parentNotes, unreadParentNoteCount,
      dailyUpdates, addDailyUpdate, updateDailyUpdate, deleteDailyUpdate,
      attendanceRecords, saveClassAttendance, updateAttendanceRecord,
      portfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
      assessments, addAssessment, updateAssessment, deleteAssessment,
      ieps, createIEP, updateIEP, updateIEPGoal, addIEPGoal, deleteIEPGoal, addIEPRevision,
      todayAttendanceStatus, setTodayAttendanceStatus, markParentNoteRead, addTeacherResponse,
    }}>
      {children}
    </GuruContext.Provider>
  );
}

export function useGuru() {
  const ctx = useContext(GuruContext);
  if (!ctx) throw new Error('useGuru must be used within GuruProvider');
  return ctx;
}
