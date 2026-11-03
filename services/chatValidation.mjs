const MAX_MESSAGES = 16;
const MAX_MESSAGE_LENGTH = 6_000;
const MAX_TOTAL_LENGTH = 24_000;

/**
 * Validate and normalize an untrusted chat request.
 * @param {unknown} value
 * @returns {{ok: true, messages: Array<{role: "user" | "assistant", content: string}>, useSearch: boolean} | {ok: false, error: string}}
 */
export function validateChatPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "A JSON object is required." };
  }

  const body = /** @type {Record<string, unknown>} */ (value);
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return { ok: false, error: `Provide between 1 and ${MAX_MESSAGES} messages.` };
  }

  let totalLength = 0;
  const messages = [];

  for (const item of body.messages) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ok: false, error: "Each message must be an object." };
    }
    const message = /** @type {Record<string, unknown>} */ (item);
    if (message.role !== "user" && message.role !== "assistant") {
      return { ok: false, error: "Message roles must be user or assistant." };
    }
    if (typeof message.content !== "string" || !message.content.trim()) {
      return { ok: false, error: "Message content cannot be empty." };
    }
    const content = message.content.trim();
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, error: "A message exceeds the 6,000-character limit." };
    }
    totalLength += content.length;
    messages.push({ role: message.role, content });
  }

  if (totalLength > MAX_TOTAL_LENGTH) {
    return { ok: false, error: "The conversation context is too large." };
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return { ok: false, error: "The final message must be from the user." };
  }
  if (body.useSearch !== undefined && typeof body.useSearch !== "boolean") {
    return { ok: false, error: "useSearch must be a boolean." };
  }

  return { ok: true, messages, useSearch: body.useSearch === true };
}
