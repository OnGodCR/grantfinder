 # GrantFinder — AI-Powered Research Grant Database (Scaffold)

This repository is a production-grade **starter** for a B2B SaaS that helps universities discover and manage research grants. It contains:
- **frontend/** (Next.js + Tailwind + Clerk + Stripe checkout client)
- **backend/** (Node + Express + Prisma + PostgreSQL + pgvector + Stripe + Clerk verification + OpenAI embeddings/summaries)
- **scraper/** (Python; RSS-based grant collectors; posts new items to backend for AI processing)
- **docker-compose.yml** (local Postgres + pgvector)

> This is a scaffold you can deploy and extend. It includes working end-to-end flows, but you will still configure third-party services (Clerk, Stripe, OpenAI) and run database migrations.

## High-level Architecture
- **Frontend** authenticates users via Clerk, calls the **Backend** for data.
- **Backend** persists data in Postgres via Prisma, computes AI summaries + embeddings, and handles search, profiles, collections, notifications, and Stripe subscription webhooks.
- **Scraper** pulls grants from RSS feeds (NSF/NIH examples) and **POSTs** them to the backend, which generates AI summaries/embeddings, and notifies matching researchers.

## Quick Start (local)
See the full beginner guide in `docs/deployment_guide.md` for production steps.

1. Install system tools:
   - Node.js 20+ and npm
   - Python 3.10+
   - Docker Desktop (to run Postgres with pgvector)

2. Copy env files:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.local.example frontend/.env.local`
   - `cp scraper/.env.example scraper/.env`

3. Start database (first time):
   - `docker compose up -d`

4. Install deps and migrate DB:
   - `cd backend && npm install && npx prisma migrate dev && cd ..`

5. Start backend:
   - In one terminal: `cd backend && npm run dev`

6. Start frontend:
   - In another terminal: `cd frontend && npm install && npm run dev`

7. Test scraper (optional initially):
   - `cd scraper && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
   - `python scraper.py`

8. Open http://localhost:3000 in your browser.

---


Grantlytic
**Security & Compliance**: Before selling to universities, you must add SSO/SAML if required, finalize RBAC, perform security audits, add rate limiting/monitoring/logging, and ensure data privacy (FERPA/GDPR as applicable).
