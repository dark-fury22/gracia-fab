# Architecture

## System overview

```
client/ (React + Vite, on Vercel)
      │  HTTPS / JSON  (VITE_API_URL)
      ▼
server/ (Express API, on Render)
      │
      ├── MongoDB Atlas        — primary datastore
      ├── Redis + BullMQ       — background job queue
      ├── Paystack             — payments + webhook
      ├── Gemini → Groq        — AI features (chat, skin analysis, search)
      ├── Nodemailer           — transactional / marketing email
      ├── Google OAuth         — social login
      └── Twilio WhatsApp      — order notifications
```

- **`client/`** — React 18 SPA built with Vite, routed with `react-router-dom`, installable as a PWA (`vite-plugin-pwa`). Talks to the API over `VITE_API_URL`.
- **`server/`** — Express API on Node, MongoDB via Mongoose, background jobs via BullMQ/Redis, scheduled marketing emails via `node-cron`.
- **MongoDB** — primary datastore (products, users, orders, reviews, contacts, subscribers).
- **Redis** — queue backend for BullMQ (`server/queues`), used for async work like emails/notifications.
- **Paystack** — payment processing; the server verifies webhook signatures (`POST /api/webhooks/paystack`) to confirm orders as paid.
- **Gemini (Google Generative AI) / Groq** — power the beauty chat assistant, skin analysis, routine generator, and smart search; Gemini is tried first with Groq as a fallback.
- **Twilio, Nodemailer, Google OAuth** — WhatsApp order notifications, transactional/marketing email, and social login respectively.

## Server structure

`server/app.js` builds and configures the Express `app` (middleware, rate limiting, routes, error handling) with **no side effects** — it doesn't connect to Mongo, start queue workers, or listen on a port. This makes it importable directly in tests (see `server/tests/`).

`server/server.js` is the actual entrypoint (`npm start` / `npm run dev`): it imports `app.js`, connects to MongoDB, starts BullMQ workers, schedules the daily marketing cron job, and starts listening.

```
server/
  app.js            # Express app: middleware + routes (no side effects, testable)
  server.js         # entrypoint: connectDB() + startWorkers() + app.listen()
  config/db.js      # Mongoose connection
  routes/           # one file per resource, thin — delegates to controllers
  controllers/      # request handling + business logic
  models/           # Mongoose schemas
  middleware/        # auth, admin, error handling
  services/          # email, WhatsApp
  queues/            # BullMQ queue + worker setup
  tests/             # Vitest + Supertest + mongodb-memory-server
```

## Client structure

```
client/src/
  pages/            # route-level views (Home, Products, Cart, Checkout, Admin, ...)
  components/         # reusable UI pieces, each with a co-located .css file
  context/            # AuthContext, CartContext, ThemeContext (React Context + hooks)
  utils/api.js        # fetch wrapper pointed at VITE_API_URL
  test/setup.js        # Vitest + Testing Library setup
```

## Typical request flow: placing an order

1. Client adds items to cart (`CartContext`, persisted client-side) and goes to `Checkout`.
2. Client calls the server to create an order (`POST /api/orders`) and initializes a Paystack transaction.
3. User pays on Paystack; Paystack calls the server webhook (`POST /api/webhooks/paystack`) with a signed payload.
4. The server verifies the HMAC signature, marks the matching order `isPaid`, and updates its status.
5. Background jobs (BullMQ workers) handle side effects like confirmation emails/WhatsApp messages without blocking the request.
