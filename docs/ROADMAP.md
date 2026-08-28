# Roadmap

A living backlog. Move items between sections as priorities shift; turn a "Now" item into a GitHub issue when someone starts on it (see [WORKFLOW.md](WORKFLOW.md)).

## Now

- [x] Add automated tests, CI, and this doc set (this change).
- [ ] Remove the `TEMPORARY DEBUG ROUTE` (`GET /api/debug-paystack/:ref`) in [server/app.js](../server/app.js) once Paystack integration is confirmed stable in production — it exposes raw Paystack verification responses with no auth check.
- [x] Fix the ~35 pre-existing `npm run lint` errors in `client/` — done; lint is a real blocking gate in CI again. Reordered functions before their `useEffect` uses, split `AuthContext`/`CartContext`/`ThemeContext`/`Toast` into `client/src/hooks/` so their files export only components (satisfies `react-refresh/only-export-components`), and used a few narrow, commented `eslint-disable-next-line` suppressions for genuinely effect-appropriate cases (localStorage reads on mount, fetch-orchestration effects, the Paystack ref generator) rather than restructuring code that isn't actually wrong. Seven `react-hooks/exhaustive-deps` warnings remain — those are pre-existing, deliberate omissions (e.g. omitting `navigate`/fetch functions from dep arrays to avoid re-fetch loops) and don't fail CI.
- [ ] Expand server test coverage beyond the seed tests in `server/tests/` (auth, orders, admin) — prioritize routes that touch money (orders, Paystack webhook).
- [ ] Expand client test coverage beyond the seed tests in `client/src/components/__tests__/` — prioritize `CartContext`, `Checkout`, and `ProductCard`'s interactive behavior.

## Next

- [ ] Add request-body validation (e.g. `zod` or `express-validator`) to controllers that currently trust `req.body` directly.
- [ ] Add structured logging (server currently uses ad hoc `console.log`/`console.error`).
- [ ] Add a staging environment / preview deploys, separate from the single production environment currently used.

## Later

- [ ] Revisit the AI provider fallback strategy (Gemini → Groq) for cost/latency once usage data exists.
- [ ] Consider splitting `server/routes` + `server/controllers` by domain module if the codebase keeps growing.

## Backlog (product ideas — unprioritized)

- [ ] _Add your own feature ideas here._
