# Architecture

## Current request flow

```text
React chat UI
  -> IndexedDB workspace store (conversation list and message history)
  -> POST /api/chat
    -> request validation (bounded messages and content)
    -> server-only GEMINI_API_KEY
    -> Gemini API
    <- text + grounded source references
  <- browser renders response and persists it to IndexedDB
```

## Local workspace data

- Database: `forge-workspace`, schema version 2.
- Object stores: `conversations` and `memories`, each keyed by an opaque record ID.
- Conversation records store a title, ordered messages, and creation/update timestamps.
- Memory records store a user-authored title, content, tags, a manual-capture provenance label, and timestamps.
- Conversation and memory lists are sorted by most recently updated.
- Message normalization accepts only user/assistant roles, bounds message size and history length, and filters source links to HTTP(S).
- The first launch migrates the previous `forge.conversation.v1` localStorage value once the IndexedDB write succeeds.
- Memories are never silently captured or automatically injected into model prompts. They remain user-managed records until retrieval controls are implemented.
- Data remains in the browser profile. It is not encrypted, synchronized, or backed up; clearing browser site data can remove it.

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
- There is no authentication or per-user quota yet. Keep deployments private while the endpoint is unauthenticated.
- Browser-local IndexedDB persistence is not encrypted storage and does not sync across devices.
- Memory retrieval, automatic prompt context assembly, export/import, and cross-device deletion propagation are not implemented.
- Provider selection is currently fixed to Gemini 2.5 Flash in the server adapter.

## Planned boundaries

- `providers/`: normalized provider interface, model metadata, retries, timeout and usage accounting.
- `memory/`: retrieval, provenance for external facts, retention policy, and controlled prompt context assembly.
- `auth/`: identity, session lifecycle, authorization, and tenant isolation.
- `sync/`: encrypted synchronization, conflict handling, export/import, and backup/recovery.
- `observability/`: privacy-safe metrics, traces, health checks, and alerting.

Do not add client-side provider secrets or represent simulated telemetry as measured runtime data.
