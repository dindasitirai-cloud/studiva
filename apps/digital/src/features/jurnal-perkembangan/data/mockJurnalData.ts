// ================================================================
//  Jurnal Perkembangan — Types & Mock Data
// ================================================================

export interface TextSegment {
  text: string;
  highlight?: 'pink' | 'yellow' | 'blue';
}

export interface PhotoData {
  src: string; // URL.createObjectURL or empty string for placeholder
  caption: string;
  rotation: number; // degrees, e.g. -2.5 or 2
  washiVariant: 'pink' | 'yellow';
  gradientBg: string; // CSS gradient for placeholder
  placeholderEmoji: string;
}

export interface EntriJurnal {
  id: string;
  title: string;
  date: string; // display format e.g. '6 Juli 2026'
  segments: TextSegment[];
  photo?: PhotoData;
}

export interface StickerData {
  id: string;
  emoji: string;
  bgColor: string; // hex or CSS color
  x: number; // pixels from left of page container
  y: number; // pixels from top of page container
}

export type MomenCategory = 'c-motorik' | 'c-komunikasi' | 'c-sosial' | 'c-mandiri' | 'c-sensorik';

export interface MomenData {
  day: number;
  emoji: string;
  category: MomenCategory;
  caption: string;
  gradientBg: string;
  specialLabel?: string;
}

export interface MilestoneItemDef {
  id: string;
  name: string;
}

export interface MilestoneCategoryDef {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  barColor: string;
  items: MilestoneItemDef[];
}

export interface AnakDef {
  id: string;
  name: string;
  ageLabel: string;
  emoji: string;
  avatarBg: string;
}

// ================================================================
//  Anak (children)
// ================================================================
export const ANAK_LIST: AnakDef[] = [
  { id: 'aisyah', name: 'Aisyah', ageLabel: '6 tahun', emoji: '👧', avatarBg: '#fde3ee' },
  { id: 'rafi',   name: 'Rafi',   ageLabel: '4 tahun', emoji: '👦', avatarBg: '#ddebfa' },
];

