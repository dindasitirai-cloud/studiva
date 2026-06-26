import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { stripe } from '../lib/stripe';
import {
  findActiveSubscriptionByUserId,
  findLatestSubscriptionByUserId,
  updateSubscriptionStatus,
} from '../models/Subscription';

const router = Router();

router.use(authenticate);

router.get(
  '/check',
  asyncHandler(async (req: Request, res: Response) => {
    const subscription = await findActiveSubscriptionByUserId(req.user!.id);
    if (!subscription) {
      res.json({ hasSubscription: false, tier: null, expiresAt: null });
      return;
    }
    res.json({ hasSubscription: true, tier: subscription.tier, expiresAt: subscription.end_date });
  })
);

router.get(
  '/my-subscription',
  asyncHandler(async (req: Request, res: Response) => {
    const subscription = await findLatestSubscriptionByUserId(req.user!.id);
    res.json({ subscription: subscription ?? null });
  })
);

router.post(
  '/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const subscription = await findActiveSubscriptionByUserId(req.user!.id);
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }

    if (subscription.payment_method === 'stripe' && subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (err) {
        console.error('Failed to cancel Stripe subscription:', err);
      }
    }

    await updateSubscriptionStatus(subscription.id, 'canceled');
    res.json({ message: 'Subscription canceled' });
  })
);

export default router;
