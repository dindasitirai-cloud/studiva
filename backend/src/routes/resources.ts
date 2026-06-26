import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { findAllResources, findResourceById, createResource } from '../models/Resource';
import { ResourceCategory, ResourceFormat } from '../types';

const router = Router();

const VALID_CATEGORIES: ResourceCategory[] = ['Sensory', 'Social', 'Behavior', 'Academic', 'Therapy'];
const VALID_FORMATS: ResourceFormat[] = ['article', 'video', 'checklist', 'template'];

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as ResourceCategory | undefined;
    if (category && !VALID_CATEGORIES.includes(category)) {
      throw new ApiError(400, 'Invalid category');
    }
    const resources = await findAllResources(category);
    res.json({ resources });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const resource = await findResourceById(id);
    if (!resource) throw new ApiError(404, 'Resource not found');
    res.json({ resource });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, content, category, format, author, publishedDate } = req.body as {
      title?: string;
      description?: string;
      content?: string;
      category?: ResourceCategory;
      format?: ResourceFormat;
      author?: string;
      publishedDate?: string;
    };

    if (!title || !description || !content || !category || !format || !author || !publishedDate) {
      throw new ApiError(400, 'All fields are required');
    }
    if (!VALID_CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid category');
    if (!VALID_FORMATS.includes(format)) throw new ApiError(400, 'Invalid format');

    const resource = await createResource(title, description, content, category, format, author, publishedDate);
    res.status(201).json({ resource });
  })
);

export default router;
