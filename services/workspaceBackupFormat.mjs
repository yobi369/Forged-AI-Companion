export const BACKUP_FORMAT = "forge-workspace-backup";
export const BACKUP_VERSION = 1;

const MAX_FILE_CHARS = 5 * 1024 * 1024;
const MAX_CONVERSATIONS = 500;
const MAX_MEMORIES = 2_000;
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 6_000;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function boundedString(value, max, field) {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new Error(`Backup contains an invalid ${field}.`);
  }
  return value;
}

function timestamp(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Backup contains an invalid ${field} timestamp.`);
  }
  return value;
}

function normalizeSources(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("Backup contains invalid message sources.");
  return value.slice(0, 10).flatMap((source) => {
    if (!isRecord(source) || typeof source.uri !== "string" || typeof source.title !== "string") return [];
    try {
      const url = new URL(source.uri);
      if (url.protocol !== "https:" && url.protocol !== "http:") return [];
      return [{ uri: url.toString(), title: source.title.slice(0, 200) }];
    } catch {
      return [];
    }
  });
}

function normalizeConversation(value) {
  if (!isRecord(value)) throw new Error("Backup contains an invalid conversation.");
  const id = boundedString(value.id, 128, "conversation ID").trim();
  const title = boundedString(value.title, 120, "conversation title").trim();
  if (!Array.isArray(value.messages) || value.messages.length > MAX_MESSAGES) {
    throw new Error("Backup contains an invalid conversation history.");
  }
  const messages = value.messages.map((message) => {
    if (!isRecord(message) || (message.role !== "user" && message.role !== "assistant")) {
      throw new Error("Backup contains an invalid message role.");
    }
    const content = boundedString(message.content, MAX_MESSAGE_LENGTH, "message");
    return {
      role: message.role,
      content,
      timestamp: timestamp(message.timestamp, "message"),
      ...(message.sources === undefined ? {} : { sources: normalizeSources(message.sources) }),
    };
  });
  return {
    id,
    title,
    messages,
    createdAt: timestamp(value.createdAt, "conversation creation"),
    updatedAt: timestamp(value.updatedAt, "conversation update"),
  };
}

function normalizeMemory(value) {
  if (!isRecord(value)) throw new Error("Backup contains an invalid memory.");
  if (!Array.isArray(value.tags) || value.tags.length > 8) {
    throw new Error("Backup contains invalid memory tags.");
  }
  const tags = value.tags.map((tag) => boundedString(tag, 32, "memory tag").trim().toLowerCase());
  return {
    id: boundedString(value.id, 128, "memory ID").trim(),
    title: boundedString(value.title, 100, "memory title").trim(),
    content: boundedString(value.content, 10_000, "memory content"),
    tags: [...new Set(tags)],
    source: typeof value.source === "string" ? value.source.slice(0, 100) : "Imported backup",
    createdAt: timestamp(value.createdAt, "memory creation"),
    updatedAt: timestamp(value.updatedAt, "memory update"),
  };
}

/**
 * Validate an untrusted Forge backup before it is written to local storage.
 * @param {string} raw
 */
export function parseWorkspaceBackup(raw) {
  if (typeof raw !== "string" || raw.length > MAX_FILE_CHARS) {
    throw new Error("Backup file is too large. The maximum supported size is 5 MB.");
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT || parsed.version !== BACKUP_VERSION) {
    throw new Error("This is not a supported Forge workspace backup.");
  }
  if (!Array.isArray(parsed.conversations) || parsed.conversations.length > MAX_CONVERSATIONS) {
    throw new Error("Backup contains too many conversations or an invalid conversation list.");
  }
  if (!Array.isArray(parsed.memories) || parsed.memories.length > MAX_MEMORIES) {
    throw new Error("Backup contains too many memories or an invalid memory list.");
  }
  const conversations = parsed.conversations.map(normalizeConversation);
  const memories = parsed.memories.map(normalizeMemory);
  const conversationIds = new Set(conversations.map((item) => item.id));
  const memoryIds = new Set(memories.map((item) => item.id));
  if (conversationIds.size !== conversations.length || memoryIds.size !== memories.length) {
    throw new Error("Backup contains duplicate record IDs.");
  }
  return { conversations, memories };
}

/**
 * @param {{conversations: unknown[], memories: unknown[]}} workspace
 */
export function createWorkspaceBackup(workspace) {
  return JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    conversations: workspace.conversations,
    memories: workspace.memories,
  }, null, 2);
}
