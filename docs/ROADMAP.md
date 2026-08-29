# Roadmap

A living backlog. Move items between sections as priorities shift; turn a "Now" item into a GitHub issue when someone starts on it (see [WORKFLOW.md](WORKFLOW.md)).

## Now

- [x] Add automated tests, CI, and this doc set (this change).
- [x] Remove the `TEMPORARY DEBUG ROUTE` (`GET /api/debug-paystack/:ref`) — done, along with its now-unused `node-fetch` import in [server/app.js](../server/app.js).
- [x] Fix the ~35 pre-existing `npm run lint` errors in `client/` — done; lint is a real blocking gate in CI again. Reordered functions before their `useEffect` uses, split `AuthContext`/`CartContext`/`ThemeContext`/`Toast` into `client/src/hooks/` so their files export only components (satisfies `react-refresh/only-export-components`), and used a few narrow, commented `eslint-disable-next-line` suppressions for genuinely effect-appropriate cases (localStorage reads on mount, fetch-orchestration effects, the Paystack ref generator) rather than restructuring code that isn't actually wrong. Seven `react-hooks/exhaustive-deps` warnings remain — those are pre-existing, deliberate omissions (e.g. omitting `navigate`/fetch functions from dep arrays to avoid re-fetch loops) and don't fail CI.
- [x] Expand server test coverage — added `tests/auth.test.js`, `tests/orders.test.js`, `tests/payment.test.js` (Paystack verification, mocked), and `tests/webhook.test.js` (Paystack webhook, HMAC-signed). `admin` routes are still untested.
- [x] Expand client test coverage — added `CartContext.test.jsx`, `Checkout.test.jsx`, and `ProductCard`'s interactive add-to-cart behavior.
- [x] **Critical fix (found while writing order tests):** `createOrder` in [server/controllers/orderController.js](../server/controllers/orderController.js) read `item.qty` from incoming order items, but the client sends `item.quantity` and the `Order` schema requires `quantity` too — every real checkout attempt was failing with "Invalid quantity". Renamed to `quantity` consistently; covered by `tests/orders.test.js`.

## Next

- [x] Add request-body validation — done with `zod`. A `validate(schema)` middleware (`server/middleware/validate.js`) parses `req.body` against a per-route schema in `server/validators/` and returns a structured 400 on failure; wired into all 11 route files that accept a body (auth, orders, admin, contact, loyalty, reviews, recommend, routine, search, skin-analysis, wishlist). Removed the now-redundant manual `if (!x) return 400` checks those schemas replace. Covered by `tests/validation.test.js`.
- [x] **Bonus fix (found while validating admin product fields):** `adminController.js`'s create/update product and `AdminDashboard.jsx`'s product form both used `countInStock`, but the `Product` schema's field is `stock` — Mongoose silently dropped it, so admin-set stock never persisted (new products always got the schema default). Renamed to `stock` consistently.
- [ ] Add structured logging (server currently uses ad hoc `console.log`/`console.error`).
- [ ] Add a staging environment / preview deploys, separate from the single production environment currently used.

## Later

- [ ] Revisit the AI provider fallback strategy (Gemini → Groq) for cost/latency once usage data exists.
- [ ] Consider splitting `server/routes` + `server/controllers` by domain module if the codebase keeps growing.

## Backlog (product ideas — unprioritized)

- [ ] _Add your own feature ideas here._
