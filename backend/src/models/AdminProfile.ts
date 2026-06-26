import { run, get, all } from '../database';
import { AdminProfile } from '../types';

interface AdminProfileRow {
  id: number;
  user_id: number;
  title: string;
  credentials: string | null;
  bio: string | null;
  expertise_areas: string | null;
  phone: string | null;
  whatsapp_link: string | null;
  location: string | null;
  is_featured: number;
  created_at: string;
}

function parseRow(row: AdminProfileRow): AdminProfile {
  return { ...row, expertise_areas: row.expertise_areas ? JSON.parse(row.expertise_areas) : [] };
}

export async function upsertAdminProfile(
  userId: number,
  title: string,
  credentials: string | null,
  bio: string | null,
  expertiseAreas: string[],
  phone: string | null,
  whatsappLink: string | null,
  location: string | null,
  isFeatured: boolean
): Promise<AdminProfile> {
  const existing = await get<AdminProfileRow>('SELECT * FROM admin_profiles WHERE user_id = ?', [userId]);
  const expertiseJson = JSON.stringify(expertiseAreas);

  if (existing) {
    await run(
      `UPDATE admin_profiles
       SET title = ?, credentials = ?, bio = ?, expertise_areas = ?, phone = ?, whatsapp_link = ?, location = ?, is_featured = ?
       WHERE user_id = ?`,
      [title, credentials, bio, expertiseJson, phone, whatsappLink, location, isFeatured ? 1 : 0, userId]
    );
  } else {
    await run(
      `INSERT INTO admin_profiles
        (user_id, title, credentials, bio, expertise_areas, phone, whatsapp_link, location, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, credentials, bio, expertiseJson, phone, whatsappLink, location, isFeatured ? 1 : 0]
    );
  }

  const row = await get<AdminProfileRow>('SELECT * FROM admin_profiles WHERE user_id = ?', [userId]);
  if (!row) throw new Error('Failed to save admin profile');
  return parseRow(row);
}

export async function findAdminProfileByUserId(userId: number): Promise<AdminProfile | undefined> {
  const row = await get<AdminProfileRow>('SELECT * FROM admin_profiles WHERE user_id = ?', [userId]);
  return row ? parseRow(row) : undefined;
}

export async function findFeaturedAdminProfiles(): Promise<AdminProfile[]> {
  const rows = await all<AdminProfileRow>('SELECT * FROM admin_profiles WHERE is_featured = 1');
  return rows.map(parseRow);
}
