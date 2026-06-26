import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment endpoints will fail until it is configured in backend/.env.');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || 'sk_test_placeholder');