// ================================================================
//  Journal entries (mock) — keyed by anakId → month index (0-11)
//  Entries are ordered; first half displayed on left page, rest on right.
// ================================================================
export const MOCK_ENTRIES: Record<string, Record<number, EntriJurnal[]>> = {
  aisyah: {
    6: [
      {
        id: 'aisyah-7-1',
        title: 'Minggu pertama Aisyah kembali sekolah 🌷',
        date: '6 Juli 2026',
        segments: [
          { text: 'Minggu ini Aisyah mulai ' },
          { text: 'berani menyapa gurunya duluan', highlight: 'pink' },
          { text: ' saat tiba di kelas. Biasanya ia menunggu disapa, tapi pagi itu ia melambaikan tangan sambil tersenyum. Ia juga mulai ' },
          { text: 'mau mencoba tekstur makanan baru', highlight: 'yellow' },
          { text: ' di bekalnya — wortel kukus yang selama ini disisihkan, kali ini digigit dua kali. Langkah kecil, tapi ' },
          { text: 'artinya besar sekali', highlight: 'blue' },
          { text: ' untuk kami.' },
        ],
        photo: {
          src: '',
          caption: 'karya finger painting pertama!',
          rotation: -2.5,
          washiVariant: 'pink',
          gradientBg: 'linear-gradient(135deg, #fde3ee, #ddebfa)',
          placeholderEmoji: '🎨',
        },
      },
      {
        id: 'aisyah-7-2',
        title: 'Terapi wicara: kata baru! ✨',
        date: '9 Juli 2026',
        segments: [
          { text: 'Bu guru bercerita hari ini Aisyah mengucapkan ' },
          { text: '"mau lagi"', highlight: 'pink' },
          { text: ' dengan jelas saat sesi bermain balok. Dua kata, digabung sendiri, tanpa dipancing. Di rumah aku coba ulangi permainannya dan ia mengatakannya lagi sambil tertawa. ' },
          { text: 'Alhamdulillah.', highlight: 'yellow' },
          { text: ' Kami catat ini sebagai kata gabungan pertamanya bulan ini.' },
        ],
        photo: {
          src: '',
          caption: 'menara balok 6 tingkat!',
          rotation: 2,
          washiVariant: 'yellow',
          gradientBg: 'linear-gradient(135deg, #e3f0d9, #fdf1cf)',
          placeholderEmoji: '🧩',
        },
      },
    ],
    5: [
      {
        id: 'aisyah-6-1',
        title: 'Berani main perosotan! 🛝',
        date: '15 Juni 2026',
        segments: [
          { text: 'Setelah berminggu-minggu hanya menonton dari bawah, hari ini Aisyah ' },
          { text: 'naik perosotan sendiri', highlight: 'yellow' },
          { text: ' di taman. Ia meluncur sambil memejamkan mata, lalu langsung minta lagi. Tiga kali! ' },
          { text: 'Keberanian barunya', highlight: 'pink' },
          { text: ' membuat sore kami istimewa.' },
        ],
      },
      {
        id: 'aisyah-6-2',
        title: 'Piknik keluarga 🌼',
        date: '28 Juni 2026',
        segments: [
          { text: 'Piknik di taman kota. Aisyah membantu ' },
          { text: 'menata bekal', highlight: 'blue' },
          { text: ' dan membagikan gelas ke semua orang — kakek sampai terharu.' },
        ],
        photo: {
          src: '',
          caption: 'piknik pertama tahun ini',
          rotation: 2,
          washiVariant: 'pink',
          gradientBg: 'linear-gradient(135deg, #cfe8c0, #fdf1cf)',
          placeholderEmoji: '🧺',
        },
      },
    ],
  },
  rafi: {
    6: [
      {
        id: 'rafi-7-1',
        title: 'Rafi mulai menyebut nama benda 🎯',
        date: '8 Juli 2026',
        segments: [
          { text: 'Rafi tiba-tiba menunjuk botol air dan berkata ' },
          { text: '"ini air"', highlight: 'pink' },
          { text: '! Dua kata, lengkap. Kami semua terkejut dan bangga sekali. Kemudian ia mengulanginya tiga kali, seolah memastikan kami mendengar.' },
        ],
      },
      {
        id: 'rafi-7-2',
        title: 'Bermain puzzle berdua 🧩',
        date: '11 Juli 2026',
        segments: [
          { text: 'Pertama kali Rafi mau bermain ' },
          { text: 'berdampingan dengan kakaknya', highlight: 'yellow' },
          { text: ' tanpa mengambil kepingan puzzle orang lain. Mereka duduk bersama selama 15 menit!' },
        ],
        photo: {
          src: '',
          caption: 'puzzle pertama berdua',
          rotation: -2,
          washiVariant: 'yellow',
          gradientBg: 'linear-gradient(135deg, #ddebfa, #fdf1cf)',
          placeholderEmoji: '🎮',
        },
      },
    ],
    5: [
      {
        id: 'rafi-6-1',
        title: 'Suka bermain air 💧',
        date: '20 Juni 2026',
        segments: [
          { text: 'Sesi bermain air hari ini sangat menyenangkan. Rafi ' },
          { text: 'mau membasahi tangannya sendiri', highlight: 'blue' },
          { text: ' tanpa rewel — kemajuan besar untuk integrasi sensoriknya!' },
        ],
      },
    ],
  },
};

