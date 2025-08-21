import { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../env.js';
import { prisma } from '../prisma.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const r = Router();

// Checkout session for institution subscription (admin use)
r.post('/billing/create-checkout-session', async (req, res) => {
  const { institutionId } = req.body;
  if (!institutionId) return res.status(400).json({ error: 'Missing institutionId' });
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/billing/success`,
    cancel_url: `${env.FRONTEND_URL}/billing/cancel`,
  });
  res.json({ url: session.url });
});

// Stripe webhook
r.post('/webhooks/stripe', express.raw({ type: 'application/json' }) as any, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent((req as any).body, sig as string, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // TODO: link to Institution via metadata if needed
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default r;
