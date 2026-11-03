# Architecture

## Current request flow

```text
React chat UI
  -> POST /api/chat
    -> request validation (bounded messages and content)
    -> server-only GEMINI_API_KEY
    -> Gemini API
    <- text + grounded source references
  <- browser renders response and stores conversation locally
```

## Trust boundaries

- Browser input is untrusted.
- Only `user` and `assistant` message roles are accepted from the client.
- The system instruction is server-owned; clients cannot replace it.
- Provider credentials are read only from the server environment.
- Provider errors are normalized before returning to the browser.
- Requests and prompts must not be written to application logs.

## Current limitations

- The API route is designed for Vercel's Node function runtime. A plain Vite dev server does not run it.
- No global rate limiter exists yet. A production public deployment must add a shared limiter (for example, a managed Redis/KV service) before open access.
- There is no authentication or per-user quota yet. Keep deployments private while the endpoint is unauthenticated.
- Browser-local conversation persistence is not encrypted storage and does not sync across devices.
- The current memory graph is illustrative and is not connected to a memory database.
- Provider selection is currently fixed to Gemini 2.5 Flash in the server adapter.

## Planned boundaries

- `providers/`: normalized provider interface, model metadata, retries, timeout and usage accounting.
- `storage/`: IndexedDB workspace store, schema migrations, export/import.
- `memory/`: explicit memory lifecycle, retrieval, provenance, and deletion.
- `auth/`: identity, session lifecycle, authorization, and tenant isolation.
- `observability/`: privacy-safe metrics, traces, health checks, and alerting.

Do not add client-side provider secrets or represent simulated telemetry as measured runtime data.
