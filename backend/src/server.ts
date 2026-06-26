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

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

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
