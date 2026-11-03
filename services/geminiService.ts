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

export async function getGeminiResponse(
  messages: ChatTurn[],
  useSearch = false,
): Promise<ChatResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, useSearch }),
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

// PCM helpers are retained for the future voice adapter. They do not open a
// microphone or establish a provider session by themselves.
export function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function decodeAudioData(
  data: Uint8Array,
  context: AudioContext,
  sampleRate: number,
  channels: number,
): Promise<AudioBuffer> {
  const aligned = data.byteOffset % 2 === 0
    ? data
    : new Uint8Array(data);
  const samples = new Int16Array(aligned.buffer, aligned.byteOffset, Math.floor(aligned.byteLength / 2));
  const frames = Math.floor(samples.length / channels);
  const buffer = context.createBuffer(channels, frames, sampleRate);

  for (let channel = 0; channel < channels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    for (let frame = 0; frame < frames; frame += 1) {
      channelData[frame] = samples[frame * channels + channel] / 32768;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}
