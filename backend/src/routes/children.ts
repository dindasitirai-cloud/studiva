import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import {
  createChild,
  findChildById,
  findChildrenByParentId,
  findChildrenByTeacherId,
  updateChild,
  isTeacherAssignedToChild,
} from '../models/Child';

const router = Router();

router.use(authenticate);
router.use(requireActiveSubscription);

async function canAccessChild(req: Request, childId: number): Promise<boolean> {
  const child = await findChildById(childId);
  if (!child) return false;
  if (req.user!.role === 'admin') return true;
  if (req.user!.role === 'parent') return child.parent_id === req.user!.id;
  if (req.user!.role === 'teacher') return isTeacherAssignedToChild(req.user!.id, childId);
  return false;
}

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role === 'parent') {
      const children = await findChildrenByParentId(req.user!.id);
      res.json({ children });
      return;
    }
    if (req.user!.role === 'teacher') {
      const children = await findChildrenByTeacherId(req.user!.id);
      res.json({ children });
      return;
    }
    throw new ApiError(403, 'Forbidden');
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!(await canAccessChild(req, id))) {
      throw new ApiError(403, 'Forbidden: you do not have access to this child profile');
    }
    const child = await findChildById(id);
    if (!child) throw new ApiError(404, 'Child not found');
    res.json({ child });
  })
);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role !== 'parent' && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Only parents can add a child');
    }
    const { name, age, learningStyle, parentId } = req.body as {
      name?: string;
      age?: number;
      learningStyle?: string;
      parentId?: number;
    };
    if (!name || age === undefined) {
      throw new ApiError(400, 'Name and age are required');
    }
    const ownerId = req.user!.role === 'admin' && parentId ? parentId : req.user!.id;
    const child = await createChild(name, age, learningStyle ?? null, ownerId);
    res.status(201).json({ child });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!(await canAccessChild(req, id)) || req.user!.role === 'teacher') {
      throw new ApiError(403, 'Forbidden');
    }
    const { name, age, learningStyle, emergencyContact } = req.body as {
      name?: string;
      age?: number;
      learningStyle?: string;
      emergencyContact?: string;
    };
    if (!name || age === undefined) {
      throw new ApiError(400, 'Name and age are required');
    }
    const child = await updateChild(id, name, age, learningStyle ?? null, emergencyContact);
    res.json({ child });
  })
);

export default router;
