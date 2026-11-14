# Private alpha data portability

## Scope

Forge's private alpha provides a user-initiated, browser-local workspace backup. The backup includes conversations, messages, grounded source references, and manually saved memories.

## Export

Use **Export backup** in the workspace header. Forge serializes the current IndexedDB conversations and memories into a versioned JSON file named `forge-workspace-YYYY-MM-DD.json`.

## Import

Use **Import backup** and select a Forge JSON backup. Import is additive: existing records are retained. If an imported record ID already exists, Forge generates a new ID so the imported record does not overwrite local work. Invalid or unsupported backups are rejected before any writes begin.

## Format and validation

- Format identifier: `forge-workspace-backup`
- Version: `1`
- Maximum file size: 5 MB
- Maximum conversations: 500
- Maximum memories: 2,000
- Maximum messages per conversation: 100
- Message content: 6,000 characters maximum
- Memory content: 10,000 characters maximum
- Imported message roles are restricted to `user` and `assistant`.
- Source links are restricted to HTTP(S).
- Duplicate IDs within a collection are rejected.

## Important limitations

- Backups are plaintext JSON. Store them somewhere private; they may contain sensitive project or personal information.
- Export is not automatic. Users are responsible for keeping a safe copy.
- Import writes to the current browser profile and is not a cloud restore.
- A browser storage failure during the write phase can result in a partial import; export a fresh backup before importing large archives.
- This feature does not provide encryption, account sync, or server-side retention.

## Verification

Run `npm test` and `npm run build`.
