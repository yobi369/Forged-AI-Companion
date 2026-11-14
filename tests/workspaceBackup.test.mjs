import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceBackup, parseWorkspaceBackup } from "../services/workspaceBackupFormat.mjs";

const sample = {
  conversations: [{
    id: "conversation-1",
    title: "Release planning",
    messages: [
      { role: "user", content: "  Plan a release  ", timestamp: 100 },
      { role: "assistant", content: "Start with a checklist.", timestamp: 101, sources: [{ uri: "https://example.com", title: "Example" }] },
    ],
    createdAt: 90,
    updatedAt: 101,
  }],
  memories: [{
    id: "memory-1",
    title: "Project direction",
    content: "  Local-first developer workspace.  ",
    tags: ["product", "roadmap"],
    source: "Manually saved by you",
    createdAt: 80,
    updatedAt: 90,
  }],
};

test("workspace backup round-trips conversations and memories", () => {
  const parsed = parseWorkspaceBackup(createWorkspaceBackup(sample));
  assert.equal(parsed.conversations[0].messages[1].sources[0].uri, "https://example.com/");
  assert.equal(parsed.memories[0].tags.length, 2);
  assert.equal(parsed.conversations[0].messages[0].content, "  Plan a release  ");
  assert.equal(parsed.memories[0].content, "  Local-first developer workspace.  ");
});

test("rejects malformed JSON and unsupported backup versions", () => {
  assert.throws(() => parseWorkspaceBackup("{"), /valid JSON/);
  assert.throws(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 99, conversations: [], memories: [] })), /supported/);
});

test("rejects unsafe message roles and duplicate IDs", () => {
  const invalidRole = structuredClone(sample);
  invalidRole.conversations[0].messages[0].role = "system";
  assert.throws(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...invalidRole })), /message role/);

  const duplicate = structuredClone(sample);
  duplicate.memories[0].id = duplicate.conversations[0].id;
  // IDs are scoped by record type, so the same text across stores is permitted.
  assert.doesNotThrow(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...duplicate })));
  duplicate.memories.push({ ...duplicate.memories[0] });
  assert.throws(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...duplicate })), /duplicate/);
});

test("rejects oversized records and non-HTTP source URLs are discarded", () => {
  const invalid = structuredClone(sample);
  invalid.memories[0].content = "x".repeat(10001);
  assert.throws(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...invalid })), /memory content/);

  const source = structuredClone(sample);
  source.conversations[0].messages[1].sources.push({ uri: "javascript:alert(1)", title: "unsafe" });
  const parsed = parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...source }));
  assert.equal(parsed.conversations[0].messages[1].sources.length, 1);
});

test("rejects duplicate IDs inside each collection", () => {
  const duplicate = structuredClone(sample);
  duplicate.conversations.push({ ...duplicate.conversations[0] });
  assert.throws(() => parseWorkspaceBackup(JSON.stringify({ format: "forge-workspace-backup", version: 1, ...duplicate })), /duplicate/);
});

test("enforces the backup byte limit for import and export", () => {
  assert.throws(() => parseWorkspaceBackup(" ".repeat(5 * 1024 * 1024 + 1)), /5 MB/);
  assert.throws(() => createWorkspaceBackup({
    conversations: [],
    memories: [{
      id: "large-memory",
      title: "Large",
      content: "x".repeat(5 * 1024 * 1024),
      tags: [],
      source: "manual",
      createdAt: 1,
      updatedAt: 1,
    }],
  }), /5 MB/);
});
