import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import { findActiveSubscriptionByUserId } from '../models/Subscription';
import {
  createDiscussion,
  findDiscussionById,
  findDiscussions,
  searchDiscussions,
  incrementViews,
  likeDiscussion,
  updateDiscussion,
  softDeleteDiscussion,
  togglePin,
  markSolved,
  countDiscussions,
  countDiscussionsByUser,
  categoryCounts,
  findDiscussionsByUserId,
} from '../models/Discussion';
import {
  createComment,
  findCommentById,
  findCommentsByDiscussionId,
  updateComment,
  softDeleteComment,
  likeComment,
  markCommentHelpful,
  countCommentsByUser,
  findCommentsByUserId,
} from '../models/Comment';
import { findAllTags } from '../models/CommunityTag';
import { createReport } from '../models/CommunityReport';
import {
  ensureProfile,
  findProfileByUserId,
  updateBio,
  incrementProfileHelpful,
  incrementProfileLikesReceived,
  findChampions,
} from '../models/CommunityProfile';
import { findUserById, toPublicUser } from '../models/User';
import { CATEGORY_STRUCTURE, categoryReadableByTier } from '../lib/communityCategories';
import { DiscussionCategory, ReportContentType, ReportReason, Tier } from '../types';

const router = Router();

router.use(authenticate);

const VALID_CATEGORIES: DiscussionCategory[] = ['general', 'tier1', 'tier2', 'topic', 'fitri'];
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

async function getViewerTier(userId: number): Promise<Tier | null> {
  const sub = await findActiveSubscriptionByUserId(userId);
  return sub?.tier ?? null;
}

function canPostInCategory(category: DiscussionCategory, viewerTier: Tier | null, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (category === 'tier1') return viewerTier === 'tier1';
  if (category === 'tier2') return viewerTier === 'tier2';
  return viewerTier !== null;
}

function withinEditWindow(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() <= EDIT_WINDOW_MS;
}

// ---------- Categories & tags ----------

router.get('/categories', async (_req: Request, res: Response) => {
  const counts = await categoryCounts();
  res.json({ categories: CATEGORY_STRUCTURE, counts });
});

router.get(
  '/tags',
  asyncHandler(async (req: Request, res: Response) => {
    const sort = req.query.sort === 'newest' ? 'newest' : 'trending';
    const tags = await findAllTags(sort);
    res.json({ tags });
  })
);

// ---------- Discussions ----------

router.get(
  '/discussions',
  asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as DiscussionCategory | undefined;
    const isAdmin = req.user!.role === 'admin';
    const viewerTier = isAdmin ? null : await getViewerTier(req.user!.id);

    if (category && !VALID_CATEGORIES.includes(category)) {
      throw new ApiError(400, 'Invalid category');
    }
    if (category && !isAdmin && !categoryReadableByTier(category, viewerTier)) {
      throw new ApiError(403, 'Forbidden: this forum is not available for your subscription tier');
    }

    const excludeCategories: DiscussionCategory[] = [];
    if (!category && !isAdmin) {
      if (viewerTier !== 'tier1') excludeCategories.push('tier1');
      if (viewerTier !== 'tier2') excludeCategories.push('tier2');
    }

    const discussions = await findDiscussions({
      category,
      subcategory: req.query.subcategory as string | undefined,
      tag: req.query.tag as string | undefined,
      sort: req.query.sort as 'newest' | 'popular' | 'trending' | 'replies' | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
      excludeCategories,
    });

    res.json({ discussions });
  })
);

router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q) throw new ApiError(400, 'q query parameter is required');

    const isAdmin = req.user!.role === 'admin';
    const viewerTier = isAdmin ? null : await getViewerTier(req.user!.id);
    const results = await searchDiscussions(q);
    const visible = isAdmin
      ? results
      : results.filter((d) => categoryReadableByTier(d.category, viewerTier));

    res.json({ discussions: visible });
  })
);

router.get(
  '/discussions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin) {
      const viewerTier = await getViewerTier(req.user!.id);
      if (!categoryReadableByTier(discussion.category, viewerTier)) {
        throw new ApiError(403, 'Forbidden: this forum is not available for your subscription tier');
      }
    }

    await incrementViews(id);
    const comments = await findCommentsByDiscussionId(id);
    res.json({ discussion: { ...discussion, views_count: discussion.views_count + 1 }, comments });
  })
);

