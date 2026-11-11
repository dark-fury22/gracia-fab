# Gracia Fab

AI-powered beauty e-commerce store for the Nigerian market: skincare, haircare, wigs, bridal. Prices are in Naira (NGN).

**Several AI assistants work on this repo at once.** Before editing anything, `git pull --rebase` and read `docs/WORKING_NOW.md`. Claim your task there before you start, and remove your row when you finish.

- `client/`: React 18 + Vite PWA, react-router-dom. Deployed on Vercel.
- `server/`: Node + Express + MongoDB (Mongoose), BullMQ/Redis jobs. ES modules. Deployed on Render.
- AI: Gemini first, Groq fallback. Payments: Monnify (`server/services/monnify.js`). Email: Resend over HTTPS (SMTP is blocked on Render). WhatsApp: Twilio.
- Deeper docs: `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `docs/WORKFLOW.md`, `docs/ROADMAP.md`, `CONTRIBUTING.md`.

## Commands

```bash
cd client && npm run dev      # :5173
cd server && npm run dev      # :5000 (nodemon)
cd server && npm run seed     # reseed products from server/data/products.js
```

Before you call something done, run what CI runs (`.github/workflows/ci.yml`, Node 20):

```bash
cd client && npm run lint && npm test && npm run build
cd server && npm test
```

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`). Branches `feat/…`, `fix/…`, `chore/…` off `main`.
- Release flow: land on `staging` (auto-deploys to staging), verify, then PR `staging` → `main` (auto-deploys to production).
- Server tests use Vitest + Supertest against `server/app.js`, never `server/server.js`, which connects to Mongo and starts workers. Use `mongodb-memory-server` for anything that touches the DB.
- Client tests use Vitest + React Testing Library, in `__tests__/` folders next to the code.
- Server logging uses `server/utils/logger.js` (pino), not `console.*`. The one-off CLI scripts (`setAdmin.js`, `seeder.js`, …) are the exception.
- Request bodies are validated with zod via `middleware/validate.js` and the schemas in `server/validators/`.
- CSS uses the tokens defined in `client/src/index.css`. Never reference an undefined CSS variable; it fails silently and has caused invisible-text bugs before.
- Env vars are documented in `server/.env.example` and `client/.env.example`. Never commit `.env`.

## Content rules

- Don't invent products, brands, reviews or claims. An earlier commit had to strip out fabricated content.
- Product images must show the actual product. Use `/product-placeholder.svg` when there's no real photo; never use generic stock photos as stand-ins. Real photos so far are hosted on Cloudinary (`res.cloudinary.com/dyzkjerez/...`).

## Known gotchas

- Payments are confirmed only by querying Monnify's API (`confirmOrderPayment` in `server/services/orderPayment.js`), never by trusting the browser or the webhook payload. Stock is committed and loyalty points awarded at payment, in `markOrderPaid`, not at order creation.
- Admin image uploads go to Cloudinary (`server/services/imageStorage.js`). Never write uploads to local disk in production: Render's filesystem is wiped on every deploy. Without `CLOUDINARY_URL` the server refuses uploads in production and uses local disk only in development.
- Stock defaults to 0 (out of stock) until counted; counts are entered in the admin Inventory tab or by CSV upload there.
- Keep the working copy outside OneDrive. OneDrive syncing corrupted an earlier `.git`. The canonical local clone is `C:\dev\gracia-fab`.
