/** @typedef {{role: "user" | "assistant", content: string, timestamp: number, sources?: {uri: string, title: string}[]}} StoredMessage */

/** @param {StoredMessage[]} messages */
export function conversationTitle(messages) {
  const firstPrompt = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstPrompt) return "New conversation";
  return firstPrompt.length > 48 ? `${firstPrompt.slice(0, 45)}…` : firstPrompt;
}

/** @param {unknown} value @returns {StoredMessage[]} */
export function normalizeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) =>
    Boolean(item) &&
    (item.role === "user" || item.role === "assistant") &&
    typeof item.content === "string" &&
    item.content.length <= 6000 &&
    typeof item.timestamp === "number" &&
    Number.isFinite(item.timestamp),
  ).slice(-100).map((item) => ({
    role: item.role,
    content: item.content,
    timestamp: item.timestamp,
    ...(Array.isArray(item.sources) ? {
      sources: item.sources.filter((source) =>
        source && typeof source.uri === "string" &&
        /^https?:\\/\\//i.test(source.uri) &&
        typeof source.title === "string",
      ).slice(0, 10),
    } : {}),
  }));
}
