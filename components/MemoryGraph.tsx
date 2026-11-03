import React, { useEffect, useMemo, useState } from "react";
import {
  listMemories,
  removeMemory,
  saveMemory,
  type UserMemory,
} from "../services/conversationStore";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const MemoryGraph: React.FC = () => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listMemories()
      .then((records) => { if (!cancelled) setMemories(records); })
      .catch(() => { if (!cancelled) setError("Could not load saved memories from this browser."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleMemories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return memories;
    return memories.filter((memory) =>
      memory.title.toLowerCase().includes(normalized) ||
      memory.content.toLowerCase().includes(normalized) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(normalized)),
    );
  }, [memories, query]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags("");
    setEditingId(null);
  };

  const startEditing = (memory: UserMemory) => {
    setEditingId(memory.id);
    setTitle(memory.title);
    setContent(memory.content);
    setTags(memory.tags.join(", "));
    setError("");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) {
      setError("Add both a title and memory content before saving.");
      return;
    }
    if (cleanTitle.length > 100 || cleanContent.length > 10000) {
      setError("Title must be 100 characters or fewer and memory content 10,000 characters or fewer.");
      return;
    }

    setIsSaving(true);
    setError("");
    const existing = memories.find((memory) => memory.id === editingId);
    const now = Date.now();
    const memory: UserMemory = {
      id: existing?.id ?? makeId(),
      title: cleanTitle,
      content: cleanContent,
      tags: [...new Set(tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8),
      source: "Manually saved by you",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      await saveMemory(memory);
      setMemories((items) => [memory, ...items.filter((item) => item.id !== memory.id)].sort((a, b) => b.updatedAt - a.updatedAt));
      resetForm();
    } catch {
      setError("Could not save this memory. Check browser storage availability.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memory: UserMemory) => {
    if (!window.confirm(`Delete the saved memory “${memory.title}”? This cannot be undone.`)) return;
    try {
      await removeMemory(memory.id);
      setMemories((items) => items.filter((item) => item.id !== memory.id));
      if (editingId === memory.id) resetForm();
      setError("");
    } catch {
      setError("Could not delete this memory.");
    }
  };

  return (
    <section className="flex h-full min-h-[520px] flex-col gap-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Your private workspace</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Saved memories</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">
          Save useful facts, preferences, and project context that you want to keep available. Nothing is captured automatically. You can review, edit, search, and delete every memory here.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="min-h-[300px] rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">Your memories <span className="ml-1 text-xs font-normal text-gray-500">({memories.length})</span></h3>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search memories…"
              aria-label="Search saved memories"
              className="w-44 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-orange-500" />
          </div>
          {isLoading ? <p className="py-8 text-center text-sm text-gray-500">Loading saved memories…</p> :
            visibleMemories.length ? (
              <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {visibleMemories.map((memory) => (
                  <article key={memory.id} className={`rounded-xl border p-4 ${editingId === memory.id ? "border-orange-500/50 bg-orange-500/5" : "border-white/10 bg-black/20"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="break-words text-sm font-semibold text-gray-100">{memory.title}</h4>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-400">{memory.content}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => startEditing(memory)} className="text-xs text-orange-300 hover:text-orange-200">Edit</button>
                        <button type="button" onClick={() => void handleDelete(memory)} className="text-xs text-red-300 hover:text-red-200">Delete</button>
                      </div>
                    </div>
                    {memory.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{memory.tags.map((tag) => <span key={tag} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-400">#{tag}</span>)}</div>}
                    <p className="mt-3 text-[10px] text-gray-600">{memory.source} · Updated {new Date(memory.updatedAt).toLocaleDateString()}</p>
                  </article>
                ))}
              </div>
            ) : <div className="py-10 text-center"><p className="text-sm text-gray-400">{query ? "No memories match your search." : "No saved memories yet."}</p><p className="mt-2 text-xs text-gray-600">Use the form to save something you want Forge to retain.</p></div>}
        </div>

        <form onSubmit={(event) => void handleSave(event)} className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">{editingId ? "Edit memory" : "Save a memory"}</h3>
            {editingId && <button type="button" onClick={resetForm} className="text-xs text-gray-400 hover:text-white">Cancel edit</button>}
          </div>
          <label htmlFor="memory-title" className="mb-2 block text-xs text-gray-400">Title</label>
          <input id="memory-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100}
            placeholder="e.g. Current project direction" className="mb-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-orange-500" />
          <label htmlFor="memory-content" className="mb-2 block text-xs text-gray-400">Memory content</label>
          <textarea id="memory-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={10000}
            rows={7} placeholder="Write the context you want to preserve…" className="mb-4 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm leading-relaxed text-white outline-none focus:border-orange-500" />
          <label htmlFor="memory-tags" className="mb-2 block text-xs text-gray-400">Tags <span className="text-gray-600">(comma separated, optional)</span></label>
          <input id="memory-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="project, preference, work"
            className="mb-5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-orange-500" />
          <button type="submit" disabled={isSaving || !title.trim() || !content.trim()}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40">
            {isSaving ? "Saving…" : editingId ? "Update memory" : "Save memory"}
          </button>
          <p className="mt-3 text-[10px] leading-relaxed text-gray-600">Memories are stored only in this browser's IndexedDB. They are not encrypted, synchronized, or sent to the AI provider automatically.</p>
        </form>
      </div>
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200" role="alert">{error}</p>}
    </section>
  );
};
