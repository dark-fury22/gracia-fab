# Deployment

Two environments: **production** (`main`) and **staging** (`staging`). Both
deploy automatically on push — Render for the server, Vercel for the
client. There's no CI-triggered deploy step; Render and Vercel each watch
the repo directly.

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| Server | `gracia-fab-api` (Render) | `gracia-fab-api-staging` (Render) |
| Client | `gracia-fab.vercel.app` | a branch-aliased Vercel URL (you choose the subdomain when you set it up) |
| Database | production MongoDB database | separate `gracia-fab-staging` database |
| Redis | production instance | separate instance |
| Paystack | live keys | **test-mode** keys only |

Promoting a change to production is a normal merge: `staging` → `main`.

## Why staging gets its own Redis instance

`server/queues/index.js` names queues `"whatsapp"`, `"email"`, `"points"` —
not scoped by environment. If staging and production pointed at the same
`REDIS_URL`, a job enqueued by a staging test order could be picked up and
processed by production's worker (e.g. a real WhatsApp/email send triggered
by test data). A second free Redis instance avoids this with no code
change. If queue names are ever made environment-aware in code, sharing
becomes safe and this requirement can be dropped.

## One-time setup (do this once, in order)

These are dashboard steps on services you already have accounts with; none
of this can be done from the repo.

### 1. MongoDB — a staging database

In the same MongoDB Atlas cluster you already use for production, create a
second database named `gracia-fab-staging` (Atlas creates it automatically
the first time something writes to it — you don't need to pre-create
collections). Copy your existing connection string and just swap the
database name at the end of the path, e.g.:

```
mongodb+srv://user:password@cluster.mongodb.net/gracia-fab-staging
```

That's your staging `MONGO_URI`. (Stronger isolation: use a separate Atlas
cluster instead — same idea, a second free-tier cluster.)

### 2. Redis — a staging instance

Create a second free Redis database with your provider (e.g. a new Upstash
database). Copy its connection string — that's your staging `REDIS_URL`.

### 3. Paystack — test-mode keys

In the Paystack dashboard, switch to **Test Mode** (top-left toggle) and
copy the test **Secret Key** (`sk_test_...`) and **Public Key**
(`pk_test_...`). Never put live keys in staging.

### 4. Generate a staging `JWT_SECRET`

Run this locally and use the output — don't reuse production's secret:

```bash
openssl rand -hex 32
```

(No OpenSSL handy? `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` works the same.)

### 5. Render — create the staging service

`server/render.yaml` already declares `gracia-fab-api-staging` (branch
`staging`) alongside production's `gracia-fab-api`. In the Render
dashboard: **New → Blueprint**, point it at this repo, and it picks up both
services from the YAML — or, if you'd rather not touch the existing
production service via Blueprint sync, create `gracia-fab-api-staging` by
hand as a new Web Service pointed at the `staging` branch with the same
build (`npm install`) and start (`npm start`) commands.

Either way, set these env vars on the staging service (Render dashboard →
that service → Environment):

| Key | Staging value |
|---|---|
| `NODE_ENV` | `staging` |
| `MONGO_URI` | from step 1 |
| `REDIS_URL` | from step 2 |
| `JWT_SECRET` | from step 4 |
| `PAYSTACK_SECRET_KEY` | test secret key from step 3 |
| `FRONTEND_URL` | the staging Vercel URL from step 6 (circular — come back and set this after step 6) |
| everything else in [server/.env.example](../server/.env.example) | can start as a **copy of production's** value (Gemini/Groq keys, email, Twilio) — split these later if you want staging AI/email usage tracked separately |

### 6. Vercel — a stable staging URL

Vercel already deploys every non-`main` branch as a Preview automatically —
no code change needed. To give `staging` a fixed URL instead of a new one
per commit: Project Settings → Domains → add a domain (or use a Vercel
subdomain) → assign it to the Git branch `staging`.

Then set staging-specific env vars for the **Preview** environment (Project
Settings → Environment Variables — scope to the `staging` branch if your
Vercel plan supports branch-specific values, otherwise Preview-wide is
fine since there's currently only one active non-production branch):

| Key | Staging value |
|---|---|
| `VITE_API_URL` | the staging Render URL from step 5 |
| `VITE_PAYSTACK_PUBLIC_KEY` | test public key from step 3 |
| `VITE_GOOGLE_CLIENT_ID` | can reuse production's |

Go back to step 5 and set the server's `FRONTEND_URL` to this staging
Vercel URL.

## After setup

Push to `staging` → Render and Vercel both redeploy staging automatically,
gated by the same CI (`.github/workflows/ci.yml`) that already runs on
`main`. When staging looks good, open a PR from `staging` into `main`.
