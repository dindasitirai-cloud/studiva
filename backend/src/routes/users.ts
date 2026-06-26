import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { findUserById, updateUser, toPublicUser } from '../models/User';

const router = Router();

router.use(authenticate);

router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: toPublicUser(user) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      throw new ApiError(403, 'Forbidden');
    }
    const user = await findUserById(id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: toPublicUser(user) });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      throw new ApiError(403, 'Forbidden');
    }
    const { name } = req.body as { name?: string };
    if (!name) throw new ApiError(400, 'Name is required');
    const user = await updateUser(id, name);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: toPublicUser(user) });
  })
);

export default router;
