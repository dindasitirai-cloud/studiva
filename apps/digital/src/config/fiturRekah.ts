// Sumber tunggal daftar fitur Rekah. Menambah fitur = tambah satu entri di sini.
// Dipakai oleh: SidebarRekah, NavigasiBawah, AlurEkosistem (beranda), JembatanFitur (beranda).
// TODO: review Fitri — label, ringkas, dan kapan.
import { Home, Sun, Package, Leaf, Sprout, Baby, Compass, CalendarDays, LifeBuoy, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type FiturId = 'beranda' | 'kompas' | 'irama' | 'kelola' | 'bekal' | 'bantu' | 'teduh' | 'jurnal' | 'panen';

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
    id: 'kompas',
    label: 'Kompas Keluarga',
    to: '/dashboard/tier2/kompas-keluarga',
    end: false,
    icon: Compass,
    bgToken: 'bg-langit',
    fgToken: 'text-pekat',
    ringkas: 'Arah, konteks, dan kompas perkembangan keluarga',
    kapan: 'Awal & tiap pekan',
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
    id: 'kelola',
    label: 'Kelola',
    to: '/dashboard/tier2/kelola',
    end: false,
    icon: CalendarDays,
    bgToken: 'bg-mawar',
    fgToken: 'text-rekah',
    ringkas: 'Pusat kendali: susun momen, kegiatan, kebiasaan, dan rencana keluarga',
    kapan: 'Harian',
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
    id: 'bantu',
    label: 'Bantu',
    to: '/dashboard/tier2/bantu',
    end: false,
    icon: LifeBuoy,
    bgToken: 'bg-pucuk',
    fgToken: 'text-pekat',
    ringkas: 'Bantuan saat menghadapi situasi sulit — tantrum, sulit tidur, kehilangan sabar',
    kapan: 'Saat ada masalah',
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

// Nav bawah (mobile) — 5 ruang inti (Phase 14G · IA Kelola-shell).
// Sumber tunggal untuk NavigasiBawah. MENU_UTAMA tetap utuh (dipakai sidebar & beranda).
const _cariFitur = (id: FiturId): FiturRekah => {
  const f = MENU_UTAMA.find(x => x.id === id);
  if (!f) throw new Error(`Fitur nav-bawah tidak ditemukan: ${id}`);
  return f;
};

export interface ItemNavBawah {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

// Nav 5 tab (Phase 15 · IA execution-hub): Beranda · Bekal · Kelola · Temani · Bantu.
// Temani didefinisikan inline (belum ada di MENU_UTAMA agar Beranda/AlurEkosistem tetap).
export const NAV_BAWAH: ItemNavBawah[] = [
  { id: 'beranda', to: _cariFitur('beranda').to, label: 'Beranda', icon: _cariFitur('beranda').icon, end: _cariFitur('beranda').end },
  { id: 'bekal', to: _cariFitur('bekal').to, label: 'Bekal', icon: _cariFitur('bekal').icon, end: _cariFitur('bekal').end },
  { id: 'kelola', to: _cariFitur('kelola').to, label: 'Kelola', icon: _cariFitur('kelola').icon, end: _cariFitur('kelola').end },
  { id: 'temani', to: '/dashboard/tier2/temani', label: 'Temani', icon: Heart, end: false },
  { id: 'bantu', to: _cariFitur('bantu').to, label: 'Bantu', icon: _cariFitur('bantu').icon, end: _cariFitur('bantu').end },
];

// Sidebar desktop = 5 ruang inti yang sama.
export const NAV_UTAMA: ItemNavBawah[] = NAV_BAWAH;

// Entri sekunder sidebar: Arah (Kompas) — bukan tab utama, tapi tetap terjangkau.
export const ARAH_ITEM = { to: _cariFitur('kompas').to, label: 'Arah', icon: _cariFitur('kompas').icon, end: false } as const;

