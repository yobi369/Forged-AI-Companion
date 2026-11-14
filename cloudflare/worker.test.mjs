import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.js";

const validBody = {
  messages: [
    { role: "user", content: "Hello Forge" },
  ],
};

function makeRequest(body = validBody, headers = {}) {
  return new Request("https://forge-ai-inference.example.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid.jwt.token",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function makeEnv(run = async () => ({ response: "Hello from Forge." })) {
  return {
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "public-test-key",
    AI: { run },
  };
}

test("rejects methods other than POST", async () => {
  const response = await worker.fetch(new Request("https://worker.example", { method: "GET" }), makeEnv());
  assert.equal(response.status, 405);
});

test("requires a bearer session before inference", async () => {
  const response = await worker.fetch(makeRequest(validBody, { Authorization: "" }), makeEnv());
  assert.equal(response.status, 401);
});

test("rejects invalid Supabase sessions", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("unauthorized", { status: 401 });
  try {
    const response = await worker.fetch(makeRequest(), makeEnv());
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, "SESSION_INVALID");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("validates chat payloads before invoking the model", async () => {
  const originalFetch = globalThis.fetch;
  let invoked = false;
  globalThis.fetch = async () => new Response("{}", { status: 200 });
  try {
    const response = await worker.fetch(makeRequest({ messages: [] }), makeEnv(async () => {
      invoked = true;
      return { response: "unexpected" };
    }));
    assert.equal(response.status, 400);
    assert.equal(invoked, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects web-grounding requests rather than silently ignoring them", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status: 200 });
  try {
    const response = await worker.fetch(makeRequest({ ...validBody, useSearch: true }), makeEnv());
    assert.equal(response.status, 422);
    assert.equal((await response.json()).code, "WEB_GROUNDING_UNAVAILABLE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns a normalized Cloudflare Workers AI response", async () => {
  const originalFetch = globalThis.fetch;
  let receivedModel = "";
  let receivedMessages = [];
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "user-1" }), { status: 200 });
  try {
    const response = await worker.fetch(makeRequest(), makeEnv(async (model, input) => {
      receivedModel = model;
      receivedMessages = input.messages;
      return { response: "Hello from Cloudflare." };
    }));
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.text, "Hello from Cloudflare.");
    assert.equal(payload.model, "@cf/mistralai/mistral-small-3.1-24b-instruct");
    assert.deepEqual(payload.sources, []);
    assert.equal(receivedModel, "@cf/mistralai/mistral-small-3.1-24b-instruct");
    assert.equal(receivedMessages[0].role, "system");
    assert.equal(receivedMessages[1].content, "Hello Forge");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns a safe provider error without exposing prompts or provider output", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status: 200 });
  try {
    const response = await worker.fetch(makeRequest(), makeEnv(async () => {
      throw new Error("sensitive provider detail");
    }));
    const payload = await response.json();
    assert.equal(response.status, 502);
    assert.equal(payload.code, "PROVIDER_REQUEST_FAILED");
    assert.equal(JSON.stringify(payload).includes("sensitive provider detail"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
