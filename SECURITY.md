# Security policy

## Supported reporting

Report suspected vulnerabilities privately to the repository owner. Do not publish credentials, personal data, or exploit details in public issues.

## Current safeguards

- No third-party provider API key is required. Inference runs through a server-side Cloudflare Workers AI binding; the browser receives no provider credential.
- Chat payloads are bounded by message count, per-message size, and total context size.
- Client-supplied system/developer roles are rejected.
- API responses disable caching and set a basic content-type protection header.
- Both the Vercel API route and Cloudflare Worker require a bearer access token and verify it with Supabase Auth before inference.
- Supabase publishable keys are used in the browser; secret/service-role keys are not required by this implementation.
- Local IndexedDB data is isolated by authenticated user ID within the browser.
- Provider errors do not expose prompts, response bodies, or credentials.

## Important deployment warning

The chat endpoint now requires an authenticated Supabase session. However, it still has no shared/distributed rate limiting, per-user server-side quotas, or durable abuse controls. Do not expose an unrestricted public deployment until these controls are implemented and independently reviewed. Review Cloudflare Workers AI usage allowances and billing controls before enabling inference, and keep preview deployments access-controlled.

## Secret handling

- Never commit `.env.local`, API keys, tokens, or private credentials.
- Never expose provider secrets through `VITE_*` variables.
- Rotate any key that has been committed or exposed.
