import 'dotenv/config';

function required(name: string, def?: string) {
  const v = process.env[name] ?? def;
  if (!v) {
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  CLERK_PUBLISHABLE_KEY: required('CLERK_PUBLISHABLE_KEY'),
  CLERK_SECRET_KEY: required('CLERK_SECRET_KEY'),
  STRIPE_SECRET_KEY: required('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: required('STRIPE_WEBHOOK_SECRET'),
  STRIPE_PRICE_ID: required('STRIPE_PRICE_ID'),
  OPENAI_API_KEY: required('OPENAI_API_KEY'),
  PORT: parseInt(required('PORT', '4000')),
  APP_URL: required('APP_URL', 'http://localhost:4000'),
  FRONTEND_URL: required('FRONTEND_URL', 'http://localhost:3000'),
  INTERNAL_API_TOKEN: required('INTERNAL_API_TOKEN'),
};
