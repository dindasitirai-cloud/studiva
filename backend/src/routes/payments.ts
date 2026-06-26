import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../lib/stripe';
import { getPlanInfo, planToStripeRecurring, computeEndDate, TIER_LABELS } from '../lib/pricing';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { createSubscription, findSubscriptionByStripeId, updateSubscriptionStatus } from '../models/Subscription';
import { createPayment } from '../models/Payment';
import { Plan, Tier } from '../types';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const VALID_TIERS: Tier[] = ['tier1', 'tier2'];
const VALID_PLANS: Plan[] = ['monthly', 'quarterly', 'yearly'];

router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { tier, plan } = req.body as { tier?: Tier; plan?: Plan };

    if (!tier || !plan) throw new ApiError(400, 'tier and plan are required');
    if (!VALID_TIERS.includes(tier)) throw new ApiError(400, 'Invalid tier');
    if (!VALID_PLANS.includes(plan)) throw new ApiError(400, 'Invalid plan');

    const planInfo = getPlanInfo(tier, plan);
    const recurring = planToStripeRecurring(plan);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.user!.email,
      client_reference_id: String(req.user!.id),
      metadata: { userId: String(req.user!.id), tier, plan },
      line_items: [
        {
          price_data: {
            currency: 'idr',
            product_data: { name: `Studiva ${TIER_LABELS[tier]} - ${planInfo.label}` },
            unit_amount: planInfo.amount,
            recurring,
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment-failed`,
    });

    res.json({ checkoutUrl: session.url });
  })
);

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (!webhookSecret || !signature) throw new Error('Webhook secret not configured');
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    res.status(400).json({ error: `Webhook signature verification failed: ${(err as Error).message}` });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId);
    const tier = session.metadata?.tier as Tier;
    const plan = session.metadata?.plan as Plan;
    const amount = (session.amount_total ?? 0);
    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;

    if (userId && tier && plan) {
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = computeEndDate(plan, new Date());
      const subscription = await createSubscription(
        userId,
        tier,
        plan,
        'active',
        startDate,
        endDate,
        'stripe',
        stripeSubscriptionId,
        amount
      );
      await createPayment(
        userId,
        subscription.id,
        amount,
        'IDR',
        'completed',
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
        new Date().toISOString()
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSubscription = event.data.object as Stripe.Subscription;
    const subscription = await findSubscriptionByStripeId(stripeSubscription.id);
    if (subscription) {
      await updateSubscriptionStatus(subscription.id, 'canceled');
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
    const stripeSubscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    if (stripeSubscriptionId) {
      const subscription = await findSubscriptionByStripeId(stripeSubscriptionId);
      if (subscription) {
        await updateSubscriptionStatus(subscription.id, 'expired');
      }
    }
  }

  res.json({ received: true });
}

export default router;
