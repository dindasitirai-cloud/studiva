import { AdminModuleKey } from './adminFeatureColors';
import { AdminRole } from './AdminContext';

// Which sections each admin role can reach. Super Admin sees everything;
// Pengelola Konten is scoped to content management; Psikolog and Staf
// Operasional both get the community-facing section (forum + konsultasi) -
// Psikolog because they're the ones answering forum questions and running
// consultations, Staf Operasional because they handle day-to-day community
// upkeep. Neither gets Beranda/Anggota/Pembayaran/Pengaturan, since those
// only make sense at the whole-platform level.
export const ROLE_ACCESS: Record<AdminRole, AdminModuleKey[]> = {
  'Super Admin': ['beranda', 'resources', 'courses', 'strategies', 'forum', 'konsultasi', 'members', 'payments', 'settings', 'spp-billing', 'sekolah-akun', 'guru-akun'],
  'Pengelola Konten': ['resources', 'courses', 'strategies'],
  Psikolog: ['forum', 'konsultasi'],
  'Staf Operasional': ['forum', 'konsultasi'],
};

export function canAccessModule(role: AdminRole, module: AdminModuleKey): boolean {
  return ROLE_ACCESS[role].includes(module);
}

/** Where to send a role if they land somewhere they can't access. */
export function defaultModuleFor(role: AdminRole): AdminModuleKey {
  return ROLE_ACCESS[role][0];
}

export const MODULE_PATH: Record<AdminModuleKey, string> = {
  beranda: '/admin',
  resources: '/admin/resource-library',
  courses: '/admin/courses',
  strategies: '/admin/strategies',
  forum: '/admin/forum',
  konsultasi: '/admin/konsultasi',
  members: '/admin/members',
  payments: '/admin/payments',
  settings: '/admin/settings',
  'spp-billing': '/admin/spp-billing',
  'sekolah-akun': '/admin/sekolah-akun',
  'guru-akun': '/admin/guru-akun',
};

export const PATH_MODULE: Record<string, AdminModuleKey> = {
  '/admin': 'beranda',
  '/admin/resource-library': 'resources',
  '/admin/courses': 'courses',
  '/admin/strategies': 'strategies',
  '/admin/forum': 'forum',
  '/admin/konsultasi': 'konsultasi',
  '/admin/members': 'members',
  '/admin/payments': 'payments',
  '/admin/settings': 'settings',
  '/admin/spp-billing': 'spp-billing',
  '/admin/sekolah-akun': 'sekolah-akun',
  '/admin/guru-akun': 'guru-akun',
};