// ================================================================
//  Calendar moments (mock)
// ================================================================
export const MOCK_MOMENTS: Record<string, Record<number, MomenData>> = {
  aisyah: {
    3:  { day: 3,  emoji: '🖐️', category: 'c-sensorik',    caption: 'Mau menyentuh pasir kinetik',  gradientBg: 'linear-gradient(135deg,#fde3ee,#fff)' },
    7:  { day: 7,  emoji: '🚲', category: 'c-motorik',     caption: 'Belajar naik sepeda roda tiga', gradientBg: 'linear-gradient(135deg,#e3f0d9,#fff)' },
    9:  { day: 9,  emoji: '💬', category: 'c-komunikasi',  caption: '"Mau lagi" — dua kata!',         gradientBg: 'linear-gradient(135deg,#ddebfa,#fff)' },
    14: { day: 14, emoji: '🤝', category: 'c-sosial',      caption: 'Bermain bersama teman baru',     gradientBg: 'linear-gradient(135deg,#fdf1cf,#fff)' },
    18: { day: 18, emoji: '👟', category: 'c-mandiri',     caption: 'Pakai sepatu sendiri!',           gradientBg: 'linear-gradient(135deg,#ecdff5,#fff)' },
    24: { day: 24, emoji: '⚽', category: 'c-motorik',     caption: 'Menendang bola ke arah target',  gradientBg: 'linear-gradient(135deg,#e3f0d9,#fff)' },
  },
  rafi: {
    5:  { day: 5,  emoji: '🎨', category: 'c-sensorik',    caption: 'Finger painting pertama',        gradientBg: 'linear-gradient(135deg,#fde3ee,#fff)' },
    11: { day: 11, emoji: '🧩', category: 'c-sosial',      caption: 'Puzzle berdua dengan kakak',     gradientBg: 'linear-gradient(135deg,#fdf1cf,#fff)' },
    16: { day: 16, emoji: '💬', category: 'c-komunikasi',  caption: '"Ini air" — dua kata!',          gradientBg: 'linear-gradient(135deg,#ddebfa,#fff)' },
    22: { day: 22, emoji: '🚿', category: 'c-mandiri',     caption: 'Cuci tangan sendiri',             gradientBg: 'linear-gradient(135deg,#ecdff5,#fff)' },
  },
};

// ================================================================
//  Milestone categories and items (same template for all children)
// ================================================================
export const MILESTONE_CATEGORIES: MilestoneCategoryDef[] = [
  {
    id: 'motorik-kasar',
    name: 'Motorik Kasar',
    emoji: '🏃',
    bgColor: '#e3f0d9',
    barColor: '#8bb56a',
    items: [
      { id: 'mk-1', name: 'Berjalan mandiri' },
      { id: 'mk-2', name: 'Melompat dengan dua kaki' },
      { id: 'mk-3', name: 'Menendang bola' },
      { id: 'mk-4', name: 'Menaiki tangga bergantian kaki' },
      { id: 'mk-5', name: 'Berdiri satu kaki sebentar' },
    ],
  },
  {
    id: 'motorik-halus',
    name: 'Motorik Halus',
    emoji: '✏️',
    bgColor: '#fde3ee',
    barColor: '#df8fae',
    items: [
      { id: 'mh-1', name: 'Memegang pensil / krayon' },
      { id: 'mh-2', name: 'Menyusun 4+ balok' },
      { id: 'mh-3', name: 'Menggunting mengikuti garis' },
      { id: 'mh-4', name: 'Menulis namanya sendiri' },
      { id: 'mh-5', name: 'Mengancingkan baju' },
    ],
  },
  {
    id: 'komunikasi',
    name: 'Komunikasi & Bahasa',
    emoji: '💬',
    bgColor: '#ddebfa',
    barColor: '#7aa5cf',
    items: [
      { id: 'kom-1', name: 'Merespons saat dipanggil namanya' },
      { id: 'kom-2', name: 'Mengucapkan kata pertama' },
      { id: 'kom-3', name: 'Merangkai 2 kata' },
      { id: 'kom-4', name: 'Menyampaikan keinginan (verbal / isyarat / AAC)' },
      { id: 'kom-5', name: 'Bercerita sederhana' },
    ],
  },
  {
    id: 'sosial',
    name: 'Sosial & Emosional',
    emoji: '🤝',
    bgColor: '#fdf1cf',
    barColor: '#e0b64f',
    items: [
      { id: 'sos-1', name: 'Melakukan kontak mata' },
      { id: 'sos-2', name: 'Bermain berdampingan dengan anak lain' },
      { id: 'sos-3', name: 'Bergantian dalam permainan' },
      { id: 'sos-4', name: 'Mengenali emosi diri' },
      { id: 'sos-5', name: 'Menunjukkan empati' },
    ],
  },
  {
    id: 'kemandirian',
    name: 'Kemandirian',
    emoji: '🌱',
    bgColor: '#ecdff5',
    barColor: '#a884c9',
    items: [
      { id: 'man-1', name: 'Makan sendiri' },
      { id: 'man-2', name: 'Memakai sepatu sendiri' },
      { id: 'man-3', name: 'Toilet training' },
      { id: 'man-4', name: 'Merapikan mainan' },
      { id: 'man-5', name: 'Menyiapkan tas sekolah' },
    ],
  },
];

