import { validateChatPayload } from "../services/chatValidation.mjs";

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
  const token = bearer.match(/^Bearer\\s+([A-Za-z0-9._~-]+)$/i)?.[1];
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\\/$/, "");
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
      cache: "no-store",
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
  if ("error" in validation) {
    return res.status(400).json({ error: validation.error });
  }

  const workerUrl = process.env.CLOUDFLARE_AI_WORKER_URL?.trim();
  if (!workerUrl) {
    return res.status(503).json({
      error: "The Cloudflare AI worker is not configured for this deployment.",
      code: "AI_WORKER_NOT_CONFIGURED",
    });
  }

  let endpoint: URL;
  try {
    endpoint = new URL(workerUrl);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
      throw new Error("Invalid worker URL");
    }
  } catch {
    return res.status(503).json({
      error: "The Cloudflare AI worker URL is invalid. Configure an HTTPS workers.dev URL.",
      code: "AI_WORKER_URL_INVALID",
    });
  }

  try {
    const upstream = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: validation.messages,
        useSearch: validation.useSearch,
      }),
      signal: AbortSignal.timeout(40_000),
    });

    const payload = await upstream.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return res.status(502).json({ error: "Cloudflare AI returned an invalid response." });
    }
    return res.status(upstream.status).json(payload);
  } catch (error) {
    console.error("Forge Cloudflare AI proxy failed:", error instanceof Error ? error.name : "unknown");
    return res.status(502).json({
      error: "Forge could not reach its Cloudflare AI worker. Please try again shortly.",
      code: "AI_WORKER_UNAVAILABLE",
    });
  }
}
