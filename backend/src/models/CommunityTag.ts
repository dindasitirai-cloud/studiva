import { run, get, all } from '../database';
import { CommunityTag } from '../types';

function normalizeTagName(name: string): string {
  const trimmed = name.trim().replace(/^#/, '');
  return `#${trimmed}`;
}

export async function findOrCreateTag(name: string): Promise<number> {
  const normalized = normalizeTagName(name);
  const existing = await get<CommunityTag>('SELECT * FROM community_tags WHERE name = ?', [normalized]);
  if (existing) return existing.id;
  const result = await run('INSERT INTO community_tags (name) VALUES (?)', [normalized]);
  return result.lastID;
}

export async function setDiscussionTags(discussionId: number, tagIds: number[]): Promise<void> {
  const previousTags = await all<{ tag_id: number }>('SELECT tag_id FROM discussion_tags WHERE discussion_id = ?', [
    discussionId,
  ]);
  await run('DELETE FROM discussion_tags WHERE discussion_id = ?', [discussionId]);

  for (const tagId of tagIds) {
    await run('INSERT OR IGNORE INTO discussion_tags (discussion_id, tag_id) VALUES (?, ?)', [
      discussionId,
      tagId,
    ]);
  }

  const affectedTagIds = new Set([...previousTags.map((t) => t.tag_id), ...tagIds]);
  for (const tagId of affectedTagIds) {
    await run(
      `UPDATE community_tags
       SET discussion_count = (SELECT COUNT(*) FROM discussion_tags WHERE tag_id = ?)
       WHERE id = ?`,
      [tagId, tagId]
    );
  }
}

export function getTagsForDiscussion(discussionId: number): Promise<string[]> {
  return all<{ name: string }>(
    `SELECT community_tags.name FROM community_tags
     JOIN discussion_tags ON discussion_tags.tag_id = community_tags.id
     WHERE discussion_tags.discussion_id = ?`,
    [discussionId]
  ).then((rows) => rows.map((r) => r.name));
}

export function findAllTags(sort: 'trending' | 'newest' = 'trending'): Promise<CommunityTag[]> {
  const orderBy = sort === 'newest' ? 'created_at DESC' : 'discussion_count DESC';
  return all<CommunityTag>(`SELECT * FROM community_tags ORDER BY ${orderBy} LIMIT 30`);
}
