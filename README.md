# Forge AI Companion

**A private, extensible AI companion for thoughtful work, development, and personal knowledge.**

Forge is being developed as a local-first AI workspace. The product direction combines provider-backed conversations, user-controlled memory, project context, and transparent runtime status. The current release is an early foundation—not a claim that every planned capability is already implemented.

## Current capabilities

- React 19 + TypeScript + Vite application shell.
- Architecture, memory-map, model and roadmap views.
- Server-side Gemini chat endpoint at `/api/chat`.
- Bounded conversation input validation and optional Google Search grounding.
- Multiple conversations persisted in browser IndexedDB, with create, switch, delete and one-time migration from the original single-conversation localStorage slot.
- Automated API and conversation-model tests with build CI.

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in the server environment. Never use a `VITE_` prefix for provider secrets. The Vite development server alone does not execute Vercel API routes; use the Vercel development runtime (`vercel dev`) or deploy to Vercel to exercise `/api/chat`.

## Scripts

- `npm run dev` — start the Vite frontend.
- `npm run build` — build the frontend.
- `npm run preview` — preview a production frontend build.
- `npm test` — run Node's built-in test runner.

## Deployment

The repository is structured for Vercel: deploy the project with the repository root as the root directory and configure `GEMINI_API_KEY` as a server-side environment variable for Preview and Production as appropriate. Redeploy after changing environment variables.

## Product boundaries

- Chat requests are sent to the server API; the provider key is never shipped to the browser.
- Conversations are stored in the current browser profile using IndexedDB. They are not encrypted, backed up, or synchronized across devices.
- The memory graph is a conceptual visualization, not yet a searchable memory store.
- Model cards and runtime telemetry must not be interpreted as live hardware measurements.
- Authentication, shared rate limiting, per-user quotas, durable memory, sync, backup/recovery, production observability, and secure voice remain outstanding.

See [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [SECURITY.md](SECURITY.md).
