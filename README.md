# InboxPilot AI

Multi-tenant AI dashboard SaaS built with Next.js 14 App Router, Tailwind CSS, Prisma, PostgreSQL, and NextAuth.

## Features

- Public landing page at `/`
- Google/NextAuth sign-in at `/signin`
- Tenant provisioning on first sign-in
- Protected dashboard at `/dashboard`
- Dashboard sidebar modules for Lead Scoring, Auto-Reply, and Analytics
- Gmail OAuth scopes for profile, read-only mailbox metadata, and sending
- Gmail connection status API at `/api/gmail/status`
- Prisma schema and migration for users, accounts, sessions, tenants, leads, rules, and analytics snapshots
- Dockerfile and Compose stack for app plus PostgreSQL

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

The local app runs at `http://localhost:3000`.

## Google OAuth

Create an OAuth client in Google Cloud Console and add this redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

For production, add:

```text
https://your-domain.com/api/auth/callback/google
```

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `DATABASE_URL` in `.env`.

## Docker

```bash
docker compose up --build
```

The app container waits for PostgreSQL, runs `prisma migrate deploy`, and starts Next.js on port `3000`.

## Useful Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run prisma:studio
```
