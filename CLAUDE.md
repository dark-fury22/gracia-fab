# Gracia Fab

AI-powered beauty e-commerce store for the Nigerian market: skincare, haircare, wigs, bridal. Prices are in Naira (NGN).

- `client/`: React 18 + Vite PWA, react-router-dom. Deployed on Vercel.
- `server/`: Node + Express + MongoDB (Mongoose), BullMQ/Redis jobs. ES modules. Deployed on Render.
- AI: Gemini first, Groq fallback. Payments: Paystack. Email: Resend over HTTPS (SMTP is blocked on Render). WhatsApp: Twilio.
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

- Admin image upload (`uploadImage` in `server/controllers/adminController.js`) writes to `server/public/uploads` on local disk. Render's filesystem is ephemeral, so those files disappear on redeploy or restart.
- Keep the working copy outside OneDrive. OneDrive syncing corrupted an earlier `.git`. The canonical local clone is `C:\dev\gracia-fab`.
