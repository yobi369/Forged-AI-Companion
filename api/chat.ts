import { validateChatPayload } from "../services/chatValidation.mjs";
import { buildGroqRequest, extractGroqText, GROQ_MODEL } from "../services/groqProvider.mjs";

type Request = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};
type Response = {
  setHeader(name: string, value: string): void;
  status(code: number): Response;
  json(body: unknown): void;
};

export default async function handler(req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Vary", "Authorization");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const length = Number(req.headers["content-length"] || 0);
  if (Number.isFinite(length) && length > 32_000) {
    return res.status(413).json({ error: "Request is too large." });
  }

  const authorization = req.headers.authorization;
  const bearer = typeof authorization === "string" ? authorization : "";
  const token = bearer.match(/^Bearer\s+([A-Za-z0-9._~-]+)$/i)?.[1];
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return res.status(503).json({
      error: "Authentication is not configured. Forge AI requests are temporarily unavailable.",
      code: "AUTH_NOT_CONFIGURED",
    });
  }
  if (!token) {
    return res.status(401).json({ error: "Sign in to use Forge AI.", code: "AUTH_REQUIRED" });
  }

  let identity: globalThis.Response;
  try {
    identity = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
  if (identity.status === 401 || identity.status === 403) {
    return res.status(401).json({ error: "Your session is invalid or expired. Sign in again.", code: "SESSION_INVALID" });
  }
  if (!identity.ok) {
    return res.status(503).json({ error: "Forge could not verify your session. Try again shortly." });
  }

  const validation = validateChatPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "The AI provider is not configured. Add GROQ_API_KEY to the server environment.",
      code: "PROVIDER_NOT_CONFIGURED",
    });
  }

  try {
    const providerResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildGroqRequest(validation.messages, validation.useSearch)),
      signal: AbortSignal.timeout(45_000),
    });

    if (providerResponse.status === 429) {
      return res.status(429).json({
        error: "Forge is temporarily at the AI provider's usage limit. Please try again shortly.",
        code: "PROVIDER_RATE_LIMITED",
      });
    }
    if (providerResponse.status === 401 || providerResponse.status === 403) {
      return res.status(503).json({
        error: "The configured AI provider credential was rejected. Check the server environment.",
        code: "PROVIDER_CONFIGURATION_INVALID",
      });
    }
    if (!providerResponse.ok) {
      console.error("Forge provider request failed with status:", providerResponse.status);
      return res.status(502).json({
        error: "Forge could not complete the provider request. Check provider availability and try again.",
        code: "PROVIDER_REQUEST_FAILED",
      });
    }

    const payload: unknown = await providerResponse.json();
    const text = extractGroqText(payload);
    if (!text) {
      return res.status(502).json({ error: "The provider returned an empty response." });
    }

    // Groq browser-search citations are included in the generated answer. The
    // chat-completions adapter does not currently normalize them into source cards.
    return res.status(200).json({ text, sources: [], model: GROQ_MODEL });
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown";
    if (name === "TimeoutError" || name === "AbortError") {
      return res.status(504).json({ error: "Forge's AI request timed out. Please try again.", code: "PROVIDER_TIMEOUT" });
    }
    // Never log prompts, provider responses, or credentials.
    console.error("Forge provider request failed:", name);
    return res.status(502).json({
      error: "Forge could not complete the provider request. Check provider availability and try again.",
      code: "PROVIDER_REQUEST_FAILED",
    });
  }
}
