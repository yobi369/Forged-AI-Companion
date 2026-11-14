import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGroqRequest,
  extractGroqText,
  FORGE_SYSTEM_INSTRUCTION,
  GROQ_MODEL,
} from "../services/groqProvider.mjs";

test("builds a Groq request with a server-owned system instruction", () => {
  const request = buildGroqRequest([
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there" },
    { role: "user", content: "Continue" },
  ]);

  assert.equal(request.model, GROQ_MODEL);
  assert.equal(request.model, "openai/gpt-oss-20b");
  assert.deepEqual(request.messages, [
    { role: "system", content: FORGE_SYSTEM_INSTRUCTION },
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there" },
    { role: "user", content: "Continue" },
  ]);
  assert.equal(request.max_completion_tokens, 2048);
  assert.equal("tools" in request, false);
});

test("enables Groq browser search only when explicitly requested", () => {
  const request = buildGroqRequest([{ role: "user", content: "Research this" }], true);

  assert.equal(request.tool_choice, "required");
  assert.deepEqual(request.tools, [{ type: "browser_search" }]);
  assert.equal(request.reasoning_effort, "low");
});

test("extracts a string assistant response", () => {
  assert.equal(
    extractGroqText({ choices: [{ message: { content: "  Forge response  " } }] }),
    "Forge response",
  );
});

test("extracts text content parts and rejects malformed responses", () => {
  assert.equal(
    extractGroqText({ choices: [{ message: { content: [{ type: "text", text: "A" }, { type: "text", text: "B" }] } }] }),
    "AB",
  );
  assert.equal(extractGroqText({ choices: [] }), "");
  assert.equal(extractGroqText(null), "");
});
