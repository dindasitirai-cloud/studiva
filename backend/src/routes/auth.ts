import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { createUser, findUserByEmail, toPublicUser } from '../models/User';
import { createChild } from '../models/Child';
import { signToken } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: UserRole[] = ['parent', 'teacher'];

router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role, childName, childAge } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
      childName?: string;
      childAge?: number;
    };

    if (!email || !password || !name || !role) {
      throw new ApiError(400, 'Email, password, name, and role are required');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }
    if (!VALID_ROLES.includes(role)) {
      throw new ApiError(400, 'Role must be parent or teacher');
    }
    if (role === 'parent' && !childName) {
      throw new ApiError(400, "Child's name is required for parent signup");
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, role, name);

    if (role === 'parent' && childName) {
      await createChild(childName, childAge ?? 0, null, user.id);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.status(201).json({ token, user: toPublicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.get(
  '/verify',
  authenticate,
  (req: Request, res: Response) => {
    res.json({ user: req.user });
  }
);

export default router;
