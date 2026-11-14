# Architecture

## Frontend delivery

- Tailwind CSS is compiled through the Vite/PostCSS build pipeline and emitted as versioned production assets.
- The application does not depend on the Tailwind browser CDN or an external import map at runtime.
- Base typography, focus-visible styles, and global layout rules are shipped in the local stylesheet.

## Current request flow

```text
React chat UI
  -> Supabase Auth session (PKCE, persisted and refreshed by SDK)
  -> account-scoped IndexedDB workspace store
  -> POST /api/chat + Bearer access token
    -> Supabase Auth /auth/v1/user session verification
    -> request validation (bounded messages and content)
    -> server-only GEMINI_API_KEY
    -> Gemini API
    <- text + grounded source references
  <- browser renders response and persists it to IndexedDB
```

## Local workspace data

- Guest/legacy database: `forge-workspace`, schema version 2.
- Authenticated databases: `forge-workspace:user:<Supabase user UUID>`, schema version 2. The authenticated user ID is verified by Supabase Auth before it selects the local namespace.
- Object stores: `conversations` and `memories`, each keyed by an opaque record ID.
- Conversation records store a title, ordered messages, and creation/update timestamps.
- Memory records store a user-authored title, content, tags, a manual-capture provenance label, and timestamps.
- Conversation and memory lists are sorted by most recently updated.
- Message normalization accepts only user/assistant roles, bounds message size and history length, and filters source links to HTTP(S).
- The first launch migrates the previous `forge.conversation.v1` localStorage value once the IndexedDB write succeeds.
- Memories are never silently captured or automatically injected into model prompts. They remain user-managed records until retrieval controls are implemented.
- Data remains in the browser profile. It is not encrypted or synchronized; clearing browser site data can remove it.
- Sign-in and sign-out switch between the authenticated account's IndexedDB database and the legacy guest database. Existing guest data is not automatically copied into the first account; users can export it while in the guest workspace and import it after sign-in.
- A user-initiated versioned JSON backup can export conversations and memories. Import validates the full archive before writing, adds records without overwriting collisions, and refreshes open workspace views. Backups are plaintext; an IndexedDB failure during restore can leave a partial import.

## Trust boundaries

- Browser input is untrusted.
- Only `user` and `assistant` message roles are accepted from the client.
- The system instruction is server-owned; clients cannot replace it.
- Provider credentials are read only from the server environment.
- Provider errors are normalized before returning to the browser.
- Requests and prompts must not be written to application logs.

## Current limitations

- The API route is designed for Vercel's Node function runtime. A plain Vite dev server does not run it.
- No global rate limiter exists yet. A production public deployment must add a shared limiter before open access.
- Supabase Auth email/password sign-up, sign-in, confirmation, and password recovery are implemented. The browser uses the publishable key; the server verifies the bearer token against Supabase Auth before accepting a provider request.
- Authenticated local workspace data is separated by account, but it is not cloud data and there is no encrypted cross-device sync.
- There is no shared/distributed rate limiter or per-user server-side quota yet. Keep deployments access-controlled until abuse and spend controls are implemented.
- Browser-local IndexedDB persistence is not encrypted storage and does not sync across devices.
- Memory retrieval, automatic prompt context assembly, export/import, and cross-device deletion propagation are not implemented.
- Provider selection is currently fixed to Gemini 2.5 Flash in the server adapter.

## Planned boundaries

- `providers/`: normalized provider interface, model metadata, retries, timeout and usage accounting.
- `memory/`: retrieval, provenance for external facts, retention policy, and controlled prompt context assembly.
- `auth/`: shared/distributed abuse controls, server-side quotas, audit events, and stronger session policy.
- `sync/`: encrypted synchronization, conflict handling, export/import, and backup/recovery.
- `observability/`: privacy-safe metrics, traces, health checks, and alerting.

Do not add client-side provider secrets or represent simulated telemetry as measured runtime data.
