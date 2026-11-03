
import React, { useState, useEffect, useRef } from 'react';

export const Terminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    const events = [
      "AST Indexing: components/App.tsx...",
      "Vectorizing chunk 0xFA42...",
      "GPU Heat: 42°C | VRAM: 18.2GB",
      "Semantic Graph updated with 4 new edges",
      "Model check: DeepSeek-V3 online",
      "Tree-sitter: Parsed types.ts successfully",
      "Memory Pressure: Normal",
      "Forge Core Heartbeat: OK"
    ];

    const interval = setInterval(() => {
      addLog(events[Math.floor(Math.random() * events.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-40 border-t border-white/10 bg-[#050505] flex flex-col font-mono text-[10px]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-bold uppercase tracking-tighter">Forge Runtime</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="flex gap-4 text-gray-600">
          <span>MEM: 1.2GB</span>
          <span>OPS: 42/s</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5 scroll-smooth">
        {logs.map((log, i) => (
          <div key={i} className="text-gray-500">
            <span className="text-blue-900 mr-2">$</span>
            <span className={log.includes('updated') ? 'text-green-900' : ''}>{log}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 text-white">
          <span className="text-blue-500">$</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};
