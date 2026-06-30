// TODO: replace with API call to backend once Tier-2 course/webinar content
// is served dynamically. This array is now the SEED for
// DashboardTier2Context's `courses` state (see that file) - admin CRUD
// mutates the context's copy, not this constant.

export type CourseType = 'webinar' | 'video';
export type CourseStatus = 'upcoming' | 'available' | 'completed';
// Separate from CourseStatus on purpose: CourseStatus is the course's own
// lifecycle (upcoming/available/completed), while visibility is admin's
// publish control (draft = not shown to parents yet).
export type CourseVisibility = 'draft' | 'published';

export interface Course {
  id: string;
  type: CourseType;
  title: string;
  psychologist: string;
  description: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  date?: string;        // for webinars, e.g. "Sabtu, 12 Juli 2026 · 19.00 WIB"
  duration: number;     // minutes (webinar duration or video length)
  webinarLink?: string; // join link, only relevant while the webinar hasn't happened yet
  colorTheme: 'amber' | 'sky' | 'coral' | 'green';
  /** Registered parents (webinar) or total plays (video) - admin-facing only. */
  participantCount: number;
  /** Admin-uploaded thumbnail (data URL for now). TODO: real file storage backend. */
  thumbnailUrl?: string;
}

/** A completed webinar is, from this point on, just a recording. */
export function isVideoLike(course: Course): boolean {
  return course.type === 'video' || course.status === 'completed';
}

export const COURSES: Course[] = [
  // ---- Live Webinar ----
  {
    id: 'w1',
    type: 'webinar',
    title: 'Mendampingi Anak dengan ADHD di Rumah',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description:
      'Sesi interaktif membahas strategi praktis mendampingi anak ADHD dalam aktivitas harian, lengkap dengan tanya-jawab langsung.',
    status: 'upcoming',
    visibility: 'published',
    date: 'Sabtu, 12 Juli 2026 · 19.00 WIB',
    duration: 60,
    webinarLink: 'https://meet.studiva.id/webinar/w1',
    colorTheme: 'amber',
    participantCount: 34,
  },
  {
    id: 'w2',
    type: 'webinar',
    title: 'Komunikasi Efektif dengan Anak Nonverbal',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Mengenal metode komunikasi alternatif (AAC) dan cara menerapkannya bersama anak di rumah.',
    status: 'upcoming',
    visibility: 'published',
    date: 'Minggu, 20 Juli 2026 · 16.00 WIB',
    duration: 50,
    webinarLink: 'https://meet.studiva.id/webinar/w2',
    colorTheme: 'sky',
    participantCount: 21,
  },
  {
    id: 'w3',
    type: 'webinar',
    title: 'Mengelola Kecemasan Orang Tua dalam Pengasuhan',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Webinar khusus untuk orang tua: mengenali burnout pengasuhan dan strategi self-care yang realistis.',
    status: 'completed',
    visibility: 'published',
    date: 'Sabtu, 14 Juni 2026 · 19.00 WIB',
    duration: 60,
    colorTheme: 'coral',
    participantCount: 58,
  },
  // ---- Video Rekaman ----
  {
    id: 'v1',
    type: 'video',
    title: 'Dasar-Dasar Terapi Okupasi untuk Orang Tua',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Rekaman kelas pengantar terapi okupasi: apa yang dilakukan, kapan dibutuhkan, dan cara mendukung di rumah.',
    status: 'available',
    visibility: 'published',
    duration: 35,
    colorTheme: 'amber',
    participantCount: 142,
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Membangun Rutinitas Pagi yang Tenang',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Video praktis berisi contoh rutinitas pagi terstruktur untuk mengurangi stres anak dan orang tua.',
    status: 'available',
    visibility: 'published',
    duration: 22,
    colorTheme: 'green',
    participantCount: 97,
  },
  {
    id: 'v3',
    type: 'video',
    title: 'Mengenal Sensory Diet untuk Anak',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Penjelasan tentang sensory diet, manfaatnya, dan contoh aktivitas yang bisa dicoba di rumah.',
    status: 'available',
    visibility: 'published',
    duration: 28,
    colorTheme: 'sky',
    participantCount: 76,
  },
  {
    id: 'v4',
    type: 'video',
    title: 'Latihan Motorik Halus Sederhana',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Demonstrasi aktivitas melatih motorik halus anak menggunakan alat-alat rumah tangga.',
    status: 'available',
    visibility: 'published',
    duration: 18,
    colorTheme: 'coral',
    participantCount: 63,
  },
  {
    id: 'w4',
    type: 'webinar',
    title: 'Mengenal Augmentative and Alternative Communication (AAC) Lanjutan',
    psychologist: 'Psikolog Fitri Effendy, S.Psi',
    description: 'Draft - belum ditinjau. Sesi lanjutan AAC untuk anak yang sudah familiar dengan kartu komunikasi dasar.',
    status: 'upcoming',
    visibility: 'draft',
    date: 'Sabtu, 9 Agustus 2026 · 19.00 WIB',
    duration: 60,
    colorTheme: 'green',
    participantCount: 0,
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find(c => c.id === id);
}
