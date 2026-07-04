import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './database';
import { notFoundHandler, errorHandler, asyncHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import childrenRoutes from './routes/children';
import updatesRoutes from './routes/updates';
import resourcesRoutes from './routes/resources';
import paymentsRoutes, { handleStripeWebhook } from './routes/payments';
import subscriptionsRoutes from './routes/subscriptions';
import consultationsRoutes from './routes/consultations';
import adminRoutes from './routes/admin';
import enrollmentRoutes from './routes/enrollment';
import communityRoutes from './routes/community';
import adminProfilesRoutes from './routes/adminProfiles';
import knowledgeCardsRouter from './routes/knowledgeCards';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the configured frontend origin, localhost for development, and any
// Vercel preview deployment for this project (random-subdomain URLs like
// studiva-<hash>-raisha.vercel.app), rather than a wildcard "*" origin.
const VERCEL_PREVIEW_PATTERN = /^https:\/\/studiva-[a-z0-9-]+\.vercel\.app$/;
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || VERCEL_PREVIEW_PATTERN.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
  })
);

// Stripe webhook needs the raw request body to verify the signature, so it
// must be registered before the global JSON body parser below.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleStripeWebhook));

app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin-profiles', adminProfilesRoutes);
app.use('/api/knowledge-cards', knowledgeCardsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Studiva backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
