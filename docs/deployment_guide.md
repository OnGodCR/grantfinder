# Beginner-Friendly Deployment Guide (GrantFinder)

This guide assumes **no coding experience**. Follow steps exactly. You’ll set up accounts, copy/paste keys, and click buttons. If something is unclear, re-read and don’t skip steps.

---

## Part 0 — Create Accounts (free tiers ok)
1) **GitHub**: https://github.com (click Sign up).
2) **Vercel**: https://vercel.com (login with GitHub).
3) **Neon (Postgres)**: https://neon.tech (create a serverless Postgres DB).
4) **Clerk** (Auth): https://clerk.com (create an application).
5) **Stripe** (Payments): https://dashboard.stripe.com/register (activate test mode).
6) **OpenAI** (AI): https://platform.openai.com (create API key).

---

## Part 1 — Get the Project Code
1) Download the ZIP I provided and unzip it to your computer.
2) Open **GitHub** → create a new repository named `grantfinder` → click **Upload files** → drag the unzipped folder contents and **Commit**.
3) You now have the code in GitHub.

---

## Part 2 — Database (Neon Postgres with pgvector)
1) In **Neon**, create a project named `grantfinder`.
2) Copy the **connection string** like:  
   `postgresql://user:password@host/dbname`
3) Enable **pgvector** (Neon supports it by default). You’ll run a command later that creates the extension.
4) Save this string; you’ll paste it into the backend `.env` later.

> Tip: For local testing, you can also run `docker compose up -d` to start Postgres on your machine.

---

## Part 3 — Configure Clerk (Authentication)
1) In **Clerk Dashboard** → **Create Application**.
2) Copy the **Publishable Key** and **Secret Key**.
3) In **Frontend** settings, set allowed redirect URLs for Next.js defaults (Clerk guides show exact URLs; keep defaults).
4) You’ll paste keys into Frontend and Backend env files.

---

## Part 4 — Configure Stripe (Payments)
1) In **Stripe Dashboard** → **Products** → **+ Add product** (e.g., “University Plan”).  
   - Add a **Recurring Price** (e.g., $499/month). Save.
2) Copy the **Price ID** (looks like `price_...`).
3) In **Developers** → **API keys** → copy **Secret key**.
4) In **Developers** → **Webhooks** → we’ll add URL later after deploying backend.

---

## Part 5 — Configure OpenAI
1) In **OpenAI** → create a **secret API key**. Keep it safe.
2) You’ll paste into Backend `.env`.

---

## Part 6 — Deploy Backend (Railway or Render or Fly — choose Railway for simplicity)
We’ll use **Railway** (https://railway.app) to host the backend easily.
1) Sign up with GitHub, click **New Project** → **Deploy from GitHub repo** → choose `grantfinder`.
2) After it builds, go to **Variables** and add the following **Environment Variables** (copy from `backend/.env.example`):
   - `DATABASE_URL` = your Neon connection string (append `?sslmode=require` if needed).
   - `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (from Clerk).
   - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (for now put a placeholder; we’ll set the real webhook secret after step 7).
   - `STRIPE_PRICE_ID` (from Stripe).
   - `OPENAI_API_KEY` (from OpenAI).
   - `PORT` = `4000`
   - `APP_URL` = the Railway URL (e.g., `https://grantfinder-backend.up.railway.app`)
   - `FRONTEND_URL` = the Vercel URL (you’ll update later)
   - `INTERNAL_API_TOKEN` = make a long random string (save it for the scraper).
3) Go to **Deployments**; click **Redeploy** if you changed envs.
4) **Run Prisma migrations**: open Railway’s web shell → run:
   ```bash
   npx prisma migrate deploy
   ```
5) (Optional) **Seed data**:
   ```bash
   npm run seed
   ```

**Enable pgvector** (first migration will include the Vector type). If Neon requires it explicitly, run in SQL console:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Note**: Some Prisma versions need manual support for pgvector ops; this scaffold stores embeddings and uses raw SQL for similarity as an example.

---

## Part 7 — Stripe Webhook
1) In **Stripe** → **Developers** → **Webhooks** → **Add endpoint**.
2) Endpoint URL: `https://YOUR-BACKEND-URL/api/webhooks/stripe`
3) Select events: **customer.subscription.created**, **updated**, **deleted**, **checkout.session.completed**.
4) After creating, copy the **Signing secret**: `whsec_...`
5) In **Railway Variables**, set `STRIPE_WEBHOOK_SECRET` to this value and redeploy.

---

## Part 8 — Deploy Frontend (Vercel)
1) In **Vercel**, click **Add New… → Project** → import your GitHub repo `grantfinder`.
2) Root directory: set to `frontend`
3) Environment Variables (from `frontend/.env.local.example`):
   - `NEXT_PUBLIC_BACKEND_URL` = your Railway backend URL + `/api` (e.g., `https://grantfinder-backend.up.railway.app/api`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY` (server-side needs this in Vercel too)
4) Deploy. After it’s live, copy your Vercel URL and update **Railway’s** `FRONTEND_URL` env with it, then redeploy backend.

**Custom Domain**: In Vercel, add your domain (e.g., `grants.youruniversity.edu`) and follow DNS instructions.

---

## Part 9 — Connect Frontend Auth to Clerk
1) In **Clerk Dashboard → Allowed Origins**, add your Vercel URL.
2) Test sign-in/sign-up on your live site.

---

## Part 10 — Run the Scraper in the Cloud (Railway Cron or GitHub Actions)
**Option A: Railway Cron**
1) Create a new Railway **Service** → **Deploy from GitHub** but set root directory to `scraper`.
2) Set envs:
   - `BACKEND_INTERNAL_URL` = `https://YOUR-BACKEND-URL/api/internal/grants`
   - `INTERNAL_API_TOKEN` = the same value as backend
3) Add a **Cron Job** (Railway → Cron) to run `python scraper.py` daily.

**Option B: GitHub Actions**
- Create a workflow that runs `scraper/scraper.py` on a schedule with repository secrets.

---

## Part 11 — Onboarding Institutions & Users
- Create institutions manually in DB (or add an Admin UI later).
- Invite researchers; when they sign up via Clerk, store their `clerkUserId` in `User` table during onboarding (you can add a small API in backend to “attach” the clerk user to an institution).

---

## Part 12 — Email Notifications (Optional)
- Use Resend or SendGrid. Add an endpoint to fetch matching users by embedding similarity and send a digest.
- Start with **in-app notifications** only (already modeled).

---

## Part 13 — Production Checklist
- Add **role checks** (only ADMIN can access `/api/admin/*`).
- Add **rate limiting** (e.g., `express-rate-limit`).
- Add **logging & monitoring** (pino + a log shipper, or APM like Sentry).
- Add **backups** (enable Neon auto backups).
- **Compliance**: post a Privacy Policy & DPA, ensure data isolation if required.
- **Support**: set up a support email and status page.

You now have a functional scaffold that: authenticates users, stores profiles, scrapes grants via RSS, auto-summarizes & embeds using OpenAI, and searches by similarity.
