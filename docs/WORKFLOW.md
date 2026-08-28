# Development workflow

Lightweight, GitHub-native process — no external tracker required.

## Issue lifecycle

1. **Backlog** — captured in [ROADMAP.md](ROADMAP.md) or as a GitHub issue with no assignee.
2. **Todo** — issue is triaged, scoped, and ready to be picked up (add a `ready` label, or move it into a GitHub Project column if one is set up).
3. **In progress** — someone assigns themselves and opens a branch (see naming below). Link work-in-progress PRs to the issue early with `Fixes #<issue>` in the PR description (draft PRs are fine).
4. **In review** — PR is open, CI (`.github/workflows/ci.yml`) is green, and it's ready for review against the [PR template](../.github/PULL_REQUEST_TEMPLATE.md) checklist.
5. **Done** — PR merged to `main`; the linked issue auto-closes via the `Fixes #N` keyword. Render/Vercel auto-deploy `main`.

Use the issue templates when opening new work: [bug report](../.github/ISSUE_TEMPLATE/bug_report.md), [feature request](../.github/ISSUE_TEMPLATE/feature_request.md).

## Branch naming

- `feat/<short-description>` — new functionality
- `fix/<short-description>` — bug fix
- `chore/<short-description>` — tooling, deps, docs, refactors with no behavior change

Matches the commit prefixes already used in this repo's history (`feat:`, `fix:`, `refactor:`) — see [CONTRIBUTING.md](../CONTRIBUTING.md) for the full commit convention.

## CI gate

Every push/PR to `main` runs `.github/workflows/ci.yml`:
- **client** job: lint → test → build
- **server** job: test (against an in-memory MongoDB, no external services needed)

A PR should not be merged with a red CI run. CI does **not** deploy — Render and Vercel each auto-deploy from `main` independently once a PR merges.

## Deployment

- **Server** — Render, config in [server/render.yaml](../server/render.yaml). Env vars are configured in the Render dashboard (see [server/.env.example](../server/.env.example) for the list).
- **Client** — Vercel, config in [client/vercel.json](../client/vercel.json). Env vars are configured in the Vercel dashboard (see [client/.env.example](../client/.env.example)).
- Both deploy automatically from `main`. There is currently a single production environment — no staging (tracked in [ROADMAP.md](ROADMAP.md)).
