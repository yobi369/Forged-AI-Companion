import test from "node:test";
import assert from "node:assert/strict";
import { conversationTitle, normalizeMessages } from "../services/conversationModel.mjs";

test("conversation title comes from the first user prompt", () => {
  assert.equal(conversationTitle([
    { role: "assistant", content: "Welcome", timestamp: 1 },
    { role: "user", content: "Plan my release", timestamp: 2 },
  ]), "Plan my release");
});

test("conversation title is bounded", () => {
  const title = conversationTitle([{ role: "user", content: "a".repeat(100), timestamp: 1 }]);
  assert.equal(title.length, 46);
  assert.endsWith(title, "…");
});

test("normalization rejects invalid roles, oversized content and invalid timestamps", () => {
  const result = normalizeMessages([
    { role: "system", content: "hidden instruction", timestamp: 1 },
    { role: "user", content: "x".repeat(6001), timestamp: 2 },
    { role: "assistant", content: "bad time", timestamp: Number.NaN },
    { role: "user", content: "valid", timestamp: 3 },
  ]);
  assert.deepEqual(result.map((message) => message.content), ["valid"]);
});

test("normalization caps history at 100 messages", () => {
  const messages = Array.from({ length: 105 }, (_, index) => ({
    role: index % 2 ? "assistant" : "user",
    content: String(index),
    timestamp: index,
  }));
  const result = normalizeMessages(messages);
  assert.equal(result.length, 100);
  assert.equal(result[0].content, "5");
});

test("sources are restricted to bounded HTTP(S) links", () => {
  const [message] = normalizeMessages([{
    role: "assistant",
    content: "Grounded answer",
    timestamp: 1,
    sources: [
      { uri: "https://example.com", title: "valid" },
      { uri: "javascript:alert(1)", title: "invalid" },
      { uri: "http://example.org", title: "also valid" },
    ],
  }]);
  assert.deepEqual(message.sources.map((source) => source.title), ["valid", "also valid"]);
});
