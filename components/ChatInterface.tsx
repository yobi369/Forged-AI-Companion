import React, { useEffect, useRef, useState } from "react";
import { getGeminiResponse } from "../services/geminiService";
import {
  conversationTitle,
  createConversation,
  listConversations,
  migrateLegacyConversation,
  normalizeMessages,
  removeConversation,
  saveConversation,
  type Conversation,
  type StoredMessage,
} from "../services/conversationStore";

const welcomeMessage: StoredMessage = {
  role: "assistant",
  content: "I'm Forge. I can help you reason through a problem, plan work, and explore technical ideas. What are you working on?",
  timestamp: Date.now(),
};

export const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        await migrateLegacyConversation();
        let records = await listConversations();
        if (!records.length) {
          const first = await createConversation();
          first.messages = [welcomeMessage];
          first.title = "Getting started";
          first.updatedAt = Date.now();
          await saveConversation(first);
          records = [first];
        }
        if (!cancelled) {
          setConversations(records);
          setActiveId(records[0].id);
          setMessages(normalizeMessages(records[0].messages));
        }
      } catch (storageError) {
        if (!cancelled) setError(storageError instanceof Error ? storageError.message : "Forge could not open local storage.");
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const persist = async (nextMessages: StoredMessage[]) => {
    if (!activeId) return;
    const current = conversations.find((item) => item.id === activeId);
    if (!current) return;
    const updated: Conversation = {
      ...current,
      messages: nextMessages.slice(-100),
      title: current.title === "New conversation" || current.title === "Getting started"
        ? conversationTitle(nextMessages)
        : current.title,
      updatedAt: Date.now(),
    };
    try {
      await saveConversation(updated);
      setConversations((items) => [updated, ...items.filter((item) => item.id !== updated.id)].sort((a, b) => b.updatedAt - a.updatedAt));
    } catch {
      setError("Could not save this conversation. Check browser storage availability.");
    }
  };

  const selectConversation = (conversation: Conversation) => {
    if (isTyping) return;
    setActiveId(conversation.id);
    setMessages(normalizeMessages(conversation.messages));
    setError("");
  };

  const startConversation = async () => {
    if (isTyping) return;
    try {
      const conversation = await createConversation();
      conversation.messages = [welcomeMessage];
      conversation.title = "New conversation";
      await saveConversation(conversation);
      setConversations((items) => [conversation, ...items]);
      setActiveId(conversation.id);
      setMessages(conversation.messages);
      setInput("");
      setError("");
    } catch {
      setError("Could not create a conversation in browser storage.");
    }
  };

  const deleteConversation = async () => {
    if (!activeId || isTyping) return;
    const remaining = conversations.filter((item) => item.id !== activeId);
    try {
      await removeConversation(activeId);
      if (!remaining.length) {
        const fresh = await createConversation();
        fresh.messages = [welcomeMessage];
        fresh.title = "Getting started";
        await saveConversation(fresh);
        setConversations([fresh]);
        setActiveId(fresh.id);
        setMessages(fresh.messages);
      } else {
        setConversations(remaining);
        setActiveId(remaining[0].id);
        setMessages(normalizeMessages(remaining[0].messages));
      }
      setError("");
    } catch {
      setError("Could not delete this conversation.");
    }
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isTyping || !activeId || !isReady) return;

    const userMessage: StoredMessage = { role: "user", content: prompt, timestamp: Date.now() };
    const nextMessages = [...messages, userMessage].slice(-100);
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsTyping(true);
    await persist(nextMessages);

    try {
      const context = nextMessages.slice(-16).map(({ role, content }) => ({ role, content }));
      const result = await getGeminiResponse(context, useSearch);
      const completed = [
        ...nextMessages,
        {
          role: "assistant" as const,
          content: result.text,
          timestamp: Date.now(),
          sources: result.sources,
        },
      ].slice(-100);
      setMessages(completed);
      await persist(completed);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The request failed.");
    } finally {
      setIsTyping(false);
    }
  };

  const activeConversation = conversations.find((item) => item.id === activeId);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0d0d]" aria-label="Forge conversation">
      <header className="border-b border-white/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Forge workspace</p>
            <p className="mt-1 text-[10px] text-gray-600">Stored privately in this browser</p>
          </div>
          <button type="button" onClick={() => void startConversation()} disabled={!isReady || isTyping}
            className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-40">
            + New
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <select aria-label="Select conversation" value={activeId ?? ""} disabled={!isReady || isTyping}
            onChange={(event) => {
              const selected = conversations.find((item) => item.id === event.target.value);
              if (selected) selectConversation(selected);
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-xs text-gray-200">
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>{conversation.title}</option>
            ))}
          </select>
          <button type="button" onClick={() => void deleteConversation()} disabled={!activeId || isTyping}
            aria-label="Delete current conversation" title="Delete current conversation"
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-red-500/40 hover:text-red-300 disabled:opacity-40">
            Delete
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <p className="truncate text-[10px] text-gray-500">{activeConversation?.title ?? "Loading workspace…"}</p>
        <button type="button" onClick={() => setUseSearch((value) => !value)} aria-pressed={useSearch}
          className={`shrink-0 rounded-lg px-2 py-1 text-[10px] transition-colors ${useSearch ? "bg-blue-500/15 text-blue-300" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          Web grounding {useSearch ? "on" : "off"}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4" aria-live="polite">
        {!isReady && <p className="text-xs text-gray-500" role="status">Opening your local workspace…</p>}
        {messages.map((message, index) => (
          <article key={`${message.timestamp}-${index}`} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl border p-4 text-sm leading-relaxed ${message.role === "user" ? "border-orange-500/30 bg-orange-600 text-white" : "border-white/10 bg-white/5 text-gray-200"}`}>
              {message.content}
              {message.sources?.length ? (
                <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Sources</p>
                  {message.sources.map((source, sourceIndex) => (
                    <a key={`${source.uri}-${sourceIndex}`} href={source.uri} target="_blank" rel="noopener noreferrer"
                      className="block truncate text-xs text-blue-300 hover:underline">{source.title}</a>
                  ))}
                </div>
              ) : null}
            </div>
            <time className="mt-2 text-[10px] text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </time>
          </article>
        ))}
        {isTyping && <p className="text-xs text-gray-500" role="status">Forge is thinking…</p>}
      </div>

      {error && <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200" role="alert">{error}</div>}

      <form className="border-t border-white/10 p-4" onSubmit={(event) => { event.preventDefault(); void handleSend(); }}>
        <label htmlFor="forge-message" className="sr-only">Message Forge</label>
        <div className="flex gap-2">
          <input id="forge-message" value={input} onChange={(event) => setInput(event.target.value)}
            maxLength={6000} placeholder="Ask Forge something…" disabled={!isReady || isTyping}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-orange-500" />
          <button type="submit" disabled={!input.trim() || isTyping || !isReady}
            className="rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40">Send</button>
        </div>
        <p className="mt-2 text-[10px] text-gray-600">Conversations stay in this browser profile; they are not encrypted or synced. Do not enter passwords, API keys, or highly sensitive information.</p>
      </form>
    </section>
  );
};
