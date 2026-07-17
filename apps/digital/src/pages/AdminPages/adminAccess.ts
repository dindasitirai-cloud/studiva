import { AdminModuleKey } from './adminFeatureColors';
import { AdminRole } from './AdminContext';

// Which sections each admin role can reach. Super Admin sees everything;
// Pengelola Konten is scoped to content management; Psikolog and Staf
// Operasional both get the community-facing section (forum + konsultasi).
export const ROLE_ACCESS: Record<AdminRole, AdminModuleKey[]> = {
  'Super Admin': ['beranda', 'courses', 'strategies', 'knowledge-cards', 'tracker-konten', 'forum', 'konsultasi', 'partner-orang-tua', 'members', 'payments', 'settings', 'spp-billing', 'sekolah-akun', 'guru-akun'],
  'Pengelola Konten': ['courses', 'strategies', 'knowledge-cards', 'tracker-konten'],
  Psikolog: ['forum', 'konsultasi', 'partner-orang-tua'],
  'Staf Operasional': ['forum', 'konsultasi', 'partner-orang-tua'],
};

export function canAccessModule(role: AdminRole, module: AdminModuleKey): boolean {
  return ROLE_ACCESS[role].includes(module);
}

export function defaultModuleFor(role: AdminRole): AdminModuleKey {
  return ROLE_ACCESS[role][0];
}

export const MODULE_PATH: Record<AdminModuleKey, string> = {
  beranda: '/admin',
  courses: '/admin/courses',
  strategies: '/admin/strategies',
  'knowledge-cards': '/admin/knowledge-cards',
  'tracker-konten':  '/admin/tracker-konten',
  forum: '/admin/forum',
  konsultasi: '/admin/konsultasi',
  'partner-orang-tua': '/admin/partner-orang-tua',
  members: '/admin/members',
  payments: '/admin/payments',
  settings: '/admin/settings',
  'spp-billing': '/admin/spp-billing',
  'sekolah-akun': '/admin/sekolah-akun',
  'guru-akun': '/admin/guru-akun',
};

export const PATH_MODULE: Record<string, AdminModuleKey> = {
  '/admin': 'beranda',
  '/admin/courses': 'courses',
  '/admin/strategies': 'strategies',
  '/admin/knowledge-cards': 'knowledge-cards',
  '/admin/forum': 'forum',
  '/admin/konsultasi': 'konsultasi',
  '/admin/partner-orang-tua': 'partner-orang-tua',
  '/admin/members': 'members',
  '/admin/payments': 'payments',
  '/admin/settings': 'settings',
  '/admin/spp-billing': 'spp-billing',
  '/admin/sekolah-akun': 'sekolah-akun',
  '/admin/guru-akun': 'guru-akun',
  '/admin/knowledge-cards/new': 'knowledge-cards',
  '/admin/tracker-konten': 'tracker-konten',
};