router.post(
  '/discussions',
  requireActiveSubscription,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, category, subcategory, tags, isAnonymous } = req.body as {
      title?: string;
      content?: string;
      category?: DiscussionCategory;
      subcategory?: string;
      tags?: string[];
      isAnonymous?: boolean;
    };

    if (!title || !content || !category) {
      throw new ApiError(400, 'title, content, and category are required');
    }
    if (!VALID_CATEGORIES.includes(category)) {
      throw new ApiError(400, 'Invalid category');
    }

    const isAdmin = req.user!.role === 'admin';
    const viewerTier = isAdmin ? null : await getViewerTier(req.user!.id);
    if (!canPostInCategory(category, viewerTier, isAdmin)) {
      throw new ApiError(403, `You need an active ${category === 'tier1' ? 'Tier 1' : 'Tier 2'} subscription to post here`);
    }

    const discussion = await createDiscussion(
      req.user!.id,
      title,
      content,
      category,
      subcategory ?? null,
      Boolean(isAnonymous),
      Array.isArray(tags) ? tags.slice(0, 8) : []
    );
    res.status(201).json({ discussion });
  })
);

router.patch(
  '/discussions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    const isAuthor = discussion.author_id === req.user!.id;
    if (!isAdmin && !isAuthor) throw new ApiError(403, 'Forbidden');
    if (!isAdmin && !withinEditWindow(discussion.created_at)) {
      throw new ApiError(400, 'Discussions can only be edited within 24 hours of posting');
    }

    const { title, content, tags } = req.body as { title?: string; content?: string; tags?: string[] };
    if (!title || !content) throw new ApiError(400, 'title and content are required');

    await updateDiscussion(id, title, content, Array.isArray(tags) ? tags.slice(0, 8) : []);
    const updated = await findDiscussionById(id);
    res.json({ discussion: updated });
  })
);

router.delete(
  '/discussions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && discussion.author_id !== req.user!.id) throw new ApiError(403, 'Forbidden');

    await softDeleteDiscussion(id);
    res.json({ message: 'Discussion deleted' });
  })
);

router.post(
  '/discussions/:id/like',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    await likeDiscussion(id);
    await incrementProfileLikesReceived(discussion.author_id);
    res.json({ message: 'Liked' });
  })
);

router.post(
  '/discussions/:id/mark-solved',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && discussion.author_id !== req.user!.id) throw new ApiError(403, 'Forbidden');

    await markSolved(id);
    res.json({ message: 'Marked as solved' });
  })
);

// ---------- Comments ----------

router.post(
  '/discussions/:id/comments',
  requireActiveSubscription,
  asyncHandler(async (req: Request, res: Response) => {
    const discussionId = Number(req.params.id);
    const discussion = await findDiscussionById(discussionId);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    const viewerTier = isAdmin ? null : await getViewerTier(req.user!.id);
    if (!isAdmin && !categoryReadableByTier(discussion.category, viewerTier)) {
      throw new ApiError(403, 'Forbidden: this forum is not available for your subscription tier');
    }

    // Ask Psikolog Fitri is a Q&A forum, not open discussion - only she (admin)
    // answers. Anyone with subscription can still ask the question itself
    // (creating the discussion), just not reply to one in this category.
    if (discussion.category === 'fitri' && !isAdmin) {
      throw new ApiError(403, 'Hanya Psikolog Fitri yang dapat menjawab di forum ini');
    }

    const { content, isAnonymous } = req.body as { content?: string; isAnonymous?: boolean };
    if (!content) throw new ApiError(400, 'content is required');

    const comment = await createComment(discussionId, req.user!.id, content, Boolean(isAnonymous));
    res.status(201).json({ comment });
  })
);

router.patch(
  '/comments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const comment = await findCommentById(id);
    if (!comment) throw new ApiError(404, 'Comment not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && comment.author_id !== req.user!.id) throw new ApiError(403, 'Forbidden');
    if (!isAdmin && !withinEditWindow(comment.created_at)) {
      throw new ApiError(400, 'Comments can only be edited within 24 hours of posting');
    }

    const { content } = req.body as { content?: string };
    if (!content) throw new ApiError(400, 'content is required');

    await updateComment(id, content);
    res.json({ message: 'Comment updated' });
  })
);

