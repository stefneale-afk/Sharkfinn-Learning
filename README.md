# SharkFinn Learning — Full API on Railway

Endpoints implemented: health, children, sessions, activity-blocks, social-stories, visual-schedules, rewards & redemption.

## Quick Start
```bash
npm install
cp .env.example .env
# Fill DATABASE_URL (Neon) with ?sslmode=require
npm start
# http://localhost:3000
```

## Deploy on Railway (GUI)
1) Push this repo to GitHub (private).  
2) Railway → New Project → Deploy from GitHub.  
3) Add Variables: `PORT=3000`, `DATABASE_URL=postgresql://...sslmode=require`.  
4) Open `/api/health`.

## Deploy on Railway (CLI)
```bash
npm i -g @railway/cli
railway login
railway init
railway variables set PORT=3000
railway variables set DATABASE_URL="postgresql://...sslmode=require"
railway up
```

## GitHub Actions (optional)
- Add repo secrets: `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`.
- Push to `main` and it will deploy.

## Schema
See `schema.sql`. Tables are auto-created on boot.
