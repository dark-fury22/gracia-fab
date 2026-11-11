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
      ├── Monnify              — payments + webhook
      ├── Gemini → Groq        — AI features (chat, skin analysis, search)
      ├── Resend (HTTPS API)   — transactional / marketing email
      ├── Google OAuth         — social login
      └── Twilio WhatsApp      — order notifications
```

- **`client/`** — React 18 SPA built with Vite, routed with `react-router-dom`, installable as a PWA (`vite-plugin-pwa`). Talks to the API over `VITE_API_URL`.
- **`server/`** — Express API on Node, MongoDB via Mongoose, background jobs via BullMQ/Redis, scheduled marketing emails via `node-cron`.
- **MongoDB** — primary datastore (products, users, orders, reviews, contacts, subscribers).
- **Redis** — queue backend for BullMQ (`server/queues`), used for async work like emails/notifications.
- **Monnify** — payment processing (card, bank transfer, USSD). The server issues each payment reference, and confirms payments by querying Monnify's API — from the checkout page's verify call and from the webhook (`POST /api/webhooks/monnify`).
- **Gemini (Google Generative AI) / Groq** — power the beauty chat assistant, skin analysis, routine generator, and smart search; Gemini is tried first with Groq as a fallback.
- **Twilio, Resend, Google OAuth** — WhatsApp order notifications, transactional/marketing email, and social login respectively.

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
2. Client creates the order (`POST /api/orders`); the server prices it from the database and sets the delivery fee.
3. Client starts payment (`POST /api/orders/:id/pay/init`); the server generates a payment reference, saves it on the order, and returns it with the order total and the public Monnify keys. The client opens the Monnify modal with those.
4. When Monnify reports completion, the client calls `PUT /api/orders/:id/pay`; the server asks Monnify's API for the transaction's real status and amount, then atomically marks the order paid, commits stock and awards loyalty points (`server/services/orderPayment.js`). Monnify's webhook (`POST /api/webhooks/monnify`) runs the same confirmation, so the order still settles if the customer closes the tab.
5. Background jobs (BullMQ workers) handle side effects like confirmation emails/WhatsApp messages without blocking the request.
