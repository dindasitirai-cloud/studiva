import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { AuthTokenPayload, UserRole } from '../types';
import { findUserByEmail } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Payload mentah dari Supabase JWT (HS256 dengan SUPABASE_JWT_SECRET)
interface SupabaseJwtPayload {
  sub: string;       // UUID pengguna Supabase
  email: string;
  role: string;      // 'authenticated' atau 'anon'
  app_metadata?: { role?: UserRole };
  user_metadata?: { name?: string };
  aud: string;
  iat: number;
  exp: number;
}

// Supabase admin client — dibuat lazy agar env vars sudah dimuat dotenv
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  // 1. Coba verifikasi sebagai Supabase JWT via admin client
  //    (mendukung ES256 dan HS256 secara otomatis — tidak menulis kriptografi sendiri)
  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    supabaseAdmin.auth.getUser(token).then(({ data: { user }, error }) => {
      if (!error && user) {
        req.user = {
          id: -1,
          email: user.email ?? '',
          role: (user.app_metadata?.role as UserRole) ?? 'parent',
          name: (user.user_metadata?.name as string) ?? '',
        };

        findUserByEmail(user.email ?? '')
          .then(dbUser => {
            if (dbUser && req.user) req.user = { ...req.user, id: dbUser.id };
          })
          .catch(() => {})
          .finally(() => next());
        return;
      }

      // Supabase tidak mengenali token — coba JWT Express lama
      tryLegacyJwt(token, req, res, next);
    }).catch(() => {
      tryLegacyJwt(token, req, res, next);
    });
    return;
  }

  // 2. Fallback ke JWT Express lama (selama periode migrasi)
  tryLegacyJwt(token, req, res, next);
}

function tryLegacyJwt(token: string, req: Request, res: Response, next: NextFunction): void {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

export function signToken(payload: AuthTokenPayload): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}
