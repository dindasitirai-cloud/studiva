import { run, get, all } from '../database';
import { Subscription, Tier, Plan, SubscriptionStatus, PaymentMethod } from '../types';

export async function createSubscription(
  userId: number,
  tier: Tier,
  plan: Plan,
  status: SubscriptionStatus,
  startDate: string,
  endDate: string,
  paymentMethod: PaymentMethod,
  stripeSubscriptionId: string | null,
  amountPaid: number
): Promise<Subscription> {
  const result = await run(
    `INSERT INTO subscriptions
      (user_id, tier, plan, status, start_date, end_date, payment_method, stripe_subscription_id, amount_paid)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, tier, plan, status, startDate, endDate, paymentMethod, stripeSubscriptionId, amountPaid]
  );
  const subscription = await get<Subscription>('SELECT * FROM subscriptions WHERE id = ?', [result.lastID]);
  if (!subscription) throw new Error('Failed to create subscription');
  return subscription;
}

export function findActiveSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  return get<Subscription>(
    `SELECT * FROM subscriptions
     WHERE user_id = ? AND status = 'active' AND end_date >= date('now')
     ORDER BY end_date DESC LIMIT 1`,
    [userId]
  );
}

export function findLatestSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  return get<Subscription>(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
}

export function findSubscriptionById(id: number): Promise<Subscription | undefined> {
  return get<Subscription>('SELECT * FROM subscriptions WHERE id = ?', [id]);
}

export function findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
  return get<Subscription>('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?', [stripeSubscriptionId]);
}

export async function updateSubscriptionStatus(id: number, status: SubscriptionStatus): Promise<void> {
  await run('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
}

export function findAllSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
  return all<Subscription>('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}
