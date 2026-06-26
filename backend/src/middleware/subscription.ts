import { Request, Response, NextFunction } from 'express';
import { findActiveSubscriptionByUserId } from '../models/Subscription';
import { Tier } from '../types';
import { ApiError } from './errorHandler';

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role === 'admin') {
      next();
      return;
    }

    const requiredTiers: Tier[] = req.user!.role === 'teacher' ? ['tier1'] : ['tier1', 'tier2'];
    const subscription = await findActiveSubscriptionByUserId(req.user!.id);

    if (!subscription || !requiredTiers.includes(subscription.tier)) {
      throw new ApiError(402, 'Active subscription required to access this feature');
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Unlike requireActiveSubscription (which picks allowed tiers based on role),
// this enforces an exact tier list regardless of role. Use for features that are
// only meaningful for one tier (e.g. daily updates / teacher messages are Tier 1
// only, even though a parent's role alone would otherwise allow Tier 2 too).
export function requireTier(...tiers: Tier[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user!.role === 'admin') {
        next();
        return;
      }

      const subscription = await findActiveSubscriptionByUserId(req.user!.id);
      if (!subscription || !tiers.includes(subscription.tier)) {
        throw new ApiError(402, `This feature requires an active ${tiers.join(' or ')} subscription`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
