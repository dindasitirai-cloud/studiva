import { run, get, all } from '../database';
import { Discussion, DiscussionCategory, DiscussionWithAuthor, UserRole } from '../types';
import { findActiveSubscriptionByUserId } from './Subscription';
import { findOrCreateTag, setDiscussionTags, getTagsForDiscussion } from './CommunityTag';
import { touchProfile, incrementProfileDiscussions } from './CommunityProfile';

export async function createDiscussion(
  authorId: number,
  title: string,
  content: string,
  category: DiscussionCategory,
  subcategory: string | null,
  isAnonymous: boolean,
  tags: string[]
): Promise<Discussion> {
  const result = await run(
    `INSERT INTO discussions (title, content, author_id, category, subcategory, is_anonymous)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, content, authorId, category, subcategory, isAnonymous ? 1 : 0]
  );
  const tagIds = await Promise.all(tags.map((t) => findOrCreateTag(t)));
  await setDiscussionTags(result.lastID, tagIds);
  await incrementProfileDiscussions(authorId);
  await touchProfile(authorId);

  const discussion = await get<Discussion>('SELECT * FROM discussions WHERE id = ?', [result.lastID]);
  if (!discussion) throw new Error('Failed to create discussion');
  return discussion;
}

type DiscussionRow = Discussion & {
  author_name: string;
  author_role: UserRole;
  is_expert: number | null;
  expert_badge: string | null;
};

async function decorateDiscussion(row: DiscussionRow): Promise<DiscussionWithAuthor> {
  const tags = await getTagsForDiscussion(row.id);
  const isExpert = Boolean(row.is_expert);
  // Experts always post under their real name, even with "anonymous" checked -
  // an anonymous "Tier 1 Parent" answer from Psikolog Fitri would be misleading.
  let displayName = row.author_name;
  if (row.is_anonymous && !isExpert) {
    if (row.category === 'tier1') {
      displayName = 'Tier 1 Parent';
    } else if (row.category === 'tier2') {
      displayName = 'Tier 2 Parent';
    } else {
      const sub = await findActiveSubscriptionByUserId(row.author_id);
      displayName =
        sub?.tier === 'tier1' ? 'Tier 1 Parent' : sub?.tier === 'tier2' ? 'Tier 2 Parent' : 'Anonymous Parent';
    }
  }
  return { ...row, tags, display_name: displayName, is_expert: isExpert, expert_badge: row.expert_badge };
}

const DISCUSSION_SELECT = `
  SELECT discussions.*, users.name AS author_name, users.role AS author_role,
         community_profiles.is_expert AS is_expert, community_profiles.expert_badge AS expert_badge
  FROM discussions
  JOIN users ON users.id = discussions.author_id
  LEFT JOIN community_profiles ON community_profiles.user_id = discussions.author_id
`;

export async function findDiscussionById(id: number): Promise<DiscussionWithAuthor | undefined> {
  const row = await get<DiscussionRow>(
    `${DISCUSSION_SELECT} WHERE discussions.id = ? AND discussions.deleted_at IS NULL`,
    [id]
  );
  if (!row) return undefined;
  return decorateDiscussion(row);
}

interface DiscussionFilters {
  category?: DiscussionCategory;
  subcategory?: string;
  tag?: string;
  sort?: 'newest' | 'popular' | 'trending' | 'replies';
  limit?: number;
  offset?: number;
  excludeCategories?: DiscussionCategory[];
}

export async function findDiscussions(filters: DiscussionFilters): Promise<DiscussionWithAuthor[]> {
  const clauses: string[] = ['discussions.deleted_at IS NULL'];
  const params: unknown[] = [];

  if (filters.category) {
    clauses.push('discussions.category = ?');
    params.push(filters.category);
  } else if (filters.excludeCategories && filters.excludeCategories.length > 0) {
    clauses.push(`discussions.category NOT IN (${filters.excludeCategories.map(() => '?').join(',')})`);
    params.push(...filters.excludeCategories);
  }
  if (filters.subcategory) {
    clauses.push('discussions.subcategory = ?');
    params.push(filters.subcategory);
  }

  let joinTag = '';
  if (filters.tag) {
    joinTag = `
      JOIN discussion_tags ON discussion_tags.discussion_id = discussions.id
      JOIN community_tags ON community_tags.id = discussion_tags.tag_id AND community_tags.name = ?
    `;
    params.unshift(filters.tag);
  }

  let orderBy = 'discussions.is_pinned DESC, discussions.created_at DESC';
  if (filters.sort === 'popular' || filters.sort === 'trending') {
    orderBy = 'discussions.is_pinned DESC, discussions.likes_count DESC, discussions.views_count DESC';
  } else if (filters.sort === 'replies') {
    orderBy = 'discussions.is_pinned DESC, discussions.replies_count DESC';
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const sql = `
    SELECT discussions.*, users.name AS author_name, users.role AS author_role,
           community_profiles.is_expert AS is_expert, community_profiles.expert_badge AS expert_badge
    FROM discussions
    JOIN users ON users.id = discussions.author_id
    LEFT JOIN community_profiles ON community_profiles.user_id = discussions.author_id
    ${joinTag}
    WHERE ${clauses.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const rows = await all<DiscussionRow>(sql, params);
  return Promise.all(rows.map(decorateDiscussion));
}

export async function searchDiscussions(query: string, limit = 20): Promise<DiscussionWithAuthor[]> {
  const rows = await all<DiscussionRow>(
    `${DISCUSSION_SELECT}
     WHERE discussions.deleted_at IS NULL AND (discussions.title LIKE ? OR discussions.content LIKE ?)
     ORDER BY discussions.created_at DESC
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, limit]
  );
  return Promise.all(rows.map(decorateDiscussion));
}

export async function incrementViews(id: number): Promise<void> {
  await run('UPDATE discussions SET views_count = views_count + 1 WHERE id = ?', [id]);
}

export async function incrementReplies(id: number, delta: number): Promise<void> {
  await run('UPDATE discussions SET replies_count = replies_count + ? WHERE id = ?', [delta, id]);
}

export async function likeDiscussion(id: number): Promise<void> {
  await run('UPDATE discussions SET likes_count = likes_count + 1 WHERE id = ?', [id]);
}

export async function updateDiscussion(
  id: number,
  title: string,
  content: string,
  tags: string[]
): Promise<void> {
  await run('UPDATE discussions SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    title,
    content,
    id,
  ]);
  const tagIds = await Promise.all(tags.map((t) => findOrCreateTag(t)));
  await setDiscussionTags(id, tagIds);
}

export async function softDeleteDiscussion(id: number): Promise<void> {
  await run('UPDATE discussions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

export async function togglePin(id: number): Promise<boolean> {
  const discussion = await get<Discussion>('SELECT * FROM discussions WHERE id = ?', [id]);
  const next = discussion?.is_pinned ? 0 : 1;
  await run('UPDATE discussions SET is_pinned = ? WHERE id = ?', [next, id]);
  return Boolean(next);
}

export async function markSolved(id: number): Promise<void> {
  await run('UPDATE discussions SET is_solved = 1 WHERE id = ?', [id]);
}

export function countDiscussions(): Promise<{ count: number } | undefined> {
  return get<{ count: number }>('SELECT COUNT(*) as count FROM discussions WHERE deleted_at IS NULL');
}

export function countDiscussionsSince(isoDate: string): Promise<{ count: number } | undefined> {
  return get<{ count: number }>(
    'SELECT COUNT(*) as count FROM discussions WHERE deleted_at IS NULL AND created_at >= ?',
    [isoDate]
  );
}

export function countDiscussionsByUser(userId: number): Promise<{ count: number } | undefined> {
  return get<{ count: number }>(
    'SELECT COUNT(*) as count FROM discussions WHERE author_id = ? AND deleted_at IS NULL',
    [userId]
  );
}

export function categoryCounts(): Promise<Array<{ category: string; subcategory: string | null; count: number }>> {
  return all(
    `SELECT category, subcategory, COUNT(*) as count
     FROM discussions WHERE deleted_at IS NULL
     GROUP BY category, subcategory`
  );
}

export function findDiscussionsByUserId(userId: number): Promise<DiscussionWithAuthor[]> {
  return all<DiscussionRow>(
    `${DISCUSSION_SELECT} WHERE discussions.author_id = ? AND discussions.deleted_at IS NULL ORDER BY discussions.created_at DESC`,
    [userId]
  ).then((rows) => Promise.all(rows.map(decorateDiscussion)));
}
