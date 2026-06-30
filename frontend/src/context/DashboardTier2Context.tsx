import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import { ARTICLES, Article, CATEGORIES } from '../pages/DashboardPages/Tier2/articleData';
import { COURSES, Course } from '../pages/DashboardPages/Tier2/courseData';
import { STRATEGIES, Strategy, AGE_GROUPS } from '../pages/DashboardPages/Tier2/strategyData';

export type { Article, Course, Strategy };

// TODO: replace all useState here with API calls / persistent storage once
// the backend endpoints for Tier-2 member activity tracking are ready.

export type LearningStyle = 'Visual' | 'Auditori' | 'Kinestetik' | 'Membaca/Menulis';

export type JournalMood = 'great' | 'good' | 'ok' | 'challenging';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  photo?: string; // data URL or remote URL
  learningStyles: LearningStyle[];
  summary?: string;
}

export interface JournalEntry {
  id: string;
  childId: string;
  date: string;   // ISO date string
  title: string;
  notes: string;
  mood?: JournalMood;
}

export interface ConsultationBooking {
  id: string;
  // Parent only requests a session up front - the actual slot depends on the
  // psychologist's availability, so date/time stay unset until the team
  // confirms (see addBooking's simulated confirmation below).
  date?: string;
  time?: string;
  type: 'online' | 'offline';
  topic: string;
  childId?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  psychologistName: string;
  /** Admin's notes after the session happens - separate from the parent's own `notes` above. */
  resultNotes?: string;
}

// Slots the admin/psychologist opens up for booking. Independent of
// ConsultationBooking for now (the auto-confirm simulation in addBooking
// just assigns a random date/time rather than consuming a real slot here).
// TODO: once a backend exists, confirming a booking should consume the
// matching slot instead of these living as two separate lists.
export interface ConsultationSlot {
  id: string;
  date: string; // ISO date
  time: string; // "09:00"
}

export interface PsychologistProfile {
  name: string;
  specialization: string;
  bio: string;
  photoUrl?: string;
}

export interface ForumReply {
  id: string;
  author: string;
  isSupport?: boolean; // true when posted by "Tim Studiva"
  content: string;
  createdAt: string; // ISO timestamp
}

export type ForumThreadStatus = 'aktif' | 'dilaporkan' | 'disembunyikan';

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  isSupportRequest?: boolean; // started via the "Dukungan Studiva" path
  isAnnouncement?: boolean; // official Tim Studiva announcement, posted by admin
  status: ForumThreadStatus;
  pinned?: boolean;
  replies: ForumReply[];
}

// Generic shape for all Studiva Digital notifications - shared between the
// Tier 1 and Tier 2 dashboards since both read from this same context.
export type AppNotificationKind = 'forum-reply' | 'webinar-registered' | 'webinar-reminder';

export interface AppNotification {
  id: string;
  kind: AppNotificationKind;
  title: string;
  message: string;
  /** Only set for 'forum-reply' - used to build the thread link. */
  threadId?: string;
  createdAt: string;
  read: boolean;
}

// Used only to simulate someone else replying to a thread the parent just
// started, so the notification flow is demonstrable without a real backend
// or other logged-in users. TODO: remove once real multi-user data exists.
const MOCK_REPLIERS = ['Ibu Siti', 'Bapak Andi', 'Ibu Dewi', 'Ibu Maya'];

// Used only to simulate the team assigning a slot once they've checked the
// psychologist's real availability. TODO: remove once real scheduling exists.
const CONFIRM_TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

function daysFromNowISODate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const SEED_SLOTS: ConsultationSlot[] = [
  { id: 'slot-1', date: daysFromNowISODate(2), time: '09:00' },
  { id: 'slot-2', date: daysFromNowISODate(2), time: '11:00' },
  { id: 'slot-3', date: daysFromNowISODate(3), time: '13:00' },
  { id: 'slot-4', date: daysFromNowISODate(4), time: '09:00' },
  { id: 'slot-5', date: daysFromNowISODate(4), time: '15:00' },
];

