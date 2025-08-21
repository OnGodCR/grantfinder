import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { env } from './env.js';
import health from './routes/health.js';
import grants from './routes/grants.js';
import profiles from './routes/profiles.js';
import collections from './routes/collections.js';
import admin from './routes/admin.js';
import stripeRoutes from './routes/stripe.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: [env.FRONTEND_URL], credentials: true }));
app.use(bodyParser.json({ limit: '2mb' }));

app.use('/api', health);
app.use('/api', grants);
app.use('/api', profiles);
app.use('/api', collections);
app.use('/api', admin);
app.use('/api', stripeRoutes);

app.listen(env.PORT, () => {
  console.log(`Backend listening on ${env.PORT}`);
});
