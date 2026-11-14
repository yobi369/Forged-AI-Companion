# Forge AI Companion

**A private, extensible AI companion for thoughtful work, development, and personal knowledge.**

Forge is being developed as a local-first AI workspace. The product direction combines provider-backed conversations, user-controlled memory, project context, and transparent runtime status. The current release is an early foundation—not a claim that every planned capability is already implemented.

## Current capabilities

- React 19 + TypeScript + Vite application shell with Tailwind CSS compiled into production assets (no runtime Tailwind CDN).
- Server-side chat endpoint at `/api/chat`, protected by Supabase session verification and backed by a dedicated Cloudflare Workers AI inference Worker.
- Supabase email/password registration, sign-in, email confirmation, password reset, and password update flows.
- Browser-local IndexedDB databases namespaced by authenticated account; separate accounts on the same browser do not share conversation or memory records.
- Bounded request validation at both the Vercel API boundary and Cloudflare Worker.
- Multiple conversations persisted in browser IndexedDB, with create, switch, delete and one-time migration from the original single-conversation localStorage slot.
- User-controlled memory records: manually create, search, edit, and delete tagged memories in IndexedDB.
- Versioned JSON workspace backups for conversations and memories, with validated additive restore and collision-safe record IDs.
- Backup import validation, size and record limits, and HTTP(S)-only source references.
- Memory content is never silently captured or automatically sent to the provider.
- Automated API and conversation-model tests with build CI.

## Private alpha data portability

Use **Export backup** to download a versioned JSON archive of conversations and saved memories. Use **Import backup** to add a validated archive to the current browser workspace; existing records are preserved. Backups are plaintext and may contain sensitive information, so store them privately. See [data portability details](docs/DATA_PORTABILITY.md).

## Private alpha authentication setup

Configure the Supabase project URL and publishable key in the frontend environment as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Configure the same project URL and publishable key on the server as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, plus `CLOUDFLARE_AI_WORKER_URL` (the HTTPS URL of the deployed Cloudflare Worker). Configure the Worker with an AI binding named `AI`, and server-side `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` variables. Publishable keys are designed for browser use; never place a Supabase secret/service-role key in a `VITE_` variable. Configure the Supabase Auth site URL and redirect allowlist for your deployed Forge domain. Email confirmation and password recovery depend on the Auth email delivery configuration.

For local development, copy `.env.example` to `.env.local` and fill all five values. The Cloudflare Worker must also be deployed and configured separately. Until these values are configured, Forge intentionally remains behind the setup screen and the AI endpoint rejects requests.

## Quick start

Requirements: Node.js 22 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `CLOUDFLARE_AI_WORKER_URL` in the Vercel server environment to the deployed Worker URL. The Worker itself requires the Workers AI binding and the two Supabase server variables. The Vite development server alone does not execute Vercel API routes; use the Vercel development runtime (`vercel dev`) or deploy to Vercel to exercise `/api/chat`.

## Scripts

- `npm run dev` — start the Vite frontend.
- `npm run build` — build the frontend.
- `npm run preview` — preview a production frontend build.
- `npm test` — run Node's built-in test runner.

## Deployment

The frontend and `/api/chat` proxy remain on Vercel. Deploy `cloudflare/worker.js` as a Cloudflare Worker with an AI binding named `AI`, and configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as Worker variables. Configure `CLOUDFLARE_AI_WORKER_URL` on Vercel for Preview and Production. The selected model is `@cf/mistralai/mistral-small-3.1-24b-instruct`; Cloudflare currently lists it at $0.351 per million input tokens and $0.555 per million output tokens. Check your account's applicable free allowance and billing settings before enabling inference. No provider key is required.

## Product boundaries

- Chat requests are sent to the server API; the provider key is never shipped to the browser.
- Conversations and manually saved memories are stored in IndexedDB databases scoped by authenticated user ID in the current browser. They are not encrypted or synchronized across devices. Existing guest records remain in the original browser database and are not automatically copied into an account.
- Saved memories are not automatically injected into prompts; memory retrieval and provenance-aware context assembly remain future work.
- Model cards and runtime telemetry must not be interpreted as live hardware measurements.
- Shared/distributed rate limiting, per-user server-side quotas, encrypted cloud sync, automated server backups, production observability, independent security review, and secure voice remain outstanding.

See [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [SECURITY.md](SECURITY.md).
