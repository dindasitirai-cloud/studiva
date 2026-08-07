// Sumber tunggal daftar fitur Rekah. Menambah fitur = tambah satu entri di sini.
// Dipakai oleh: SidebarRekah, NavigasiBawah, AlurEkosistem (beranda), JembatanFitur (beranda).
// TODO: review Fitri — label, ringkas, dan kapan.
import { Home, Sun, Package, Leaf, BookHeart, Sprout, Baby } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type FiturId = 'beranda' | 'irama' | 'bekal' | 'teduh' | 'jurnal' | 'panen';

export interface FiturRekah {
  id: FiturId;
  label: string;
  to: string;
  end: boolean;
  icon: LucideIcon;
  /** Token Tailwind latar untuk chip/ikon di beranda. */
  bgToken: string;
  /** Token Tailwind warna ikon. */
  fgToken: string;
  /** Satu kalimat: apa yang dilakukan ruang ini. */
  ringkas: string;
  /** Kapan ruang ini biasanya dipakai. Tampil di AlurEkosistem. */
  kapan: string;
}

// TODO: review Fitri — label, ringkas, dan kapan
export const MENU_UTAMA: FiturRekah[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    to: '/dashboard/tier2',
    end: true,
    icon: Home,
    bgToken: 'bg-fajar',
    fgToken: 'text-rekah',
    ringkas: 'Cerita tumbuh kembang hari ini',
    kapan: '—',
  },
  {
    id: 'irama',
    label: 'Irama Hari',
    to: '/dashboard/tier2/irama-hari',
    end: false,
    icon: Sun,
    bgToken: 'bg-kuning',
    fgToken: 'text-pekat',
    ringkas: 'Susun aktivitas harian dengan ritme yang sesuai',
    kapan: 'Pagi',
  },
  {
    id: 'bekal',
    label: 'Bekal',
    to: '/dashboard/tier2/bekal',
    end: false,
    icon: Package,
    bgToken: 'bg-langit',
    fgToken: 'text-pekat',
    ringkas: 'Kolam ide kegiatan sesuai usia',
    kapan: 'Saat butuh ide',
  },
  {
    id: 'teduh',
    label: 'Ruang Teduh',
    to: '/dashboard/tier2/ruang-teduh',
    end: false,
    icon: Leaf,
    bgToken: 'bg-daun',
    fgToken: 'text-white',
    ringkas: 'Ruang istirahat untuk dirimu sendiri sebagai pendamping',
    kapan: 'Kapan pun',
  },
  {
    id: 'jurnal',
    label: 'Jurnal dan Galeri',
    to: '/dashboard/tier2/jurnal-perkembangan',
    end: false,
    icon: BookHeart,
    bgToken: 'bg-ungu',
    fgToken: 'text-pekat',
    ringkas: 'Catat dan simpan momen tumbuh kembang',
    kapan: 'Saat terjadi',
  },
  {
    id: 'panen',
    label: 'Panen',
    to: '/dashboard/tier2/jejak-mekar',
    end: false,
    icon: Sprout,
    bgToken: 'bg-mawar',
    fgToken: 'text-rekah',
    ringkas: 'Lihat pola dan refleksi dari perjalanan bersama',
    kapan: 'Akhir musim',
  },
];

export const MENU_UTAMA_IDS: FiturId[] = MENU_UTAMA.map(f => f.id);

export const PROFIL_ANAK = {
  to: '/dashboard/tier2/profil-anak',
  label: 'Profil Anak',
  icon: Baby,
  end: false,
} as const;
