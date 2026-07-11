import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { lsGetAll, lsGetById, lsCreate, lsUpdate, lsDelete, lsCount } from '../models/LearningStrategies';

const router = Router();
type ContentType = 'activities' | 'plans' | 'tools' | 'downloads';
const VALID_TYPES: ContentType[] = ['activities', 'plans', 'tools', 'downloads'];

function resolveType(req: Request): ContentType {
  const t = req.params.type as ContentType;
  if (!VALID_TYPES.includes(t)) throw new ApiError(400, 'Invalid content type');
  return t;
}

// ── Admin: check seeded status (for auto-seed from frontend) ─────────────────

router.get(
  '/admin/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (_req: Request, res: Response) => {
    const counts = {
      activities: await lsCount('activities'),
      plans:      await lsCount('plans'),
      tools:      await lsCount('tools'),
      downloads:  await lsCount('downloads'),
    };
    res.json({ counts, seeded: Object.values(counts).some(c => c > 0) });
  })
);

// ── Public: get published items by type ──────────────────────────────────────

router.get(
  '/:type',
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const items = await lsGetAll(type, 'published');
    res.json({ items });
  })
);

// ── Admin: get all items (all statuses) ──────────────────────────────────────

router.get(
  '/admin/:type',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const status = req.query.status as string | undefined;
    const items = await lsGetAll(type, status);
    res.json({ items });
  })
);

// ── Admin: create ─────────────────────────────────────────────────────────────

router.post(
  '/admin/:type',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const { id, status, ...rest } = req.body as Record<string, unknown>;
    if (!id || typeof id !== 'number') throw new ApiError(400, 'id (number) is required');
    const item = await lsCreate(type, id, { id, ...rest }, (status as string) ?? 'published');
    res.status(201).json({ item });
  })
);

// ── Admin: bulk upsert (for seeding) ─────────────────────────────────────────

router.post(
  '/admin/:type/bulk',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const { items } = req.body as { items: Array<{ id: number; [key: string]: unknown }> };
    if (!Array.isArray(items)) throw new ApiError(400, 'items array is required');
    for (const item of items) {
      const { id, status = 'published', ...rest } = item;
      await lsCreate(type, id, { id, ...rest }, status as string);
    }
    res.json({ count: items.length });
  })
);

// ── Admin: update ─────────────────────────────────────────────────────────────

router.put(
  '/admin/:type/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');
    const { status, ...rest } = req.body as Record<string, unknown>;
    const item = await lsUpdate(type, id, { data: rest, status: status as string | undefined });
    if (!item) throw new ApiError(404, 'Item not found');
    res.json({ item });
  })
);

// ── Admin: patch status ───────────────────────────────────────────────────────

router.patch(
  '/admin/:type/:id/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');
    const { status } = req.body as { status: string };
    if (!['draft', 'published'].includes(status)) throw new ApiError(400, 'status must be draft or published');
    const item = await lsUpdate(type, id, { status });
    if (!item) throw new ApiError(404, 'Item not found');
    res.json({ item });
  })
);

// ── Admin: delete ─────────────────────────────────────────────────────────────

router.delete(
  '/admin/:type/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const type = resolveType(req);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');
    await lsDelete(type, id);
    res.json({ ok: true });
  })
);

export default router;