const SEED_PSYCHOLOGIST: PsychologistProfile = {
  name: 'Psikolog Fitri Effendy, S.Psi',
  specialization: 'Psikologi Anak & Tumbuh Kembang, Spesialisasi ASD/ADHD',
  bio: 'Founder Studiva. Berpengalaman mendampingi orang tua dan anak dengan kebutuhan belajar khusus selama lebih dari 10 tahun.',
};

// TODO: replace these seed threads with a real GET /community/threads call.
// Kept here (not in a separate mock-data file) since they live in the same
// in-memory store as user-created threads/replies for this session.
const SEED_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Tips menghadapi transisi antar aktivitas?',
    author: 'Ibu Rina',
    content:
      'Anak saya (6 tahun) sering tantrum setiap kali harus berhenti main untuk pindah ke aktivitas lain, misalnya dari main ke makan. Ada yang punya tips praktis untuk transisi yang lebih halus?',
    createdAt: '2026-06-20T09:15:00',
    status: 'aktif',
    replies: [
      {
        id: 'reply-1a',
        author: 'Ibu Siti',
        content: 'Saya pakai timer visual 5 menit sebelum waktunya pindah, jadi anak saya nggak kaget tiba-tiba diminta berhenti. Lumayan membantu!',
        createdAt: '2026-06-20T10:02:00',
      },
      {
        id: 'reply-1b',
        author: 'Bapak Andi',
        content: 'Sama, di rumah kami pakai lagu khusus "waktunya beres-beres" supaya jadi rutinitas yang familiar.',
        createdAt: '2026-06-20T14:30:00',
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Rekomendasi sensory toys yang worth it?',
    author: 'Ibu Dewi',
    content:
      'Mau coba sensory toys untuk anak saya yang sensitif terhadap tekstur. Ada rekomendasi yang benar-benar membantu dan nggak cuma trend?',
    createdAt: '2026-06-22T11:00:00',
    status: 'aktif',
    replies: [
      {
        id: 'reply-2a',
        author: 'Ibu Rina',
        content: 'Fidget tube dan stress ball tekstur kasar sangat membantu anak saya. Murah juga, bisa beli online.',
        createdAt: '2026-06-22T13:45:00',
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'Bagaimana cara terbaik bicara dengan keluarga besar soal kondisi anak?',
    author: 'Ibu Maya',
    content:
      'Keluarga besar saya belum sepenuhnya memahami kondisi anak saya dan kadang berkomentar yang kurang tepat. Ada saran bagaimana menjelaskan dengan baik tanpa membuat suasana tegang?',
    createdAt: '2026-06-24T08:20:00',
    status: 'aktif',
    replies: [
      {
        id: 'reply-3a',
        author: 'Tim Studiva',
        isSupport: true,
        content:
          'Halo Ibu Maya, ini pertanyaan yang sering muncul. Salah satu pendekatan yang membantu adalah berbagi informasi singkat dan konkret (bukan diagnosis teknis), lalu fokus pada apa yang bisa keluarga lakukan untuk mendukung, bukan apa yang "salah". Psikolog Fitri juga membahas topik ini lebih dalam di sesi konsultasi jika Ibu ingin pendampingan lebih personal.',
        createdAt: '2026-06-24T15:10:00',
      },
    ],
  },
  {
    id: 'thread-4',
    title: 'Promo obat herbal penyembuh autisme, DM saya untuk info!',
    author: 'Akun Tidak Dikenal',
    content: 'Halo semua, saya jual obat herbal yang sudah terbukti menyembuhkan autisme dalam 30 hari. Hubungi saya untuk info lebih lanjut.',
    createdAt: '2026-06-25T10:00:00',
    status: 'dilaporkan',
    replies: [],
  },
];

// Each piece of learning activity (an article read, a course joined, a
// strategy saved) is attributed to ONE specific child, since "Perjalanan
// Pembelajaran" is per-child. The same item can be tagged for more than one
// child over time (e.g. read once, attributed to both kids separately).
interface ActivityRecord {
  childId: string;
  itemId: string;
}

interface DashboardTier2ContextValue {
  // Learning activity tracking (drives Perjalanan Pembelajaran on child profile)
  markArticleRead: (childId: string, articleId: string) => void;
  enrollCourse: (childId: string, courseId: string) => void;
  saveStrategy: (childId: string, strategyId: string) => void;
  /** Undo a tag - e.g. parent clicks an already-selected child again to deselect. */
  unmarkArticleRead: (childId: string, articleId: string) => void;
  unenrollCourse: (childId: string, courseId: string) => void;
  unsaveStrategy: (childId: string, strategyId: string) => void;
  /** Has this child specifically been tagged as having read/done this item? */
  isArticleReadByChild: (childId: string, articleId: string) => boolean;
  isCourseEnrolledByChild: (childId: string, courseId: string) => boolean;
  isStrategySavedByChild: (childId: string, strategyId: string) => boolean;
  /** Has ANY child been tagged for this item? Used for library list badges. */
  isArticleReadByAnyChild: (articleId: string) => boolean;
  isCourseEnrolledByAnyChild: (courseId: string) => boolean;
  isStrategySavedByAnyChild: (strategyId: string) => boolean;
  /** All activity for one child - used to render Perjalanan Pembelajaran. */
  getArticlesReadByChild: (childId: string) => string[];
  getCoursesEnrolledByChild: (childId: string) => string[];
  getStrategiesSavedByChild: (childId: string) => string[];
  /** Distinct item counts across all children - used for the Beranda snapshot. */
  totalArticlesRead: number;
  totalCoursesEnrolled: number;
  totalStrategiesSaved: number;

  // Child profiles (filled manually by parent)
  children: ChildProfile[];
  addChild: (profile: Omit<ChildProfile, 'id'>) => void;
  updateChild: (id: string, updates: Partial<Omit<ChildProfile, 'id'>>) => void;
  removeChild: (id: string) => void;

  // Progress journal (parent writes notes about child's development)
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  removeJournalEntry: (id: string) => void;

  // Consultation bookings
  bookings: ConsultationBooking[];
  addBooking: (booking: Omit<ConsultationBooking, 'id'>) => string;
  updateBookingStatus: (id: string, status: ConsultationBooking['status']) => void;
  updateBooking: (id: string, updates: Partial<Omit<ConsultationBooking, 'id'>>) => void;

  // Consultation slots the admin/psychologist opens up for booking
  slots: ConsultationSlot[];
  addSlot: (slot: Omit<ConsultationSlot, 'id'>) => void;
  removeSlot: (id: string) => void;

  // Psychologist profile shown on the parent-facing Konsultasi page
  psychologist: PsychologistProfile;
  updatePsychologistProfile: (updates: Partial<PsychologistProfile>) => void;

  // Content the ADMIN dashboard manages (Resource Library / Courses /
  // Learning Strategies). Seeded from articleData.ts/courseData.ts/
  // strategyData.ts but mutable here - this is what makes "admin publishes
  // -> parent dashboards see it" actually work, since both read this same
  // state. Tier 1/Tier 2 pages must filter to status/visibility==='published'
  // themselves; admin pages intentionally see everything including drafts.
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'readCount'>) => string;
  updateArticle: (id: string, updates: Partial<Omit<Article, 'id'>>) => void;
  deleteArticle: (id: string) => void;

  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'participantCount'>) => string;
  updateCourse: (id: string, updates: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;

  strategies: Strategy[];
  addStrategy: (strategy: Omit<Strategy, 'id'>) => string;
  updateStrategy: (id: string, updates: Partial<Omit<Strategy, 'id'>>) => void;
  deleteStrategy: (id: string) => void;

  // Editable taxonomy lists for Resource Library / Learning Strategies,
  // managed from the admin Pengaturan page. Excludes the "Semua"/"Semua usia"
  // filter option, which stays a UI-only prepend wherever these are
  // rendered. Strategy.activityType stays a fixed union (used for icon
  // lookups in LearningStrategiesTier2) rather than an editable list here -
  // ageGroup is the one Strategies taxonomy that's safely just a string.
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  ageGroups: string[];
  addAgeGroup: (name: string) => void;
  removeAgeGroup: (name: string) => void;

  // Community forum
  threads: ForumThread[];
  addThread: (title: string, content: string, author: string, isSupportRequest?: boolean, isAnnouncement?: boolean) => string;
  addReply: (threadId: string, content: string, author: string, isSupport?: boolean) => void;
  reportThread: (id: string) => void;
  updateThreadStatus: (id: string, status: ForumThreadStatus) => void;
  togglePinThread: (id: string) => void;
  deleteThread: (id: string) => void;
  deleteReply: (threadId: string, replyId: string) => void;

  // Notifications - forum replies + webinar registration/reminders, shared
  // by both the Tier 1 and Tier 2 dashboards.
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notifyWebinarRegistered: (courseTitle: string) => void;
}

const DashboardTier2Context = createContext<DashboardTier2ContextValue | null>(null);

let nextId = 1;
const uid = () => `local-${nextId++}`;

function addActivity(prev: ActivityRecord[], childId: string, itemId: string): ActivityRecord[] {
  if (prev.some(a => a.childId === childId && a.itemId === itemId)) return prev;
  return [...prev, { childId, itemId }];
}

function removeActivity(prev: ActivityRecord[], childId: string, itemId: string): ActivityRecord[] {
  return prev.filter(a => !(a.childId === childId && a.itemId === itemId));
}

export function DashboardTier2Provider({ children: providerChildren }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [articleActivity, setArticleActivity] = useState<ActivityRecord[]>([]);
  const [courseActivity, setCourseActivity] = useState<ActivityRecord[]>([]);
  const [strategyActivity, setStrategyActivity] = useState<ActivityRecord[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>(SEED_THREADS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [strategies, setStrategies] = useState<Strategy[]>(STRATEGIES);
  const [slots, setSlots] = useState<ConsultationSlot[]>(SEED_SLOTS);
  const [psychologist, setPsychologist] = useState<PsychologistProfile>(SEED_PSYCHOLOGIST);
  const [categories, setCategories] = useState<string[]>(CATEGORIES.filter(c => c !== 'Semua'));
  const [ageGroups, setAgeGroups] = useState<string[]>(AGE_GROUPS.filter(g => g !== 'Semua usia'));

  // addReply is called from a setTimeout scheduled inside addThread (to
  // simulate someone else replying). By the time it fires, a plain closure
  // over `threads` would still see the pre-thread-creation snapshot, so the
  // notification lookup below always missed. A ref sidesteps that staleness.
  const threadsRef = useRef(threads);
  useEffect(() => { threadsRef.current = threads; }, [threads]);

  const markArticleRead = useCallback((childId: string, articleId: string) =>
    setArticleActivity(prev => addActivity(prev, childId, articleId)), []);

  const enrollCourse = useCallback((childId: string, courseId: string) =>
    setCourseActivity(prev => addActivity(prev, childId, courseId)), []);

  const saveStrategy = useCallback((childId: string, strategyId: string) =>
    setStrategyActivity(prev => addActivity(prev, childId, strategyId)), []);

  const unmarkArticleRead = useCallback((childId: string, articleId: string) =>
    setArticleActivity(prev => removeActivity(prev, childId, articleId)), []);

  const unenrollCourse = useCallback((childId: string, courseId: string) =>
    setCourseActivity(prev => removeActivity(prev, childId, courseId)), []);

  const unsaveStrategy = useCallback((childId: string, strategyId: string) =>
    setStrategyActivity(prev => removeActivity(prev, childId, strategyId)), []);

  const isArticleReadByChild = useCallback((childId: string, articleId: string) =>
    articleActivity.some(a => a.childId === childId && a.itemId === articleId), [articleActivity]);
  const isCourseEnrolledByChild = useCallback((childId: string, courseId: string) =>
    courseActivity.some(a => a.childId === childId && a.itemId === courseId), [courseActivity]);
  const isStrategySavedByChild = useCallback((childId: string, strategyId: string) =>
    strategyActivity.some(a => a.childId === childId && a.itemId === strategyId), [strategyActivity]);

  const isArticleReadByAnyChild = useCallback((articleId: string) =>
    articleActivity.some(a => a.itemId === articleId), [articleActivity]);
  const isCourseEnrolledByAnyChild = useCallback((courseId: string) =>
    courseActivity.some(a => a.itemId === courseId), [courseActivity]);
  const isStrategySavedByAnyChild = useCallback((strategyId: string) =>
    strategyActivity.some(a => a.itemId === strategyId), [strategyActivity]);

  const getArticlesReadByChild = useCallback((childId: string) =>
    articleActivity.filter(a => a.childId === childId).map(a => a.itemId), [articleActivity]);
  const getCoursesEnrolledByChild = useCallback((childId: string) =>
    courseActivity.filter(a => a.childId === childId).map(a => a.itemId), [courseActivity]);
  const getStrategiesSavedByChild = useCallback((childId: string) =>
    strategyActivity.filter(a => a.childId === childId).map(a => a.itemId), [strategyActivity]);

  const totalArticlesRead = new Set(articleActivity.map(a => a.itemId)).size;
  const totalCoursesEnrolled = new Set(courseActivity.map(a => a.itemId)).size;
  const totalStrategiesSaved = new Set(strategyActivity.map(a => a.itemId)).size;

  const addChild = useCallback((profile: Omit<ChildProfile, 'id'>) =>
    setChildren(prev => [...prev, { ...profile, id: uid() }]), []);

  const updateChild = useCallback((id: string, updates: Partial<Omit<ChildProfile, 'id'>>) =>
    setChildren(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), []);

  const removeChild = useCallback((id: string) =>
    setChildren(prev => prev.filter(c => c.id !== id)), []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) =>
    setJournalEntries(prev => [{ ...entry, id: uid() }, ...prev]), []);

  const removeJournalEntry = useCallback((id: string) =>
    setJournalEntries(prev => prev.filter(e => e.id !== id)), []);

  const addBooking = useCallback((booking: Omit<ConsultationBooking, 'id'>) => {
    const id = uid();
    setBookings(prev => [{ ...booking, id }, ...prev]);

    // TODO: remove once a real backend with admin/psychologist availability
    // exists - this simulates the team checking the psychologist's schedule
    // and confirming a slot a short while after the parent's request comes in.
    if (booking.status === 'pending') {
      const delay = 5000 + Math.random() * 4000;
      setTimeout(() => {
        const confirmedDate = new Date();
        confirmedDate.setDate(confirmedDate.getDate() + 2 + Math.floor(Math.random() * 5));
        const confirmedTime = CONFIRM_TIME_SLOTS[Math.floor(Math.random() * CONFIRM_TIME_SLOTS.length)];
        setBookings(prev => prev.map(b => b.id === id
          ? { ...b, status: 'confirmed', date: confirmedDate.toISOString().slice(0, 10), time: confirmedTime }
          : b
        ));
      }, delay);
    }
    return id;
  }, []);

  const updateBookingStatus = useCallback((id: string, status: ConsultationBooking['status']) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)), []);

  const updateBooking = useCallback((id: string, updates: Partial<Omit<ConsultationBooking, 'id'>>) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)), []);

  const addSlot = useCallback((slot: Omit<ConsultationSlot, 'id'>) =>
    setSlots(prev => [...prev, { ...slot, id: uid() }].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))), []);

  const removeSlot = useCallback((id: string) =>
    setSlots(prev => prev.filter(s => s.id !== id)), []);

  const updatePsychologistProfile = useCallback((updates: Partial<PsychologistProfile>) =>
    setPsychologist(prev => ({ ...prev, ...updates })), []);

  const addArticle = useCallback((article: Omit<Article, 'id' | 'readCount'>) => {
    const id = uid();
    setArticles(prev => [{ ...article, id, readCount: 0 }, ...prev]);
    return id;
  }, []);
  const updateArticle = useCallback((id: string, updates: Partial<Omit<Article, 'id'>>) =>
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)), []);
  const deleteArticle = useCallback((id: string) =>
    setArticles(prev => prev.filter(a => a.id !== id)), []);

  const addCourse = useCallback((course: Omit<Course, 'id' | 'participantCount'>) => {
    const id = uid();
    setCourses(prev => [{ ...course, id, participantCount: 0 }, ...prev]);
    return id;
  }, []);
  const updateCourse = useCallback((id: string, updates: Partial<Omit<Course, 'id'>>) =>
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), []);
  const deleteCourse = useCallback((id: string) =>
    setCourses(prev => prev.filter(c => c.id !== id)), []);

  const addStrategy = useCallback((strategy: Omit<Strategy, 'id'>) => {
    const id = uid();
    setStrategies(prev => [{ ...strategy, id }, ...prev]);
    return id;
  }, []);
  const updateStrategy = useCallback((id: string, updates: Partial<Omit<Strategy, 'id'>>) =>
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)), []);
  const deleteStrategy = useCallback((id: string) =>
    setStrategies(prev => prev.filter(s => s.id !== id)), []);

  const addCategory = useCallback((name: string) =>
    setCategories(prev => prev.includes(name) ? prev : [...prev, name]), []);
  const removeCategory = useCallback((name: string) =>
    setCategories(prev => prev.filter(c => c !== name)), []);

  const addAgeGroup = useCallback((name: string) =>
    setAgeGroups(prev => prev.includes(name) ? prev : [...prev, name]), []);
  const removeAgeGroup = useCallback((name: string) =>
    setAgeGroups(prev => prev.filter(g => g !== name)), []);

  const addReply = useCallback((threadId: string, content: string, author: string, isSupport?: boolean) => {
    const thread = threadsRef.current.find(t => t.id === threadId);
    setThreads(prev => prev.map(t => t.id === threadId
      ? { ...t, replies: [...t.replies, { id: uid(), author, content, isSupport, createdAt: new Date().toISOString() }] }
      : t
    ));
    // Notify the thread's original author when someone else replies - the
    // only case that matters here since the logged-in parent is always
    // either the thread author or the one submitting this reply themselves.
    if (thread && thread.author !== author) {
      const title = 'Balasan baru di Community Forum';
      const message = `${author} membalas diskusi "${thread.title}"`;
      setNotifications(prev => [
        { id: uid(), kind: 'forum-reply', title, message, threadId, createdAt: new Date().toISOString(), read: false },
        ...prev,
      ]);
      showToast({ kind: 'forum-reply', title, message });
    }
  }, [showToast]);

  const addThread = useCallback((title: string, content: string, author: string, isSupportRequest?: boolean, isAnnouncement?: boolean) => {
    const id = uid();
    setThreads(prev => [
      { id, title, content, author, createdAt: new Date().toISOString(), isSupportRequest, isAnnouncement, status: 'aktif', replies: [] },
      ...prev,
    ]);

    // TODO: remove once a real backend with other users exists - this
    // simulates someone replying so the notification flow is demonstrable.
    // Official announcements don't get a simulated reply - they're a
    // broadcast from Tim Studiva, not a question awaiting an answer.
    if (isAnnouncement) return id;

    const delay = 6000 + Math.random() * 4000;
    setTimeout(() => {
      if (isSupportRequest) {
        addReply(
          id,
          'Terima kasih sudah menghubungi kami. Tim Studiva sudah menerima pertanyaan ini dan akan membalas dengan jawaban lebih lengkap di sini.',
          'Tim Studiva',
          true
        );
      } else {
        const replier = MOCK_REPLIERS[Math.floor(Math.random() * MOCK_REPLIERS.length)];
        addReply(id, 'Terima kasih sudah berbagi! Saya juga pernah mengalami hal serupa, semoga diskusi ini membantu orang tua lain juga.', replier);
      }
    }, delay);

    return id;
  }, [addReply]);

  const reportThread = useCallback((id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, status: 'dilaporkan' } : t)), []);

  const updateThreadStatus = useCallback((id: string, status: ForumThreadStatus) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, status } : t)), []);

  const togglePinThread = useCallback((id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t)), []);

  const deleteThread = useCallback((id: string) =>
    setThreads(prev => prev.filter(t => t.id !== id)), []);

  const deleteReply = useCallback((threadId: string, replyId: string) =>
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, replies: t.replies.filter(r => r.id !== replyId) } : t)), []);

  const notifyWebinarRegistered = useCallback((courseTitle: string) => {
    const registeredTitle = 'Pendaftaran webinar berhasil';
    const registeredMessage = `Anda berhasil mendaftar webinar "${courseTitle}". Lihat detailnya di Courses.`;
    setNotifications(prev => [
      { id: uid(), kind: 'webinar-registered', title: registeredTitle, message: registeredMessage, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
    showToast({ kind: 'webinar-registered', title: registeredTitle, message: registeredMessage });

    // TODO: in production the H-1 reminder should be a real scheduled job
    // based on the webinar's actual date, not a fixed short demo delay.
    const reminderDelay = 15000 + Math.random() * 5000;
    setTimeout(() => {
      const reminderTitle = 'Reminder: Webinar besok!';
      const reminderMessage = `Webinar "${courseTitle}" akan berlangsung besok (H-1). Jangan sampai terlewat!`;
      setNotifications(prev => [
        { id: uid(), kind: 'webinar-reminder', title: reminderTitle, message: reminderMessage, createdAt: new Date().toISOString(), read: false },
        ...prev,
      ]);
      showToast({ kind: 'webinar-reminder', title: reminderTitle, message: reminderMessage });
    }, reminderDelay);
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const markAllNotificationsRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardTier2Context.Provider value={{
      markArticleRead, enrollCourse, saveStrategy,
      unmarkArticleRead, unenrollCourse, unsaveStrategy,
      isArticleReadByChild, isCourseEnrolledByChild, isStrategySavedByChild,
      isArticleReadByAnyChild, isCourseEnrolledByAnyChild, isStrategySavedByAnyChild,
      getArticlesReadByChild, getCoursesEnrolledByChild, getStrategiesSavedByChild,
      totalArticlesRead, totalCoursesEnrolled, totalStrategiesSaved,
      children, addChild, updateChild, removeChild,
      journalEntries, addJournalEntry, removeJournalEntry,
      bookings, addBooking, updateBookingStatus, updateBooking,
      slots, addSlot, removeSlot,
      psychologist, updatePsychologistProfile,
      articles, addArticle, updateArticle, deleteArticle,
      courses, addCourse, updateCourse, deleteCourse,
      strategies, addStrategy, updateStrategy, deleteStrategy,
      categories, addCategory, removeCategory, ageGroups, addAgeGroup, removeAgeGroup,
      threads, addThread, addReply, reportThread, updateThreadStatus, togglePinThread, deleteThread, deleteReply,
      notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead, notifyWebinarRegistered,
    }}>
      {providerChildren}
    </DashboardTier2Context.Provider>
  );
}

export function useDashboardTier2() {
  const ctx = useContext(DashboardTier2Context);
  if (!ctx) throw new Error('useDashboardTier2 must be used within DashboardTier2Provider');
  return ctx;
}
