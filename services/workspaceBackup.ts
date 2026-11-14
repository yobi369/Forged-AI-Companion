import {
  createWorkspaceBackup,
  parseWorkspaceBackup,
} from "./workspaceBackup.mjs";
import {
  listConversations,
  listMemories,
  saveConversation,
  saveMemory,
} from "./conversationStore";

function uniqueId(existing: Set<string>, prefix: string): string {
  let id = "";
  do {
    id = `${prefix}-${crypto.randomUUID()}`;
  } while (existing.has(id));
  existing.add(id);
  return id;
}

export async function downloadWorkspaceBackup(): Promise<void> {
  const [conversations, memories] = await Promise.all([listConversations(), listMemories()]);
  const content = createWorkspaceBackup({ conversations, memories });
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `forge-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importWorkspaceBackup(raw: string): Promise<{ conversations: number; memories: number }> {
  const imported = parseWorkspaceBackup(raw);
  const [existingConversations, existingMemories] = await Promise.all([listConversations(), listMemories()]);
  const conversationIds = new Set(existingConversations.map((item) => item.id));
  const memoryIds = new Set(existingMemories.map((item) => item.id));

  for (const record of imported.conversations) {
    const id = conversationIds.has(record.id) ? uniqueId(conversationIds, "conversation") : record.id;
    conversationIds.add(id);
    await saveConversation({ ...record, id });
  }
  for (const record of imported.memories) {
    const id = memoryIds.has(record.id) ? uniqueId(memoryIds, "memory") : record.id;
    memoryIds.add(id);
    await saveMemory({ ...record, id, source: record.source || "Imported backup" });
  }
  return { conversations: imported.conversations.length, memories: imported.memories.length };
}
