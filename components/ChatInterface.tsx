
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const SYSTEM_INSTRUCTION = `You are the Forge AI Reasoning Engine. You help developers build robust architectures. Use Google Search grounding when asked for latest tech info. Be extremely technical.`;

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([
    { role: 'assistant', content: 'Forge Reasoning Node active. How can I help with your project architecture?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const result = await getGeminiResponse(input, SYSTEM_INSTRUCTION, useSearch);
    
    const assistantMsg = { 
      role: 'assistant' as const, 
      content: result.text, 
      timestamp: Date.now(),
      sources: result.sources 
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0d]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Reasoning Agent</span>
          {useSearch && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-bold uppercase">Search Active</span>}
        </div>
        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`p-1 rounded-md transition-all ${useSearch ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600 hover:text-white'}`}
          title="Toggle Google Search Grounding"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white/5 border border-white/10 text-gray-300'
            }`}>
              {msg.content}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Grounded Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((s, i) => s.web && (
                      <a key={i} href={s.web.uri} target="_blank" className="text-[9px] bg-white/5 px-2 py-1 rounded hover:bg-white/10 text-blue-400 truncate max-w-[150px]">
                        {s.web.title || s.web.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-600 mt-2 font-mono uppercase">
              {msg.role} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="max-w-[85%] rounded-2xl p-4 bg-white/5 border border-white/10 text-gray-500 text-sm">
              Forge is synthesizing project context...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0d0d0d]">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={useSearch ? "Search documentation and codebase..." : "Ask Forge about your code..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