router.delete(
  '/comments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const comment = await findCommentById(id);
    if (!comment) throw new ApiError(404, 'Comment not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && comment.author_id !== req.user!.id) throw new ApiError(403, 'Forbidden');

    await softDeleteComment(id, comment.discussion_id);
    res.json({ message: 'Comment deleted' });
  })
);

router.post(
  '/comments/:id/like',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const comment = await findCommentById(id);
    if (!comment) throw new ApiError(404, 'Comment not found');

    await likeComment(id);
    await incrementProfileLikesReceived(comment.author_id);
    res.json({ message: 'Liked' });
  })
);

router.post(
  '/comments/:id/mark-helpful',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const comment = await findCommentById(id);
    if (!comment) throw new ApiError(404, 'Comment not found');

    const discussion = await findDiscussionById(comment.discussion_id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && discussion.author_id !== req.user!.id) {
      throw new ApiError(403, 'Only the discussion author can mark a reply as helpful');
    }

    await markCommentHelpful(id);
    await incrementProfileHelpful(comment.author_id);
    res.json({ message: 'Marked as helpful' });
  })
);

// ---------- Reports ----------

router.post(
  '/report',
  asyncHandler(async (req: Request, res: Response) => {
    const { contentId, contentType, reason, details } = req.body as {
      contentId?: number;
      contentType?: ReportContentType;
      reason?: ReportReason;
      details?: string;
    };
    if (!contentId || !contentType || !reason) {
      throw new ApiError(400, 'contentId, contentType, and reason are required');
    }
    const report = await createReport(contentId, contentType, req.user!.id, reason, details ?? null);
    res.status(201).json({ report });
  })
);

// ---------- Profiles ----------

router.get(
  '/profile/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const user = await findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const profile = (await findProfileByUserId(userId)) ?? (await ensureProfile(userId));
    const discussionCount = await countDiscussionsByUser(userId);
    const commentCount = await countCommentsByUser(userId);
    const sub = await findActiveSubscriptionByUserId(userId);

    res.json({
      user: toPublicUser(user),
      profile,
      tier: sub?.tier ?? null,
      discussionsCount: discussionCount?.count ?? 0,
      commentsCount: commentCount?.count ?? 0,
    });
  })
);

router.patch(
  '/profile/me',
  asyncHandler(async (req: Request, res: Response) => {
    const { bio } = req.body as { bio?: string };
    if (bio === undefined) throw new ApiError(400, 'bio is required');
    const profile = await updateBio(req.user!.id, bio);
    res.json({ profile });
  })
);

router.get(
  '/profiles/champions',
  asyncHandler(async (_req: Request, res: Response) => {
    const champions = await findChampions();
    const withUsers = await Promise.all(
      champions.map(async (c) => {
        const user = await findUserById(c.user_id);
        return { profile: c, user: user ? toPublicUser(user) : null };
      })
    );
    res.json({ champions: withUsers });
  })
);

// ---------- My activity ----------

router.get(
  '/myactivity',
  asyncHandler(async (req: Request, res: Response) => {
    const discussions = await findDiscussionsByUserId(req.user!.id);
    const comments = await findCommentsByUserId(req.user!.id);
    res.json({ discussions, comments });
  })
);

// ---------- Stats ----------

router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const discussionCount = await countDiscussions();
    res.json({ totalDiscussions: discussionCount?.count ?? 0 });
  })
);

router.get(
  '/stats/user',
  asyncHandler(async (req: Request, res: Response) => {
    const discussionCount = await countDiscussionsByUser(req.user!.id);
    const commentCount = await countCommentsByUser(req.user!.id);
    const profile = (await findProfileByUserId(req.user!.id)) ?? (await ensureProfile(req.user!.id));
    res.json({
      discussionsCount: discussionCount?.count ?? 0,
      commentsCount: commentCount?.count ?? 0,
      helpfulCount: profile.helpful_count,
      likesReceived: profile.likes_received,
      isChampion: Boolean(profile.is_champion),
    });
  })
);

export default router;
