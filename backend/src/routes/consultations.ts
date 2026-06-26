import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import { findChildById, isTeacherAssignedToChild } from '../models/Child';
import {
  createConsultation,
  findConsultationById,
  findConsultationsByUserId,
  updateConsultationStatus,
} from '../models/Consultation';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { getConsultationConfig } from '../lib/consultationConfig';
import { ConsultationType } from '../types';

const router = Router();

router.use(authenticate);
router.use(requireActiveSubscription);

const VALID_TYPES: ConsultationType[] = ['online', 'offline'];

router.get('/config', (_req: Request, res: Response) => {
  res.json(getConsultationConfig());
});

router.get('/available-slots', (_req: Request, res: Response) => {
  res.json({ message: 'Contact via WhatsApp for availability', slots: [] });
});

router.post(
  '/request',
  asyncHandler(async (req: Request, res: Response) => {
    const { childId, consultationType, notes } = req.body as {
      childId?: number;
      consultationType?: ConsultationType;
      notes?: string;
    };

    if (!childId || !consultationType) {
      throw new ApiError(400, 'childId and consultationType are required');
    }
    if (!VALID_TYPES.includes(consultationType)) {
      throw new ApiError(400, 'Invalid consultationType');
    }

    const child = await findChildById(childId);
    if (!child) throw new ApiError(404, 'Child not found');

    const isOwnerParent = req.user!.role === 'parent' && child.parent_id === req.user!.id;
    const isAssignedTeacher =
      req.user!.role === 'teacher' && (await isTeacherAssignedToChild(req.user!.id, childId));
    if (!isOwnerParent && !isAssignedTeacher && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: this is not your child');
    }

    const consultation = await createConsultation(req.user!.id, childId, consultationType, notes ?? null);
    const whatsappLink = generateWhatsAppLink(child.name, consultationType, notes);

    res.status(201).json({ consultation, whatsappLink });
  })
);

router.get(
  '/my-bookings',
  asyncHandler(async (req: Request, res: Response) => {
    const consultations = await findConsultationsByUserId(req.user!.id);
    res.json({ consultations });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const consultation = await findConsultationById(id);
    if (!consultation) throw new ApiError(404, 'Consultation not found');
    if (consultation.user_id !== req.user!.id) throw new ApiError(403, 'Forbidden');
    if (consultation.status !== 'pending') {
      throw new ApiError(400, 'Only pending consultations can be canceled');
    }

    await updateConsultationStatus(id, 'canceled');
    res.json({ message: 'Consultation canceled' });
  })
);

export default router;
