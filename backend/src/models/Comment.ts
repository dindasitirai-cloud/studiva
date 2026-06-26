import { run, get, all } from '../database';
import { Comment, CommentWithAuthor, UserRole } from '../types';
import { findActiveSubscriptionByUserId } from './Subscription';
import { incrementReplies } from './Discussion';
import { touchProfile } from './CommunityProfile';

type CommentRow = Comment & {
  author_name: string;
  author_role: UserRole;
  is_expert: number | null;
  expert_badge: string | null;
};

const COMMENT_SELECT = `
  SELECT comments.*, users.name AS author_name, users.role AS author_role,
         community_profiles.is_expert AS is_expert, community_profiles.expert_badge AS expert_badge
  FROM comments
  JOIN users ON users.id = comments.author_id
  LEFT JOIN community_profiles ON community_profiles.user_id = comments.author_id
`;

async function decorateComment(row: CommentRow): Promise<CommentWithAuthor> {
  const isExpert = Boolean(row.is_expert);
  let displayName = row.author_name;
  if (row.is_anonymous && !isExpert) {
    const sub = await findActiveSubscriptionByUserId(row.author_id);
    displayName = sub?.tier === 'tier1' ? 'Tier 1 Parent' : sub?.tier === 'tier2' ? 'Tier 2 Parent' : 'Anonymous Parent';
  }
  return { ...row, display_name: displayName, is_expert: isExpert, expert_badge: row.expert_badge };
}

export async function createComment(
  discussionId: number,
  authorId: number,
  content: string,
  isAnonymous: boolean
): Promise<Comment> {
  const result = await run(
    'INSERT INTO comments (discussion_id, author_id, content, is_anonymous) VALUES (?, ?, ?, ?)',
    [discussionId, authorId, content, isAnonymous ? 1 : 0]
  );
  await incrementReplies(discussionId, 1);
  await touchProfile(authorId);

  const comment = await get<Comment>('SELECT * FROM comments WHERE id = ?', [result.lastID]);
  if (!comment) throw new Error('Failed to create comment');
  return comment;
}

export function findCommentById(id: number): Promise<Comment | undefined> {
  return get<Comment>('SELECT * FROM comments WHERE id = ? AND deleted_at IS NULL', [id]);
}

export async function findCommentsByDiscussionId(discussionId: number): Promise<CommentWithAuthor[]> {
  const rows = await all<CommentRow>(
    `${COMMENT_SELECT}
     WHERE comments.discussion_id = ? AND comments.deleted_at IS NULL
     ORDER BY comments.is_marked_helpful DESC, comments.created_at ASC`,
    [discussionId]
  );
  return Promise.all(rows.map(decorateComment));
}

export async function updateComment(id: number, content: string): Promise<void> {
  await run('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content, id]);
}

export async function softDeleteComment(id: number, discussionId: number): Promise<void> {
  await run('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  await incrementReplies(discussionId, -1);
}

export async function likeComment(id: number): Promise<void> {
  await run('UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?', [id]);
}

export async function markCommentHelpful(id: number): Promise<void> {
  await run('UPDATE comments SET is_marked_helpful = 1 WHERE id = ?', [id]);
}

export function countCommentsSince(isoDate: string): Promise<{ count: number } | undefined> {
  return get<{ count: number }>(
    'SELECT COUNT(*) as count FROM comments WHERE deleted_at IS NULL AND created_at >= ?',
    [isoDate]
  );
}

export function countCommentsByUser(userId: number): Promise<{ count: number } | undefined> {
  return get<{ count: number }>(
    'SELECT COUNT(*) as count FROM comments WHERE author_id = ? AND deleted_at IS NULL',
    [userId]
  );
}

export function findCommentsByUserId(userId: number): Promise<CommentWithAuthor[]> {
  return all<CommentRow>(
    `${COMMENT_SELECT} WHERE comments.author_id = ? AND comments.deleted_at IS NULL ORDER BY comments.created_at DESC`,
    [userId]
  ).then((rows) => Promise.all(rows.map(decorateComment)));
}
