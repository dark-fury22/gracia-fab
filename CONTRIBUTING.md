# Contributing

## Local setup

Requires Node.js 20+, a MongoDB connection string, and (optionally) Redis for background jobs.

```bash
git clone <repo-url>
cd gracia-fab

cd server
cp .env.example .env   # fill in your own values
npm install
npm run dev             # http://localhost:5000

cd ../client
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

See [server/.env.example](server/.env.example) and [client/.env.example](client/.env.example) for the full list of environment variables and what each one is for.

## Before opening a PR

```bash
cd client && npm run lint && npm test && npm run build
cd ../server && npm test
```

All of the above also run in CI (`.github/workflows/ci.yml`) on every push/PR to `main` — fix failures locally before requesting review.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: ...` — a new feature
- `fix: ...` — a bug fix
- `refactor: ...` — code change that isn't a fix or a feature
- `chore: ...` — tooling, dependencies, config
- `docs: ...` — documentation only

Keep the summary line short and in the imperative mood (`fix: correct order total rounding`, not `fixed order total`).

## Branches & PRs

- Branch off `main` using `feat/…`, `fix/…`, or `chore/…` (see [docs/WORKFLOW.md](docs/WORKFLOW.md)).
- Reference the issue you're closing with `Fixes #<number>` in the PR description.
- Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md) checklist, including how you tested the change.
- Keep PRs scoped to one change — smaller PRs review faster.

## Adding tests

- **Server**: Vitest + Supertest, against `server/app.js` (not `server/server.js` — that file has side effects like connecting to Mongo and starting workers). Use `mongodb-memory-server` for anything touching the database; see `server/tests/product.test.js` for the pattern.
- **Client**: Vitest + React Testing Library. Co-locate new tests under `client/src/components/__tests__/` or next to the file being tested; see `client/src/components/__tests__/GraciaLogo.test.jsx` for the pattern.
