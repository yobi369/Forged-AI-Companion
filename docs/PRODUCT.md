# Forge product definition

## Product promise

Forge is a private AI companion and workbench that helps a person think, build, learn, and retain useful context without pretending to have access to resources it has not been connected to.

## Target users

- Developers and technical practitioners who want an assistant grounded in their current work.
- Independent professionals who need persistent project context and a dependable thinking partner.
- Privacy-conscious users who want a clear boundary between local data and external AI providers.

## Product principles

1. **Honest capability:** distinguish live data, configured integrations, local records, and illustrative visualizations.
2. **Privacy by design:** keep provider credentials server-side; make data storage and deletion behavior explicit.
3. **Local-first:** core workspace and personal records should remain usable without a provider connection.
4. **User control:** memory must be inspectable, editable, exportable, and deletable.
5. **Provider portability:** isolate provider-specific behavior behind adapters.
6. **Reliability:** validate inputs, bound work, handle failures, and test critical paths.

## Release stages

### Foundation (current work)
- Secure server-side Gemini request path.
- Bounded request validation.
- Browser-local conversation persistence.
- Honest UI status and baseline CI/tests.

### Private alpha
- First-class conversation list and rename/archive/delete.
- IndexedDB-backed workspace storage and export/import.
- Explicit memory capture, review, edit, forget, and retrieval.
- Provider configuration abstraction and connection diagnostics.
- Keyboard accessibility, responsive layout, error recovery, and privacy controls.

### Public beta
- Authentication and account recovery.
- Encrypted server-side sync with per-user authorization.
- Durable memory retrieval with provenance and deletion propagation.
- Usage limits, abuse protection, audit events, monitoring, backups, and support workflows.
- Optional voice with short-lived credentials and explicit microphone lifecycle.

### Production
- Independent security review and privacy review.
- Load, failure, restore, and cross-browser testing.
- Documented retention, incident response, and service-level objectives.
- Operational dashboards based on real telemetry, never hardcoded measurements.

## Non-goals for the first release

Forge will not execute arbitrary shell commands, modify a user's files, or claim to inspect a device unless an explicit, permissioned integration is implemented. It will not silently retain sensitive personal information as memory.
