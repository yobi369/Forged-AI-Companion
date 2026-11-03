import React, { useEffect, useRef, useState } from "react";
import { getGeminiResponse } from "../services/geminiService";
import type { ChatMessage } from "../types";

type Message = ChatMessage & { sources?: { uri: string; title: string }[] };

const STORAGE_KEY = "forge.conversation.v1";
const initialMessage: Message = {
  role: "assistant",
  content: "I'm Forge. I can help you reason through a problem, plan work, and explore technical ideas. What are you working on?",
  timestamp: Date.now(),
};

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [initialMessage];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [initialMessage];
    return parsed
      .filter((item): item is Message =>
        item && (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" && typeof item.timestamp === "number",
      )
      .slice(-50);
  } catch {
    return [initialMessage];
  }
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      setError("Browser storage is unavailable. This conversation may not persist after reload.");
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isTyping) return;

    const userMessage: Message = { role: "user", content: prompt, timestamp: Date.now() };
    const nextMessages = [...messages, userMessage].slice(-50);
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsTyping(true);

    try {
      const context = nextMessages.slice(-16).map(({ role, content }) => ({ role, content }));
      const result = await getGeminiResponse(context, useSearch);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.text, timestamp: Date.now(), sources: result.sources },
      ].slice(-50));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The request failed.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0d0d]" aria-label="Forge conversation">
      <header className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Forge assistant</p>
          <p className="mt-1 text-[10px] text-gray-600">Conversation saved in this browser</p>
        </div>
        <button
          type="button"
          onClick={() => setUseSearch((value) => !value)}
          aria-pressed={useSearch}
          className={`rounded-lg px-3 py-2 text-xs transition-colors ${useSearch ? "bg-blue-500/15 text-blue-300" : "bg-white/5 text-gray-400 hover:text-white"}`}
        >
          Web grounding {useSearch ? "on" : "off"}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4" aria-live="polite">
        {messages.map((message, index) => (
          <article key={`${message.timestamp}-${index}`} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl border p-4 text-sm leading-relaxed ${message.role === "user" ? "border-orange-500/30 bg-orange-600 text-white" : "border-white/10 bg-white/5 text-gray-200"}`}>
              {message.content}
              {message.sources?.length ? (
                <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Sources</p>
                  {message.sources.map((source, sourceIndex) => (
                    <a
                      key={`${source.uri}-${sourceIndex}`}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-blue-300 hover:underline"
                    >
                      {source.title}
                    </a>
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

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200" role="alert">
          {error}
        </div>
      )}

      <form
        className="border-t border-white/10 p-4"
        onSubmit={(event) => { event.preventDefault(); void handleSend(); }}
      >
        <label htmlFor="forge-message" className="sr-only">Message Forge</label>
        <div className="flex gap-2">
          <input
            id="forge-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={6000}
            placeholder="Ask Forge something…"
            disabled={isTyping}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-[10px] text-gray-600">Do not enter passwords, API keys, or highly sensitive information.</p>
      </form>
    </section>
  );
};