// Initial achieved milestones per child
export const MOCK_ACHIEVEMENTS: Record<string, Record<string, { date: string; note: string }>> = {
  aisyah: {
    'mk-1': { date: '12 Mar 2026', note: '' },
    'mk-2': { date: '2 Mei 2026',  note: '' },
    'mk-3': { date: '24 Jun 2026', note: '' },
    'mh-1': { date: '20 Feb 2026', note: '' },
    'mh-2': { date: '8 Jul 2026',  note: '' },
    'kom-1': { date: '5 Jan 2026', note: '' },
    'kom-2': { date: '18 Apr 2026', note: '' },
    'kom-3': { date: '9 Jul 2026',  note: '' },
    'kom-4': { date: '30 Mei 2026', note: '' },
    'sos-1': { date: '10 Feb 2026', note: '' },
    'sos-2': { date: '15 Jun 2026', note: '' },
    'man-1': { date: '1 Mar 2026',  note: '' },
  },
  rafi: {
    'mk-1': { date: '5 Jan 2026',  note: '' },
    'mk-2': { date: '10 Mar 2026', note: '' },
    'mh-1': { date: '15 Feb 2026', note: '' },
    'kom-1': { date: '20 Jan 2026', note: '' },
    'kom-2': { date: '8 Jul 2026',  note: '' },
    'sos-1': { date: '25 Feb 2026', note: '' },
    'man-1': { date: '1 Apr 2026',  note: '' },
  },
};

// Month labels
export const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
export const MONTHS_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// Tab pastel colors (background + active)
export const TAB_BG: string[] = [
  '#fde3ee','#fdf1cf','#ddebfa','#e3f0d9','#ecdff5','#ffe4d6',
  '#f6bdd1','#f7d98b','#aad4f2','#cfe8c0','#dcd0f0','#ffd3c2',
];
export const TAB_ACTIVE: string[] = [
  '#df8fae','#e0b64f','#7aa5cf','#8bb56a','#a884c9','#f0876a',
  '#df8fae','#e0b64f','#7aa5cf','#8bb56a','#a884c9','#f0876a',
];

export const CATEGORY_DOT: Record<string, string> = {
  'c-motorik':     '#8bb56a',
  'c-komunikasi':  '#7aa5cf',
  'c-sosial':      '#e0b64f',
  'c-mandiri':     '#a884c9',
  'c-sensorik':    '#df8fae',
};

export const CATEGORY_LABEL: Record<string, string> = {
  'c-motorik':     '🏃 Motorik',
  'c-komunikasi':  '💬 Komunikasi',
  'c-sosial':      '🤝 Sosial',
  'c-mandiri':     '🌱 Kemandirian',
  'c-sensorik':    '✋ Sensorik',
};

export const STICKER_OPTIONS = [
  { emoji: '⭐', bgColor: '#fdf1cf' },
  { emoji: '❤️', bgColor: '#fde3ee' },
  { emoji: '🌈', bgColor: '#ddebfa' },
  { emoji: '🏆', bgColor: '#e3f0d9' },
  { emoji: '🎉', bgColor: '#fdf1cf' },
  { emoji: '🎈', bgColor: '#fde3ee' },
  { emoji: '☀️', bgColor: '#ddebfa' },
  { emoji: '👏', bgColor: '#e3f0d9' },
  { emoji: '🧸', bgColor: '#fdf1cf' },
  { emoji: '💪', bgColor: '#fde3ee' },
];
