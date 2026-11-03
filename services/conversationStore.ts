export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: { uri: string; title: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: number;
  updatedAt: number;
}

const DATABASE_NAME = "forge-workspace";
const DATABASE_VERSION = 1;
const STORE_NAME = "conversations";
const LEGACY_KEY = "forge.conversation.v1";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `forge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function conversationTitle(messages: StoredMessage[]): string {
  const firstPrompt = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstPrompt) return "New conversation";
  return firstPrompt.length > 48 ? `${firstPrompt.slice(0, 45)}…` : firstPrompt;
}

export function normalizeMessages(value: unknown): StoredMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is StoredMessage =>
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

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable in this browser."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open Forge storage."));
    request.onblocked = () => reject(new Error("Forge storage upgrade is blocked by another open tab."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Forge storage operation failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Forge storage transaction aborted."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Forge storage transaction failed."));
    };
  });
}

export async function listConversations(): Promise<Conversation[]> {
  const records = await withStore("readonly", (store) => store.getAll());
  return (records as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return withStore("readonly", (store) => store.get(id)) as Promise<Conversation | undefined>;
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  await withStore("readwrite", (store) => store.put(conversation));
}

export async function removeConversation(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function createConversation(): Promise<Conversation> {
  const now = Date.now();
  const conversation: Conversation = {
    id: createId(),
    title: "New conversation",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveConversation(conversation);
  return conversation;
}

/** One-time migration from the original single-conversation localStorage slot. */
export async function migrateLegacyConversation(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;
  try {
    const messages = normalizeMessages(JSON.parse(legacy));
    if (messages.length) {
      const now = Date.now();
      await saveConversation({
        id: createId(),
        title: conversationTitle(messages),
        messages,
        createdAt: now,
        updatedAt: now,
      });
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Keep the legacy value intact if migration fails so the user can recover it.
  }
}
