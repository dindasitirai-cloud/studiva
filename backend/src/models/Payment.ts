import { run, get, all } from '../database';
import { Payment, Currency, PaymentStatus } from '../types';

export async function createPayment(
  userId: number,
  subscriptionId: number,
  amount: number,
  currency: Currency,
  status: PaymentStatus,
  stripePaymentId: string | null,
  paymentDate: string | null
): Promise<Payment> {
  const result = await run(
    `INSERT INTO payments (user_id, subscription_id, amount, currency, status, stripe_payment_id, payment_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, subscriptionId, amount, currency, status, stripePaymentId, paymentDate]
  );
  const payment = await get<Payment>('SELECT * FROM payments WHERE id = ?', [result.lastID]);
  if (!payment) throw new Error('Failed to create payment');
  return payment;
}

export function findPaymentsByUserId(userId: number): Promise<Payment[]> {
  return all<Payment>('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export function sumCompletedPayments(): Promise<{ total: number } | undefined> {
  return get<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'");
}
