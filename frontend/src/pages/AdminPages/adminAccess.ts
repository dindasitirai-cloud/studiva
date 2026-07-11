import { AdminModuleKey } from './adminFeatureColors';
import { AdminRole } from './AdminContext';

// Which sections each admin role can reach. Super Admin sees everything;
// Pengelola Konten is scoped to content management; Psikolog and Staf
// Operasional both get the community-facing section (forum + konsultasi).
export const ROLE_ACCESS: Record<AdminRole, AdminModuleKey[]> = {
  'Super Admin': ['beranda', 'courses', 'strategies', 'knowledge-cards', 'forum', 'konsultasi', 'members', 'payments', 'settings', 'spp-billing', 'sekolah-akun', 'guru-akun'],
  'Pengelola Konten': ['courses', 'strategies', 'knowledge-cards'],
  Psikolog: ['forum', 'konsultasi'],
  'Staf Operasional': ['forum', 'konsultasi'],
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
  '/admin/courses': 'courses',
  '/admin/strategies': 'strategies',
  '/admin/knowledge-cards': 'knowledge-cards',
  '/admin/forum': 'forum',
  '/admin/konsultasi': 'konsultasi',
  '/admin/members': 'members',
  '/admin/payments': 'payments',
  '/admin/settings': 'settings',
  '/admin/spp-billing': 'spp-billing',
  '/admin/sekolah-akun': 'sekolah-akun',
  '/admin/guru-akun': 'guru-akun',
  '/admin/knowledge-cards/new': 'knowledge-cards',
};
