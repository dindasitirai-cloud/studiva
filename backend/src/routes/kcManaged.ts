import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { kcGetAll, kcGetById, kcUpsert, kcUpdate, kcDelete, kcCount } from '../models/KcManaged';

const router = Router();

// ── Admin: check seeded status ────────────────────────────────────────────────

router.get(
  '/admin/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await kcCount();
    res.json({ count, seeded: count > 0 });
  })
);

// ── Public: get published cards ───────────────────────────────────────────────

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const cards = await kcGetAll('published');
    res.json({ cards });
  })
);

// ── Admin: get all cards (all statuses) ──────────────────────────────────────

router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (_req: Request, res: Response) => {
    const cards = await kcGetAll();
    res.json({ cards });
  })
);

// ── Admin: bulk upsert (seed from frontend static data) ───────────────────────

router.post(
  '/admin/bulk',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { items } = req.body as { items: Array<{ id: string; adminStatus?: string; [key: string]: unknown }> };
    if (!Array.isArray(items)) throw new ApiError(400, 'items array is required');
    for (const item of items) {
      const { id, adminStatus, ...rest } = item;
      const status = adminStatus === 'draft' ? 'draft' : 'published';
      await kcUpsert(id, { id, ...rest }, status);
    }
    res.json({ count: items.length });
  })
);

// ── Admin: create / upsert single card ────────────────────────────────────────

router.post(
  '/admin',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id, adminStatus, ...rest } = req.body as Record<string, unknown>;
    if (!id || typeof id !== 'string') throw new ApiError(400, 'id (string) is required');
    const status = adminStatus === 'draft' ? 'draft' : 'published';
    const card = await kcUpsert(id as string, { id, ...rest }, status);
    res.status(201).json({ card });
  })
);

// ── Admin: update card ────────────────────────────────────────────────────────

router.put(
  '/admin/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const { adminStatus, ...rest } = req.body as Record<string, unknown>;
    const card = await kcUpdate(id, {
      data: { id, ...rest } as Record<string, unknown>,
      status: adminStatus === 'draft' ? 'draft' : 'published',
    });
    if (!card) throw new ApiError(404, 'Card not found');
    res.json({ card });
  })
);

// ── Admin: patch status ───────────────────────────────────────────────────────

router.patch(
  '/admin/:id/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = req.body as { status: string };
    if (!['draft', 'published'].includes(status)) throw new ApiError(400, 'status must be draft or published');
    const card = await kcUpdate(id, { status });
    if (!card) throw new ApiError(404, 'Card not found');
    res.json({ card });
  })
);

// ── Admin: delete card ────────────────────────────────────────────────────────

router.delete(
  '/admin/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = await kcGetById(id);
    if (!existing) throw new ApiError(404, 'Card not found');
    await kcDelete(id);
    res.json({ ok: true });
  })
);

export default router;
