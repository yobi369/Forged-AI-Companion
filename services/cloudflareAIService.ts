import { supabase } from "./supabaseClient";

export interface GroundedSource {
  uri: string;
  title: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  text: string;
  sources: GroundedSource[];
  model?: string;
}

export async function getCloudflareAIResponse(messages: ChatTurn[]): Promise<ChatResult> {
  if (!supabase) {
    throw new Error("Authentication is not configured for this Forge deployment.");
  }
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error("Your session has expired. Sign in again to continue.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof payload.error === "string"
          ? payload.error
          : `Forge request failed (HTTP ${response.status}).`,
      );
    }

    if (typeof payload.text !== "string" || !payload.text.trim()) {
      throw new Error("Forge received an invalid response from the server.");
    }

    return {
      text: payload.text,
      sources: Array.isArray(payload.sources) ? payload.sources : [],
      model: typeof payload.model === "string" ? payload.model : undefined,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw error instanceof Error ? error : new Error("Unable to contact Forge.");
  } finally {
    window.clearTimeout(timeout);
  }
}
