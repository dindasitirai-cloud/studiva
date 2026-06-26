import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { findChildById } from '../models/Child';
import {
  createEnrollmentRequest,
  findEnrollmentRequestsByUserId,
} from '../models/EnrollmentRequest';

const router = Router();

router.use(authenticate);
router.use(requireRole('parent'));

router.post(
  '/request',
  asyncHandler(async (req: Request, res: Response) => {
    const { childId, message } = req.body as { childId?: number; message?: string };
    if (!childId) throw new ApiError(400, 'childId is required');

    const child = await findChildById(childId);
    if (!child || child.parent_id !== req.user!.id) {
      throw new ApiError(403, 'Forbidden: this is not your child');
    }
    if (child.enrollment_status === 'enrolled_tier1') {
      throw new ApiError(400, 'This child is already enrolled in Tier 1');
    }

    const request = await createEnrollmentRequest(req.user!.id, childId, message ?? null);
    res.status(201).json({ request });
  })
);

router.get(
  '/my-requests',
  asyncHandler(async (req: Request, res: Response) => {
    const requests = await findEnrollmentRequestsByUserId(req.user!.id);
    res.json({ requests });
  })
);

export default router;
