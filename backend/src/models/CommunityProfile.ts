import { run, get, all } from '../database';
import { CommunityProfile } from '../types';

export async function ensureProfile(userId: number): Promise<CommunityProfile> {
  const existing = await get<CommunityProfile>('SELECT * FROM community_profiles WHERE user_id = ?', [userId]);
  if (existing) return existing;
  await run('INSERT INTO community_profiles (user_id) VALUES (?)', [userId]);
  const created = await get<CommunityProfile>('SELECT * FROM community_profiles WHERE user_id = ?', [userId]);
  if (!created) throw new Error('Failed to create community profile');
  return created;
}

export function findProfileByUserId(userId: number): Promise<CommunityProfile | undefined> {
  return get<CommunityProfile>('SELECT * FROM community_profiles WHERE user_id = ?', [userId]);
}

export async function updateBio(userId: number, bio: string): Promise<CommunityProfile> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET bio = ? WHERE user_id = ?', [bio, userId]);
  const profile = await findProfileByUserId(userId);
  if (!profile) throw new Error('Profile not found');
  return profile;
}

export async function touchProfile(userId: number): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET last_active = CURRENT_TIMESTAMP WHERE user_id = ?', [userId]);
}

export async function incrementProfileDiscussions(userId: number): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET discussions_count = discussions_count + 1 WHERE user_id = ?', [userId]);
}

export async function incrementProfileHelpful(userId: number): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET helpful_count = helpful_count + 1 WHERE user_id = ?', [userId]);
}

export async function incrementProfileLikesReceived(userId: number): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET likes_received = likes_received + 1 WHERE user_id = ?', [userId]);
}

export async function setChampion(userId: number, isChampion: boolean): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET is_champion = ? WHERE user_id = ?', [isChampion ? 1 : 0, userId]);
}

export async function setExpert(userId: number, isExpert: boolean, expertBadge: string | null): Promise<void> {
  await ensureProfile(userId);
  await run('UPDATE community_profiles SET is_expert = ?, expert_badge = ? WHERE user_id = ?', [
    isExpert ? 1 : 0,
    expertBadge,
    userId,
  ]);
}

export function countActiveUsersSince(isoDate: string): Promise<{ count: number } | undefined> {
  return get<{ count: number }>('SELECT COUNT(*) as count FROM community_profiles WHERE last_active >= ?', [
    isoDate,
  ]);
}

export function findExpertUserIds(): Promise<number[]> {
  return all<{ user_id: number }>('SELECT user_id FROM community_profiles WHERE is_expert = 1').then((rows) =>
    rows.map((r) => r.user_id)
  );
}

export function findChampions(): Promise<CommunityProfile[]> {
  return all<CommunityProfile>('SELECT * FROM community_profiles WHERE is_champion = 1 ORDER BY helpful_count DESC');
}
