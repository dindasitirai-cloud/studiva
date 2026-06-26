import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { findAdminProfileByUserId, findFeaturedAdminProfiles } from '../models/AdminProfile';
import { findUserById, toPublicUser } from '../models/User';

const router = Router();

// Public - shown on About/Consultation/Footer, which don't require login.
router.get(
  '/featured',
  asyncHandler(async (_req: Request, res: Response) => {
    const profiles = await findFeaturedAdminProfiles();
    const withUsers = await Promise.all(
      profiles.map(async (p) => {
        const user = await findUserById(p.user_id);
        return { profile: p, user: user ? toPublicUser(user) : null };
      })
    );
    res.json({ profiles: withUsers });
  })
);

router.get(
  '/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const profile = await findAdminProfileByUserId(userId);
    if (!profile) throw new ApiError(404, 'Admin profile not found');
    const user = await findUserById(userId);
    res.json({ profile, user: user ? toPublicUser(user) : null });
  })
);

export default router;
