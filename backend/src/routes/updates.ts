import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { requireTier } from '../middleware/subscription';
import { findChildById, isTeacherAssignedToChild } from '../models/Child';
import {
  createUpdate,
  findUpdatesByChildId,
  findUpdateById,
  deleteUpdate,
  createParentInsight,
} from '../models/Update';
import { UpdateCategory } from '../types';

const router = Router();

// Daily updates / teacher messages / therapy notes are a Tier 1 (school) feature.
// A Tier 2-only parent has no enrolled child in the school workflow, so they don't
// get this even though they have an active subscription of some kind.
router.use(authenticate);
router.use(requireTier('tier1'));

const VALID_CATEGORIES: UpdateCategory[] = ['academics', 'behavior', 'therapy', 'social'];

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const childId = Number(req.query.childId);
    if (!childId) throw new ApiError(400, 'childId query parameter is required');

    const child = await findChildById(childId);
    if (!child) throw new ApiError(404, 'Child not found');

    const isOwnerParent = req.user!.role === 'parent' && child.parent_id === req.user!.id;
    const isAssignedTeacher =
      req.user!.role === 'teacher' && (await isTeacherAssignedToChild(req.user!.id, childId));
    const isAdmin = req.user!.role === 'admin';

    if (!isOwnerParent && !isAssignedTeacher && !isAdmin) {
      throw new ApiError(403, 'Forbidden: you do not have access to this child\'s updates');
    }

    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const updates = await findUpdatesByChildId(childId, limit);
    res.json({ updates });
  })
);

router.post(
  '/',
  requireRole('teacher', 'admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { childId, content, photos, category, date } = req.body as {
      childId?: number;
      content?: string;
      photos?: string;
      category?: UpdateCategory;
      date?: string;
    };

    if (!childId || !content || !category || !date) {
      throw new ApiError(400, 'childId, content, category, and date are required');
    }
    if (!VALID_CATEGORIES.includes(category)) {
      throw new ApiError(400, 'Invalid category');
    }

    const child = await findChildById(childId);
    if (!child) throw new ApiError(404, 'Child not found');

    if (req.user!.role === 'teacher' && !(await isTeacherAssignedToChild(req.user!.id, childId))) {
      throw new ApiError(403, 'Forbidden: you are not assigned to this child');
    }

    const update = await createUpdate(childId, req.user!.id, content, photos ?? null, category, date);
    res.status(201).json({ update });
  })
);

router.delete(
  '/:id',
  requireRole('teacher', 'admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const update = await findUpdateById(id);
    if (!update) throw new ApiError(404, 'Update not found');

    if (req.user!.role === 'teacher' && update.teacher_id !== req.user!.id) {
      throw new ApiError(403, 'Forbidden: you can only delete your own updates');
    }

    await deleteUpdate(id);
    res.json({ message: 'Update deleted' });
  })
);

router.post(
  '/insights',
  requireRole('parent'),
  asyncHandler(async (req: Request, res: Response) => {
    const { childId, content, date } = req.body as { childId?: number; content?: string; date?: string };
    if (!childId || !content || !date) {
      throw new ApiError(400, 'childId, content, and date are required');
    }
    const child = await findChildById(childId);
    if (!child || child.parent_id !== req.user!.id) {
      throw new ApiError(403, 'Forbidden: this is not your child');
    }
    const insight = await createParentInsight(childId, req.user!.id, content, date);
    res.status(201).json({ insight });
  })
);

export default router;
