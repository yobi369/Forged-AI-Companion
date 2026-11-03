# Security policy

## Supported reporting

Report suspected vulnerabilities privately to the repository owner. Do not publish credentials, personal data, or exploit details in public issues.

## Current safeguards

- Gemini credentials are accessed only by the server route through `GEMINI_API_KEY`.
- Chat payloads are bounded by message count, per-message size, and total context size.
- Client-supplied system/developer roles are rejected.
- API responses disable caching and set a basic content-type protection header.
- Provider errors do not expose prompts, response bodies, or credentials.

## Important deployment warning

The current chat endpoint has no authentication, account authorization, shared rate limiting, or durable abuse controls. Do not expose an unrestricted public deployment or add paid provider credentials to a public endpoint until these controls are implemented. Configure spending limits with the provider and keep preview deployments access-controlled.

## Secret handling

- Never commit `.env.local`, API keys, tokens, or private credentials.
- Never expose provider secrets through `VITE_*` variables.
- Rotate any key that has been committed or exposed.
