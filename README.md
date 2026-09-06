# Property Resource

A mobile-first, voice-enabled real estate lead intake application. Sellers and
buyers share their goals by voice or typing in about two minutes; every
submission is reviewed by staff in an internal dashboard before anyone reaches
out.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Supabase**: Postgres (Row Level Security), Auth, and private Storage buckets
- **Zod** for server-side validation of every public submission
- Web Speech API for voice input, with a typed fallback everywhere it's used

## Project structure

```
app/
  (marketing)/        Public site: home, /sell, /buy, /how-it-works,
                       /articles, legal pages, deferred photo uploads
  dashboard/
    (auth)/            /dashboard/login, /dashboard/setup (public routes)
    (app)/             Lead Inbox, lead detail, wholesale panel, team
                        management (auth-gated by proxy.ts + layout)
  actions/             Server Actions (the data-access layer)
  api/intake/          Public intake API route
components/            UI, by feature area (wizard, video, photos, dashboard)
lib/                   Supabase clients, validation schemas, video config,
                       article content, dashboard helpers
supabase/migrations/   SQL migrations, in application order
proxy.ts               Session refresh + dashboard auth gate (Next.js 16
                        renamed "Middleware" to "Proxy" -- same mechanism)
```

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Set these in `.env.local` for local development, and in your Vercel
project's Environment Variables for deployment (see below). All of them
except `ANTHROPIC_API_KEY` are required — the app throws a clear error at
the point of use if one is missing, rather than failing silently.

| Variable | Where to find it | Exposed to browser? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page — the "anon" key (labeled "publishable" on newer projects; either works) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — the "service_role" secret | **No — never** |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://your-app.vercel.app`); `http://localhost:3000` locally | Yes |
| `DEFAULT_ORG_ID` | The `organizations.id` row seeded by the migrations below | No |
| `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) — optional | **No — never** |

The anon key is safe to expose: every table and storage bucket has RLS
enabled, and the anon/authenticated roles have no policies granting them
direct write access anywhere. The service role key bypasses RLS entirely —
treat it like a database superuser password.

`ANTHROPIC_API_KEY` is optional and unlocks AI-assisted extraction on the
seller wizard's "speak your answers" steps (see below) — without it, those
same steps still work using built-in keyword matching, just without the
AI's better handling of what wasn't explicitly matched to an option.

### Voice intake: rule-based matching + optional AI

The seller wizard lets people describe their property (or repairs, mortgage,
and reason for selling) in one freeform sentence instead of answering one
question at a time. This always works via keyword/word-overlap matching in
`lib/wizard-extract.ts` — no configuration required. When
`ANTHROPIC_API_KEY` is set, `app/actions/ai-extract.ts` additionally sends
the same transcript to Claude (`claude-haiku-4-5-20251001`) with a
tool-use schema constrained to the wizard's actual option values, and its
result takes precedence over the keyword match for that utterance. Any
failure — no key, a network error, a non-200 response — falls back to the
keyword match silently; the wizard never blocks or errors because of this.

## Supabase setup

This repo's schema lives in `supabase/migrations/`, applied in filename
order. To stand up a new Supabase project for this app (or reproduce this
one):

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migrations in `supabase/migrations/` in order, via the
   Supabase SQL Editor (paste each file's contents and run it, in filename
   order) or the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
   (`supabase link`, then `supabase db push`).
3. The third migration seeds one `organizations` row with a fixed id
   (`566254e3-df08-4fd2-928a-52ed05b14d77`). Set `DEFAULT_ORG_ID` to that
   value, or update the migration to use your own id before applying it.
4. Copy the project URL and anon key from Project Settings → API into your
   environment variables.

The schema is intentionally locked down: every table has RLS enabled, and
the only tables with any policies at all (`leads`, `lead_media`,
`consent_records`, `partner_routes`, `contract_packets`, `users`,
`organizations`) grant access exclusively to authenticated staff/partner
sessions, scoped to their own organization. There is no anon/public policy
on any table — all public writes go through server-side, Zod-validated
Server Actions and API routes using the service role key.

## Deploying: GitHub → Vercel

1. **Push this repository to GitHub** (or use your existing fork/clone).
2. **Set up Supabase first** — either use an existing project or follow
   [Supabase setup](#supabase-setup) above. You'll need the four Supabase
   values from the environment variable table before the next step.
3. **Import the project into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select this GitHub
     repository.
   - Vercel auto-detects Next.js — no build command changes are needed.
4. **Add environment variables** in the Vercel project's Settings →
   Environment Variables, for both **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark it sensitive if Vercel offers that
     option — never expose this one)
   - `NEXT_PUBLIC_SITE_URL` (your production Vercel URL, e.g.
     `https://your-app.vercel.app`)
   - `DEFAULT_ORG_ID`
   - `ANTHROPIC_API_KEY` (optional — mark it sensitive; see
     [Voice intake](#voice-intake-rule-based-matching--optional-ai) above)
5. **Deploy.** Vercel builds and deploys automatically on every push to
   your production branch from here on.
6. **Create the first dashboard admin account**: once deployed, visit
   `https://your-app.vercel.app/dashboard/setup`. This page only works
   once — it creates the first admin account and then permanently disables
   itself the moment any staff account exists. From there, sign in at
   `/dashboard/login` and add any other teammates (including partner
   accounts) from `/dashboard/team`.
7. **Verify**: submit a test lead through `/sell` or `/buy`, then confirm
   it appears in the Lead Inbox at `/dashboard`.

If you ever redeploy with a fresh Supabase project, re-run steps 2–6.

## Dashboard roles

`users.role` is one of `admin`, `reviewer`, `acquisitions`, or `partner`.
Admins can add teammates from `/dashboard/team`; every role except partner
sees the full Lead Inbox for their organization; partners see only leads
explicitly routed to them from a lead's detail page.
